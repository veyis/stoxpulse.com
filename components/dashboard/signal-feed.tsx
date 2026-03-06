import { cn } from "@/lib/utils";
import { SignalCard } from "@/components/stocks/signal-card";
import type { SignalType } from "@/components/stocks/signal-badge";

export interface SignalFeedItem {
  type: SignalType;
  ticker: string;
  company: string;
  title: string;
  detail?: string;
  timestamp: string;
  severity?: "high" | "medium" | "low";
  sentiment?: "bullish" | "bearish" | "neutral";
  isAI?: boolean;
}

interface SignalFeedProps {
  signals: SignalFeedItem[];
  className?: string;
}

export function SignalFeed({ signals, className }: SignalFeedProps) {
  return (
    <div className={cn("rounded-xl border border-border/50 bg-card", className)}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
        <div>
          <h2 className="text-sm font-semibold font-display">AI Signals</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {signals.length} active signal{signals.length !== 1 ? "s" : ""}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-1 text-[10px] font-medium text-brand uppercase tracking-wider">
          Live
        </span>
      </div>
      <div className="p-3 space-y-2 max-h-[480px] overflow-y-auto">
        {signals.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No active signals
          </p>
        ) : (
          signals.map((signal, i) => (
            <SignalCard
              key={`${signal.ticker}-${signal.type}-${i}`}
              type={signal.type}
              ticker={signal.ticker}
              company={signal.company}
              title={signal.title}
              detail={signal.detail}
              timestamp={signal.timestamp}
              severity={signal.severity}
              isAI={signal.isAI}
            />
          ))
        )}
      </div>
    </div>
  );
}
