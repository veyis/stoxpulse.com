"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  Plus,
  X,
  BarChart3,
  Sparkles,
  Loader2,
  ArrowRight,
} from "lucide-react";

// ── Types ───────────────────────────────────────────────────────
interface StockDimension {
  name: string;
  score: number;
}

interface ComparedStock {
  ticker: string;
  name: string;
  sector: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  marketCap: number | null;
  pe: number | null;
  eps: number | null;
  divYield: number | null;
  high52w: number | null;
  low52w: number | null;
  beta: number | null;
  pulseScore: number;
  grade: string;
  dimensions: StockDimension[];
}

interface CompareResult {
  stocks: ComparedStock[];
  aiVerdict: string | null;
}

// ── Color palette for stocks ────────────────────────────────────
const STOCK_COLORS = [
  { bg: "bg-brand", text: "text-brand", hex: "#4ade80", fill: "rgba(74,222,128,0.25)" },
  { bg: "bg-blue-500", text: "text-blue-400", hex: "#60a5fa", fill: "rgba(96,165,250,0.2)" },
  { bg: "bg-purple-500", text: "text-purple-400", hex: "#c084fc", fill: "rgba(192,132,252,0.2)" },
  { bg: "bg-orange-500", text: "text-orange-400", hex: "#fb923c", fill: "rgba(251,146,60,0.2)" },
  { bg: "bg-rose-500", text: "text-rose-400", hex: "#fb7185", fill: "rgba(251,113,133,0.2)" },
];

// ── Helpers ─────────────────────────────────────────────────────
function formatMarketCap(v: number | null): string {
  if (v == null) return "N/A";
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${v.toLocaleString()}`;
}

function fmt(v: number | null, decimals = 2, prefix = ""): string {
  if (v == null) return "N/A";
  return `${prefix}${v.toFixed(decimals)}`;
}

function range52Pct(stock: ComparedStock): number | null {
  if (stock.high52w == null || stock.low52w == null || stock.price == null) return null;
  if (stock.high52w === stock.low52w) return 50;
  return ((stock.price - stock.low52w) / (stock.high52w - stock.low52w)) * 100;
}

function gradeColor(grade: string): string {
  if (grade.startsWith("A")) return "text-positive";
  if (grade.startsWith("B")) return "text-positive/80";
  if (grade.startsWith("C")) return "text-warning";
  if (grade.startsWith("D")) return "text-negative/80";
  return "text-negative";
}

function gradeBg(grade: string): string {
  if (grade.startsWith("A")) return "bg-positive/15 border-positive/30";
  if (grade.startsWith("B")) return "bg-positive/10 border-positive/20";
  if (grade.startsWith("C")) return "bg-warning/15 border-warning/30";
  if (grade.startsWith("D")) return "bg-negative/10 border-negative/20";
  return "bg-negative/15 border-negative/30";
}

// ── Radar Chart (SVG) ───────────────────────────────────────────
const RADAR_DIMS = ["Value", "Growth", "Health", "Momentum", "Sentiment"];
const RADAR_SIZE = 320;
const RADAR_CX = RADAR_SIZE / 2;
const RADAR_CY = RADAR_SIZE / 2;
const RADAR_R = 120;

function polarToXY(angle: number, radius: number): [number, number] {
  const rad = ((angle - 90) * Math.PI) / 180;
  return [RADAR_CX + radius * Math.cos(rad), RADAR_CY + radius * Math.sin(rad)];
}

function RadarChart({ stocks }: { stocks: ComparedStock[] }) {
  const angles = RADAR_DIMS.map((_, i) => (360 / RADAR_DIMS.length) * i);

  // Grid rings
  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`}
        className="w-full max-w-[360px]"
      >
        {/* Background grid rings */}
        {rings.map((r) => {
          const pts = angles
            .map((a) => polarToXY(a, RADAR_R * r))
            .map(([x, y]) => `${x},${y}`)
            .join(" ");
          return (
            <polygon
              key={r}
              points={pts}
              fill="none"
              stroke="currentColor"
              className="text-border"
              strokeWidth={r === 1 ? 1.5 : 0.5}
              strokeDasharray={r === 1 ? "none" : "3 3"}
            />
          );
        })}

        {/* Axis lines */}
        {angles.map((a, i) => {
          const [x, y] = polarToXY(a, RADAR_R);
          return (
            <line
              key={i}
              x1={RADAR_CX}
              y1={RADAR_CY}
              x2={x}
              y2={y}
              stroke="currentColor"
              className="text-border"
              strokeWidth={0.5}
            />
          );
        })}

        {/* Stock polygons */}
        {stocks.map((stock, si) => {
          const color = STOCK_COLORS[si];
          const pts = stock.dimensions.map((dim, di) => {
            const ratio = dim.score / 20; // each dimension is 0-20
            return polarToXY(angles[di], RADAR_R * ratio);
          });
          const pointsStr = pts.map(([x, y]) => `${x},${y}`).join(" ");
          return (
            <g key={stock.ticker}>
              <polygon
                points={pointsStr}
                fill={color.fill}
                stroke={color.hex}
                strokeWidth={2.5}
                strokeLinejoin="round"
              />
              {/* Vertex dots */}
              {pts.map(([x, y], di) => (
                <circle
                  key={di}
                  cx={x}
                  cy={y}
                  r={3.5}
                  fill={color.hex}
                  stroke="var(--color-background)"
                  strokeWidth={1.5}
                />
              ))}
            </g>
          );
        })}

        {/* Axis labels */}
        {angles.map((a, i) => {
          const [x, y] = polarToXY(a, RADAR_R + 22);
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[11px] font-medium"
            >
              {RADAR_DIMS[i]}
            </text>
          );
        })}

        {/* Scale labels on first axis */}
        {[4, 8, 12, 16, 20].map((v) => {
          const [x, y] = polarToXY(0, RADAR_R * (v / 20));
          return (
            <text
              key={v}
              x={x + 10}
              y={y}
              className="fill-muted-foreground/50 text-[8px]"
              textAnchor="start"
              dominantBaseline="middle"
            >
              {v}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
        {stocks.map((stock, i) => (
          <div key={stock.ticker} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block size-3 rounded-full"
              style={{ backgroundColor: STOCK_COLORS[i].hex }}
            />
            <span className="font-medium text-foreground">{stock.ticker}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────
export function StockComparison() {
  const [tickers, setTickers] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [error, setError] = useState("");

  const addTicker = () => {
    if (tickers.length < 5) setTickers([...tickers, ""]);
  };

  const removeTicker = (idx: number) => {
    if (tickers.length <= 2) return;
    setTickers(tickers.filter((_, i) => i !== idx));
  };

  const updateTicker = (idx: number, val: string) => {
    const next = [...tickers];
    next[idx] = val.toUpperCase().replace(/[^A-Z.]/g, "");
    setTickers(next);
  };

  const compare = useCallback(async () => {
    const cleaned = tickers.map((t) => t.trim()).filter(Boolean);
    if (cleaned.length < 2) {
      setError("Enter at least 2 tickers to compare");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(
        `/api/compare-stocks?tickers=${cleaned.join(",")}`,
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Comparison failed");
      }
      const data: CompareResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [tickers]);

  return (
    <div className="space-y-8">
      {/* ── Input Form ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-surface-1 p-6">
        <div className="space-y-3">
          {tickers.map((t, i) => (
            <div key={i} className="flex items-center gap-3">
              <span
                className="flex items-center justify-center size-8 rounded-full text-xs font-bold text-white shrink-0"
                style={{ backgroundColor: STOCK_COLORS[i].hex }}
              >
                {i + 1}
              </span>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={t}
                  onChange={(e) => updateTicker(i, e.target.value)}
                  placeholder={
                    ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN"][i] ?? "TICKER"
                  }
                  maxLength={6}
                  className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50 uppercase"
                  onKeyDown={(e) => e.key === "Enter" && compare()}
                />
              </div>
              {tickers.length > 2 && (
                <button
                  onClick={() => removeTicker(i)}
                  className="flex items-center justify-center size-8 rounded-lg border border-border text-muted-foreground hover:text-negative hover:border-negative/40 transition-colors"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-4">
          {tickers.length < 5 && (
            <button
              onClick={addTicker}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="size-4" />
              Add Stock
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={compare}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-background hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Comparing...
              </>
            ) : (
              <>
                <BarChart3 className="size-4" />
                Compare
              </>
            )}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-negative">{error}</p>
        )}
      </div>

      {/* ── Loading Skeleton ───────────────────────────────────── */}
      {loading && (
        <div className="space-y-6 animate-pulse">
          <div className="rounded-2xl border border-border bg-surface-1 p-8">
            <div className="h-6 w-48 rounded bg-surface-2 mb-6" />
            <div className="flex justify-center">
              <div className="size-64 rounded-full bg-surface-2" />
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface-1 p-8">
            <div className="h-6 w-40 rounded bg-surface-2 mb-4" />
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 rounded bg-surface-2" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Results ────────────────────────────────────────────── */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Pulse Score Comparison */}
          <section className="rounded-2xl border border-border bg-surface-1 p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <BarChart3 className="size-5 text-brand" />
              Pulse Score Comparison
            </h2>

            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${result.stocks.length}, 1fr)` }}>
              {result.stocks.map((stock, i) => (
                <div
                  key={stock.ticker}
                  className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface-2/50 p-4"
                >
                  <span className={cn("text-sm font-bold", STOCK_COLORS[i].text)}>
                    {stock.ticker}
                  </span>
                  <div
                    className={cn(
                      "flex items-center justify-center size-14 rounded-xl border text-xl font-display font-bold",
                      gradeBg(stock.grade),
                      gradeColor(stock.grade),
                    )}
                  >
                    {stock.grade}
                  </div>
                  {/* Score bar */}
                  <div className="w-full">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Score</span>
                      <span className="font-medium text-foreground">
                        {stock.pulseScore}
                        <span className="text-muted-foreground">/100</span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${stock.pulseScore}%`,
                          backgroundColor: STOCK_COLORS[i].hex,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Radar Chart */}
          <section className="rounded-2xl border border-border bg-surface-1 p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <BarChart3 className="size-5 text-brand" />
              Dimension Radar
            </h2>
            <RadarChart stocks={result.stocks} />
          </section>

          {/* Metrics Comparison Table */}
          <section className="rounded-2xl border border-border bg-surface-1 overflow-hidden">
            <div className="p-6 sm:p-8 pb-0">
              <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <BarChart3 className="size-5 text-brand" />
                Key Metrics
              </h2>
            </div>
            <div className="overflow-x-auto">
              <MetricsTable stocks={result.stocks} />
            </div>
          </section>

          {/* AI Verdict */}
          {result.aiVerdict && (
            <section className="rounded-2xl border border-brand/20 bg-brand/5 p-6 sm:p-8">
              <h2 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="size-5 text-brand" />
                AI Verdict
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {result.aiVerdict}
              </p>
            </section>
          )}

          {/* CTA */}
          <div className="text-center pt-2">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-sm text-brand hover:text-brand/80 transition-colors font-medium"
            >
              Explore full stock analysis on StoxPulse
              <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Metrics Table ───────────────────────────────────────────────
function MetricsTable({ stocks }: { stocks: ComparedStock[] }) {
  type MetricRow = {
    label: string;
    getValue: (s: ComparedStock) => string;
    getRaw: (s: ComparedStock) => number | null;
    higherIsBetter: boolean;
  };

  const metrics: MetricRow[] = [
    {
      label: "Price",
      getValue: (s) => fmt(s.price, 2, "$"),
      getRaw: (s) => s.price,
      higherIsBetter: false, // neutral
    },
    {
      label: "Market Cap",
      getValue: (s) => formatMarketCap(s.marketCap),
      getRaw: (s) => s.marketCap,
      higherIsBetter: true,
    },
    {
      label: "P/E Ratio",
      getValue: (s) => (s.pe != null && s.pe > 0 ? s.pe.toFixed(1) : "N/A"),
      getRaw: (s) => (s.pe != null && s.pe > 0 ? s.pe : null),
      higherIsBetter: false,
    },
    {
      label: "EPS",
      getValue: (s) => fmt(s.eps, 2, "$"),
      getRaw: (s) => s.eps,
      higherIsBetter: true,
    },
    {
      label: "52W Range %",
      getValue: (s) => {
        const pct = range52Pct(s);
        return pct != null ? `${pct.toFixed(0)}%` : "N/A";
      },
      getRaw: (s) => range52Pct(s),
      higherIsBetter: true,
    },
    {
      label: "Div Yield",
      getValue: (s) =>
        s.divYield != null ? `${s.divYield.toFixed(2)}%` : "N/A",
      getRaw: (s) => s.divYield,
      higherIsBetter: true,
    },
    {
      label: "Beta",
      getValue: (s) => (s.beta != null ? s.beta.toFixed(2) : "N/A"),
      getRaw: (s) => s.beta,
      higherIsBetter: false,
    },
    {
      label: "Pulse Score",
      getValue: (s) => `${s.pulseScore}/100 (${s.grade})`,
      getRaw: (s) => s.pulseScore,
      higherIsBetter: true,
    },
  ];

  function bestIdx(row: MetricRow): number | null {
    const vals = stocks.map((s) => row.getRaw(s));
    const valid = vals.filter((v): v is number => v != null);
    if (valid.length === 0) return null;
    const best = row.higherIsBetter
      ? Math.max(...valid)
      : Math.min(...valid);
    return vals.indexOf(best);
  }

  return (
    <table className="w-full min-w-[500px] text-sm">
      <thead>
        <tr className="border-b border-border">
          <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Metric
          </th>
          {stocks.map((s, i) => (
            <th key={s.ticker} className="text-right py-3 px-4">
              <span className={cn("text-xs font-bold uppercase", STOCK_COLORS[i].text)}>
                {s.ticker}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {metrics.map((row) => {
          const best = bestIdx(row);
          return (
            <tr
              key={row.label}
              className="border-b border-border/50 hover:bg-surface-2/30 transition-colors"
            >
              <td className="py-3 px-6 text-muted-foreground font-medium">
                {row.label}
              </td>
              {stocks.map((s, i) => (
                <td
                  key={s.ticker}
                  className={cn(
                    "py-3 px-4 text-right font-mono text-foreground",
                    i === best && "text-positive font-semibold",
                  )}
                >
                  {row.getValue(s)}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
