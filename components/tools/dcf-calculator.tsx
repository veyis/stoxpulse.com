"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, TrendingUp, TrendingDown } from "lucide-react";

interface DCFResult {
  ticker: string;
  currentPrice: number;
  intrinsicValue: number;
  upside: number; // percentage
  fcfPerShare: number;
  sharesOutstanding: number;
  projectedFCF: number[];
  terminalValue: number;
  enterpriseValue: number;
  sensitivity: { growthRate: number; values: { discountRate: number; value: number }[] }[];
}

export function DCFCalculator() {
  const [ticker, setTicker] = useState("");
  const [growthRate, setGrowthRate] = useState("10");
  const [discountRate, setDiscountRate] = useState("10");
  const [terminalGrowth, setTerminalGrowth] = useState("3");
  const [projectionYears, setProjectionYears] = useState("5");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DCFResult | null>(null);
  const [error, setError] = useState("");

  const calculate = async () => {
    if (!ticker.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const params = new URLSearchParams({
        ticker: ticker.toUpperCase(),
        growthRate,
        discountRate,
        terminalGrowth,
        years: projectionYears,
      });
      const res = await fetch(`/api/dcf-calc?${params}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to calculate");
      }
      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isUndervalued = result && result.upside > 0;

  return (
    <div>
      {/* Input Form */}
      <div className="rounded-2xl border border-border bg-surface-1 p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Stock Ticker
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="AAPL"
                className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
                onKeyDown={(e) => e.key === "Enter" && calculate()}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
              FCF Growth Rate (%)
            </label>
            <input
              type="number"
              value={growthRate}
              onChange={(e) => setGrowthRate(e.target.value)}
              min="0" max="50" step="1"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-brand/50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Discount Rate (%)
            </label>
            <input
              type="number"
              value={discountRate}
              onChange={(e) => setDiscountRate(e.target.value)}
              min="1" max="30" step="0.5"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-brand/50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Terminal Growth (%)
            </label>
            <input
              type="number"
              value={terminalGrowth}
              onChange={(e) => setTerminalGrowth(e.target.value)}
              min="0" max="5" step="0.5"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-brand/50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Projection Years
            </label>
            <input
              type="number"
              value={projectionYears}
              onChange={(e) => setProjectionYears(e.target.value)}
              min="3" max="10" step="1"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-brand/50"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={calculate}
            disabled={loading || !ticker.trim()}
            className="rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Calculating..." : "Calculate Fair Value"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-negative/20 bg-negative/10 p-4 text-sm text-negative">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-6 space-y-6">
          {/* Valuation Summary */}
          <div className={cn(
            "rounded-2xl border p-6 text-center",
            isUndervalued
              ? "border-positive/30 bg-positive/5"
              : "border-negative/30 bg-negative/5"
          )}>
            <p className="text-sm text-muted-foreground mb-1">Intrinsic Value per Share</p>
            <p className="text-4xl font-bold font-display tabular-nums" data-numeric>
              ${result.intrinsicValue.toFixed(2)}
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              {isUndervalued ? (
                <TrendingUp className="size-5 text-positive" />
              ) : (
                <TrendingDown className="size-5 text-negative" />
              )}
              <span className={cn(
                "text-lg font-semibold tabular-nums",
                isUndervalued ? "text-positive" : "text-negative"
              )} data-numeric>
                {result.upside >= 0 ? "+" : ""}{result.upside.toFixed(1)}%
                {isUndervalued ? " Undervalued" : " Overvalued"}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground tabular-nums" data-numeric>
              Current Price: ${result.currentPrice.toFixed(2)}
            </p>
          </div>

          {/* Projected FCF */}
          <div className="rounded-2xl border border-border bg-surface-1 overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold font-display">Projected Free Cash Flow</h3>
            </div>
            <div className="p-5 flex items-end gap-2 justify-center h-40">
              {result.projectedFCF.map((fcf, i) => {
                const max = Math.max(...result.projectedFCF);
                const height = max > 0 ? (fcf / max) * 100 : 10;
                return (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1 max-w-16">
                    <span className="text-[10px] tabular-nums text-muted-foreground" data-numeric>
                      ${(fcf / 1e9).toFixed(1)}B
                    </span>
                    <div
                      className="w-full rounded-t bg-brand/60"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    />
                    <span className="text-[10px] text-muted-foreground">Y{i + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sensitivity Table */}
          {result.sensitivity.length > 0 && (
            <div className="rounded-2xl border border-border bg-surface-1 overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold font-display">Sensitivity Analysis</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Fair value at different growth and discount rate assumptions
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/30 bg-surface-2/50">
                      <th className="px-4 py-2.5 text-xs text-muted-foreground text-left">
                        Growth \ Disc.
                      </th>
                      {result.sensitivity[0]?.values.map((v) => (
                        <th key={v.discountRate} className="px-3 py-2.5 text-xs text-muted-foreground text-right tabular-nums" data-numeric>
                          {v.discountRate}%
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.sensitivity.map((row) => (
                      <tr key={row.growthRate} className="border-b border-border/20 last:border-0">
                        <td className="px-4 py-2 text-xs font-medium tabular-nums" data-numeric>{row.growthRate}%</td>
                        {row.values.map((v) => {
                          const isUp = v.value > result.currentPrice;
                          return (
                            <td
                              key={v.discountRate}
                              className={cn(
                                "px-3 py-2 text-right text-xs tabular-nums font-medium",
                                isUp ? "text-positive" : "text-negative"
                              )}
                              data-numeric
                            >
                              ${v.value.toFixed(0)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
