// Dashboard-specific data fetching
// Fetches market indices, watchlist quotes, earnings calendar, and news in parallel

import { getQuote, getNews, getEarningsCalendar, getFilings, getInsiderTrades, getProfile, getFinancials } from "./index";
import type { StockQuote, SECFiling, InsiderTransaction } from "@/lib/types/stock";
import type { NewsItem, EarningsCalendarEntry } from "./types";
import { generateAISignals, isAIEnabled } from "@/lib/ai/gemini";
import type { AIStockAnalysis } from "@/lib/ai/types";

// Default watchlist for demo — will be user-configurable later
export const DEFAULT_WATCHLIST = [
  "AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "JPM",
];

// Market index ETFs + commodities (we use ETFs since FMP supports them)
const MARKET_INDICES = [
  { symbol: "SPY", name: "S&P 500" },
  { symbol: "QQQ", name: "NASDAQ 100" },
  { symbol: "DIA", name: "Dow Jones" },
  { symbol: "TLT", name: "20Y Treasury" },
  { symbol: "GLD", name: "Gold" },
  { symbol: "SLV", name: "Silver" },
];

export interface MarketIndexData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sparkData: number[];
}

export interface WatchlistData {
  ticker: string;
  name: string;
  quote: StockQuote | null;
  sparkData: number[];
}

export interface DashboardData {
  indices: MarketIndexData[];
  watchlist: WatchlistData[];
  news: NewsItem[];
  earningsCalendar: EarningsCalendarEntry[];
  recentFilings: { ticker: string; filings: SECFiling[] }[];
  recentInsiderTrades: { ticker: string; trades: InsiderTransaction[] }[];
  aiAnalyses: AIStockAnalysis[];
}

// Generate fake sparkline data from a price (deterministic from ticker hash)
function generateSparkData(price: number, changePercent: number): number[] {
  const points = 20;
  const data: number[] = [];
  const startPrice = price / (1 + changePercent / 100);
  const step = (price - startPrice) / points;
  let current = startPrice;

  // Simple seed from price for deterministic randomness
  let seed = Math.round(price * 100);
  const random = () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed / 2147483647) - 0.5;
  };

  for (let i = 0; i < points; i++) {
    current += step + random() * (price * 0.005);
    data.push(current);
  }
  data.push(price); // End at current price
  return data;
}

export async function getDashboardData(
  watchlistTickers: string[] = DEFAULT_WATCHLIST
): Promise<DashboardData> {
  // Compute date range for earnings calendar (next 7 days)
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const fromDate = today.toISOString().split("T")[0];
  const toDate = nextWeek.toISOString().split("T")[0];

  // Fetch everything in parallel
  const [indexQuotes, watchlistQuotes, news, earningsCalendar, filingsData, insiderData] =
    await Promise.all([
      // Market indices
      Promise.all(
        MARKET_INDICES.map(async (idx) => {
          const quote = await getQuote(idx.symbol).catch(() => null);
          return { ...idx, quote };
        })
      ),
      // Watchlist quotes
      Promise.all(
        watchlistTickers.map(async (ticker) => {
          const quote = await getQuote(ticker).catch(() => null);
          return { ticker, quote };
        })
      ),
      // Aggregate news (pick a few tickers for variety)
      fetchAggregateNews(watchlistTickers.slice(0, 4)),
      // Earnings calendar
      getEarningsCalendar(fromDate, toDate).catch(() => []),
      // Recent filings (top 4 tickers only to limit API calls)
      Promise.all(
        watchlistTickers.slice(0, 4).map(async (ticker) => ({
          ticker,
          filings: await getFilings(ticker, 3).catch(() => []),
        }))
      ),
      // Insider trades (top 4 tickers)
      Promise.all(
        watchlistTickers.slice(0, 4).map(async (ticker) => ({
          ticker,
          trades: await getInsiderTrades(ticker, 3).catch(() => []),
        }))
      ),
    ]);

  // Map index data
  const indices: MarketIndexData[] = indexQuotes.map((idx) => ({
    symbol: idx.symbol,
    name: idx.name,
    price: idx.quote?.price ?? 0,
    change: idx.quote?.change ?? 0,
    changePercent: idx.quote?.changePercent ?? 0,
    sparkData: idx.quote
      ? generateSparkData(idx.quote.price, idx.quote.changePercent)
      : [0, 0],
  }));

  // Map watchlist data with stock names from SP500 data
  const { getStockByTicker } = await import("@/data/stocks/sp500");
  const watchlist: WatchlistData[] = watchlistQuotes.map((wq) => {
    const stockMeta = getStockByTicker(wq.ticker);
    return {
      ticker: wq.ticker,
      name: stockMeta?.name ?? wq.ticker,
      quote: wq.quote,
      sparkData: wq.quote
        ? generateSparkData(wq.quote.price, wq.quote.changePercent)
        : [0, 0],
    };
  });

  // Generate AI signals for top watchlist stocks (parallel, with graceful fallback)
  let aiAnalyses: AIStockAnalysis[] = [];
  if (isAIEnabled()) {
    const aiTickers = watchlistTickers.slice(0, 4); // Limit to 4 to control cost/latency
    const aiResults = await Promise.all(
      aiTickers.map(async (ticker) => {
        const wq = watchlistQuotes.find((w) => w.ticker === ticker);
        const filing = filingsData.find((f) => f.ticker === ticker);
        const insider = insiderData.find((t) => t.ticker === ticker);
        // Fetch profile + financials for AI context (parallel)
        const [profile, financials] = await Promise.all([
          getProfile(ticker).catch(() => null),
          getFinancials(ticker).catch(() => null),
        ]);
        return generateAISignals({
          ticker,
          quote: wq?.quote ?? null,
          profile,
          financials,
          balanceSheet: null,
          cashFlow: null,
          ratios: null,
          filings: filing?.filings ?? [],
          insiderTrades: insider?.trades ?? [],
          news: news.filter((n) => n.relatedTickers.includes(ticker)),
          earningsCalendar,
          historicalPrices: [],
          recommendations: [],
          analystEstimates: [],
        });
      })
    );
    aiAnalyses = aiResults.filter((r): r is AIStockAnalysis => r !== null);
  }

  return {
    indices,
    watchlist,
    news,
    earningsCalendar: earningsCalendar.slice(0, 20),
    recentFilings: filingsData,
    recentInsiderTrades: insiderData,
    aiAnalyses,
  };
}

async function fetchAggregateNews(tickers: string[]): Promise<NewsItem[]> {
  const allNews: NewsItem[] = [];
  const results = await Promise.all(
    tickers.map((ticker) => getNews(ticker, 3).catch(() => []))
  );
  for (const items of results) {
    allNews.push(...items);
  }

  // Deduplicate and sort by date
  const seen = new Set<string>();
  return allNews
    .filter((item) => {
      const key = item.headline.toLowerCase().slice(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
    .slice(0, 12);
}
