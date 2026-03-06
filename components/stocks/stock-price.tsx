"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StockPriceProps {
  price: number;
  change: number;
  changePercent: number;
  size?: "sm" | "md" | "lg" | "xl";
  showIcon?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: { price: "text-lg font-semibold", change: "text-xs" },
  md: { price: "text-2xl font-bold", change: "text-sm" },
  lg: { price: "text-3xl font-bold", change: "text-base" },
  xl: { price: "text-3xl sm:text-4xl font-bold font-display", change: "text-base sm:text-lg" },
};

export function StockPrice({
  price,
  change,
  changePercent,
  size = "md",
  showIcon = true,
  className,
}: StockPriceProps) {
  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0;

  const styles = sizeStyles[size];

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <div className={cn("flex items-baseline gap-3", className)}>
      <span className={cn(styles.price, "tabular-nums")} data-numeric>
        ${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      <span
        className={cn(
          styles.change,
          "flex items-center gap-1 font-medium tabular-nums",
          isPositive && "text-positive",
          isNegative && "text-negative",
          isNeutral && "text-muted-foreground"
        )}
        data-numeric
      >
        {showIcon && <Icon className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />}
        <span>
          {isPositive ? "+" : ""}
          {change.toFixed(2)}
        </span>
        <span className="text-muted-foreground">
          ({isPositive ? "+" : ""}
          {changePercent.toFixed(2)}%)
        </span>
      </span>
    </div>
  );
}
