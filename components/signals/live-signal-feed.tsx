"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignalBadge, signalConfig, type SignalType } from "@/components/stocks/signal-badge";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { tickerToSlug } from "@/data/stocks/sp500";

interface LiveSignal {
  type: SignalType;
  ticker: string;
  company: string;
  title: string;
  detail?: string;
  timestamp: string;
  severity?: "high" | "medium" | "low";
  sentiment?: "bullish" | "bearish" | "neutral";
}

export function LiveSignalFeed() {
  const [signals, setSignals] = useState<LiveSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/live-signals")
      .then((r) => r.json())
      .then((data) => {
        setSignals(data.signals ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-brand" />
        <span className="ml-3 text-sm text-muted-foreground">
          Scanning markets for signals...
        </span>
      </div>
    );
  }

  if (error || signals.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-muted-foreground">
          {error
            ? "Unable to load signals right now. Try again later."
            : "No active signals at the moment. Check back during market hours."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {signals.map((signal, i) => {
        const config = signalConfig[signal.type] ?? signalConfig["ai-insight"];
        const slug = tickerToSlug(signal.ticker);

        return (
          <Link
            key={`${signal.ticker}-${signal.type}-${i}`}
            href={`/stocks/${slug}`}
            className={cn(
              "block rounded-xl border border-border/50 bg-surface-1 p-5 transition-all",
              "border-l-[3px]",
              config.border,
              "hover:bg-surface-2/50 hover:border-border hover:shadow-lg hover:shadow-black/5"
            )}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <SignalBadge type={signal.type} />
                {signal.severity === "high" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-negative/10 px-2 py-0.5 text-[10px] font-semibold text-negative uppercase tracking-wider">
                    High Impact
                  </span>
                )}
                {signal.sentiment && (
                  <span
                    className={cn(
                      "text-[10px] font-medium uppercase tracking-wider",
                      signal.sentiment === "bullish"
                        ? "text-positive"
                        : signal.sentiment === "bearish"
                          ? "text-negative"
                          : "text-muted-foreground"
                    )}
                  >
                    {signal.sentiment}
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold font-display">
                  {signal.ticker}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {signal.company}
                </span>
              </div>
              <p className="text-sm font-medium leading-snug text-foreground">
                {signal.title}
              </p>
              {signal.detail && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {signal.detail}
                </p>
              )}
              <p className="text-[11px] text-muted-foreground/60">
                {signal.timestamp}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
