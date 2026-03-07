"use client";

import { useState } from "react";
import { Zap, ChevronDown, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface DigestBullet {
  text: string;
  ticker?: string;
  sentiment?: "positive" | "negative" | "neutral";
}

interface DailyDigestCardProps {
  date: string;
  bullets: DigestBullet[];
  isWatchlistAware?: boolean;
  className?: string;
}

const INITIAL_BULLETS = 3;

const sentimentDot: Record<string, string> = {
  positive: "bg-positive",
  negative: "bg-negative",
  neutral: "bg-muted-foreground",
};

export function DailyDigestCard({
  date,
  bullets,
  isWatchlistAware,
  className,
}: DailyDigestCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = bullets.length > INITIAL_BULLETS;
  const visibleBullets = expanded ? bullets : bullets.slice(0, INITIAL_BULLETS);

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-border/50 bg-card p-5 transition-all",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:border before:border-brand/20 before:opacity-0 before:transition-opacity hover:before:opacity-100",
        "after:pointer-events-none after:absolute after:-inset-px after:rounded-2xl after:shadow-[0_0_24px_-4px] after:shadow-brand/10 after:opacity-0 after:transition-opacity hover:after:opacity-100",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand/10">
            <Zap className="h-4.5 w-4.5 text-brand" />
          </div>
          <div>
            <h3 className="text-sm font-semibold font-display text-foreground">
              AI Daily Digest
            </h3>
            <p className="text-[11px] text-muted-foreground">{formattedDate}</p>
          </div>
        </div>

        {isWatchlistAware && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-brand/10 border border-brand/20 px-2 py-0.5 text-[10px] font-semibold text-brand uppercase tracking-wider">
            <Eye className="h-3 w-3" />
            Watchlist-Aware
          </span>
        )}
      </div>

      {/* Bullet points */}
      <ul className="space-y-2.5">
        {visibleBullets.map((bullet, i) => (
          <li key={i} className="flex items-start gap-2.5">
            {/* Sentiment dot */}
            <span
              className={cn(
                "mt-1.5 shrink-0 h-2 w-2 rounded-full",
                bullet.sentiment
                  ? sentimentDot[bullet.sentiment]
                  : "bg-muted-foreground/40"
              )}
            />

            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground/90 leading-relaxed">
                {bullet.text}
              </p>
              {bullet.ticker && (
                <span className="mt-1 inline-flex items-center rounded-md bg-brand/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                  ${bullet.ticker}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Expand / collapse */}
      {hasMore && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className={cn(
            "mt-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          )}
        >
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform",
              expanded && "rotate-180"
            )}
          />
          {expanded
            ? "Show less"
            : `Full digest (${bullets.length - INITIAL_BULLETS} more)`}
        </button>
      )}
    </div>
  );
}
