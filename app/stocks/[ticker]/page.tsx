import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import { StockHeader } from "@/components/stocks/stock-header";
import { StockTabs } from "@/components/stocks/stock-tabs";
import { AIInsightCard } from "@/components/stocks/ai-insight-card";
import { CommodityLivePrice } from "@/components/stocks/commodity-live-price";
import {
  sp500Stocks,
  getStockByTicker,
  getRelatedStocks,
  tickerToSlug,
  slugToTicker,
} from "@/data/stocks/sp500";
import { commodities, getCommodityBySlug, type CommodityInfo } from "@/data/commodities";
import { getStockPageData, getQuote, getProfile } from "@/lib/data";

export function generateStaticParams() {
  const stockParams = sp500Stocks.map((stock) => ({
    ticker: tickerToSlug(stock.ticker),
  }));
  const commodityParams = commodities.map((c) => ({
    ticker: c.slug,
  }));
  return [...stockParams, ...commodityParams];
}

type Props = {
  params: Promise<{ ticker: string }>;
};

// Build stock info either from SP500 data or from live API
async function resolveStock(slug: string) {
  const ticker = slugToTicker(slug);
  const sp500 = getStockByTicker(ticker);

  if (sp500) {
    return { ticker: sp500.ticker, name: sp500.name, sector: sp500.sector, description: sp500.description, website: sp500.website, isSP500: true };
  }

  // For non-SP500 tickers (ETFs, etc.), try fetching a quote to verify it exists
  const upperTicker = ticker.toUpperCase();
  const [quote, profile] = await Promise.all([
    getQuote(upperTicker).catch(() => null),
    getProfile(upperTicker).catch(() => null),
  ]);

  if (!quote && !profile) return null;

  return {
    ticker: upperTicker,
    name: profile?.name ?? upperTicker,
    sector: profile?.sector ?? "N/A",
    description: profile?.description ?? null,
    website: profile?.website ?? null,
    isSP500: false,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker: slug } = await params;

  // Check commodity first
  const commodity = getCommodityBySlug(slug);
  if (commodity) {
    const title = `${commodity.name} Live Price & Chart | StoxPulse`;
    const description = `Real-time ${commodity.shortName} spot price (${commodity.symbol}), historical charts, 52-week range, moving averages, and market analysis. Track ${commodity.shortName} prices ${commodity.unit} with StoxPulse.`;
    return {
      title,
      description,
      keywords: [
        `${commodity.shortName.toLowerCase()} price`,
        `${commodity.shortName.toLowerCase()} price today`,
        `${commodity.symbol} live price`,
        `${commodity.shortName.toLowerCase()} spot price`,
        `${commodity.shortName.toLowerCase()} chart`,
        `${commodity.shortName.toLowerCase()} 52 week high low`,
        `${commodity.shortName.toLowerCase()} price per ounce`,
      ],
      alternates: { canonical: `https://stoxpulse.com/stocks/${commodity.slug}` },
      openGraph: {
        title: `${commodity.name} — Live Price | StoxPulse`,
        description,
        type: "article",
        url: `https://stoxpulse.com/stocks/${commodity.slug}`,
        siteName: "StoxPulse",
      },
      twitter: {
        card: "summary_large_image",
        title: `${commodity.name} Live Price | StoxPulse`,
        description: `Real-time ${commodity.shortName} spot price, charts & analysis`,
      },
    };
  }

  const stock = await resolveStock(slug);

  if (!stock) {
    return { title: "Stock Not Found" };
  }

  const title = `${stock.name} (${stock.ticker}) AI Stock Analysis | StoxPulse`;
  const description = `AI-powered analysis for ${stock.name} (${stock.ticker}). Read AI-generated earnings call summaries, SEC filing analysis, news sentiment tracking, and insider transaction alerts for ${stock.ticker}. Updated daily.`;

  return {
    title,
    description,
    keywords: [
      `${stock.ticker} stock analysis`,
      `${stock.ticker} earnings analysis`,
      `${stock.ticker} SEC filings`,
      `${stock.name} AI analysis`,
      `${stock.ticker} sentiment`,
      `${stock.ticker} insider trading`,
      `${stock.sector} stocks`,
    ],
    alternates: {
      canonical: `https://stoxpulse.com/stocks/${tickerToSlug(stock.ticker)}`,
    },
    openGraph: {
      title: `${stock.ticker} AI Analysis — ${stock.name} | StoxPulse`,
      description,
      type: "article",
      url: `https://stoxpulse.com/stocks/${tickerToSlug(stock.ticker)}`,
      siteName: "StoxPulse",
    },
    twitter: {
      card: "summary_large_image",
      title: `${stock.ticker} AI Analysis | StoxPulse`,
      description: `AI earnings, filings & sentiment for ${stock.name} (${stock.ticker})`,
    },
  };
}

export default async function StockPage({ params }: Props) {
  const { ticker: slug } = await params;

  // Handle commodity pages
  const commodity = getCommodityBySlug(slug);
  if (commodity) {
    return <CommodityPage commodity={commodity} />;
  }

  const stock = await resolveStock(slug);

  if (!stock) {
    notFound();
  }

  // Fetch live data from all providers
  const data = await getStockPageData(stock.ticker);

  const relatedStocks = stock.isSP500 ? getRelatedStocks(stock.ticker, 6) : [];

  const faqItems = [
    {
      question: `What does StoxPulse's AI analysis cover for ${stock.ticker}?`,
      answer: `StoxPulse provides AI-powered analysis of ${stock.name}'s quarterly earnings calls, SEC filings (10-K, 10-Q, 8-K), financial news sentiment, and insider transactions. Our AI reads and summarizes these documents so you can get actionable insights in minutes instead of hours.`,
    },
    {
      question: `How often is the ${stock.ticker} analysis updated?`,
      answer: `${stock.name}'s analysis is updated in near real-time. Earnings call summaries are available within hours of the call. SEC filings are processed as they are filed. News sentiment is monitored continuously throughout trading hours.`,
    },
    {
      question: `Is ${stock.ticker} a good stock to buy?`,
      answer: `StoxPulse does not provide investment recommendations. Our AI analysis helps you understand ${stock.name}'s earnings performance, management sentiment, regulatory filings, and news flow — but all investment decisions should be made with the guidance of a qualified financial advisor.`,
    },
    {
      question: `What SEC filings does StoxPulse track for ${stock.ticker}?`,
      answer: `StoxPulse monitors all major SEC filings for ${stock.name} including annual reports (10-K), quarterly reports (10-Q), current reports (8-K), proxy statements (DEF 14A), and insider trading forms (Form 4). Each filing is summarized by AI with key takeaways highlighted.`,
    },
    {
      question: `How does AI sentiment analysis work for ${stock.ticker}?`,
      answer: `StoxPulse's AI analyzes earnings call transcripts, press releases, and financial news about ${stock.name} to determine overall sentiment (bullish, neutral, or bearish). It examines management tone, keyword frequency, guidance changes, and analyst reactions to provide a comprehensive sentiment score.`,
    },
  ];

  // Structured Data
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://stoxpulse.com" },
      { "@type": "ListItem", position: 2, name: "Stocks", item: "https://stoxpulse.com/stocks" },
      { "@type": "ListItem", position: 3, name: stock.ticker, item: `https://stoxpulse.com/stocks/${tickerToSlug(stock.ticker)}` },
    ],
  };

  const corporationSchema = {
    "@context": "https://schema.org",
    "@type": "Corporation",
    name: stock.name,
    tickerSymbol: stock.ticker,
    url: stock.website ?? undefined,
    description: stock.description,
  };

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${stock.name} (${stock.ticker}) AI Stock Analysis`,
    description: `AI-generated analysis of ${stock.name}'s earnings calls, SEC filings, news sentiment, and insider transactions. Updated daily.`,
    url: `https://stoxpulse.com/stocks/${tickerToSlug(stock.ticker)}`,
    creator: { "@type": "Organization", name: "StoxPulse", url: "https://stoxpulse.com" },
    keywords: [`${stock.ticker} earnings`, `${stock.ticker} SEC filings`, `${stock.ticker} sentiment`, `${stock.name} analysis`],
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(corporationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Navbar />
      <main className="min-h-screen bg-background pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
            <ol className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              </li>
              <li><ChevronRight className="size-3.5" /></li>
              <li>
                <Link href="/stocks" className="hover:text-foreground transition-colors">Stocks</Link>
              </li>
              <li><ChevronRight className="size-3.5" /></li>
              <li className="text-foreground font-medium">{stock.ticker}</li>
            </ol>
          </nav>

          {/* Stock Header — Price, Change, 52w Range */}
          <header className="mb-6 sm:mb-8">
            <StockHeader
              ticker={stock.ticker}
              quote={data.quote}
              profile={data.profile}
            />
          </header>

          {/* AI Insights Card */}
          <section className="mb-8">
            <AIInsightCard ticker={stock.ticker} />
          </section>

          {/* Tabbed Content — Overview, Financials, News, Ownership */}
          <section className="mb-8 sm:mb-12">
            <StockTabs
              ticker={stock.ticker}
              quote={data.quote}
              profile={data.profile}
              financials={data.financials}
              balanceSheet={data.balanceSheet}
              cashFlow={data.cashFlow}
              ratios={data.ratios}
              filings={data.filings}
              insiderTrades={data.insiderTrades}
              news={data.news}
              historicalPrices={data.historicalPrices}
              recommendations={data.recommendations}
              analystEstimates={data.analystEstimates}
            />
          </section>

          {/* Related Stocks */}
          {relatedStocks.length > 0 && (
            <section className="mb-12">
              <h2 className="font-display text-xl font-bold text-foreground mb-6">
                Related <span className="text-brand/80">{stock.sector}</span> Stocks
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {relatedStocks.map((related) => (
                  <Link
                    key={related.ticker}
                    href={`/stocks/${tickerToSlug(related.ticker)}`}
                    className="group flex items-center gap-4 rounded-xl border border-border/50 bg-surface-1/40 backdrop-blur-md px-5 py-4 transition-all duration-300 hover:border-brand/30 hover:bg-surface-1/60 hover:-translate-y-0.5 hover:shadow-md hover:shadow-brand/5"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-display text-base font-bold text-foreground group-hover:text-brand transition-colors">{related.ticker}</span>
                      <p className="text-[13px] font-medium text-muted-foreground truncate leading-relaxed group-hover:text-foreground/80 transition-colors">{related.name}</p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground/30 group-hover:text-brand transition-all duration-300 group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="font-display text-xl font-bold text-foreground mb-6">
              Frequently Asked Questions
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
                The information on this page about {stock.name} ({stock.ticker}) is provided for
                educational and informational purposes only and does not constitute investment advice.
                AI-generated analysis may contain errors. Always consult a qualified financial advisor
                before making investment decisions.
              </p>
            </div>
          </div>

          {/* CTA */}
          <section className="relative overflow-hidden text-center rounded-3xl border border-brand/20 bg-brand/5 p-8 sm:p-12 shadow-[0_0_40px_rgba(var(--brand-rgb),0.05)]">
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-brand/10 rounded-full blur-[80px]" />
            <div className="relative z-10">
              <h2 className="font-display text-2xl font-bold tracking-tight mb-3">
                Get AI Analysis for <span className="text-brand">{stock.ticker}</span>
              </h2>
              <p className="text-base text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
                Join the waitlist to receive AI-powered earnings summaries, filing alerts, and
                sentiment tracking for {stock.name}.
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

// ── Commodity Detail Page ────────────────────────────────────────

function CommodityPage({ commodity }: { commodity: CommodityInfo }) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://stoxpulse.com" },
      { "@type": "ListItem", position: 2, name: "Stocks", item: "https://stoxpulse.com/stocks" },
      { "@type": "ListItem", position: 3, name: commodity.shortName, item: `https://stoxpulse.com/stocks/${commodity.slug}` },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: commodity.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Navbar />
      <main className="min-h-screen bg-background pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
            <ol className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
              <li><ChevronRight className="size-3.5" /></li>
              <li><Link href="/stocks" className="hover:text-foreground transition-colors">Stocks</Link></li>
              <li><ChevronRight className="size-3.5" /></li>
              <li className="text-foreground font-medium">{commodity.shortName}</li>
            </ol>
          </nav>

          {/* Header */}
          <header className="mb-6 sm:mb-8">
            <div className="space-y-4">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-display tracking-tight">
                  {commodity.name}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs font-mono font-bold px-2.5 py-0.5">
                    {commodity.symbol}
                  </Badge>
                  <Badge variant="outline" className="text-xs px-2.5 py-0.5">Commodity</Badge>
                  <Badge variant="outline" className="text-xs px-2.5 py-0.5">{commodity.unit}</Badge>
                </div>
              </div>

            </div>
          </header>

          {/* Live Price + Chart + Stats + Related ETFs (client, polls every 30s) */}
          <section className="mb-8">
            <CommodityLivePrice
              symbol={commodity.symbol}
              unit={commodity.unit}
              relatedETFs={commodity.relatedETFs}
            />
          </section>

          {/* About */}
          <section className="mb-8">
            <div className="rounded-lg border border-border/50 bg-card p-6">
              <h2 className="font-display text-lg font-bold text-foreground mb-3">
                About {commodity.shortName}
              </h2>
              <p className="text-[15px] text-muted-foreground leading-relaxed">
                {commodity.description}
              </p>
            </div>
          </section>

          {/* Price Drivers */}
          <section className="mb-8">
            <div className="rounded-lg border border-border/50 bg-card p-6">
              <h2 className="font-display text-lg font-bold text-foreground mb-4">
                <TrendingUp className="inline size-5 mr-2 text-brand" />
                What Moves {commodity.shortName} Prices
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {commodity.factors.map((factor) => (
                  <div key={factor} className="flex items-start gap-2.5">
                    <div className="mt-1.5 size-1.5 rounded-full bg-brand shrink-0" />
                    <span className="text-sm text-muted-foreground">{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="font-display text-xl font-bold text-foreground mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {commodity.faq.map((item, i) => (
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
                {commodity.shortName} prices are provided for informational purposes only and do not constitute
                investment advice. Commodity prices can be highly volatile. Always consult a qualified
                financial advisor before making investment decisions.
              </p>
            </div>
          </div>

          {/* CTA */}
          <section className="relative overflow-hidden text-center rounded-3xl border border-brand/20 bg-brand/5 p-8 sm:p-12 shadow-[0_0_40px_rgba(var(--brand-rgb),0.05)]">
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-brand/10 rounded-full blur-[80px]" />
            <div className="relative z-10">
              <h2 className="font-display text-2xl font-bold tracking-tight mb-3">
                Track <span className="text-brand">{commodity.shortName}</span> with AI
              </h2>
              <p className="text-base text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
                Join the waitlist to receive AI-powered market analysis, price alerts, and
                economic indicator tracking for {commodity.shortName} and your entire watchlist.
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
