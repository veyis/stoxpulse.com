import { ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NewsItem } from "@/lib/data/types";

function timeAgo(datetime: string): string {
  const now = new Date();
  const date = new Date(datetime);
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface NewsListProps {
  news: NewsItem[];
  className?: string;
}

export function NewsList({ news, className }: NewsListProps) {
  if (news.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No recent news found.</p>;
  }

  return (
    <div className={cn("space-y-1", className)}>
      {news.map((item, i) => (
        <a
          key={item.id ?? `news-${i}`}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 rounded-md px-3 py-3 transition-colors hover:bg-surface-2/50 group"
        >
          <div className="mt-0.5 shrink-0">
            {item.sentiment === "positive" ? (
              <TrendingUp className="h-4 w-4 text-positive" />
            ) : item.sentiment === "negative" ? (
              <TrendingDown className="h-4 w-4 text-negative" />
            ) : (
              <Minus className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-sm font-medium leading-snug line-clamp-2">{item.headline}</p>
            {item.summary && (
              <p className="text-xs text-muted-foreground line-clamp-2">{item.summary}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{item.source}</span>
              <span>·</span>
              <span>{timeAgo(item.datetime)}</span>
            </div>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
        </a>
      ))}
    </div>
  );
}
