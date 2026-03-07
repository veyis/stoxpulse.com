import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  UserCheck,
  DollarSign,
  TrendingUp,
  Shield,
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
import { getInsiderTrades } from "@/lib/data";
import type { InsiderTransaction } from "@/lib/types/stock";

export function generateStaticParams() {
  return sp500Stocks.slice(0, 100).map((stock) => ({
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

  const title = `${stock.name} (${stock.ticker}) Insider Trading & Form 4 Filings | StoxPulse`;
  const description = `Track ${stock.ticker} insider trading activity. See recent Form 4 filings, insider buys and sells, transaction values, and AI analysis of ${stock.name}'s insider ownership patterns. Updated daily.`;

  return {
    title,
    description,
    keywords: [
      `${stock.ticker} insider trading`,
      `${stock.ticker} form 4`,
      `${stock.ticker} insider buys`,
      `${stock.ticker} insider sells`,
      `${stock.name} insider transactions`,
      `${stock.ticker} insider ownership`,
      `${stock.ticker} SEC form 4 filings`,
      `who is buying ${stock.ticker} stock`,
    ],
    alternates: {
      canonical: `https://stoxpulse.com/stocks/${tickerToSlug(stock.ticker)}/insider-trading`,
    },
    openGraph: {
      title: `${stock.ticker} Insider Trading Activity | StoxPulse`,
      description,
      type: "article",
      url: `https://stoxpulse.com/stocks/${tickerToSlug(stock.ticker)}/insider-trading`,
      siteName: "StoxPulse",
    },
    twitter: {
      card: "summary_large_image",
      title: `${stock.ticker} Insider Trading | StoxPulse`,
      description: `Recent insider buys & sells for ${stock.name} (${stock.ticker})`,
    },
  };
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(2)}`;
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export default async function InsiderTradingPage({ params }: Props) {
  const { ticker: slug } = await params;
  const ticker = slugToTicker(slug);
  const stock = getStockByTicker(ticker);

  if (!stock) {
    notFound();
  }

  // Fetch insider trades from the data layer
  let insiderTrades: InsiderTransaction[] = [];
  try {
    insiderTrades = await getInsiderTrades(stock.ticker);
  } catch {
    insiderTrades = [];
  }

  const relatedStocks = getRelatedStocks(stock.ticker, 4);

  const totalBuys = insiderTrades.filter((t) => t.type === "Buy").length;
  const totalSells = insiderTrades.filter((t) => t.type === "Sale").length;
  const totalBuyValue = insiderTrades
    .filter((t) => t.type === "Buy")
    .reduce((sum, t) => sum + t.totalValue, 0);
  const totalSellValue = insiderTrades
    .filter((t) => t.type === "Sale")
    .reduce((sum, t) => sum + t.totalValue, 0);

  const buyToSellRatio = totalSells > 0 ? totalBuys / totalSells : totalBuys;
  const sentiment =
    buyToSellRatio > 1.5
      ? "Bullish"
      : buyToSellRatio > 0.8
        ? "Neutral"
        : "Bearish";
  const sentimentColor =
    sentiment === "Bullish"
      ? "text-success"
      : sentiment === "Bearish"
        ? "text-destructive"
        : "text-muted-foreground";

  // FAQ Structured Data for rich snippets
  const faqItems = [
    {
      question: `Who is buying ${stock.ticker} stock?`,
      answer: `Recent SEC Form 4 filings show ${totalBuys} insider purchase${totalBuys !== 1 ? "s" : ""} totaling ${formatCurrency(totalBuyValue)} for ${stock.name} (${stock.ticker}). Insider buying can signal that corporate executives believe the stock is undervalued. StoxPulse monitors all Form 4 filings daily.`,
    },
    {
      question: `Are insiders selling ${stock.ticker} stock?`,
      answer: `There have been ${totalSells} insider sale${totalSells !== 1 ? "s" : ""} totaling ${formatCurrency(totalSellValue)} in recent Form 4 filings for ${stock.name}. Insider selling does not always indicate bearishness — executives often sell for diversification, tax planning, or personal liquidity needs. Our AI analyzes whether sales are routine (10b5-1 plan) or notable.`,
    },
    {
      question: `What is a Form 4 filing for ${stock.ticker}?`,
      answer: `A Form 4 is a document filed with the SEC when corporate insiders (directors, officers, or 10%+ shareholders) of ${stock.name} buy or sell ${stock.ticker} stock. These filings must be submitted within two business days of the transaction and are publicly available on the SEC's EDGAR database.`,
    },
    {
      question: `How does StoxPulse track ${stock.ticker} insider trading?`,
      answer: `StoxPulse's AI monitors all Form 4 filings from the SEC's EDGAR system for ${stock.name} (${stock.ticker}). Each transaction is automatically parsed, categorized as a buy or sale, and analyzed for significance. We flag unusual transactions that deviate from routine selling patterns.`,
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
        name: "Insider Trading",
        item: `https://stoxpulse.com/stocks/${tickerToSlug(stock.ticker)}/insider-trading`,
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
    name: `${stock.name} (${stock.ticker}) Insider Trading Data`,
    description: `SEC Form 4 insider trading filings for ${stock.name}. Includes insider purchases, sales, option exercises, and transaction values. Updated daily by StoxPulse AI.`,
    url: `https://stoxpulse.com/stocks/${tickerToSlug(stock.ticker)}/insider-trading`,
    creator: {
      "@type": "Organization",
      name: "StoxPulse",
      url: "https://stoxpulse.com",
    },
    keywords: [
      `${stock.ticker} insider trading`,
      `${stock.ticker} form 4`,
      `${stock.name} insider buys`,
      `${stock.name} insider sells`,
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
                <Link
                  href="/"
                  className="hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight className="size-3.5" />
              </li>
              <li>
                <Link
                  href="/stocks"
                  className="hover:text-foreground transition-colors"
                >
                  Stocks
                </Link>
              </li>
              <li>
                <ChevronRight className="size-3.5" />
              </li>
              <li>
                <Link
                  href={`/stocks/${tickerToSlug(stock.ticker)}`}
                  className="hover:text-foreground transition-colors"
                >
                  {stock.ticker}
                </Link>
              </li>
              <li>
                <ChevronRight className="size-3.5" />
              </li>
              <li className="text-foreground font-medium">Insider Trading</li>
            </ol>
          </nav>

          {/* Page Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center size-10 rounded-xl bg-brand/10 border border-brand/20">
                <UserCheck className="size-5 text-brand" />
              </div>
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {stock.ticker}{" "}
                  <span className="text-brand">Insider Trading</span>
                </h1>
                <p className="text-sm text-muted-foreground">
                  {stock.name} — SEC Form 4 Filings
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground/60 uppercase tracking-wider font-medium">
                  SEC Form 4 Data
                </p>
              </div>
            </div>
            <p className="mt-3 text-muted-foreground leading-relaxed max-w-3xl">
              Track insider buying and selling activity for {stock.name} (
              {stock.ticker}). Data sourced from SEC EDGAR Form 4 filings and
              analyzed by StoxPulse AI for significance.
            </p>
          </header>

          {/* Quick Stats Cards */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <div className="rounded-2xl border border-border/50 bg-surface-1/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="size-4 text-success" />
                <span className="text-xs font-medium text-muted-foreground">
                  Insider Buys
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">{totalBuys}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatCurrency(totalBuyValue)} total
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-surface-1/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownRight className="size-4 text-destructive" />
                <span className="text-xs font-medium text-muted-foreground">
                  Insider Sales
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">{totalSells}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatCurrency(totalSellValue)} total
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-surface-1/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="size-4 text-brand" />
                <span className="text-xs font-medium text-muted-foreground">
                  Buy/Sell Ratio
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {buyToSellRatio.toFixed(1)}x
              </p>
              <p className={`text-xs font-medium mt-0.5 ${sentimentColor}`}>
                {sentiment} Signal
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-surface-1/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="size-4 text-brand" />
                <span className="text-xs font-medium text-muted-foreground">
                  Total Filings
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {insiderTrades.length}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Form 4 transactions
              </p>
            </div>
          </section>

          {/* Insider Trades Table */}
          <section className="mb-10">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">
              Recent Form 4 Filings
            </h2>
            {insiderTrades.length > 0 ? (
              <div className="rounded-2xl border border-border/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 bg-surface-1/60">
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                          Insider
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                          Title
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                          Type
                        </th>
                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground">
                          Shares
                        </th>
                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground">
                          Price
                        </th>
                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground">
                          Value
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {insiderTrades.map((trade, i) => (
                        <tr
                          key={i}
                          className="hover:bg-surface-1/40 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                            {trade.name}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                            {trade.title}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                trade.type === "Buy"
                                  ? "bg-success/10 text-success border border-success/20"
                                  : "bg-destructive/10 text-destructive border border-destructive/20"
                              }`}
                            >
                              {trade.type === "Buy" ? (
                                <ArrowUpRight className="size-3" />
                              ) : (
                                <ArrowDownRight className="size-3" />
                              )}
                              {trade.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-foreground font-mono text-xs whitespace-nowrap">
                            {formatNumber(trade.shares)}
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground font-mono text-xs whitespace-nowrap">
                            ${trade.pricePerShare.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right text-foreground font-semibold font-mono text-xs whitespace-nowrap">
                            {formatCurrency(trade.totalValue)}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                            {trade.date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border/50 bg-surface-1/30 p-12 text-center">
                <Shield className="size-10 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  No Recent Insider Transactions
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  No Form 4 filings were found for {stock.name} (
                  {stock.ticker}) in the recent period. This is normal for
                  companies where insiders are not actively trading.
                </p>
              </div>
            )}
          </section>

          {/* SEO Content: Understanding Insider Trading */}
          <section className="mb-10">
            <div className="rounded-2xl border border-border/50 bg-surface-1/30 p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                Understanding {stock.ticker} Insider Trading Activity
              </h2>
              <div className="space-y-4 text-[15px] text-muted-foreground leading-relaxed">
                <p>
                  Insider trading data for {stock.name} ({stock.ticker}) is
                  sourced directly from SEC Form 4 filings on the EDGAR
                  database. Corporate insiders — including directors, officers,
                  and shareholders owning more than 10% of the company — are
                  legally required to report their transactions within two
                  business days.
                </p>
                <p>
                  Insider purchases are often considered a bullish signal because
                  executives are using their own money to buy shares, suggesting
                  they believe the stock is undervalued. Insider sales, on the
                  other hand, are more nuanced — they can reflect routine
                  diversification plans (known as 10b5-1 plans), tax
                  obligations, or genuine concerns about the company&apos;s
                  outlook.
                </p>
                <p>
                  StoxPulse&apos;s AI system analyzes each {stock.ticker}{" "}
                  insider transaction to determine whether it appears routine or
                  notable. We track the buy/sell ratio, total transaction values,
                  and patterns over time to provide a clear picture of insider
                  sentiment for {stock.name}.
                </p>
              </div>
            </div>
          </section>

          {/* Internal Links: Back to stock + related stocks + tools */}
          <section className="mb-10 grid gap-3 sm:grid-cols-2">
            <Link
              href={`/stocks/${tickerToSlug(stock.ticker)}`}
              className="group flex items-center gap-4 rounded-xl border border-border/50 bg-surface-1/40 px-5 py-4 hover:border-brand/30 transition-all"
            >
              <DollarSign className="size-5 text-brand" />
              <div className="flex-1">
                <span className="font-semibold text-foreground group-hover:text-brand transition-colors">
                  {stock.ticker} Full Analysis
                </span>
                <p className="text-xs text-muted-foreground">
                  AI earnings, financials, news &amp; more
                </p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-brand transition-all" />
            </Link>
            <Link
              href="/tools/sec-filing-translator"
              className="group flex items-center gap-4 rounded-xl border border-border/50 bg-surface-1/40 px-5 py-4 hover:border-brand/30 transition-all"
            >
              <FileText className="size-5 text-brand" />
              <div className="flex-1">
                <span className="font-semibold text-foreground group-hover:text-brand transition-colors">
                  SEC Form 4 Decoder
                </span>
                <p className="text-xs text-muted-foreground">
                  Translate any filing into plain English
                </p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-brand transition-all" />
            </Link>
          </section>

          {/* Related Stocks */}
          {relatedStocks.length > 0 && (
            <section className="mb-10">
              <h2 className="font-display text-lg font-bold text-foreground mb-4">
                Insider Trading for Related{" "}
                <span className="text-brand/80">{stock.sector}</span> Stocks
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {relatedStocks.map((related) => (
                  <Link
                    key={related.ticker}
                    href={`/stocks/${tickerToSlug(related.ticker)}/insider-trading`}
                    className="group flex items-center gap-4 rounded-xl border border-border/50 bg-surface-1/40 px-5 py-4 transition-all hover:border-brand/30 hover:-translate-y-0.5"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-display text-base font-bold text-foreground group-hover:text-brand transition-colors">
                        {related.ticker}
                      </span>
                      <p className="text-[13px] text-muted-foreground truncate">
                        {related.name} Insider Trading
                      </p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground/30 group-hover:text-brand transition-all group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="font-display text-xl font-bold text-foreground mb-6">
              {stock.ticker} Insider Trading FAQ
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
                <strong className="text-muted-foreground">
                  Disclaimer:
                </strong>{" "}
                Insider trading data for {stock.name} ({stock.ticker}) is
                sourced from SEC Form 4 filings and is provided for
                informational purposes only. Insider transactions should not be
                the sole basis for investment decisions. Always consult a
                qualified financial advisor.
              </p>
            </div>
          </div>

          {/* CTA */}
          <section className="relative overflow-hidden text-center rounded-3xl border border-brand/20 bg-brand/5 p-8 sm:p-12 shadow-[0_0_40px_rgba(var(--brand-rgb),0.05)]">
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-brand/10 rounded-full blur-[80px]" />
            <div className="relative z-10">
              <h2 className="font-display text-2xl font-bold tracking-tight mb-3">
                Get <span className="text-brand">{stock.ticker}</span> Insider
                Alerts
              </h2>
              <p className="text-base text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
                Join the waitlist to receive instant AI notifications when{" "}
                {stock.name} insiders buy or sell shares.
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
