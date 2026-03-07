import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import {
  sp500Stocks,
  getAllSectors,
  getStocksBySector,
  sectorToSlug,
  tickerToSlug,
} from "@/data/stocks/sp500";

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
  const sectors = getAllSectors();

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

          {/* All Stocks Grid */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center size-10 rounded-xl bg-surface-1 border border-border shadow-sm">
                <TrendingUp className="size-5 text-brand drop-shadow-sm" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                All Stocks
              </h2>
              <span className="ml-2 rounded-full bg-brand/10 border border-brand/20 px-3 py-1 text-xs font-semibold text-brand shadow-sm">
                {sp500Stocks.length} tracked
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {sp500Stocks.map((stock) => (
                <div key={stock.ticker}>
                  <Link
                    href={`/stocks/${tickerToSlug(stock.ticker)}`}
                    className="group relative flex items-start gap-4 rounded-3xl border border-border/60 bg-surface-1/40 backdrop-blur-md p-5 transition-all duration-300 hover:border-brand/40 hover:bg-surface-1/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-display text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-brand">
                          {stock.ticker}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-surface-2 border border-border/40 px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest text-muted-foreground group-hover:border-brand/20 group-hover:bg-brand/5 group-hover:text-brand transition-all">
                          {stock.sector}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground truncate group-hover:text-foreground/80 transition-colors">
                        {stock.name}
                      </p>
                    </div>
                    <div className="flex items-center justify-center size-8 rounded-full bg-transparent border border-transparent transition-all duration-300 group-hover:bg-surface-2 group-hover:border-border">
                      <ChevronRight className="size-4 text-muted-foreground/40 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-brand" />
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Sectors */}
          {sectors.map((sector) => {
            const stocks = getStocksBySector(sector);
            return (
              <section key={sector} className="mb-16">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                    {sector}
                  </h2>
                  <Link
                    href={`/stocks/sector/${sectorToSlug(sector)}`}
                    className="group inline-flex items-center gap-1.5 rounded-full bg-surface-1 border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:border-brand/30 hover:bg-surface-2 hover:text-brand transition-all duration-200 shadow-sm"
                  >
                    View all {stocks.length}
                    <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {stocks.map((stock) => (
                    <div key={stock.ticker}>
                      <Link
                        href={`/stocks/${tickerToSlug(stock.ticker)}`}
                        className="group flex items-center justify-between gap-3 rounded-2xl border border-border/50 bg-surface-1/30 backdrop-blur-sm px-5 py-3.5 transition-all duration-300 hover:border-brand/30 hover:bg-surface-1/60 hover:-translate-y-0.5 hover:shadow-md hover:shadow-brand/5"
                      >
                        <div className="min-w-0 flex items-center gap-3">
                          <span className="font-display text-base font-bold text-foreground group-hover:text-brand transition-colors">
                            {stock.ticker}
                          </span>
                          <span className="text-[13px] font-medium text-muted-foreground truncate group-hover:text-foreground/80 transition-colors">
                            {stock.name}
                          </span>
                        </div>
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-brand" />
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}
