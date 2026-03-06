"use client";

import { cn } from "@/lib/utils";
import { SignalBadge, signalConfig, type SignalType } from "./signal-badge";

interface SignalCardProps {
  type: SignalType;
  ticker: string;
  company: string;
  title: string;
  detail?: string;
  timestamp: string;
  severity?: "high" | "medium" | "low";
  isAI?: boolean;
  className?: string;
  onClick?: () => void;
}

export function SignalCard({
  type,
  ticker,
  company,
  title,
  detail,
  timestamp,
  severity,
  isAI,
  className,
  onClick,
}: SignalCardProps) {
  const config = signalConfig[type];

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg border border-border/50 bg-card p-4 transition-all",
        "border-l-[3px]",
        config.border,
        "hover:bg-surface-2/50 hover:border-border",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <SignalBadge type={type} />
            {isAI && (
              <span className="inline-flex items-center gap-0.5 rounded bg-brand/10 px-1.5 py-0.5 text-[9px] font-semibold text-brand uppercase tracking-wider">
                AI
              </span>
            )}
            {severity === "high" && (
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-negative animate-pulse" />
            )}
            <span className="text-[11px] text-muted-foreground">{timestamp}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold font-display">{ticker}</span>
            <span className="text-xs text-muted-foreground truncate">{company}</span>
          </div>
          <p className="text-sm font-medium leading-snug">{title}</p>
          {detail && (
            <p className="text-xs text-muted-foreground leading-relaxed">{detail}</p>
          )}
        </div>
      </div>
    </button>
  );
}
