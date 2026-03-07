"use client";

import { useState } from "react";
import { Shield, AlertTriangle, ChevronRight, TrendingUp, BarChart3, PieChart, Loader2 } from "lucide-react";

interface SectorItem {
  sector: string;
  count: number;
  percentage: number;
}

interface RiskFactor {
  title: string;
  detail: string;
  severity: "high" | "medium" | "low";
}

interface StockDetail {
  ticker: string;
  name: string;
  sector: string;
  pe: number | null;
  beta: number | null;
  marketCap: number | null;
  dividendYield: number | null;
  price: number | null;
}

interface PortfolioResult {
  stockCount: number;
  failedTickers: string[];
  grade: {
    grade: string;
    score: number;
    label: string;
    color: string;
  };
  sectorBreakdown: SectorItem[];
  missingSectors: string[];
  riskFactors: RiskFactor[];
  stats: {
    avgPE: number | null;
    avgBeta: number | null;
    totalMktCap: number | null;
    avgDivYield: number | null;
  };
  stocks: StockDetail[];
}

const SECTOR_COLORS: Record<string, string> = {
  Technology: "bg-blue-500",
  Healthcare: "bg-emerald-500",
  Financials: "bg-amber-500",
  "Consumer Cyclical": "bg-pink-500",
  "Communication Services": "bg-violet-500",
  Industrials: "bg-slate-400",
  "Consumer Defensive": "bg-lime-500",
  Energy: "bg-orange-500",
  Utilities: "bg-cyan-500",
  "Real Estate": "bg-rose-400",
  "Basic Materials": "bg-yellow-600",
  Unknown: "bg-gray-500",
};

function formatMktCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
  return `$${value.toLocaleString()}`;
}

const EXAMPLE_PORTFOLIOS = [
  { label: "Balanced Mix", tickers: "AAPL, JPM, JNJ, XOM, PG" },
  { label: "Tech Heavy", tickers: "AAPL, MSFT, NVDA, GOOGL, META, AMZN" },
  { label: "Dividend Focus", tickers: "KO, PEP, JNJ, PG, MMM, T" },
];

export function PortfolioRiskScanner() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PortfolioResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    const tickers = input
      .toUpperCase()
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (tickers.length === 0) {
      setError("Please enter at least one ticker symbol.");
      return;
    }
    if (tickers.length > 10) {
      setError("Maximum 10 tickers allowed.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/portfolio-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full space-y-8">
      {/* Input Card */}
      <div className="bg-surface-1 border border-border rounded-2xl p-6 md:p-10 shadow-lg">
        <label htmlFor="tickers-input" className="block text-sm font-medium text-muted-foreground mb-3">
          Enter up to 10 stock tickers (comma or space separated)
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <textarea
            id="tickers-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAnalyze();
              }
            }}
            className="flex-1 rounded-xl border border-border bg-background p-4 text-foreground placeholder:text-muted-foreground focus:border-brand focus:ring-brand focus:outline-none transition-all resize-none sm:text-sm"
            placeholder="AAPL, MSFT, GOOGL, JPM, JNJ..."
            rows={2}
          />
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-8 py-4 font-semibold text-brand-foreground hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Shield className="size-4" />
                Analyze Risk
              </>
            )}
          </button>
        </div>

        {/* Example portfolios */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Try:</span>
          {EXAMPLE_PORTFOLIOS.map((ex) => (
            <button
              key={ex.label}
              type="button"
              className="text-xs bg-surface-2 text-foreground border border-border rounded-full px-3 py-1.5 hover:border-brand/40 transition-colors"
              onClick={() => setInput(ex.tickers)}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-negative/10 border border-negative/20 rounded-2xl p-4 text-negative text-sm flex items-start gap-3">
          <AlertTriangle className="size-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-surface-1 border border-border rounded-2xl p-16 flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="size-16 rounded-full border-4 border-brand/20 border-t-brand animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm">Fetching data and analyzing portfolio risk...</p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Failed tickers notice */}
          {result.failedTickers.length > 0 && (
            <div className="bg-warning/10 border border-warning/20 rounded-2xl p-4 text-warning text-sm flex items-start gap-3">
              <AlertTriangle className="size-5 shrink-0 mt-0.5" />
              <p>
                Could not find data for: {result.failedTickers.join(", ")}. These were excluded from the analysis.
              </p>
            </div>
          )}

          {/* Top row: Grade + Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Diversification Grade */}
            <div className="bg-surface-1 border border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Diversification Score</p>
              <div className="relative size-32 mb-4">
                <svg viewBox="0 0 120 120" className="size-full">
                  {/* Background circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="currentColor"
                    className="text-border"
                    strokeWidth="8"
                  />
                  {/* Score arc */}
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="currentColor"
                    className={result.grade.color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(result.grade.score / 100) * 327} 327`}
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-5xl font-display font-bold ${result.grade.color}`}>
                    {result.grade.grade}
                  </span>
                </div>
              </div>
              <p className={`text-lg font-semibold ${result.grade.color}`}>{result.grade.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{result.stockCount} stocks analyzed</p>
            </div>

            {/* Portfolio Stats */}
            <div className="lg:col-span-2 bg-surface-1 border border-border rounded-2xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="size-5 text-brand" />
                <h3 className="font-display text-lg font-semibold text-foreground">Portfolio Stats</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Avg P/E Ratio</p>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {result.stats.avgPE !== null ? result.stats.avgPE.toFixed(1) : "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Avg Beta</p>
                  <p className={`text-2xl font-display font-bold ${
                    result.stats.avgBeta !== null
                      ? result.stats.avgBeta > 1.2 ? "text-negative" : result.stats.avgBeta < 0.8 ? "text-brand" : "text-foreground"
                      : "text-foreground"
                  }`}>
                    {result.stats.avgBeta !== null ? result.stats.avgBeta.toFixed(2) : "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Market Cap</p>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {result.stats.totalMktCap !== null ? formatMktCap(result.stats.totalMktCap) : "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Avg Dividend Yield</p>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {result.stats.avgDivYield !== null ? `${result.stats.avgDivYield.toFixed(2)}%` : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sector Breakdown */}
          <div className="bg-surface-1 border border-border rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="size-5 text-brand" />
              <h3 className="font-display text-lg font-semibold text-foreground">Sector Breakdown</h3>
            </div>
            <div className="space-y-4">
              {result.sectorBreakdown.map((item) => (
                <div key={item.sector} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground font-medium">{item.sector}</span>
                    <span className="text-muted-foreground">
                      {item.count} stock{item.count !== 1 ? "s" : ""} &middot; {Math.round(item.percentage)}%
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-surface-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${SECTOR_COLORS[item.sector] || "bg-gray-500"}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Factors */}
          <div className="bg-surface-1 border border-border rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="size-5 text-brand" />
              <h3 className="font-display text-lg font-semibold text-foreground">Risk Factors</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.riskFactors.map((risk, i) => (
                <div
                  key={i}
                  className={`rounded-xl border p-5 ${
                    risk.severity === "high"
                      ? "border-negative/30 bg-negative/5"
                      : risk.severity === "medium"
                        ? "border-warning/30 bg-warning/5"
                        : "border-positive/30 bg-positive/5"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`size-2.5 rounded-full ${
                        risk.severity === "high"
                          ? "bg-negative"
                          : risk.severity === "medium"
                            ? "bg-warning"
                            : "bg-positive"
                      }`}
                    />
                    <span
                      className={`text-sm font-semibold ${
                        risk.severity === "high"
                          ? "text-negative"
                          : risk.severity === "medium"
                            ? "text-warning"
                            : "text-positive"
                      }`}
                    >
                      {risk.severity === "high" ? "High Risk" : risk.severity === "medium" ? "Medium Risk" : "Low Risk"}
                    </span>
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">{risk.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{risk.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Sectors */}
          {result.missingSectors.length > 0 && (
            <div className="bg-surface-1 border border-border rounded-2xl p-8">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="size-5 text-brand" />
                <h3 className="font-display text-lg font-semibold text-foreground">Missing Sectors</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Your portfolio has no exposure to these GICS sectors. Consider adding positions for better diversification.
              </p>
              <div className="flex flex-wrap gap-2">
                {result.missingSectors.map((sector) => (
                  <span
                    key={sector}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-4 py-2 text-sm text-muted-foreground"
                  >
                    <ChevronRight className="size-3" />
                    {sector}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Holdings Table */}
          <div className="bg-surface-1 border border-border rounded-2xl p-8">
            <h3 className="font-display text-lg font-semibold text-foreground mb-6">Holdings Detail</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 font-medium text-muted-foreground">Ticker</th>
                    <th className="pb-3 font-medium text-muted-foreground">Name</th>
                    <th className="pb-3 font-medium text-muted-foreground">Sector</th>
                    <th className="pb-3 font-medium text-muted-foreground text-right">P/E</th>
                    <th className="pb-3 font-medium text-muted-foreground text-right">Beta</th>
                    <th className="pb-3 font-medium text-muted-foreground text-right">Mkt Cap</th>
                  </tr>
                </thead>
                <tbody>
                  {result.stocks.map((stock) => (
                    <tr key={stock.ticker} className="border-b border-border/50 last:border-0">
                      <td className="py-3 font-semibold text-brand">{stock.ticker}</td>
                      <td className="py-3 text-foreground max-w-[160px] truncate">{stock.name}</td>
                      <td className="py-3 text-muted-foreground">{stock.sector}</td>
                      <td className="py-3 text-right text-foreground">
                        {stock.pe !== null ? stock.pe.toFixed(1) : "-"}
                      </td>
                      <td className={`py-3 text-right ${
                        stock.beta !== null && stock.beta > 1.2 ? "text-negative" : "text-foreground"
                      }`}>
                        {stock.beta !== null ? stock.beta.toFixed(2) : "-"}
                      </td>
                      <td className="py-3 text-right text-foreground">
                        {stock.marketCap !== null ? formatMktCap(stock.marketCap) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
