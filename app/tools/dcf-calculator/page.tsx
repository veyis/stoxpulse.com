import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import { ChevronRight, Calculator } from "lucide-react";
import { DCFCalculator } from "@/components/tools/dcf-calculator";

export const metadata: Metadata = {
  title: "DCF Calculator — Free Stock Valuation Tool | StoxPulse",
  description:
    "Free Discounted Cash Flow calculator for any stock. Pre-filled with real financial data. Adjust growth rate, discount rate, and terminal multiple to find intrinsic value.",
  keywords: [
    "DCF calculator",
    "stock valuation calculator",
    "discounted cash flow calculator",
    "intrinsic value calculator",
    "fair value stock calculator",
  ],
  alternates: {
    canonical: "https://stoxpulse.com/tools/dcf-calculator",
  },
  openGraph: {
    title: "Free DCF Stock Valuation Calculator | StoxPulse",
    description:
      "Calculate the intrinsic value of any stock using a DCF model pre-filled with real financials.",
    url: "https://stoxpulse.com/tools/dcf-calculator",
  },
};

export default function DCFCalculatorPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://stoxpulse.com" },
      { "@type": "ListItem", position: 2, name: "Tools", item: "https://stoxpulse.com/tools" },
      { "@type": "ListItem", position: 3, name: "DCF Calculator", item: "https://stoxpulse.com/tools/dcf-calculator" },
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
            <span className="text-foreground">DCF Calculator</span>
          </nav>
        </div>

        <section className="mx-auto max-w-5xl px-6 pt-16 pb-12 text-center">
          <div className="mx-auto flex items-center justify-center size-16 rounded-2xl bg-brand/10 border border-brand/20 mb-6">
            <Calculator className="size-8 text-brand" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
            DCF <span className="text-brand">Valuation</span> Calculator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Calculate intrinsic value using Discounted Cash Flow analysis.
            Pre-filled with real financial data — adjust assumptions to
            model your own scenario.
          </p>
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-12">
          <DCFCalculator />
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-24">
          <div className="rounded-2xl border border-border bg-surface-1 p-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              What is a DCF model?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A Discounted Cash Flow (DCF) model estimates a company&apos;s intrinsic
              value by projecting future free cash flows and discounting them back
              to present value. If the intrinsic value exceeds the current stock
              price, the stock may be undervalued — and vice versa.
            </p>
            <h3 className="font-display text-xl font-semibold text-foreground mb-3">
              Key assumptions
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              The two most impactful inputs are the <strong className="text-foreground">growth rate</strong> (how
              fast free cash flows will grow) and the <strong className="text-foreground">discount rate</strong> (your
              required rate of return, typically 8-12% for equities). Small changes
              in these assumptions can dramatically shift the output — which is why
              the sensitivity table is critical for understanding the range of
              possible outcomes.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
