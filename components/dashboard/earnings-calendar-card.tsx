import { cn } from "@/lib/utils";
import { Calendar, Clock, TrendingUp } from "lucide-react";
import type { EarningsCalendarEntry } from "@/lib/data/types";

interface EarningsCalendarCardProps {
  entries: EarningsCalendarEntry[];
  className?: string;
}

function formatHour(hour: string | null): string {
  if (hour === "bmo") return "Before Open";
  if (hour === "amc") return "After Close";
  if (hour === "dmh") return "During Hours";
  return "TBD";
}

export function EarningsCalendarCard({
  entries,
  className,
}: EarningsCalendarCardProps) {
  // Group by date
  const grouped = entries.reduce<Record<string, EarningsCalendarEntry[]>>(
    (acc, entry) => {
      const date = entry.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(entry);
      return acc;
    },
    {}
  );

  const dates = Object.keys(grouped).sort().slice(0, 5);

  return (
    <div className={cn("rounded-xl border border-border/50 bg-card", className)}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
        <div>
          <h2 className="text-sm font-semibold font-display">Earnings Calendar</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upcoming reports
          </p>
        </div>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
        {dates.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No upcoming earnings
          </p>
        ) : (
          dates.map((date) => (
            <div key={date}>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {new Date(date + "T12:00:00").toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <div className="space-y-1.5">
                {grouped[date].map((entry) => (
                  <div
                    key={entry.ticker}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-2/50 transition-colors"
                  >
                    <span className="font-display font-bold text-xs w-12">
                      {entry.ticker}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>{formatHour(entry.hour)}</span>
                      </div>
                    </div>
                    {entry.epsEstimate != null && (
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          <span className="tabular-nums" data-numeric>
                            ${entry.epsEstimate.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
