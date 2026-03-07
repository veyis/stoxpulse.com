import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import {
  ChevronRight,
  Mic,
  FileText,
  BarChart3,
  CalendarDays,
  ShieldAlert,
  Filter,
  DollarSign,
  Calculator,
  UserCheck,
  GitCompare,
  ArrowRight,
} from "lucide-react";
import { EmailSubscribeForm } from "@/components/email-subscribe-form";

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
    images: [
      {
        url: "/images/og/tools.png",
        width: 1200,
        height: 630,
        alt: "StoxPulse — Free AI Stock Analysis Tools",
      },
    ],
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
    ready: true,
  },
  {
    name: "SEC Filing Translator",
    description:
      "Upload or paste a 10-K, 10-Q, or 8-K filing and get a plain-English translation of the most important sections, risk factors, and financial highlights.",
    href: "/tools/sec-filing-translator",
    icon: FileText,
    ready: true,
  },
  {
    name: "Stock Sentiment Checker",
    description:
      "Enter a stock ticker to see an aggregated AI sentiment score based on recent news articles, social media mentions, and analyst commentary.",
    href: "/tools/stock-sentiment-checker",
    icon: BarChart3,
    ready: true,
  },
  {
    name: "Earnings Calendar",
    description:
      "View upcoming earnings dates for major stocks. Set alerts so you never miss an earnings report for stocks on your watchlist.",
    href: "/tools/earnings-calendar",
    icon: CalendarDays,
    ready: true,
  },
  {
    name: "Portfolio Risk Scanner",
    description:
      "Input your portfolio holdings and get an AI-powered risk assessment including concentration risk, sector exposure, and correlation analysis.",
    href: "/tools/portfolio-risk-scanner",
    icon: ShieldAlert,
    ready: true,
  },
  {
    name: "Stock Screener",
    description:
      "Filter S&P 500 stocks by Pulse Score, sector, and key metrics. Find undervalued stocks, high-momentum plays, and top-rated picks instantly.",
    href: "/tools/stock-screener",
    icon: Filter,
    ready: true,
  },
  {
    name: "Dividend Calculator",
    description:
      "Calculate dividend income and DRIP growth for any stock. Enter a ticker and investment amount to see projected annual income over time.",
    href: "/tools/dividend-calculator",
    icon: DollarSign,
    ready: true,
  },
  {
    name: "DCF Valuation Calculator",
    description:
      "Pre-filled Discounted Cash Flow model for any stock. Adjust growth rate, discount rate, and terminal multiple to find intrinsic value.",
    href: "/tools/dcf-calculator",
    icon: Calculator,
    ready: true,
  },
  {
    name: "Insider Trading Tracker",
    description:
      "Real-time feed of insider buys and sells across top stocks. Filter by trade size, insider role, and see which executives are putting their money where their mouth is.",
    href: "/tools/insider-tracker",
    icon: UserCheck,
    ready: true,
  },
  {
    name: "Compare Stocks",
    description:
      "Compare 2-5 stocks side by side. See Pulse Scores, radar charts, financials, and an AI verdict on which stock is better for your goals.",
    href: "/tools/compare-stocks",
    icon: GitCompare,
    ready: true,
  },
];

export default function ToolsPage() {
  const toolsFaqItems = [
    {
      question: "Are StoxPulse free stock analysis tools truly free?",
      answer: "Yes, our stock analysis tools including the Earnings Call Summarizer, SEC Filing Translator, and Sentiment Checker are free to use for individual retail investors. We believe in leveling the financial playing field by providing AI-powered insights that were previously only available to institutional desks."
    },
    {
      question: "Which SEC filings can StoxPulse translate?",
      answer: "Our SEC Filing Translator handles all major corporate filings including Annual Reports (10-K), Quarterly Reports (10-Q), Current Reports (8-K), Proxy Statements (DEF 14A), and Insider Trading forms (Form 3, 4, and 5)."
    },
    {
      question: "How does the AI Stock Sentiment Checker work?",
      answer: "The Sentiment Checker uses advanced natural language processing to aggregate and score news headlines, social mentions, and analyst ratings for any ticker. It provides a normalized Pulse Score between 1 and 100, where higher scores indicate more bullish market sentiment."
    }
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://stoxpulse.com" },
      { "@type": "ListItem", position: 2, name: "Tools", item: "https://stoxpulse.com/tools" },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: toolsFaqItems.map((item) => ({
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
            {tools.map((tool) => {
              const content = (
                <>
                  {!tool.ready && (
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
                  {tool.ready && (
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-brand opacity-0 group-hover:opacity-100 transition-opacity">
                      Try it free
                      <ArrowRight className="size-3.5" />
                    </div>
                  )}
                </>
              );

              return tool.ready ? (
                <Link
                  key={tool.name}
                  href={tool.href}
                  className="group relative rounded-2xl bg-surface-1 border border-border p-6 hover:border-brand/40 transition-colors duration-200"
                >
                  {content}
                </Link>
              ) : (
                <div
                  key={tool.name}
                  className="group relative rounded-2xl bg-surface-1 border border-border p-6 opacity-70"
                >
                  {content}
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ Section — Targeted at "People Also Ask" */}
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <h2 className="font-display text-2xl font-bold text-foreground mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {toolsFaqItems.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-border bg-surface-1 p-6">
                <h3 className="text-base font-bold text-foreground mb-3">{faq.question}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Email Digest CTA */}
        <section className="mx-auto max-w-5xl px-6 pb-24">

          <div className="rounded-2xl bg-surface-1 border border-border p-8 md:p-12 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Get Daily AI Market Insights
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Subscribe to get a daily AI-powered market digest, earnings alerts, and
              SEC filing notifications delivered to your inbox.
            </p>
            <div className="mt-6 flex justify-center">
              <EmailSubscribeForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
