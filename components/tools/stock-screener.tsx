"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, ArrowUpDown, ChevronDown } from "lucide-react";
import { sectors } from "@/data/stocks/sectors";
import { SparkLine } from "@/components/stocks/spark-line";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────

interface ScreenerStock {
  ticker: string;
  name: string;
  slug: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  pe: number | null;
  pulseScore: number;
  grade: string;
  sparkData: number[];
}

type SortKey = "pulseScore" | "marketCap" | "changePercent" | "pe" | "name";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "pulseScore", label: "Pulse Score" },
  { value: "marketCap", label: "Market Cap" },
  { value: "changePercent", label: "Change %" },
  { value: "pe", label: "P/E Ratio" },
  { value: "name", label: "Name" },
];

// ── Helpers ──────────────────────────────────────────────────────

function gradeColor(grade: string): string {
  if (grade.startsWith("A")) return "bg-positive/15 text-positive border-positive/25";
  if (grade.startsWith("B")) return "bg-positive/10 text-positive/80 border-positive/20";
  if (grade.startsWith("C")) return "bg-warning/15 text-warning border-warning/25";
  if (grade.startsWith("D")) return "bg-negative/10 text-negative/80 border-negative/20";
  return "bg-negative/15 text-negative border-negative/25";
}

function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
  return `$${value.toLocaleString()}`;
}

// ── Skeleton ─────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface-1 p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="h-5 w-16 bg-surface-2 rounded mb-2" />
          <div className="h-3.5 w-32 bg-surface-2 rounded" />
        </div>
        <div className="h-7 w-10 bg-surface-2 rounded-lg" />
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="h-6 w-20 bg-surface-2 rounded mb-1.5" />
          <div className="h-3.5 w-14 bg-surface-2 rounded" />
        </div>
        <div className="h-6 w-20 bg-surface-2 rounded" />
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────

export function StockScreener() {
  const [stocks, setStocks] = useState<ScreenerStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("all");
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState<SortKey>("pulseScore");

  // Fetch data on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/screener");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setStocks(data.stocks ?? []);
      } catch {
        setError("Unable to load screener data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Client-side filtering and sorting
  const filtered = useMemo(() => {
    let result = [...stocks];

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.ticker.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q)
      );
    }

    // Sector filter
    if (sector !== "all") {
      result = result.filter((s) => s.sector === sector);
    }

    // Min pulse score filter
    if (minScore > 0) {
      result = result.filter((s) => s.pulseScore >= minScore);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "pulseScore":
          return b.pulseScore - a.pulseScore;
        case "marketCap":
          return b.marketCap - a.marketCap;
        case "changePercent":
          return b.changePercent - a.changePercent;
        case "pe": {
          const aPe = a.pe ?? Infinity;
          const bPe = b.pe ?? Infinity;
          return aPe - bPe;
        }
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [stocks, search, sector, minScore, sortBy]);

  return (
    <div className="w-full">
      {/* ── Filter Bar (sticky) ────────────────────────────────── */}
      <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-xl border-b border-border -mx-6 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          {/* Top row: Search + Sector + Sort */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ticker or company..."
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-surface-1 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors"
              />
            </div>

            {/* Sector dropdown */}
            <div className="relative">
              <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="h-10 pl-10 pr-8 rounded-xl border border-border bg-surface-1 text-foreground text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors"
              >
                <option value="all">All Sectors</option>
                {sectors.map((s) => (
                  <option key={s.slug} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="h-10 pl-10 pr-8 rounded-xl border border-border bg-surface-1 text-foreground text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Bottom row: Score slider + Count */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm text-muted-foreground whitespace-nowrap">
                Min Score: <span className="text-foreground font-medium tabular-nums">{minScore}</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-32 sm:w-48 accent-brand"
              />
            </div>
            <p className="text-sm text-muted-foreground tabular-nums">
              Showing <span className="text-foreground font-medium">{filtered.length}</span> of{" "}
              <span className="text-foreground font-medium">{stocks.length}</span> stocks
            </p>
          </div>
        </div>
      </div>

      {/* ── Results Grid ───────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto pt-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              No stocks match your filters. Try adjusting your criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((stock) => (
              <Link
                key={stock.ticker}
                href={`/stocks/${stock.slug}`}
                className="group rounded-2xl border border-border bg-surface-1 p-5 hover:border-brand/40 hover:bg-surface-2 transition-all duration-200"
              >
                {/* Top: Ticker + Grade */}
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0">
                    <p className="font-display text-lg font-bold text-foreground">
                      {stock.ticker}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {stock.name}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 ml-3 inline-flex items-center justify-center rounded-lg border px-2.5 py-1 text-sm font-bold tabular-nums",
                      gradeColor(stock.grade)
                    )}
                  >
                    {stock.grade}
                  </span>
                </div>

                {/* Middle: Sector badge */}
                <div className="mb-3">
                  <span className="inline-block rounded-full bg-surface-2 px-2.5 py-0.5 text-xs text-muted-foreground">
                    {stock.sector}
                  </span>
                </div>

                {/* Bottom: Price + Change + Spark */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xl font-bold text-foreground tabular-nums">
                      ${stock.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p
                      className={cn(
                        "text-sm font-medium tabular-nums",
                        stock.changePercent >= 0 ? "text-positive" : "text-negative"
                      )}
                    >
                      {stock.changePercent >= 0 ? "+" : ""}
                      {stock.changePercent.toFixed(2)}%
                    </p>
                  </div>
                  {stock.sparkData.length >= 2 && (
                    <SparkLine
                      data={stock.sparkData}
                      width={80}
                      height={28}
                      positive={stock.changePercent >= 0}
                    />
                  )}
                </div>

                {/* Stats row */}
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span className="tabular-nums">
                    Score: <span className="text-foreground font-medium">{stock.pulseScore}</span>/100
                  </span>
                  <span className="tabular-nums">
                    {stock.pe != null ? `P/E ${stock.pe.toFixed(1)}` : "P/E N/A"}
                  </span>
                  <span className="tabular-nums">{formatMarketCap(stock.marketCap)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
