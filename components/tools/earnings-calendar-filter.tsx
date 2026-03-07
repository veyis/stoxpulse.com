"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Calendar, Sun, Moon, Clock } from "lucide-react";

interface EarningsEntry {
  ticker: string;
  name: string | null;
  slug: string;
  date: string;
  quarter: number;
  year: number;
  epsEstimate: number | null;
  revenueEstimate: number | null;
  hour: "bmo" | "amc" | "dmh" | null;
}

interface GroupedEntries {
  [date: string]: EarningsEntry[];
}

type FilterType = "all" | "this-week" | "next-week" | "bmo" | "amc";

const filters: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "this-week", label: "This Week" },
  { value: "next-week", label: "Next Week" },
  { value: "bmo", label: "Pre-Market" },
  { value: "amc", label: "After Hours" },
];

function formatRevenue(value: number | null): string {
  if (value === null) return "--";
  const abs = Math.abs(value);
  if (abs >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function formatEps(value: number | null): string {
  if (value === null) return "--";
  return `$${value.toFixed(2)}`;
}

function getWeekBounds(offsetWeeks: number): { start: Date; end: Date } {
  const now = new Date();
  const day = now.getDay();
  // Monday of current week
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7) + offsetWeeks * 7);
  monday.setHours(0, 0, 0, 0);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  friday.setHours(23, 59, 59, 999);
  return { start: monday, end: friday };
}

function formatDateHeading(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);

  let prefix = "";
  if (dateOnly.getTime() === today.getTime()) prefix = "Today - ";
  else if (dateOnly.getTime() === tomorrow.getTime()) prefix = "Tomorrow - ";

  return (
    prefix +
    date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  );
}

function HourBadge({ hour }: { hour: "bmo" | "amc" | "dmh" | null }) {
  if (hour === "bmo")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
        <Sun className="size-3" />
        BMO
      </span>
    );
  if (hour === "amc")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-info/10 px-2 py-0.5 text-xs font-medium text-info">
        <Moon className="size-3" />
        AMC
      </span>
    );
  if (hour === "dmh")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
        <Clock className="size-3" />
        DMH
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      TBD
    </span>
  );
}

export function EarningsCalendarFilter({
  entries,
}: {
  entries: EarningsEntry[];
}) {
  const [active, setActive] = useState<FilterType>("all");

  const filtered = useMemo(() => {
    let result = entries;

    if (active === "this-week") {
      const { start, end } = getWeekBounds(0);
      result = result.filter((e) => {
        const d = new Date(e.date + "T12:00:00");
        return d >= start && d <= end;
      });
    } else if (active === "next-week") {
      const { start, end } = getWeekBounds(1);
      result = result.filter((e) => {
        const d = new Date(e.date + "T12:00:00");
        return d >= start && d <= end;
      });
    } else if (active === "bmo") {
      result = result.filter((e) => e.hour === "bmo");
    } else if (active === "amc") {
      result = result.filter((e) => e.hour === "amc");
    }

    return result;
  }, [entries, active]);

  const grouped: GroupedEntries = useMemo(() => {
    const groups: GroupedEntries = {};
    for (const entry of filtered) {
      if (!groups[entry.date]) groups[entry.date] = [];
      groups[entry.date].push(entry);
    }
    return groups;
  }, [filtered]);

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div>
      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setActive(f.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              active === f.value
                ? "bg-brand text-white"
                : "bg-surface-1 text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {sortedDates.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface-1 p-12 text-center">
          <Calendar className="size-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">
            No earnings found
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Try a different filter or check back later.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedDates.map((date) => (
            <section key={date}>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Calendar className="size-4 text-brand" />
                {formatDateHeading(date)}
                <span className="text-sm font-normal text-muted-foreground">
                  ({grouped[date].length}{" "}
                  {grouped[date].length === 1 ? "report" : "reports"})
                </span>
              </h2>
              <div className="rounded-2xl border border-border bg-surface-1 overflow-hidden">
                {/* Table header - hidden on mobile */}
                <div className="hidden sm:grid sm:grid-cols-[1fr_100px_100px_120px] gap-4 px-5 py-3 border-b border-border bg-surface-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <span>Company</span>
                  <span className="text-right">EPS Est.</span>
                  <span className="text-right">Rev. Est.</span>
                  <span className="text-right">Time</span>
                </div>
                {/* Entries */}
                <div className="divide-y divide-border">
                  {grouped[date].map((entry) => (
                    <div
                      key={`${entry.ticker}-${entry.date}`}
                      className="px-5 py-3.5 sm:grid sm:grid-cols-[1fr_100px_100px_120px] sm:items-center gap-4"
                    >
                      {/* Company */}
                      <div className="flex items-center gap-3 mb-2 sm:mb-0">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-brand/10 text-xs font-bold text-brand shrink-0">
                          {entry.ticker.slice(0, 3)}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/stocks/${entry.slug}`}
                            className="font-semibold text-foreground hover:text-brand transition-colors truncate block"
                          >
                            {entry.ticker}
                          </Link>
                          <p className="text-sm text-muted-foreground truncate">
                            {entry.name ?? entry.ticker}
                          </p>
                        </div>
                      </div>
                      {/* Mobile: inline stats */}
                      <div className="flex items-center justify-between sm:hidden gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">EPS: </span>
                          <span className="font-medium text-foreground">
                            {formatEps(entry.epsEstimate)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Rev: </span>
                          <span className="font-medium text-foreground">
                            {formatRevenue(entry.revenueEstimate)}
                          </span>
                        </div>
                        <HourBadge hour={entry.hour} />
                      </div>
                      {/* Desktop columns */}
                      <div className="hidden sm:block text-right font-medium text-foreground">
                        {formatEps(entry.epsEstimate)}
                      </div>
                      <div className="hidden sm:block text-right font-medium text-foreground">
                        {formatRevenue(entry.revenueEstimate)}
                      </div>
                      <div className="hidden sm:flex justify-end">
                        <HourBadge hour={entry.hour} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
