"use client";

import { cn } from "@/lib/utils";

export interface SectorHeatmapData {
  name: string;
  slug: string;
  changePercent: number;
  marketCap: number; // for sizing
}

interface SectorHeatmapProps {
  sectors: SectorHeatmapData[];
  className?: string;
}

function getHeatColor(pct: number): string {
  if (pct >= 2) return "bg-positive/30 text-positive border-positive/20";
  if (pct >= 1) return "bg-positive/20 text-positive border-positive/15";
  if (pct >= 0.25) return "bg-positive/10 text-positive/80 border-positive/10";
  if (pct > -0.25) return "bg-muted/10 text-muted-foreground border-border/50";
  if (pct > -1) return "bg-negative/10 text-negative/80 border-negative/10";
  if (pct > -2) return "bg-negative/20 text-negative border-negative/15";
  return "bg-negative/30 text-negative border-negative/20";
}

export function SectorHeatmap({ sectors, className }: SectorHeatmapProps) {
  // Sort by market cap for visual weight
  const sorted = [...sectors].sort((a, b) => b.marketCap - a.marketCap);

  return (
    <div className={cn("rounded-xl border border-border/50 bg-card", className)}>
      <div className="px-5 py-4 border-b border-border/50">
        <h2 className="text-sm font-semibold font-display">Sector Performance</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Today&apos;s moves by sector</p>
      </div>
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
        {sorted.map((sector) => (
          <div
            key={sector.slug}
            className={cn(
              "rounded-lg border px-3 py-2.5 transition-all hover:scale-[1.02]",
              getHeatColor(sector.changePercent)
            )}
          >
            <p className="text-xs font-medium truncate opacity-80">{sector.name}</p>
            <p className="text-sm font-bold tabular-nums mt-0.5" data-numeric>
              {sector.changePercent >= 0 ? "+" : ""}
              {sector.changePercent.toFixed(2)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
