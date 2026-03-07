import { NextResponse } from "next/server";
import { isAIEnabled } from "@/lib/ai/gemini";

export async function GET() {
  if (!isAIEnabled()) {
    return NextResponse.json(
      { error: "AI not configured" },
      { status: 503 }
    );
  }

  try {
    // Import dynamically to avoid loading Gemini if not needed
    const { GoogleGenAI } = await import("@google/genai");
    const { getQuote, getNews, getEarningsCalendar } = await import("@/lib/data");
    const { DEFAULT_WATCHLIST } = await import("@/lib/data/dashboard");

    // Fetch market context in parallel
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const fromDate = today.toISOString().split("T")[0];
    const toDate = nextWeek.toISOString().split("T")[0];

    const [spyQuote, qqqQuote, topNews, earnings] = await Promise.all([
      getQuote("SPY").catch(() => null),
      getQuote("QQQ").catch(() => null),
      getNews(DEFAULT_WATCHLIST[0], 5).catch(() => []),
      getEarningsCalendar(fromDate, toDate).catch(() => []),
    ]);

    // Build context
    const context = [
      `Date: ${fromDate}`,
      spyQuote
        ? `S&P 500 (SPY): $${spyQuote.price.toFixed(2)} (${spyQuote.changePercent >= 0 ? "+" : ""}${spyQuote.changePercent.toFixed(2)}%)`
        : "",
      qqqQuote
        ? `NASDAQ 100 (QQQ): $${qqqQuote.price.toFixed(2)} (${qqqQuote.changePercent >= 0 ? "+" : ""}${qqqQuote.changePercent.toFixed(2)}%)`
        : "",
      topNews.length > 0
        ? `Top headlines:\n${topNews.slice(0, 3).map((n) => `- ${n.headline}`).join("\n")}`
        : "",
      earnings.length > 0
        ? `Upcoming earnings this week: ${earnings.slice(0, 5).map((e) => e.ticker).join(", ")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a senior market analyst writing a daily digest for retail investors. Based on this market data, write exactly 3 bullet points about what matters today. Each bullet should be 1-2 sentences, actionable, and specific. No generic advice. Focus on what's actually moving and why.

${context}

Return ONLY a JSON object with this format:
{"bullets": ["bullet 1", "bullet 2", "bullet 3"]}`,
      config: {
        temperature: 0.3,
        maxOutputTokens: 500,
        responseMimeType: "application/json",
      },
    });

    const text = result.text ?? "";
    const parsed = JSON.parse(text);

    return NextResponse.json(
      {
        bullets: parsed.bullets.slice(0, 3),
        generatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
        },
      }
    );
  } catch (error) {
    console.error("[API] Daily digest error:", error);
    return NextResponse.json(
      { error: "Failed to generate digest" },
      { status: 500 }
    );
  }
}
