"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";

interface SectorData {
  name: string;
  slug: string;
  changePercent: number;
}

export function MarketOverview() {
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sector-performance")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSectors(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (sectors.length === 0) return null;

  const sorted = [...sectors].sort((a, b) => b.changePercent - a.changePercent);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  return (
    <div className="mb-10">
      <h2 className="font-display text-lg font-semibold text-foreground mb-4">
        Sector Performance Today
      </h2>

      {/* Heatmap grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-4">
        {sorted.map((s) => {
          const pct = s.changePercent;
          const isPositive = pct >= 0;
          const intensity = Math.min(Math.abs(pct) / 3, 1); // normalize to 0-1

          return (
            <Link
              key={s.slug}
              href={`/stocks/sector/${s.slug}`}
              className={cn(
                "relative rounded-xl border p-3 text-center transition-all hover:scale-[1.02] hover:shadow-lg",
                isPositive
                  ? "border-positive/20 hover:border-positive/40"
                  : "border-negative/20 hover:border-negative/40"
              )}
              style={{
                backgroundColor: isPositive
                  ? `oklch(72% 0.19 155 / ${0.05 + intensity * 0.15})`
                  : `oklch(65% 0.2 25 / ${0.05 + intensity * 0.15})`,
              }}
            >
              <p className="text-xs font-medium text-foreground truncate mb-1">
                {s.name}
              </p>
              <div
                className={cn(
                  "flex items-center justify-center gap-1 text-sm font-bold font-display",
                  isPositive ? "text-positive" : "text-negative"
                )}
              >
                {isPositive ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {isPositive ? "+" : ""}
                {pct.toFixed(2)}%
              </div>
            </Link>
          );
        })}
      </div>

      {/* Best/worst summary */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span>
          Best:{" "}
          <Link
            href={`/stocks/sector/${best.slug}`}
            className="font-medium text-positive hover:underline"
          >
            {best.name} ({best.changePercent > 0 ? "+" : ""}
            {best.changePercent.toFixed(2)}%)
          </Link>
        </span>
        <span>
          Worst:{" "}
          <Link
            href={`/stocks/sector/${worst.slug}`}
            className="font-medium text-negative hover:underline"
          >
            {worst.name} ({worst.changePercent > 0 ? "+" : ""}
            {worst.changePercent.toFixed(2)}%)
          </Link>
        </span>
      </div>
    </div>
  );
}
