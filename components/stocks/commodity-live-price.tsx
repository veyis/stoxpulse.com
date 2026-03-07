"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PriceChart } from "./price-chart";
import type { HistoricalPrice } from "@/lib/data/types";

/* ─── Types ────────────────────────────────────────────────── */

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

interface CommodityNewsItem {
  title: string;
  text: string;
  url: string;
  source: string;
  image: string;
  publishedDate: string;
}

interface Technicals {
  rsi14?: number;
  sma20?: number;
  otherMetal?: { symbol: string; price: number; change: number; changePercent: number };
  news?: CommodityNewsItem[];
}

interface RelatedETFQuote {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

/* ─── Helpers ──────────────────────────────────────────────── */

const TROY_OZ_TO_GRAM = 31.1035;

function fmtPrice(n: number, decimals = 2): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

function fmtVol(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toLocaleString();
}

function timeAgo(ts: number): string {
  const s = Math.floor(Date.now() / 1000 - ts);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function newsTimeAgo(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function pctPos(low: number, high: number, current: number): number {
  if (high - low <= 0) return 50;
  return Math.max(0, Math.min(100, ((current - low) / (high - low)) * 100));
}

/* ─── Component Props ──────────────────────────────────────── */

interface CommodityLivePriceProps {
  symbol: string;
  unit: string;
  shortName: string;
  relatedETFs: { ticker: string; name: string }[];
}

/* ─── Main Component ───────────────────────────────────────── */

export function CommodityLivePrice({ symbol, unit, shortName, relatedETFs }: CommodityLivePriceProps) {
  const [quote, setQuote] = useState<CommodityQuote | null>(null);
  const [historicalPrices, setHistoricalPrices] = useState<HistoricalPrice[]>([]);
  const [technicals, setTechnicals] = useState<Technicals | null>(null);
  const [etfQuotes, setEtfQuotes] = useState<RelatedETFQuote[]>([]);
  const [updatedAt, setUpdatedAt] = useState("");

  // ── Initial load ──
  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      try {
        // Fetch all data in parallel
        const [quoteRes, techRes, etfResults] = await Promise.all([
          fetch(`/api/commodity-quote?symbol=${symbol}&history=1`),
          fetch(`/api/commodity-technicals?symbol=${symbol}`),
          Promise.all(
            relatedETFs.map(async (etf) => {
              try {
                const r = await fetch(`/api/commodity-quote?symbol=${etf.ticker}`);
                if (!r.ok) return null;
                const d = await r.json();
                return { ticker: etf.ticker, name: etf.name, price: d.price, change: d.change, changePercent: d.changePercent } as RelatedETFQuote;
              } catch { return null; }
            })
          ),
        ]);

        if (cancelled) return;

        if (quoteRes.ok) {
          const data: CommodityQuote = await quoteRes.json();
          setQuote(data);
          setUpdatedAt(timeAgo(data.timestamp));
          if (data.historicalPrices) setHistoricalPrices(data.historicalPrices);
        }

        if (techRes.ok) {
          const data: Technicals = await techRes.json();
          setTechnicals(data);
        }

        setEtfQuotes(etfResults.filter((r): r is RelatedETFQuote => r !== null));
      } catch {
        // silently fail
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [symbol, relatedETFs]);

  // ── Poll quote every 30s ──
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/commodity-quote?symbol=${symbol}`);
        if (res.ok) {
          const data: CommodityQuote = await res.json();
          setQuote(data);
          setUpdatedAt(timeAgo(data.timestamp));
        }
      } catch { /* silently fail */ }
    }, 30_000);
    return () => clearInterval(interval);
  }, [symbol]);

  // ── Update time display every 30s ──
  useEffect(() => {
    if (!quote) return;
    const interval = setInterval(() => setUpdatedAt(timeAgo(quote.timestamp)), 30_000);
    return () => clearInterval(interval);
  }, [quote]);

  // ── Compute performance from history ──
  const performance = useMemo(() => {
    if (!historicalPrices.length || !quote) return null;
    const sorted = [...historicalPrices].sort((a, b) => b.date.localeCompare(a.date));
    const cur = quote.price;

    function pctFromDays(days: number): number | null {
      if (sorted.length < days) return null;
      const past = sorted[Math.min(days - 1, sorted.length - 1)].close;
      if (past === 0) return null;
      return ((cur - past) / past) * 100;
    }

    // YTD: find the last trading day of the previous year
    function ytd(): number | null {
      const yearStr = String(new Date().getFullYear());
      const prevYearEnd = sorted.find((p) => p.date < `${yearStr}-01-01`);
      if (!prevYearEnd || prevYearEnd.close === 0) return null;
      return ((cur - prevYearEnd.close) / prevYearEnd.close) * 100;
    }

    return {
      "1W": pctFromDays(5),
      "1M": pctFromDays(22),
      "3M": pctFromDays(66),
      "6M": pctFromDays(132),
      "YTD": ytd(),
      "1Y": pctFromDays(252),
    };
  }, [historicalPrices, quote]);

  // ── Loading skeleton ──
  if (!quote) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-border/50 bg-card p-6 sm:p-8 animate-pulse">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-3">
              <div className="h-3 w-28 rounded bg-muted-foreground/10" />
              <div className="h-14 w-64 rounded bg-muted-foreground/10" />
              <div className="h-4 w-48 rounded bg-muted-foreground/10" />
            </div>
            <div className="lg:w-80 space-y-5">
              <div className="h-8 rounded-full bg-muted-foreground/10" />
              <div className="h-8 rounded-full bg-muted-foreground/10" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/20">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 rounded bg-muted-foreground/10" />)}
          </div>
        </div>
        <div className="h-[450px] rounded-2xl bg-muted-foreground/5 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="h-64 rounded-2xl bg-muted-foreground/5" />
          <div className="h-64 rounded-2xl bg-muted-foreground/5" />
          <div className="h-64 rounded-2xl bg-muted-foreground/5" />
        </div>
      </div>
    );
  }

  // ── Derived values ──
  const up = quote.change >= 0;
  const dayPct = pctPos(quote.dayLow, quote.dayHigh, quote.price);
  const yearPct = pctPos(quote.low52w, quote.high52w, quote.price);
  const perGram = quote.price / TROY_OZ_TO_GRAM;
  const perKg = perGram * 1000;

  // MA signals
  const sma20 = technicals?.sma20;
  const sma50 = quote.priceAvg50;
  const sma200 = quote.priceAvg200;
  const maSignals = [
    sma20 ? { label: "SMA 20", value: sma20, above: quote.price > sma20 } : null,
    sma50 ? { label: "SMA 50", value: sma50, above: quote.price > sma50 } : null,
    sma200 ? { label: "SMA 200", value: sma200, above: quote.price > sma200 } : null,
  ].filter(Boolean) as { label: string; value: number; above: boolean }[];

  const bullishCount = maSignals.filter((s) => s.above).length;
  const overallSignal = maSignals.length === 0 ? "Neutral" : bullishCount >= 2 ? "Bullish" : bullishCount === 0 ? "Bearish" : "Neutral";

  // RSI
  const rsi = technicals?.rsi14;
  const rsiLabel = rsi == null ? null : rsi >= 70 ? "Overbought" : rsi <= 30 ? "Oversold" : "Neutral";
  const rsiColor = rsi == null ? "" : rsi >= 70 ? "text-negative" : rsi <= 30 ? "text-positive" : "text-foreground";

  // Gold/Silver ratio
  const otherMetal = technicals?.otherMetal;
  const metalRatio = otherMetal && otherMetal.price > 0 && symbol === "XAUUSD"
    ? quote.price / otherMetal.price
    : otherMetal && otherMetal.price > 0 && symbol === "XAGUSD"
      ? otherMetal.price / quote.price
      : null;

  return (
    <div className="space-y-6">
      {/* ─── HERO PRICE CARD ──────────────────────────────── */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <div className="p-5 sm:p-7">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Left: Price */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-positive opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-positive" />
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  Live &middot; {updatedAt}
                </span>
              </div>

              <div className="flex items-baseline gap-4 flex-wrap">
                <span className="text-4xl sm:text-5xl font-bold font-display tabular-nums text-foreground tracking-tight">
                  {fmtPrice(quote.price)}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-base font-bold tabular-nums ${up ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"}`}>
                  {up ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
                  {up ? "+" : ""}{quote.change.toFixed(2)} ({up ? "+" : ""}{quote.changePercent.toFixed(2)}%)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm">
                <span className="tabular-nums text-foreground/70 font-medium">{fmtPrice(perGram)}<span className="text-muted-foreground/50 ml-1 font-normal">/g</span></span>
                <span className="text-border">|</span>
                <span className="tabular-nums text-foreground/70 font-medium">{fmtPrice(perKg)}<span className="text-muted-foreground/50 ml-1 font-normal">/kg</span></span>
                <span className="text-border">|</span>
                <span className="text-muted-foreground/50 text-xs">{unit}</span>
              </div>
            </div>

            {/* Right: Range bars */}
            <div className="lg:w-80 space-y-5">
              <RangeBar label="Day Range" low={quote.dayLow} high={quote.dayHigh} pct={dayPct} positive={up} />
              {quote.high52w > 0 && quote.low52w > 0 && (
                <RangeBar label="52-Week Range" low={quote.low52w} high={quote.high52w} pct={yearPct} brand />
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-border/20">
            <MiniStat label="Open" value={fmtPrice(quote.open)} />
            <MiniStat label="Prev Close" value={fmtPrice(quote.previousClose)} />
            <MiniStat label="Volume" value={fmtVol(quote.volume)} />
            <MiniStat label="Spread" value={fmtPrice(quote.dayHigh - quote.dayLow)} />
          </div>
        </div>
      </div>

      {/* ─── TECHNICAL ANALYSIS PANEL ─────────────────────── */}
      {(rsi != null || maSignals.length > 0) && (
        <div className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <svg className="size-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" /><path strokeLinecap="round" strokeLinejoin="round" d="M7 16l4-8 4 4 5-9" /></svg>
              Technical Analysis
            </h3>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              overallSignal === "Bullish" ? "bg-positive/10 text-positive" :
              overallSignal === "Bearish" ? "bg-negative/10 text-negative" :
              "bg-muted-foreground/10 text-muted-foreground"
            }`}>
              {overallSignal}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* RSI Gauge */}
            {rsi != null && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">RSI (14)</p>
                <div className="relative h-3 rounded-full overflow-hidden bg-gradient-to-r from-positive/30 via-muted-foreground/10 to-negative/30">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-foreground border-2 border-background shadow-lg"
                    style={{ left: `calc(${rsi}% - 8px)` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-positive font-medium">Oversold</span>
                  <span className={`text-sm font-bold tabular-nums ${rsiColor}`}>
                    {rsi.toFixed(1)} <span className="text-xs font-medium text-muted-foreground ml-0.5">{rsiLabel}</span>
                  </span>
                  <span className="text-[10px] text-negative font-medium">Overbought</span>
                </div>
                {/* Zone markers */}
                <div className="relative h-0.5 mt-1">
                  <div className="absolute left-[30%] top-0 w-px h-2 bg-muted-foreground/20" />
                  <div className="absolute left-[70%] top-0 w-px h-2 bg-muted-foreground/20" />
                </div>
              </div>
            )}

            {/* Moving Average Signals */}
            {maSignals.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Moving Averages</p>
                <div className="space-y-2.5">
                  {maSignals.map((s) => (
                    <div key={s.label} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{s.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium tabular-nums text-foreground/80">{fmtPrice(s.value)}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${s.above ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"}`}>
                          {s.above ? "ABOVE" : "BELOW"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── PRICE CHART ──────────────────────────────────── */}
      {historicalPrices.length > 0 && (
        <PriceChart prices={historicalPrices} ticker={symbol} />
      )}

      {/* ─── 3-COLUMN: Stats / Performance / Ratio+ETFs ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Statistics */}
        <div className="rounded-2xl border border-border/50 bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Key Statistics</h3>
          <div className="space-y-0">
            <StatRow label="Open" value={fmtPrice(quote.open)} />
            <StatRow label="Prev Close" value={fmtPrice(quote.previousClose)} />
            <StatRow label="Day Low" value={fmtPrice(quote.dayLow)} />
            <StatRow label="Day High" value={fmtPrice(quote.dayHigh)} />
            <StatRow label="52w High" value={fmtPrice(quote.high52w)} />
            <StatRow label="52w Low" value={fmtPrice(quote.low52w)} />
            <StatRow label="Volume" value={fmtVol(quote.volume)} />
          </div>
        </div>

        {/* Performance */}
        <div className="rounded-2xl border border-border/50 bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Performance</h3>
          {performance ? (
            <div className="space-y-0">
              {(Object.entries(performance) as [string, number | null][]).map(([period, pct]) => {
                if (pct == null) return null;
                const pos = pct >= 0;
                return (
                  <div key={period} className="flex items-center justify-between py-2.5 border-b border-border/10 last:border-0">
                    <span className="text-sm text-muted-foreground">{period}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-16 h-1.5 rounded-full bg-secondary overflow-hidden ${pos ? "" : "flex justify-end"}`}>
                        <div
                          className={`h-full rounded-full ${pos ? "bg-positive" : "bg-negative"}`}
                          style={{ width: `${Math.min(Math.abs(pct), 100)}%` }}
                        />
                      </div>
                      <span className={`text-sm font-bold tabular-nums w-20 text-right ${pos ? "text-positive" : "text-negative"}`}>
                        {pos ? "+" : ""}{pct.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground/50">Loading...</p>
          )}
        </div>

        {/* Metal Ratio + Unit Prices */}
        <div className="space-y-6">
          {/* Gold/Silver Ratio */}
          {metalRatio != null && otherMetal && (
            <div className="rounded-2xl border border-border/50 bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Gold / Silver Ratio</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold font-display tabular-nums text-foreground">
                  {metalRatio.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">: 1</span>
              </div>
              <p className="text-xs text-muted-foreground/60 leading-relaxed">
                {metalRatio > 80
                  ? "Historically high — silver may be undervalued relative to gold."
                  : metalRatio < 50
                    ? "Historically low — gold may be undervalued relative to silver."
                    : "Within the historical average range (50–80)."}
              </p>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/20">
                <Link href={`/stocks/${otherMetal.symbol.toLowerCase()}`} className="text-xs font-medium text-brand hover:underline">
                  View {otherMetal.symbol === "XAUUSD" ? "Gold" : "Silver"} →
                </Link>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {fmtPrice(otherMetal.price)}
                  <span className={`ml-1 ${otherMetal.changePercent >= 0 ? "text-positive" : "text-negative"}`}>
                    {otherMetal.changePercent >= 0 ? "+" : ""}{otherMetal.changePercent.toFixed(2)}%
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Unit Prices */}
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Price by Unit</h3>
            <div className="space-y-0">
              <StatRow label="Per Troy Oz" value={fmtPrice(quote.price)} />
              <StatRow label="Per Gram" value={fmtPrice(perGram)} />
              <StatRow label="Per Kilogram" value={fmtPrice(perKg)} />
              <StatRow label="Per Pennyweight" value={fmtPrice(quote.price / 20)} />
              <StatRow label="Per Tola" value={fmtPrice(quote.price * 0.375)} />
            </div>
          </div>
        </div>
      </div>

      {/* ─── LATEST NEWS ─────────────────────────────────── */}
      {technicals?.news && technicals.news.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Latest {shortName} News
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {technicals.news.map((article, i) => (
              <a
                key={i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl border border-border/50 bg-card overflow-hidden transition-all duration-200 hover:border-brand/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/5"
              >
                {article.image && (
                  <div className="aspect-[16/9] overflow-hidden bg-secondary">
                    <img
                      src={article.image}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-brand transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-xs text-muted-foreground/70 mt-2 line-clamp-2 leading-relaxed">
                    {article.text}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/10">
                    <span className="text-[11px] font-medium text-muted-foreground/50">{article.source}</span>
                    <span className="text-[11px] text-muted-foreground/40">{newsTimeAgo(article.publishedDate)}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ─── RELATED ETFs ─────────────────────────────────── */}
      {etfQuotes.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Related {shortName} ETFs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {etfQuotes.map((etf) => {
              const etfUp = etf.changePercent >= 0;
              return (
                <Link
                  key={etf.ticker}
                  href={`/stocks/${etf.ticker.toLowerCase()}`}
                  className="group flex items-center gap-4 rounded-xl border border-border/50 bg-card px-5 py-4 transition-all duration-200 hover:border-brand/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/5"
                >
                  <div className="flex items-center justify-center size-10 rounded-lg bg-secondary/60 shrink-0">
                    <span className="font-display text-xs font-bold text-foreground">{etf.ticker}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground truncate group-hover:text-foreground/80 transition-colors">
                      {etf.name}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-sm font-bold text-foreground">{fmtPrice(etf.price)}</span>
                    <p className={`text-xs font-mono tabular-nums ${etfUp ? "text-positive" : "text-negative"}`}>
                      {etfUp ? "+" : ""}{etf.changePercent.toFixed(2)}%
                    </p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground/20 group-hover:text-brand transition-all duration-200 group-hover:translate-x-1" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ───────────────────────────────────────── */

function RangeBar({ label, low, high, pct, positive, brand }: {
  label: string; low: number; high: number; pct: number; positive?: boolean; brand?: boolean;
}) {
  const fillClass = brand ? "bg-brand/30" : positive ? "bg-positive/30" : "bg-negative/30";
  const dotClass = brand ? "bg-brand" : positive ? "bg-positive" : "bg-negative";
  return (
    <div>
      <span className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-3 mt-1.5">
        <span className="text-xs tabular-nums text-muted-foreground font-medium w-[4.5rem] text-right">{fmtPrice(low)}</span>
        <div className="flex-1 relative h-2 rounded-full bg-secondary">
          <div className={`absolute inset-y-0 left-0 rounded-full ${fillClass}`} style={{ width: `${pct}%` }} />
          <div
            className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-background shadow-md ${dotClass}`}
            style={{ left: `calc(${pct}% - 7px)` }}
          />
        </div>
        <span className="text-xs tabular-nums text-muted-foreground font-medium w-[4.5rem]">{fmtPrice(high)}</span>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/10 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold tabular-nums text-foreground">{value}</span>
    </div>
  );
}
