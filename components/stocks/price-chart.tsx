"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  createChart,
  ColorType,
  CrosshairMode,
  LineStyle,
  CandlestickSeries,
  AreaSeries,
  HistogramSeries,
  type IChartApi,
  type CandlestickData,
  type AreaData,
  type HistogramData,
  type Time,
} from "lightweight-charts";
import { cn } from "@/lib/utils";
import type { HistoricalPrice } from "@/lib/data/types";
import type { StockQuote } from "@/lib/types/stock";

type TimeRange = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "5Y" | "ALL";
type ChartType = "candle" | "area";

export interface IntradayPrice {
  date: string; // "2026-03-06 16:00:00"
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PriceChartProps {
  prices: HistoricalPrice[];
  ticker: string;
  quote?: StockQuote | null;
  className?: string;
  intradayPrices?: IntradayPrice[];
}

const RANGE_DAYS: Record<TimeRange, number> = {
  "1D": 1,
  "1W": 7,
  "1M": 22,
  "3M": 66,
  "6M": 132,
  "1Y": 252,
  "5Y": 1300,
  ALL: 9999,
};

function safeChangePercent(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

function formatNum(v: number | undefined | null): string {
  return v != null ? v.toFixed(2) : "—";
}

function toTime(dateStr: string): Time {
  // Intraday dates have a space: "2026-03-06 16:00:00"
  if (dateStr.includes(" ")) {
    return Math.floor(new Date(dateStr.replace(" ", "T") + "Z").getTime() / 1000) as Time;
  }
  return dateStr as Time;
}

export function PriceChart({ prices, ticker, quote, className, intradayPrices }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const [range, setRange] = useState<TimeRange>("3M");
  const [chartType, setChartType] = useState<ChartType>("candle");
  const [currentPrice, setCurrentPrice] = useState<{
    date: string;
    open?: number;
    high?: number;
    low?: number;
    close: number;
    volume: number;
    change: number;
    changePercent: number;
  } | null>(null);

  // Is this an intraday timeframe?
  const isIntraday = range === "1D" || range === "1W";

  // Memoize filtered data — shared between render and effect
  const filteredData = useMemo(() => {
    // Intraday: use intradayPrices (1-hour candles)
    if (isIntraday && intradayPrices && intradayPrices.length > 0) {
      const sorted = [...intradayPrices].sort((a, b) => a.date.localeCompare(b.date));
      if (range === "1D") {
        // Last 24 bars (24 hours)
        return sorted.slice(-24).map((p) => ({
          ...p,
          _intraday: true as const,
        }));
      }
      // 1W: last ~120 bars (5 trading days × 24 hours)
      return sorted.slice(-168).map((p) => ({
        ...p,
        _intraday: true as const,
      }));
    }

    const days = RANGE_DAYS[range];
    const sliced = [...prices]
      .slice(0, Math.min(days, prices.length))
      .reverse();

    // Append today's live candle only if market is open (quote has intraday activity)
    if (quote && sliced.length > 0) {
      const today = new Date().toISOString().split("T")[0];
      const lastDate = sliced[sliced.length - 1].date;
      const lastClose = sliced[sliced.length - 1].close;
      const hasIntradayActivity = quote.open != null && Math.abs(quote.price - lastClose) > 0.001;
      if (lastDate !== today && hasIntradayActivity) {
        sliced.push({
          date: today,
          open: quote.open ?? quote.price,
          high: quote.dayHigh ?? quote.price,
          low: quote.dayLow ?? quote.price,
          close: quote.price,
          volume: quote.volume ?? 0,
        });
      }
    }

    return sliced;
  }, [prices, range, quote, isIntraday, intradayPrices]);

  // Check if data has OHLC — if not, force area chart
  const hasOHLC = useMemo(
    () => filteredData.some((p) => p.open != null && p.high != null && p.low != null),
    [filteredData]
  );
  const effectiveChartType = chartType === "candle" && !hasOHLC ? "area" : chartType;

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const data = filteredData;
    if (data.length < 2) return;

    const upColor = "rgba(74, 222, 128, 1)";
    const downColor = "rgba(248, 113, 113, 1)";

    // Use CSS custom properties for theme-aware colors
    const isDark = document.documentElement.classList.contains("dark");
    const gridColor = isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.06)";
    const textColor = isDark ? "rgba(161, 161, 170, 0.8)" : "rgba(113, 113, 122, 0.9)";
    const crosshairColor = isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)";
    const labelBg = isDark ? "rgba(39, 39, 42, 0.95)" : "rgba(250, 250, 250, 0.95)";
    const borderColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)";
    const markerBg = isDark ? "rgba(24, 24, 27, 1)" : "rgba(255, 255, 255, 1)";
    const volUpColor = isDark ? "rgba(74, 222, 128, 0.15)" : "rgba(74, 222, 128, 0.25)";
    const volDownColor = isDark ? "rgba(248, 113, 113, 0.15)" : "rgba(248, 113, 113, 0.25)";

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor,
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: crosshairColor,
          style: LineStyle.Dashed,
          width: 1,
          labelBackgroundColor: labelBg,
        },
        horzLine: {
          color: crosshairColor,
          style: LineStyle.Dashed,
          width: 1,
          labelBackgroundColor: labelBg,
        },
      },
      rightPriceScale: {
        borderColor,
        scaleMargins: { top: 0.05, bottom: 0.2 },
      },
      timeScale: {
        borderColor,
        timeVisible: isIntraday,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { mouseWheel: true, pinch: true },
    });

    chartRef.current = chart;

    // Main price series
    if (effectiveChartType === "candle") {
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor,
        downColor,
        borderUpColor: upColor,
        borderDownColor: downColor,
        wickUpColor: upColor,
        wickDownColor: downColor,
      });

      const candleData: CandlestickData[] = data
        .filter((p) => p.open != null && p.high != null && p.low != null)
        .map((p) => ({
          time: toTime(p.date),
          open: p.open!,
          high: p.high!,
          low: p.low!,
          close: p.close,
        }));

      candleSeries.setData(candleData);
    } else {
      const isOverallPositive = data[data.length - 1].close >= data[0].close;
      const lineColor = isOverallPositive ? upColor : downColor;

      const areaSeries = chart.addSeries(AreaSeries, {
        lineColor,
        topColor: isOverallPositive ? "rgba(74, 222, 128, 0.2)" : "rgba(248, 113, 113, 0.2)",
        bottomColor: "transparent",
        lineWidth: 2,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: lineColor,
        crosshairMarkerBackgroundColor: markerBg,
      });

      const areaData: AreaData[] = data.map((p) => ({
        time: toTime(p.date),
        value: p.close,
      }));

      areaSeries.setData(areaData);
    }

    // Volume histogram
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });

    const volumeData: HistogramData[] = data.map((p, i) => {
      const prevClose = i > 0 ? data[i - 1].close : p.close;
      const isUp = p.close >= prevClose;
      return {
        time: toTime(p.date),
        value: p.volume,
        color: isUp ? volUpColor : volDownColor,
      };
    });

    volumeSeries.setData(volumeData);

    // Helper to build price info from a data point
    function buildPriceInfo(point: HistoricalPrice, prevPoint: HistoricalPrice) {
      return {
        date: point.date,
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close,
        volume: point.volume,
        change: point.close - prevPoint.close,
        changePercent: safeChangePercent(point.close, prevPoint.close),
      };
    }

    // Set initial tooltip to latest
    const latest = data[data.length - 1];
    const prev = data.length >= 2 ? data[data.length - 2] : latest;
    setCurrentPrice(buildPriceInfo(latest, prev));

    // Crosshair move handler for OHLCV tooltip
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData) {
        setCurrentPrice(buildPriceInfo(latest, prev));
        return;
      }

      const paramTime = param.time;
      const idx = data.findIndex((p) => {
        const t = toTime(p.date);
        return t === paramTime || String(t) === String(paramTime);
      });
      if (idx === -1) return;

      const matchPrice = data[idx];
      const prevPrice = idx > 0 ? data[idx - 1] : matchPrice;
      setCurrentPrice(buildPriceInfo(matchPrice, prevPrice));
    });

    chart.timeScale().fitContent();

    // Responsive resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chart.applyOptions({ width, height });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [filteredData, effectiveChartType, isIntraday]);

  if (filteredData.length < 2) return null;

  const isPositive = currentPrice ? currentPrice.change >= 0 : true;

  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card overflow-hidden", className)}>
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 pt-5 pb-3">
        <div className="flex items-baseline gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-medium text-muted-foreground">{ticker}</span>
              {currentPrice && (
                <span className="text-xs text-muted-foreground/60">
                  {(() => {
                    const d = currentPrice.date.includes(" ")
                      ? new Date(currentPrice.date.replace(" ", "T") + "Z")
                      : new Date(currentPrice.date + "T12:00:00");
                    return d.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      ...(currentPrice.date.includes(" ") ? { hour: "numeric", minute: "2-digit" } : {}),
                    });
                  })()}
                </span>
              )}
            </div>
            {currentPrice && currentPrice.close != null && (
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold font-display tabular-nums text-foreground">
                  ${currentPrice.close.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={cn("text-sm font-semibold tabular-nums", isPositive ? "text-positive" : "text-negative")}>
                  {isPositive ? "+" : ""}{currentPrice.change.toFixed(2)} ({isPositive ? "+" : ""}{currentPrice.changePercent.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>

          {/* OHLCV mini stats */}
          {effectiveChartType === "candle" && currentPrice?.open != null && currentPrice.close != null && (
            <div className="hidden md:flex items-center gap-3 text-xs tabular-nums">
              <span className="text-muted-foreground">
                O <span className="text-foreground/80">{formatNum(currentPrice.open)}</span>
              </span>
              <span className="text-muted-foreground">
                H <span className="text-foreground/80">{formatNum(currentPrice.high)}</span>
              </span>
              <span className="text-muted-foreground">
                L <span className="text-foreground/80">{formatNum(currentPrice.low)}</span>
              </span>
              <span className="text-muted-foreground">
                V <span className="text-foreground/80">{(currentPrice.volume / 1_000_000).toFixed(1)}M</span>
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Chart type toggle */}
          <div className="flex items-center gap-0.5 rounded-lg bg-secondary/50 p-0.5">
            <button
              onClick={() => setChartType("candle")}
              className={cn(
                "px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors",
                effectiveChartType === "candle"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Candlestick"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="3" width="3" height="8" rx="0.5" fill="currentColor" opacity="0.8" />
                <line x1="3.5" y1="1" x2="3.5" y2="3" stroke="currentColor" strokeWidth="1.2" />
                <line x1="3.5" y1="11" x2="3.5" y2="13" stroke="currentColor" strokeWidth="1.2" />
                <rect x="9" y="5" width="3" height="6" rx="0.5" fill="currentColor" opacity="0.4" />
                <line x1="10.5" y1="2" x2="10.5" y2="5" stroke="currentColor" strokeWidth="1.2" />
                <line x1="10.5" y1="11" x2="10.5" y2="13" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </button>
            <button
              onClick={() => setChartType("area")}
              className={cn(
                "px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors",
                effectiveChartType === "area"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Area"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 10L4 6L7 8L13 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M1 10L4 6L7 8L13 3V13H1V10Z" fill="currentColor" opacity="0.15" />
              </svg>
            </button>
          </div>

          {/* Time range selector */}
          <div className="flex items-center gap-0.5 rounded-lg bg-secondary/50 p-0.5">
            {(intradayPrices && intradayPrices.length > 0
              ? (["1D", "1W", "1M", "3M", "6M", "1Y", "5Y", "ALL"] as const)
              : (["1M", "3M", "6M", "1Y", "ALL"] as const)
            ).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors",
                  range === r
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart container */}
      <div ref={chartContainerRef} className="w-full h-[400px] sm:h-[450px]" />
    </div>
  );
}
