"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Filter, ChevronDown } from "lucide-react";
import { FilingAnalysisCard } from "./filing-analysis-card";

interface Filing {
  type: string;
  date: string;
  description: string;
  url: string;
  aiSummary?: string;
  significance?: number;
}

interface FilingListEnhancedProps {
  filings: Filing[];
  className?: string;
}

const filterOptions = ["All", "10-K", "10-Q", "8-K", "Form 4"] as const;
type FilterOption = (typeof filterOptions)[number];

export function FilingListEnhanced({
  filings,
  className,
}: FilingListEnhancedProps) {
  const [activeFilter, setActiveFilter] = useState<FilterOption>("All");
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    const list =
      activeFilter === "All"
        ? filings
        : filings.filter((f) => f.type === activeFilter);

    return [...list].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [filings, activeFilter]);

  const visible = showAll ? filtered : filtered.slice(0, 5);
  const hasMore = filtered.length > 5;

  if (filings.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No filings available.
      </p>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        {filterOptions.map((option) => {
          const count =
            option === "All"
              ? filings.length
              : filings.filter((f) => f.type === option).length;

          return (
            <button
              key={option}
              onClick={() => {
                setActiveFilter(option);
                setShowAll(false);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                activeFilter === option
                  ? "bg-brand/15 text-brand border border-brand/30"
                  : "bg-surface-1/60 text-muted-foreground border border-border/30 hover:bg-surface-2/50 hover:text-foreground"
              )}
            >
              {option}
              <span
                className={cn(
                  "tabular-nums text-[10px]",
                  activeFilter === option
                    ? "text-brand/70"
                    : "text-muted-foreground/60"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filing cards */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">
          No {activeFilter} filings found.
        </p>
      ) : (
        <div className="space-y-3">
          {visible.map((filing, i) => (
            <FilingAnalysisCard
              key={`${filing.type}-${filing.date}-${i}`}
              type={filing.type}
              date={filing.date}
              description={filing.description}
              url={filing.url}
              aiSummary={filing.aiSummary}
              significance={filing.significance}
            />
          ))}
        </div>
      )}

      {/* Show more */}
      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-border/50 bg-surface-1/40 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface-2/50 hover:border-border transition-all"
        >
          Show {filtered.length - 5} more filing
          {filtered.length - 5 !== 1 ? "s" : ""}
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
