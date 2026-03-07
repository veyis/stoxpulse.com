"use client";

import { useState, useEffect } from "react";
import {
  Bot,
  TrendingUp,
  TrendingDown,
  Info,
  ShieldAlert,
  AlertTriangle,
  Zap,
  Shield,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIStockAnalysis, AISignal } from "@/lib/ai/types";
import { signalConfig, type SignalType } from "./signal-badge";
import { motion, AnimatePresence } from "framer-motion";

interface AIInsightCardProps {
  ticker: string;
  className?: string;
  compact?: boolean;
}

function getSignalIcon(type: string, severity: string) {
  const config = signalConfig[type as SignalType];
  if (config) {
    const Icon = config.icon;
    return <Icon className="h-4 w-4" />;
  }
  if (severity === "high") return <ShieldAlert className="h-4 w-4" />;
  if (type.includes("beat") || type.includes("up") || type.includes("buy") || type.includes("upgrade")) {
    return <TrendingUp className="h-4 w-4" />;
  }
  if (type.includes("miss") || type.includes("down") || type.includes("sell") || type.includes("downgrade")) {
    return <TrendingDown className="h-4 w-4" />;
  }
  return <Info className="h-4 w-4" />;
}

function SentimentGauge({ score, sentiment }: { score: number; sentiment: string }) {
  const position = ((score + 1) / 2) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
        <span>Bearish</span>
        <span>Neutral</span>
        <span>Bullish</span>
      </div>
      <div className="relative h-2.5 rounded-full bg-gradient-to-r from-rose-500/30 via-zinc-500/20 to-emerald-500/30 overflow-hidden">
        <motion.div
          initial={{ left: "50%" }}
          animate={{ left: `${position}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
        >
          <div className={cn(
            "h-4 w-4 rounded-full border-2 shadow-lg",
            sentiment === "bullish"
              ? "bg-emerald-500 border-emerald-400 shadow-emerald-500/30"
              : sentiment === "bearish"
                ? "bg-rose-500 border-rose-400 shadow-rose-500/30"
                : "bg-zinc-400 border-zinc-300 shadow-zinc-400/20"
          )} />
        </motion.div>
      </div>
      <div className="text-center">
        <span className={cn(
          "text-xs font-bold tabular-nums",
          sentiment === "bullish" ? "text-emerald-400" : sentiment === "bearish" ? "text-rose-400" : "text-muted-foreground"
        )}>
          {score > 0 ? "+" : ""}{score.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

function ConfidenceBar({ confidence }: { confidence: number }) {
  const pct = Math.round((confidence ?? 0.5) * 100);
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1 w-12 rounded-full bg-surface-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full",
            pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-brand" : "bg-warning"
          )}
        />
      </div>
      <span className="text-[9px] tabular-nums text-muted-foreground font-medium">{pct}%</span>
    </div>
  );
}

function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-brand/20 bg-surface-1/40 backdrop-blur-md p-6 relative overflow-hidden", className)}>
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-brand/5 blur-[80px] pointer-events-none" />
      <div className="flex items-center gap-3 mb-6 animate-pulse">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 border border-brand/20">
          <Loader2 className="h-5 w-5 text-brand animate-spin" />
        </div>
        <div>
          <div className="h-5 w-40 bg-brand/10 rounded-md mb-1" />
          <div className="h-3 w-24 bg-brand/5 rounded-md" />
        </div>
      </div>
      <div className="space-y-3 mb-6 pt-2">
        <div className="h-4 w-full bg-brand/10 rounded-md animate-pulse" />
        <div className="h-4 w-5/6 bg-brand/10 rounded-md animate-pulse" />
        <div className="h-4 w-4/6 bg-brand/10 rounded-md animate-pulse" />
      </div>
      <div className="space-y-3">
        <div className="h-16 w-full bg-brand/5 rounded-xl animate-pulse" />
        <div className="h-16 w-full bg-brand/5 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

export function AIInsightCard({ ticker, className, compact = false }: AIInsightCardProps) {
  const [analysis, setAnalysis] = useState<AIStockAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(!compact);

  useEffect(() => {
    fetch(`/api/ai/signals?ticker=${ticker}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((data) => {
        if (!data.error) setAnalysis(data);
        else setError(true);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [ticker]);

  if (error || (!loading && !analysis)) return null;
  if (loading) return <LoadingSkeleton className={className} />;

  const data = analysis!;

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "bullish": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "bearish": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      default: return "text-brand bg-brand/10 border-brand/20";
    }
  };

  const getInterpretationColor = (interp: string) => {
    switch (interp) {
      case "positive": return "text-emerald-400";
      case "negative": return "text-rose-400";
      default: return "text-muted-foreground";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={cn(
        "ai-insight-card rounded-2xl border border-brand/30 bg-surface-1/40 backdrop-blur-md shadow-xl shadow-brand/5 relative overflow-hidden",
        compact ? "p-4" : "p-6",
        className
      )}
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-brand/10 blur-[80px] pointer-events-none" />

      {/* Header */}
      <motion.div
        variants={itemVariants}
        className={cn("flex items-center justify-between relative z-10", compact ? "mb-3" : "mb-6")}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center justify-center rounded-xl bg-brand/20 border border-brand/30 shadow-inner",
            compact ? "h-8 w-8" : "h-10 w-10"
          )}>
            <Bot className={compact ? "h-4 w-4 text-brand" : "h-5 w-5 text-brand"} />
          </div>
          <div>
            <h3 className={cn("font-display font-bold text-foreground", compact ? "text-base" : "text-lg")}>
              StoxPulse AI Analysis
            </h3>
            {!compact && (
              <p className="text-xs font-medium text-brand uppercase tracking-widest opacity-80">
                Powered by Gemini 2.5
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={cn(
            "px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5",
            getSentimentColor(data.overallSentiment)
          )}>
            {data.overallSentiment === "bullish" && <TrendingUp className="h-3.5 w-3.5" />}
            {data.overallSentiment === "bearish" && <TrendingDown className="h-3.5 w-3.5" />}
            {data.overallSentiment === "neutral" && <Info className="h-3.5 w-3.5" />}
            {data.overallSentiment}
          </div>
          {compact && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded-lg hover:bg-surface-2/50 transition-colors"
            >
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", expanded && "rotate-180")} />
            </button>
          )}
        </div>
      </motion.div>

      {/* Summary */}
      <motion.div variants={itemVariants} className={cn("relative z-10", expanded ? "mb-5 pb-5 border-b border-border/40" : "")}>
        <p className={cn("leading-relaxed text-foreground/90 font-medium", compact ? "text-sm" : "text-[15px]")}>
          {data.summary}
        </p>
      </motion.div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={compact ? { height: 0, opacity: 0 } : false}
            animate={{ height: "auto", opacity: 1 }}
            exit={compact ? { height: 0, opacity: 0 } : undefined}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Detailed Analysis */}
            {data.detailedAnalysis && data.detailedAnalysis !== data.summary && (
              <motion.div variants={itemVariants} className="mb-5 pb-5 border-b border-border/40 relative z-10">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {data.detailedAnalysis}
                </p>
              </motion.div>
            )}

            {/* Sentiment Gauge */}
            {data.sentimentScore != null && (
              <motion.div variants={itemVariants} className="mb-5 pb-5 border-b border-border/40 relative z-10">
                <SentimentGauge score={data.sentimentScore} sentiment={data.overallSentiment} />
              </motion.div>
            )}

            {/* Key Metrics Grid */}
            {data.keyMetrics && data.keyMetrics.length > 0 && (
              <motion.div variants={itemVariants} className="mb-5 pb-5 border-b border-border/40 relative z-10">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                  Key Metrics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {data.keyMetrics.map((metric, idx) => (
                    <div key={idx} className="px-3 py-2.5 rounded-lg bg-surface-2/40 border border-border/30">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                        {metric.label}
                      </p>
                      <p className={cn("text-sm font-bold tabular-nums", getInterpretationColor(metric.interpretation))}>
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Signals */}
            <div className="space-y-3 relative z-10 mb-5">
              <motion.h4
                variants={itemVariants}
                className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1"
              >
                Key Signals
              </motion.h4>

              {data.signals.map((signal: AISignal, idx: number) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-2/50 border border-border/50 hover:bg-surface-2/80 hover:border-brand/30 transition-all duration-300"
                >
                  <div className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border",
                    getSentimentColor(signal.sentiment)
                  )}>
                    {getSignalIcon(signal.type, signal.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h5 className="text-[13px] font-bold text-foreground">{signal.title}</h5>
                      {signal.severity === "high" && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-warning/20 text-warning border border-warning/30">
                          High Impact
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-muted-foreground leading-relaxed mb-1.5">
                      {signal.detail}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      {signal.confidence != null && <ConfidenceBar confidence={signal.confidence} />}
                      {signal.dataPoints && signal.dataPoints.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          {signal.dataPoints.map((dp: string, i: number) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded text-[9px] bg-surface-2 text-muted-foreground border border-border/30 font-mono truncate max-w-[200px]"
                            >
                              {dp}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Risks & Catalysts */}
            {((data.riskFactors && data.riskFactors.length > 0) ||
              (data.catalysts && data.catalysts.length > 0)) && (
              <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                {data.riskFactors && data.riskFactors.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/15">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Shield className="h-3.5 w-3.5 text-rose-400" />
                      <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest">Risk Factors</h4>
                    </div>
                    <ul className="space-y-1.5">
                      {data.riskFactors.map((risk: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <AlertTriangle className="h-3 w-3 mt-0.5 text-rose-400/60 shrink-0" />
                          <span className="text-xs text-foreground/70 leading-relaxed">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {data.catalysts && data.catalysts.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Zap className="h-3.5 w-3.5 text-emerald-400" />
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Catalysts</h4>
                    </div>
                    <ul className="space-y-1.5">
                      {data.catalysts.map((catalyst: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Zap className="h-3 w-3 mt-0.5 text-emerald-400/60 shrink-0" />
                          <span className="text-xs text-foreground/70 leading-relaxed">{catalyst}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
