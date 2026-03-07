"use client";

import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Bot,
  ShieldCheck,
  AlertCircle,
  User,
} from "lucide-react";

interface InsiderContextCardProps {
  name: string;
  title: string;
  type: "Buy" | "Sale";
  shares: number;
  pricePerShare: number;
  totalValue: number;
  date: string;
  isRoutine: boolean;
  aiContext?: string;
  signalStrength?: "weak" | "moderate" | "strong";
  className?: string;
}

function formatDollarValue(num: number): string {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}K`;
  return `$${num.toLocaleString()}`;
}

function formatPrice(num: number): string {
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const signalStrengthConfig = {
  weak: { width: "w-1/3", color: "bg-muted-foreground/40", label: "Weak Signal" },
  moderate: { width: "w-2/3", color: "bg-warning", label: "Moderate Signal" },
  strong: { width: "w-full", color: "bg-positive", label: "Strong Signal" },
};

export function InsiderContextCard({
  name,
  title: role,
  type,
  shares,
  pricePerShare,
  totalValue,
  date,
  isRoutine,
  aiContext,
  signalStrength,
  className,
}: InsiderContextCardProps) {
  const isBuy = type === "Buy";

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/50 bg-card p-5 transition-all hover:border-border",
        "border-l-[3px]",
        isBuy ? "border-l-positive" : "border-l-negative",
        className
      )}
    >
      {/* Header: Person + Type */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
              isBuy
                ? "bg-positive/10 border-positive/20"
                : "bg-negative/10 border-negative/20"
            )}
          >
            <User className={cn("h-4 w-4", isBuy ? "text-positive" : "text-negative")} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold font-display text-foreground truncate">
              {name}
            </p>
            <p className="text-xs text-muted-foreground truncate">{role}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Routine / Discretionary badge */}
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold uppercase tracking-wider",
              isRoutine
                ? "bg-surface-2 text-muted-foreground"
                : "bg-warning/10 text-warning"
            )}
          >
            {isRoutine ? (
              <ShieldCheck className="h-2.5 w-2.5" />
            ) : (
              <AlertCircle className="h-2.5 w-2.5" />
            )}
            {isRoutine ? "Routine" : "Discretionary"}
          </span>

          {/* Buy / Sale badge */}
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
              isBuy
                ? "bg-positive/10 text-positive"
                : "bg-negative/10 text-negative"
            )}
          >
            {isBuy ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {type}
          </span>
        </div>
      </div>

      {/* Transaction details */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl bg-surface-1/60 border border-border/30 px-3 py-2.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
            Total Value
          </p>
          <p
            className={cn(
              "text-sm font-bold tabular-nums",
              isBuy ? "text-positive" : "text-negative"
            )}
          >
            {formatDollarValue(totalValue)}
          </p>
        </div>
        <div className="rounded-xl bg-surface-1/60 border border-border/30 px-3 py-2.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
            Shares
          </p>
          <p className="text-sm font-bold tabular-nums text-foreground">
            {shares.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl bg-surface-1/60 border border-border/30 px-3 py-2.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
            Price/Share
          </p>
          <p className="text-sm font-bold tabular-nums text-foreground">
            {formatPrice(pricePerShare)}
          </p>
        </div>
      </div>

      {/* Signal strength bar */}
      {signalStrength && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Signal Strength
            </span>
            <span
              className={cn(
                "text-[10px] font-semibold",
                signalStrength === "strong"
                  ? "text-positive"
                  : signalStrength === "moderate"
                    ? "text-warning"
                    : "text-muted-foreground"
              )}
            >
              {signalStrengthConfig[signalStrength].label}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                signalStrengthConfig[signalStrength].width,
                signalStrengthConfig[signalStrength].color
              )}
            />
          </div>
        </div>
      )}

      {/* AI Context */}
      {aiContext && (
        <div className="rounded-xl bg-brand/5 border border-brand/15 p-3.5 mb-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Bot className="h-3.5 w-3.5 text-brand" />
            <span className="text-[10px] font-bold text-brand uppercase tracking-widest">
              AI Context
            </span>
          </div>
          <p className="text-xs text-foreground/80 leading-relaxed">
            {aiContext}
          </p>
        </div>
      )}

      {/* Footer date */}
      <p className="text-[11px] text-muted-foreground tabular-nums">{date}</p>
    </div>
  );
}
