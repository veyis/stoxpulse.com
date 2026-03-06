import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function MetricCard({ label, value, subValue, trend, className }: MetricCardProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <p
        className={cn(
          "text-sm font-semibold tabular-nums",
          trend === "up" && "text-positive",
          trend === "down" && "text-negative"
        )}
        data-numeric
      >
        {typeof value === "number"
          ? value.toLocaleString("en-US", { maximumFractionDigits: 2 })
          : value}
      </p>
      {subValue && (
        <p className="text-xs text-muted-foreground tabular-nums" data-numeric>
          {subValue}
        </p>
      )}
    </div>
  );
}
