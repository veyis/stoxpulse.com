import { getDashboardData } from "@/lib/data/dashboard";
import { MarketPulse } from "@/components/dashboard/market-pulse";
import { LiveWatchlist } from "@/components/dashboard/live-watchlist";
import { SignalFeed, type SignalFeedItem } from "@/components/dashboard/signal-feed";
import { EarningsCalendarCard } from "@/components/dashboard/earnings-calendar-card";
import { NewsFeedCard } from "@/components/dashboard/news-feed-card";
import type { SignalType } from "@/components/stocks/signal-badge";

import { connection } from "next/server";

export const metadata = {
  title: "Dashboard — StoxPulse",
};

// Generate signals from real data — price movers, insider trades, filings, news, earnings
function generateSignals(data: Awaited<ReturnType<typeof getDashboardData>>): SignalFeedItem[] {
  const signals: SignalFeedItem[] = [];
  const stockNames = new Map(data.watchlist.map((w) => [w.ticker, w.name]));
  const getName = (ticker: string) => stockNames.get(ticker) ?? ticker;

  // 1. Price movers — any stock moving >1% gets a signal
  const sorted = [...data.watchlist]
    .filter((w) => w.quote)
    .sort((a, b) => Math.abs(b.quote!.changePercent) - Math.abs(a.quote!.changePercent));

  for (const stock of sorted.slice(0, 3)) {
    const q = stock.quote!;
    const pct = q.changePercent;
    if (Math.abs(pct) < 0.5) continue;

    if (pct > 0) {
      signals.push({
        type: "price-target-up",
        ticker: stock.ticker,
        company: stock.name,
        title: `${stock.ticker} up ${pct.toFixed(1)}% today`,
        detail: `Trading at $${q.price.toFixed(2)} with ${(q.volume / 1e6).toFixed(1)}M volume`,
        timestamp: "Today",
      });
    } else {
      signals.push({
        type: "price-target-down",
        ticker: stock.ticker,
        company: stock.name,
        title: `${stock.ticker} down ${Math.abs(pct).toFixed(1)}% today`,
        detail: `Trading at $${q.price.toFixed(2)} with ${(q.volume / 1e6).toFixed(1)}M volume`,
        timestamp: "Today",
      });
    }
  }

  // 2. Insider trades — buys and large sales
  for (const { ticker, trades } of data.recentInsiderTrades) {
    for (const trade of trades.slice(0, 2)) {
      if (trade.totalValue < 50000) continue;
      const value =
        trade.totalValue >= 1e6
          ? `$${(trade.totalValue / 1e6).toFixed(1)}M`
          : `$${(trade.totalValue / 1e3).toFixed(0)}K`;

      signals.push({
        type: trade.type === "Buy" ? "insider-buy" : "insider-sell",
        ticker,
        company: getName(ticker),
        title: `${trade.name} ${trade.type === "Buy" ? "bought" : "sold"} ${value} in shares`,
        detail: `${trade.title} — ${trade.shares.toLocaleString()} shares at $${trade.pricePerShare.toFixed(2)}${!trade.isRoutine ? " (non-routine)" : ""}`,
        timestamp: trade.date,
      });
    }
  }

  // 3. Recent SEC filings
  for (const { ticker, filings } of data.recentFilings) {
    const important = filings.filter((f) =>
      ["10-K", "10-Q", "8-K"].includes(f.type)
    );
    for (const filing of important.slice(0, 1)) {
      signals.push({
        type: "new-filing",
        ticker,
        company: getName(ticker),
        title: `${filing.type} filed — ${filing.description.slice(0, 80)}`,
        detail: `Filed ${filing.date}`,
        timestamp: filing.date,
      });
    }
  }

  // 4. AI-generated signals (from Gemini)
  for (const analysis of data.aiAnalyses) {
    for (const sig of analysis.signals) {
      signals.push({
        type: sig.type,
        ticker: analysis.ticker,
        company: getName(analysis.ticker),
        title: sig.title,
        detail: sig.detail,
        timestamp: "AI",
        severity: sig.severity,
        sentiment: sig.sentiment,
        isAI: true,
      });
    }
  }

  // 5. Top news as insights (fallback when no AI)
  if (data.aiAnalyses.length === 0) {
    for (const item of data.news.slice(0, 2)) {
      const ticker = item.relatedTickers[0] ?? "";
      if (!ticker) continue;
      signals.push({
        type: "ai-insight",
        ticker,
        company: getName(ticker),
        title: item.headline,
        detail: item.summary?.slice(0, 120),
        timestamp: "Recent",
      });
    }
  }

  // 6. Upcoming earnings for watchlist stocks
  const watchlistSet = new Set(data.watchlist.map((w) => w.ticker));
  for (const entry of data.earningsCalendar.slice(0, 10)) {
    if (!watchlistSet.has(entry.ticker)) continue;
    signals.push({
      type: "earnings-beat", // using as "upcoming" indicator
      ticker: entry.ticker,
      company: getName(entry.ticker),
      title: `Earnings report scheduled ${entry.date}`,
      detail: entry.epsEstimate
        ? `Consensus EPS estimate: $${entry.epsEstimate.toFixed(2)}`
        : "EPS estimate not yet available",
      timestamp: entry.date,
    });
  }

  // Sort: AI high-severity first, then by type priority
  const typePriority: Record<string, number> = {
    "insider-buy": 1,
    "insider-sell": 2,
    "price-target-up": 3,
    "price-target-down": 3,
    "earnings-beat": 4,
    "earnings-miss": 4,
    "new-filing": 5,
    "ai-insight": 6,
  };
  const severityBoost: Record<string, number> = { high: -10, medium: -5, low: 0 };

  signals.sort((a, b) => {
    const aScore = (typePriority[a.type] ?? 9) + (a.isAI ? (severityBoost[a.severity ?? "low"] ?? 0) : 0);
    const bScore = (typePriority[b.type] ?? 9) + (b.isAI ? (severityBoost[b.severity ?? "low"] ?? 0) : 0);
    return aScore - bScore;
  });

  return signals.slice(0, 10);
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  await connection(); // opt into dynamic rendering for real-time data
  const data = await getDashboardData();
  const signals = generateSignals(data);

  // Map watchlist data for the component
  const watchlistStocks = data.watchlist.map((w) => ({
    ticker: w.ticker,
    name: w.name,
    quote: w.quote,
    sparkData: w.sparkData,
    signals: signals
      .filter((s) => s.ticker === w.ticker)
      .map((s) => ({ type: s.type, label: s.title })),
  }));

  return (
    <div className="space-y-6">
      {/* Greeting header */}
      <div>
        <h1 className="text-xl font-bold font-display tracking-tight">
          {getGreeting()}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your watchlist today.
        </p>
      </div>

      {/* Row 1: Market Pulse — full width */}
      <MarketPulse indices={data.indices} />

      {/* Row 2: Bento grid — Watchlist (8-col) + Signals (4-col) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Watchlist — takes 8 columns */}
        <div className="xl:col-span-8">
          <LiveWatchlist stocks={watchlistStocks} />
        </div>

        {/* Signal Feed — takes 4 columns */}
        <div className="xl:col-span-4">
          <SignalFeed signals={signals} />
        </div>
      </div>

      {/* Row 3: News (8-col) + Earnings Calendar (4-col) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* News — takes 8 columns */}
        <div className="xl:col-span-8">
          <NewsFeedCard news={data.news} />
        </div>

        {/* Earnings Calendar — takes 4 columns */}
        <div className="xl:col-span-4">
          <EarningsCalendarCard entries={data.earningsCalendar} />
        </div>
      </div>
    </div>
  );
}
