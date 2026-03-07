"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PriceChart, type IntradayPrice } from "./price-chart";
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
  rsi4h?: number;
  sma20?: number;
  sma50?: number;
  sma200?: number;
  ema9?: number;
  ema21?: number;
  ema50?: number;
  otherMetal?: { symbol: string; price: number; change: number; changePercent: number };
  news?: CommodityNewsItem[];
}

interface MarketContext {
  currencies?: Record<string, { rate: number; change: number }>;
  vix?: { price: number; change: number; changePercent: number };
  spy?: { price: number; change: number; changePercent: number };
  economicEvents?: { date: string; event: string; estimate: number | null; previous: number | null; actual: number | null; impact: string }[];
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

function getMarketStatus(): { label: string; open: boolean } {
  const now = new Date();
  const utcDay = now.getUTCDay();
  const utcHour = now.getUTCHours();
  // Gold: Sunday 22:00 UTC to Friday 21:00 UTC (roughly)
  if (utcDay === 6) return { label: "Closed", open: false };
  if (utcDay === 0 && utcHour < 22) return { label: "Closed", open: false };
  if (utcDay === 5 && utcHour >= 21) return { label: "Closed", open: false };
  return { label: "Open", open: true };
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
  const [intradayPrices, setIntradayPrices] = useState<IntradayPrice[]>([]);
  const [technicals, setTechnicals] = useState<Technicals | null>(null);
  const [context, setContext] = useState<MarketContext | null>(null);
  const [etfQuotes, setEtfQuotes] = useState<RelatedETFQuote[]>([]);
  const [updatedAt, setUpdatedAt] = useState("");
  const [priceFlash, setPriceFlash] = useState<"up" | "down" | null>(null);
  const prevPriceRef = useRef<number>(0);

  // ── Initial load ──
  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      try {
        const [quoteRes, techRes, intradayRes, contextRes, etfResults] = await Promise.all([
          fetch(`/api/commodity-quote?symbol=${symbol}&history=1`),
          fetch(`/api/commodity-technicals?symbol=${symbol}`),
          fetch(`/api/commodity-intraday?symbol=${symbol}`),
          fetch(`/api/commodity-context?symbol=${symbol}`),
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
          prevPriceRef.current = data.price;
          if (data.historicalPrices) setHistoricalPrices(data.historicalPrices);
        }

        if (techRes.ok) {
          const data: Technicals = await techRes.json();
          setTechnicals(data);
        }

        if (intradayRes.ok) {
          const data: IntradayPrice[] = await intradayRes.json();
          if (Array.isArray(data)) setIntradayPrices(data);
        }

        if (contextRes.ok) {
          const data: MarketContext = await contextRes.json();
          setContext(data);
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
          // Price flash animation
          if (prevPriceRef.current > 0 && data.price !== prevPriceRef.current) {
            setPriceFlash(data.price > prevPriceRef.current ? "up" : "down");
            setTimeout(() => setPriceFlash(null), 1200);
          }
          prevPriceRef.current = data.price;
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

  // ── Pivot Points ──
  const pivots = useMemo(() => {
    if (historicalPrices.length < 2) return null;
    const sorted = [...historicalPrices].sort((a, b) => b.date.localeCompare(a.date));
    const day = sorted[0];
    if (!day.high || !day.low) return null;
    const h = day.high, l = day.low, c = day.close;
    const pp = (h + l + c) / 3;
    return { r2: pp + (h - l), r1: 2 * pp - l, pp, s1: 2 * pp - h, s2: pp - (h - l) };
  }, [historicalPrices]);

  // ── Bollinger Bands ──
  const bollingerBands = useMemo(() => {
    if (!technicals?.sma20 || historicalPrices.length < 20) return null;
    const sorted = [...historicalPrices].sort((a, b) => b.date.localeCompare(a.date));
    const last20 = sorted.slice(0, 20).map(p => p.close);
    const mean = last20.reduce((a, b) => a + b, 0) / 20;
    const variance = last20.reduce((sum, val) => sum + (val - mean) ** 2, 0) / 20;
    const stdDev = Math.sqrt(variance);
    return { upper: mean + 2 * stdDev, middle: mean, lower: mean - 2 * stdDev, stdDev };
  }, [technicals?.sma20, historicalPrices]);

  // ── Volatility (annualized) ──
  const volatility = useMemo(() => {
    if (historicalPrices.length < 22) return null;
    const sorted = [...historicalPrices].sort((a, b) => b.date.localeCompare(a.date));
    const returns: number[] = [];
    for (let i = 0; i < 21 && i + 1 < sorted.length; i++) {
      if (sorted[i + 1].close > 0) {
        returns.push(Math.log(sorted[i].close / sorted[i + 1].close));
      }
    }
    if (returns.length < 10) return null;
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / returns.length;
    return Math.sqrt(variance) * Math.sqrt(252) * 100; // annualized %
  }, [historicalPrices]);

  // ── Trend Analysis (EMA alignment + golden/death cross) ──
  const trendAnalysis = useMemo(() => {
    const ema9 = technicals?.ema9;
    const ema21 = technicals?.ema21;
    const ema50 = technicals?.ema50;
    const sma50 = technicals?.sma50 ?? quote?.priceAvg50;
    const sma200 = technicals?.sma200 ?? quote?.priceAvg200;
    if (!quote || !ema9 || !ema21) return null;

    // EMA ribbon: bullish when 9 > 21 > 50
    const emaRibbonBullish = ema9 > ema21 && (!ema50 || ema21 > ema50);
    const emaRibbonBearish = ema9 < ema21 && (!ema50 || ema21 < ema50);

    // Golden Cross: SMA 50 above SMA 200; Death Cross: SMA 50 below SMA 200
    let crossType: "golden" | "death" | null = null;
    if (sma50 && sma200) {
      if (sma50 > sma200) crossType = "golden";
      else crossType = "death";
    }

    // Price vs all MAs — count above
    const maValues = [ema9, ema21, ema50, sma50, sma200].filter(Boolean) as number[];
    const aboveCount = maValues.filter(v => quote.price > v).length;

    // Trend strength: 0-5 based on how many MAs price is above
    const strength = maValues.length > 0 ? aboveCount / maValues.length : 0.5;
    const trendLabel = strength >= 0.8 ? "Strong Uptrend" : strength >= 0.6 ? "Uptrend" :
      strength <= 0.2 ? "Strong Downtrend" : strength <= 0.4 ? "Downtrend" : "Sideways";

    return { emaRibbonBullish, emaRibbonBearish, crossType, strength, trendLabel, aboveCount, totalMAs: maValues.length };
  }, [technicals, quote]);

  // ── MACD (12, 26, 9) computed from historical closes ──
  const macdData = useMemo(() => {
    if (historicalPrices.length < 35) return null;
    const sorted = [...historicalPrices].sort((a, b) => a.date.localeCompare(b.date));
    const closes = sorted.map(p => p.close);

    function ema(data: number[], period: number): number[] {
      const k = 2 / (period + 1);
      const result: number[] = [data[0]];
      for (let i = 1; i < data.length; i++) {
        result.push(data[i] * k + result[i - 1] * (1 - k));
      }
      return result;
    }

    const ema12 = ema(closes, 12);
    const ema26 = ema(closes, 26);
    const macdLine = ema12.map((v, i) => v - ema26[i]);
    const signalLine = ema(macdLine.slice(26), 9);
    const macdRecent = macdLine[macdLine.length - 1];
    const signalRecent = signalLine[signalLine.length - 1];
    const histogram = macdRecent - signalRecent;
    const prevHistogram = macdLine[macdLine.length - 2] - signalLine[signalLine.length - 2];

    const crossover = (prevHistogram <= 0 && histogram > 0) ? "bullish" as const
      : (prevHistogram >= 0 && histogram < 0) ? "bearish" as const : null;

    return { macd: macdRecent, signal: signalRecent, histogram, crossover };
  }, [historicalPrices]);

  // ── Stochastic Oscillator (14, 3, 3) ──
  const stochastic = useMemo(() => {
    if (historicalPrices.length < 17) return null;
    const sorted = [...historicalPrices].sort((a, b) => b.date.localeCompare(a.date));
    const kValues: number[] = [];
    for (let i = 0; i < Math.min(5, sorted.length - 13); i++) {
      const window = sorted.slice(i, i + 14);
      const high14 = Math.max(...window.map(p => p.high ?? p.close));
      const low14 = Math.min(...window.map(p => p.low ?? p.close));
      const range = high14 - low14;
      if (range === 0) continue;
      kValues.push(((window[0].close - low14) / range) * 100);
    }
    if (kValues.length < 3) return null;
    const k = kValues.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const d = kValues.reduce((a, b) => a + b, 0) / kValues.length;
    const label = k >= 80 ? "Overbought" as const : k <= 20 ? "Oversold" as const : "Neutral" as const;
    return { k, d, label };
  }, [historicalPrices]);

  // ── ATR (14-day Average True Range) ──
  const atr = useMemo(() => {
    if (historicalPrices.length < 15) return null;
    const sorted = [...historicalPrices].sort((a, b) => b.date.localeCompare(a.date));
    const trValues: number[] = [];
    for (let i = 0; i < 14 && i + 1 < sorted.length; i++) {
      const high = sorted[i].high ?? sorted[i].close;
      const low = sorted[i].low ?? sorted[i].close;
      const prevClose = sorted[i + 1].close;
      const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
      trValues.push(tr);
    }
    if (trValues.length < 14) return null;
    const atrValue = trValues.reduce((a, b) => a + b, 0) / trValues.length;
    const atrPercent = quote ? (atrValue / quote.price) * 100 : 0;
    return { value: atrValue, percent: atrPercent };
  }, [historicalPrices, quote]);

  // ── AI Technical Summary (auto-generated paragraph) ──
  const aiSummary = useMemo(() => {
    if (!quote || !technicals) return null;
    const parts: string[] = [];
    const _rsi = technicals.rsi14;

    // Price action
    const dayChange = quote.changePercent;
    if (Math.abs(dayChange) > 2) {
      parts.push(`${shortName} is ${dayChange > 0 ? "surging" : "dropping"} ${Math.abs(dayChange).toFixed(1)}% today to ${fmtPrice(quote.price)}.`);
    } else {
      parts.push(`${shortName} is trading at ${fmtPrice(quote.price)}, ${dayChange >= 0 ? "up" : "down"} ${Math.abs(dayChange).toFixed(2)}% on the day.`);
    }

    // Trend
    if (trendAnalysis) {
      if (trendAnalysis.strength >= 0.8) {
        parts.push(`The trend is firmly bullish with price above all ${trendAnalysis.totalMAs} moving averages.`);
      } else if (trendAnalysis.strength >= 0.6) {
        parts.push(`The trend leans bullish \u2014 price holds above ${trendAnalysis.aboveCount} of ${trendAnalysis.totalMAs} key moving averages.`);
      } else if (trendAnalysis.strength <= 0.2) {
        parts.push(`The trend is bearish with price below all ${trendAnalysis.totalMAs} moving averages.`);
      } else if (trendAnalysis.strength <= 0.4) {
        parts.push(`Price is weakening, trading below ${trendAnalysis.totalMAs - trendAnalysis.aboveCount} of ${trendAnalysis.totalMAs} moving averages.`);
      } else {
        parts.push(`The trend is mixed \u2014 price sits between key moving averages suggesting consolidation.`);
      }
      if (trendAnalysis.crossType === "golden") {
        parts.push("A Golden Cross (SMA 50 > SMA 200) supports the bullish case.");
      } else if (trendAnalysis.crossType === "death") {
        parts.push("A Death Cross (SMA 50 < SMA 200) signals longer-term caution.");
      }
    }

    // RSI
    if (_rsi != null) {
      if (_rsi > 75) parts.push(`Daily RSI at ${_rsi.toFixed(0)} is deep in overbought territory \u2014 a pullback may be due.`);
      else if (_rsi > 65) parts.push(`Daily RSI at ${_rsi.toFixed(0)} is elevated but not yet extreme.`);
      else if (_rsi < 25) parts.push(`Daily RSI at ${_rsi.toFixed(0)} signals deeply oversold conditions \u2014 a bounce is possible.`);
      else if (_rsi < 35) parts.push(`RSI at ${_rsi.toFixed(0)} is approaching oversold levels.`);
    }

    // Bollinger
    if (bollingerBands && quote.price >= bollingerBands.upper) {
      parts.push("Price has breached the upper Bollinger Band, suggesting overextension.");
    } else if (bollingerBands && quote.price <= bollingerBands.lower) {
      parts.push("Price is below the lower Bollinger Band \u2014 a mean reversion bounce is possible.");
    }

    // Volatility
    if (volatility != null) {
      if (volatility > 30) parts.push(`Volatility is elevated at ${volatility.toFixed(0)}% annualized \u2014 expect wider swings.`);
      else if (volatility < 12) parts.push(`Volatility is unusually low at ${volatility.toFixed(0)}% \u2014 a breakout move may be building.`);
    }

    // MACD
    if (macdData?.crossover === "bullish") {
      parts.push("MACD just crossed bullish — a momentum buy signal.");
    } else if (macdData?.crossover === "bearish") {
      parts.push("MACD just crossed bearish — momentum is turning negative.");
    }

    // Stochastic
    if (stochastic && stochastic.k <= 20 && stochastic.k > stochastic.d) {
      parts.push("Stochastic turning up from oversold — potential reversal signal.");
    } else if (stochastic && stochastic.k >= 80 && stochastic.k < stochastic.d) {
      parts.push("Stochastic rolling over from overbought — distribution possible.");
    }

    // Upcoming catalyst
    if (context?.economicEvents?.[0]) {
      const evt = context.economicEvents[0];
      const evtDate = new Date(evt.date);
      const daysUntil = Math.ceil((evtDate.getTime() - Date.now()) / 86400000);
      if (daysUntil >= 0 && daysUntil <= 7) {
        parts.push(`Key catalyst ahead: ${evt.event}${daysUntil === 0 ? " today" : daysUntil === 1 ? " tomorrow" : ` in ${daysUntil} days`}.`);
      }
    }

    return parts.join(" ");
  }, [quote, technicals, trendAnalysis, bollingerBands, volatility, context, shortName, macdData, stochastic]);

  // ── AI Action Takeaway (separate from summary for visual emphasis) ──
  const aiAction = useMemo(() => {
    if (!trendAnalysis || !technicals) return null;
    const score = trendAnalysis.strength; // 0 to 1
    const _rsi = technicals.rsi14;
    // Combine trend + RSI for conviction
    let action: "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell";
    let confidence: number;
    if (score >= 0.8 && _rsi != null && _rsi < 70) {
      action = "Strong Buy"; confidence = 85;
    } else if (score >= 0.6 && _rsi != null && _rsi < 75) {
      action = "Buy"; confidence = 70;
    } else if (score <= 0.2 && _rsi != null && _rsi > 30) {
      action = "Strong Sell"; confidence = 85;
    } else if (score <= 0.4 && _rsi != null && _rsi > 25) {
      action = "Sell"; confidence = 70;
    } else {
      action = "Hold"; confidence = 55;
    }
    // Adjust if RSI conflicts with trend
    if (_rsi != null && _rsi > 80 && action.includes("Buy")) { action = "Hold"; confidence = 50; }
    if (_rsi != null && _rsi < 20 && action.includes("Sell")) { action = "Hold"; confidence = 50; }
    // MACD crossover boost
    if (macdData?.crossover === "bullish" && action.includes("Buy")) confidence = Math.min(95, confidence + 10);
    if (macdData?.crossover === "bearish" && action.includes("Sell")) confidence = Math.min(95, confidence + 10);
    // Stochastic confirmation
    if (stochastic && stochastic.k <= 20 && action.includes("Buy")) confidence = Math.min(95, confidence + 5);
    if (stochastic && stochastic.k >= 80 && action.includes("Sell")) confidence = Math.min(95, confidence + 5);
    return { action, confidence };
  }, [trendAnalysis, technicals, macdData, stochastic]);

  // ── Seasonal Analysis (computed from real historical data) ──
  const seasonalData = useMemo(() => {
    if (historicalPrices.length < 252) return null; // need at least 1 year
    const sorted = [...historicalPrices].sort((a, b) => a.date.localeCompare(b.date));

    // Group by month and compute average returns
    const monthReturns: Record<number, number[]> = {};
    for (let i = 1; i < sorted.length; i++) {
      const month = new Date(sorted[i].date + "T12:00:00").getMonth(); // 0-11
      const prevClose = sorted[i - 1].close;
      if (prevClose > 0) {
        const dailyReturn = (sorted[i].close - prevClose) / prevClose;
        if (!monthReturns[month]) monthReturns[month] = [];
        monthReturns[month].push(dailyReturn);
      }
    }

    // Average daily return per month, annualized to monthly
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((name, i) => {
      const returns = monthReturns[i];
      if (!returns || returns.length === 0) return { name, avgReturn: 0, positive: 0 };
      const avgDaily = returns.reduce((a, b) => a + b, 0) / returns.length;
      const avgMonthly = avgDaily * 21 * 100; // ~21 trading days per month
      const positiveDays = returns.filter(r => r > 0).length;
      return { name, avgReturn: avgMonthly, positive: (positiveDays / returns.length) * 100 };
    });
  }, [historicalPrices]);

  // Current month highlight for seasonal
  const currentMonth = new Date().getMonth();

  // ── Key Price Levels (psychological + pivot) ──
  const keyLevels = useMemo(() => {
    if (!quote) return [];
    const price = quote.price;
    // Generate round number levels around current price
    const step = price > 1000 ? 100 : price > 100 ? 10 : 1;
    const base = Math.floor(price / step) * step;
    const levels: { price: number; label: string; type: "resistance" | "support" | "current" }[] = [];
    for (let i = -2; i <= 3; i++) {
      const lvl = base + i * step;
      if (lvl <= 0) continue;
      const dist = ((price - lvl) / lvl) * 100;
      if (Math.abs(dist) > 5) continue; // only show levels within 5%
      levels.push({
        price: lvl,
        label: `$${lvl.toLocaleString()}`,
        type: lvl < price ? "support" : lvl > price ? "resistance" : "current",
      });
    }
    return levels;
  }, [quote]);

  // ── Fibonacci Retracement Levels ──
  const fibLevels = useMemo(() => {
    if (!quote || !quote.high52w || !quote.low52w || quote.high52w <= quote.low52w) return null;
    const high = quote.high52w;
    const low = quote.low52w;
    const diff = high - low;
    const ratios = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
    const labels = ["0%", "23.6%", "38.2%", "50%", "61.8%", "78.6%", "100%"];
    return ratios.map((r, i) => ({
      ratio: labels[i],
      price: high - diff * r,
      type: (high - diff * r) < quote.price ? "support" as const : "resistance" as const,
    }));
  }, [quote]);

  // ── Correlation insights (gold vs SPY/VIX) ──
  const correlationInsight = useMemo(() => {
    if (!context?.vix || !context?.spy || !quote) return null;
    const insights: string[] = [];
    if (context.vix.price >= 30) {
      insights.push(`VIX at ${context.vix.price.toFixed(1)} signals extreme fear — historically bullish for ${shortName} as investors seek safe havens.`);
    } else if (context.vix.price >= 20 && context.vix.changePercent > 5) {
      insights.push(`VIX spiking ${context.vix.changePercent.toFixed(1)}% — rising fear could drive ${shortName} demand.`);
    } else if (context.vix.price < 15) {
      insights.push(`VIX at ${context.vix.price.toFixed(1)} shows extreme complacency — less urgency for safe-haven ${shortName}.`);
    }
    if (context.spy.changePercent < -1 && quote.changePercent > 0) {
      insights.push(`${shortName} up while S&P 500 down — classic risk-off rotation into precious metals.`);
    } else if (context.spy.changePercent > 1 && quote.changePercent > 1) {
      insights.push(`Both equities and ${shortName} rising — may signal inflation concerns or liquidity-driven rally.`);
    } else if (context.spy.changePercent > 1 && quote.changePercent < 0) {
      insights.push(`Risk-on mood hurting ${shortName} as capital flows toward equities.`);
    }
    return insights.length > 0 ? insights : null;
  }, [context, quote, shortName]);

  // ── Calculator state ──
  const [calcGrams, setCalcGrams] = useState<string>("1");
  const calcValue = useMemo(() => {
    const g = parseFloat(calcGrams);
    if (isNaN(g) || g < 0 || !quote) return null;
    return g * (quote.price / TROY_OZ_TO_GRAM);
  }, [calcGrams, quote]);

  // ── Position size calculator ──
  const [riskCapital, setRiskCapital] = useState<string>("10000");
  const [riskPercent, setRiskPercent] = useState<string>("2");
  const positionSize = useMemo(() => {
    const cap = parseFloat(riskCapital);
    const pct = parseFloat(riskPercent);
    if (isNaN(cap) || isNaN(pct) || cap <= 0 || pct <= 0 || !quote || !atr) return null;
    const riskAmount = cap * (pct / 100);
    const stopLoss = atr.value * 1.5; // 1.5x ATR stop
    const units = riskAmount / stopLoss; // troy oz
    const positionValue = units * quote.price;
    return { riskAmount, stopLoss, units, positionValue, stopPrice: quote.price - stopLoss };
  }, [riskCapital, riskPercent, quote, atr]);

  // ── Drawdown Analysis ──
  const drawdownData = useMemo(() => {
    if (historicalPrices.length < 22 || !quote) return null;
    const sorted = [...historicalPrices].sort((a, b) => a.date.localeCompare(b.date));

    let peak = sorted[0].close;
    let maxDD = 0;
    let maxDDDate = sorted[0].date;
    let maxDDPeakDate = sorted[0].date;
    let currentPeak = sorted[0].close;
    let currentPeakDate = sorted[0].date;

    for (const p of sorted) {
      if (p.close > peak) {
        peak = p.close;
        currentPeakDate = p.date;
      }
      const dd = ((p.close - peak) / peak) * 100;
      if (dd < maxDD) {
        maxDD = dd;
        maxDDDate = p.date;
        maxDDPeakDate = currentPeakDate;
      }
      if (p.close > currentPeak) {
        currentPeak = p.close;
      }
    }

    // Current drawdown from ATH in our dataset
    const ath = Math.max(...sorted.map(p => p.close), quote.price);
    const currentDD = ((quote.price - ath) / ath) * 100;

    // Recovery: days since last ATH
    const athDate = sorted.reduce((best, p) => p.close >= best.close ? p : best, sorted[0]).date;
    const daysSinceATH = Math.floor((Date.now() - new Date(athDate + "T12:00:00").getTime()) / 86400000);

    // Average recovery time: count drawdown-to-recovery cycles
    let inDD = false;
    let ddStart = 0;
    const recoveryDays: number[] = [];
    let runPeak = sorted[0].close;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].close > runPeak) runPeak = sorted[i].close;
      const dd = ((sorted[i].close - runPeak) / runPeak) * 100;
      if (dd < -5 && !inDD) { inDD = true; ddStart = i; }
      if (inDD && sorted[i].close >= runPeak) {
        recoveryDays.push(i - ddStart);
        inDD = false;
      }
    }
    const avgRecovery = recoveryDays.length > 0
      ? Math.round(recoveryDays.reduce((a, b) => a + b, 0) / recoveryDays.length)
      : null;

    return { maxDD, maxDDDate, maxDDPeakDate, currentDD, ath, daysSinceATH, avgRecovery };
  }, [historicalPrices, quote]);

  // ── Investment Return Calculator ──
  const investmentReturns = useMemo(() => {
    if (historicalPrices.length < 252 || !quote) return null;
    const sorted = [...historicalPrices].sort((a, b) => b.date.localeCompare(a.date));
    const cur = quote.price;

    const periods = [
      { label: "1 Year", days: 252 },
      { label: "2 Years", days: 504 },
      { label: "3 Years", days: 756 },
      { label: "5 Years", days: 1260 },
    ];

    return periods.map(({ label, days }) => {
      if (sorted.length < days) return null;
      const pastPrice = sorted[Math.min(days - 1, sorted.length - 1)].close;
      if (pastPrice <= 0) return null;
      const returnPct = ((cur - pastPrice) / pastPrice) * 100;
      const $1000value = 1000 * (cur / pastPrice);
      const annualized = (Math.pow(cur / pastPrice, 252 / days) - 1) * 100;
      return { label, pastPrice, returnPct, $1000value, annualized };
    }).filter(Boolean) as { label: string; pastPrice: number; returnPct: number; $1000value: number; annualized: number }[];
  }, [historicalPrices, quote]);

  // ── What-If Trade Planner ──
  const [tradeEntry, setTradeEntry] = useState<string>("");
  const [tradeTarget, setTradeTarget] = useState<string>("");
  const [tradeStop, setTradeStop] = useState<string>("");
  const [tradeSize, setTradeSize] = useState<string>("1");
  const tradeAnalysis = useMemo(() => {
    const entry = parseFloat(tradeEntry) || (quote?.price ?? 0);
    const target = parseFloat(tradeTarget);
    const stop = parseFloat(tradeStop);
    const size = parseFloat(tradeSize) || 1;
    if (!entry || !target || !stop || entry <= 0) return null;

    const reward = (target - entry) * size;
    const risk = (entry - stop) * size;
    const rrRatio = risk !== 0 ? Math.abs(reward / risk) : 0;
    const rewardPct = ((target - entry) / entry) * 100;
    const riskPct = ((entry - stop) / entry) * 100;
    const isLong = target > entry;

    return { entry, target, stop, size, reward, risk, rrRatio, rewardPct, riskPct, isLong };
  }, [tradeEntry, tradeTarget, tradeStop, tradeSize, quote]);

  // ── Sticky nav active section tracking ──
  const [activeSection, setActiveSection] = useState("overview");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const setSectionRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el;
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [quote]); // re-observe when data loads

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
  const athDistance = quote.high52w > 0 ? ((quote.price - quote.high52w) / quote.high52w) * 100 : null;
  const marketStatus = getMarketStatus();

  // All MA signals (7 indicators — API-sourced SMA 50/200 preferred over quote data)
  const allMAs = [
    technicals?.ema9 ? { label: "EMA 9", value: technicals.ema9, above: quote.price > technicals.ema9 } : null,
    technicals?.ema21 ? { label: "EMA 21", value: technicals.ema21, above: quote.price > technicals.ema21 } : null,
    technicals?.ema50 ? { label: "EMA 50", value: technicals.ema50, above: quote.price > technicals.ema50 } : null,
    technicals?.sma20 ? { label: "SMA 20", value: technicals.sma20, above: quote.price > technicals.sma20 } : null,
    (technicals?.sma50 ?? quote.priceAvg50) ? { label: "SMA 50", value: technicals?.sma50 ?? quote.priceAvg50, above: quote.price > (technicals?.sma50 ?? quote.priceAvg50) } : null,
    (technicals?.sma200 ?? quote.priceAvg200) ? { label: "SMA 200", value: technicals?.sma200 ?? quote.priceAvg200, above: quote.price > (technicals?.sma200 ?? quote.priceAvg200) } : null,
  ].filter(Boolean) as { label: string; value: number; above: boolean }[];

  const maBuyCount = allMAs.filter(s => s.above).length;
  const maSellCount = allMAs.filter(s => !s.above).length;

  // RSI (daily + 4-hour)
  const rsi = technicals?.rsi14;
  const rsi4h = technicals?.rsi4h;
  const rsiLabel = rsi == null ? null : rsi >= 70 ? "Overbought" : rsi <= 30 ? "Oversold" : "Neutral";
  const rsi4hLabel = rsi4h == null ? null : rsi4h >= 70 ? "Overbought" : rsi4h <= 30 ? "Oversold" : "Neutral";

  // Technical summary score
  let techScore = 0;
  let techSignals = 0;
  for (const ma of allMAs) { techSignals++; techScore += ma.above ? 1 : -1; }
  if (rsi != null) { techSignals++; if (rsi > 70) techScore -= 1; else if (rsi < 30) techScore += 1; }
  if (rsi4h != null) { techSignals++; if (rsi4h > 70) techScore -= 1; else if (rsi4h < 30) techScore += 1; }
  const techPct = techSignals > 0 ? techScore / techSignals : 0;
  const summaryLabel = techPct >= 0.6 ? "Strong Buy" : techPct >= 0.2 ? "Buy" : techPct <= -0.6 ? "Strong Sell" : techPct <= -0.2 ? "Sell" : "Neutral";
  const summaryColor = summaryLabel.includes("Buy") ? "text-positive" : summaryLabel.includes("Sell") ? "text-negative" : "text-muted-foreground";

  // Gold/Silver ratio
  const otherMetal = technicals?.otherMetal;
  const metalRatio = otherMetal && otherMetal.price > 0 && symbol === "XAUUSD"
    ? quote.price / otherMetal.price
    : otherMetal && otherMetal.price > 0 && symbol === "XAGUSD"
      ? otherMetal.price / quote.price
      : null;

  // Bollinger band position
  const bbPosition = bollingerBands
    ? quote.price >= bollingerBands.upper ? "Above Upper Band" :
      quote.price <= bollingerBands.lower ? "Below Lower Band" :
      quote.price > bollingerBands.middle ? "Upper Half" : "Lower Half"
    : null;

  const navItems = [
    { id: "overview", label: "Overview" },
    { id: "technicals", label: "Technicals" },
    { id: "chart", label: "Chart" },
    { id: "tools", label: "Tools" },
    { id: "market", label: "Market" },
    { id: "news", label: "News" },
  ];

  return (
    <div className="space-y-6">
      {/* ─── STICKY SECTION NAV ─────────────────────────── */}
      <div className="sticky top-[64px] z-30 -mx-1 px-1 py-1">
        <nav className="flex items-center gap-1 rounded-xl border border-border/40 bg-card/80 backdrop-blur-lg px-2 py-1.5 shadow-sm overflow-x-auto scrollbar-hide">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => sectionRefs.current[item.id]?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                activeSection === item.id
                  ? "bg-brand/10 text-brand shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ─── HERO PRICE CARD ──────────────────────────────── */}
      <div id="overview" ref={setSectionRef("overview")} className="rounded-2xl border border-border/50 bg-card overflow-hidden scroll-mt-28">
        <div className="p-5 sm:p-7">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Left: Price */}
            <div className="flex-1 min-w-0">
              {/* Status row */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="relative flex h-2 w-2">
                  {marketStatus.open && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-positive opacity-75" />}
                  <span className={cn("relative inline-flex rounded-full h-2 w-2", marketStatus.open ? "bg-positive" : "bg-muted-foreground/40")} />
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  Live &middot; {updatedAt}
                </span>
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded",
                  marketStatus.open ? "bg-positive/10 text-positive" : "bg-muted-foreground/10 text-muted-foreground"
                )}>
                  Market {marketStatus.label}
                </span>
                {athDistance != null && athDistance < 0 && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-info/10 text-info">
                    {athDistance.toFixed(1)}% from 52w High
                  </span>
                )}
                {athDistance != null && athDistance >= 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-warning/10 text-warning">
                    52w High!
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-4 flex-wrap">
                <span className={cn(
                  "text-4xl sm:text-5xl font-bold font-display tabular-nums tracking-tight transition-colors duration-700",
                  priceFlash === "up" ? "text-positive" : priceFlash === "down" ? "text-negative" : "text-foreground"
                )}>
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
                {volatility != null && (
                  <>
                    <span className="text-border">|</span>
                    <span className="text-[11px] font-medium text-muted-foreground/60">
                      Vol: <span className={cn("font-bold", volatility > 25 ? "text-warning" : "text-foreground/60")}>{volatility.toFixed(1)}%</span>
                    </span>
                  </>
                )}
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

      {/* ─── AI TECHNICAL SUMMARY ────────────────────────── */}
      {aiSummary && (
        <div className="rounded-2xl border border-brand/20 bg-gradient-to-r from-brand/5 via-card to-card overflow-hidden">
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="shrink-0 flex items-center justify-center size-8 rounded-lg bg-brand/10">
                <svg className="size-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.4V11h3a3 3 0 0 1 3 3v1a2 2 0 0 1-2 2h-1v2a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3v-2H6a2 2 0 0 1-2-2v-1a3 3 0 0 1 3-3h3V9.4C8.8 8.8 8 7.5 8 6a4 4 0 0 1 4-4z" /></svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <h3 className="text-sm font-semibold text-foreground">AI Market Summary</h3>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand/10 text-brand uppercase tracking-wider">Auto-generated</span>
                  {aiAction && (
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full",
                      aiAction.action.includes("Buy") ? "bg-positive/15 text-positive" :
                      aiAction.action.includes("Sell") ? "bg-negative/15 text-negative" :
                      "bg-muted-foreground/10 text-muted-foreground"
                    )}>
                      {aiAction.action} &middot; {aiAction.confidence}% confidence
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{aiSummary}</p>
              </div>
            </div>

            {/* Trend + EMA Ribbon row */}
            {trendAnalysis && (
              <div className="mt-4 pt-4 border-t border-border/20 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Trend Strength */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">Trend Strength</span>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs font-bold",
                        trendAnalysis.strength >= 0.6 ? "text-positive" : trendAnalysis.strength <= 0.4 ? "text-negative" : "text-muted-foreground"
                      )}>
                        {trendAnalysis.trendLabel}
                      </span>
                      {trendAnalysis.crossType && (
                        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded",
                          trendAnalysis.crossType === "golden" ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"
                        )}>
                          {trendAnalysis.crossType === "golden" ? "Golden Cross" : "Death Cross"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500",
                        trendAnalysis.strength >= 0.6 ? "bg-positive" : trendAnalysis.strength <= 0.4 ? "bg-negative" : "bg-muted-foreground/40"
                      )}
                      style={{ width: `${trendAnalysis.strength * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-negative/60">Bearish</span>
                    <span className="text-[9px] text-positive/60">Bullish</span>
                  </div>
                </div>

                {/* EMA Ribbon Visual */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">MA Alignment</span>
                    <span className={cn("text-[10px] font-bold",
                      trendAnalysis.emaRibbonBullish ? "text-positive" : trendAnalysis.emaRibbonBearish ? "text-negative" : "text-muted-foreground"
                    )}>
                      {trendAnalysis.emaRibbonBullish ? "Bullish Ribbon" : trendAnalysis.emaRibbonBearish ? "Bearish Ribbon" : "Mixed"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {allMAs.map((ma) => (
                      <div key={ma.label} className="flex-1 group relative">
                        <div className={cn("h-5 rounded-sm transition-colors",
                          ma.above ? "bg-positive/25" : "bg-negative/25"
                        )} />
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[8px] text-muted-foreground">{ma.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-5">
                    <span className="text-[9px] text-muted-foreground/40">Short-term</span>
                    <span className="text-[9px] text-muted-foreground/40">Long-term</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Multi-timeframe signal strip */}
          {rsi != null && rsi4h != null && (
            <div className="bg-secondary/30 border-t border-border/20 px-5 sm:px-6 py-3 flex items-center gap-6 flex-wrap">
              <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">Signals</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">RSI Daily</span>
                <span className={cn("text-[10px] font-bold tabular-nums",
                  rsi >= 70 ? "text-negative" : rsi <= 30 ? "text-positive" : "text-foreground"
                )}>{rsi.toFixed(1)}</span>
                <span className={cn("text-[9px] font-bold px-1.5 py-px rounded",
                  rsi >= 70 ? "bg-negative/10 text-negative" : rsi <= 30 ? "bg-positive/10 text-positive" : "bg-muted-foreground/10 text-muted-foreground"
                )}>{rsiLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">RSI 4H</span>
                <span className={cn("text-[10px] font-bold tabular-nums",
                  rsi4h >= 70 ? "text-negative" : rsi4h <= 30 ? "text-positive" : "text-foreground"
                )}>{rsi4h.toFixed(1)}</span>
                <span className={cn("text-[9px] font-bold px-1.5 py-px rounded",
                  rsi4h >= 70 ? "bg-negative/10 text-negative" : rsi4h <= 30 ? "bg-positive/10 text-positive" : "bg-muted-foreground/10 text-muted-foreground"
                )}>{rsi4hLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">MAs</span>
                <span className="text-[10px] font-bold text-positive">{maBuyCount} Buy</span>
                <span className="text-muted-foreground/30">|</span>
                <span className="text-[10px] font-bold text-negative">{maSellCount} Sell</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TECHNICAL ANALYSIS PANEL (3-col) ─────────────── */}
      {(rsi != null || allMAs.length > 0) && (
        <div id="technicals" ref={setSectionRef("technicals")} className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6 scroll-mt-28">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <svg className="size-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" /><path strokeLinecap="round" strokeLinejoin="round" d="M7 16l4-8 4 4 5-9" /></svg>
              Technical Analysis
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Col 1: Summary Gauge */}
            <div className="flex flex-col items-center">
              <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-3">Summary</p>
              <SummaryGauge score={techScore} maxScore={techSignals} />
              <p className={cn("text-lg font-bold mt-2", summaryColor)}>{summaryLabel}</p>
              <div className="flex items-center gap-3 mt-2 text-[11px]">
                <span className="text-positive font-medium">{maBuyCount + (rsi != null && rsi < 30 ? 1 : 0) + (rsi4h != null && rsi4h < 30 ? 1 : 0)} Buy</span>
                <span className="text-muted-foreground">{(rsi != null && rsi >= 30 && rsi <= 70 ? 1 : 0) + (rsi4h != null && rsi4h >= 30 && rsi4h <= 70 ? 1 : 0)} Neutral</span>
                <span className="text-negative font-medium">{maSellCount + (rsi != null && rsi > 70 ? 1 : 0) + (rsi4h != null && rsi4h > 70 ? 1 : 0)} Sell</span>
              </div>
            </div>

            {/* Col 2: Oscillators */}
            <div>
              <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-3">Oscillators</p>
              {rsi != null && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">RSI (14)</p>
                  <RSIGauge value={rsi} />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-positive font-medium">Oversold &lt;30</span>
                    <span className={cn(
                      "text-sm font-bold tabular-nums",
                      rsi >= 70 ? "text-negative" : rsi <= 30 ? "text-positive" : "text-foreground"
                    )}>
                      {rsi.toFixed(1)}
                      <span className="text-xs font-medium text-muted-foreground ml-1">{rsiLabel}</span>
                    </span>
                    <span className="text-[10px] text-negative font-medium">Overbought &gt;70</span>
                  </div>
                  {/* RSI 4-hour */}
                  {rsi4h != null && (
                    <div className="mt-4 pt-3 border-t border-border/10">
                      <p className="text-xs font-medium text-muted-foreground mb-2">RSI 4H (14)</p>
                      <RSIGauge value={rsi4h} />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-positive font-medium">Oversold</span>
                        <span className={cn(
                          "text-sm font-bold tabular-nums",
                          rsi4h >= 70 ? "text-negative" : rsi4h <= 30 ? "text-positive" : "text-foreground"
                        )}>
                          {rsi4h.toFixed(1)}
                          <span className="text-xs font-medium text-muted-foreground ml-1">{rsi4hLabel}</span>
                        </span>
                        <span className="text-[10px] text-negative font-medium">Overbought</span>
                      </div>
                    </div>
                  )}
                  {/* Bollinger Band context */}
                  {bollingerBands && (
                    <div className="mt-4 pt-3 border-t border-border/10">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Bollinger Bands (20, 2)</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Upper</span>
                          <span className="font-medium tabular-nums">{fmtPrice(bollingerBands.upper)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Middle</span>
                          <span className="font-medium tabular-nums">{fmtPrice(bollingerBands.middle)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Lower</span>
                          <span className="font-medium tabular-nums">{fmtPrice(bollingerBands.lower)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="text-muted-foreground">Position</span>
                          <span className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded",
                            bbPosition === "Above Upper Band" ? "bg-negative/10 text-negative" :
                            bbPosition === "Below Lower Band" ? "bg-positive/10 text-positive" :
                            "bg-muted-foreground/10 text-muted-foreground"
                          )}>{bbPosition}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Col 3: Moving Averages */}
            <div>
              <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-3">Moving Averages</p>
              {allMAs.length > 0 && (
                <div className="space-y-0">
                  {allMAs.map((s) => (
                    <div key={s.label} className="flex items-center justify-between py-2 border-b border-border/10 last:border-0">
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium tabular-nums text-foreground/80">{fmtPrice(s.value)}</span>
                        <span className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded",
                          s.above ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"
                        )}>
                          {s.above ? "BUY" : "SELL"}
                        </span>
                      </div>
                    </div>
                  ))}
                  {/* MA Summary */}
                  <div className="flex items-center justify-between pt-2.5 mt-0.5">
                    <span className="text-[11px] font-semibold text-foreground">Summary</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-positive">{maBuyCount} Buy</span>
                      <span className="text-muted-foreground/30">|</span>
                      <span className="text-[10px] font-bold text-negative">{maSellCount} Sell</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MACD + STOCHASTIC + ATR (2nd oscillator row) ─── */}
      {(macdData || stochastic || atr) && (
        <div className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
            <svg className="size-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
            Momentum Indicators
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* MACD */}
            {macdData && (
              <div>
                <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-3">MACD (12, 26, 9)</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">MACD Line</span>
                    <span className={cn("font-bold tabular-nums", macdData.macd >= 0 ? "text-positive" : "text-negative")}>
                      {macdData.macd.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Signal Line</span>
                    <span className="font-medium tabular-nums text-foreground/80">{macdData.signal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Histogram</span>
                    <span className={cn("font-bold tabular-nums", macdData.histogram >= 0 ? "text-positive" : "text-negative")}>
                      {macdData.histogram >= 0 ? "+" : ""}{macdData.histogram.toFixed(2)}
                    </span>
                  </div>
                  {/* Visual histogram bar */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden flex justify-center">
                      <div className={cn("h-full rounded-full transition-all", macdData.histogram >= 0 ? "bg-positive" : "bg-negative")}
                        style={{ width: `${Math.min(Math.abs(macdData.histogram) / (Math.abs(macdData.macd) || 1) * 50, 100)}%` }}
                      />
                    </div>
                  </div>
                  {macdData.crossover && (
                    <div className={cn("mt-2 text-[10px] font-bold px-2 py-1 rounded text-center",
                      macdData.crossover === "bullish" ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"
                    )}>
                      {macdData.crossover === "bullish" ? "Bullish Crossover" : "Bearish Crossover"}
                    </div>
                  )}
                  {!macdData.crossover && (
                    <div className={cn("mt-2 text-[10px] font-bold px-2 py-1 rounded text-center",
                      macdData.histogram >= 0 ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"
                    )}>
                      {macdData.histogram >= 0 ? "Bullish Momentum" : "Bearish Momentum"}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stochastic Oscillator */}
            {stochastic && (
              <div>
                <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-3">Stochastic (14, 3, 3)</p>
                <StochasticGauge k={stochastic.k} d={stochastic.d} />
                <div className="space-y-2 mt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">%K</span>
                    <span className={cn("font-bold tabular-nums",
                      stochastic.k >= 80 ? "text-negative" : stochastic.k <= 20 ? "text-positive" : "text-foreground"
                    )}>{stochastic.k.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">%D</span>
                    <span className="font-medium tabular-nums text-foreground/80">{stochastic.d.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Signal</span>
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded",
                      stochastic.label === "Overbought" ? "bg-negative/10 text-negative" :
                      stochastic.label === "Oversold" ? "bg-positive/10 text-positive" :
                      "bg-muted-foreground/10 text-muted-foreground"
                    )}>{stochastic.label}</span>
                  </div>
                  {stochastic.k > stochastic.d && stochastic.k < 80 && (
                    <p className="text-[10px] text-positive/70 mt-1">%K above %D — bullish momentum</p>
                  )}
                  {stochastic.k < stochastic.d && stochastic.k > 20 && (
                    <p className="text-[10px] text-negative/70 mt-1">%K below %D — bearish momentum</p>
                  )}
                </div>
              </div>
            )}

            {/* ATR + Risk Metrics */}
            {atr && (
              <div>
                <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-3">Risk Metrics</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">ATR (14)</span>
                    <span className="font-bold tabular-nums text-foreground">{fmtPrice(atr.value)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">ATR %</span>
                    <span className={cn("font-bold tabular-nums",
                      atr.percent > 2 ? "text-warning" : "text-foreground/70"
                    )}>{atr.percent.toFixed(2)}%</span>
                  </div>
                  {volatility != null && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Volatility (Ann.)</span>
                      <span className={cn("font-bold tabular-nums",
                        volatility > 25 ? "text-warning" : "text-foreground/70"
                      )}>{volatility.toFixed(1)}%</span>
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t border-border/10">
                    <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-2">Daily Range Estimate</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-negative tabular-nums font-medium">{fmtPrice(quote.price - atr.value)}</span>
                      <span className="text-[9px] text-muted-foreground/40">ATR Range</span>
                      <span className="text-positive tabular-nums font-medium">{fmtPrice(quote.price + atr.value)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-negative/20 via-secondary to-positive/20 mt-1.5 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-foreground border border-background" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── FIBONACCI RETRACEMENT ─────────────────────────── */}
      {fibLevels && (
        <div className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <svg className="size-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M4 20h16M4 4l8 16L20 4" /></svg>
              Fibonacci Retracement
              <span className="text-[9px] font-medium text-muted-foreground/50 ml-1">(52-week)</span>
            </h3>
          </div>
          <FibonacciChart levels={fibLevels} currentPrice={quote.price} high52w={quote.high52w} low52w={quote.low52w} />
        </div>
      )}

      {/* ─── PIVOT POINTS + KEY LEVELS ─────────────────────── */}
      {pivots && (
        <div className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Support & Resistance (Pivot Points)</h3>
          <PivotLevels pivots={pivots} currentPrice={quote.price} />
        </div>
      )}

      {/* ─── PRICE CHART ──────────────────────────────────── */}
      <div id="chart" ref={setSectionRef("chart")} className="scroll-mt-28">
        {historicalPrices.length > 0 && (
          <PriceChart prices={historicalPrices} ticker={symbol} intradayPrices={intradayPrices.length > 0 ? intradayPrices : undefined} />
        )}
      </div>

      {/* ─── 3-COLUMN: Stats / Performance / Ratio+Units ──── */}
      <div id="tools" ref={setSectionRef("tools")} className="grid grid-cols-1 lg:grid-cols-3 gap-6 scroll-mt-28">
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
            {volatility != null && (
              <StatRow label="Volatility (Ann.)" value={`${volatility.toFixed(1)}%`} />
            )}
          </div>
        </div>

        {/* Performance Heatmap */}
        <div className="rounded-2xl border border-border/50 bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Performance</h3>
          {performance ? (
            <div className="space-y-2">
              {/* Heatmap grid */}
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(performance) as [string, number | null][]).map(([period, pct]) => {
                  if (pct == null) return null;
                  const pos = pct >= 0;
                  const intensity = Math.min(Math.abs(pct) / 50, 1); // normalize to 50% max
                  return (
                    <div
                      key={period}
                      className="rounded-lg p-3 text-center transition-colors"
                      style={{
                        backgroundColor: pos
                          ? `rgba(74, 222, 128, ${0.06 + intensity * 0.18})`
                          : `rgba(248, 113, 113, ${0.06 + intensity * 0.18})`,
                      }}
                    >
                      <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-1">{period}</p>
                      <p className={cn("text-sm font-bold tabular-nums", pos ? "text-positive" : "text-negative")}>
                        {pos ? "+" : ""}{pct.toFixed(1)}%
                      </p>
                    </div>
                  );
                })}
              </div>
              {/* Key Psychological Levels */}
              {keyLevels.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/20">
                  <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-2">Key Price Levels</p>
                  <div className="space-y-0">
                    {keyLevels.map((lvl) => {
                      const dist = ((quote.price - lvl.price) / lvl.price) * 100;
                      return (
                        <div key={lvl.price} className="flex items-center justify-between py-1.5">
                          <div className="flex items-center gap-2">
                            <span className={cn("w-1.5 h-1.5 rounded-full",
                              lvl.type === "resistance" ? "bg-negative/60" : lvl.type === "support" ? "bg-positive/60" : "bg-brand"
                            )} />
                            <span className="text-xs tabular-nums font-medium text-foreground">{lvl.label}</span>
                          </div>
                          <span className={cn("text-[10px] font-bold tabular-nums",
                            dist > 0 ? "text-positive" : dist < 0 ? "text-negative" : "text-brand"
                          )}>
                            {dist > 0 ? "+" : ""}{dist.toFixed(2)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground/50">Loading...</p>
          )}
        </div>

        {/* Metal Ratio + Unit Prices */}
        <div className="space-y-6">
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
                    : "Within the historical average range (50\u201380)."}
              </p>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/20">
                <Link href={`/stocks/${otherMetal.symbol.toLowerCase()}`} className="text-xs font-medium text-brand hover:underline">
                  View {otherMetal.symbol === "XAUUSD" ? "Gold" : "Silver"} &rarr;
                </Link>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {fmtPrice(otherMetal.price)}
                  <span className={cn("ml-1", otherMetal.changePercent >= 0 ? "text-positive" : "text-negative")}>
                    {otherMetal.changePercent >= 0 ? "+" : ""}{otherMetal.changePercent.toFixed(2)}%
                  </span>
                </span>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <svg className="size-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M12 12h.01M17 12h.01M7 12h.01" /></svg>
              {shortName} Calculator
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={calcGrams}
                    onChange={(e) => setCalcGrams(e.target.value)}
                    className="w-full rounded-lg border border-border/50 bg-secondary/30 px-3 py-2.5 text-sm font-medium tabular-nums text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50"
                    min="0"
                    step="0.1"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">grams</span>
                </div>
                <span className="text-muted-foreground/30">=</span>
                <div className="flex-1 rounded-lg bg-brand/5 border border-brand/10 px-3 py-2.5 text-center">
                  <span className="text-sm font-bold tabular-nums text-foreground">
                    {calcValue != null ? fmtPrice(calcValue) : "—"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[1, 10, 50, 100].map((g) => (
                  <button
                    key={g}
                    onClick={() => setCalcGrams(String(g))}
                    className={cn(
                      "text-[10px] font-medium py-1.5 rounded transition-colors",
                      calcGrams === String(g) ? "bg-brand/10 text-brand" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    {g}g
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-0 mt-3 pt-3 border-t border-border/20">
              <StatRow label="Per Troy Oz" value={fmtPrice(quote.price)} />
              <StatRow label="Per Gram" value={fmtPrice(perGram)} />
              <StatRow label="Per Kilogram" value={fmtPrice(perKg)} />
              <StatRow label="Per Tola (11.66g)" value={fmtPrice(quote.price * 0.375)} />
            </div>
          </div>

          {/* Position Size Calculator */}
          {atr && (
            <div className="rounded-2xl border border-border/50 bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <svg className="size-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M12 6v6l4 2" /></svg>
                Position Sizer
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Portfolio Value ($)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={riskCapital}
                    onChange={(e) => setRiskCapital(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-border/50 bg-secondary/30 px-3 py-2 text-sm font-medium tabular-nums text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Risk per Trade (%)</label>
                  <div className="flex gap-1 mt-1">
                    {["1", "2", "3", "5"].map((p) => (
                      <button
                        key={p}
                        onClick={() => setRiskPercent(p)}
                        className={cn("flex-1 text-[10px] font-medium py-1.5 rounded transition-colors",
                          riskPercent === p ? "bg-brand/10 text-brand" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                        )}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                </div>
                {positionSize && (
                  <div className="mt-2 pt-3 border-t border-border/20 space-y-0">
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-xs text-muted-foreground">Risk Amount</span>
                      <span className="text-xs font-bold tabular-nums text-warning">{fmtPrice(positionSize.riskAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-xs text-muted-foreground">Stop Loss (1.5x ATR)</span>
                      <span className="text-xs font-bold tabular-nums text-negative">{fmtPrice(positionSize.stopPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-xs text-muted-foreground">Position Size</span>
                      <span className="text-xs font-bold tabular-nums text-foreground">{positionSize.units.toFixed(2)} oz</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-xs text-muted-foreground">Position Value</span>
                      <span className="text-xs font-bold tabular-nums text-brand">{fmtPrice(positionSize.positionValue)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── MARKET CONTEXT (Currencies, VIX, SPY, Events) ── */}
      {context && (
        <div id="market" ref={setSectionRef("market")} className="grid grid-cols-1 lg:grid-cols-3 gap-6 scroll-mt-28">
          {/* Currency Conversions */}
          {context.currencies && Object.keys(context.currencies).length > 0 && (
            <div className="rounded-2xl border border-border/50 bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <svg className="size-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                {shortName} in Other Currencies
              </h3>
              <div className="space-y-0">
                {Object.entries(context.currencies).map(([code, fx]) => {
                  // EURUSD/GBPUSD: divide. USDJPY/USDCHF: multiply
                  const converted = (code === "JPY" || code === "CHF")
                    ? quote.price * fx.rate
                    : quote.price / fx.rate;
                  const currencySymbol = code === "EUR" ? "\u20AC" : code === "GBP" ? "\u00A3" : code === "JPY" ? "\u00A5" : code === "CHF" ? "CHF " : "";
                  return (
                    <div key={code} className="flex items-center justify-between py-2.5 border-b border-border/10 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground w-8">{code}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold tabular-nums text-foreground">
                          {currencySymbol}{converted.toLocaleString("en-US", { minimumFractionDigits: code === "JPY" ? 0 : 2, maximumFractionDigits: code === "JPY" ? 0 : 2 })}
                        </span>
                        <span className={cn("text-[10px] font-bold tabular-nums", fx.change >= 0 ? "text-positive" : "text-negative")}>
                          {fx.change >= 0 ? "+" : ""}{fx.change.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground/40 mt-3">FX change = USD pair change, not commodity change</p>
            </div>
          )}

          {/* VIX + SPY */}
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <svg className="size-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              Market Context
            </h3>
            <div className="space-y-4">
              {context.vix && (
                <div className="p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">VIX (Fear Index)</span>
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded",
                      context.vix.price >= 30 ? "bg-negative/10 text-negative" :
                      context.vix.price >= 20 ? "bg-warning/10 text-warning" :
                      "bg-positive/10 text-positive"
                    )}>
                      {context.vix.price >= 30 ? "High Fear" : context.vix.price >= 20 ? "Elevated" : "Low Vol"}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold font-display tabular-nums">{context.vix.price.toFixed(2)}</span>
                    <span className={cn("text-xs font-bold tabular-nums", context.vix.changePercent >= 0 ? "text-negative" : "text-positive")}>
                      {context.vix.changePercent >= 0 ? "+" : ""}{context.vix.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/50 mt-1">High VIX often bullish for {shortName} as safe-haven demand rises</p>
                </div>
              )}
              {context.spy && (
                <div className="p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">S&P 500 (SPY)</span>
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded",
                      context.spy.changePercent >= 0 ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"
                    )}>
                      {context.spy.changePercent >= 0 ? "Risk-On" : "Risk-Off"}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold font-display tabular-nums">${context.spy.price.toFixed(2)}</span>
                    <span className={cn("text-xs font-bold tabular-nums", context.spy.changePercent >= 0 ? "text-positive" : "text-negative")}>
                      {context.spy.changePercent >= 0 ? "+" : ""}{context.spy.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/50 mt-1">{shortName} often moves inversely to equities in risk-off environments</p>
                </div>
              )}
              {metalRatio != null && (
                <div className="flex items-center justify-between py-2 text-xs">
                  <span className="text-muted-foreground">Gold/Silver Ratio</span>
                  <span className="font-bold tabular-nums">{metalRatio.toFixed(1)} : 1</span>
                </div>
              )}
              {/* Correlation Insights */}
              {correlationInsight && correlationInsight.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/20">
                  <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-2">Correlation Insights</p>
                  <div className="space-y-2">
                    {correlationInsight.map((insight, i) => (
                      <p key={i} className="text-[11px] text-muted-foreground/70 leading-relaxed">{insight}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Economic Events */}
          {context.economicEvents && context.economicEvents.length > 0 && (
            <div className="rounded-2xl border border-border/50 bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <svg className="size-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                Economic Calendar
              </h3>
              <div className="space-y-0 max-h-72 overflow-y-auto">
                {context.economicEvents.map((evt, i) => (
                  <div key={i} className="flex items-start gap-3 py-2.5 border-b border-border/10 last:border-0">
                    <div className="shrink-0 text-center w-11">
                      <p className="text-[10px] font-bold text-brand">{new Date(evt.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground leading-snug line-clamp-2">{evt.event}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn("text-[9px] font-bold px-1 py-px rounded",
                          evt.impact === "High" ? "bg-negative/10 text-negative" : "bg-warning/10 text-warning"
                        )}>{evt.impact}</span>
                        {evt.estimate != null && (
                          <span className="text-[10px] text-muted-foreground tabular-nums">Est: {evt.estimate}</span>
                        )}
                        {evt.previous != null && (
                          <span className="text-[10px] text-muted-foreground/50 tabular-nums">Prev: {evt.previous}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── SEASONAL ANALYSIS ──────────────────────────── */}
      {seasonalData && (
        <div className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <svg className="size-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
              Seasonal Pattern
              <span className="text-[9px] font-medium text-muted-foreground/50 ml-1">(5yr avg)</span>
            </h3>
            <span className="text-[10px] text-muted-foreground/50">Average monthly return from historical data</span>
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
            {seasonalData.map((m, i) => {
              const isPos = m.avgReturn >= 0;
              const intensity = Math.min(Math.abs(m.avgReturn) / 4, 1);
              const isCurrent = i === currentMonth;
              return (
                <div
                  key={m.name}
                  className={cn(
                    "rounded-lg p-2 text-center transition-all",
                    isCurrent && "ring-2 ring-brand/40"
                  )}
                  style={{
                    backgroundColor: isPos
                      ? `rgba(74, 222, 128, ${0.04 + intensity * 0.2})`
                      : `rgba(248, 113, 113, ${0.04 + intensity * 0.2})`,
                  }}
                >
                  <p className={cn("text-[10px] font-bold uppercase", isCurrent ? "text-brand" : "text-muted-foreground/60")}>{m.name}</p>
                  <p className={cn("text-xs font-bold tabular-nums mt-0.5", isPos ? "text-positive" : "text-negative")}>
                    {isPos ? "+" : ""}{m.avgReturn.toFixed(1)}%
                  </p>
                  <p className="text-[8px] text-muted-foreground/40 mt-0.5">{m.positive.toFixed(0)}% pos</p>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground/40 mt-3">
            Based on daily returns grouped by calendar month. Current month highlighted. Past performance does not guarantee future results.
          </p>
        </div>
      )}

      {/* ─── LATEST NEWS (Featured Layout) ─────────────────── */}
      {technicals?.news && technicals.news.length > 0 && (
        <div id="news" ref={setSectionRef("news")} className="scroll-mt-28">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Latest {shortName} News
          </h2>
          <div className="space-y-4">
            {/* Featured first article */}
            {technicals.news[0] && (
              <a
                href={technicals.news[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col sm:flex-row rounded-xl border border-border/50 bg-card overflow-hidden transition-all duration-200 hover:border-brand/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/5"
              >
                {technicals.news[0].image && (
                  <div className="sm:w-80 shrink-0 aspect-[16/9] sm:aspect-auto overflow-hidden bg-secondary">
                    <img
                      src={technicals.news[0].image}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-5 flex flex-col justify-center min-w-0">
                  <h3 className="text-base font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-brand transition-colors">
                    {technicals.news[0].title}
                  </h3>
                  <p className="text-sm text-muted-foreground/70 mt-2 line-clamp-3 leading-relaxed">
                    {technicals.news[0].text}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-[11px] font-medium text-muted-foreground/50">{technicals.news[0].source}</span>
                    <span className="text-[11px] text-muted-foreground/40">{newsTimeAgo(technicals.news[0].publishedDate)}</span>
                  </div>
                </div>
              </a>
            )}

            {/* Remaining articles in grid */}
            {technicals.news.length > 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {technicals.news.slice(1).map((article, i) => (
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
            )}
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
                    <p className={cn("text-xs font-mono tabular-nums", etfUp ? "text-positive" : "text-negative")}>
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
          <div className={cn("absolute inset-y-0 left-0 rounded-full", fillClass)} style={{ width: `${pct}%` }} />
          <div
            className={cn("absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-background shadow-md", dotClass)}
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

/* ─── Summary Gauge (semicircular meter) ────────────────────── */

function SummaryGauge({ score, maxScore }: { score: number; maxScore: number }) {
  const cx = 60, cy = 56, r = 42;
  const segments = 5;
  const segmentAngle = 180 / segments;
  const colors = ["#ef4444", "#f97316", "#a1a1aa", "#4ade80", "#22c55e"];
  const gap = 4;

  // Needle: map score from [-maxScore, +maxScore] to [180°, 0°]
  const clamped = Math.max(-maxScore, Math.min(maxScore, score));
  const needleAngle = maxScore > 0
    ? 180 - ((clamped + maxScore) / (2 * maxScore)) * 180
    : 90;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleLen = r * 0.62;
  const nx = cx + needleLen * Math.cos(needleRad);
  const ny = cy - needleLen * Math.sin(needleRad);

  function arcPath(startDeg: number, endDeg: number) {
    const s = (startDeg * Math.PI) / 180;
    const e = (endDeg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(s);
    const y1 = cy - r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy - r * Math.sin(e);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 0 ${x2} ${y2}`;
  }

  return (
    <svg viewBox="0 0 120 66" className="w-full max-w-[160px]">
      {colors.map((color, i) => {
        const start = 180 - i * segmentAngle + (i > 0 ? gap / 2 : 0);
        const end = 180 - (i + 1) * segmentAngle - (i < segments - 1 ? gap / 2 : 0);
        return (
          <path
            key={i}
            d={arcPath(start, end)}
            stroke={color}
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
            opacity={0.6}
          />
        );
      })}
      {/* Needle */}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="3" fill="currentColor" />
      {/* Labels */}
      <text x="8" y="64" className="fill-muted-foreground" fontSize="6" textAnchor="start">Sell</text>
      <text x="112" y="64" className="fill-muted-foreground" fontSize="6" textAnchor="end">Buy</text>
    </svg>
  );
}

/* ─── RSI Semicircular Gauge ───────────────────────────────── */

function RSIGauge({ value }: { value: number }) {
  // RSI: 0-100, map to gauge
  // 3 zones: 0-30 (green/oversold), 30-70 (neutral), 70-100 (red/overbought)
  const cx = 70, cy = 48, r = 40;

  // Needle: map 0-100 to 180°-0°
  const needleAngle = 180 - (value / 100) * 180;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleLen = r * 0.6;
  const nx = cx + needleLen * Math.cos(needleRad);
  const ny = cy - needleLen * Math.sin(needleRad);

  function arcPath(startDeg: number, endDeg: number) {
    const s = (startDeg * Math.PI) / 180;
    const e = (endDeg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(s);
    const y1 = cy - r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy - r * Math.sin(e);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 0 ${x2} ${y2}`;
  }

  // Zones: oversold (180-126), neutral (126-54), overbought (54-0)
  // 30% of 180 = 54 degrees per 30-RSI zone, 40% for neutral = 72 degrees
  return (
    <svg viewBox="0 0 140 56" className="w-full max-w-[200px] mx-auto">
      {/* Oversold zone: 180° to 126° (RSI 0-30) */}
      <path d={arcPath(180, 126)} stroke="#4ade80" strokeWidth="6" fill="none" strokeLinecap="round" opacity={0.5} />
      {/* Neutral zone: 126° to 54° (RSI 30-70) */}
      <path d={arcPath(124, 56)} stroke="#a1a1aa" strokeWidth="6" fill="none" strokeLinecap="round" opacity={0.3} />
      {/* Overbought zone: 54° to 0° (RSI 70-100) */}
      <path d={arcPath(54, 0)} stroke="#ef4444" strokeWidth="6" fill="none" strokeLinecap="round" opacity={0.5} />
      {/* Zone markers */}
      {[30, 70].map(v => {
        const a = (180 - (v / 100) * 180) * Math.PI / 180;
        const ix = cx + (r - 10) * Math.cos(a);
        const iy = cy - (r - 10) * Math.sin(a);
        const ox = cx + (r + 4) * Math.cos(a);
        const oy = cy - (r + 4) * Math.sin(a);
        return <line key={v} x1={ix} y1={iy} x2={ox} y2={oy} stroke="currentColor" strokeWidth="1" opacity={0.15} />;
      })}
      {/* Needle */}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="2.5" fill="currentColor" />
    </svg>
  );
}

/* ─── Stochastic Gauge ─────────────────────────────────────── */

function StochasticGauge({ k, d }: { k: number; d: number }) {
  const cx = 70, cy = 48, r = 40;
  const needleAngle = 180 - (k / 100) * 180;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleLen = r * 0.6;
  const nx = cx + needleLen * Math.cos(needleRad);
  const ny = cy - needleLen * Math.sin(needleRad);

  // %D marker
  const dAngle = 180 - (d / 100) * 180;
  const dRad = (dAngle * Math.PI) / 180;
  const dx = cx + (r + 6) * Math.cos(dRad);
  const dy = cy - (r + 6) * Math.sin(dRad);

  function arcPath(startDeg: number, endDeg: number) {
    const s = (startDeg * Math.PI) / 180;
    const e = (endDeg * Math.PI) / 180;
    return `M ${cx + r * Math.cos(s)} ${cy - r * Math.sin(s)} A ${r} ${r} 0 0 0 ${cx + r * Math.cos(e)} ${cy - r * Math.sin(e)}`;
  }

  return (
    <svg viewBox="0 0 140 56" className="w-full max-w-[200px] mx-auto">
      <path d={arcPath(180, 144)} stroke="#4ade80" strokeWidth="6" fill="none" strokeLinecap="round" opacity={0.5} />
      <path d={arcPath(142, 38)} stroke="#a1a1aa" strokeWidth="6" fill="none" strokeLinecap="round" opacity={0.3} />
      <path d={arcPath(36, 0)} stroke="#ef4444" strokeWidth="6" fill="none" strokeLinecap="round" opacity={0.5} />
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="2.5" fill="currentColor" />
      {/* %D marker (small triangle) */}
      <circle cx={dx} cy={dy} r="2" fill="#f59e0b" opacity={0.8} />
      <text x="6" y="52" className="fill-muted-foreground" fontSize="6">20</text>
      <text x="124" y="52" className="fill-muted-foreground" fontSize="6">80</text>
    </svg>
  );
}

/* ─── Fibonacci Chart Visual ──────────────────────────────── */

function FibonacciChart({ levels, currentPrice, high52w, low52w }: {
  levels: { ratio: string; price: number; type: "support" | "resistance" }[];
  currentPrice: number;
  high52w: number;
  low52w: number;
}) {
  const range = high52w - low52w;
  if (range <= 0) return null;

  function pos(price: number) {
    return ((high52w - price) / range) * 100; // inverted: high at top
  }

  const fibColors: Record<string, string> = {
    "0%": "bg-positive/60", "23.6%": "bg-positive/40", "38.2%": "bg-brand/40",
    "50%": "bg-brand/50", "61.8%": "bg-warning/40", "78.6%": "bg-negative/40", "100%": "bg-negative/60",
  };

  return (
    <div className="space-y-4">
      {/* Visual ladder */}
      <div className="relative bg-secondary/30 rounded-lg overflow-hidden" style={{ height: "280px" }}>
        {levels.map((level, i) => {
          const top = pos(level.price);
          return (
            <div key={level.ratio} className="absolute left-0 right-0 flex items-center" style={{ top: `${top}%` }}>
              <div className={cn("h-px flex-1", fibColors[level.ratio] || "bg-border/40")} />
              <div className="absolute left-3 -translate-y-1/2 flex items-center gap-2">
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded",
                  level.type === "support" ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"
                )}>
                  {level.ratio}
                </span>
                <span className="text-xs font-medium tabular-nums text-foreground/80">{fmtPrice(level.price)}</span>
              </div>
            </div>
          );
        })}
        {/* Current price marker */}
        <div className="absolute left-0 right-0 flex items-center z-10" style={{ top: `${pos(currentPrice)}%` }}>
          <div className="h-0.5 flex-1 bg-foreground/60" style={{ backgroundImage: "repeating-linear-gradient(90deg, currentColor, currentColor 4px, transparent 4px, transparent 8px)" }} />
          <div className="absolute right-3 -translate-y-1/2 flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-foreground bg-foreground/10 px-2 py-0.5 rounded">
              Current: {fmtPrice(currentPrice)}
            </span>
          </div>
        </div>
        {/* Zone shading between levels */}
        {levels.slice(0, -1).map((level, i) => {
          const nextLevel = levels[i + 1];
          const topPos = pos(level.price);
          const bottomPos = pos(nextLevel.price);
          const height = bottomPos - topPos;
          const isInZone = currentPrice <= level.price && currentPrice >= nextLevel.price;
          return (
            <div
              key={`zone-${i}`}
              className={cn("absolute left-0 right-0 transition-opacity",
                isInZone ? "bg-brand/5" : "bg-transparent"
              )}
              style={{ top: `${topPos}%`, height: `${height}%` }}
            />
          );
        })}
      </div>

      {/* Summary table */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {levels.filter(l => l.ratio !== "0%" && l.ratio !== "100%").map((level) => {
          const dist = ((currentPrice - level.price) / level.price) * 100;
          return (
            <div key={level.ratio} className={cn("rounded-lg p-2.5 text-center",
              level.type === "support" ? "bg-positive/5" : "bg-negative/5"
            )}>
              <p className="text-[10px] font-bold text-muted-foreground/60">{level.ratio}</p>
              <p className="text-xs font-bold tabular-nums text-foreground mt-0.5">{fmtPrice(level.price)}</p>
              <p className={cn("text-[10px] font-medium tabular-nums", dist >= 0 ? "text-positive" : "text-negative")}>
                {dist >= 0 ? "+" : ""}{dist.toFixed(2)}%
              </p>
            </div>
          );
        })}
      </div>

      {/* Nearest Fib level callout */}
      {(() => {
        const nearest = levels.reduce((best, lvl) => {
          const d = Math.abs(currentPrice - lvl.price);
          return d < Math.abs(currentPrice - best.price) ? lvl : best;
        }, levels[0]);
        const dist = ((currentPrice - nearest.price) / nearest.price) * 100;
        return (
          <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
            Price is nearest the <span className="font-bold text-foreground">{nearest.ratio}</span> level at {fmtPrice(nearest.price)} ({dist >= 0 ? "+" : ""}{dist.toFixed(2)}% away).
            {nearest.type === "support" ? " This level may act as support." : " This level may act as resistance."}
          </p>
        );
      })()}
    </div>
  );
}

/* ─── Pivot Levels Visual ──────────────────────────────────── */

function PivotLevels({ pivots, currentPrice }: {
  pivots: { r2: number; r1: number; pp: number; s1: number; s2: number };
  currentPrice: number;
}) {
  const levels = [
    { label: "R2", value: pivots.r2, color: "text-negative", bg: "bg-negative/10" },
    { label: "R1", value: pivots.r1, color: "text-negative", bg: "bg-negative/10" },
    { label: "PP", value: pivots.pp, color: "text-brand", bg: "bg-brand/10" },
    { label: "S1", value: pivots.s1, color: "text-positive", bg: "bg-positive/10" },
    { label: "S2", value: pivots.s2, color: "text-positive", bg: "bg-positive/10" },
  ];

  const allValues = levels.map(l => l.value).concat(currentPrice);
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min || 1;

  function pos(v: number) {
    return ((v - min) / range) * 100;
  }

  return (
    <div className="space-y-4">
      {/* Visual bar */}
      <div className="relative h-10 rounded-lg bg-secondary/50 overflow-visible">
        {levels.map((level) => (
          <div
            key={level.label}
            className="absolute top-0 bottom-0 flex flex-col items-center justify-center"
            style={{ left: `${pos(level.value)}%`, transform: "translateX(-50%)" }}
          >
            <div className={cn("w-px h-full", level.label === "PP" ? "bg-brand/40" : level.label.startsWith("R") ? "bg-negative/30" : "bg-positive/30")} />
          </div>
        ))}
        {/* Current price marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 z-10"
          style={{ left: `${pos(currentPrice)}%`, transform: "translateX(-50%) translateY(-50%)" }}
        >
          <div className="w-3 h-3 rounded-full bg-foreground border-2 border-background shadow-lg" />
        </div>
      </div>

      {/* Level values in a row */}
      <div className="grid grid-cols-5 gap-2 text-center">
        {levels.map((level) => {
          const dist = ((currentPrice - level.value) / level.value) * 100;
          return (
            <div key={level.label}>
              <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded inline-block mb-1", level.bg, level.color)}>
                {level.label}
              </span>
              <p className="text-xs font-semibold tabular-nums text-foreground">{fmtPrice(level.value)}</p>
              <p className="text-[10px] tabular-nums text-muted-foreground">
                {dist >= 0 ? "+" : ""}{dist.toFixed(2)}%
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
