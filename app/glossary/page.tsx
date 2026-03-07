import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import { glossaryTerms, getAllCategories, getTermsByCategory } from "@/data/glossary/terms";
import { ChevronRight, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Stock Market Glossary — Financial Terms & Investing Definitions | StoxPulse",
  description:
    "Learn key stock market and investing terms with simple definitions and real-world examples. From P/E Ratio to Dark Pools, our glossary covers essential financial concepts for investors.",
  keywords: [
    "stock market glossary",
    "investing terms",
    "financial terms",
    "stock market definitions",
    "investing glossary",
    "financial glossary",
    "stock terminology",
  ],
  alternates: {
    canonical: "https://stoxpulse.com/glossary",
  },
  openGraph: {
    title: "Stock Market Glossary — Financial Terms Explained | StoxPulse",
    description:
      "Clear, jargon-free explanations of essential stock market and investing terms. Definitions, formulas, and examples for every level of investor.",
    url: "https://stoxpulse.com/glossary",
    type: "website",
    siteName: "StoxPulse",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stock Market Glossary | StoxPulse",
    description:
      "Clear, jargon-free explanations of essential stock market and investing terms.",
  },
};

export default function GlossaryPage() {
  const categories = getAllCategories();

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
        name: "Glossary",
        item: "https://stoxpulse.com/glossary",
      },
    ],
  };

  const definedTermSetSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "StoxPulse Stock Market Glossary",
    description: `Comprehensive stock market glossary with ${glossaryTerms.length} financial terms explained in plain English. Covers ${categories.length} categories from fundamental analysis to market mechanics.`,
    url: "https://stoxpulse.com/glossary",
    hasDefinedTerm: glossaryTerms.map((term) => ({
      "@type": "DefinedTerm",
      name: term.term,
      description: term.definition,
      url: `https://stoxpulse.com/glossary/${term.slug}`,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSetSchema) }}
      />
      <Navbar />
      <main className="min-h-screen pt-20 bg-background">
        {/* Breadcrumbs */}
        <div className="mx-auto max-w-7xl px-6 pt-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Link
              href="/"
              className="hover:text-foreground transition-colors duration-200"
            >
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground font-medium">Glossary</span>
          </nav>
        </div>

        {/* Hero */}
        <section className="mx-auto max-w-7xl px-6 pt-12 pb-8">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Stock Market <span className="text-brand">Glossary</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Clear, jargon-free explanations of essential investing and stock
              market terms. {glossaryTerms.length} terms across{" "}
              {categories.length} categories.
            </p>
          </div>
        </section>

        {/* Category Navigation */}
        <section className="mx-auto max-w-7xl px-6 pb-12">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <a
                key={category}
                href={`#${category.toLowerCase().replace(/\s+/g, "-")}`}
                className="inline-flex items-center rounded-full bg-brand/10 px-4 py-2 text-sm font-medium text-brand hover:bg-brand/20 transition-colors duration-200"
              >
                {category}
              </a>
            ))}
          </div>
        </section>

        {/* Terms Grouped by Category */}
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="space-y-16">
            {categories.map((category) => {
              const terms = getTermsByCategory(category).sort((a, b) =>
                a.term.localeCompare(b.term)
              );
              return (
                <div
                  key={category}
                  id={category.toLowerCase().replace(/\s+/g, "-")}
                  className="scroll-mt-28"
                >
                  <h2 className="font-display text-2xl font-bold text-brand mb-6">
                    {category}
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {terms.map((term) => (
                      <Link
                        key={term.slug}
                        href={`/glossary/${term.slug}`}
                        className="group flex items-start gap-3 rounded-2xl bg-surface-1 border border-border p-4 hover:border-brand/40 transition-all duration-200"
                      >
                        <BookOpen className="size-4 text-brand mt-1 shrink-0" />
                        <div>
                          <h3 className="text-sm font-semibold text-foreground group-hover:text-brand transition-colors">
                            {term.term}
                          </h3>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {term.definition}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="rounded-2xl bg-surface-1 border border-border p-8 md:p-12 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              See these terms in action
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              StoxPulse AI uses these concepts to analyze earnings calls, SEC
              filings, and financial news for your watchlist.
            </p>
            <Link
              href="/#waitlist"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand/90 transition-colors duration-200"
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
