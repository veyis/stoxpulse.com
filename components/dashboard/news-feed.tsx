import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";

const newsItems = [
  {
    title: "NVIDIA Blackwell GPUs See Record Pre-Orders From Cloud Providers",
    source: "Reuters",
    time: "32m ago",
    tickers: ["NVDA"],
    sentiment: "bullish" as const,
    summary:
      "Microsoft, Google, and Amazon have collectively placed orders exceeding $12B for next-gen Blackwell GPUs, signaling sustained AI infrastructure demand.",
  },
  {
    title: "Fed Minutes Signal Potential Rate Cut in June Meeting",
    source: "Bloomberg",
    time: "1h ago",
    tickers: [],
    sentiment: "bullish" as const,
    summary:
      "Several FOMC members expressed openness to easing policy if inflation data continues moderating. Markets now pricing 78% probability of June cut.",
  },
  {
    title: "Tesla Deliveries Miss Estimates for Third Consecutive Quarter",
    source: "CNBC",
    time: "2h ago",
    tickers: ["TSLA"],
    sentiment: "bearish" as const,
    summary:
      "Q1 deliveries came in at 387K vs 415K expected. Competition in China intensifying with BYD gaining market share.",
  },
  {
    title: "Apple Announces $100B Share Buyback Program",
    source: "WSJ",
    time: "3h ago",
    tickers: ["AAPL"],
    sentiment: "bullish" as const,
    summary:
      "Largest buyback authorization in corporate history. Board also approved 4% dividend increase effective next quarter.",
  },
  {
    title: "SEC Proposes New AI Disclosure Requirements for Public Companies",
    source: "Financial Times",
    time: "5h ago",
    tickers: [],
    sentiment: "neutral" as const,
    summary:
      "New rules would require companies to disclose material AI usage in operations and risk factors. Comment period open until July.",
  },
  {
    title: "Amazon AWS Revenue Beats, Ad Business Surges to $14B Quarter",
    source: "TechCrunch",
    time: "6h ago",
    tickers: ["AMZN"],
    sentiment: "bullish" as const,
    summary:
      "AWS grew 19% YoY with expanding margins. Advertising segment now fourth-largest digital ad platform globally.",
  },
];

const sentimentIcon = {
  bullish: TrendingUp,
  bearish: TrendingDown,
  neutral: Minus,
};

const sentimentColor = {
  bullish: "text-positive",
  bearish: "text-negative",
  neutral: "text-muted-foreground",
};

export function NewsFeed() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Market News</CardTitle>
          <Badge variant="outline" className="text-xs">
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {newsItems.map((item, i) => {
          const SentimentIcon = sentimentIcon[item.sentiment];
          return (
            <div
              key={i}
              className="group rounded-lg border border-border bg-background p-3 space-y-2 hover:border-primary/20 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                <ExternalLink className="size-3.5 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {item.summary}
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  {item.time}
                </div>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{item.source}</span>

                {item.tickers.length > 0 && (
                  <>
                    <span className="text-xs text-muted-foreground">·</span>
                    {item.tickers.map((ticker) => (
                      <Badge
                        key={ticker}
                        variant="outline"
                        className="text-[10px] h-5 font-mono font-bold"
                      >
                        {ticker}
                      </Badge>
                    ))}
                  </>
                )}

                <div className="ml-auto">
                  <SentimentIcon className={`size-3.5 ${sentimentColor[item.sentiment]}`} />
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
