"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Quote,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  MessageSquare,
  Loader2,
} from "lucide-react";
import type { EarningsAnalysis } from "@/lib/ai/earnings-analyzer";

interface EarningsAnalysisCardProps {
  ticker: string;
  quarter: number;
  year: number;
}

function SentimentGauge({ overall, confidence }: { overall: string; confidence: number }) {
  const colors: Record<string, string> = {
    bullish: "text-positive",
    cautious: "text-warning",
    defensive: "text-negative",
    neutral: "text-muted-foreground",
  };
  const icons: Record<string, typeof TrendingUp> = {
    bullish: TrendingUp,
    cautious: Minus,
    defensive: TrendingDown,
    neutral: Minus,
  };
  const Icon = icons[overall] ?? Minus;
  const color = colors[overall] ?? "text-muted-foreground";

  return (
    <div className="flex items-center gap-3 rounded-xl bg-surface-2 border border-border px-4 py-3">
      <Icon className={`size-5 ${color}`} />
      <div>
        <p className={`text-sm font-semibold capitalize ${color}`}>{overall}</p>
        <p className="text-xs text-muted-foreground">
          Confidence: {confidence}%
        </p>
      </div>
    </div>
  );
}

function FlagCard({
  type,
  items,
}: {
  type: "red" | "green";
  items: { flag: string; severity?: string; significance?: string; context?: string }[];
}) {
  if (items.length === 0) return null;
  const isRed = type === "red";

  return (
    <div className={`rounded-xl border p-4 ${isRed ? "border-negative/20 bg-negative/5" : "border-positive/20 bg-positive/5"}`}>
      <div className="flex items-center gap-2 mb-3">
        {isRed ? (
          <AlertTriangle className="size-4 text-negative" />
        ) : (
          <CheckCircle2 className="size-4 text-positive" />
        )}
        <h4 className={`text-sm font-semibold ${isRed ? "text-negative" : "text-positive"}`}>
          {isRed ? "Red Flags" : "Green Flags"} ({items.length})
        </h4>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-foreground">
            <span className="font-medium">{item.flag}</span>
            {item.context && (
              <p className="text-xs text-muted-foreground mt-0.5">{item.context}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EarningsAnalysisCard({ ticker, quarter, year }: EarningsAnalysisCardProps) {
  const [analysis, setAnalysis] = useState<EarningsAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "deep-dive" | "promises">("summary");

  useEffect(() => {
    async function fetch() {
      try {
        const res = await globalThis.fetch(
          `/api/ai/earnings?ticker=${ticker}&quarter=${quarter}&year=${year}`
        );
        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? "Failed to load");
          return;
        }
        setAnalysis(await res.json());
      } catch {
        setError("Failed to load earnings analysis");
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [ticker, quarter, year]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-surface-1 border border-border p-6">
        <div className="flex items-center gap-3">
          <Loader2 className="size-5 text-brand animate-spin" />
          <p className="text-sm text-muted-foreground">
            Analyzing Q{quarter} {year} earnings call...
          </p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="rounded-2xl bg-surface-1 border border-border p-6">
        <p className="text-sm text-muted-foreground">
          {error === "Transcript not available"
            ? `Q${quarter} ${year} earnings transcript not yet available.`
            : "Unable to generate earnings analysis at this time."}
        </p>
      </div>
    );
  }

  const tabs = [
    { id: "summary" as const, label: "Summary" },
    { id: "deep-dive" as const, label: "Deep Dive" },
    { id: "promises" as const, label: `Promises (${analysis.promises.length})` },
  ];

  return (
    <div className="rounded-2xl bg-surface-1 border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">
          AI Earnings Analysis — Q{quarter} {year}
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
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {analysis.keyNumbers.map((kn, i) => (
                  <div key={i} className="rounded-lg bg-surface-2 border border-border px-4 py-3">
                    <p className="text-xs text-muted-foreground">{kn.metric}</p>
                    <p className="text-lg font-bold font-mono text-foreground mt-0.5">
                      {kn.actual}
                    </p>
                    {kn.surprise && (
                      <p className={`text-xs font-medium mt-0.5 ${
                        kn.surprise.includes("beat") || kn.surprise.includes("+") ? "text-positive" : "text-negative"
                      }`}>
                        {kn.surprise}
                      </p>
                    )}
                  </div>
                ))}
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
                  <h4 className="text-sm font-semibold text-foreground">Key Quotes</h4>
                </div>
                <div className="space-y-3">
                  {analysis.keyQuotes.map((q, i) => (
                    <blockquote key={i} className="border-l-2 border-brand/30 pl-4">
                      <p className="text-sm text-foreground italic">&ldquo;{q.text}&rdquo;</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        — {q.speaker}
                        {q.significance && <span className="ml-2 text-brand">{q.significance}</span>}
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
                  <h4 className="text-sm font-semibold text-foreground">Guidance Changes</h4>
                </div>
                <div className="space-y-2">
                  {analysis.guidance.map((g, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-surface-2 px-4 py-2.5">
                      <span className="text-sm text-foreground">{g.metric}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{g.current}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          g.direction === "raised" ? "bg-positive/10 text-positive" :
                          g.direction === "lowered" ? "bg-negative/10 text-negative" :
                          "bg-surface-3 text-muted-foreground"
                        }`}>
                          {g.direction}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tone Shifts */}
            {analysis.sentiment.toneShifts.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Tone Shifts</h4>
                <ul className="space-y-1">
                  {analysis.sentiment.toneShifts.map((shift, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {shift}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Q&A Highlights */}
            {analysis.qaHighlights.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="size-4 text-brand" />
                  <h4 className="text-sm font-semibold text-foreground">Q&A Highlights</h4>
                </div>
                <div className="space-y-4">
                  {analysis.qaHighlights.map((qa, i) => (
                    <div key={i} className="rounded-lg bg-surface-2 border border-border p-4">
                      <p className="text-xs text-muted-foreground mb-1">
                        {qa.analyst && `${qa.analyst}: `}{qa.question}
                      </p>
                      <p className="text-sm text-foreground">{qa.answer}</p>
                      {qa.insight && (
                        <p className="text-xs text-brand mt-1.5">{qa.insight}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "promises" && (
          <div className="space-y-3">
            {analysis.promises.length === 0 ? (
              <p className="text-sm text-muted-foreground">No trackable promises extracted from this call.</p>
            ) : (
              analysis.promises.map((promise, i) => (
                <div key={i} className="rounded-lg bg-surface-2 border border-border p-4">
                  <p className="text-sm text-foreground font-medium">&ldquo;{promise.statement}&rdquo;</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground">— {promise.speaker}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      promise.category === "guidance" ? "bg-brand/10 text-brand" :
                      promise.category === "operational" ? "bg-info/10 text-info" :
                      "bg-warning/10 text-warning"
                    }`}>
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
