import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import { ChevronRight, ArrowRight, Bell, CalendarDays } from "lucide-react";

export const metadata: Metadata = {
  title: "Earnings Calendar — Upcoming Earnings Dates & Schedules | StoxPulse",
  description:
    "View upcoming earnings dates for major stocks. Track quarterly earnings reports, get AI-powered earnings analysis, and set alerts so you never miss an earnings call.",
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
      "Track upcoming earnings dates. Get AI-powered analysis and alerts for stocks on your watchlist.",
    url: "https://stoxpulse.com/earnings",
  },
  alternates: {
    canonical: "https://stoxpulse.com/earnings",
  },
};

interface EarningsEntry {
  ticker: string;
  company: string;
  date: string;
  time: "Before Open" | "After Close";
  epsEstimate: string;
  revenueEstimate: string;
}

const earningsData: EarningsEntry[] = [
  { ticker: "CRM", company: "Salesforce", date: "2026-03-05", time: "After Close", epsEstimate: "$2.63", revenueEstimate: "$10.1B" },
  { ticker: "ZS", company: "Zscaler", date: "2026-03-06", time: "After Close", epsEstimate: "$0.78", revenueEstimate: "$640M" },
  { ticker: "MDB", company: "MongoDB", date: "2026-03-06", time: "After Close", epsEstimate: "$0.68", revenueEstimate: "$540M" },
  { ticker: "AVGO", company: "Broadcom", date: "2026-03-07", time: "After Close", epsEstimate: "$1.52", revenueEstimate: "$15.6B" },
  { ticker: "COST", company: "Costco", date: "2026-03-07", time: "After Close", epsEstimate: "$4.12", revenueEstimate: "$63.2B" },
  { ticker: "ORCL", company: "Oracle", date: "2026-03-10", time: "After Close", epsEstimate: "$1.79", revenueEstimate: "$15.1B" },
  { ticker: "ADBE", company: "Adobe", date: "2026-03-11", time: "After Close", epsEstimate: "$5.01", revenueEstimate: "$5.9B" },
  { ticker: "DG", company: "Dollar General", date: "2026-03-12", time: "Before Open", epsEstimate: "$1.56", revenueEstimate: "$10.3B" },
  { ticker: "ULTA", company: "Ulta Beauty", date: "2026-03-13", time: "After Close", epsEstimate: "$5.48", revenueEstimate: "$3.6B" },
  { ticker: "FDX", company: "FedEx", date: "2026-03-14", time: "After Close", epsEstimate: "$4.68", revenueEstimate: "$22.4B" },
  { ticker: "NKE", company: "Nike", date: "2026-03-17", time: "After Close", epsEstimate: "$0.55", revenueEstimate: "$11.3B" },
  { ticker: "MU", company: "Micron", date: "2026-03-18", time: "After Close", epsEstimate: "$1.78", revenueEstimate: "$8.9B" },
];

function groupByWeek(entries: EarningsEntry[]) {
  const weeks: { label: string; entries: EarningsEntry[] }[] = [];
  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const entry of sorted) {
    const entryDate = new Date(entry.date);
    const weekStart = new Date(entryDate);
    weekStart.setDate(entryDate.getDate() - entryDate.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 4);

    const label = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

    let week = weeks.find((w) => w.label === label);
    if (!week) {
      week = { label, entries: [] };
      weeks.push(week);
    }
    week.entries.push(entry);
  }

  return weeks;
}

export default function EarningsCalendarPage() {
  const weeks = groupByWeek(earningsData);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://stoxpulse.com" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Earnings Calendar",
        item: "https://stoxpulse.com/earnings",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
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
            Track upcoming quarterly earnings reports for major stocks. Get AI-powered
            earnings analysis and set alerts so you never miss an important call.
          </p>
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
                  StoxPulse monitors earnings dates for every stock on your watchlist. When
                  a company reports, our AI automatically processes the earnings call
                  transcript, extracts key takeaways, scores management sentiment, and
                  flags any red flags — all delivered to your dashboard within minutes of
                  the call ending. No manual work required.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Earnings Schedule */}
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            Upcoming Earnings — March 2026
          </h2>
          <div className="space-y-8">
            {weeks.map((week) => (
              <div key={week.label}>
                <h3 className="font-display text-sm font-semibold text-brand mb-3">
                  Week of {week.label}
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-surface-1">
                        <th className="text-left px-6 py-3 font-semibold text-foreground">
                          Ticker
                        </th>
                        <th className="text-left px-6 py-3 font-semibold text-foreground">
                          Company
                        </th>
                        <th className="text-left px-6 py-3 font-semibold text-foreground">
                          Date
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
                      {week.entries.map((entry, i) => (
                        <tr
                          key={entry.ticker}
                          className={
                            i % 2 === 0 ? "bg-surface-0" : "bg-surface-1/50"
                          }
                        >
                          <td className="px-6 py-3 font-semibold text-brand">
                            {entry.ticker}
                          </td>
                          <td className="px-6 py-3 text-foreground">
                            {entry.company}
                          </td>
                          <td className="px-6 py-3 text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-3 text-muted-foreground">
                            {entry.time}
                          </td>
                          <td className="px-6 py-3 text-right text-muted-foreground">
                            {entry.epsEstimate}
                          </td>
                          <td className="px-6 py-3 text-right text-muted-foreground">
                            {entry.revenueEstimate}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground/60">
            Earnings dates and estimates are subject to change. Data is for informational
            purposes only.
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
                  Get alerts before earnings, AI-generated summaries after, and red flag
                  notifications — all delivered to your dashboard and inbox automatically.
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

        {/* CTA */}
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="rounded-2xl bg-surface-1 border border-border p-8 md:p-12 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              AI-powered earnings analysis
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Stop spending hours reading earnings transcripts. StoxPulse uses AI to
              summarize earnings calls, flag red flags, and score management sentiment
              for every stock on your watchlist.
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
