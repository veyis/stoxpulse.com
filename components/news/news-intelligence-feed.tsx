"use client";

import { useState, useMemo } from "react";
import { Filter, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScoredNewsCard, type ScoredNewsArticle } from "./scored-news-card";

const IMPORTANCE_OPTIONS = [
  { label: "All", value: 0 },
  { label: "6+", value: 6 },
  { label: "7+", value: 7 },
  { label: "8+", value: 8 },
] as const;

const SENTIMENT_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Bullish", value: "positive" },
  { label: "Bearish", value: "negative" },
] as const;

const CATEGORY_OPTIONS = [
  "All",
  "Earnings",
  "M&A",
  "Regulatory",
  "Analyst",
  "Macro",
] as const;

const INITIAL_VISIBLE = 10;
const LOAD_MORE_COUNT = 10;

interface NewsIntelligenceFeedProps {
  articles: ScoredNewsArticle[];
  className?: string;
}

export function NewsIntelligenceFeed({
  articles,
  className,
}: NewsIntelligenceFeedProps) {
  const [importanceThreshold, setImportanceThreshold] = useState(0);
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      if (a.importanceScore < importanceThreshold) return false;
      if (sentimentFilter !== "all" && a.sentiment !== sentimentFilter)
        return false;
      if (categoryFilter !== "All" && a.category !== categoryFilter)
        return false;
      return true;
    });
  }, [articles, importanceThreshold, sentimentFilter, categoryFilter]);

  // Reset visible count when filters change
  const visibleArticles = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filter controls */}
      <div className="space-y-3 rounded-2xl border border-border/50 bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {/* Importance threshold */}
          <div className="space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Importance
            </span>
            <div className="flex items-center gap-1">
              {IMPORTANCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setImportanceThreshold(opt.value);
                    setVisibleCount(INITIAL_VISIBLE);
                  }}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                    importanceThreshold === opt.value
                      ? "bg-brand/15 text-brand border border-brand/30"
                      : "bg-surface-1 text-muted-foreground border border-border/50 hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sentiment filter */}
          <div className="space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Sentiment
            </span>
            <div className="flex items-center gap-1">
              {SENTIMENT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSentimentFilter(opt.value);
                    setVisibleCount(INITIAL_VISIBLE);
                  }}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                    sentimentFilter === opt.value
                      ? "bg-brand/15 text-brand border border-brand/30"
                      : "bg-surface-1 text-muted-foreground border border-border/50 hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category filter */}
          <div className="space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Category
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategoryFilter(cat);
                    setVisibleCount(INITIAL_VISIBLE);
                  }}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                    categoryFilter === cat
                      ? "bg-brand/15 text-brand border border-brand/30"
                      : "bg-surface-1 text-muted-foreground border border-border/50 hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Count */}
        <p className="text-xs text-muted-foreground">
          Showing {Math.min(visibleCount, filtered.length)} of{" "}
          {filtered.length} article{filtered.length !== 1 ? "s" : ""}
          {filtered.length !== articles.length && (
            <span className="text-muted-foreground/60">
              {" "}
              ({articles.length} total)
            </span>
          )}
        </p>
      </div>

      {/* Articles list */}
      {visibleArticles.length > 0 ? (
        <div className="space-y-2">
          {visibleArticles.map((article, i) => (
            <ScoredNewsCard key={`${article.url}-${i}`} {...article} />
          ))}

          {hasMore && (
            <button
              onClick={() =>
                setVisibleCount((prev) => prev + LOAD_MORE_COUNT)
              }
              className={cn(
                "w-full rounded-2xl border border-border/50 bg-card py-3 text-sm font-medium",
                "text-muted-foreground transition-colors hover:text-foreground hover:bg-surface-2/50"
              )}
            >
              Show more ({filtered.length - visibleCount} remaining)
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/50 bg-card py-12">
          <Newspaper className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No articles match your filters
          </p>
        </div>
      )}
    </div>
  );
}
