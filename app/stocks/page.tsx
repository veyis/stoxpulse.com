import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import { sp500Stocks, tickerToSlug } from "@/data/stocks/sp500";
import { StockSearch } from "@/components/stocks/stock-search";
import { MarketOverview } from "@/components/stocks/market-overview";
import { MarketMovers } from "@/components/stocks/market-movers";

export const metadata: Metadata = {
  title: "AI Stock Analysis — Earnings, Filings & Sentiment | StoxPulse",
  description:
    "Browse AI-powered stock analysis for S&P 500 companies. StoxPulse reads earnings calls, SEC filings, and financial news to deliver actionable intelligence for every stock in your watchlist. Free AI analysis for AAPL, MSFT, NVDA, AMZN, GOOGL, and more.",
  keywords: [
    "AI stock analysis",
    "S&P 500 stock analysis",
    "earnings call analysis",
    "SEC filing analysis",
    "stock sentiment analysis",
    "AI investing",
    "stock intelligence",
  ],
  alternates: {
    canonical: "https://stoxpulse.com/stocks",
  },
};

export default function StocksPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://stoxpulse.com" },
      { "@type": "ListItem", position: 2, name: "Stocks", item: "https://stoxpulse.com/stocks" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight className="size-3.5" />
              </li>
              <li className="text-foreground font-medium">Stocks</li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-12 relative">
            {/* Subtle background glow */}
            <div className="pointer-events-none absolute -top-10 left-0 w-[400px] h-[300px] bg-brand/5 rounded-[100%] blur-[100px]" />

            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              AI Stock <span className="text-gradient">Analysis</span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Your AI research analyst for every S&P 500 company. StoxPulse
              reads earnings calls, translates SEC filings into plain English,
              and scores news by importance. Select a stock to see its full
              intelligence profile.
            </p>
          </div>

          {/* Live Sector Performance Heatmap */}
          <MarketOverview />

          {/* Market Movers: Gainers, Losers, Most Active */}
          <MarketMovers />

          {/* Search + Filterable Stock Grid */}
          <StockSearch
            stocks={sp500Stocks.map((s) => ({
              ticker: s.ticker,
              name: s.name,
              sector: s.sector,
              slug: tickerToSlug(s.ticker),
            }))}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
