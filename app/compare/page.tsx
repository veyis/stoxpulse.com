import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import { competitors } from "@/data/competitors";
import { ChevronRight, ArrowRight, Swords } from "lucide-react";

export const metadata: Metadata = {
  title: "Compare Stock Analysis Tools — Best Stock Analysis Platforms (2026) | StoxPulse",
  description:
    "Compare the best stock analysis tools and platforms side by side. See how StoxPulse stacks up against Seeking Alpha, Motley Fool, Bloomberg Terminal, Morningstar, Yahoo Finance, Koyfin, Simply Wall St, and TipRanks.",
  keywords: [
    "stock analysis tools comparison",
    "best stock analysis platforms",
    "stock research tools",
    "investment analysis software",
    "stock market analysis tools",
  ],
  openGraph: {
    title: "Compare Stock Analysis Tools — Best Platforms (2026) | StoxPulse",
    description:
      "Honest side-by-side comparisons of the best stock analysis platforms. Find the right tool for your investing style.",
    url: "https://stoxpulse.com/compare",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://stoxpulse.com" },
    { "@type": "ListItem", position: 2, name: "Compare Stock Analysis Tools", item: "https://stoxpulse.com/compare" },
  ],
};

export default function ComparePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />
      <main className="min-h-screen pt-20 bg-background">
        {/* Breadcrumbs */}
        <div className="mx-auto max-w-7xl px-6 pt-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">Compare</span>
          </nav>
        </div>

        {/* Hero */}
        <section className="mx-auto max-w-7xl px-6 pt-12 pb-16">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Compare Stock Analysis <span className="text-brand">Tools</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Find the best stock analysis platform for your investing style. We compare
              StoxPulse against the most popular tools with honest, side-by-side breakdowns
              of features, pricing, strengths, and weaknesses.
            </p>
          </div>
        </section>

        {/* Comparison Cards Grid */}
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {competitors.map((competitor) => (
              <Link
                key={competitor.slug}
                href={`/compare/stoxpulse-vs-${competitor.slug}`}
                className="group relative flex flex-col rounded-2xl bg-surface-1 border border-border p-6 hover:border-brand/40 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center size-10 rounded-xl bg-brand/10 border border-brand/20">
                    <Swords className="size-5 text-brand" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold text-foreground">
                      StoxPulse vs {competitor.name}
                    </h2>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {competitor.tagline}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-brand group-hover:gap-2.5 transition-all duration-200">
                  Read comparison
                  <ArrowRight className="size-4" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="rounded-2xl bg-surface-1 border border-border p-8 md:p-12 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Ready to try AI-powered stock analysis?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Join thousands of self-directed investors using StoxPulse to analyze
              earnings calls, SEC filings, and financial news with AI.
            </p>
            <Link
              href="/#waitlist"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand/90 transition-colors"
            >
              Get Early Access
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
