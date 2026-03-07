import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import { ChevronRight, DollarSign } from "lucide-react";
import { DividendCalculator } from "@/components/tools/dividend-calculator";

export const metadata: Metadata = {
  title: "Dividend Calculator — Estimate Income & DRIP Growth | StoxPulse",
  description:
    "Free dividend calculator for any stock. Estimate annual dividend income, yield on cost, and DRIP compounding growth over 1-30 years.",
  keywords: [
    "dividend calculator",
    "dividend income calculator",
    "DRIP calculator",
    "dividend yield calculator",
    "stock dividend calculator free",
  ],
  alternates: {
    canonical: "https://stoxpulse.com/tools/dividend-calculator",
  },
  openGraph: {
    title: "Free Dividend Calculator | StoxPulse",
    description:
      "Calculate dividend income and DRIP growth for any stock. Enter ticker, investment amount, and see projected income.",
    url: "https://stoxpulse.com/tools/dividend-calculator",
  },
};

export default function DividendCalculatorPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://stoxpulse.com" },
      { "@type": "ListItem", position: 2, name: "Tools", item: "https://stoxpulse.com/tools" },
      { "@type": "ListItem", position: 3, name: "Dividend Calculator", item: "https://stoxpulse.com/tools/dividend-calculator" },
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
        <div className="mx-auto max-w-5xl px-6 pt-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="size-3.5" />
            <Link href="/tools" className="hover:text-foreground transition-colors">Tools</Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">Dividend Calculator</span>
          </nav>
        </div>

        <section className="mx-auto max-w-5xl px-6 pt-16 pb-12 text-center">
          <div className="mx-auto flex items-center justify-center size-16 rounded-2xl bg-brand/10 border border-brand/20 mb-6">
            <DollarSign className="size-8 text-brand" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
            Dividend Income <span className="text-brand">Calculator</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            See how much dividend income any stock could generate. Model DRIP
            compounding and dividend growth over time.
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-12">
          <DividendCalculator />
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-24">
          <div className="rounded-2xl border border-border bg-surface-1 p-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              How dividend investing works
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Dividend investing generates passive income from stock ownership.
              Companies distribute a portion of profits to shareholders, typically
              quarterly. The dividend yield is the annual dividend divided by the
              stock price — a 3% yield on a $10,000 investment produces $300/year.
            </p>
            <h3 className="font-display text-xl font-semibold text-foreground mb-3">
              The power of DRIP
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Dividend Reinvestment Plans (DRIP) automatically use dividends to
              purchase additional shares. This creates a compounding effect —
              more shares generate more dividends, which buy more shares. Over
              decades, DRIP can dramatically increase total returns compared to
              taking cash dividends.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
