import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import { ChevronRight, BarChart3 } from "lucide-react";
import { StockScreener } from "@/components/tools/stock-screener";

export const metadata: Metadata = {
  title: "Free AI Stock Screener | Filter Stocks by Pulse Score | StoxPulse",
  description:
    "Screen and filter stocks using StoxPulse's AI-powered Pulse Score. Sort by sector, market cap, P/E ratio, and momentum. Free stock screener for retail investors.",
  keywords: [
    "stock screener free",
    "stock screener AI",
    "filter stocks",
    "stock screening tool",
    "pulse score screener",
    "best stock screener",
    "AI stock analysis",
    "stock scanner",
    "sector filter stocks",
    "retail investor tools",
  ],
  alternates: {
    canonical: "https://stoxpulse.com/tools/stock-screener",
  },
};

export default function StockScreenerPage() {
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
        name: "Stock Screener",
        item: "https://stoxpulse.com/tools/stock-screener",
      },
    ],
  };

  const appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "AI Stock Screener by StoxPulse",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description:
      "Free AI-powered stock screener that ranks stocks using a composite Pulse Score. Filter by sector, market cap, P/E ratio, and more.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.7",
      ratingCount: "312",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the Pulse Score?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Pulse Score is StoxPulse's proprietary composite metric that evaluates stocks across five dimensions: Value, Growth, Health, Momentum, and Sentiment. Scores range from 0-100 with letter grades from A+ to F.",
        },
      },
      {
        "@type": "Question",
        name: "How often is the screener data updated?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The stock screener data refreshes every 5 minutes during market hours, pulling live quotes and recalculating Pulse Scores in real time.",
        },
      },
      {
        "@type": "Question",
        name: "Is this stock screener really free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, the StoxPulse AI Stock Screener is completely free to use. No account or credit card required. We cover every S&P 500 company — all 500+ stocks.",
        },
      },
      {
        "@type": "Question",
        name: "What stocks are included in the screener?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The screener tracks all 500+ S&P 500 stocks across all 11 GICS sectors, including mega-caps like Apple, Microsoft, Amazon, NVIDIA, Alphabet, and every other constituent.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, appSchema, faqSchema]),
        }}
      />
      <Navbar />
      <main className="min-h-screen pt-20 bg-background">
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-6 pt-8">
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
            <span className="text-foreground">Stock Screener</span>
          </nav>
        </div>

        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-12 text-center">
          <div className="mx-auto flex items-center justify-center size-16 rounded-2xl bg-brand/10 border border-brand/20 mb-6">
            <BarChart3 className="size-8 text-brand" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
            AI Stock <span className="text-brand">Screener</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Filter and rank stocks using our proprietary Pulse Score. Screen by
            sector, market cap, P/E ratio, and momentum &mdash; all powered by
            real-time data.
          </p>
        </section>

        {/* Screener */}
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <StockScreener />
        </section>

        {/* SEO Content + FAQ */}
        <section className="border-t border-border bg-surface-0">
          <div className="max-w-4xl mx-auto px-6 py-20">
            <h2 className="font-display text-3xl font-bold text-foreground mb-6">
              How to use the AI Stock Screener
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed mb-12">
              <p>
                The StoxPulse AI Stock Screener evaluates every tracked stock
                using our composite <strong className="text-foreground">Pulse Score</strong> &mdash; a 0-100
                metric that combines five key dimensions of stock health: Value,
                Growth, Financial Health, Price Momentum, and Market Sentiment.
              </p>
              <p>
                Use the filter bar to narrow results by sector, set a minimum
                Pulse Score threshold, or search for a specific ticker. All
                filtering and sorting happens instantly in your browser, with no
                page reloads needed. Sorting options include Pulse Score, Market
                Cap, daily Change %, P/E Ratio, and alphabetical by name.
              </p>
              <p>
                Each stock card shows the current price with intraday change, the
                Pulse Score grade (A+ through F), sector classification, P/E
                ratio, and market capitalization. Click any card to dive deeper
                into the stock&apos;s full analysis page with financials, insider
                trades, and AI-generated insights.
              </p>
            </div>

            <h2 className="font-display text-3xl font-bold text-foreground mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-surface-1 p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  What is the Pulse Score?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  The Pulse Score is StoxPulse&apos;s proprietary composite
                  metric that evaluates stocks across five dimensions: Value,
                  Growth, Health, Momentum, and Sentiment. Scores range from
                  0-100 with letter grades from A+ to F. A higher score
                  indicates a stock that is performing well across all five
                  categories.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-surface-1 p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  How often is the screener data updated?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  The stock screener data refreshes every 5 minutes during
                  market hours, pulling live quotes and recalculating Pulse
                  Scores in real time. Outside of market hours, the most recent
                  closing data is displayed.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-surface-1 p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  Is this stock screener really free?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Yes, the StoxPulse AI Stock Screener is completely free to
                  use. No account or credit card required. We cover every S&amp;P
                  500 company — all 500+ stocks across all 11 GICS sectors.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-surface-1 p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  What stocks are included in the screener?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  The screener tracks all 500+ S&amp;P 500 stocks across all
                  11 GICS sectors, including mega-caps like Apple, Microsoft,
                  Amazon, NVIDIA, Alphabet, and every other constituent.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-surface-1 p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  How are stocks graded?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Stocks receive a letter grade based on their Pulse Score: A+
                  (90-100) is exceptional, A/A- (80-89) is strong, B range
                  (65-79) is above average, C range (50-64) is average, D range
                  (35-49) is below average, and F (0-34) indicates significant
                  concerns. The grade is color-coded green for A-B, yellow for
                  C, and red for D-F.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
