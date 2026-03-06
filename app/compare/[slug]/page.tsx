import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import { competitors } from "@/data/competitors";
import { ChevronRight, Check, X, ArrowRight } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function parseCompetitorSlug(slug: string): string {
  return slug.replace(/^stoxpulse-vs-/, "");
}

export async function generateStaticParams() {
  return competitors.map((c) => ({ slug: `stoxpulse-vs-${c.slug}` }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const competitorSlug = parseCompetitorSlug(slug);
  const competitor = competitors.find((c) => c.slug === competitorSlug);
  if (!competitor) return {};

  return {
    title: `StoxPulse vs ${competitor.name} — Comparison (2026) | StoxPulse`,
    description: competitor.tldr,
    openGraph: {
      title: `StoxPulse vs ${competitor.name} — Comparison (2026)`,
      description: competitor.tldr,
      url: `https://stoxpulse.com/compare/${slug}`,
    },
  };
}

export default async function ComparisonPage({ params }: PageProps) {
  const { slug } = await params;
  const competitorSlug = parseCompetitorSlug(slug);
  const competitor = competitors.find((c) => c.slug === competitorSlug);

  if (!competitor) {
    notFound();
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://stoxpulse.com" },
      { "@type": "ListItem", position: 2, name: "Compare", item: "https://stoxpulse.com/compare" },
      {
        "@type": "ListItem",
        position: 3,
        name: `StoxPulse vs ${competitor.name}`,
        item: `https://stoxpulse.com/compare/${slug}`,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: competitor.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar />
      <main className="min-h-screen pt-20 bg-background">
        {/* Breadcrumbs */}
        <div className="mx-auto max-w-4xl px-6 pt-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <Link href="/compare" className="hover:text-foreground transition-colors">
              Compare
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">vs {competitor.name}</span>
          </nav>
        </div>

        {/* Hero */}
        <section className="mx-auto max-w-4xl px-6 pt-12 pb-12">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            StoxPulse vs {competitor.name} —{" "}
            <span className="text-brand">Honest Comparison</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: March 2026
          </p>
        </section>

        {/* TL;DR */}
        <section className="mx-auto max-w-4xl px-6 pb-12">
          <div className="rounded-2xl bg-brand/5 border border-brand/20 p-6 md:p-8">
            <h2 className="font-display text-lg font-semibold text-brand mb-2">TL;DR</h2>
            <p className="text-muted-foreground leading-relaxed">{competitor.tldr}</p>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="mx-auto max-w-4xl px-6 pb-16">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            Feature Comparison
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-1">
                  <th className="text-left px-6 py-4 font-semibold text-foreground">Feature</th>
                  <th className="text-left px-6 py-4 font-semibold text-brand">StoxPulse</th>
                  <th className="text-left px-6 py-4 font-semibold text-foreground">
                    {competitor.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                {competitor.features.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={i % 2 === 0 ? "bg-surface-0" : "bg-surface-1/50"}
                  >
                    <td className="px-6 py-4 font-medium text-foreground">{row.feature}</td>
                    <td className="px-6 py-4 text-muted-foreground">{row.stoxpulse}</td>
                    <td className="px-6 py-4 text-muted-foreground">{row.competitor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Comparison Dimensions */}
        <section className="mx-auto max-w-4xl px-6 pb-16 space-y-12">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              AI Analysis
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              StoxPulse is built from the ground up around AI-powered analysis. Our platform
              automatically processes earnings call transcripts, translates SEC filings into
              plain English, and scores news sentiment in real-time. {competitor.name}{" "}
              {competitor.slug === "bloomberg"
                ? "provides access to raw data and transcripts but requires manual analysis."
                : competitor.slug === "yahoo-finance"
                ? "aggregates news and data but does not offer AI-powered analysis or insights."
                : "takes a different approach, focusing more on human-generated analysis and traditional research methods."}
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Data Coverage
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              StoxPulse focuses on the data sources that matter most to retail investors:
              earnings calls, SEC filings (10-K, 10-Q, 8-K, Form 4), and financial news.
              We prioritize depth of analysis over breadth of data. {competitor.name}{" "}
              {competitor.slug === "bloomberg"
                ? "offers the broadest data coverage of any platform with global market data, fixed income, commodities, and more — but at a price point designed for institutions."
                : `provides ${competitor.slug === "yahoo-finance" ? "broad free financial data coverage" : "solid data coverage"} with a different focus and target audience.`}
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Pricing
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              StoxPulse offers a free tier with AI analysis, Pro at $29/month for serious
              investors, and Analyst at $59/month for power users. A Bloomberg Terminal costs
              $24,000/year. A junior analyst costs $80,000. We believe the analysis layer should
              be accessible to all investors, not just institutions.{" "}
              {competitor.name}{" "}
              {competitor.slug === "bloomberg"
                ? "costs $24,000+ per year, making it impractical for individual investors."
                : competitor.slug === "yahoo-finance"
                ? "is free (ad-supported) for basic features, with Yahoo Finance Plus at $25-50/month."
                : `offers competitive pricing but ${competitor.slug === "seeking-alpha" ? "Premium starts at $239/year" : competitor.slug === "motley-fool" ? "Stock Advisor costs $199/year" : "Premium starts at $30/month"}.`}
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              User Experience
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              StoxPulse is designed with a modern, clean interface focused on delivering AI
              insights quickly. Our dark-first design reduces eye strain during long analysis
              sessions, and our dashboard puts your watchlist front and center. {competitor.name}{" "}
              {competitor.slug === "bloomberg"
                ? "has a notoriously steep learning curve with a terminal-style interface that requires significant training."
                : competitor.slug === "yahoo-finance"
                ? "offers a familiar interface but is cluttered with advertisements that degrade the experience."
                : `provides a ${competitor.slug === "seeking-alpha" ? "content-rich but sometimes overwhelming" : "functional"} user experience.`}
            </p>
          </div>
        </section>

        {/* Who Should Choose */}
        <section className="mx-auto max-w-4xl px-6 pb-16">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-brand/5 border border-brand/20 p-6">
              <h2 className="font-display text-xl font-bold text-brand mb-4">
                Who Should Choose StoxPulse
              </h2>
              <ul className="space-y-3">
                {competitor.whoShouldChooseStoxPulse.map((reason) => (
                  <li key={reason} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="size-4 text-brand mt-0.5 shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-surface-1 border border-border p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                Who Should Choose {competitor.name}
              </h2>
              <ul className="space-y-3">
                {competitor.whoShouldChooseCompetitor.map((reason) => (
                  <li key={reason} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-4xl px-6 pb-16">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {competitor.faq.map((item) => (
              <div
                key={item.question}
                className="rounded-2xl bg-surface-1 border border-border p-6"
              >
                <h3 className="font-display text-base font-semibold text-foreground">
                  {item.question}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-6 pb-24">
          <div className="rounded-2xl bg-surface-1 border border-border p-8 md:p-12 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Try StoxPulse for free
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Join thousands of self-directed investors using AI-powered stock analysis.
              No credit card required.
            </p>
            <Link
              href="/#waitlist"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand/90 transition-colors"
            >
              Get Early Access
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="mx-auto max-w-4xl px-6 pb-12">
          <p className="text-xs text-muted-foreground/60 leading-relaxed">
            Disclaimer: StoxPulse provides financial information and AI-generated analysis
            for educational and informational purposes only. Nothing on this platform
            constitutes investment advice.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
