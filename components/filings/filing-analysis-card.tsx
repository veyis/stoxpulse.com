"use client";

import { cn } from "@/lib/utils";
import {
  ExternalLink,
  FileText,
  AlertTriangle,
  Bot,
  Clock,
} from "lucide-react";

interface FilingAnalysisCardProps {
  type: string;
  date: string;
  description: string;
  url: string;
  aiSummary?: string;
  significance?: number;
  className?: string;
}

const filingTypeStyles: Record<string, { bg: string; text: string }> = {
  "8-K": { bg: "bg-negative/10", text: "text-negative" },
  "10-K": { bg: "bg-info/10", text: "text-info" },
  "10-Q": { bg: "bg-info/10", text: "text-info" },
  "Form 4": { bg: "bg-brand/10", text: "text-brand" },
};

function getSignificanceStyle(significance: number) {
  if (significance >= 8)
    return { bg: "bg-negative/10", text: "text-negative", label: "Critical" };
  if (significance >= 6)
    return { bg: "bg-warning/10", text: "text-warning", label: "Notable" };
  return {
    bg: "bg-surface-2",
    text: "text-muted-foreground",
    label: "Routine",
  };
}

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const filed = new Date(dateStr);
  const diffMs = now.getTime() - filed.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  return `${diffMonths}mo ago`;
}

export function FilingAnalysisCard({
  type,
  date,
  description,
  url,
  aiSummary,
  significance,
  className,
}: FilingAnalysisCardProps) {
  const typeStyle = filingTypeStyles[type] ?? {
    bg: "bg-surface-2",
    text: "text-muted-foreground",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/50 bg-card p-5 transition-all hover:border-border",
        className
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
              typeStyle.bg,
              typeStyle.text
            )}
          >
            <FileText className="h-3 w-3" />
            {type}
          </span>

          {significance != null && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold uppercase tracking-wider",
                getSignificanceStyle(significance).bg,
                getSignificanceStyle(significance).text
              )}
            >
              {significance >= 8 && (
                <AlertTriangle className="h-2.5 w-2.5" />
              )}
              {getSignificanceStyle(significance).label} ({significance}/10)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
          <Clock className="h-3 w-3" />
          <span>{getRelativeTime(date)}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm font-medium text-foreground leading-snug mb-2">
        {description}
      </p>

      {/* AI Summary */}
      {aiSummary && (
        <div className="rounded-xl bg-brand/5 border border-brand/15 p-3.5 mb-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Bot className="h-3.5 w-3.5 text-brand" />
            <span className="text-[10px] font-bold text-brand uppercase tracking-widest">
              AI Summary
            </span>
          </div>
          <p className="text-xs text-foreground/80 leading-relaxed">
            {aiSummary}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {date}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand/80 transition-colors group"
        >
          Read full filing
          <ExternalLink className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    </div>
  );
}
