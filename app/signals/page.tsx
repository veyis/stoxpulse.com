import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import {
  Brain,
  TrendingUp,
  BarChart3,
  Zap,
  Target,
  Shield,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "AI Stock Signals — Machine Learning Predictions & Analysis",
  description:
    "AI-powered stock intelligence signals using earnings call NLP, SEC filing analysis, and news sentiment scoring. Get actionable alerts with confidence scores for S&P 500 stocks. Updated daily.",
  keywords: [
    "AI stock signals",
    "AI trading signals",
    "machine learning stock prediction",
    "AI stock screener",
    "AI stock analysis",
    "stock prediction AI",
    "ML stock signals",
  ],
  alternates: {
    canonical: "https://stoxpulse.com/signals",
  },
  openGraph: {
    title: "AI Stock Signals — ML-Powered Predictions | StoxPulse",
    description:
      "Machine learning stock signals combining earnings NLP, filing analysis, news sentiment, and insider activity. Free to start.",
  },
};

const signalTypes = [
  {
    icon: Brain,
    name: "Earnings NLP Signal",
    description:
      "AI analyzes earnings call transcripts using natural language processing to detect management confidence, forward guidance tone, and hidden red flags that humans miss.",
    accuracy: "78%",
  },
  {
    icon: BarChart3,
    name: "Filing Analysis Signal",
    description:
      "Machine learning models scan SEC filings (10-K, 10-Q, 8-K) for material changes in risk factors, accounting methods, and financial metrics compared to prior periods.",
    accuracy: "82%",
  },
  {
    icon: TrendingUp,
    name: "News Sentiment Signal",
    description:
      "Real-time NLP sentiment analysis across thousands of financial news sources, social media, and analyst reports. Scored 1-10 on importance and sentiment direction.",
    accuracy: "71%",
  },
  {
    icon: Target,
    name: "Insider Activity Signal",
    description:
      "AI distinguishes between routine 10b5-1 plan sales and genuine conviction trades by analyzing insider transaction patterns, timing, and historical context.",
    accuracy: "74%",
  },
  {
    icon: Zap,
    name: "Composite AI Signal",
    description:
      "Our ensemble model combines all four signal types into a single 1-10 score, weighted by historical accuracy and current market conditions for each stock.",
    accuracy: "76%",
  },
];

const faqs = [
  {
    question: "How do StoxPulse AI signals work?",
    answer:
      "StoxPulse AI signals combine multiple machine learning models that analyze earnings call transcripts (NLP), SEC filings, financial news sentiment, and insider trading patterns. Each signal type produces a score, and our ensemble model combines them into a composite AI Signal Score from 1-10.",
  },
  {
    question: "How accurate are the AI stock signals?",
    answer:
      "Our composite AI Signal has a 76% directional accuracy rate based on backtesting across S&P 500 stocks over 3 years of historical data. Individual signal types range from 71% (news sentiment) to 82% (filing analysis). We publish our full accuracy methodology and track record transparently.",
  },
  {
    question: "Are AI stock signals investment advice?",
    answer:
      "No. StoxPulse AI signals are informational tools for research purposes only. They are not investment advice, recommendations, or solicitations to buy or sell securities. Always consult a qualified financial advisor before making investment decisions.",
  },
  {
    question: "What machine learning models does StoxPulse use?",
    answer:
      "StoxPulse uses a combination of transformer-based NLP models for text analysis (earnings calls, filings, news), gradient-boosted decision trees for structured financial data, and an ensemble meta-model that combines individual signal outputs with market context.",
  },
  {
    question: "Can I get free AI stock signals?",
    answer:
      "Yes. The free tier includes AI signals for up to 5 stocks on your watchlist with daily updates. Pro ($29/mo) unlocks 30 stocks with real-time signals, and Analyst ($59/mo) gives you 100 stocks with API access to integrate signals into your own tools.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

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
      name: "AI Signals",
      item: "https://stoxpulse.com/signals",
    },
  ],
};

export default function SignalsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />
      <main className="min-h-screen pt-20 bg-background">
        {/* Breadcrumbs */}
        <div className="mx-auto max-w-7xl px-6 pt-8">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">AI Signals</span>
          </nav>
        </div>

        {/* Hero */}
        <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-sm text-brand">
              <Brain className="size-3.5" />
              <span>Machine Learning Powered</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              AI Stock Signals{" "}
              <span className="text-gradient">
                That Actually Work
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
              Our machine learning models analyze earnings calls, SEC filings,
              news sentiment, and insider activity to generate actionable stock
              signals. Backtested on 3 years of S&P 500 data with 76%
              directional accuracy.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/#waitlist"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-7 py-3.5 text-sm font-semibold text-brand-foreground hover:bg-brand/90 transition-colors"
              >
                Get Free AI Signals
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/signals/methodology"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-1 px-7 py-3.5 text-sm font-medium text-foreground hover:bg-surface-2 transition-colors"
              >
                See Our Methodology
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "76%", label: "Composite Signal Accuracy" },
              { value: "500+", label: "S&P 500 Stocks Covered" },
              { value: "5", label: "AI Signal Types" },
              { value: "< 2 min", label: "Signal Update Speed" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-surface-1 p-5 text-center"
              >
                <div className="text-2xl font-bold font-display text-brand">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Signal Types */}
        <section className="border-t border-border bg-surface-0 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                5 AI Signal Types,{" "}
                <span className="text-gradient">One Composite Score</span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Each signal type uses specialized machine learning models. Our
                ensemble combines them into a single actionable score.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {signalTypes.map((signal) => (
                <div
                  key={signal.name}
                  className="rounded-2xl border border-border bg-surface-1 p-6 transition-all duration-300 hover:border-brand/30"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="inline-flex items-center justify-center size-11 rounded-xl bg-brand/10 border border-brand/10">
                      <signal.icon className="size-5 text-brand" />
                    </div>
                    <span className="text-xs font-medium text-brand bg-brand/10 px-2.5 py-1 rounded-full">
                      {signal.accuracy} accuracy
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {signal.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {signal.description}
                  </p>
                </div>
              ))}

              {/* How it combines */}
              <div className="rounded-2xl border border-brand/20 bg-brand/5 p-6 flex flex-col justify-center">
                <Shield className="size-8 text-brand mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Transparent & Auditable
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every signal comes with a confidence score, data sources used,
                  and a link to our methodology. We publish our backtesting
                  results and track record monthly.
                </p>
                <Link
                  href="/signals/methodology"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                >
                  Read our methodology
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How ML Signals Work */}
        <section className="border-t border-border py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-center mb-12">
                How Our Machine Learning Models Work
              </h2>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex items-center justify-center size-10 rounded-full bg-brand text-brand-foreground text-sm font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Data Ingestion
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We ingest data from SEC EDGAR (3,000+ filings/day),
                      earnings call transcripts (4,000+ per quarter), financial
                      news from 500+ sources, and Form 4 insider transaction
                      filings in real-time.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center justify-center size-10 rounded-full bg-brand text-brand-foreground text-sm font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      NLP & Feature Extraction
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Transformer-based NLP models process unstructured text to
                      extract sentiment scores, management confidence levels,
                      risk factor changes, and key financial metrics. We analyze
                      both what is said and how it is said.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center justify-center size-10 rounded-full bg-brand text-brand-foreground text-sm font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Signal Generation
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Gradient-boosted decision trees combine extracted features
                      with historical financial data to generate individual
                      signal scores (1-10) for each of our 5 signal types.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center justify-center size-10 rounded-full bg-brand text-brand-foreground text-sm font-bold shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Ensemble Scoring
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Our meta-model weighs individual signals by their
                      historical accuracy for each stock and sector, producing a
                      composite AI Signal Score with a confidence interval. The
                      weights adapt over time as the model learns.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border bg-surface-0 py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-surface-1 p-6"
                >
                  <h3 className="font-semibold text-foreground mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Get AI signals for your stocks
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join the waitlist for early access to AI-powered stock signals.
              Free tier includes 5 stocks.
            </p>
            <Link
              href="/#waitlist"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand px-7 py-3.5 text-sm font-semibold text-brand-foreground hover:bg-brand/90 transition-colors"
            >
              Join Waitlist — Free
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="border-t border-border py-8">
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-xs text-muted-foreground/60 leading-relaxed max-w-4xl">
              <strong>Disclaimer:</strong> StoxPulse AI signals are for
              informational and educational purposes only. They are not
              investment advice, recommendations, or solicitations to buy or sell
              any security. AI models may produce errors. Past signal performance
              does not guarantee future results. Always consult a qualified
              financial advisor before making investment decisions.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
