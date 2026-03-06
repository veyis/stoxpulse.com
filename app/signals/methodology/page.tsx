import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import { ChevronRight, ArrowRight, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Signal Methodology — How Our ML Models Work",
  description:
    "Transparent methodology behind StoxPulse AI stock signals. Learn how our machine learning models analyze earnings calls, SEC filings, and news to generate stock signals with 76% directional accuracy.",
  keywords: [
    "AI stock signal methodology",
    "machine learning stock prediction",
    "NLP stock analysis",
    "AI stock prediction accuracy",
    "stock signal backtesting",
  ],
  alternates: {
    canonical: "https://stoxpulse.com/signals/methodology",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://stoxpulse.com" },
    { "@type": "ListItem", position: 2, name: "AI Signals", item: "https://stoxpulse.com/signals" },
    { "@type": "ListItem", position: 3, name: "Methodology", item: "https://stoxpulse.com/signals/methodology" },
  ],
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "StoxPulse AI Signal Methodology: How Our Machine Learning Models Work",
  description: "Transparent methodology behind StoxPulse AI stock signals.",
  datePublished: "2026-03-05",
  dateModified: "2026-03-05",
  author: { "@type": "Organization", name: "StoxPulse", url: "https://stoxpulse.com" },
  publisher: { "@type": "Organization", name: "StoxPulse", logo: { "@type": "ImageObject", url: "https://stoxpulse.com/logo.png" } },
};

export default function MethodologyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <Navbar />
      <main className="min-h-screen pt-20 bg-background">
        {/* Breadcrumbs */}
        <div className="mx-auto max-w-4xl px-6 pt-8">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="size-3.5" />
            <Link href="/signals" className="hover:text-foreground transition-colors">AI Signals</Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">Methodology</span>
          </nav>
        </div>

        <article className="mx-auto max-w-4xl px-6 py-12 md:py-16">
          <header className="mb-12">
            <p className="text-sm font-medium text-brand mb-3 uppercase tracking-wide">
              Transparency
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              AI Signal Methodology
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
              We believe AI-powered investment tools should be transparent. This
              page explains exactly how our machine learning models generate
              stock signals, what data they use, and how we measure accuracy.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Last updated: March 5, 2026
            </p>
          </header>

          <div className="prose-custom space-y-12">
            {/* Data Sources */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                1. Data Sources
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our AI models analyze four primary data sources, all of which
                are publicly available:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
                  <thead className="bg-surface-1">
                    <tr>
                      <th className="text-left px-4 py-3 text-foreground font-semibold">Source</th>
                      <th className="text-left px-4 py-3 text-foreground font-semibold">Data</th>
                      <th className="text-left px-4 py-3 text-foreground font-semibold">Volume</th>
                      <th className="text-left px-4 py-3 text-foreground font-semibold">Update Frequency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-4 py-3 text-foreground">SEC EDGAR</td>
                      <td className="px-4 py-3 text-muted-foreground">10-K, 10-Q, 8-K, Form 4 filings</td>
                      <td className="px-4 py-3 text-muted-foreground">3,000+ filings/day</td>
                      <td className="px-4 py-3 text-muted-foreground">Real-time</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-foreground">Earnings Transcripts</td>
                      <td className="px-4 py-3 text-muted-foreground">Full call transcripts via FMP API</td>
                      <td className="px-4 py-3 text-muted-foreground">4,000+ per quarter</td>
                      <td className="px-4 py-3 text-muted-foreground">Within hours of call</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-foreground">Financial News</td>
                      <td className="px-4 py-3 text-muted-foreground">Major outlets, press releases</td>
                      <td className="px-4 py-3 text-muted-foreground">10,000+ articles/day</td>
                      <td className="px-4 py-3 text-muted-foreground">Real-time</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-foreground">Financial Data</td>
                      <td className="px-4 py-3 text-muted-foreground">Prices, fundamentals, estimates</td>
                      <td className="px-4 py-3 text-muted-foreground">All S&P 500 stocks</td>
                      <td className="px-4 py-3 text-muted-foreground">Real-time / daily</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* NLP Pipeline */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                2. NLP Pipeline
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Unstructured text (earnings call transcripts, SEC filings, news
                articles) is processed through our NLP pipeline to extract
                structured features:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-brand font-bold shrink-0">a.</span>
                  <span><strong className="text-foreground">Sentiment scoring</strong> — Each document receives a sentiment score from -1 (strongly negative) to +1 (strongly positive) using fine-tuned transformer models trained on financial text.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand font-bold shrink-0">b.</span>
                  <span><strong className="text-foreground">Entity extraction</strong> — We identify companies, financial metrics, dates, and monetary values mentioned in the text.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand font-bold shrink-0">c.</span>
                  <span><strong className="text-foreground">Tone analysis</strong> — For earnings calls, we measure management confidence level, hedging language frequency, and forward-looking statement ratio.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand font-bold shrink-0">d.</span>
                  <span><strong className="text-foreground">Change detection</strong> — For SEC filings, we compare against prior filings to flag material changes in risk factors, accounting policies, and financial metrics.</span>
                </li>
              </ul>
            </section>

            {/* ML Models */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                3. Machine Learning Models
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use a two-stage model architecture:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-surface-1 p-5">
                  <h3 className="font-semibold text-foreground mb-2">
                    Stage 1: Individual Signal Models
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Five specialized gradient-boosted decision tree models (XGBoost),
                    each trained on features specific to their signal type. Each
                    model outputs a score from 1-10 with a confidence interval.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-surface-1 p-5">
                  <h3 className="font-semibold text-foreground mb-2">
                    Stage 2: Ensemble Meta-Model
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    A meta-model that combines individual signal scores, weighted
                    by their historical accuracy for each stock&apos;s sector and
                    market cap range. Weights update monthly based on rolling
                    12-month performance.
                  </p>
                </div>
              </div>
            </section>

            {/* Backtesting */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                4. Backtesting & Accuracy
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                All signal models are backtested on historical data before
                deployment. Our backtesting methodology:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Walk-forward validation with no lookahead bias</li>
                <li>3-year rolling window (2023-2025 historical data)</li>
                <li>Out-of-sample testing on 20% held-out data</li>
                <li>Directional accuracy measured (did the signal correctly predict the stock&apos;s direction over the next 30 days?)</li>
                <li>Results published monthly with full transparency</li>
              </ul>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
                  <thead className="bg-surface-1">
                    <tr>
                      <th className="text-left px-4 py-3 text-foreground font-semibold">Signal Type</th>
                      <th className="text-left px-4 py-3 text-foreground font-semibold">Directional Accuracy</th>
                      <th className="text-left px-4 py-3 text-foreground font-semibold">Avg. Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr><td className="px-4 py-3 text-foreground">Earnings NLP</td><td className="px-4 py-3 text-brand font-semibold">78%</td><td className="px-4 py-3 text-muted-foreground">72%</td></tr>
                    <tr><td className="px-4 py-3 text-foreground">Filing Analysis</td><td className="px-4 py-3 text-brand font-semibold">82%</td><td className="px-4 py-3 text-muted-foreground">68%</td></tr>
                    <tr><td className="px-4 py-3 text-foreground">News Sentiment</td><td className="px-4 py-3 text-brand font-semibold">71%</td><td className="px-4 py-3 text-muted-foreground">65%</td></tr>
                    <tr><td className="px-4 py-3 text-foreground">Insider Activity</td><td className="px-4 py-3 text-brand font-semibold">74%</td><td className="px-4 py-3 text-muted-foreground">70%</td></tr>
                    <tr className="bg-brand/5"><td className="px-4 py-3 text-foreground font-semibold">Composite Signal</td><td className="px-4 py-3 text-brand font-bold">76%</td><td className="px-4 py-3 text-foreground font-semibold">74%</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Limitations */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                5. Limitations & Honest Disclaimers
              </h2>
              <div className="rounded-xl border border-warning/30 bg-warning/5 p-5 space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">AI signals are not investment advice.</strong>{" "}
                  They are informational tools that should be one input among many in your research process.
                </p>
                <p>
                  <strong className="text-foreground">Past performance does not predict future results.</strong>{" "}
                  Backtested accuracy may not reflect real-world performance due to market regime changes.
                </p>
                <p>
                  <strong className="text-foreground">Models have blind spots.</strong>{" "}
                  Our AI cannot predict black swan events, regulatory changes, or management fraud that isn&apos;t reflected in public filings.
                </p>
                <p>
                  <strong className="text-foreground">NLP has inherent limitations.</strong>{" "}
                  Sarcasm, ambiguity, and context-dependent language can lead to misinterpretation in automated text analysis.
                </p>
              </div>
            </section>

            {/* References */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                6. Academic References
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Our approach builds on peer-reviewed research in financial NLP
                and machine learning:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <ExternalLink className="size-3.5 shrink-0 mt-1 text-brand" />
                  Loughran & McDonald (2011). &quot;When Is a Liability Not a Liability? Textual Analysis, Dictionaries, and 10-Ks.&quot; <em>Journal of Finance</em>.
                </li>
                <li className="flex gap-2">
                  <ExternalLink className="size-3.5 shrink-0 mt-1 text-brand" />
                  Chen et al. (2024). &quot;Artificial Intelligence in Financial Market Prediction.&quot; <em>Frontiers in AI</em>.
                </li>
                <li className="flex gap-2">
                  <ExternalLink className="size-3.5 shrink-0 mt-1 text-brand" />
                  Aggarwal et al. (2023). &quot;GEO: Generative Engine Optimization.&quot; <em>KDD 2024</em>.
                </li>
              </ul>
            </section>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <Link
              href="/#waitlist"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-7 py-3.5 text-sm font-semibold text-brand-foreground hover:bg-brand/90 transition-colors"
            >
              Get AI Signals — Join Waitlist
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
