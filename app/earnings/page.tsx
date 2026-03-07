import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import {
  ChevronRight,
  ArrowRight,
  Bell,
  CalendarDays,
  TrendingUp,
  Building2,
  Star,
} from "lucide-react";
import { getEarningsCalendar } from "@/lib/data";
import type { EarningsCalendarEntry } from "@/lib/data/types";
import {
  getStockByTicker,
  tickerToSlug,
  sp500Stocks,
} from "@/data/stocks/sp500";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: "Earnings Calendar — Upcoming Earnings Dates & Schedules | StoxPulse",
  description:
    "View upcoming earnings dates for major S&P 500 stocks. Track quarterly earnings reports, get AI-powered earnings analysis, and set alerts so you never miss an earnings call.",
  keywords: [
    "earnings calendar",
    "upcoming earnings",
    "earnings dates",
    "quarterly earnings schedule",
    "earnings report dates",
    "earnings call schedule",
  ],
  openGraph: {
    title: "Earnings Calendar — Upcoming Earnings | StoxPulse",
    description:
      "Track upcoming earnings dates for S&P 500 stocks. Get AI-powered analysis and alerts for stocks on your watchlist.",
    url: "https://stoxpulse.com/earnings",
  },
  alternates: {
    canonical: "https://stoxpulse.com/earnings",
  },
};

interface EnrichedEntry {
  ticker: string;
  name: string;
  slug: string;
  date: string;
  hour: "bmo" | "amc" | "dmh" | null;
  epsEstimate: number | null;
  revenueEstimate: number | null;
  quarter: number;
  year: number;
}

function formatCurrency(value: number | null): string {
  if (value === null) return "--";
  if (Math.abs(value) >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(0)}M`;
  }
  return `$${value.toFixed(2)}`;
}

function formatEps(value: number | null): string {
  if (value === null) return "--";
  return `$${value.toFixed(2)}`;
}

function formatHour(hour: "bmo" | "amc" | "dmh" | null): string {
  switch (hour) {
    case "bmo":
      return "Before Open";
    case "amc":
      return "After Close";
    case "dmh":
      return "During Hours";
    default:
      return "--";
  }
}

function groupByDate(
  entries: EnrichedEntry[]
): { date: string; label: string; entries: EnrichedEntry[] }[] {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const groups: { date: string; label: string; entries: EnrichedEntry[] }[] =
    [];

  for (const entry of sorted) {
    let group = groups.find((g) => g.date === entry.date);
    if (!group) {
      const d = new Date(entry.date + "T12:00:00");
      const label = d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      group = { date: entry.date, label, entries: [] };
      groups.push(group);
    }
    group.entries.push(entry);
  }

  return groups;
}

function isThisWeek(dateStr: string): boolean {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const d = new Date(dateStr + "T12:00:00");
  return d >= weekStart && d < weekEnd;
}

export default async function EarningsCalendarPage() {
  await connection();

  const today = new Date();
  const from = today.toISOString().split("T")[0];
  const toDate = new Date(today);
  toDate.setDate(today.getDate() + 21);
  const to = toDate.toISOString().split("T")[0];

  const rawEntries = await getEarningsCalendar(from, to).catch(() => []);

  // Build a set of our tracked tickers for fast lookup
  const trackedTickers = new Set(
    sp500Stocks.map((s) => s.ticker.toUpperCase())
  );

  // Filter to S&P 500 only, enrich with names
  const entries: EnrichedEntry[] = rawEntries
    .filter((e: EarningsCalendarEntry) =>
      trackedTickers.has(e.ticker.toUpperCase())
    )
    .map((e: EarningsCalendarEntry) => {
      const stock = getStockByTicker(e.ticker);
      return {
        ticker: e.ticker,
        name: stock?.name ?? e.ticker,
        slug: tickerToSlug(e.ticker),
        date: e.date,
        hour: e.hour,
        epsEstimate: e.epsEstimate,
        revenueEstimate: e.revenueEstimate,
        quarter: e.quarter,
        year: e.year,
      };
    });

  const dateGroups = groupByDate(entries);

  // Stats
  const totalUpcoming = entries.length;
  const thisWeekCount = entries.filter((e) => isThisWeek(e.date)).length;
  const sp500Count = entries.length; // already filtered to S&P 500
  const nextNotable =
    entries.length > 0
      ? entries.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )[0]
      : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://stoxpulse.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Earnings Calendar",
        item: "https://stoxpulse.com/earnings",
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is an earnings calendar?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "An earnings calendar shows the scheduled dates for publicly traded companies to release their quarterly financial results. It includes the expected date, whether the report comes before market open (BMO) or after market close (AMC), and consensus analyst estimates for EPS and revenue.",
        },
      },
      {
        "@type": "Question",
        name: "Why do stock prices move after earnings reports?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Stock prices move after earnings because the actual results are compared to Wall Street consensus estimates. When a company beats expectations on EPS or revenue, the stock typically rises. When it misses, the stock often declines. The magnitude of the surprise and forward guidance both influence the price reaction.",
        },
      },
      {
        "@type": "Question",
        name: "What does BMO and AMC mean in earnings?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "BMO stands for Before Market Open, meaning the company reports earnings before the stock market opens for trading (typically before 9:30 AM ET). AMC stands for After Market Close, meaning the report comes after the market closes (typically after 4:00 PM ET). Some companies also report during market hours (DMH).",
        },
      },
      {
        "@type": "Question",
        name: "How accurate are EPS estimates?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Consensus EPS estimates represent the average forecast from sell-side analysts covering a stock. While individual estimates vary, the consensus is typically within 5-10% of actual results for large-cap companies. However, surprises of 20% or more do occur, especially during periods of economic uncertainty.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, faqSchema]),
        }}
      />
      <Navbar />
      <main className="min-h-screen pt-20 bg-background">
        {/* Breadcrumbs */}
        <div className="mx-auto max-w-5xl px-6 pt-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">Earnings Calendar</span>
          </nav>
        </div>

        {/* Hero */}
        <section className="mx-auto max-w-5xl px-6 pt-12 pb-12">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Earnings <span className="text-brand">Calendar</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Track upcoming quarterly earnings reports for major stocks. Get
            AI-powered earnings analysis and set alerts so you never miss an
            important call.
          </p>
        </section>

        {/* Stats Cards */}
        <section className="mx-auto max-w-5xl px-6 pb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-surface-1 border border-border/50 p-5">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="size-4 text-brand" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Next 21 Days
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {totalUpcoming}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                earnings reports
              </p>
            </div>

            <div className="rounded-2xl bg-surface-1 border border-border/50 p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="size-4 text-brand" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  This Week
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {thisWeekCount}
              </p>
              <p className="text-xs text-muted-foreground mt-1">reporting</p>
            </div>

            <div className="rounded-2xl bg-surface-1 border border-border/50 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="size-4 text-brand" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  S&P 500
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">{sp500Count}</p>
              <p className="text-xs text-muted-foreground mt-1">
                major companies
              </p>
            </div>

            <div className="rounded-2xl bg-surface-1 border border-border/50 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Star className="size-4 text-brand" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Next Notable
                </span>
              </div>
              {nextNotable ? (
                <>
                  <p className="text-2xl font-bold text-brand">
                    {nextNotable.ticker}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(nextNotable.date + "T12:00:00").toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric" }
                    )}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-muted-foreground">--</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    none scheduled
                  </p>
                </>
              )}
            </div>
          </div>
        </section>

        {/* How StoxPulse Tracks Earnings */}
        <section className="mx-auto max-w-5xl px-6 pb-12">
          <div className="rounded-2xl bg-brand/5 border border-brand/20 p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center size-10 rounded-xl bg-brand/10 border border-brand/20 shrink-0">
                <CalendarDays className="size-5 text-brand" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-brand mb-2">
                  How StoxPulse Tracks Earnings
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  StoxPulse monitors earnings dates for every stock on your
                  watchlist. When a company reports, our AI automatically
                  processes the earnings call transcript, extracts key takeaways,
                  scores management sentiment, and flags any red flags — all
                  delivered to your dashboard within minutes of the call ending.
                  No manual work required.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Earnings Schedule */}
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            Upcoming S&P 500 Earnings
          </h2>

          {entries.length === 0 ? (
            <div className="rounded-2xl bg-surface-1 border border-border/50 p-12 text-center">
              <CalendarDays className="size-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                No upcoming earnings scheduled
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                There are no S&P 500 earnings reports scheduled in the next 21
                days. This can happen during off-season periods or holidays.
                Check back soon.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {dateGroups.map((group) => (
                <div key={group.date}>
                  <h3 className="font-display text-sm font-semibold text-brand mb-3">
                    {group.label}
                  </h3>
                  <div className="overflow-x-auto rounded-2xl border border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-surface-1">
                          <th className="text-left px-6 py-3 font-semibold text-foreground">
                            Date
                          </th>
                          <th className="text-left px-6 py-3 font-semibold text-foreground">
                            Ticker
                          </th>
                          <th className="text-left px-6 py-3 font-semibold text-foreground">
                            Company
                          </th>
                          <th className="text-left px-6 py-3 font-semibold text-foreground">
                            Time
                          </th>
                          <th className="text-right px-6 py-3 font-semibold text-foreground">
                            EPS Est.
                          </th>
                          <th className="text-right px-6 py-3 font-semibold text-foreground">
                            Rev. Est.
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.entries.map((entry, i) => (
                          <tr
                            key={`${entry.ticker}-${entry.date}`}
                            className={
                              i % 2 === 0 ? "bg-surface-0" : "bg-surface-1/50"
                            }
                          >
                            <td className="px-6 py-3 text-muted-foreground">
                              {new Date(
                                entry.date + "T12:00:00"
                              ).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </td>
                            <td className="px-6 py-3">
                              <Link
                                href={`/stocks/${entry.slug}`}
                                className="font-semibold text-brand hover:underline"
                              >
                                {entry.ticker}
                              </Link>
                            </td>
                            <td className="px-6 py-3 text-foreground">
                              {entry.name}
                            </td>
                            <td className="px-6 py-3 text-muted-foreground">
                              {formatHour(entry.hour)}
                            </td>
                            <td className="px-6 py-3 text-right text-muted-foreground">
                              {formatEps(entry.epsEstimate)}
                            </td>
                            <td className="px-6 py-3 text-right text-muted-foreground">
                              {formatCurrency(entry.revenueEstimate)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="mt-4 text-xs text-muted-foreground/60">
            Earnings dates and estimates are subject to change. Data is for
            informational purposes only. Showing S&P 500 companies only.
          </p>
        </section>

        {/* Alert CTA */}
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <div className="rounded-2xl bg-surface-1 border border-border p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex items-center justify-center size-12 rounded-xl bg-brand/10 border border-brand/20 shrink-0">
                <Bell className="size-6 text-brand" />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-xl font-bold text-foreground">
                  Never miss an earnings call
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get alerts before earnings, AI-generated summaries after, and
                  red flag notifications — all delivered to your dashboard and
                  inbox automatically.
                </p>
              </div>
              <Link
                href="/#waitlist"
                className="inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand/90 transition-colors whitespace-nowrap"
              >
                Get Earnings Alerts
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="rounded-2xl bg-surface-1 border border-border/50 p-6">
              <h3 className="font-display text-base font-semibold text-foreground mb-2">
                What is an earnings calendar?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                An earnings calendar shows the scheduled dates for publicly
                traded companies to release their quarterly financial results. It
                includes the expected date, whether the report comes before
                market open (BMO) or after market close (AMC), and consensus
                analyst estimates for EPS and revenue.
              </p>
            </div>
            <div className="rounded-2xl bg-surface-1 border border-border/50 p-6">
              <h3 className="font-display text-base font-semibold text-foreground mb-2">
                Why do stock prices move after earnings reports?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Stock prices move after earnings because the actual results are
                compared to Wall Street consensus estimates. When a company beats
                expectations on EPS or revenue, the stock typically rises. When
                it misses, the stock often declines. The magnitude of the
                surprise and forward guidance both influence the price reaction.
              </p>
            </div>
            <div className="rounded-2xl bg-surface-1 border border-border/50 p-6">
              <h3 className="font-display text-base font-semibold text-foreground mb-2">
                What does BMO and AMC mean in earnings?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                BMO stands for Before Market Open, meaning the company reports
                earnings before the stock market opens for trading (typically
                before 9:30 AM ET). AMC stands for After Market Close, meaning
                the report comes after the market closes (typically after 4:00 PM
                ET). Some companies also report during market hours (DMH).
              </p>
            </div>
            <div className="rounded-2xl bg-surface-1 border border-border/50 p-6">
              <h3 className="font-display text-base font-semibold text-foreground mb-2">
                How accurate are EPS estimates?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Consensus EPS estimates represent the average forecast from
                sell-side analysts covering a stock. While individual estimates
                vary, the consensus is typically within 5-10% of actual results
                for large-cap companies. However, surprises of 20% or more do
                occur, especially during periods of economic uncertainty.
              </p>
            </div>
          </div>
        </section>

        {/* Related Links */}
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <h2 className="font-display text-lg font-bold text-foreground mb-4">
            Related Pages
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <Link
              href="/tools/earnings-calendar"
              className="rounded-xl bg-surface-1 border border-border/50 p-4 hover:border-brand/40 transition-colors group"
            >
              <span className="text-sm font-medium text-foreground group-hover:text-brand transition-colors">
                Earnings Calendar Tool
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                Interactive earnings calendar with filters
              </p>
            </Link>
            <Link
              href="/glossary/earnings-per-share"
              className="rounded-xl bg-surface-1 border border-border/50 p-4 hover:border-brand/40 transition-colors group"
            >
              <span className="text-sm font-medium text-foreground group-hover:text-brand transition-colors">
                What is EPS?
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                Earnings per share explained
              </p>
            </Link>
            <Link
              href="/stocks"
              className="rounded-xl bg-surface-1 border border-border/50 p-4 hover:border-brand/40 transition-colors group"
            >
              <span className="text-sm font-medium text-foreground group-hover:text-brand transition-colors">
                All Stocks
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                Browse all tracked S&P 500 stocks
              </p>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="rounded-2xl bg-surface-1 border border-border p-8 md:p-12 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              AI-powered earnings analysis
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Stop spending hours reading earnings transcripts. StoxPulse uses AI
              to summarize earnings calls, flag red flags, and score management
              sentiment for every stock on your watchlist.
            </p>
            <Link
              href="/#waitlist"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand/90 transition-colors"
            >
              Join Waitlist for Early Access
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
