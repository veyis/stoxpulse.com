import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { InsiderTransaction } from "@/lib/types/stock";

function formatValue(num: number): string {
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}K`;
  return `$${num.toLocaleString()}`;
}

interface InsiderTableProps {
  transactions: InsiderTransaction[];
  className?: string;
}

export function InsiderTable({ transactions, className }: InsiderTableProps) {
  if (transactions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">No recent insider transactions found.</p>
    );
  }

  return (
    <div className={cn("overflow-x-auto rounded-lg border border-border/50", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/50 bg-surface-1/50">
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Insider
            </th>
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Type
            </th>
            <th className="hidden sm:table-cell text-right p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Shares
            </th>
            <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Value
            </th>
            <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, i) => (
            <tr
              key={`${tx.name}-${tx.date}-${i}`}
              className="border-b border-border/30 last:border-0"
            >
              <td className="p-3">
                <p className="font-medium text-xs">{tx.name}</p>
                <p className="text-xs text-muted-foreground">{tx.title}</p>
              </td>
              <td className="p-3">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-xs font-medium",
                    tx.type === "Buy" ? "text-positive" : "text-negative"
                  )}
                >
                  {tx.type === "Buy" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {tx.type}
                </span>
              </td>
              <td className="hidden sm:table-cell p-3 text-right tabular-nums text-xs" data-numeric>
                {tx.shares > 0 ? tx.shares.toLocaleString() : "—"}
              </td>
              <td className="p-3 text-right tabular-nums text-xs" data-numeric>
                {tx.totalValue > 0 ? formatValue(tx.totalValue) : "—"}
              </td>
              <td className="p-3 text-right tabular-nums text-xs text-muted-foreground" data-numeric>
                {tx.date}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
