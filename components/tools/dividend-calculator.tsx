"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, TrendingUp, DollarSign, Percent } from "lucide-react";

interface DividendResult {
  ticker: string;
  price: number;
  dividendYield: number;
  annualDividend: number;
  sharesOwned: number;
  annualIncome: number;
  monthlyIncome: number;
  projections: {
    year: number;
    shares: number;
    annualIncome: number;
    totalValue: number;
    totalDividends: number;
  }[];
}

export function DividendCalculator() {
  const [ticker, setTicker] = useState("");
  const [investment, setInvestment] = useState("10000");
  const [years, setYears] = useState("10");
  const [growthRate, setGrowthRate] = useState("5");
  const [drip, setDrip] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DividendResult | null>(null);
  const [error, setError] = useState("");

  const calculate = async () => {
    if (!ticker.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(
        `/api/dividend-calc?ticker=${encodeURIComponent(ticker.toUpperCase())}&investment=${investment}&years=${years}&growthRate=${growthRate}&drip=${drip}`
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to calculate");
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Input Form */}
      <div className="rounded-2xl border border-border bg-surface-1 p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
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
              Investment Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="number"
                value={investment}
                onChange={(e) => setInvestment(e.target.value)}
                className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-brand/50"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Time Horizon (years)
            </label>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              min="1"
              max="30"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-brand/50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Dividend Growth Rate
            </label>
            <div className="relative">
              <Percent className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="number"
                value={growthRate}
                onChange={(e) => setGrowthRate(e.target.value)}
                min="0"
                max="30"
                step="0.5"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-brand/50"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={drip}
              onChange={(e) => setDrip(e.target.checked)}
              className="rounded border-border accent-brand"
            />
            Reinvest dividends (DRIP)
          </label>
          <button
            onClick={calculate}
            disabled={loading || !ticker.trim()}
            className="rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Calculating..." : "Calculate"}
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
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard
              label="Annual Income"
              value={`$${result.annualIncome.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
              icon={<DollarSign className="size-4 text-brand" />}
            />
            <SummaryCard
              label="Monthly Income"
              value={`$${result.monthlyIncome.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
              icon={<DollarSign className="size-4 text-positive" />}
            />
            <SummaryCard
              label="Dividend Yield"
              value={`${result.dividendYield.toFixed(2)}%`}
              icon={<Percent className="size-4 text-warning" />}
            />
            <SummaryCard
              label="Shares Owned"
              value={result.sharesOwned.toFixed(1)}
              icon={<TrendingUp className="size-4 text-info" />}
            />
          </div>

          {/* Projection Table */}
          <div className="rounded-2xl border border-border bg-surface-1 overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold font-display">
                {Number(years)}-Year Projection
                {drip ? " (with DRIP)" : " (cash dividends)"}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/30 bg-surface-2/50">
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground uppercase">Year</th>
                    <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase">Shares</th>
                    <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase">Annual Income</th>
                    <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase">Total Dividends</th>
                    <th className="text-right px-5 py-2.5 text-xs font-medium text-muted-foreground uppercase">Portfolio Value</th>
                  </tr>
                </thead>
                <tbody>
                  {result.projections.map((p) => (
                    <tr key={p.year} className="border-b border-border/20 last:border-0">
                      <td className="px-5 py-2.5 font-medium tabular-nums" data-numeric>{p.year}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums" data-numeric>{p.shares.toFixed(1)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-positive" data-numeric>
                        ${p.annualIncome.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums" data-numeric>
                        ${p.totalDividends.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-5 py-2.5 text-right tabular-nums font-medium" data-numeric>
                        ${p.totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface-1 p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-bold tabular-nums" data-numeric>{value}</p>
    </div>
  );
}
