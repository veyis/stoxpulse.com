import { getNews } from "@/lib/data";
import { DEFAULT_WATCHLIST } from "@/lib/data/dashboard";
import { connection } from "next/server";
import { ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { NewsItem } from "@/lib/data/types";

export const metadata = {
  title: "Market News — StoxPulse",
};

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

export default async function NewsPage() {
  await connection();

  // Fetch news for all watchlist tickers
  const results = await Promise.all(
    DEFAULT_WATCHLIST.map((ticker) => getNews(ticker, 5).catch(() => []))
  );

  // Flatten, deduplicate, sort by date
  const seen = new Set<string>();
  const allNews: NewsItem[] = [];
  for (const items of results) {
    for (const item of items) {
      const key = item.headline.toLowerCase().slice(0, 50);
      if (seen.has(key)) continue;
      seen.add(key);
      allNews.push(item);
    }
  }
  allNews.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-display tracking-tight">Market News</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Latest financial news across your watchlist. {allNews.length} articles.
        </p>
      </div>

      <div className="rounded-xl border border-border/50 bg-card">
        <div className="divide-y divide-border/30">
          {allNews.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">
              No recent news found.
            </p>
          ) : (
            allNews.map((item, i) => (
              <a
                key={item.id ?? `news-${i}`}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 px-5 py-4 hover:bg-surface-2/30 transition-colors group"
              >
                <div className="mt-1 shrink-0">
                  {item.sentiment === "positive" ? (
                    <TrendingUp className="h-4 w-4 text-positive" />
                  ) : item.sentiment === "negative" ? (
                    <TrendingDown className="h-4 w-4 text-negative" />
                  ) : (
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <p className="text-sm font-medium leading-snug group-hover:text-brand transition-colors">
                    {item.headline}
                  </p>
                  {item.summary && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {item.summary}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="font-medium">{item.source}</span>
                    <span className="text-border">·</span>
                    <span>{timeAgo(item.datetime)}</span>
                    {item.relatedTickers.length > 0 && (
                      <>
                        <span className="text-border">·</span>
                        <span className="font-mono font-bold text-foreground/70">
                          {item.relatedTickers.slice(0, 3).join(", ")}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1.5" />
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
