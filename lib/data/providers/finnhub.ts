import type { StockQuote } from "@/lib/types/stock";
import type {
  DataProvider,
  CompanyProfile,
  NewsItem,
  EarningsCalendarEntry,
  AnalystRecommendation,
} from "../types";
import { dataConfig, isProviderEnabled } from "../config";
import { getCached, setCache } from "../cache";

const { baseUrl, apiKey } = dataConfig.finnhub;

async function finnhubFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> {
  if (!isProviderEnabled("finnhub")) return null;

  const url = new URL(`${baseUrl}${endpoint}`);
  url.searchParams.set("token", apiKey);
  for (const [key, val] of Object.entries(params)) {
    url.searchParams.set(key, val);
  }

  try {
    const res = await fetch(url.toString(), {
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`Finnhub ${endpoint}: ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.error(`Finnhub fetch error for ${endpoint}:`, error);
    return null;
  }
}

// ── Response types ─────────────────────────────────────────────────

interface FinnhubQuote {
  c: number; // current price
  d: number; // change
  dp: number; // percent change
  h: number; // high of day
  l: number; // low of day
  o: number; // open
  pc: number; // previous close
  t: number; // timestamp
}

interface FinnhubProfile {
  country: string;
  currency: string;
  exchange: string;
  finnhubIndustry: string;
  ipo: string;
  logo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
}

interface FinnhubNews {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

interface FinnhubEarningsCalendar {
  earningsCalendar: Array<{
    date: string;
    epsActual: number | null;
    epsEstimate: number | null;
    hour: string;
    quarter: number;
    revenueActual: number | null;
    revenueEstimate: number | null;
    symbol: string;
    year: number;
  }>;
}

// ── Provider Implementation ────────────────────────────────────────

export const finnhubProvider: DataProvider = {
  name: "finnhub",

  async getQuote(ticker: string): Promise<StockQuote | null> {
    const cacheKey = `finnhub_quote_${ticker}`;
    const cached = await getCached<StockQuote>(cacheKey);
    if (cached) return cached;

    const data = await finnhubFetch<FinnhubQuote>("/quote", { symbol: ticker });
    if (!data || data.c === 0) return null;

    const profile = await this.getProfile?.(ticker);

    const quote: StockQuote = {
      ticker,
      price: data.c,
      change: data.d,
      changePercent: data.dp,
      volume: 0, // Not in quote endpoint — need separate call
      marketCap: profile?.marketCap ?? 0,
      lastUpdated: new Date(data.t * 1000).toISOString(),
    };

    await setCache(cacheKey, quote, dataConfig.cache.ttl.quote);
    return quote;
  },

  async getProfile(ticker: string): Promise<CompanyProfile | null> {
    const cacheKey = `finnhub_profile_${ticker}`;
    const cached = await getCached<CompanyProfile>(cacheKey);
    if (cached) return cached;

    const data = await finnhubFetch<FinnhubProfile>("/stock/profile2", { symbol: ticker });
    if (!data || !data.name) return null;

    const profile: CompanyProfile = {
      ticker: data.ticker,
      name: data.name,
      sector: data.finnhubIndustry,
      industry: data.finnhubIndustry,
      exchange: data.exchange,
      description: "",
      website: data.weburl,
      ceo: "",
      employees: null,
      country: data.country,
      ipoDate: data.ipo || null,
      marketCap: data.marketCapitalization ? data.marketCapitalization * 1_000_000 : null, // Finnhub returns in millions
    };

    await setCache(cacheKey, profile, dataConfig.cache.ttl.profile);
    return profile;
  },

  async getNews(ticker: string, limit = 10): Promise<NewsItem[]> {
    const cacheKey = `finnhub_news_${ticker}_${limit}`;
    const cached = await getCached<NewsItem[]>(cacheKey);
    if (cached) return cached;

    // Finnhub company news requires date range
    const to = new Date().toISOString().split("T")[0];
    const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const data = await finnhubFetch<FinnhubNews[]>("/company-news", {
      symbol: ticker,
      from,
      to,
    });
    if (!data) return [];

    const news: NewsItem[] = data.slice(0, limit).map((item) => ({
      id: String(item.id),
      headline: item.headline,
      summary: item.summary,
      source: item.source,
      url: item.url,
      datetime: new Date(item.datetime * 1000).toISOString(),
      relatedTickers: item.related ? item.related.split(",").map((t) => t.trim()) : [ticker],
    }));

    await setCache(cacheKey, news, dataConfig.cache.ttl.news);
    return news;
  },

  async getRecommendations(ticker: string): Promise<AnalystRecommendation[]> {
    const cacheKey = `finnhub_recommendations_${ticker}`;
    const cached = await getCached<AnalystRecommendation[]>(cacheKey);
    if (cached) return cached;

    const data = await finnhubFetch<Array<{
      period: string;
      strongBuy: number;
      buy: number;
      hold: number;
      sell: number;
      strongSell: number;
      symbol: string;
    }>>("/stock/recommendation", { symbol: ticker });

    if (!data || data.length === 0) return [];

    const recs: AnalystRecommendation[] = data.slice(0, 12).map((d) => ({
      period: d.period,
      strongBuy: d.strongBuy,
      buy: d.buy,
      hold: d.hold,
      sell: d.sell,
      strongSell: d.strongSell,
    }));

    await setCache(cacheKey, recs, dataConfig.cache.ttl.financials);
    return recs;
  },

  async getEarningsCalendar(from?: string, to?: string): Promise<EarningsCalendarEntry[]> {
    const cacheKey = `finnhub_calendar_${from}_${to}`;
    const cached = await getCached<EarningsCalendarEntry[]>(cacheKey);
    if (cached) return cached;

    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;

    const data = await finnhubFetch<FinnhubEarningsCalendar>("/calendar/earnings", params);
    if (!data?.earningsCalendar) return [];

    const calendar: EarningsCalendarEntry[] = data.earningsCalendar.map((entry) => ({
      ticker: entry.symbol,
      date: entry.date,
      quarter: entry.quarter,
      year: entry.year,
      epsEstimate: entry.epsEstimate,
      revenueEstimate: entry.revenueEstimate,
      hour: entry.hour === "bmo" ? "bmo" : entry.hour === "amc" ? "amc" : null,
    }));

    await setCache(cacheKey, calendar, dataConfig.cache.ttl.calendar);
    return calendar;
  },
};
