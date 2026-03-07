"use client";

import { useState } from "react";
import {
  Search,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Quote,
  Target,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  ClipboardPaste,
  FileText,
} from "lucide-react";
import type { EarningsAnalysis } from "@/lib/ai/earnings-analyzer";

type Mode = "lookup" | "paste";

function SentimentGauge({
  overall,
  confidence,
}: {
  overall: string;
  confidence: number;
}) {
  const colors: Record<string, string> = {
    bullish: "text-positive",
    cautious: "text-warning",
    defensive: "text-negative",
    neutral: "text-muted-foreground",
  };
  const bgColors: Record<string, string> = {
    bullish: "bg-positive/10 border-positive/20",
    cautious: "bg-warning/10 border-warning/20",
    defensive: "bg-negative/10 border-negative/20",
    neutral: "bg-surface-2 border-border",
  };
  const icons: Record<string, typeof TrendingUp> = {
    bullish: TrendingUp,
    cautious: Minus,
    defensive: TrendingDown,
    neutral: Minus,
  };
  const Icon = icons[overall] ?? Minus;
  const color = colors[overall] ?? "text-muted-foreground";
  const bg = bgColors[overall] ?? "bg-surface-2 border-border";

  return (
    <div className={`flex items-center gap-4 rounded-xl border px-5 py-4 ${bg}`}>
      <div className={`flex items-center justify-center size-12 rounded-full ${bg}`}>
        <Icon className={`size-6 ${color}`} />
      </div>
      <div>
        <p className={`text-lg font-bold capitalize ${color}`}>{overall}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="h-1.5 w-24 rounded-full bg-surface-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                overall === "bullish"
                  ? "bg-positive"
                  : overall === "cautious"
                    ? "bg-warning"
                    : overall === "defensive"
                      ? "bg-negative"
                      : "bg-muted-foreground"
              }`}
              style={{ width: `${confidence}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{confidence}%</span>
        </div>
      </div>
    </div>
  );
}

function FlagCard({
  type,
  items,
}: {
  type: "red" | "green";
  items: {
    flag: string;
    severity?: string;
    significance?: string;
    context?: string;
  }[];
}) {
  if (items.length === 0) return null;
  const isRed = type === "red";

  return (
    <div
      className={`rounded-xl border p-5 ${isRed ? "border-negative/20 bg-negative/5" : "border-positive/20 bg-positive/5"}`}
    >
      <div className="flex items-center gap-2 mb-3">
        {isRed ? (
          <AlertTriangle className="size-4 text-negative" />
        ) : (
          <CheckCircle2 className="size-4 text-positive" />
        )}
        <h4
          className={`text-sm font-semibold ${isRed ? "text-negative" : "text-positive"}`}
        >
          {isRed ? "Red Flags" : "Green Flags"} ({items.length})
        </h4>
      </div>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-foreground">
            <span className="font-medium">{item.flag}</span>
            {(item.severity || item.significance) && (
              <span
                className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                  (item.severity ?? item.significance) === "high"
                    ? isRed
                      ? "bg-negative/10 text-negative"
                      : "bg-positive/10 text-positive"
                    : (item.severity ?? item.significance) === "medium"
                      ? "bg-warning/10 text-warning"
                      : "bg-surface-3 text-muted-foreground"
                }`}
              >
                {item.severity ?? item.significance}
              </span>
            )}
            {item.context && (
              <p className="text-xs text-muted-foreground mt-1">
                {item.context}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AnalysisResults({ analysis }: { analysis: EarningsAnalysis }) {
  const [activeTab, setActiveTab] = useState<
    "summary" | "deep-dive" | "promises"
  >("summary");

  const tabs = [
    { id: "summary" as const, label: "Summary" },
    { id: "deep-dive" as const, label: "Deep Dive" },
    {
      id: "promises" as const,
      label: `Promises (${analysis.promises.length})`,
    },
  ];

  return (
    <div className="rounded-2xl bg-surface-1 border border-border overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 border-b border-border">
        <h3 className="font-display text-base font-semibold text-foreground">
          AI Earnings Analysis
          {analysis.ticker !== "UNKNOWN" &&
            ` - ${analysis.ticker}`}
          {analysis.quarter > 0 && ` Q${analysis.quarter} ${analysis.year}`}
        </h3>
        <SentimentGauge
          overall={analysis.sentiment.overall}
          confidence={analysis.sentiment.confidence}
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? "text-brand border-b-2 border-brand"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5">
        {activeTab === "summary" && (
          <div className="space-y-5">
            {/* AI Summary */}
            <p className="text-sm text-foreground leading-relaxed">
              {analysis.summary}
            </p>

            {/* Key Numbers Grid */}
            {analysis.keyNumbers.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  Key Numbers
                </h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {analysis.keyNumbers.map((kn, i) => (
                    <div
                      key={i}
                      className="rounded-lg bg-surface-2 border border-border px-4 py-3"
                    >
                      <p className="text-xs text-muted-foreground">
                        {kn.metric}
                      </p>
                      <p className="text-lg font-bold font-mono text-foreground mt-0.5">
                        {kn.actual}
                      </p>
                      {kn.estimate && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Est: {kn.estimate}
                        </p>
                      )}
                      {kn.surprise && (
                        <p
                          className={`text-xs font-medium mt-0.5 ${
                            kn.surprise.includes("beat") ||
                            kn.surprise.includes("+")
                              ? "text-positive"
                              : kn.surprise.includes("miss") ||
                                  kn.surprise.includes("-")
                                ? "text-negative"
                                : "text-muted-foreground"
                          }`}
                        >
                          {kn.surprise}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Flags */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FlagCard type="red" items={analysis.redFlags} />
              <FlagCard type="green" items={analysis.greenFlags} />
            </div>

            {/* Key Quotes */}
            {analysis.keyQuotes.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Quote className="size-4 text-brand" />
                  <h4 className="text-sm font-semibold text-foreground">
                    Key Quotes
                  </h4>
                </div>
                <div className="space-y-3">
                  {analysis.keyQuotes.map((q, i) => (
                    <blockquote
                      key={i}
                      className="border-l-2 border-brand/30 pl-4"
                    >
                      <p className="text-sm text-foreground italic">
                        &ldquo;{q.text}&rdquo;
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        -- {q.speaker}
                        {q.significance && (
                          <span className="ml-2 text-brand">
                            {q.significance}
                          </span>
                        )}
                      </p>
                    </blockquote>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "deep-dive" && (
          <div className="space-y-5">
            {/* Guidance Changes */}
            {analysis.guidance.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="size-4 text-brand" />
                  <h4 className="text-sm font-semibold text-foreground">
                    Guidance Changes
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-2">
                          Metric
                        </th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-2">
                          Previous
                        </th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-2">
                          Current
                        </th>
                        <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider py-2">
                          Direction
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {analysis.guidance.map((g, i) => (
                        <tr key={i}>
                          <td className="py-2.5 text-foreground font-medium">
                            {g.metric}
                          </td>
                          <td className="py-2.5 text-muted-foreground">
                            {g.previous || "--"}
                          </td>
                          <td className="py-2.5 text-foreground">{g.current}</td>
                          <td className="py-2.5 text-right">
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                g.direction === "raised"
                                  ? "bg-positive/10 text-positive"
                                  : g.direction === "lowered"
                                    ? "bg-negative/10 text-negative"
                                    : g.direction === "new"
                                      ? "bg-brand/10 text-brand"
                                      : "bg-surface-3 text-muted-foreground"
                              }`}
                            >
                              {g.direction}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tone Shifts */}
            {analysis.sentiment.toneShifts &&
              analysis.sentiment.toneShifts.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    Tone Shifts Detected
                  </h4>
                  <ul className="space-y-1.5">
                    {analysis.sentiment.toneShifts.map((shift, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="text-warning mt-0.5">*</span>
                        {shift}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Q&A Highlights */}
            {analysis.qaHighlights.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="size-4 text-brand" />
                  <h4 className="text-sm font-semibold text-foreground">
                    Q&A Highlights
                  </h4>
                </div>
                <div className="space-y-4">
                  {analysis.qaHighlights.map((qa, i) => (
                    <div
                      key={i}
                      className="rounded-lg bg-surface-2 border border-border p-4"
                    >
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">
                        {qa.analyst && (
                          <span className="text-foreground">{qa.analyst}: </span>
                        )}
                        {qa.question}
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {qa.answer}
                      </p>
                      {qa.insight && (
                        <p className="text-xs text-brand mt-2 font-medium">
                          Insight: {qa.insight}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vs Last Quarter */}
            {analysis.sentiment.vsLastQuarter &&
              analysis.sentiment.vsLastQuarter !== "unknown" && (
                <div className="rounded-lg bg-surface-2 border border-border px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    vs. Last Quarter
                  </p>
                  <p
                    className={`text-sm font-semibold capitalize mt-0.5 ${
                      analysis.sentiment.vsLastQuarter === "improved"
                        ? "text-positive"
                        : analysis.sentiment.vsLastQuarter === "deteriorated"
                          ? "text-negative"
                          : "text-muted-foreground"
                    }`}
                  >
                    {analysis.sentiment.vsLastQuarter}
                  </p>
                </div>
              )}
          </div>
        )}

        {activeTab === "promises" && (
          <div className="space-y-3">
            {analysis.promises.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No trackable promises extracted from this call.
              </p>
            ) : (
              analysis.promises.map((promise, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-surface-2 border border-border p-4"
                >
                  <p className="text-sm text-foreground font-medium">
                    &ldquo;{promise.statement}&rdquo;
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">
                      -- {promise.speaker}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        promise.category === "guidance"
                          ? "bg-brand/10 text-brand"
                          : promise.category === "operational"
                            ? "bg-info/10 text-info"
                            : "bg-warning/10 text-warning"
                      }`}
                    >
                      {promise.category}
                    </span>
                    {promise.deadline && (
                      <span className="text-xs text-muted-foreground">
                        Deadline: {promise.deadline}
                      </span>
                    )}
                    {promise.measurable && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-positive/10 text-positive">
                        Measurable
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function EarningsSummarizer() {
  const [mode, setMode] = useState<Mode>("lookup");

  // Lookup mode state
  const [ticker, setTicker] = useState("");
  const [quarter, setQuarter] = useState("4");
  const [year, setYear] = useState("2025");

  // Paste mode state
  const [transcript, setTranscript] = useState("");
  const [pasteTicker, setPasteTicker] = useState("");

  // Shared state
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<EarningsAnalysis | null>(null);
  const [error, setError] = useState("");

  const resetResults = () => {
    setAnalysis(null);
    setError("");
  };

  const handleLookup = async () => {
    if (!ticker.trim()) return;
    setLoading(true);
    resetResults();

    try {
      const params = new URLSearchParams({
        ticker: ticker.toUpperCase(),
        quarter,
        year,
      });
      const res = await fetch(`/api/ai/earnings?${params}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to analyze earnings call");
      }
      setAnalysis(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    if (transcript.trim().length < 500) {
      setError("Please paste at least 500 characters of transcript text.");
      return;
    }
    setLoading(true);
    resetResults();

    try {
      const res = await fetch("/api/ai/earnings-paste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: transcript.trim(),
          ticker: pasteTicker.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to analyze transcript");
      }
      setAnalysis(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Tabs */}
      <div className="rounded-2xl border border-border bg-surface-1 overflow-hidden">
        <div className="flex border-b border-border">
          <button
            onClick={() => {
              setMode("lookup");
              resetResults();
            }}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors ${
              mode === "lookup"
                ? "text-brand border-b-2 border-brand bg-brand/5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Search className="size-4" />
            Ticker Lookup
          </button>
          <button
            onClick={() => {
              setMode("paste");
              resetResults();
            }}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors ${
              mode === "paste"
                ? "text-brand border-b-2 border-brand bg-brand/5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ClipboardPaste className="size-4" />
            Paste Transcript
          </button>
        </div>

        <div className="p-6">
          {mode === "lookup" ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter a stock ticker and select the earnings quarter to analyze.
                We will fetch the transcript and generate an AI-powered summary.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Stock Ticker
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={ticker}
                      onChange={(e) => setTicker(e.target.value.toUpperCase())}
                      placeholder="AAPL"
                      className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
                      onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Quarter
                  </label>
                  <select
                    value={quarter}
                    onChange={(e) => setQuarter(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50 appearance-none"
                    disabled={loading}
                  >
                    <option value="1">Q1</option>
                    <option value="2">Q2</option>
                    <option value="3">Q3</option>
                    <option value="4">Q4</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Year
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50 appearance-none"
                    disabled={loading}
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleLookup}
                disabled={loading || !ticker.trim()}
                className="inline-flex items-center justify-center rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FileText className="size-4 mr-2" />
                    Analyze Earnings Call
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Paste a full earnings call transcript below. Optionally provide
                the ticker symbol for additional context in the analysis.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Ticker (optional)
                  </label>
                  <input
                    type="text"
                    value={pasteTicker}
                    onChange={(e) =>
                      setPasteTicker(e.target.value.toUpperCase())
                    }
                    placeholder="AAPL"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Earnings Call Transcript
                </label>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste the full earnings call transcript here..."
                  rows={12}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50 resize-y font-mono leading-relaxed"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  {transcript.length.toLocaleString()} characters
                  {transcript.length > 0 && transcript.length < 500 && (
                    <span className="text-warning ml-2">
                      (minimum 500 characters required)
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={handlePaste}
                disabled={loading || transcript.trim().length < 500}
                className="inline-flex items-center justify-center rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Analyzing Transcript...
                  </>
                ) : (
                  <>
                    <FileText className="size-4 mr-2" />
                    Summarize Transcript
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="rounded-2xl bg-surface-1 border border-border p-8 text-center">
          <Loader2 className="size-8 text-brand animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-3">
            AI is analyzing the earnings call transcript...
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            This typically takes 15-30 seconds.
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="rounded-2xl border border-negative/20 bg-negative/5 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 text-negative shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-negative">
                Analysis Failed
              </p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              {error === "Transcript not available" && (
                <p className="text-xs text-muted-foreground mt-2">
                  The transcript for this ticker and quarter may not be available
                  yet. Try a different quarter or paste the transcript manually
                  using the &ldquo;Paste Transcript&rdquo; tab.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {analysis && !loading && <AnalysisResults analysis={analysis} />}
    </div>
  );
}
