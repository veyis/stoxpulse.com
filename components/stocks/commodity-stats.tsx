import { MetricCard } from "./metric-card";
import type { StockQuote } from "@/lib/types/stock";

function formatPrice(num: number): string {
  return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatVolume(num: number): string {
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(0)}K`;
  return num.toLocaleString();
}

interface CommodityStatsProps {
  quote: StockQuote;
  unit: string;
}

export function CommodityStats({ quote, unit }: CommodityStatsProps) {
  const stats = [
    { label: "Open", value: quote.open ? formatPrice(quote.open) : "—" },
    { label: "Previous Close", value: quote.previousClose ? formatPrice(quote.previousClose) : "—" },
    { label: "Day Low", value: quote.dayLow ? formatPrice(quote.dayLow) : "—" },
    { label: "Day High", value: quote.dayHigh ? formatPrice(quote.dayHigh) : "—" },
    { label: "52w High", value: quote.high52w ? formatPrice(quote.high52w) : "—" },
    { label: "52w Low", value: quote.low52w ? formatPrice(quote.low52w) : "—" },
    { label: "50-Day Avg", value: quote.priceAvg50 ? formatPrice(quote.priceAvg50) : "—" },
    { label: "200-Day Avg", value: quote.priceAvg200 ? formatPrice(quote.priceAvg200) : "—" },
    { label: "Volume", value: formatVolume(quote.volume) },
  ];

  return (
    <div className="rounded-lg border border-border/50 bg-card p-4">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
        Key Statistics
      </h3>
      <p className="text-[11px] text-muted-foreground/60 mb-4">Prices {unit}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <MetricCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>
    </div>
  );
}
