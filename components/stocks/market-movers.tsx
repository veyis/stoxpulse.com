"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Activity, Loader2 } from "lucide-react";
import { tickerToSlug } from "@/data/stocks/sp500";

interface Mover {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

type Tab = "gainers" | "losers" | "mostActive";

export function MarketMovers() {
  const [data, setData] = useState<{
    gainers: Mover[];
    losers: Mover[];
    mostActive: Mover[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("gainers");

  useEffect(() => {
    fetch("/api/market-movers")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
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

  if (!data) return null;

  const tabs: { key: Tab; label: string; icon: typeof TrendingUp }[] = [
    { key: "gainers", label: "Gainers", icon: TrendingUp },
    { key: "losers", label: "Losers", icon: TrendingDown },
    { key: "mostActive", label: "Most Active", icon: Activity },
  ];

  const items = data[tab] ?? [];

  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
              tab === t.key
                ? "bg-surface-2 text-foreground border border-brand/30"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-1"
            )}
          >
            <t.icon className="size-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {items.map((m) => {
          const isPositive = m.changePercent >= 0;
          return (
            <Link
              key={m.ticker}
              href={`/stocks/${tickerToSlug(m.ticker)}`}
              className="rounded-xl border border-border bg-surface-1 p-3 transition-all hover:border-brand/30 hover:bg-surface-2"
            >
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-sm font-bold font-display">{m.ticker}</span>
                <span
                  className={cn(
                    "text-xs font-semibold",
                    isPositive ? "text-positive" : "text-negative"
                  )}
                >
                  {isPositive ? "+" : ""}
                  {m.changePercent.toFixed(2)}%
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate mb-1">
                {m.name}
              </p>
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium text-foreground">
                  ${m.price.toFixed(2)}
                </span>
                {tab === "mostActive" && (
                  <span className="text-[10px] text-muted-foreground">
                    {(m.volume / 1e6).toFixed(1)}M vol
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
