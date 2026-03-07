import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Calendar,
  FileText,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import {
  sp500Stocks,
  getStockByTicker,
  getRelatedStocks,
  tickerToSlug,
  slugToTicker,
} from "@/data/stocks/sp500";
import { getFinancials } from "@/lib/data";
import type { FinancialStatements, FinancialPeriod } from "@/lib/data/types";

export function generateStaticParams() {
  return sp500Stocks.map((stock) => ({
    ticker: tickerToSlug(stock.ticker),
  }));
}

type Props = {
  params: Promise<{ ticker: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker: slug } = await params;
  const ticker = slugToTicker(slug);
  const stock = getStockByTicker(ticker);

  if (!stock) {
    return { title: "Stock Not Found" };
  }

  const title = `${stock.name} (${stock.ticker}) Earnings History — Revenue, EPS & Quarterly Results | StoxPulse`;
  const description = `${stock.ticker} earnings history: view quarterly and annual revenue, EPS, net income, and gross profit for ${stock.name}. Track earnings beats, misses, and trends over time. Updated after every earnings report.`;

  return {
    title,
    description,
    keywords: [
      `${stock.ticker} earnings history`,
      `${stock.ticker} quarterly earnings`,
      `${stock.ticker} EPS history`,
      `${stock.ticker} revenue history`,
      `${stock.name} earnings results`,
      `${stock.ticker} earnings per share`,
      `${stock.ticker} income statement`,
      `${stock.ticker} financial results`,
    ],
    alternates: {
      canonical: `https://stoxpulse.com/stocks/${tickerToSlug(stock.ticker)}/earnings`,
    },
    openGraph: {
      title: `${stock.ticker} Earnings History | StoxPulse`,
      description,
      type: "article",
      url: `https://stoxpulse.com/stocks/${tickerToSlug(stock.ticker)}/earnings`,
      siteName: "StoxPulse",
    },
    twitter: {
      card: "summary_large_image",
      title: `${stock.ticker} Earnings History | StoxPulse`,
      description: `Quarterly & annual earnings for ${stock.name} (${stock.ticker})`,
    },
  };
}

function formatLargeNumber(value: number | null): string {
  if (value === null) return "—";
  const abs = Math.abs(value);
  if (abs >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
  if (abs >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toFixed(2)}`;
}

function formatEPS(value: number | null): string {
  if (value === null) return "—";
  return `$${value.toFixed(2)}`;
}

function formatPercent(value: number | null): string {
  if (value === null) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

function computeMargin(
  numerator: number | null,
  denominator: number | null
): number | null {
  if (numerator === null || denominator === null || denominator === 0)
    return null;
  return numerator / denominator;
}

export default async function EarningsHistoryPage({ params }: Props) {
  const { ticker: slug } = await params;
  const ticker = slugToTicker(slug);
  const stock = getStockByTicker(ticker);

  if (!stock) {
    notFound();
  }

  let financials: FinancialStatements | null = null;
  try {
    financials = await getFinancials(stock.ticker);
  } catch {
    financials = null;
  }

  const quarterly: FinancialPeriod[] = financials?.quarterly ?? [];
  const annual: FinancialPeriod[] = financials?.annual ?? [];

  const relatedStocks = getRelatedStocks(stock.ticker, 4);

  // Latest metrics for stats cards
  const latest = quarterly[0] ?? null;
  const prevYear =
    quarterly.find(
      (q) =>
        q.period === latest?.period &&
        q.year === (latest?.year ?? 0) - 1
    ) ?? null;

  const revenueGrowth =
    latest?.revenue && prevYear?.revenue
      ? (latest.revenue - prevYear.revenue) / Math.abs(prevYear.revenue)
      : null;

  const faqItems = [
    {
      question: `What were ${stock.ticker}'s most recent earnings?`,
      answer: latest
        ? `${stock.name}'s most recent reported quarter (${latest.period} ${latest.year}) showed revenue of ${formatLargeNumber(latest.revenue)} and EPS of ${formatEPS(latest.epsDiluted)}. Check the table above for full quarterly and annual earnings history.`
        : `${stock.name}'s earnings data is currently being updated. Check back soon for the latest quarterly and annual results.`,
    },
    {
      question: `Where can I find ${stock.ticker}'s earnings history?`,
      answer: `This page shows ${stock.name}'s complete earnings history including revenue, EPS (earnings per share), net income, and gross profit for every reported quarter and fiscal year. Data is sourced from SEC EDGAR filings and updated after every earnings report.`,
    },
    {
      question: `What is ${stock.ticker}'s EPS trend?`,
      answer: `You can track ${stock.name}'s EPS trend in the quarterly earnings table above. Each row shows diluted EPS alongside revenue and profit margins, allowing you to spot growth, stability, or deterioration in per-share profitability over time.`,
    },
    {
      question: `When is ${stock.ticker}'s next earnings date?`,
      answer: `Visit the StoxPulse earnings calendar at stoxpulse.com/earnings to see ${stock.name}'s upcoming earnings date, consensus EPS estimate, and revenue estimate. You can also set alerts to get notified before the earnings call.`,
    },
  ];

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
        name: "Stocks",
        item: "https://stoxpulse.com/stocks",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: stock.ticker,
        item: `https://stoxpulse.com/stocks/${tickerToSlug(stock.ticker)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Earnings History",
        item: `https://stoxpulse.com/stocks/${tickerToSlug(stock.ticker)}/earnings`,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${stock.name} (${stock.ticker}) Earnings History`,
    description: `Quarterly and annual earnings data for ${stock.name} including revenue, EPS, net income, gross profit, and operating income. Sourced from SEC EDGAR.`,
    url: `https://stoxpulse.com/stocks/${tickerToSlug(stock.ticker)}/earnings`,
    creator: {
      "@type": "Organization",
      name: "StoxPulse",
      url: "https://stoxpulse.com",
    },
    keywords: [
      `${stock.ticker} earnings`,
      `${stock.ticker} revenue`,
      `${stock.ticker} EPS`,
      `${stock.name} financial results`,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
      />

      <Navbar />
      <main className="min-h-screen bg-background pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
            <ol className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              </li>
              <li><ChevronRight className="size-3.5" /></li>
              <li>
                <Link href="/stocks" className="hover:text-foreground transition-colors">Stocks</Link>
              </li>
              <li><ChevronRight className="size-3.5" /></li>
              <li>
                <Link href={`/stocks/${tickerToSlug(stock.ticker)}`} className="hover:text-foreground transition-colors">{stock.ticker}</Link>
              </li>
              <li><ChevronRight className="size-3.5" /></li>
              <li className="text-foreground font-medium">Earnings History</li>
            </ol>
          </nav>

          {/* Page Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center size-10 rounded-xl bg-brand/10 border border-brand/20">
                <BarChart3 className="size-5 text-brand" />
              </div>
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {stock.ticker} <span className="text-brand">Earnings History</span>
                </h1>
                <p className="text-sm text-muted-foreground">
                  {stock.name} — Quarterly &amp; Annual Financial Results
                </p>
              </div>
            </div>
            <p className="mt-3 text-muted-foreground leading-relaxed max-w-3xl">
              View {stock.name}&apos;s ({stock.ticker}) complete earnings history including
              revenue, EPS, net income, and profit margins. Data sourced from SEC EDGAR
              filings and updated after every earnings report.
            </p>
          </header>

          {/* Stats Cards */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <div className="rounded-2xl border border-border/50 bg-surface-1/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="size-4 text-brand" />
                <span className="text-xs font-medium text-muted-foreground">Latest Revenue</span>
              </div>
              <p className="text-xl font-bold text-foreground">{formatLargeNumber(latest?.revenue ?? null)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{latest ? `${latest.period} ${latest.year}` : "—"}</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-surface-1/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="size-4 text-brand" />
                <span className="text-xs font-medium text-muted-foreground">Latest EPS</span>
              </div>
              <p className="text-xl font-bold text-foreground">{formatEPS(latest?.epsDiluted ?? null)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Diluted</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-surface-1/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                {revenueGrowth !== null && revenueGrowth >= 0 ? (
                  <ArrowUpRight className="size-4 text-success" />
                ) : (
                  <ArrowDownRight className="size-4 text-destructive" />
                )}
                <span className="text-xs font-medium text-muted-foreground">YoY Revenue</span>
              </div>
              <p className={`text-xl font-bold ${revenueGrowth !== null && revenueGrowth >= 0 ? "text-success" : "text-destructive"}`}>
                {revenueGrowth !== null ? `${(revenueGrowth * 100).toFixed(1)}%` : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Growth</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-surface-1/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="size-4 text-brand" />
                <span className="text-xs font-medium text-muted-foreground">Quarters Tracked</span>
              </div>
              <p className="text-xl font-bold text-foreground">{quarterly.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Quarterly reports</p>
            </div>
          </section>

          {/* Quarterly Earnings Table */}
          <section className="mb-10">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">
              Quarterly Earnings
            </h2>
            {quarterly.length > 0 ? (
              <div className="rounded-2xl border border-border/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 bg-surface-1/60">
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Quarter</th>
                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Revenue</th>
                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Net Income</th>
                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground">EPS</th>
                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Gross Margin</th>
                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Net Margin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {quarterly.slice(0, 12).map((q, i) => (
                        <tr key={i} className="hover:bg-surface-1/40 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                            {q.period} {q.year}
                          </td>
                          <td className="px-4 py-3 text-right text-foreground font-mono text-xs whitespace-nowrap">
                            {formatLargeNumber(q.revenue)}
                          </td>
                          <td className={`px-4 py-3 text-right font-mono text-xs whitespace-nowrap ${(q.netIncome ?? 0) >= 0 ? "text-success" : "text-destructive"}`}>
                            {formatLargeNumber(q.netIncome)}
                          </td>
                          <td className={`px-4 py-3 text-right font-mono text-xs font-semibold whitespace-nowrap ${(q.epsDiluted ?? 0) >= 0 ? "text-foreground" : "text-destructive"}`}>
                            {formatEPS(q.epsDiluted)}
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground font-mono text-xs whitespace-nowrap">
                            {formatPercent(computeMargin(q.grossProfit, q.revenue))}
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground font-mono text-xs whitespace-nowrap">
                            {formatPercent(computeMargin(q.netIncome, q.revenue))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border/50 bg-surface-1/30 p-12 text-center">
                <BarChart3 className="size-10 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No Quarterly Data Available</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Quarterly earnings data for {stock.name} ({stock.ticker}) is currently being processed. Check back soon.
                </p>
              </div>
            )}
          </section>

          {/* Annual Earnings Table */}
          {annual.length > 0 && (
            <section className="mb-10">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                Annual Earnings
              </h2>
              <div className="rounded-2xl border border-border/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 bg-surface-1/60">
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Year</th>
                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Revenue</th>
                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Gross Profit</th>
                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Net Income</th>
                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground">EPS</th>
                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Op. Margin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {annual.slice(0, 5).map((a, i) => (
                        <tr key={i} className="hover:bg-surface-1/40 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                            FY {a.year}
                          </td>
                          <td className="px-4 py-3 text-right text-foreground font-mono text-xs whitespace-nowrap">
                            {formatLargeNumber(a.revenue)}
                          </td>
                          <td className="px-4 py-3 text-right text-foreground font-mono text-xs whitespace-nowrap">
                            {formatLargeNumber(a.grossProfit)}
                          </td>
                          <td className={`px-4 py-3 text-right font-mono text-xs whitespace-nowrap ${(a.netIncome ?? 0) >= 0 ? "text-success" : "text-destructive"}`}>
                            {formatLargeNumber(a.netIncome)}
                          </td>
                          <td className={`px-4 py-3 text-right font-mono text-xs font-semibold whitespace-nowrap ${(a.epsDiluted ?? 0) >= 0 ? "text-foreground" : "text-destructive"}`}>
                            {formatEPS(a.epsDiluted)}
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground font-mono text-xs whitespace-nowrap">
                            {formatPercent(computeMargin(a.operatingIncome, a.revenue))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* Internal Links */}
          <section className="mb-10 grid gap-3 sm:grid-cols-3">
            <Link
              href={`/stocks/${tickerToSlug(stock.ticker)}`}
              className="group flex items-center gap-3 rounded-xl border border-border/50 bg-surface-1/40 px-5 py-4 hover:border-brand/30 transition-all"
            >
              <TrendingUp className="size-5 text-brand shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-foreground text-sm group-hover:text-brand transition-colors">{stock.ticker} Full Analysis</span>
                <p className="text-xs text-muted-foreground">AI insights, news &amp; charts</p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-brand transition-all shrink-0" />
            </Link>
            <Link
              href={`/stocks/${tickerToSlug(stock.ticker)}/insider-trading`}
              className="group flex items-center gap-3 rounded-xl border border-border/50 bg-surface-1/40 px-5 py-4 hover:border-brand/30 transition-all"
            >
              <FileText className="size-5 text-brand shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-foreground text-sm group-hover:text-brand transition-colors">{stock.ticker} Insider Trading</span>
                <p className="text-xs text-muted-foreground">Form 4 buys &amp; sells</p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-brand transition-all shrink-0" />
            </Link>
            <Link
              href="/tools/sec-filing-translator"
              className="group flex items-center gap-3 rounded-xl border border-border/50 bg-surface-1/40 px-5 py-4 hover:border-brand/30 transition-all"
            >
              <FileText className="size-5 text-brand shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-foreground text-sm group-hover:text-brand transition-colors">SEC Filing Decoder</span>
                <p className="text-xs text-muted-foreground">Translate filings to English</p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-brand transition-all shrink-0" />
            </Link>
          </section>

          {/* Related Stocks Earnings */}
          {relatedStocks.length > 0 && (
            <section className="mb-10">
              <h2 className="font-display text-lg font-bold text-foreground mb-4">
                Earnings for Related <span className="text-brand/80">{stock.sector}</span> Stocks
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {relatedStocks.map((related) => (
                  <Link
                    key={related.ticker}
                    href={`/stocks/${tickerToSlug(related.ticker)}/earnings`}
                    className="group flex items-center gap-4 rounded-xl border border-border/50 bg-surface-1/40 px-5 py-4 transition-all hover:border-brand/30 hover:-translate-y-0.5"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-display text-base font-bold text-foreground group-hover:text-brand transition-colors">{related.ticker}</span>
                      <p className="text-[13px] text-muted-foreground truncate">{related.name} Earnings History</p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground/30 group-hover:text-brand transition-all group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* SEO Content */}
          <section className="mb-10">
            <div className="rounded-2xl border border-border/50 bg-surface-1/30 p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                Understanding {stock.ticker} Earnings Reports
              </h2>
              <div className="space-y-4 text-[15px] text-muted-foreground leading-relaxed">
                <p>
                  {stock.name} ({stock.ticker}) reports quarterly earnings in accordance with SEC regulations.
                  Each earnings report includes the income statement (revenue, cost of goods sold, gross profit,
                  operating income, and net income), the balance sheet, and the cash flow statement. The data shown
                  above is sourced directly from {stock.name}&apos;s SEC filings on the EDGAR database.
                </p>
                <p>
                  <strong className="text-foreground">Earnings Per Share (EPS)</strong> is the most
                  closely watched metric during earnings season. Diluted EPS accounts for all potential shares
                  from stock options and convertible securities, making it the more conservative and meaningful
                  measure. When {stock.ticker} reports EPS above the consensus analyst estimate, it&apos;s called
                  an &quot;earnings beat,&quot; which typically causes the stock to rise.
                </p>
                <p>
                  <strong className="text-foreground">Profit margins</strong> reveal operational efficiency.
                  Gross margin shows how much revenue remains after subtracting the cost of goods sold, while net
                  margin shows the final profit after all expenses, taxes, and interest. Expanding margins often
                  signal improving business fundamentals, while contracting margins can be a warning sign.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="font-display text-xl font-bold text-foreground mb-6">
              {stock.ticker} Earnings FAQ
            </h2>
            <div className="space-y-3">
              {faqItems.map((item, i) => (
                <details
                  key={i}
                  className="group rounded-2xl border border-border/50 bg-surface-1/30 overflow-hidden transition-all duration-300 hover:border-brand/20 hover:bg-surface-1/50"
                >
                  <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-[15px] font-semibold hover:bg-surface-2/30 transition-colors [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <div className="flex items-center justify-center size-8 rounded-full bg-surface-2 transition-colors group-open:bg-brand/10 shrink-0">
                      <ChevronRight className="size-4 text-muted-foreground transition-transform group-open:rotate-90 group-open:text-brand" />
                    </div>
                  </summary>
                  <div className="px-6 pb-6 pt-2 text-[15px] text-muted-foreground leading-relaxed border-t border-border/30 mx-6 mt-2">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="mb-10 rounded-lg border border-border/50 bg-card p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-4 text-warning shrink-0" />
              <p className="text-xs text-muted-foreground/70 leading-relaxed">
                <strong className="text-muted-foreground">Disclaimer:</strong>{" "}
                Financial data for {stock.name} ({stock.ticker}) is sourced from SEC filings
                and may contain processing errors. This data is provided for informational purposes
                only and does not constitute investment advice. Always verify data from official
                sources and consult a financial advisor before making investment decisions.
              </p>
            </div>
          </div>

          {/* CTA */}
          <section className="relative overflow-hidden text-center rounded-3xl border border-brand/20 bg-brand/5 p-8 sm:p-12 shadow-[0_0_40px_rgba(var(--brand-rgb),0.05)]">
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-brand/10 rounded-full blur-[80px]" />
            <div className="relative z-10">
              <h2 className="font-display text-2xl font-bold tracking-tight mb-3">
                Get <span className="text-brand">{stock.ticker}</span> Earnings Alerts
              </h2>
              <p className="text-base text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
                Join the waitlist to receive AI-powered earnings call summaries and
                financial analysis for {stock.name} within hours of every report.
              </p>
              <Link
                href="/#waitlist"
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-[15px] font-bold text-brand-foreground hover:scale-105 transition-all duration-300 glow-brand hover:shadow-xl"
              >
                Join the Waitlist
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
