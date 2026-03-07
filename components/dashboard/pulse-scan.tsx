import Link from "next/link";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { tickerToSlug } from "@/data/stocks/sp500";

export interface PulseScanStock {
  ticker: string;
  name: string;
  pulseScore: number;
  grade: string;
  changePercent: number;
}

interface PulseScanProps {
  stocks: PulseScanStock[];
  className?: string;
}

function gradeColor(grade: string): string {
  if (grade.startsWith("A")) return "text-positive bg-positive/10 border-positive/20";
  if (grade.startsWith("B")) return "text-positive/80 bg-positive/5 border-positive/15";
  if (grade.startsWith("C")) return "text-warning bg-warning/10 border-warning/20";
  return "text-negative bg-negative/10 border-negative/20";
}

export function PulseScan({ stocks, className }: PulseScanProps) {
  const sorted = [...stocks].sort((a, b) => b.pulseScore - a.pulseScore);
  const top3 = sorted.slice(0, 3);
  const bottom3 = sorted.slice(-3).reverse();

  return (
    <div className={cn("rounded-xl border border-border/50 bg-card", className)}>
      <div className="px-5 py-4 border-b border-border/50">
        <h2 className="text-sm font-semibold font-display">Pulse Scan</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Watchlist ranked by Pulse Score</p>
      </div>
      <div className="divide-y divide-border/30">
        {/* Top stocks */}
        <div className="p-4 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-positive/70 mb-2">
            Highest Rated
          </p>
          {top3.map((stock) => (
            <StockRow key={stock.ticker} stock={stock} />
          ))}
        </div>
        {/* Bottom stocks */}
        <div className="p-4 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-negative/70 mb-2">
            Lowest Rated
          </p>
          {bottom3.map((stock) => (
            <StockRow key={stock.ticker} stock={stock} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StockRow({ stock }: { stock: PulseScanStock }) {
  const isPositive = stock.changePercent > 0;
  return (
    <Link
      href={`/stocks/${tickerToSlug(stock.ticker)}`}
      className="flex items-center gap-3 rounded-lg px-2 py-1.5 -mx-2 hover:bg-surface-2/50 transition-colors group"
    >
      {/* Grade badge */}
      <span
        className={cn(
          "inline-flex items-center justify-center size-8 rounded-lg border text-xs font-bold",
          gradeColor(stock.grade)
        )}
      >
        {stock.grade}
      </span>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold font-display group-hover:text-brand transition-colors">
          {stock.ticker}
        </p>
        <p className="text-xs text-muted-foreground truncate">{stock.name}</p>
      </div>
      {/* Score + change */}
      <div className="text-right">
        <p className="text-sm font-bold tabular-nums" data-numeric>{stock.pulseScore}</p>
        <p
          className={cn(
            "text-xs tabular-nums",
            isPositive ? "text-positive" : "text-negative"
          )}
          data-numeric
        >
          {isPositive ? <TrendingUp className="inline h-3 w-3 mr-0.5" /> : <TrendingDown className="inline h-3 w-3 mr-0.5" />}
          {isPositive ? "+" : ""}{stock.changePercent.toFixed(1)}%
        </p>
      </div>
    </Link>
  );
}
