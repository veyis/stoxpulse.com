"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { FinancialStatements } from "@/lib/data/types";

function formatB(num: number | null): string {
  if (num === null) return "—";
  if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(0)}M`;
  return num.toLocaleString();
}

function formatDollar(num: number | null): string {
  if (num === null) return "—";
  return `$${num.toFixed(2)}`;
}

function formatPercent(revenue: number | null, metric: number | null): string {
  if (!revenue || !metric) return "—";
  return `${((metric / revenue) * 100).toFixed(1)}%`;
}

interface FinancialsTableProps {
  financials: FinancialStatements;
}

export function FinancialsTable({ financials }: FinancialsTableProps) {
  const [period, setPeriod] = useState<"annual" | "quarterly">("annual");

  const data = period === "annual" ? financials.annual : financials.quarterly;
  const displayData = data.slice(0, period === "annual" ? 5 : 8);

  const rows = [
    { label: "Revenue", key: "revenue" as const, format: formatB },
    { label: "Cost of Revenue", key: "costOfRevenue" as const, format: formatB },
    { label: "Gross Profit", key: "grossProfit" as const, format: formatB },
    { label: "Gross Margin", key: null, format: null, computed: (d: typeof data[0]) => formatPercent(d.revenue, d.grossProfit) },
    { label: "Operating Income", key: "operatingIncome" as const, format: formatB },
    { label: "Op. Margin", key: null, format: null, computed: (d: typeof data[0]) => formatPercent(d.revenue, d.operatingIncome) },
    { label: "Net Income", key: "netIncome" as const, format: formatB },
    { label: "Net Margin", key: null, format: null, computed: (d: typeof data[0]) => formatPercent(d.revenue, d.netIncome) },
    { label: "EPS", key: "eps" as const, format: formatDollar },
    { label: "EPS (Diluted)", key: "epsDiluted" as const, format: formatDollar },
  ];

  return (
    <div className="space-y-4">
      {/* Period Toggle */}
      <div className="flex items-center gap-1 rounded-lg bg-surface-1 p-1 w-fit">
        {(["annual", "quarterly"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize",
              period === p
                ? "bg-surface-3 text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-surface-1/50">
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider sticky left-0 bg-surface-1/50">
                Metric
              </th>
              {displayData.map((d) => (
                <th
                  key={`${d.year}-${d.period}`}
                  className="text-right p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                >
                  {d.period === "FY" ? `FY ${d.year}` : `${d.period} ${d.year}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.label}
                className={cn(
                  "border-b border-border/30",
                  i % 2 === 0 ? "bg-transparent" : "bg-surface-1/20",
                  row.label.includes("Margin") && "text-muted-foreground"
                )}
              >
                <td className="p-3 font-medium text-xs sticky left-0 bg-inherit whitespace-nowrap">
                  {row.label}
                </td>
                {displayData.map((d) => (
                  <td
                    key={`${d.year}-${d.period}-${row.label}`}
                    className="p-3 text-right tabular-nums text-xs whitespace-nowrap"
                    data-numeric
                  >
                    {row.computed
                      ? row.computed(d)
                      : row.key && row.format
                        ? row.format(d[row.key])
                        : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
