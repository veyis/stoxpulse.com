import { NextResponse } from "next/server";
import {
  getQuote,
  getInsiderTrades,
  getUpgradesDowngrades,
  getPriceTargets,
  getEarningsSurprises,
} from "@/lib/data";
import { getStockByTicker } from "@/data/stocks/sp500";
import type { SignalType } from "@/components/stocks/signal-badge";

interface LiveSignal {
  type: SignalType;
  ticker: string;
  company: string;
  title: string;
  detail?: string;
  timestamp: string;
  severity?: "high" | "medium" | "low";
  sentiment?: "bullish" | "bearish" | "neutral";
}

// Top 20 most-watched stocks for signal scanning
const SIGNAL_TICKERS = [
  "AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "JPM",
  "V", "UNH", "MA", "HD", "PG", "JNJ", "COST", "ABBV", "CRM", "NFLX",
  "AMD", "AVGO",
];

export async function GET() {
  try {
    const signals: LiveSignal[] = [];

    // Fetch data in parallel for all tickers
    const [quotesData, insiderData, upgradesData, ptData, surprisesData] =
      await Promise.all([
        // Quotes for momentum signals
        Promise.all(
          SIGNAL_TICKERS.map(async (t) => ({
            ticker: t,
            quote: await getQuote(t).catch(() => null),
          }))
        ),
        // Insider trades (top 8 tickers to limit API calls)
        Promise.all(
          SIGNAL_TICKERS.slice(0, 8).map(async (t) => ({
            ticker: t,
            trades: await getInsiderTrades(t, 3).catch(() => []),
          }))
        ),
        // Upgrades/downgrades (top 10)
        Promise.all(
          SIGNAL_TICKERS.slice(0, 10).map(async (t) => ({
            ticker: t,
            changes: await getUpgradesDowngrades(t).catch(() => []),
          }))
        ),
        // Price targets (top 10)
        Promise.all(
          SIGNAL_TICKERS.slice(0, 10).map(async (t) => ({
            ticker: t,
            targets: await getPriceTargets(t).catch(() => []),
          }))
        ),
        // Earnings surprises (top 10)
        Promise.all(
          SIGNAL_TICKERS.slice(0, 10).map(async (t) => ({
            ticker: t,
            surprises: await getEarningsSurprises(t).catch(() => []),
          }))
        ),
      ]);

    const now = new Date();

    // Generate momentum signals from quotes
    for (const { ticker, quote } of quotesData) {
      if (!quote) continue;
      const stock = getStockByTicker(ticker);
      const name = stock?.name ?? ticker;
      const pct = quote.changePercent;

      if (Math.abs(pct) >= 3) {
        signals.push({
          type: "momentum-signal",
          ticker,
          company: name,
          title: `${ticker} ${pct > 0 ? "surges" : "drops"} ${Math.abs(pct).toFixed(1)}% today`,
          detail: `Trading at $${quote.price.toFixed(2)}, ${pct > 0 ? "up" : "down"} $${Math.abs(quote.change).toFixed(2)} on the session.`,
          timestamp: "Today",
          severity: Math.abs(pct) >= 5 ? "high" : "medium",
          sentiment: pct > 0 ? "bullish" : "bearish",
        });
      }
    }

    // Generate insider signals
    for (const { ticker, trades } of insiderData) {
      const stock = getStockByTicker(ticker);
      const name = stock?.name ?? ticker;
      const recent = trades.filter((t) => {
        const d = new Date(t.date);
        return now.getTime() - d.getTime() < 14 * 86400000; // last 14 days
      });

      for (const trade of recent.slice(0, 1)) {
        const isBuy = trade.type === "Buy";
        const value = trade.totalValue || Math.abs(trade.shares * trade.pricePerShare);
        if (value < 50000) continue;

        signals.push({
          type: isBuy ? "insider-buy" : "insider-sell",
          ticker,
          company: name,
          title: `${trade.name || "Insider"} ${isBuy ? "bought" : "sold"} $${(value / 1000).toFixed(0)}K in ${ticker}`,
          detail: `${trade.shares.toLocaleString()} shares at $${trade.pricePerShare.toFixed(2)} per share.`,
          timestamp: trade.date,
          severity: value >= 500000 ? "high" : "medium",
          sentiment: isBuy ? "bullish" : "bearish",
        });
      }
    }

    // Generate upgrade/downgrade signals
    for (const { ticker, changes } of upgradesData) {
      const stock = getStockByTicker(ticker);
      const name = stock?.name ?? ticker;
      const recent = changes.filter((c) => {
        const d = new Date(c.date);
        return now.getTime() - d.getTime() < 14 * 86400000;
      });

      for (const change of recent.slice(0, 1)) {
        const isUpgrade =
          change.action === "upgrade" ||
          change.action === "initiated" ||
          change.action === "reiterated";

        signals.push({
          type: isUpgrade ? "analyst-upgrade" : "analyst-downgrade",
          ticker,
          company: name,
          title: `${change.analystCompany}: ${change.action} ${ticker} to ${change.ratingTo}`,
          detail: change.ratingFrom
            ? `Changed from ${change.ratingFrom} to ${change.ratingTo}.`
            : `Rated ${change.ratingTo}.`,
          timestamp: change.date,
          severity: "medium",
          sentiment: isUpgrade ? "bullish" : "bearish",
        });
      }
    }

    // Generate price target signals
    for (const { ticker, targets } of ptData) {
      const stock = getStockByTicker(ticker);
      const name = stock?.name ?? ticker;
      const quote = quotesData.find((q) => q.ticker === ticker)?.quote;
      const recent = targets.filter((t) => {
        const d = new Date(t.date);
        return now.getTime() - d.getTime() < 14 * 86400000;
      });

      for (const pt of recent.slice(0, 1)) {
        if (!quote) continue;
        const impliedUpside = ((pt.targetPrice - quote.price) / quote.price) * 100;

        signals.push({
          type: impliedUpside > 0 ? "price-target-up" : "price-target-down",
          ticker,
          company: name,
          title: `${pt.analystCompany}: PT $${pt.targetPrice.toFixed(0)} (${impliedUpside > 0 ? "+" : ""}${impliedUpside.toFixed(0)}%)`,
          detail: `Analyst ${pt.analystName} set price target at $${pt.targetPrice.toFixed(2)}.`,
          timestamp: pt.date,
          severity: Math.abs(impliedUpside) >= 20 ? "high" : "medium",
          sentiment: impliedUpside > 0 ? "bullish" : "bearish",
        });
      }
    }

    // Generate earnings surprise signals
    for (const { ticker, surprises } of surprisesData) {
      const stock = getStockByTicker(ticker);
      const name = stock?.name ?? ticker;

      if (surprises.length > 0) {
        const latest = surprises[0];
        const daysSince = (now.getTime() - new Date(latest.date).getTime()) / 86400000;
        if (daysSince > 30) continue;

        const epsActual = latest.epsActual ?? 0;
        const epsEstimate = latest.epsEstimate ?? 0;
        const beat = epsActual > epsEstimate;
        const surprisePct = latest.epsSurprisePercent ?? (
          epsEstimate !== 0
            ? ((epsActual - epsEstimate) / Math.abs(epsEstimate)) * 100
            : 0
        );

        signals.push({
          type: beat ? "earnings-beat" : "earnings-miss",
          ticker,
          company: name,
          title: `${ticker} ${beat ? "beats" : "misses"} EPS by ${Math.abs(surprisePct).toFixed(0)}%`,
          detail: `Reported $${epsActual.toFixed(2)} vs estimate of $${epsEstimate.toFixed(2)}.`,
          timestamp: latest.date,
          severity: Math.abs(surprisePct) >= 15 ? "high" : "medium",
          sentiment: beat ? "bullish" : "bearish",
        });
      }
    }

    // Sort by timestamp (most recent first), then by severity
    signals.sort((a, b) => {
      if (a.severity === "high" && b.severity !== "high") return -1;
      if (b.severity === "high" && a.severity !== "high") return 1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return NextResponse.json(
      { signals: signals.slice(0, 25), generatedAt: now.toISOString() },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("[API] Live signals error:", error);
    return NextResponse.json(
      { error: "Failed to generate signals" },
      { status: 500 }
    );
  }
}
