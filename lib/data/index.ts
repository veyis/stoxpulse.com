// Unified Stock Data Service
//
// Orchestrates multiple data providers with fallback chains.
// Provider priority: paid APIs (better data) > free APIs > static data
//
// EDGAR: financials, filings, insider trades (FREE)
// Finnhub: quotes, news, calendar, profiles (FREE)
// FMP: quotes, financials, profiles, news, ratios, balance sheet, cash flow (PAID - $22/mo)
// API Ninjas: earnings transcripts (PAID - $39/mo)

import type { StockQuote, SECFiling, InsiderTransaction } from "@/lib/types/stock";
import type {
  FinancialStatements,
  FinancialRatios,
  CompanyProfile,
  NewsItem,
  EarningsCalendarEntry,
  EarningsTranscript,
  HistoricalPrice,
  AnalystRecommendation,
  AnalystEstimate,
} from "./types";
import { isProviderEnabled } from "./config";
import { edgarProvider } from "./providers/edgar";
import { finnhubProvider } from "./providers/finnhub";
import { fmpProvider } from "./providers/fmp";
import { apiNinjasProvider } from "./providers/api-ninjas";
import type { AIStockAnalysis } from "@/lib/ai/types";

// ── Quote (price data) ────────────────────────────────────────────
// Priority: FMP (more fields) > Finnhub (free real-time)

export async function getQuote(ticker: string): Promise<StockQuote | null> {
  if (isProviderEnabled("fmp")) {
    const quote = await fmpProvider.getQuote!(ticker);
    if (quote) return quote;
  }
  if (isProviderEnabled("finnhub")) {
    return finnhubProvider.getQuote!(ticker);
  }
  return null;
}

// ── Company Profile ───────────────────────────────────────────────
// Priority: FMP (more complete) > Finnhub (free)

export async function getProfile(ticker: string): Promise<CompanyProfile | null> {
  if (isProviderEnabled("fmp")) {
    const profile = await fmpProvider.getProfile!(ticker);
    if (profile) return profile;
  }
  if (isProviderEnabled("finnhub")) {
    return finnhubProvider.getProfile!(ticker);
  }
  return null;
}

// ── Financial Statements ──────────────────────────────────────────
// Priority: FMP (clean parsed) > EDGAR XBRL (free, needs tag mapping)

export async function getFinancials(ticker: string): Promise<FinancialStatements | null> {
  if (isProviderEnabled("fmp")) {
    const financials = await fmpProvider.getFinancials!(ticker);
    if (financials && financials.annual.length > 0) return financials;
  }
  // EDGAR is always available (no API key needed)
  return edgarProvider.getFinancials!(ticker);
}

// ── Financial Ratios ──────────────────────────────────────────────
// Source: FMP only (ratios endpoint)

export async function getRatios(ticker: string): Promise<FinancialRatios | null> {
  if (isProviderEnabled("fmp")) {
    return fmpProvider.getRatios!(ticker);
  }
  return null;
}

// ── Balance Sheet ─────────────────────────────────────────────────
// Source: FMP (clean parsed) > EDGAR (free)

export async function getBalanceSheet(ticker: string): Promise<FinancialStatements | null> {
  if (isProviderEnabled("fmp")) {
    const bs = await fmpProvider.getBalanceSheet!(ticker);
    if (bs && bs.annual.length > 0) return bs;
  }
  return null;
}

// ── Cash Flow Statement ───────────────────────────────────────────
// Source: FMP

export async function getCashFlow(ticker: string): Promise<FinancialStatements | null> {
  if (isProviderEnabled("fmp")) {
    const cf = await fmpProvider.getCashFlow!(ticker);
    if (cf && cf.annual.length > 0) return cf;
  }
  return null;
}

// ── SEC Filings ───────────────────────────────────────────────────
// Source: EDGAR (free, official source — always preferred)

export async function getFilings(ticker: string, limit = 20): Promise<SECFiling[]> {
  return edgarProvider.getFilings!(ticker, limit);
}

// ── Insider Transactions ──────────────────────────────────────────
// Source: EDGAR Form 4 (free)

export async function getInsiderTrades(ticker: string, limit = 20): Promise<InsiderTransaction[]> {
  return edgarProvider.getInsiderTrades!(ticker, limit);
}

// ── News ──────────────────────────────────────────────────────────
// Priority: FMP (more data) > Finnhub (free). Merge if both available.

export async function getNews(ticker: string, limit = 10): Promise<NewsItem[]> {
  const results: NewsItem[] = [];

  if (isProviderEnabled("fmp")) {
    const fmpNews = await fmpProvider.getNews!(ticker, limit);
    results.push(...fmpNews);
  }

  if (isProviderEnabled("finnhub") && results.length < limit) {
    const remaining = limit - results.length;
    const finnhubNews = await finnhubProvider.getNews!(ticker, remaining);
    results.push(...finnhubNews);
  }

  // Deduplicate by headline similarity
  const seen = new Set<string>();
  return results.filter((item) => {
    const key = item.headline.toLowerCase().slice(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── Earnings Calendar ─────────────────────────────────────────────
// Priority: FMP > Finnhub

export async function getEarningsCalendar(
  from?: string,
  to?: string
): Promise<EarningsCalendarEntry[]> {
  if (isProviderEnabled("fmp")) {
    const cal = await fmpProvider.getEarningsCalendar!(from, to);
    if (cal.length > 0) return cal;
  }
  if (isProviderEnabled("finnhub")) {
    return finnhubProvider.getEarningsCalendar!(from, to);
  }
  return [];
}

// ── Earnings Transcripts ──────────────────────────────────────────
// Source: API Ninjas (paid — the only provider for this in Path B)

export async function getTranscript(
  ticker: string,
  quarter: number,
  year: number
): Promise<EarningsTranscript | null> {
  if (isProviderEnabled("apiNinjas")) {
    return apiNinjasProvider.getTranscript!(ticker, quarter, year);
  }
  return null;
}

// ── Historical Prices ────────────────────────────────────────────
// Source: FMP (daily EOD prices)

export async function getHistoricalPrices(ticker: string): Promise<HistoricalPrice[]> {
  if (isProviderEnabled("fmp")) {
    return fmpProvider.getHistoricalPrices!(ticker);
  }
  return [];
}

// ── Analyst Recommendations ─────────────────────────────────────
// Source: Finnhub (buy/hold/sell consensus)

export async function getRecommendations(ticker: string): Promise<AnalystRecommendation[]> {
  if (isProviderEnabled("finnhub")) {
    return finnhubProvider.getRecommendations!(ticker);
  }
  return [];
}

// ── Analyst Estimates ───────────────────────────────────────────
// Source: FMP (forward EPS/revenue estimates)

export async function getAnalystEstimates(ticker: string): Promise<AnalystEstimate[]> {
  if (isProviderEnabled("fmp")) {
    return fmpProvider.getAnalystEstimates!(ticker);
  }
  return [];
}

// ── Aggregate: Full stock data for a page ─────────────────────────
// Used by /stocks/[ticker] ISR pages

export interface StockPageData {
  quote: StockQuote | null;
  profile: CompanyProfile | null;
  financials: FinancialStatements | null;
  balanceSheet: FinancialStatements | null;
  cashFlow: FinancialStatements | null;
  ratios: FinancialRatios | null;
  filings: SECFiling[];
  insiderTrades: InsiderTransaction[];
  news: NewsItem[];
  historicalPrices: HistoricalPrice[];
  recommendations: AnalystRecommendation[];
  analystEstimates: AnalystEstimate[];
  aiAnalysis: AIStockAnalysis | null;
}

export async function getStockPageData(ticker: string): Promise<StockPageData> {
  // Run all fetches in parallel for speed
  // Note: earnings calendar dates are computed in the API route, not here (avoids new Date() before data access in SSG)
  const [quote, profile, financials, balanceSheet, cashFlow, ratios, filings, insiderTrades, news, historicalPrices, recommendations, analystEstimates] = await Promise.all([
    getQuote(ticker).catch(() => null),
    getProfile(ticker).catch(() => null),
    getFinancials(ticker).catch(() => null),
    getBalanceSheet(ticker).catch(() => null),
    getCashFlow(ticker).catch(() => null),
    getRatios(ticker).catch(() => null),
    getFilings(ticker, 20).catch(() => []),
    getInsiderTrades(ticker, 15).catch(() => []),
    getNews(ticker, 15).catch(() => []),
    getHistoricalPrices(ticker).catch(() => []),
    getRecommendations(ticker).catch(() => []),
    getAnalystEstimates(ticker).catch(() => []),
  ]);

  // AI analysis is fetched client-side via /api/ai/signals to avoid blocking SSG/ISR
  return { quote, profile, financials, balanceSheet, cashFlow, ratios, filings, insiderTrades, news, historicalPrices, recommendations, analystEstimates, aiAnalysis: null };
}

// ── Health check: which providers are active ──────────────────────

export function getActiveProviders(): Record<string, boolean> {
  return {
    edgar: true, // always available
    finnhub: isProviderEnabled("finnhub"),
    fmp: isProviderEnabled("fmp"),
    apiNinjas: isProviderEnabled("apiNinjas"),
  };
}
