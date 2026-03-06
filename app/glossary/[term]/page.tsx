import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import { glossaryTerms, getTermBySlug } from "@/data/glossary/terms";
import {
  ChevronRight,
  ArrowRight,
  BookOpen,
  Calculator,
  Lightbulb,
  AlertTriangle,
} from "lucide-react";

type Props = {
  params: Promise<{ term: string }>;
};

export function generateStaticParams() {
  return glossaryTerms.map((t) => ({ term: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { term: slug } = await params;
  const term = getTermBySlug(slug);
  if (!term) return { title: "Term Not Found" };

  const title = `What is ${term.term}? Definition & Examples | StoxPulse`;
  const description = term.definition;

  return {
    title,
    description,
    keywords: [
      term.term,
      `${term.term} definition`,
      `${term.term} meaning`,
      `what is ${term.term}`,
      term.category,
      "stock market glossary",
    ],
    alternates: {
      canonical: `https://stoxpulse.com/glossary/${slug}`,
    },
    openGraph: {
      title: `What is ${term.term}? Definition & Examples`,
      description,
      url: `https://stoxpulse.com/glossary/${slug}`,
      type: "article",
      siteName: "StoxPulse",
    },
    twitter: {
      card: "summary_large_image",
      title: `What is ${term.term}? | StoxPulse Glossary`,
      description,
    },
  };
}

export default async function GlossaryTermPage({ params }: Props) {
  const { term: slug } = await params;
  const term = getTermBySlug(slug);

  if (!term) {
    notFound();
  }

  const relatedTermObjects = glossaryTerms.filter((t) =>
    term.relatedTerms.includes(t.slug)
  );

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
      {
        "@type": "ListItem",
        position: 3,
        name: term.term,
        item: `https://stoxpulse.com/glossary/${slug}`,
      },
    ],
  };

  const definedTermSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: term.term,
    description: term.definition,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "StoxPulse Stock Market Glossary",
      url: "https://stoxpulse.com/glossary",
    },
    url: `https://stoxpulse.com/glossary/${slug}`,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: term.faq.map((item) => ({
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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(definedTermSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-6">
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
              <li>
                <Link
                  href="/glossary"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Glossary
                </Link>
              </li>
              <li>
                <ChevronRight className="size-3.5" />
              </li>
              <li className="text-foreground font-medium">{term.term}</li>
            </ol>
          </nav>

          {/* Header */}
          <header className="mb-10">
            <span className="inline-flex items-center rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand mb-4">
              {term.category}
            </span>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
              What is <span className="text-brand">{term.term}</span>?
            </h1>
          </header>

          {/* Definition Box */}
          <section className="mb-10">
            <div className="rounded-2xl bg-brand/5 border border-brand/20 p-6 md:p-8">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="size-5 text-brand" />
                <h2 className="font-display text-lg font-semibold text-brand">
                  Definition
                </h2>
              </div>
              <p className="text-foreground leading-relaxed text-lg">
                {term.definition}
              </p>
            </div>
          </section>

          {/* Detailed Explanation */}
          <section className="mb-10">
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">
              Detailed Explanation
            </h2>
            <div className="prose-custom space-y-4">
              {term.detailedExplanation.split("\n\n").map((paragraph, i) => (
                <p
                  key={i}
                  className="text-muted-foreground leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          {/* Formula */}
          {term.formula && (
            <section className="mb-10">
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Formula
              </h2>
              <div className="rounded-2xl bg-surface-1 border border-border p-6 flex items-center gap-3">
                <Calculator className="size-5 text-brand shrink-0" />
                <code className="text-sm font-mono text-foreground">
                  {term.formula}
                </code>
              </div>
            </section>
          )}

          {/* Example */}
          {term.example && (
            <section className="mb-10">
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Example
              </h2>
              <div className="rounded-2xl bg-surface-1 border border-border p-6 flex items-start gap-3">
                <Lightbulb className="size-5 text-warning mt-0.5 shrink-0" />
                <p className="text-muted-foreground leading-relaxed">
                  {term.example}
                </p>
              </div>
            </section>
          )}

          {/* FAQ */}
          <section className="mb-10">
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {term.faq.map((item, i) => (
                <details
                  key={i}
                  className="group rounded-2xl border border-border bg-surface-1 overflow-hidden"
                >
                  <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-medium text-foreground hover:bg-surface-2/50 transition-colors duration-200 [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <ChevronRight className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-90" />
                  </summary>
                  <div className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Related Terms */}
          {relatedTermObjects.length > 0 && (
            <section className="mb-10">
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Related Terms
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {relatedTermObjects.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/glossary/${related.slug}`}
                    className="group flex items-start gap-3 rounded-2xl bg-surface-1 border border-border p-4 hover:border-brand/40 transition-all duration-200"
                  >
                    <BookOpen className="size-4 text-brand mt-1 shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-brand transition-colors">
                        {related.term}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {related.definition}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Disclaimer */}
          <div className="mb-10 rounded-2xl border border-border bg-surface-1 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-4 text-warning shrink-0" />
              <p className="text-xs text-muted-foreground/60 leading-relaxed">
                <strong className="text-muted-foreground">Disclaimer:</strong>{" "}
                The information on this page is provided for educational and
                informational purposes only and does not constitute investment
                advice. AI-generated analysis may contain errors or
                inaccuracies. Always conduct your own research and consult a
                qualified financial advisor before making investment decisions.
              </p>
            </div>
          </div>

          {/* CTA */}
          <section className="text-center rounded-2xl border border-brand/20 bg-brand/5 p-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              See {term.term} in Action
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              StoxPulse AI automatically tracks and analyzes key financial
              metrics from earnings calls and SEC filings for your watchlist.
            </p>
            <Link
              href="/#waitlist"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand/90 transition-colors duration-200"
            >
              Join the Waitlist
              <ArrowRight className="size-4" />
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
