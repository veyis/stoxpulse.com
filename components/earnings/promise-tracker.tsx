"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock, AlertCircle, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";

interface ManagementPromise {
  id: string;
  statement: string;
  speaker: string;
  category: "guidance" | "operational" | "strategic";
  measurable: boolean;
  madeQuarter: string;
  deadline: string;
  status: "pending" | "delivered" | "partial" | "broken";
  resolution: string | null;
}

interface PromiseTrackerData {
  ticker: string;
  promises: ManagementPromise[];
  credibilityScore: number;
  trend: "improving" | "stable" | "declining";
}

const statusConfig = {
  delivered: { icon: CheckCircle2, color: "text-positive", bg: "bg-positive/10", border: "border-positive/20", label: "Delivered" },
  partial: { icon: AlertCircle, color: "text-warning", bg: "bg-warning/10", border: "border-warning/20", label: "Partial" },
  broken: { icon: XCircle, color: "text-negative", bg: "bg-negative/10", border: "border-negative/20", label: "Broken" },
  pending: { icon: Clock, color: "text-muted-foreground", bg: "bg-muted/10", border: "border-border", label: "Pending" },
};

const categoryLabels = {
  guidance: "Guidance",
  operational: "Operations",
  strategic: "Strategy",
};

export function PromiseTrackerCard({
  ticker,
  className,
}: {
  ticker: string;
  className?: string;
}) {
  const [data, setData] = useState<PromiseTrackerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");

  useEffect(() => {
    fetch(`/api/ai/promises?ticker=${ticker}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [ticker]);

  if (loading) {
    return (
      <div className={cn("rounded-2xl border border-border bg-surface-1 p-8 flex items-center justify-center", className)}>
        <Loader2 className="size-5 text-brand animate-spin" />
      </div>
    );
  }

  if (!data || data.promises.length === 0) {
    return (
      <div className={cn("rounded-2xl border border-border bg-surface-1 p-8 text-center", className)}>
        <Clock className="size-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          No management promises tracked yet for {ticker}.
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Promises are extracted from earnings call analysis.
        </p>
      </div>
    );
  }

  const filtered = data.promises.filter((p) => {
    if (filter === "pending") return p.status === "pending";
    if (filter === "resolved") return p.status !== "pending";
    return true;
  });

  const TrendIcon = data.trend === "improving" ? TrendingUp : data.trend === "declining" ? TrendingDown : Minus;
  const trendColor = data.trend === "improving" ? "text-positive" : data.trend === "declining" ? "text-negative" : "text-muted-foreground";

  return (
    <div className={cn("rounded-2xl border border-border bg-surface-1 overflow-hidden", className)}>
      {/* Header with credibility score */}
      <div className="px-6 py-5 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold font-display">Management Promise Tracker</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {data.promises.length} promises tracked
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-display tabular-nums" data-numeric>
              {data.credibilityScore}%
            </span>
            <TrendIcon className={cn("size-4", trendColor)} />
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Credibility
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-6 py-3 border-b border-border/50 flex gap-2">
        {(["all", "pending", "resolved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              filter === f
                ? "bg-brand text-white"
                : "bg-surface-2 text-muted-foreground hover:text-foreground"
            )}
          >
            {f === "all" ? "All" : f === "pending" ? "Pending" : "Resolved"}
          </button>
        ))}
      </div>

      {/* Promise list */}
      <div className="divide-y divide-border/30 max-h-96 overflow-y-auto">
        {filtered.map((promise) => {
          const config = statusConfig[promise.status];
          const Icon = config.icon;
          return (
            <div key={promise.id} className="px-6 py-4">
              <div className="flex items-start gap-3">
                <div className={cn("mt-0.5 size-6 rounded-full flex items-center justify-center flex-shrink-0", config.bg)}>
                  <Icon className={cn("size-3.5", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-relaxed">
                    &ldquo;{promise.statement}&rdquo;
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {promise.speaker}
                    </span>
                    <span className="text-muted-foreground/30">|</span>
                    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border", config.bg, config.border, config.color)}>
                      {config.label}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {categoryLabels[promise.category]}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {promise.madeQuarter} → {promise.deadline}
                    </span>
                  </div>
                  {promise.resolution && (
                    <p className="mt-2 text-xs text-muted-foreground italic">
                      Resolution: {promise.resolution}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="px-6 py-8 text-center text-sm text-muted-foreground">
            No promises match this filter.
          </div>
        )}
      </div>
    </div>
  );
}
