"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Loader2,
  Users,
  AlertCircle,
} from "lucide-react";

interface InsiderTrade {
  ticker: string;
  name: string;
  title: string;
  type: "Buy" | "Sale";
  shares: number;
  pricePerShare: number;
  totalValue: number;
  date: string;
  isRoutine: boolean;
}

type FilterTab = "all" | "buys" | "sells" | "large" | "csuite";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "buys", label: "Buys Only" },
  { key: "sells", label: "Sells Only" },
  { key: "large", label: "Large ($1M+)" },
  { key: "csuite", label: "C-Suite Only" },
];

const C_SUITE_KEYWORDS = [
  "CEO",
  "CFO",
  "COO",
  "CTO",
  "CIO",
  "CMO",
  "Chief",
  "President",
  "Chairman",
];

function tickerToSlug(ticker: string): string {
  return ticker.toLowerCase().replace(/\./g, "-");
}

function formatValue(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `$${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(abs / 1_000).toFixed(0)}K`;
  return `$${abs.toLocaleString()}`;
}

function formatShares(n: number): string {
  return Math.abs(n).toLocaleString();
}

function formatPrice(n: number): string {
  return `$${n.toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isCsuite(title: string): boolean {
  const upper = title.toUpperCase();
  return C_SUITE_KEYWORDS.some((kw) => upper.includes(kw.toUpperCase()));
}

// ─── Skeleton ────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-border/50">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-surface-2 rounded animate-pulse w-full max-w-[100px]" />
        </td>
      ))}
    </tr>
  );
}

function LoadingSkeleton() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface-1">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Ticker</th>
            <th className="px-4 py-3 font-medium hidden md:table-cell">
              Insider
            </th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium hidden lg:table-cell">
              Shares
            </th>
            <th className="px-4 py-3 font-medium hidden lg:table-cell">
              Price
            </th>
            <th className="px-4 py-3 font-medium">Value</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────

export function InsiderTracker() {
  const [trades, setTrades] = useState<InsiderTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  useEffect(() => {
    async function fetchTrades() {
      try {
        const res = await fetch("/api/insider-feed");
        if (!res.ok) throw new Error("Failed to fetch");
        const data: InsiderTrade[] = await res.json();
        setTrades(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchTrades();
  }, []);

  const filtered = trades.filter((t) => {
    switch (activeFilter) {
      case "buys":
        return t.type === "Buy";
      case "sells":
        return t.type === "Sale";
      case "large":
        return Math.abs(t.totalValue) >= 1_000_000;
      case "csuite":
        return isCsuite(t.title);
      default:
        return true;
    }
  });

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === tab.key
                ? "bg-brand text-white"
                : "bg-surface-1 text-muted-foreground hover:text-foreground hover:bg-surface-2 border border-border"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="rounded-2xl border border-border bg-surface-1 p-12 text-center">
          <AlertCircle className="size-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">
            Unable to load insider trading data. Please try again later.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface-1 p-12 text-center">
          <Users className="size-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">
            No insider trades match your current filter.
          </p>
          <button
            onClick={() => setActiveFilter("all")}
            className="mt-4 text-brand hover:underline text-sm font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium hidden sm:table-cell">
                  Date
                </th>
                <th className="px-4 py-3 font-medium">Ticker</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">
                  Insider
                </th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell tabular-nums">
                  Shares
                </th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell tabular-nums">
                  Price
                </th>
                <th className="px-4 py-3 font-medium tabular-nums">Value</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">
                  Flag
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((trade, i) => (
                <tr
                  key={`${trade.ticker}-${trade.name}-${trade.date}-${i}`}
                  className="border-b border-border/50 hover:bg-surface-2/50 transition-colors"
                >
                  {/* Date */}
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell whitespace-nowrap tabular-nums">
                    {formatDate(trade.date)}
                  </td>

                  {/* Ticker */}
                  <td className="px-4 py-3">
                    <Link
                      href={`/stocks/${tickerToSlug(trade.ticker)}`}
                      className="font-semibold text-brand hover:underline"
                    >
                      {trade.ticker}
                    </Link>
                  </td>

                  {/* Insider Name + Title */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="text-foreground font-medium truncate max-w-[200px]">
                      {trade.name}
                    </div>
                    <div className="text-muted-foreground text-xs truncate max-w-[200px]">
                      {trade.title}
                    </div>
                  </td>

                  {/* Type Badge */}
                  <td className="px-4 py-3">
                    {trade.type === "Buy" ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-positive/10 px-2 py-0.5 text-xs font-semibold text-positive">
                        <ArrowUpRight className="size-3" />
                        Buy
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-negative/10 px-2 py-0.5 text-xs font-semibold text-negative">
                        <ArrowDownRight className="size-3" />
                        Sale
                      </span>
                    )}
                  </td>

                  {/* Shares */}
                  <td className="px-4 py-3 text-foreground hidden lg:table-cell tabular-nums">
                    {formatShares(trade.shares)}
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3 text-foreground hidden lg:table-cell tabular-nums">
                    {formatPrice(trade.pricePerShare)}
                  </td>

                  {/* Total Value */}
                  <td className="px-4 py-3 font-semibold text-foreground tabular-nums">
                    {formatValue(trade.totalValue)}
                  </td>

                  {/* Non-routine Flag */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    {!trade.isRoutine && (
                      <span className="inline-flex items-center rounded-md bg-warning/10 px-2 py-0.5 text-xs font-semibold text-warning">
                        Discretionary
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Results count */}
      {!loading && !error && filtered.length > 0 && (
        <p className="text-sm text-muted-foreground text-right tabular-nums">
          Showing {filtered.length} of {trades.length} trades
        </p>
      )}
    </div>
  );
}
