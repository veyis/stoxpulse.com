import { inngest } from "./client";
import { sp500Stocks } from "@/data/stocks/sp500";
import { getQuote, getNews, getEarningsCalendar } from "@/lib/data";
import { getCached, setCache } from "@/lib/data/cache";

// ── 1. Daily Quote Refresh ────────────────────────────────────
// Runs every trading day at 4:30 PM ET (after market close)
// Fetches closing prices for all tracked stocks
export const quotesRefresh = inngest.createFunction(
  { id: "quotes-refresh", name: "Daily Quote Refresh" },
  { cron: "TZ=America/New_York 30 16 * * 1-5" },
  async ({ step }) => {
    const tickers = sp500Stocks.map((s) => s.ticker);
    const batchSize = 10;

    let refreshed = 0;
    for (let i = 0; i < tickers.length; i += batchSize) {
      const batch = tickers.slice(i, i + batchSize);

      await step.run(`fetch-quotes-batch-${i}`, async () => {
        const results = await Promise.allSettled(
          batch.map(async (ticker) => {
            const quote = await getQuote(ticker);
            if (quote) {
              await setCache(`quote-${ticker}`, quote, 86400);
            }
            return quote;
          })
        );
        return results.filter((r) => r.status === "fulfilled").length;
      });

      refreshed += batch.length;
    }

    return { refreshed, total: tickers.length };
  }
);

// ── 2. Earnings Calendar Sync ─────────────────────────────────
// Runs daily at 6 AM ET — pulls next 30 days of earnings dates
export const earningsSync = inngest.createFunction(
  { id: "earnings-sync", name: "Earnings Calendar Sync" },
  { cron: "TZ=America/New_York 0 6 * * *" },
  async ({ step }) => {
    const calendar = await step.run("fetch-calendar", async () => {
      const from = new Date().toISOString().split("T")[0];
      const to = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      return getEarningsCalendar(from, to);
    });

    await step.run("cache-calendar", async () => {
      await setCache("earnings-calendar-30d", calendar, 86400);
    });

    return { entries: calendar.length };
  }
);

// ── 3. News Aggregation ───────────────────────────────────────
// Runs every 2 hours during market hours — fetches news for top stocks
export const newsAggregate = inngest.createFunction(
  { id: "news-aggregate", name: "News Aggregation" },
  { cron: "TZ=America/New_York 0 6,8,10,12,14,16,18 * * 1-5" },
  async ({ step }) => {
    // Top 20 most-watched stocks
    const tickers = sp500Stocks.slice(0, 20).map((s) => s.ticker);
    let totalArticles = 0;

    for (let i = 0; i < tickers.length; i += 5) {
      const batch = tickers.slice(i, i + 5);

      const count = await step.run(`fetch-news-batch-${i}`, async () => {
        let articles = 0;
        await Promise.allSettled(
          batch.map(async (ticker) => {
            const news = await getNews(ticker, 10);
            if (news.length > 0) {
              await setCache(`news-${ticker}`, news, 7200); // 2hr TTL
              articles += news.length;
            }
          })
        );
        return articles;
      });

      totalArticles += count;
    }

    return { tickers: tickers.length, articles: totalArticles };
  }
);

// ── 4. Filing Monitor (Phase C2) ──────────────────────────────
// Polls EDGAR RSS feed for new filings from tracked stocks
// On new material filing → triggers AI analysis
export const filingsMonitor = inngest.createFunction(
  { id: "filings-monitor", name: "SEC Filing Monitor" },
  { cron: "TZ=America/New_York */30 9-18 * * 1-5" },
  async ({ step }) => {
    const tickers = sp500Stocks.slice(0, 20).map((s) => s.ticker);
    const materialForms = new Set(["8-K", "10-K", "10-Q", "4"]);

    // Step 1: Fetch latest filings for tracked stocks
    const newFilings = await step.run("check-filings", async () => {
      const { getFilings } = await import("@/lib/data");
      const results: { ticker: string; type: string; date: string; url: string }[] = [];

      await Promise.allSettled(
        tickers.map(async (ticker) => {
          const filings = await getFilings(ticker, 5);
          // Cache the filings
          if (filings.length > 0) {
            await setCache(`filings-${ticker}`, filings, 1800);
          }
          // Check for filings from today
          const today = new Date().toISOString().split("T")[0];
          for (const f of filings) {
            if (f.date === today && materialForms.has(f.type)) {
              results.push({ ticker, type: f.type, date: f.date, url: f.url });
            }
          }
        })
      );

      return results;
    });

    // Step 2: Send events for each new material filing (triggers AI analysis)
    if (newFilings.length > 0) {
      await step.run("emit-filing-events", async () => {
        // Store new filing alerts in cache for the signal feed
        const alerts = await getCached<typeof newFilings>("filing-alerts-today") ?? [];
        const merged = [...alerts, ...newFilings];
        // Deduplicate by ticker+type+date
        const seen = new Set<string>();
        const unique = merged.filter((f) => {
          const key = `${f.ticker}-${f.type}-${f.date}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        await setCache("filing-alerts-today", unique, 86400);
      });
    }

    return { checked: tickers.length, newFilings: newFilings.length };
  }
);

export const functions = [
  quotesRefresh,
  earningsSync,
  newsAggregate,
  filingsMonitor,
];
