import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import { ChevronRight, CalendarDays } from "lucide-react";
import { getEarningsCalendar } from "@/lib/data";
import { getStockByTicker, tickerToSlug } from "@/data/stocks/sp500";
import { EarningsCalendarFilter } from "@/components/tools/earnings-calendar-filter";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: "Earnings Calendar - Upcoming Earnings Reports This Week | StoxPulse",
  description:
    "See which companies are reporting earnings this week and next. View EPS and revenue estimates, pre-market and after-hours schedules, and never miss an earnings date again.",
  keywords: [
    "earnings calendar",
    "earnings calendar this week",
    "upcoming earnings",
    "earnings dates",
    "earnings reports schedule",
    "stock earnings today",
    "earnings before market open",
    "earnings after hours",
  ],
  alternates: {
    canonical: "https://stoxpulse.com/tools/earnings-calendar",
  },
  openGraph: {
    title: "Earnings Calendar - Upcoming Earnings Reports | StoxPulse",
    description:
      "Track upcoming earnings reports with EPS and revenue estimates. Filter by this week, next week, pre-market, or after-hours.",
    url: "https://stoxpulse.com/tools/earnings-calendar",
    type: "website",
  },
};

export default async function EarningsCalendarPage() {
  await connection();

  const today = new Date();
  const from = today.toISOString().split("T")[0];
  const toDate = new Date(today);
  toDate.setDate(today.getDate() + 21);
  const to = toDate.toISOString().split("T")[0];

  const rawEntries = await getEarningsCalendar(from, to).catch(() => []);

  // Enrich with company names and slugs
  const entries = rawEntries.map((e) => {
    const stock = getStockByTicker(e.ticker);
    return {
      ticker: e.ticker,
      name: stock?.name ?? null,
      slug: stock ? tickerToSlug(stock.ticker) : tickerToSlug(e.ticker),
      date: e.date,
      quarter: e.quarter,
      year: e.year,
      epsEstimate: e.epsEstimate,
      revenueEstimate: e.revenueEstimate,
      hour: e.hour,
    };
  });

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
        name: "Tools",
        item: "https://stoxpulse.com/tools",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Earnings Calendar",
        item: "https://stoxpulse.com/tools/earnings-calendar",
      },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Earnings Calendar by StoxPulse",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description:
      "Track upcoming earnings reports with EPS and revenue estimates. Filter by week, pre-market, or after-hours timing.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, webAppSchema]),
        }}
      />
      <Navbar />
      <main className="min-h-screen pt-20 bg-background">
        {/* Breadcrumbs */}
        <div className="mx-auto w-full max-w-5xl px-6 pt-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Link
              href="/"
              className="hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <Link
              href="/tools"
              className="hover:text-foreground transition-colors"
            >
              Tools
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">Earnings Calendar</span>
          </nav>
        </div>

        {/* Hero */}
        <section className="mx-auto w-full max-w-5xl px-6 pt-16 pb-12 text-center">
          <div className="mx-auto flex items-center justify-center size-16 rounded-2xl bg-brand/10 border border-brand/20 mb-6">
            <CalendarDays className="size-8 text-brand" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
            Upcoming <span className="text-brand">Earnings</span> Calendar
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Never miss an earnings report. See which companies are reporting
            over the next 3 weeks with consensus EPS and revenue estimates.
          </p>
        </section>

        {/* Calendar Content */}
        <section className="mx-auto w-full max-w-5xl px-6 pb-12">
          <EarningsCalendarFilter entries={entries} />
        </section>

        {/* SEO Content */}
        <section className="mx-auto w-full max-w-3xl px-6 pb-24">
          <div className="rounded-2xl border border-border bg-surface-1 p-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Why track earnings dates?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Quarterly earnings reports are the single most important catalyst
              for individual stock price movement. Companies that beat analyst
              EPS estimates often gap up 5-15%, while misses can trigger sharp
              sell-offs. Knowing exactly when a company reports — and whether it
              is before market open (BMO) or after market close (AMC) — lets you
              prepare your positions in advance.
            </p>
            <h3 className="font-display text-xl font-semibold text-foreground mb-3">
              How to use this earnings calendar
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Use the filter pills above to narrow results. &ldquo;This
              Week&rdquo; and &ldquo;Next Week&rdquo; help you plan your
              trading week. The &ldquo;Pre-Market&rdquo; filter shows BMO
              reporters (check results before the open), while &ldquo;After
              Hours&rdquo; shows AMC reporters (check results after the close).
              Click any ticker to see the full stock analysis page with
              financials, insider trades, and AI insights.
            </p>
            <h3 className="font-display text-xl font-semibold text-foreground mb-3">
              Understanding earnings estimates
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              The EPS and revenue estimates shown are Wall Street consensus
              figures — the average of all analyst forecasts tracked by major
              data providers. When actual results deviate significantly from
              these estimates, it creates an &ldquo;earnings surprise&rdquo;
              that typically drives the largest post-earnings price moves.
              Tracking the whisper number (unofficial estimates) alongside the
              consensus can give you an additional edge.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
