"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ScoredNewsArticle {
  headline: string;
  summary?: string;
  source: string;
  url: string;
  publishedAt: string;
  importanceScore: number;
  sentiment: "positive" | "negative" | "neutral";
  relatedTickers: string[];
  category?: string;
}

interface ScoredNewsCardProps extends ScoredNewsArticle {
  className?: string;
}

function timeAgo(datetime: string): string {
  const now = new Date();
  const date = new Date(datetime);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const categoryColors: Record<string, string> = {
  Earnings: "bg-brand/10 text-brand",
  "M&A": "bg-purple-500/10 text-purple-400",
  Regulatory: "bg-warning/10 text-warning",
  Analyst: "bg-info/10 text-info",
  Macro: "bg-orange-500/10 text-orange-400",
};

export function ScoredNewsCard({
  headline,
  summary,
  source,
  url,
  publishedAt,
  importanceScore,
  sentiment,
  relatedTickers,
  category,
  className,
}: ScoredNewsCardProps) {
  const score = Math.max(1, Math.min(10, Math.round(importanceScore)));

  const scoreBadgeClass =
    score >= 8
      ? "bg-negative/15 text-negative border-negative/30"
      : score >= 6
        ? "bg-warning/15 text-warning border-warning/30"
        : "bg-muted/15 text-muted-foreground border-border/50";

  const SentimentIcon =
    sentiment === "positive"
      ? TrendingUp
      : sentiment === "negative"
        ? TrendingDown
        : Minus;

  const sentimentColor =
    sentiment === "positive"
      ? "text-positive"
      : sentiment === "negative"
        ? "text-negative"
        : "text-muted-foreground";

  const catStyle = category
    ? categoryColors[category] ?? "bg-muted/15 text-muted-foreground"
    : null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group block rounded-2xl border border-border/50 bg-card p-4 transition-all",
        "hover:bg-surface-2/50 hover:border-border",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Importance score badge */}
        <div
          className={cn(
            "shrink-0 flex items-center justify-center w-8 h-8 rounded-lg border text-xs font-bold font-display",
            scoreBadgeClass
          )}
        >
          {score}
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          {/* Top row: category + sentiment + time */}
          <div className="flex items-center gap-2 flex-wrap">
            {category && catStyle && (
              <span
                className={cn(
                  "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  catStyle
                )}
              >
                {category}
              </span>
            )}
            <SentimentIcon className={cn("h-3.5 w-3.5", sentimentColor)} />
            <span className="text-[11px] text-muted-foreground ml-auto shrink-0">
              {timeAgo(publishedAt)}
            </span>
          </div>

          {/* Headline */}
          <p className="text-sm font-medium leading-snug line-clamp-2">
            {headline}
          </p>

          {/* AI Summary */}
          {summary && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1">
              {summary}
            </p>
          )}

          {/* Bottom row: source + tickers */}
          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            <span className="text-[11px] text-muted-foreground">{source}</span>

            {relatedTickers.length > 0 && (
              <>
                <span className="text-[11px] text-muted-foreground">·</span>
                <div className="flex items-center gap-1 flex-wrap">
                  {relatedTickers.map((ticker) => (
                    <span
                      key={ticker}
                      className="inline-flex items-center rounded-md bg-brand/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand"
                    >
                      ${ticker}
                    </span>
                  ))}
                </div>
              </>
            )}

            <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
          </div>
        </div>
      </div>
    </a>
  );
}
