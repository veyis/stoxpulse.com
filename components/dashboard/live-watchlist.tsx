"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Plus } from "lucide-react";
import { SparkLine } from "@/components/stocks/spark-line";
import { SignalBadge, type SignalType } from "@/components/stocks/signal-badge";
import type { StockQuote } from "@/lib/types/stock";
import { tickerToSlug } from "@/data/stocks/sp500";

interface WatchlistStock {
  ticker: string;
  name: string;
  quote: StockQuote | null;
  sparkData: number[];
  signals?: { type: SignalType; label: string }[];
}

interface LiveWatchlistProps {
  stocks: WatchlistStock[];
  className?: string;
}

function formatLargeNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  return `$${num.toLocaleString()}`;
}

export function LiveWatchlist({ stocks, className }: LiveWatchlistProps) {
  return (
    <div className={cn("rounded-xl border border-border/50 bg-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
        <div>
          <h2 className="text-sm font-semibold font-display">Watchlist</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {stocks.length} stocks tracked
          </p>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/20 transition-colors">
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/30 bg-surface-1/50">
              <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Stock
              </th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                Chart
              </th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Price
              </th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Change
              </th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                Mkt Cap
              </th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                Signals
              </th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => {
              const q = stock.quote;
              const change = q?.change ?? 0;
              const isPositive = change > 0;
              const isNegative = change < 0;
              const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

              return (
                <tr
                  key={stock.ticker}
                  className="border-b border-border/30 last:border-0 hover:bg-surface-2/50 transition-colors"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/stocks/${tickerToSlug(stock.ticker)}`}
                      className="block group"
                    >
                      <span className="font-display font-bold text-sm group-hover:text-brand transition-colors">
                        {stock.ticker}
                      </span>
                      <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                        {stock.name}
                      </p>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    <SparkLine
                      data={stock.sparkData}
                      width={72}
                      height={24}
                      positive={isPositive}
                      className="ml-auto"
                    />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold" data-numeric>
                    {q ? `$${q.price.toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right" data-numeric>
                    {q ? (
                      <div
                        className={cn(
                          "inline-flex items-center gap-1 text-xs font-medium tabular-nums",
                          isPositive && "text-positive",
                          isNegative && "text-negative",
                          !isPositive && !isNegative && "text-muted-foreground"
                        )}
                      >
                        <Icon className="h-3 w-3" />
                        {isPositive ? "+" : ""}
                        {q.changePercent.toFixed(2)}%
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-xs text-muted-foreground hidden md:table-cell" data-numeric>
                    {q?.marketCap ? formatLargeNumber(q.marketCap) : "—"}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {stock.signals && stock.signals.length > 0 ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {stock.signals.map((s, i) => (
                          <SignalBadge key={i} type={s.type} />
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
