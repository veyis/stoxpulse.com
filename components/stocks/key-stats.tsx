import { MetricCard } from "./metric-card";
import type { StockQuote } from "@/lib/types/stock";

function formatLargeNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  return `$${num.toLocaleString()}`;
}

function formatVolume(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(0)}K`;
  return num.toLocaleString();
}

interface KeyStatsProps {
  quote: StockQuote;
}

export function KeyStats({ quote }: KeyStatsProps) {
  const stats = [
    { label: "Market Cap", value: formatLargeNumber(quote.marketCap) },
    { label: "P/E Ratio", value: quote.pe ? quote.pe.toFixed(1) : "—" },
    { label: "EPS", value: quote.eps ? `$${quote.eps.toFixed(2)}` : "—" },
    { label: "Volume", value: formatVolume(quote.volume) },
    { label: "Avg Volume", value: quote.avgVolume ? formatVolume(quote.avgVolume) : "—" },
    { label: "52w High", value: quote.high52w ? `$${quote.high52w.toFixed(2)}` : "—" },
    { label: "52w Low", value: quote.low52w ? `$${quote.low52w.toFixed(2)}` : "—" },
  ];

  return (
    <div className="key-stats rounded-lg border border-border/50 bg-card p-4">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
        Key Statistics
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <MetricCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>
    </div>
  );
}
