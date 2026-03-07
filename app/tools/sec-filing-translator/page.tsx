import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import { ChevronRight, FileText } from "lucide-react";
import { Form4Decoder } from "@/components/tools/form4-decoder";

export const metadata: Metadata = {
  title: "Free AI SEC Form 4 Insider Trading Decoder | StoxPulse",
  description:
    "Paste any SEC Form 4 URL and instantly get a plain-English translation. Understand insider buying and selling immediately without reading confusing XML tables.",
  keywords: [
    "sec form 4",
    "insider trading",
    "sec filing translator",
    "form 4 decoder",
    "insider buying tracking",
    "retail investor tools",
  ],
  alternates: {
    canonical: "https://stoxpulse.com/tools/sec-filing-translator",
  },
};

export default function SecFilingTranslatorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SEC Form 4 Decoder by StoxPulse",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description: "Paste an SEC Form 4 URL and instantly translate the insider transaction into clear, plain English.",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
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
            <span className="text-foreground">SEC Filing Translator</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="w-full max-w-4xl px-6 pt-16 pb-12 text-center">
          <div className="mx-auto flex items-center justify-center size-16 rounded-2xl bg-brand/10 border border-brand/20 mb-6">
            <FileText className="size-8 text-brand" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
            Understand Insider Trades in <span className="text-brand">Seconds</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Stop trying to read confusing SEC XML tables. Paste any Form 4 link below, and our AI will translate it into a simple, actionable summary.
          </p>
        </section>

        {/* Interactive Form */}
        <section className="w-full max-w-3xl px-6 pb-20">
          <Form4Decoder />
        </section>

        {/* SEO Content Section */}
        <section className="w-full max-w-3xl px-6 pb-24 prose prose-neutral dark:prose-invert">
          <h2 className="text-foreground text-2xl font-bold mb-4">Why translating SEC Form 4 matters for investors</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Corporate insiders (Directors, Officers, and 10% Owners) are legally required to file a Form 4 with the U.S. Securities and Exchange Commission (SEC) within two business days of buying or selling their company&apos;s stock.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            While this data is highly valuable and public, the raw XML format on the EDGAR database is incredibly difficult for retail investors to parse quickly. Finding the transaction code, calculating the value, and understanding the post-transaction holdings requires manual math.
          </p>
          <h3 className="text-foreground text-xl font-semibold mb-4">How our AI Decoder works</h3>
          <p className="text-muted-foreground leading-relaxed">
            Our free tool uses advanced Large Language Models to instantly scrape the SEC&apos;s EDGAR database URL you provide. It automatically extracts the transaction codes (e.g., &ldquo;P&rdquo; for Purchase, &ldquo;S&rdquo; for Sale), calculates the total transaction value based on the weighted average price, and identifies if the trade was part of a pre-planned 10b5-1 schedule, delivering a 3-bullet summary.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
