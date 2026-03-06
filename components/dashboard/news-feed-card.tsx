"use client";

import { cn } from "@/lib/utils";
import { ExternalLink, TrendingUp, TrendingDown, Minus, Newspaper } from "lucide-react";
import type { NewsItem } from "@/lib/data/types";

interface NewsFeedCardProps {
  news: NewsItem[];
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

export function NewsFeedCard({ news, className }: NewsFeedCardProps) {
  return (
    <div className={cn("rounded-xl border border-border/50 bg-card", className)}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
        <div>
          <h2 className="text-sm font-semibold font-display">Market News</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Latest headlines
          </p>
        </div>
        <Newspaper className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="p-2 space-y-0.5 max-h-[480px] overflow-y-auto">
        {news.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No recent news
          </p>
        ) : (
          news.map((item, i) => (
            <a
              key={item.id ?? `news-${i}`}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-surface-2/50 group"
            >
              <div className="mt-0.5 shrink-0">
                {item.sentiment === "positive" ? (
                  <TrendingUp className="h-3.5 w-3.5 text-positive" />
                ) : item.sentiment === "negative" ? (
                  <TrendingDown className="h-3.5 w-3.5 text-negative" />
                ) : (
                  <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs font-medium leading-snug line-clamp-2 group-hover:text-brand transition-colors">
                  {item.headline}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span>{item.source}</span>
                  <span>·</span>
                  <span>{timeAgo(item.datetime)}</span>
                  {item.relatedTickers.length > 0 && (
                    <>
                      <span>·</span>
                      <span className="font-mono font-bold text-foreground/70">
                        {item.relatedTickers.slice(0, 2).join(", ")}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
            </a>
          ))
        )}
      </div>
    </div>
  );
}
