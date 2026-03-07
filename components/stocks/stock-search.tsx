"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronRight, X } from "lucide-react";

type StockItem = {
  ticker: string;
  name: string;
  sector: string;
  slug: string;
};

export function StockSearch({ stocks }: { stocks: StockItem[] }) {
  const [query, setQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  const sectors = useMemo(
    () => [...new Set(stocks.map((s) => s.sector))].sort(),
    [stocks]
  );

  const filtered = useMemo(() => {
    let result = stocks;
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (s) =>
          s.ticker.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q)
      );
    }
    if (selectedSector) {
      result = result.filter((s) => s.sector === selectedSector);
    }
    return result;
  }, [stocks, query, selectedSector]);

  const groupedBySector = useMemo(() => {
    const map = new Map<string, StockItem[]>();
    for (const stock of filtered) {
      const existing = map.get(stock.sector) || [];
      existing.push(stock);
      map.set(stock.sector, existing);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div>
      {/* Search + Filter Bar */}
      <div className="sticky top-16 z-30 -mx-6 px-6 py-4 bg-background/80 backdrop-blur-xl border-b border-border/50 mb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ticker or company name..."
              className="w-full rounded-xl border border-border bg-surface-1 pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand/50 focus:outline-none focus:ring-1 focus:ring-brand/30 transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Sector Pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedSector(null)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                !selectedSector
                  ? "bg-brand text-brand-foreground"
                  : "bg-surface-1 border border-border text-muted-foreground hover:text-foreground hover:border-brand/30"
              }`}
            >
              All ({stocks.length})
            </button>
            {sectors.map((sector) => {
              const count = stocks.filter((s) => s.sector === sector).length;
              return (
                <button
                  key={sector}
                  onClick={() =>
                    setSelectedSector(selectedSector === sector ? null : sector)
                  }
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    selectedSector === sector
                      ? "bg-brand text-brand-foreground"
                      : "bg-surface-1 border border-border text-muted-foreground hover:text-foreground hover:border-brand/30"
                  }`}
                >
                  {sector} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Results count */}
        <p className="mt-2 text-xs text-muted-foreground">
          {filtered.length === stocks.length
            ? `${stocks.length} stocks`
            : `${filtered.length} of ${stocks.length} stocks`}
        </p>
      </div>

      {/* Results */}
      {query || selectedSector ? (
        // Flat grid when searching/filtering
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((stock) => (
            <StockCard key={stock.ticker} stock={stock} />
          ))}
        </div>
      ) : (
        // Grouped by sector when browsing
        groupedBySector.map(([sector, sectorStocks]) => (
          <section key={sector} className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-display text-lg font-bold text-foreground">
                {sector}
              </h2>
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {sectorStocks.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {sectorStocks.map((stock) => (
                <StockCard key={stock.ticker} stock={stock} />
              ))}
            </div>
          </section>
        ))
      )}

      {filtered.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            No stocks found for &ldquo;{query}&rdquo;
          </p>
          <p className="mt-1 text-sm text-muted-foreground/60">
            Try a different ticker or company name
          </p>
        </div>
      )}
    </div>
  );
}

function StockCard({ stock }: { stock: StockItem }) {
  return (
    <Link
      href={`/stocks/${stock.slug}`}
      className="group flex items-center justify-between gap-3 rounded-2xl border border-border/50 bg-surface-1/30 backdrop-blur-sm px-4 py-3 transition-all duration-200 hover:border-brand/30 hover:bg-surface-1/60"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-bold text-foreground group-hover:text-brand transition-colors">
            {stock.ticker}
          </span>
          <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {stock.sector}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {stock.name}
        </p>
      </div>
      <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
    </Link>
  );
}
