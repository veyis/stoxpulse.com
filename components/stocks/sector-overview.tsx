"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

type SectorStock = {
  ticker: string;
  name: string;
  industry: string;
  slug: string;
};

type SectorOverviewProps = {
  stocks: SectorStock[];
  sector: string;
};

export function SectorOverview({ stocks, sector }: SectorOverviewProps) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"ticker" | "name" | "industry">("ticker");

  const industries = useMemo(
    () => [...new Set(stocks.map((s) => s.industry))].sort(),
    [stocks]
  );

  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = stocks;
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (s) =>
          s.ticker.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.industry.toLowerCase().includes(q)
      );
    }
    if (selectedIndustry) {
      result = result.filter((s) => s.industry === selectedIndustry);
    }
    return [...result].sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
  }, [stocks, query, selectedIndustry, sortBy]);

  return (
    <div>
      {/* Sector Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-surface-1 p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Stocks</p>
          <p className="font-display text-2xl font-bold text-foreground">{stocks.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-1 p-4">
          <p className="text-xs text-muted-foreground mb-1">Industries</p>
          <p className="font-display text-2xl font-bold text-foreground">{industries.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-1 p-4">
          <p className="text-xs text-muted-foreground mb-1">Largest Industry</p>
          <p className="font-display text-sm font-bold text-foreground truncate">
            {industries.reduce(
              (max, ind) => {
                const count = stocks.filter((s) => s.industry === ind).length;
                return count > max.count ? { name: ind, count } : max;
              },
              { name: "", count: 0 }
            ).name || "—"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface-1 p-4">
          <p className="text-xs text-muted-foreground mb-1">Coverage</p>
          <p className="font-display text-sm font-bold text-brand">AI-Powered</p>
        </div>
      </div>

      {/* Industry Breakdown */}
      {industries.length > 1 && (
        <div className="mb-8">
          <h3 className="font-display text-sm font-semibold text-foreground mb-3">
            Filter by Industry
          </h3>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedIndustry(null)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                !selectedIndustry
                  ? "bg-brand text-brand-foreground"
                  : "bg-surface-1 border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {industries.map((ind) => (
              <button
                key={ind}
                onClick={() =>
                  setSelectedIndustry(selectedIndustry === ind ? null : ind)
                }
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedIndustry === ind
                    ? "bg-brand text-brand-foreground"
                    : "bg-surface-1 border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {ind} ({stocks.filter((s) => s.industry === ind).length})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search + Sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stocks..."
            className="w-full rounded-xl border border-border bg-surface-1 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand/50 focus:outline-none focus:ring-1 focus:ring-brand/30 transition-colors"
          />
        </div>
        <div className="flex gap-1.5">
          {(["ticker", "name", "industry"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                sortBy === s
                  ? "bg-surface-2 text-foreground border border-brand/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((stock) => (
          <Link
            key={stock.ticker}
            href={`/stocks/${stock.slug}`}
            className="group rounded-2xl border border-border bg-surface-1 p-4 transition-all duration-200 hover:border-brand/30 hover:bg-surface-2"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="font-display text-base font-bold text-foreground group-hover:text-brand transition-colors">
                  {stock.ticker}
                </span>
              </div>
              <ArrowRight className="size-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
            </div>
            <p className="text-sm font-medium text-foreground mb-0.5">
              {stock.name}
            </p>
            <p className="text-xs text-muted-foreground">{stock.industry}</p>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-muted-foreground">No stocks match your search.</p>
        </div>
      )}
    </div>
  );
}
