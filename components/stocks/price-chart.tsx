"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  createChart,
  ColorType,
  CrosshairMode,
  LineStyle,
  CandlestickSeries,
  AreaSeries,
  HistogramSeries,
  LineSeries,
  BaselineSeries,
  createSeriesMarkers,
  type IChartApi,
  type CandlestickData,
  type AreaData,
  type HistogramData,
  type LineData,
  type Time,
  type ISeriesApi,
  type SeriesMarker,
} from "lightweight-charts";
import { cn } from "@/lib/utils";
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
} from "@/lib/technicals";
import type { HistoricalPrice } from "@/lib/data/types";
import type { StockQuote } from "@/lib/types/stock";

type TimeRange = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "5Y" | "ALL";
type ChartType = "candle" | "area";

// Indicator toggle state
type OverlayIndicator = "sma50" | "sma200" | "ema21" | "bollinger";
type PaneIndicator = "rsi" | "macd";

export interface IntradayPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface EarningsEvent {
  date: string;
  beat: boolean | null; // null = no data, true = beat, false = miss
  surprisePercent: number | null;
}

export interface InsiderEvent {
  date: string;
  type: "Buy" | "Sale";
  name: string;
  totalValue: number;
}

interface PriceChartProps {
  prices: HistoricalPrice[];
  ticker: string;
  quote?: StockQuote | null;
  className?: string;
  intradayPrices?: IntradayPrice[];
  earningsEvents?: EarningsEvent[];
  insiderEvents?: InsiderEvent[];
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

const OVERLAY_CONFIG: Record<OverlayIndicator, { label: string; color: string; shortLabel: string }> = {
  sma50: { label: "SMA 50", color: "#f59e0b", shortLabel: "50" },
  sma200: { label: "SMA 200", color: "#8b5cf6", shortLabel: "200" },
  ema21: { label: "EMA 21", color: "#06b6d4", shortLabel: "21" },
  bollinger: { label: "Bollinger", color: "#64748b", shortLabel: "BB" },
};

const PANE_CONFIG: Record<PaneIndicator, { label: string }> = {
  rsi: { label: "RSI" },
  macd: { label: "MACD" },
};

function safeChangePercent(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

function formatNum(v: number | undefined | null): string {
  return v != null ? v.toFixed(2) : "—";
}

function toTime(dateStr: string): Time {
  if (dateStr.includes(" ")) {
    return Math.floor(new Date(dateStr.replace(" ", "T") + "Z").getTime() / 1000) as Time;
  }
  return dateStr as Time;
}

function formatValue(v: number): string {
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

export function PriceChart({
  prices,
  ticker,
  quote,
  className,
  intradayPrices,
  earningsEvents,
  insiderEvents,
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const [range, setRange] = useState<TimeRange>("3M");
  const [chartType, setChartType] = useState<ChartType>("candle");
  const [overlays, setOverlays] = useState<Set<OverlayIndicator>>(new Set());
  const [panes, setPanes] = useState<Set<PaneIndicator>>(new Set());
  const [showEvents, setShowEvents] = useState(true);
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

  const isIntraday = range === "1D" || range === "1W";

  const toggleOverlay = useCallback((id: OverlayIndicator) => {
    setOverlays((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const togglePane = useCallback((id: PaneIndicator) => {
    setPanes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Memoize filtered data
  const filteredData = useMemo(() => {
    if (isIntraday && intradayPrices && intradayPrices.length > 0) {
      const sorted = [...intradayPrices].sort((a, b) => a.date.localeCompare(b.date));
      if (range === "1D") {
        return sorted.slice(-24).map((p) => ({ ...p, _intraday: true as const }));
      }
      return sorted.slice(-168).map((p) => ({ ...p, _intraday: true as const }));
    }

    const days = RANGE_DAYS[range];
    const sliced = [...prices].slice(0, Math.min(days, prices.length)).reverse();

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

  const hasOHLC = useMemo(
    () => filteredData.some((p) => p.open != null && p.high != null && p.low != null),
    [filteredData]
  );
  const effectiveChartType = chartType === "candle" && !hasOHLC ? "area" : chartType;

  // Need enough data points for indicators
  const canShowIndicators = !isIntraday && filteredData.length >= 20;

  // Chart height: taller when panes are active
  const chartHeight = panes.size === 0 ? 400 : panes.size === 1 ? 500 : 580;

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

    const isDark = document.documentElement.classList.contains("dark");
    const gridColor = isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.06)";
    const textColor = isDark ? "rgba(161, 161, 170, 0.8)" : "rgba(113, 113, 122, 0.9)";
    const crosshairColor = isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)";
    const labelBg = isDark ? "rgba(39, 39, 42, 0.95)" : "rgba(250, 250, 250, 0.95)";
    const borderColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)";
    const markerBg = isDark ? "rgba(24, 24, 27, 1)" : "rgba(255, 255, 255, 1)";
    const volUpColor = isDark ? "rgba(74, 222, 128, 0.15)" : "rgba(74, 222, 128, 0.25)";
    const volDownColor = isDark ? "rgba(248, 113, 113, 0.15)" : "rgba(248, 113, 113, 0.25)";
    const paneSepColor = isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.08)";
    const paneSepHover = isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.15)";

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor,
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 11,
        panes: {
          separatorColor: paneSepColor,
          separatorHoverColor: paneSepHover,
          enableResize: true,
        },
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

    // ── Main price series (pane 0) ─────────────────────────────────
    let mainSeries: ISeriesApi<"Candlestick"> | ISeriesApi<"Area">;

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
      mainSeries = candleSeries;
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
      mainSeries = areaSeries;
    }

    // ── Volume histogram (pane 0, separate scale) ──────────────────
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

    // ── Overlay indicators (pane 0) ────────────────────────────────
    if (canShowIndicators) {
      // Data is oldest-first in `data` array — that's what our technicals expect
      // BUT: our technicals expect newest-first (they reverse internally)
      // So we pass closes in newest-first order
      const closesNewestFirst = [...data].reverse().map((p) => p.close);

      // SMA 50
      if (overlays.has("sma50") && data.length >= 50) {
        const smaValues = calculateSMA(closesNewestFirst, 50);
        const smaReversed = [...smaValues].reverse(); // back to oldest-first
        const smaData: LineData[] = [];
        for (let i = 0; i < data.length; i++) {
          if (smaReversed[i] != null) {
            smaData.push({ time: toTime(data[i].date), value: smaReversed[i]! });
          }
        }
        const smaSeries = chart.addSeries(LineSeries, {
          color: OVERLAY_CONFIG.sma50.color,
          lineWidth: 1,
          priceScaleId: "right",
          lastValueVisible: false,
          priceLineVisible: false,
        });
        smaSeries.setData(smaData);
      }

      // SMA 200
      if (overlays.has("sma200") && data.length >= 200) {
        const smaValues = calculateSMA(closesNewestFirst, 200);
        const smaReversed = [...smaValues].reverse();
        const smaData: LineData[] = [];
        for (let i = 0; i < data.length; i++) {
          if (smaReversed[i] != null) {
            smaData.push({ time: toTime(data[i].date), value: smaReversed[i]! });
          }
        }
        const smaSeries = chart.addSeries(LineSeries, {
          color: OVERLAY_CONFIG.sma200.color,
          lineWidth: 1,
          priceScaleId: "right",
          lastValueVisible: false,
          priceLineVisible: false,
        });
        smaSeries.setData(smaData);
      }

      // EMA 21
      if (overlays.has("ema21") && data.length >= 21) {
        const emaValues = calculateEMA(closesNewestFirst, 21);
        const emaReversed = [...emaValues].reverse();
        const emaData: LineData[] = [];
        for (let i = 0; i < data.length; i++) {
          if (emaReversed[i] != null) {
            emaData.push({ time: toTime(data[i].date), value: emaReversed[i]! });
          }
        }
        const emaSeries = chart.addSeries(LineSeries, {
          color: OVERLAY_CONFIG.ema21.color,
          lineWidth: 1,
          priceScaleId: "right",
          lastValueVisible: false,
          priceLineVisible: false,
        });
        emaSeries.setData(emaData);
      }

      // Bollinger Bands (3 lines: upper, middle, lower)
      if (overlays.has("bollinger") && data.length >= 20) {
        const bbValues = calculateBollingerBands(closesNewestFirst, 20, 2);
        const bbReversed = [...bbValues].reverse();
        const bbColor = OVERLAY_CONFIG.bollinger.color;

        const upperData: LineData[] = [];
        const middleData: LineData[] = [];
        const lowerData: LineData[] = [];
        for (let i = 0; i < data.length; i++) {
          const bb = bbReversed[i];
          if (bb?.upper != null) upperData.push({ time: toTime(data[i].date), value: bb.upper });
          if (bb?.middle != null) middleData.push({ time: toTime(data[i].date), value: bb.middle });
          if (bb?.lower != null) lowerData.push({ time: toTime(data[i].date), value: bb.lower });
        }

        const bbOpts = {
          color: bbColor,
          lineWidth: 1 as const,
          priceScaleId: "right" as const,
          lastValueVisible: false,
          priceLineVisible: false,
        };

        const upperSeries = chart.addSeries(LineSeries, { ...bbOpts, lineStyle: LineStyle.Dashed });
        upperSeries.setData(upperData);

        const middleSeries = chart.addSeries(LineSeries, { ...bbOpts, lineStyle: LineStyle.Dotted });
        middleSeries.setData(middleData);

        const lowerSeries = chart.addSeries(LineSeries, { ...bbOpts, lineStyle: LineStyle.Dashed });
        lowerSeries.setData(lowerData);
      }

      // ── RSI pane (pane 1 or 2) ────────────────────────────────────
      if (panes.has("rsi") && data.length >= 15) {
        const rsiPaneIndex = 1;
        const rsiValues = calculateRSI(closesNewestFirst, 14);
        const rsiReversed = [...rsiValues].reverse();
        const rsiData: LineData[] = [];
        for (let i = 0; i < data.length; i++) {
          if (rsiReversed[i] != null) {
            rsiData.push({ time: toTime(data[i].date), value: rsiReversed[i]! });
          }
        }

        const rsiSeries = chart.addSeries(
          LineSeries,
          {
            color: "#a78bfa",
            lineWidth: 2,
            lastValueVisible: true,
            priceLineVisible: false,
            priceFormat: { type: "custom", formatter: (v: number) => v.toFixed(0) },
          },
          rsiPaneIndex
        );
        rsiSeries.setData(rsiData);

        // Overbought (70) / oversold (30) reference lines
        const overboughtData: LineData[] = rsiData.map((d) => ({ time: d.time, value: 70 }));
        const oversoldData: LineData[] = rsiData.map((d) => ({ time: d.time, value: 30 }));

        const obSeries = chart.addSeries(
          LineSeries,
          {
            color: isDark ? "rgba(248, 113, 113, 0.3)" : "rgba(248, 113, 113, 0.4)",
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            lastValueVisible: false,
            priceLineVisible: false,
            priceFormat: { type: "custom", formatter: (v: number) => v.toFixed(0) },
          },
          rsiPaneIndex
        );
        obSeries.setData(overboughtData);

        const osSeries = chart.addSeries(
          LineSeries,
          {
            color: isDark ? "rgba(74, 222, 128, 0.3)" : "rgba(74, 222, 128, 0.4)",
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            lastValueVisible: false,
            priceLineVisible: false,
            priceFormat: { type: "custom", formatter: (v: number) => v.toFixed(0) },
          },
          rsiPaneIndex
        );
        osSeries.setData(oversoldData);

        // Set RSI pane height
        const rsiPane = chart.panes()[rsiPaneIndex];
        if (rsiPane) rsiPane.setHeight(100);
      }

      // ── MACD pane ─────────────────────────────────────────────────
      if (panes.has("macd") && data.length >= 27) {
        const macdPaneIndex = panes.has("rsi") ? 2 : 1;
        const macdValues = calculateMACD(closesNewestFirst, 12, 26, 9);
        const macdReversed = [...macdValues].reverse();

        const macdLineData: LineData[] = [];
        const signalLineData: LineData[] = [];
        const histData: HistogramData[] = [];
        for (let i = 0; i < data.length; i++) {
          const m = macdReversed[i];
          if (m?.macd != null) macdLineData.push({ time: toTime(data[i].date), value: m.macd });
          if (m?.signal != null) signalLineData.push({ time: toTime(data[i].date), value: m.signal });
          if (m?.histogram != null) {
            histData.push({
              time: toTime(data[i].date),
              value: m.histogram,
              color: m.histogram >= 0
                ? (isDark ? "rgba(74, 222, 128, 0.5)" : "rgba(74, 222, 128, 0.6)")
                : (isDark ? "rgba(248, 113, 113, 0.5)" : "rgba(248, 113, 113, 0.6)"),
            });
          }
        }

        // MACD histogram
        const histSeries = chart.addSeries(
          HistogramSeries,
          {
            lastValueVisible: false,
            priceLineVisible: false,
            priceFormat: { type: "custom", formatter: (v: number) => v.toFixed(2) },
          },
          macdPaneIndex
        );
        histSeries.setData(histData);

        // MACD line
        const macdSeries = chart.addSeries(
          LineSeries,
          {
            color: "#3b82f6",
            lineWidth: 2,
            lastValueVisible: false,
            priceLineVisible: false,
            priceFormat: { type: "custom", formatter: (v: number) => v.toFixed(2) },
          },
          macdPaneIndex
        );
        macdSeries.setData(macdLineData);

        // Signal line
        const signalSeries = chart.addSeries(
          LineSeries,
          {
            color: "#f97316",
            lineWidth: 1,
            lastValueVisible: false,
            priceLineVisible: false,
            priceFormat: { type: "custom", formatter: (v: number) => v.toFixed(2) },
          },
          macdPaneIndex
        );
        signalSeries.setData(signalLineData);

        const macdPane = chart.panes()[macdPaneIndex];
        if (macdPane) macdPane.setHeight(100);
      }
    }

    // ── Event markers (earnings + insider) ──────────────────────────
    if (showEvents && !isIntraday) {
      const dataDateSet = new Set(data.map((d) => d.date));
      const markers: SeriesMarker<Time>[] = [];

      // Earnings markers
      if (earningsEvents) {
        for (const ev of earningsEvents) {
          if (!dataDateSet.has(ev.date)) continue;
          const surprise = ev.surprisePercent != null ? `${ev.surprisePercent > 0 ? "+" : ""}${ev.surprisePercent.toFixed(1)}%` : "";
          markers.push({
            time: ev.date as Time,
            position: "aboveBar",
            color: ev.beat === true ? "#4ade80" : ev.beat === false ? "#f87171" : "#a1a1aa",
            shape: "circle",
            text: `E ${surprise}`,
          });
        }
      }

      // Insider trade markers
      if (insiderEvents) {
        for (const ev of insiderEvents) {
          if (!dataDateSet.has(ev.date)) continue;
          const isBuy = ev.type === "Buy";
          markers.push({
            time: ev.date as Time,
            position: isBuy ? "belowBar" : "aboveBar",
            color: isBuy ? "#22d3ee" : "#fb923c",
            shape: isBuy ? "arrowUp" : "arrowDown",
            text: `${isBuy ? "Buy" : "Sell"} ${formatValue(ev.totalValue)}`,
          });
        }
      }

      if (markers.length > 0) {
        // Sort markers by time (required by lightweight-charts)
        markers.sort((a, b) => {
          const ta = typeof a.time === "string" ? a.time : String(a.time);
          const tb = typeof b.time === "string" ? b.time : String(b.time);
          return ta.localeCompare(tb);
        });
        createSeriesMarkers(mainSeries, markers);
      }
    }

    // ── Crosshair tooltip ──────────────────────────────────────────
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

    const latest = data[data.length - 1];
    const prev = data.length >= 2 ? data[data.length - 2] : latest;
    setCurrentPrice(buildPriceInfo(latest, prev));

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
  }, [filteredData, effectiveChartType, isIntraday, overlays, panes, showEvents, earningsEvents, insiderEvents, canShowIndicators]);

  if (filteredData.length < 2) return null;

  const isPositive = currentPrice ? currentPrice.change >= 0 : true;
  const hasEvents = (earningsEvents && earningsEvents.length > 0) || (insiderEvents && insiderEvents.length > 0);

  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card overflow-hidden", className)}>
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 pt-5 pb-2">
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

      {/* Indicator toolbar */}
      {canShowIndicators && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-5 pb-2 text-[11px]">
          {/* Overlay toggles */}
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground/60 mr-0.5 uppercase tracking-wider font-medium">Overlay</span>
            {(Object.keys(OVERLAY_CONFIG) as OverlayIndicator[]).map((id) => {
              const cfg = OVERLAY_CONFIG[id];
              const active = overlays.has(id);
              // Don't show SMA 200 unless we have 200+ data points
              if (id === "sma200" && filteredData.length < 200) return null;
              return (
                <button
                  key={id}
                  onClick={() => toggleOverlay(id)}
                  className={cn(
                    "px-2 py-0.5 rounded-md font-medium transition-all border",
                    active
                      ? "border-current shadow-sm"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                  style={active ? { color: cfg.color, borderColor: `${cfg.color}40` } : undefined}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>

          {/* Pane indicator toggles */}
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground/60 mr-0.5 uppercase tracking-wider font-medium">Study</span>
            {(Object.keys(PANE_CONFIG) as PaneIndicator[]).map((id) => {
              const cfg = PANE_CONFIG[id];
              const active = panes.has(id);
              return (
                <button
                  key={id}
                  onClick={() => togglePane(id)}
                  className={cn(
                    "px-2 py-0.5 rounded-md font-medium transition-all border",
                    active
                      ? "border-primary/40 text-primary shadow-sm"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>

          {/* Event markers toggle */}
          {hasEvents && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground/60 mr-0.5 uppercase tracking-wider font-medium">Events</span>
              <button
                onClick={() => setShowEvents((p) => !p)}
                className={cn(
                  "px-2 py-0.5 rounded-md font-medium transition-all border",
                  showEvents
                    ? "border-primary/40 text-primary shadow-sm"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {showEvents ? "On" : "Off"}
              </button>
            </div>
          )}

          {/* Active overlay legend */}
          {overlays.size > 0 && (
            <div className="hidden sm:flex items-center gap-2 ml-auto">
              {(Array.from(overlays) as OverlayIndicator[]).map((id) => (
                <span key={id} className="flex items-center gap-1">
                  <span className="inline-block w-3 h-[2px] rounded-full" style={{ backgroundColor: OVERLAY_CONFIG[id].color }} />
                  <span className="text-muted-foreground">{OVERLAY_CONFIG[id].label}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chart container */}
      <div ref={chartContainerRef} className="w-full" style={{ height: `${chartHeight}px` }} />

      {/* Pane labels */}
      {panes.size > 0 && (
        <div className="flex items-center gap-4 px-5 pb-3 pt-1 text-[10px] text-muted-foreground/60">
          {panes.has("rsi") && (
            <span>
              RSI(14) — <span className="text-negative/60">70 overbought</span> / <span className="text-positive/60">30 oversold</span>
            </span>
          )}
          {panes.has("macd") && (
            <span>
              MACD(12,26,9) — <span style={{ color: "#3b82f6" }}>MACD</span> / <span style={{ color: "#f97316" }}>Signal</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
