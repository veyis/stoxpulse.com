import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import { ChevronRight, Shield } from "lucide-react";
import { PortfolioRiskScanner } from "@/components/tools/portfolio-risk-scanner";

export const metadata: Metadata = {
  title: "Free Portfolio Risk Scanner & Diversification Analyzer | StoxPulse",
  description:
    "Analyze your stock portfolio for concentration risk, sector diversification, and volatility exposure. Get an instant diversification grade and actionable risk insights for free.",
  keywords: [
    "portfolio risk analyzer free",
    "stock portfolio diversification check",
    "portfolio risk scanner",
    "sector diversification tool",
    "portfolio concentration risk",
    "stock portfolio analyzer",
    "portfolio beta calculator",
    "investment risk assessment",
  ],
  alternates: {
    canonical: "https://stoxpulse.com/tools/portfolio-risk-scanner",
  },
};

export default function PortfolioRiskScannerPage() {
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
        name: "Portfolio Risk Scanner",
        item: "https://stoxpulse.com/tools/portfolio-risk-scanner",
      },
    ],
  };

  const appSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Portfolio Risk Scanner by StoxPulse",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description:
      "Enter up to 10 stock tickers and instantly get a diversification grade, sector breakdown, risk factors, and portfolio statistics.",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
      <Navbar />
      <main className="min-h-screen pt-20 bg-background flex flex-col items-center">
        {/* Breadcrumbs */}
        <div className="w-full max-w-4xl px-6 pt-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <Link href="/tools" className="hover:text-foreground transition-colors">
              Tools
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">Portfolio Risk Scanner</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="w-full max-w-4xl px-6 pt-16 pb-12 text-center">
          <div className="mx-auto flex items-center justify-center size-16 rounded-2xl bg-brand/10 border border-brand/20 mb-6">
            <Shield className="size-8 text-brand" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
            Scan Your Portfolio for <span className="text-brand">Hidden Risks</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Enter your stock holdings and instantly see your diversification grade, sector concentration, volatility exposure, and the top risks lurking in your portfolio.
          </p>
        </section>

        {/* Interactive Tool */}
        <section className="w-full max-w-4xl px-6 pb-20">
          <PortfolioRiskScanner />
        </section>

        {/* SEO Content Section */}
        <section className="w-full max-w-3xl px-6 pb-24 prose prose-neutral dark:prose-invert">
          <h2 className="text-foreground text-2xl font-bold mb-4">
            Why portfolio risk analysis matters
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Most retail investors unknowingly concentrate their portfolios in a handful of sectors.
            During sector-specific downturns, this hidden concentration can amplify losses far beyond
            market averages. A portfolio that looks diversified by stock count may still carry
            significant risk if all holdings move in the same direction.
          </p>
          <h3 className="text-foreground text-xl font-semibold mb-4">
            What our scanner checks
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Our free portfolio risk scanner analyzes your holdings across multiple dimensions: sector
            allocation balance using GICS classifications, portfolio-level beta for volatility
            assessment, valuation metrics like average P/E ratio, and income characteristics through
            dividend yield analysis. The diversification grade (A through F) uses a modified
            Herfindahl-Hirschman Index to quantify concentration risk, giving you a single,
            actionable score for your portfolio health.
          </p>
          <h3 className="text-foreground text-xl font-semibold mb-4">
            How to improve your diversification
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            If your score is below a B, consider adding positions in the &ldquo;Missing Sectors&rdquo;
            identified by the scanner. Defensive sectors like Utilities, Healthcare, and Consumer
            Staples can reduce overall portfolio beta. For concentrated tech portfolios, adding
            Financials or Energy exposure provides natural hedging during interest rate cycles. The
            goal is not equal-weighting every sector, but ensuring no single sector dominates more
            than 30-40% of your holdings.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
