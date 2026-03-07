"use client";

import Link from "next/link";
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import {
  ChevronRight,
  BarChart3,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Newspaper,
  MessageSquare,
  Users,
  ArrowRight,
} from "lucide-react";

const POPULAR_TICKERS = [
  { ticker: "AAPL", name: "Apple" },
  { ticker: "NVDA", name: "NVIDIA" },
  { ticker: "TSLA", name: "Tesla" },
  { ticker: "MSFT", name: "Microsoft" },
  { ticker: "META", name: "Meta" },
  { ticker: "GOOGL", name: "Alphabet" },
  { ticker: "AMZN", name: "Amazon" },
  { ticker: "JPM", name: "JPMorgan" },
];

// Simulated sentiment data for the demo
function generateSentiment(ticker: string) {
  // Use ticker characters to create a deterministic but varied seed
  const seed = ticker.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const newsScore = 40 + (seed % 50); // 40-89
  const socialScore = 30 + ((seed * 7) % 60); // 30-89
  const analystScore = 50 + ((seed * 3) % 40); // 50-89
  const overall = Math.round((newsScore + socialScore + analystScore) / 3);

  return {
    ticker: ticker.toUpperCase(),
    overall,
    news: newsScore,
    social: socialScore,
    analyst: analystScore,
    label:
      overall >= 70 ? "Bullish" : overall >= 45 ? "Neutral" : "Bearish",
    color:
      overall >= 70
        ? "text-success"
        : overall >= 45
          ? "text-yellow-500"
          : "text-destructive",
    bgColor:
      overall >= 70
        ? "bg-success/10 border-success/20"
        : overall >= 45
          ? "bg-yellow-500/10 border-yellow-500/20"
          : "bg-destructive/10 border-destructive/20",
    icon:
      overall >= 70 ? TrendingUp : overall >= 45 ? Minus : TrendingDown,
  };
}

function SentimentBar({ label, score }: { label: string; score: number }) {
  const color =
    score >= 70
      ? "bg-success"
      : score >= 45
        ? "bg-yellow-500"
        : "bg-destructive";
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold text-foreground">{score}/100</span>
      </div>
      <div className="w-full h-2 rounded-full bg-surface-2 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function StockSentimentCheckerPage() {
  const [ticker, setTicker] = useState("");
  const [result, setResult] = useState<ReturnType<
    typeof generateSentiment
  > | null>(null);
  const [showGate, setShowGate] = useState(false);

  function handleCheck() {
    if (!ticker.trim()) return;
    const data = generateSentiment(ticker.trim());
    setResult(data);
    // Show the email gate after a short delay
    setTimeout(() => setShowGate(true), 2000);
  }

  function handlePopular(t: string) {
    setTicker(t);
    const data = generateSentiment(t);
    setResult(data);
    setTimeout(() => setShowGate(true), 2000);
  }

  const SentimentIcon = result?.icon ?? Minus;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-background flex flex-col items-center">
        {/* Breadcrumbs */}
        <div className="w-full max-w-4xl px-6 pt-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Link
              href="/"
              className="hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <Link
              href="/tools"
              className="hover:text-foreground transition-colors"
            >
              Tools
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">Stock Sentiment Checker</span>
          </nav>
        </div>

        {/* Hero */}
        <section className="w-full max-w-4xl px-6 pt-16 pb-12 text-center">
          <div className="mx-auto flex items-center justify-center size-16 rounded-2xl bg-brand/10 border border-brand/20 mb-6">
            <BarChart3 className="size-8 text-brand" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
            Free Stock <span className="text-brand">Sentiment Checker</span>
          </h1>
          <p className="-mt-4 mb-6 text-[11px] text-muted-foreground/60 uppercase tracking-wider font-medium">
            Powered by StoxPulse AI
          </p>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Enter any stock ticker to instantly see an AI-generated sentiment
            score based on recent news, social media, and analyst commentary.
          </p>
        </section>

        {/* Tool UI */}
        <section className="w-full max-w-3xl px-6 pb-12">
          <div className="bg-surface-1 border border-border rounded-2xl p-6 md:p-10 shadow-lg">
            {/* Input */}
            <div className="relative">
              <label htmlFor="ticker-input" className="sr-only">
                Stock Ticker
              </label>
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search className="size-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                id="ticker-input"
                value={ticker}
                onChange={(e) =>
                  setTicker(e.target.value.toUpperCase().slice(0, 5))
                }
                onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                className="block w-full rounded-xl border border-border bg-background p-4 pl-12 pr-40 text-foreground placeholder:text-muted-foreground focus:border-brand focus:ring-brand focus:outline-none transition-all sm:text-sm font-mono uppercase tracking-wider"
                placeholder="Enter ticker (e.g., AAPL)"
              />
              <button
                type="button"
                onClick={handleCheck}
                className="absolute right-2 top-2 bottom-2 inline-flex items-center justify-center rounded-lg bg-brand px-6 font-semibold text-brand-foreground hover:bg-brand/90 transition-colors"
              >
                Check Sentiment
              </button>
            </div>

            {/* Popular tickers */}
            {!result && (
              <div className="mt-8 text-center border-b border-border/50 pb-8">
                <p className="text-sm text-muted-foreground font-medium mb-4">
                  Or check a popular stock:
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {POPULAR_TICKERS.map((t) => (
                    <button
                      key={t.ticker}
                      onClick={() => handlePopular(t.ticker)}
                      className="text-xs bg-surface text-foreground border border-border rounded-full px-4 py-2 hover:border-brand/40 transition-colors"
                    >
                      {t.ticker} — {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
                <div className="bg-surface border border-border rounded-xl p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="bg-brand/20 p-2 rounded-full">
                        <Zap className="size-5 text-brand" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-foreground font-mono">
                          {result.ticker}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          AI Sentiment Analysis
                        </p>
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-2 rounded-full px-4 py-2 border ${result.bgColor}`}
                    >
                      <SentimentIcon className={`size-4 ${result.color}`} />
                      <span
                        className={`text-sm font-bold ${result.color}`}
                      >
                        {result.label}
                      </span>
                    </div>
                  </div>

                  {/* Overall Score */}
                  <div className="text-center mb-8">
                    <p className="text-sm text-muted-foreground mb-2">
                      Overall Sentiment Score
                    </p>
                    <p
                      className={`text-6xl font-bold font-display ${result.color}`}
                    >
                      {result.overall}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      out of 100
                    </p>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-5 relative">
                    <div className="flex items-center gap-2 mb-1">
                      <Newspaper className="size-4 text-brand" />
                      <span className="text-sm font-semibold text-foreground">
                        Sentiment Breakdown
                      </span>
                    </div>

                    <SentimentBar
                      label="📰 News Sentiment"
                      score={result.news}
                    />
                    <SentimentBar
                      label="💬 Social Media Buzz"
                      score={result.social}
                    />
                    <SentimentBar
                      label="📊 Analyst Consensus"
                      score={result.analyst}
                    />

                    {/* Gate overlay */}
                    {showGate && (
                      <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-b from-transparent via-surface/90 to-surface z-10 flex flex-col items-center justify-end pb-6 rounded-xl">
                        <div className="bg-background border border-border rounded-xl p-6 text-center shadow-2xl max-w-sm w-full mx-4 shadow-brand/10">
                          <h4 className="font-semibold text-foreground mb-2">
                            Unlock Full Sentiment Report
                          </h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Get detailed AI breakdowns including key news
                            drivers, social trending topics, and analyst
                            price targets.
                          </p>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              setShowGate(false);
                            }}
                          >
                            <input
                              required
                              type="email"
                              placeholder="Enter your best email"
                              className="w-full rounded-lg border border-border bg-surface p-3 text-sm mb-3 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                            />
                            <button
                              type="submit"
                              className="w-full bg-brand text-brand-foreground font-semibold py-3 rounded-lg text-sm hover:bg-brand/90 transition-colors shadow-lg shadow-brand/20"
                            >
                              Reveal Full Analysis
                            </button>
                          </form>
                          <p className="text-xs text-muted-foreground mt-3">
                            No spam. Unsubscribe anytime.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Internal links to related tools */}
        <section className="w-full max-w-3xl px-6 pb-12">
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/tools/sec-filing-translator"
              className="group flex items-center gap-4 rounded-xl border border-border/50 bg-surface-1/40 px-5 py-4 hover:border-brand/30 transition-all"
            >
              <MessageSquare className="size-5 text-brand" />
              <div className="flex-1">
                <span className="font-semibold text-foreground group-hover:text-brand transition-colors">
                  SEC Form 4 Decoder
                </span>
                <p className="text-xs text-muted-foreground">
                  Translate insider filings to plain English
                </p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-brand transition-all" />
            </Link>
            <Link
              href="/tools/earnings-call-summarizer"
              className="group flex items-center gap-4 rounded-xl border border-border/50 bg-surface-1/40 px-5 py-4 hover:border-brand/30 transition-all"
            >
              <Users className="size-5 text-brand" />
              <div className="flex-1">
                <span className="font-semibold text-foreground group-hover:text-brand transition-colors">
                  Earnings Call Summarizer
                </span>
                <p className="text-xs text-muted-foreground">
                  Get AI summaries of any earnings call
                </p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-brand transition-all" />
            </Link>
          </div>
        </section>

        {/* SEO Content */}
        <section className="w-full max-w-3xl px-6 pb-24">
          <div className="space-y-6">
            <h2 className="text-foreground text-2xl font-bold">
              How AI Stock Sentiment Analysis Works
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Stock sentiment analysis uses Natural Language Processing (NLP)
              and Large Language Models (LLMs) to analyze text data from
              multiple sources and determine whether the overall mood around a
              stock is bullish, neutral, or bearish. Our AI processes three
              primary data streams:
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border/50 bg-surface-1/30 p-5">
                <Newspaper className="size-6 text-brand mb-3" />
                <h3 className="font-semibold text-foreground mb-2">
                  News Sentiment
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our AI scans thousands of financial news articles from sources
                  like Reuters, Bloomberg, CNBC, and Yahoo Finance. It
                  identifies positive developments (earnings beats, upgrades)
                  vs. negative signals (lawsuits, downgrades).
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-surface-1/30 p-5">
                <MessageSquare className="size-6 text-brand mb-3" />
                <h3 className="font-semibold text-foreground mb-2">
                  Social Media Buzz
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We monitor Reddit (WallStreetBets, investing), X (Twitter),
                  and StockTwits for mention volume, sentiment polarity, and
                  trending discussion topics around each ticker.
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-surface-1/30 p-5">
                <Users className="size-6 text-brand mb-3" />
                <h3 className="font-semibold text-foreground mb-2">
                  Analyst Consensus
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We aggregate analyst ratings (Buy, Hold, Sell) and price
                  target changes from major Wall Street firms to provide a
                  professional consensus score alongside the crowd sentiment.
                </p>
              </div>
            </div>
            <h3 className="text-foreground text-xl font-semibold mt-8">
              Why Sentiment Matters for Investors
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              While sentiment alone should never drive investment decisions,
              it serves as a powerful confirming or contrarian indicator.
              Academic research shows that extreme sentiment readings (either
              euphoria or panic) often precede mean-reversion events in stock
              prices. By combining AI sentiment with fundamental analysis,
              investors gain a more complete picture of market dynamics.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
