import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import { ChevronRight, BarChart3 } from "lucide-react";
import { StockComparison } from "@/components/tools/stock-comparison";

export const metadata: Metadata = {
  title: "Compare Stocks Side by Side | AAPL vs MSFT | StoxPulse",
  description:
    "Free stock comparison tool. Compare up to 5 stocks side by side with Pulse Score, radar chart, P/E, EPS, market cap, dividend yield, and AI-powered verdict.",
  keywords: [
    "compare stocks",
    "stock comparison tool",
    "AAPL vs MSFT",
    "side by side stock comparison",
    "stock analysis tool",
    "compare P/E ratio",
    "stock metrics comparison",
    "best stock comparison",
  ],
  alternates: {
    canonical: "https://stoxpulse.com/tools/compare-stocks",
  },
};

export default function CompareStocksPage() {
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
        name: "Compare Stocks",
        item: "https://stoxpulse.com/tools/compare-stocks",
      },
    ],
  };

  const appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Stock Comparison Tool by StoxPulse",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description:
      "Compare up to 5 stocks side by side with proprietary Pulse Scores, radar charts, key financial metrics, and AI-powered analysis.",
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
          __html: JSON.stringify([breadcrumbSchema, appSchema]),
        }}
      />
      <Navbar />
      <main className="min-h-screen pt-20 bg-background flex flex-col items-center">
        {/* Breadcrumbs */}
        <div className="w-full max-w-5xl px-6 pt-8">
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
            <span className="text-foreground">Compare Stocks</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="w-full max-w-5xl px-6 pt-16 pb-12 text-center">
          <div className="mx-auto flex items-center justify-center size-16 rounded-2xl bg-brand/10 border border-brand/20 mb-6">
            <BarChart3 className="size-8 text-brand" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
            Compare Stocks <span className="text-brand">Side by Side</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Enter 2-5 tickers and instantly see how they stack up across price,
            valuation, momentum, and our proprietary Pulse Score. Powered by AI.
          </p>
        </section>

        {/* Interactive Comparison Tool */}
        <section className="w-full max-w-5xl px-6 pb-20">
          <StockComparison />
        </section>

        {/* SEO Content Section */}
        <section className="w-full max-w-3xl px-6 pb-24 prose prose-neutral dark:prose-invert">
          <h2 className="text-foreground text-2xl font-bold mb-4">
            How to compare stocks effectively
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Comparing stocks side by side is one of the most powerful ways to
            make informed investment decisions. Rather than analyzing a single
            company in isolation, a multi-stock comparison lets you quickly
            identify which company offers the best value, the strongest growth
            trajectory, or the highest income potential for your portfolio.
          </p>

          <h3 className="text-foreground text-xl font-semibold mb-4">
            What metrics matter most when comparing stocks?
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            The most important metrics depend on your investment style, but here
            are the key ones our tool evaluates:
          </p>
          <ul className="text-muted-foreground space-y-2 mb-6">
            <li>
              <strong className="text-foreground">P/E Ratio</strong> &mdash;
              Price-to-Earnings tells you how much investors pay for each dollar
              of earnings. Lower P/E can signal value, but may also reflect
              slower growth.
            </li>
            <li>
              <strong className="text-foreground">Market Cap</strong> &mdash;
              Indicates company size and stability. Large caps tend to be less
              volatile; small caps can offer more growth potential.
            </li>
            <li>
              <strong className="text-foreground">EPS (Earnings Per Share)</strong>{" "}
              &mdash; A fundamental profitability metric. Compare EPS growth
              rates to see which company is growing faster.
            </li>
            <li>
              <strong className="text-foreground">Dividend Yield</strong> &mdash;
              Important for income investors. A higher yield can mean more
              passive income, but watch for unsustainably high yields.
            </li>
            <li>
              <strong className="text-foreground">52-Week Range Position</strong>{" "}
              &mdash; Shows where the stock sits relative to its yearly high and
              low. Stocks near the top may have strong momentum; near the bottom
              could signal a buying opportunity or trouble.
            </li>
            <li>
              <strong className="text-foreground">Beta</strong> &mdash;
              Measures volatility relative to the market. A beta above 1 means
              more volatile than the S&P 500; below 1 means less.
            </li>
          </ul>

          <h3 className="text-foreground text-xl font-semibold mb-4">
            What is the Pulse Score?
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            The StoxPulse Pulse Score is our proprietary composite metric that
            evaluates stocks across five dimensions: Value, Growth, Financial
            Health, Momentum, and Sentiment. Each dimension is scored 0-20 for a
            total of 0-100. The radar chart above gives you an instant visual
            comparison of where each stock excels or falls behind, making it easy
            to find the best match for your strategy.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
