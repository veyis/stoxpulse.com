import { getEarningsCalendar } from "@/lib/data";
import { cn } from "@/lib/utils";
import { connection } from "next/server";
import Link from "next/link";
import { tickerToSlug } from "@/data/stocks/sp500";
import { Calendar } from "lucide-react";

export const metadata = {
  title: "Earnings Calendar — StoxPulse",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function TimingBadge({ timing }: { timing?: string | null }) {
  if (!timing) return null;
  const label = timing === "bmo" ? "Before Open" : timing === "amc" ? "After Close" : "During Hours";
  const style = timing === "bmo" ? "bg-info-muted text-info" : timing === "amc" ? "bg-warning-muted text-warning" : "bg-surface-2 text-muted-foreground";
  return (
    <span className={cn("inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium", style)}>
      {label}
    </span>
  );
}

export default async function EarningsPage() {
  await connection();

  const today = new Date();
  const future = new Date(today);
  future.setDate(future.getDate() + 30);
  const fromDate = today.toISOString().split("T")[0];
  const toDate = future.toISOString().split("T")[0];

  const entries = await getEarningsCalendar(fromDate, toDate).catch(() => []);

  // Group by date
  const grouped = new Map<string, typeof entries>();
  for (const entry of entries) {
    const existing = grouped.get(entry.date) ?? [];
    existing.push(entry);
    grouped.set(entry.date, existing);
  }
  const dates = [...grouped.keys()].sort();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-display tracking-tight">Earnings Calendar</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upcoming earnings reports for the next 30 days. {entries.length} companies reporting.
        </p>
      </div>

      {dates.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card p-12 text-center">
          <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No upcoming earnings found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {dates.map((date) => {
            const dayEntries = grouped.get(date)!;
            return (
              <div key={date} className="rounded-xl border border-border/50 bg-card">
                <div className="px-5 py-3 border-b border-border/50 flex items-center justify-between">
                  <h2 className="text-sm font-semibold font-display">{formatDate(date)}</h2>
                  <span className="text-xs text-muted-foreground">
                    {dayEntries.length} compan{dayEntries.length !== 1 ? "ies" : "y"}
                  </span>
                </div>
                <div className="divide-y divide-border/30">
                  {dayEntries.map((entry, i) => (
                    <Link
                      key={`${entry.ticker}-${i}`}
                      href={`/stocks/${tickerToSlug(entry.ticker)}`}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-surface-2/30 transition-colors"
                    >
                      <span className="font-mono font-bold text-sm w-16">{entry.ticker}</span>
                      <TimingBadge timing={entry.hour} />
                      <div className="flex-1 min-w-0" />
                      {entry.epsEstimate != null && (
                        <div className="text-right shrink-0">
                          <div className="text-xs text-muted-foreground">EPS Est.</div>
                          <div className="text-sm font-mono font-semibold tabular-nums">
                            ${entry.epsEstimate.toFixed(2)}
                          </div>
                        </div>
                      )}
                      {entry.revenueEstimate != null && (
                        <div className="text-right shrink-0">
                          <div className="text-xs text-muted-foreground">Rev Est.</div>
                          <div className="text-sm font-mono font-semibold tabular-nums">
                            ${(entry.revenueEstimate / 1e9).toFixed(1)}B
                          </div>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
