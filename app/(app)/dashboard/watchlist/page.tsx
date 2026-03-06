import { getDashboardData } from "@/lib/data/dashboard";
import { LiveWatchlist } from "@/components/dashboard/live-watchlist";
import { connection } from "next/server";
import type { SignalType } from "@/components/stocks/signal-badge";

export const metadata = {
  title: "Watchlist — StoxPulse",
};

export default async function WatchlistPage() {
  await connection();
  const data = await getDashboardData();

  // Build signal map from AI analyses + rule-based
  const signalMap = new Map<string, Array<{ type: SignalType; label: string }>>();

  for (const analysis of data.aiAnalyses) {
    const existing = signalMap.get(analysis.ticker) ?? [];
    for (const sig of analysis.signals) {
      existing.push({ type: sig.type, label: sig.title });
    }
    signalMap.set(analysis.ticker, existing);
  }

  // Add filing signals
  for (const { ticker, filings } of data.recentFilings) {
    const important = filings.filter((f) => ["10-K", "10-Q", "8-K"].includes(f.type));
    if (important.length > 0) {
      const existing = signalMap.get(ticker) ?? [];
      existing.push({ type: "new-filing", label: `${important[0].type} filed` });
      signalMap.set(ticker, existing);
    }
  }

  // Add insider trade signals
  for (const { ticker, trades } of data.recentInsiderTrades) {
    for (const trade of trades.slice(0, 1)) {
      if (trade.totalValue < 50000) continue;
      const existing = signalMap.get(ticker) ?? [];
      existing.push({
        type: trade.type === "Buy" ? "insider-buy" : "insider-sell",
        label: `${trade.name} ${trade.type === "Buy" ? "bought" : "sold"} shares`,
      });
      signalMap.set(ticker, existing);
    }
  }

  const stocks = data.watchlist.map((w) => ({
    ticker: w.ticker,
    name: w.name,
    quote: w.quote,
    sparkData: w.sparkData,
    signals: signalMap.get(w.ticker) ?? [],
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight">Watchlist</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {stocks.length} stocks tracked with real-time prices and AI signals.
          </p>
        </div>
      </div>

      <LiveWatchlist stocks={stocks} />
    </div>
  );
}
