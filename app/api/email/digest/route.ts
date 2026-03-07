import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getQuote, getEarningsCalendar } from "@/lib/data";
import { DEFAULT_WATCHLIST } from "@/lib/data/dashboard";
import { sendDailyDigest } from "@/lib/email/send";
import { isEmailEnabled } from "@/lib/email/client";
import { scoreToGrade } from "@/lib/pulse-score";
import type { Subscriber } from "../subscribe/route";

const SUBSCRIBERS_FILE = path.join(process.cwd(), "data", "subscribers.json");
const LAST_SENT_FILE = path.join(process.cwd(), "data", "digest-last-sent.json");

const RATE_LIMIT_MS = 60 * 60 * 1000; // 1 hour minimum between sends

async function getSubscribers(): Promise<Subscriber[]> {
  try {
    const data = await fs.readFile(SUBSCRIBERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function getLastSent(): Promise<number> {
  try {
    const data = await fs.readFile(LAST_SENT_FILE, "utf-8");
    const parsed = JSON.parse(data);
    return parsed.timestamp ?? 0;
  } catch {
    return 0;
  }
}

async function setLastSent(): Promise<void> {
  const dir = path.dirname(LAST_SENT_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    LAST_SENT_FILE,
    JSON.stringify({ timestamp: Date.now() }),
  );
}

export async function POST(request: NextRequest) {
  // Verify secret key
  const authHeader = request.headers.get("x-api-secret");
  if (!process.env.EMAIL_API_SECRET || authHeader !== process.env.EMAIL_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isEmailEnabled()) {
    return NextResponse.json(
      { error: "Email not configured. Set RESEND_API_KEY." },
      { status: 503 },
    );
  }

  // Rate limiting
  const lastSent = await getLastSent();
  if (Date.now() - lastSent < RATE_LIMIT_MS) {
    const nextAllowed = new Date(lastSent + RATE_LIMIT_MS).toISOString();
    return NextResponse.json(
      { error: "Rate limited. Next send allowed after " + nextAllowed },
      { status: 429 },
    );
  }

  // Get subscribers who opted into daily digest
  const allSubscribers = await getSubscribers();
  const dailySubscribers = allSubscribers.filter((s) => s.preferences.daily);

  if (dailySubscribers.length === 0) {
    return NextResponse.json({ message: "No daily subscribers", sent: 0 });
  }

  try {
    // Fetch market data in parallel
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const fromDate = today.toISOString().split("T")[0];
    const toDate = nextWeek.toISOString().split("T")[0];

    const watchlistQuotes = await Promise.all(
      DEFAULT_WATCHLIST.map(async (ticker) => {
        const quote = await getQuote(ticker).catch(() => null);
        return { ticker, quote };
      }),
    );

    const earningsCalendar = await getEarningsCalendar(fromDate, toDate).catch(
      () => [],
    );

    // Build watchlist data with quick grade from quote metrics
    // Full Pulse Score requires StockPageData; here we derive a quick grade
    // from change%, volume ratio, and 52W position as a lightweight proxy.
    const watchlistData = watchlistQuotes
      .filter((w) => w.quote !== null)
      .map((w) => {
        const q = w.quote!;
        const volRatio = q.avgVolume ? (q.volume ?? 0) / q.avgVolume : 1;
        const rangePos =
          q.high52w && q.low52w && q.high52w > q.low52w
            ? (q.price - q.low52w) / (q.high52w - q.low52w)
            : 0.5;
        // Quick composite: change momentum + volume interest + trend position
        const quickScore = Math.round(
          Math.min(100, Math.max(0,
            50 + q.changePercent * 3 + (volRatio - 1) * 5 + (rangePos - 0.5) * 40
          ))
        );
        return {
          ticker: w.ticker,
          price: q.price,
          changePercent: q.changePercent,
          grade: scoreToGrade(quickScore),
        };
      });

    // Build earnings data
    const upcomingEarnings = earningsCalendar.slice(0, 8).map((e) => ({
      ticker: e.ticker,
      date: e.date,
      time:
        e.hour === "bmo"
          ? "Before Open"
          : e.hour === "amc"
            ? "After Close"
            : "TBD",
    }));

    // Generate AI bullets via internal API
    let bullets: string[] = [
      "Markets are moving — check your watchlist for the latest updates.",
      "Earnings season continues with several major reports this week.",
      "Stay informed and review your portfolio positioning.",
    ];

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://stoxpulse.com";
      const digestRes = await fetch(`${baseUrl}/api/ai/daily-digest`);
      if (digestRes.ok) {
        const digestData = await digestRes.json();
        if (digestData.bullets?.length >= 3) {
          bullets = digestData.bullets.slice(0, 3);
        }
      }
    } catch {
      // Use default bullets
    }

    // Send to all daily subscribers
    let sent = 0;
    const errors: string[] = [];

    for (const subscriber of dailySubscribers) {
      const unsubscribeUrl = `https://stoxpulse.com/api/email/unsubscribe?email=${encodeURIComponent(subscriber.email)}&token=${encodeURIComponent(subscriber.token)}`;

      try {
        await sendDailyDigest(subscriber.email, {
          bullets,
          watchlist: watchlistData,
          upcomingEarnings,
          unsubscribeUrl,
        });
        sent++;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown error";
        errors.push(`${subscriber.email}: ${message}`);
      }
    }

    await setLastSent();

    return NextResponse.json({
      message: "Digest sent",
      sent,
      total: dailySubscribers.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("[API] Digest send error:", err);
    return NextResponse.json(
      { error: "Failed to send digest" },
      { status: 500 },
    );
  }
}
