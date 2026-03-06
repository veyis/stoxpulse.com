import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import { competitors } from "@/data/competitors";
import { ChevronRight, ArrowRight, Check, Star } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return competitors.map((c) => ({
    slug: `${c.slug}-alternatives`,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const competitorSlug = slug.replace(/-alternatives$/, "");
  const competitor = competitors.find((c) => c.slug === competitorSlug);
  if (!competitor) return {};

  return {
    title: `7 Best ${competitor.name} Alternatives in 2026 | StoxPulse`,
    description: `Looking for ${competitor.name} alternatives? Compare the 7 best alternatives including StoxPulse, with features, pricing, and honest pros & cons for each.`,
    alternates: {
      canonical: `https://stoxpulse.com/alternatives/${slug}`,
    },
    openGraph: {
      title: `7 Best ${competitor.name} Alternatives in 2026`,
      description: `Compare the best ${competitor.name} alternatives for stock analysis in 2026.`,
      url: `https://stoxpulse.com/alternatives/${slug}`,
    },
  };
}

export default async function AlternativesPage({ params }: PageProps) {
  const { slug } = await params;
  const competitorSlug = slug.replace(/-alternatives$/, "");
  const competitor = competitors.find((c) => c.slug === competitorSlug);

  if (!competitor) {
    notFound();
  }

  const allAlternatives = [
    {
      name: "StoxPulse",
      description:
        "The AI research analyst serious investors wish they could afford. Reads every earnings call, analyzes every SEC filing, tracks insider transactions with AI context, and scores news by importance — all for your specific watchlist.",
      bestFor: "Serious investors who want institutional-grade research at retail pricing",
    },
    ...competitor.alternatives,
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://stoxpulse.com" },
      {
        "@type": "ListItem",
        position: 2,
        name: `${competitor.name} Alternatives`,
        item: `https://stoxpulse.com/alternatives/${slug}`,
      },
    ],
  };

  const faqItems = [
    {
      question: `What is the best free alternative to ${competitor.name}?`,
      answer: `StoxPulse offers a free tier with AI-powered analysis of earnings calls and SEC filings. Yahoo Finance and Google Finance are also free options, though they lack AI analysis capabilities.`,
    },
    {
      question: `Why are people switching from ${competitor.name}?`,
      answer: competitor.whyPeopleLookForAlternatives.join(" "),
    },
    {
      question: `Is StoxPulse a good ${competitor.name} alternative?`,
      answer: `Yes, especially if you want AI-powered analysis. StoxPulse automatically analyzes earnings calls, translates SEC filings, and scores news sentiment. It is designed for self-directed retail investors who want actionable insights without information overload.`,
    },
    {
      question: `Can I use multiple stock analysis tools together?`,
      answer: `Absolutely. Many investors use StoxPulse for AI-powered earnings and filing analysis alongside other tools for different purposes. Using complementary platforms can give you a more complete picture of your investments.`,
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
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
            <span className="text-foreground">{competitor.name} Alternatives</span>
          </nav>
        </div>

        {/* Hero */}
        <section className="mx-auto max-w-4xl px-6 pt-12 pb-12">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Best {competitor.name} Alternatives in{" "}
            <span className="text-brand">2026</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Looking for a {competitor.name} alternative? We compared the top 7 platforms
            for stock analysis, including features, pricing, and what each does best.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: March 2026</p>
        </section>

        {/* Why People Look for Alternatives */}
        <section className="mx-auto max-w-4xl px-6 pb-16">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            Why People Look for {competitor.name} Alternatives
          </h2>
          <div className="rounded-2xl bg-surface-1 border border-border p-6">
            <ul className="space-y-3">
              {competitor.whyPeopleLookForAlternatives.map((reason) => (
                <li
                  key={reason}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <ChevronRight className="size-4 text-brand mt-0.5 shrink-0" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Numbered Alternatives List */}
        <section className="mx-auto max-w-4xl px-6 pb-16">
          <h2 className="font-display text-2xl font-bold text-foreground mb-8">
            Top 7 {competitor.name} Alternatives
          </h2>
          <div className="space-y-6">
            {allAlternatives.map((alt, index) => (
              <div
                key={alt.name}
                className={`rounded-2xl border p-6 md:p-8 ${
                  index === 0
                    ? "bg-brand/5 border-brand/20"
                    : "bg-surface-1 border-border"
                }`}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`flex items-center justify-center size-8 rounded-lg text-sm font-bold shrink-0 ${
                      index === 0
                        ? "bg-brand text-brand-foreground"
                        : "bg-surface-2 text-foreground"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-xl font-bold text-foreground">
                        {alt.name}
                      </h3>
                      {index === 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand">
                          <Star className="size-3" />
                          Our Pick
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {alt.description}
                    </p>
                    <p className="mt-3 text-sm">
                      <span className="font-medium text-foreground">Best for: </span>
                      <span className="text-muted-foreground">{alt.bestFor}</span>
                    </p>
                    {index === 0 && (
                      <Link
                        href="/#waitlist"
                        className="mt-4 inline-flex items-center justify-center rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground hover:bg-brand/90 transition-colors"
                      >
                        Try StoxPulse Free
                        <ArrowRight className="ml-2 size-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Comparison Table */}
        <section className="mx-auto max-w-4xl px-6 pb-16">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            Quick Comparison
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-1">
                  <th className="text-left px-6 py-4 font-semibold text-foreground">Platform</th>
                  <th className="text-left px-6 py-4 font-semibold text-foreground">Best For</th>
                  <th className="text-center px-6 py-4 font-semibold text-foreground">AI Analysis</th>
                </tr>
              </thead>
              <tbody>
                {allAlternatives.map((alt, i) => (
                  <tr
                    key={alt.name}
                    className={i % 2 === 0 ? "bg-surface-0" : "bg-surface-1/50"}
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      {alt.name}
                      {i === 0 && (
                        <span className="ml-2 text-xs text-brand font-medium">Recommended</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{alt.bestFor}</td>
                    <td className="px-6 py-4 text-center">
                      {i === 0 ? (
                        <Check className="size-4 text-brand mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">Limited</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-4xl px-6 pb-16">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqItems.map((item) => (
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
              Ready to try the #1 {competitor.name} alternative?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              StoxPulse uses AI to analyze earnings calls, SEC filings, and news for your
              watchlist. Join the waitlist for early access.
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
