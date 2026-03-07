import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Brain, Shield, TrendingUp, Users, Zap, BookOpen } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "About StoxPulse — AI Stock Intelligence for Retail Investors",
  description:
    "StoxPulse gives self-directed retail investors institutional-grade AI research tools. Learn about our mission, methodology, and how we use AI to analyze earnings calls, SEC filings, and financial news.",
  alternates: { canonical: "https://stoxpulse.com/about" },
  openGraph: {
    title: "About StoxPulse — AI-Powered Stock Intelligence",
    description:
      "Learn how StoxPulse uses Google Gemini AI to analyze earnings calls, decode SEC filings, and score financial news — giving retail investors the tools previously reserved for Wall Street.",
    url: "https://stoxpulse.com/about",
    type: "website",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://stoxpulse.com/#organization",
  name: "StoxPulse",
  url: "https://stoxpulse.com",
  logo: "https://stoxpulse.com/images/related/logo1.png",
  description:
    "AI-powered stock intelligence platform that reads earnings calls, analyzes SEC filings, scores financial news, and tracks insider transactions for retail investors.",
  foundingDate: "2026",
  knowsAbout: [
    "Stock market analysis",
    "Earnings call analysis using AI",
    "SEC filing analysis",
    "Insider trading activity",
    "Financial statement analysis",
    "AI-powered investing tools",
    "S&P 500 stock research",
    "Retail investor education",
  ],
  sameAs: [
    "https://x.com/stoxpulse",
    "https://twitter.com/stoxpulse",
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://stoxpulse.com" },
    { "@type": "ListItem", position: 2, name: "About", item: "https://stoxpulse.com/about" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is StoxPulse?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "StoxPulse is an AI-powered stock intelligence platform that reads earnings call transcripts, analyzes SEC filings, scores financial news, and tracks insider transactions — giving self-directed retail investors the kind of research previously only available to institutional professionals.",
      },
    },
    {
      "@type": "Question",
      name: "How does StoxPulse analyze earnings calls?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "StoxPulse uses Google Gemini AI to read every earnings call transcript, extract key financial metrics and forward guidance, score management sentiment as bullish, neutral, or bearish, identify red flags, and track promises made by management across quarters.",
      },
    },
    {
      "@type": "Question",
      name: "What data sources does StoxPulse use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "StoxPulse sources data from SEC EDGAR (official government database for filings and insider trades), Finnhub (real-time quotes and news), and Financial Modeling Prep (financial statements and ratios). All data is cross-referenced and verified before AI analysis.",
      },
    },
    {
      "@type": "Question",
      name: "Is StoxPulse investment advice?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. StoxPulse provides financial information and AI-generated analysis for educational and informational purposes only. Nothing on StoxPulse constitutes investment advice. Always consult a qualified financial advisor before making investment decisions.",
      },
    },
  ],
};

const pillars = [
  {
    icon: Brain,
    title: "AI-Powered Research",
    description:
      "Google Gemini AI reads every earnings call, SEC filing, and news item — extracting insights that would take a human analyst hours to find.",
  },
  {
    icon: Shield,
    title: "Verified Data Sources",
    description:
      "We source directly from SEC EDGAR (the official US government database), not third-party aggregators — ensuring accuracy on insider trades and filings.",
  },
  {
    icon: TrendingUp,
    title: "Institutional-Grade Signals",
    description:
      "Our AI trading signals synthesize fundamentals, technicals, insider activity, analyst consensus, and news flow — the same signals used by professional funds.",
  },
  {
    icon: Users,
    title: "Built for Retail Investors",
    description:
      "We strip out the jargon. Every AI output — earnings summaries, filing translations, signals — is written in plain English any investor can understand.",
  },
  {
    icon: Zap,
    title: "Real-Time Monitoring",
    description:
      "New SEC filings, earnings releases, and insider trades are detected and analyzed within hours, not days — so you're never caught off guard.",
  },
  {
    icon: BookOpen,
    title: "Education-First Approach",
    description:
      "Beyond signals, we explain the *why*. Every AI analysis includes the reasoning, so you learn to recognize patterns yourself over time.",
  },
];

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Navbar />
      <main className="min-h-screen bg-background pt-20 sm:pt-24 pb-16">
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-6 pt-12 pb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-sm font-medium text-brand mb-6">
            About StoxPulse
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl speakable">
            The AI Research Analyst{" "}
            <span className="text-brand">Serious Investors</span>{" "}
            Wish They Could Afford
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto speakable">
            StoxPulse was built on a simple belief: the best investing decisions
            come from deep research — not hot takes and headlines. We built the
            AI tools to make institutional-grade research accessible to every
            self-directed investor.
          </p>
        </section>

        {/* Mission */}
        <section className="mx-auto max-w-4xl px-6 pb-16">
          <div className="rounded-3xl border border-brand/20 bg-brand/5 p-8 sm:p-12">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4 speakable">
              Our Mission
            </h2>
            <p className="text-muted-foreground leading-relaxed text-[15px] speakable">
              Wall Street professionals pay $500,000+/year for Bloomberg
              terminals, research analysts, and proprietary data feeds. The
              average retail investor gets financial news, message boards, and
              gut instinct. That information asymmetry costs individual investors
              billions in returns every year.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed text-[15px]">
              StoxPulse levels the playing field. Our AI reads every earnings
              call transcript, decodes every SEC filing, scores every news item,
              and tracks every insider transaction — surfacing the insights that
              matter, when they matter. For $29/month, not $500K/year.
            </p>
          </div>
        </section>

        {/* How We Work */}
        <section className="mx-auto max-w-4xl px-6 pb-16">
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">
            How StoxPulse Works
          </h2>
          <p className="text-muted-foreground mb-10 text-[15px]">
            Six pillars define our approach to AI-powered stock intelligence.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-2xl border border-border/50 bg-surface-1/40 p-6"
              >
                <div className="flex items-center justify-center size-10 rounded-xl bg-brand/10 border border-brand/20 mb-4">
                  <pillar.icon className="size-5 text-brand" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  {pillar.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Data Sources & Methodology */}
        <section className="mx-auto max-w-4xl px-6 pb-16">
          <div className="rounded-2xl border border-border/50 bg-surface-1/30 p-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Data Sources & Methodology
            </h2>
            <div className="space-y-4 text-[15px] text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">SEC EDGAR</strong> — We
                source all SEC filings (10-K, 10-Q, 8-K) and insider
                transactions (Form 4) directly from the US Securities and
                Exchange Commission&apos;s official EDGAR database. This is the
                authoritative source — not scraped from third-party aggregators.
              </p>
              <p>
                <strong className="text-foreground">Financial Data</strong> —
                Real-time quotes, financial statements, historical prices,
                analyst estimates, and earnings surprises come from Finnhub and
                Financial Modeling Prep — two industry-standard financial data
                providers used by professional applications.
              </p>
              <p>
                <strong className="text-foreground">AI Analysis</strong> — All
                AI analysis is powered by Google Gemini. Our prompting system is
                purpose-built for financial analysis: it applies a consistent
                analytical framework across all stocks, weighing valuation,
                financial health, momentum, insider activity, analyst consensus,
                and upcoming catalysts.
              </p>
              <p>
                <strong className="text-foreground">Accuracy Standard</strong>{" "}
                — Every AI-generated signal includes confidence scores and
                explicit reasoning. We surface uncertainty rather than hide it.
                Our system is designed to help you think, not to make decisions
                for you.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-4xl px-6 pb-16">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqSchema.mainEntity.map((item, i) => (
              <details
                key={i}
                className="group rounded-2xl border border-border/50 bg-surface-1/30 overflow-hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
                  {item.name}
                  <ArrowRight className="size-4 text-muted-foreground/50 transition-transform group-open:rotate-90 shrink-0 ml-4" />
                </summary>
                <div className="px-6 pb-6 pt-2 text-[15px] text-muted-foreground leading-relaxed border-t border-border/30 mx-6 mt-2">
                  {item.acceptedAnswer.text}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <section className="mx-auto max-w-4xl px-6 pb-16">
          <div className="rounded-lg border border-border/50 bg-card p-5">
            <p className="text-xs text-muted-foreground/70 leading-relaxed">
              <strong className="text-muted-foreground">Investment Disclaimer:</strong>{" "}
              StoxPulse provides financial information and AI-generated analysis
              for educational and informational purposes only. Nothing on this
              platform constitutes investment advice, a recommendation, or a
              solicitation to buy or sell any security. AI analysis may contain
              errors. Past performance does not indicate future results. Always
              consult a qualified financial advisor and verify all information
              independently before making investment decisions.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-6">
          <div className="rounded-3xl border border-brand/20 bg-brand/5 p-8 sm:p-12 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              Ready to invest on insight, not headlines?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Join the waitlist and be the first to access AI-powered earnings
              analysis, SEC filing summaries, and institutional-grade trading
              signals.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/#waitlist"
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-[15px] font-bold text-brand-foreground hover:scale-105 transition-all duration-300"
              >
                Join the Waitlist
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/stocks"
                className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-surface-1 px-6 py-3.5 text-[15px] font-medium text-foreground hover:border-brand/30 transition-all"
              >
                Browse S&P 500 Stocks
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
