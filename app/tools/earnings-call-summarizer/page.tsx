import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import {
  ChevronRight,
  ArrowRight,
  Upload,
  Brain,
  FileText,
  Zap,
  AlertTriangle,
  BarChart3,
  MessageSquare,
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "AI Earnings Call Summarizer — Free Tool | StoxPulse",
  description:
    "Summarize any earnings call transcript with AI. Get key takeaways, sentiment analysis, red flags, and management tone insights in seconds. Free earnings call summary tool for investors.",
  keywords: [
    "earnings call summarizer",
    "AI earnings call summary",
    "earnings call analyzer",
    "earnings transcript summary",
    "earnings call key takeaways",
    "AI stock analysis tool",
  ],
  openGraph: {
    title: "AI Earnings Call Summarizer — Free Tool | StoxPulse",
    description:
      "Summarize any earnings call with AI. Key takeaways, sentiment, red flags in seconds.",
    url: "https://stoxpulse.com/tools/earnings-call-summarizer",
  },
  alternates: {
    canonical: "https://stoxpulse.com/tools/earnings-call-summarizer",
  },
};

const steps = [
  {
    step: 1,
    title: "Paste or Upload",
    description:
      "Paste an earnings call transcript or upload a text file. We support transcripts from all major providers.",
    icon: Upload,
  },
  {
    step: 2,
    title: "AI Analyzes",
    description:
      "Our AI processes the transcript, identifying key financial metrics, management tone shifts, and notable Q&A exchanges.",
    icon: Brain,
  },
  {
    step: 3,
    title: "Get Your Summary",
    description:
      "Receive a structured summary with key takeaways, sentiment score, red flags, and guidance changes in under 30 seconds.",
    icon: FileText,
  },
];

const features = [
  {
    title: "Key Takeaway Extraction",
    description:
      "Automatically identifies the 5-10 most important points from the earnings call, including revenue surprises, guidance changes, and strategic updates.",
    icon: Zap,
  },
  {
    title: "Red Flag Detection",
    description:
      "AI flags concerning patterns like evasive answers, removed metrics, non-GAAP manipulation, and management tone shifts that may signal trouble.",
    icon: AlertTriangle,
  },
  {
    title: "Sentiment Scoring",
    description:
      "Get a quantified sentiment score (Bullish / Neutral / Bearish) based on management language, tone, and forward-looking statements.",
    icon: BarChart3,
  },
  {
    title: "Q&A Highlight Reel",
    description:
      "The most important analyst questions and management responses are extracted and summarized so you can focus on what matters.",
    icon: MessageSquare,
  },
  {
    title: "Quarter-over-Quarter Comparison",
    description:
      "Compare management language and sentiment across multiple quarters to detect trends in confidence, growth trajectory, and risk factors.",
    icon: TrendingUp,
  },
];

const faq = [
  {
    question: "What is an earnings call summarizer?",
    answer:
      "An earnings call summarizer is an AI-powered tool that processes earnings call transcripts and produces a concise summary of the most important information, including key financial metrics, management commentary highlights, sentiment analysis, and red flags. It saves investors hours of manual transcript reading.",
  },
  {
    question: "How accurate is the AI earnings call summary?",
    answer:
      "Our AI model is trained on thousands of earnings call transcripts and achieves high accuracy in extracting key metrics and sentiment. However, AI analysis should always be used as a supplement to your own research, not as a replacement. We recommend verifying critical data points against the original transcript.",
  },
  {
    question: "Which companies' earnings calls can I summarize?",
    answer:
      "You can summarize earnings call transcripts from any publicly traded company. Simply paste the transcript text or upload a text file. We support transcripts from major providers including Seeking Alpha, The Motley Fool, and company investor relations pages.",
  },
  {
    question: "Is the earnings call summarizer free?",
    answer:
      "Yes, the basic earnings call summarizer will be free to use with a StoxPulse account. Free users can summarize up to 5 transcripts per month. Pro subscribers get unlimited summaries with additional features like quarter-over-quarter comparison and portfolio-wide earnings analysis.",
  },
  {
    question: "How is this different from reading an earnings call transcript myself?",
    answer:
      "A typical earnings call transcript is 8,000-15,000 words and takes 30-60 minutes to read carefully. Our AI summarizer processes the entire transcript in under 30 seconds and surfaces the key information in a structured format. It also detects subtle patterns like tone shifts and evasive language that are easy to miss when reading manually.",
  },
];

export default function EarningsCallSummarizerPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://stoxpulse.com" },
      { "@type": "ListItem", position: 2, name: "Tools", item: "https://stoxpulse.com/tools" },
      {
        "@type": "ListItem",
        position: 3,
        name: "Earnings Call Summarizer",
        item: "https://stoxpulse.com/tools/earnings-call-summarizer",
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "StoxPulse Earnings Call Summarizer",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    url: "https://stoxpulse.com/tools/earnings-call-summarizer",
    description:
      "AI-powered tool that summarizes earnings call transcripts, extracts key takeaways, scores sentiment, and detects red flags for stock investors.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "AI Earnings Call Summary",
      "Key Takeaway Extraction",
      "Red Flag Detection",
      "Sentiment Scoring",
      "Quarter-over-Quarter Comparison",
    ],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
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
            <Link href="/tools" className="hover:text-foreground transition-colors">
              Tools
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">Earnings Call Summarizer</span>
          </nav>
        </div>

        {/* Hero */}
        <section className="mx-auto max-w-4xl px-6 pt-12 pb-16">
          <span className="inline-flex items-center rounded-full bg-warning/10 border border-warning/20 px-3 py-1 text-xs font-medium text-warning mb-4">
            Coming Soon
          </span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            AI Earnings Call <span className="text-brand">Summarizer</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Paste any earnings call transcript and get an AI-generated summary with key
            takeaways, sentiment analysis, red flags, and management tone insights — in
            under 30 seconds.
          </p>
        </section>

        {/* How It Works */}
        <section className="mx-auto max-w-4xl px-6 pb-16">
          <h2 className="font-display text-2xl font-bold text-foreground mb-8">
            How It Works
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.step}
                className="relative rounded-2xl bg-surface-1 border border-border p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center size-10 rounded-xl bg-brand/10 border border-brand/20">
                    <step.icon className="size-5 text-brand" />
                  </div>
                  <span className="font-display text-sm font-bold text-brand">
                    Step {step.step}
                  </span>
                </div>
                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-4xl px-6 pb-16">
          <h2 className="font-display text-2xl font-bold text-foreground mb-8">
            Features
          </h2>
          <div className="space-y-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex gap-4 rounded-2xl bg-surface-1 border border-border p-6"
              >
                <div className="flex items-center justify-center size-10 rounded-xl bg-brand/10 border border-brand/20 shrink-0">
                  <feature.icon className="size-5 text-brand" />
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Coming Soon CTA */}
        <section className="mx-auto max-w-4xl px-6 pb-16">
          <div className="rounded-2xl bg-brand/5 border border-brand/20 p-8 md:p-12 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Be the first to try it
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              The Earnings Call Summarizer is currently in development. Join the waitlist
              to get early access when it launches.
            </p>
            <Link
              href="/#waitlist"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand/90 transition-colors"
            >
              Join Waitlist for Early Access
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-4xl px-6 pb-24">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faq.map((item) => (
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
      </main>
      <Footer />
    </>
  );
}
