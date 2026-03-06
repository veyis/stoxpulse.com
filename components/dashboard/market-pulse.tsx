import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { SparkLine } from "@/components/stocks/spark-line";
import { motion } from "framer-motion";

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sparkData: number[];
}

interface MarketPulseProps {
  indices: MarketIndex[];
  className?: string;
}

export function MarketPulse({ indices, className }: MarketPulseProps) {
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
      }}
      className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3", className)}
    >
      {indices.map((index) => {
        const isPositive = index.change > 0;
        const isNegative = index.change < 0;
        const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

        return (
          <motion.div
            variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
            key={index.symbol}
            className="rounded-2xl border border-border/50 bg-surface-1/40 backdrop-blur-md p-4 transition-all duration-300 hover:border-brand/30 hover:bg-surface-1/60 hover:-translate-y-0.5 hover:shadow-md hover:shadow-brand/5 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-brand/80 transition-colors">
                  {index.name}
                </p>
                <p className="text-[20px] font-bold font-display tabular-nums mt-1 text-foreground" data-numeric>
                  {index.price.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <SparkLine
                data={index.sparkData}
                width={64}
                height={28}
                positive={isPositive}
              />
            </div>
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium tabular-nums",
                isPositive && "text-positive",
                isNegative && "text-negative",
                !isPositive && !isNegative && "text-muted-foreground"
              )}
              data-numeric
            >
              <Icon className="h-3 w-3" />
              <span>
                {isPositive ? "+" : ""}
                {index.change.toFixed(2)}
              </span>
              <span className="text-muted-foreground">
                ({isPositive ? "+" : ""}
                {index.changePercent.toFixed(2)}%)
              </span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
