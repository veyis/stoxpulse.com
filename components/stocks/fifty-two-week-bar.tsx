import { cn } from "@/lib/utils";

interface FiftyTwoWeekBarProps {
  low: number;
  high: number;
  current: number;
  className?: string;
}

export function FiftyTwoWeekBar({ low, high, current, className }: FiftyTwoWeekBarProps) {
  const range = high - low;
  const position = range > 0 ? ((current - low) / range) * 100 : 50;
  const clampedPosition = Math.min(Math.max(position, 0), 100);

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs text-muted-foreground tabular-nums">
        <span>${low.toFixed(2)}</span>
        <span className="text-[10px] uppercase tracking-wider font-medium">52-Week Range</span>
        <span>${high.toFixed(2)}</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-surface-2">
        <div
          className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-brand shadow-[0_0_6px_oklch(72%_0.19_155/0.5)]"
          style={{ left: `${clampedPosition}%`, transform: `translateX(-50%) translateY(-50%)` }}
        />
        <div
          className="h-full rounded-full bg-gradient-to-r from-negative/30 via-warning/30 to-positive/30"
        />
      </div>
    </div>
  );
}
