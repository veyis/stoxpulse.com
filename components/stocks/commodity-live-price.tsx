"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StockPrice } from "./stock-price";
import { FiftyTwoWeekBar } from "./fifty-two-week-bar";
import { MetricCard } from "./metric-card";
import { PriceChart } from "./price-chart";
import type { HistoricalPrice } from "@/lib/data/types";

interface CommodityQuote {
  symbol: string;
  name: string;
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
  historicalPrices?: HistoricalPrice[];
}

interface RelatedETFQuote {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
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
  relatedETFs: { ticker: string; name: string }[];
}

export function CommodityLivePrice({ symbol, unit, relatedETFs }: CommodityLivePriceProps) {
  const [quote, setQuote] = useState<CommodityQuote | null>(null);
  const [historicalPrices, setHistoricalPrices] = useState<HistoricalPrice[]>([]);
  const [etfQuotes, setEtfQuotes] = useState<RelatedETFQuote[]>([]);
  const [updatedAt, setUpdatedAt] = useState("");

  // Initial load: quote + history + ETF quotes
  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      try {
        // Fetch commodity quote with history
        const quoteRes = await fetch(`/api/commodity-quote?symbol=${symbol}&history=1`);
        if (quoteRes.ok) {
          const data: CommodityQuote = await quoteRes.json();
          if (!cancelled) {
            setQuote(data);
            setUpdatedAt(timeAgo(data.timestamp));
            if (data.historicalPrices) {
              setHistoricalPrices(data.historicalPrices);
            }
          }
        }

        // Fetch related ETF quotes in parallel
        const etfResults = await Promise.all(
          relatedETFs.map(async (etf) => {
            try {
              const res = await fetch(`/api/commodity-quote?symbol=${etf.ticker}`);
              if (!res.ok) return null;
              const data = await res.json();
              return {
                ticker: etf.ticker,
                name: etf.name,
                price: data.price,
                change: data.change,
                changePercent: data.changePercent,
              } as RelatedETFQuote;
            } catch {
              return null;
            }
          })
        );
        if (!cancelled) {
          setEtfQuotes(etfResults.filter((r): r is RelatedETFQuote => r !== null));
        }
      } catch {
        // silently fail
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [symbol, relatedETFs]);

  // Poll quote every 30s (without history to keep it lightweight)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/commodity-quote?symbol=${symbol}`);
        if (res.ok) {
          const data: CommodityQuote = await res.json();
          setQuote(data);
          setUpdatedAt(timeAgo(data.timestamp));
        }
      } catch {
        // silently fail
      }
    }, 30_000);
    return () => clearInterval(interval);
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
        <div className="h-[350px] rounded-lg bg-muted-foreground/10" />
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
    <div className="space-y-8">
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

      {/* Price Chart */}
      {historicalPrices.length > 0 && (
        <PriceChart prices={historicalPrices} ticker={symbol} />
      )}

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

      {/* Related ETFs with live prices */}
      {etfQuotes.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            Related ETFs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {etfQuotes.map((etf) => {
              const isPositive = etf.changePercent >= 0;
              return (
                <Link
                  key={etf.ticker}
                  href={`/stocks/${etf.ticker.toLowerCase()}`}
                  className="group flex items-center gap-4 rounded-xl border border-border/50 bg-surface-1/40 backdrop-blur-md px-5 py-4 transition-all duration-300 hover:border-brand/30 hover:bg-surface-1/60 hover:-translate-y-0.5 hover:shadow-md hover:shadow-brand/5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-base font-bold text-foreground group-hover:text-brand transition-colors">
                        {etf.ticker}
                      </span>
                      <span className={`text-sm font-semibold tabular-nums ${isPositive ? "text-positive" : "text-negative"}`}>
                        {isPositive ? "▲" : "▼"} {Math.abs(etf.changePercent).toFixed(2)}%
                      </span>
                    </div>
                    <p className="text-[13px] font-medium text-muted-foreground truncate leading-relaxed group-hover:text-foreground/80 transition-colors">
                      {etf.name}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-sm font-bold text-foreground">
                      {formatPrice(etf.price)}
                    </span>
                    <p className={`text-xs font-mono tabular-nums ${isPositive ? "text-positive" : "text-negative"}`}>
                      {isPositive ? "+" : ""}{etf.change.toFixed(2)}
                    </p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground/30 group-hover:text-brand transition-all duration-300 group-hover:translate-x-1" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
