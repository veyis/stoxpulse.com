import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import { ChevronRight, Users } from "lucide-react";
import { InsiderTracker } from "@/components/tools/insider-tracker";

export const metadata: Metadata = {
  title: "Free Insider Trading Tracker | Insider Buying & Selling Today | StoxPulse",
  description:
    "Track insider buying and selling activity in real time. See which CEOs, CFOs, and directors are buying or selling their company stock today. Free insider trading tracker for retail investors.",
  keywords: [
    "insider trading tracker",
    "insider buying today",
    "insider selling today",
    "SEC Form 4 tracker",
    "insider transactions",
    "corporate insider buying",
    "executive stock purchases",
    "insider trading screener",
  ],
  alternates: {
    canonical: "https://stoxpulse.com/tools/insider-tracker",
  },
};

export default function InsiderTrackerPage() {
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
        name: "Insider Trading Tracker",
        item: "https://stoxpulse.com/tools/insider-tracker",
      },
    ],
  };

  const appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Insider Trading Tracker by StoxPulse",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description:
      "Track real-time insider buying and selling activity for S&P 500 stocks. Filter by transaction type, size, and executive role.",
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
        <div className="w-full max-w-6xl px-6 pt-8">
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
            <span className="text-foreground">Insider Trading Tracker</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="w-full max-w-6xl px-6 pt-16 pb-12 text-center">
          <div className="mx-auto flex items-center justify-center size-16 rounded-2xl bg-brand/10 border border-brand/20 mb-6">
            <Users className="size-8 text-brand" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
            Insider Trading <span className="text-brand">Tracker</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Follow the money. See what CEOs, CFOs, and board directors are
            buying and selling across the S&P 500 — updated every 10 minutes.
          </p>
        </section>

        {/* Tracker */}
        <section className="w-full max-w-6xl px-6 pb-20">
          <InsiderTracker />
        </section>

        {/* SEO Content Section */}
        <section className="w-full max-w-3xl px-6 pb-24 prose prose-neutral dark:prose-invert">
          <h2 className="text-foreground text-2xl font-bold mb-4">
            Why insider trading data matters for investors
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Corporate insiders — including CEOs, CFOs, directors, and 10%
            beneficial owners — are required by Section 16 of the Securities
            Exchange Act to report their transactions in company stock to the SEC
            within two business days via Form 4. These filings are public record
            and offer a rare window into how those with the deepest knowledge of
            a company view its prospects.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Academic research consistently shows that insider buying clusters are
            one of the strongest predictive signals for future stock
            outperformance. When multiple executives invest their own money at
            the same time, it often precedes positive catalysts that the market
            has not yet priced in.
          </p>
          <h3 className="text-foreground text-xl font-semibold mb-4">
            How to read insider transactions
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Not all insider trades carry the same weight. Open-market purchases
            (discretionary buys) are far more informative than routine sales,
            which often occur under pre-planned 10b5-1 trading schedules.
            Similarly, large dollar-value purchases by C-suite executives (CEO,
            CFO, COO) tend to be more significant than smaller transactions by
            lower-ranking insiders.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Our tracker flags discretionary (non-routine) transactions with a
            yellow badge and lets you filter for large trades ($1M+) and C-suite
            activity, helping you quickly separate the signal from the noise.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
