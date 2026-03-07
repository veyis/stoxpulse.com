"use client";

import { useEffect, useState } from "react";
import { StockPrice } from "./stock-price";
import { FiftyTwoWeekBar } from "./fifty-two-week-bar";
import { MetricCard } from "./metric-card";

interface CommodityQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  dayLow: number;
  dayHigh: number;
  high52w: number;
  low52w: number;
  priceAvg50: number;
  priceAvg200: number;
  open: number;
  previousClose: number;
  timestamp: number;
}

function formatPrice(num: number): string {
  return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatVolume(num: number): string {
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(0)}K`;
  return num.toLocaleString();
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

interface CommodityLivePriceProps {
  symbol: string;
  unit: string;
}

export function CommodityLivePrice({ symbol, unit }: CommodityLivePriceProps) {
  const [quote, setQuote] = useState<CommodityQuote | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function fetchQuote() {
      try {
        const res = await fetch(`/api/commodity-quote?symbol=${symbol}`);
        if (!res.ok) return;
        const data: CommodityQuote = await res.json();
        if (!cancelled) {
          setQuote(data);
          setUpdatedAt(timeAgo(data.timestamp));
        }
      } catch {
        // silently fail
      }
    }

    fetchQuote();
    const interval = setInterval(fetchQuote, 30_000); // Poll every 30s
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [symbol]);

  // Update "time ago" display every 30s
  useEffect(() => {
    if (!quote) return;
    const interval = setInterval(() => {
      setUpdatedAt(timeAgo(quote.timestamp));
    }, 30_000);
    return () => clearInterval(interval);
  }, [quote]);

  if (!quote) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 w-48 rounded bg-muted-foreground/10" />
        <div className="h-6 w-64 rounded bg-muted-foreground/10" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-16 rounded bg-muted-foreground/10" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Open", value: formatPrice(quote.open) },
    { label: "Previous Close", value: formatPrice(quote.previousClose) },
    { label: "Day Low", value: formatPrice(quote.dayLow) },
    { label: "Day High", value: formatPrice(quote.dayHigh) },
    { label: "52w High", value: formatPrice(quote.high52w) },
    { label: "52w Low", value: formatPrice(quote.low52w) },
    { label: "50-Day Avg", value: formatPrice(quote.priceAvg50) },
    { label: "200-Day Avg", value: formatPrice(quote.priceAvg200) },
    { label: "Volume", value: formatVolume(quote.volume) },
  ];

  return (
    <div className="space-y-6">
      {/* Price + 52w range */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div>
          <StockPrice
            price={quote.price}
            change={quote.change}
            changePercent={quote.changePercent}
            size="xl"
          />
          <p className="text-xs text-muted-foreground/50 mt-1">Updated {updatedAt}</p>
        </div>
        {quote.high52w && quote.low52w && (
          <div className="sm:ml-auto sm:w-64">
            <FiftyTwoWeekBar low={quote.low52w} high={quote.high52w} current={quote.price} />
          </div>
        )}
      </div>

      {/* Key Stats */}
      <div className="rounded-lg border border-border/50 bg-card p-4">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
          Key Statistics
        </h3>
        <p className="text-[11px] text-muted-foreground/60 mb-4">Prices {unit}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <MetricCard key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </div>
      </div>
    </div>
  );
}
