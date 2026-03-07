import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import {
  ChevronRight,
  ArrowRight,
  Mic,
  FileText,
  BarChart3,
  CalendarDays,
  ShieldAlert,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Free Stock Analysis Tools — Earnings, SEC Filings & Sentiment | StoxPulse",
  description:
    "Free AI-powered stock analysis tools for retail investors. Summarize earnings calls, translate SEC filings, check stock sentiment, view the earnings calendar, and scan portfolio risk.",
  keywords: [
    "free stock analysis tools",
    "earnings call tools",
    "SEC filing translator",
    "stock sentiment checker",
    "earnings calendar",
    "portfolio risk scanner",
  ],
  openGraph: {
    title: "Free Stock Analysis Tools | StoxPulse",
    description:
      "AI-powered stock analysis tools for retail investors. Earnings call summarizer, SEC filing translator, and more.",
    url: "https://stoxpulse.com/tools",
  },
  alternates: {
    canonical: "https://stoxpulse.com/tools",
  },
};

const tools = [
  {
    name: "Earnings Call Summarizer",
    description:
      "Paste any earnings call transcript and get an AI-generated summary with key takeaways, sentiment analysis, and red flags in seconds.",
    href: "/tools/earnings-call-summarizer",
    icon: Mic,
  },
  {
    name: "SEC Filing Translator",
    description:
      "Upload or paste a 10-K, 10-Q, or 8-K filing and get a plain-English translation of the most important sections, risk factors, and financial highlights.",
    href: "/tools/sec-filing-translator",
    icon: FileText,
  },
  {
    name: "Stock Sentiment Checker",
    description:
      "Enter a stock ticker to see an aggregated AI sentiment score based on recent news articles, social media mentions, and analyst commentary.",
    href: "/tools/stock-sentiment-checker",
    icon: BarChart3,
  },
  {
    name: "Earnings Calendar",
    description:
      "View upcoming earnings dates for major stocks. Set alerts so you never miss an earnings report for stocks on your watchlist.",
    href: "/tools/earnings-calendar",
    icon: CalendarDays,
  },
  {
    name: "Portfolio Risk Scanner",
    description:
      "Input your portfolio holdings and get an AI-powered risk assessment including concentration risk, sector exposure, and correlation analysis.",
    href: "/tools/portfolio-risk-scanner",
    icon: ShieldAlert,
  },
];

export default function ToolsPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://stoxpulse.com" },
      { "@type": "ListItem", position: 2, name: "Tools", item: "https://stoxpulse.com/tools" },
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
        {/* Breadcrumbs */}
        <div className="mx-auto max-w-5xl px-6 pt-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">Tools</span>
          </nav>
        </div>

        {/* Hero */}
        <section className="mx-auto max-w-5xl px-6 pt-12 pb-12">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Free Stock Analysis <span className="text-brand">Tools</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            AI-powered tools to help you analyze earnings calls, SEC filings, and market
            sentiment. Built for self-directed retail investors.
          </p>
        </section>

        {/* Tools Grid */}
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="group relative rounded-2xl bg-surface-1 border border-border p-6 hover:border-brand/40 transition-colors duration-200"
              >
                {tool.name !== "SEC Filing Translator" && (
                  <span className="absolute top-4 right-4 inline-flex items-center rounded-full bg-warning/10 border border-warning/20 px-2.5 py-0.5 text-xs font-medium text-warning">
                    Coming Soon
                  </span>
                )}
                <div className="flex items-center justify-center size-12 rounded-xl bg-brand/10 border border-brand/20 mb-4">
                  <tool.icon className="size-6 text-brand" />
                </div>
                <h2 className="font-display text-lg font-semibold text-foreground group-hover:text-brand transition-colors pr-20">
                  {tool.name}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {tool.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-brand opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more
                  <ArrowRight className="size-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="rounded-2xl bg-surface-1 border border-border p-8 md:p-12 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Get notified when tools launch
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Join the StoxPulse waitlist to be the first to access our free AI-powered
              stock analysis tools.
            </p>
            <Link
              href="/#waitlist"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand/90 transition-colors"
            >
              Join Waitlist
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
