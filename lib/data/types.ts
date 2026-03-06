// Provider-agnostic data types for the unified data service
// These extend/complement the types in lib/types/stock.ts

export interface FinancialStatements {
  ticker: string;
  annual: FinancialPeriod[];
  quarterly: FinancialPeriod[];
}

export interface FinancialPeriod {
  period: string; // "FY" | "Q1" | "Q2" | "Q3" | "Q4"
  year: number;
  endDate: string;
  filedDate: string;
  revenue: number | null;
  costOfRevenue: number | null;
  grossProfit: number | null;
  operatingIncome: number | null;
  netIncome: number | null;
  eps: number | null;
  epsDiluted: number | null;
  totalAssets: number | null;
  totalLiabilities: number | null;
  stockholdersEquity: number | null;
  cash: number | null;
  longTermDebt: number | null;
  sharesOutstanding: number | null;
  operatingCashFlow: number | null;
  capitalExpenditures: number | null;
  freeCashFlow: number | null;
  dividendsPaid: number | null;
  source: "edgar" | "fmp";
}

export interface EarningsCalendarEntry {
  ticker: string;
  date: string;
  quarter: number;
  year: number;
  epsEstimate: number | null;
  revenueEstimate: number | null;
  hour: "bmo" | "amc" | "dmh" | null; // before market open, after market close, during market hours
}

export interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image?: string;
  datetime: string;
  relatedTickers: string[];
  sentiment?: "positive" | "negative" | "neutral";
  importanceScore?: number; // 1-10
}

export interface EarningsTranscript {
  ticker: string;
  quarter: number;
  year: number;
  date: string;
  content: string;
  speakers?: TranscriptSpeaker[];
  aiSummary?: string;
  sentiment?: string;
  riskFactors?: string[];
}

export interface TranscriptSpeaker {
  name: string;
  role: string; // "CEO", "CFO", "Analyst", "Operator"
  text: string;
}

export interface CompanyProfile {
  ticker: string;
  name: string;
  cik?: string;
  isin?: string;
  cusip?: string;
  sector: string;
  industry: string;
  exchange: string;
  exchangeFullName?: string;
  description: string;
  website: string;
  ceo: string;
  employees: number | null;
  country: string;
  state?: string;
  city?: string;
  address?: string;
  zip?: string;
  phone?: string;
  ipoDate: string | null;
  marketCap: number | null;
  beta?: number;
  lastDividend?: number;
  image?: string;
  isEtf?: boolean;
  isActivelyTrading?: boolean;
}

export interface FinancialRatios {
  ticker: string;
  date: string;
  period: string;
  // Profitability
  grossProfitMargin: number | null;
  operatingProfitMargin: number | null;
  netProfitMargin: number | null;
  returnOnAssets: number | null;
  returnOnEquity: number | null;
  returnOnInvestedCapital: number | null;
  // Valuation
  priceToEarningsRatio: number | null;
  priceToBookRatio: number | null;
  priceToSalesRatio: number | null;
  priceToFreeCashFlowRatio: number | null;
  evToEBITDA: number | null;
  evToSales: number | null;
  enterpriseValue: number | null;
  earningsYield: number | null;
  freeCashFlowYield: number | null;
  // Liquidity
  currentRatio: number | null;
  quickRatio: number | null;
  cashRatio: number | null;
  // Leverage
  debtToEquityRatio: number | null;
  debtToAssetsRatio: number | null;
  interestCoverageRatio: number | null;
  // Per-share
  revenuePerShare: number | null;
  netIncomePerShare: number | null;
  bookValuePerShare: number | null;
  freeCashFlowPerShare: number | null;
  // Dividends
  dividendYield: number | null;
  dividendPayoutRatio: number | null;
}

export interface HistoricalPrice {
  date: string;
  open?: number;
  high?: number;
  low?: number;
  close: number;
  volume: number;
}

export interface AnalystRecommendation {
  period: string;
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
}

export interface AnalystEstimate {
  date: string;
  epsAvg: number | null;
  epsHigh: number | null;
  epsLow: number | null;
  revenueAvg: number | null;
  revenueHigh: number | null;
  revenueLow: number | null;
  numAnalysts: number;
}

export interface CIKMapping {
  [ticker: string]: {
    cik: string;
    name: string;
  };
}

// What each provider must implement (partial — not all providers have all data)
export interface DataProvider {
  name: string;
  getQuote?(ticker: string): Promise<import("@/lib/types/stock").StockQuote | null>;
  getProfile?(ticker: string): Promise<CompanyProfile | null>;
  getFinancials?(ticker: string): Promise<FinancialStatements | null>;
  getRatios?(ticker: string): Promise<FinancialRatios | null>;
  getBalanceSheet?(ticker: string): Promise<FinancialStatements | null>;
  getCashFlow?(ticker: string): Promise<FinancialStatements | null>;
  getFilings?(ticker: string, limit?: number): Promise<import("@/lib/types/stock").SECFiling[]>;
  getInsiderTrades?(ticker: string, limit?: number): Promise<import("@/lib/types/stock").InsiderTransaction[]>;
  getNews?(ticker: string, limit?: number): Promise<NewsItem[]>;
  getEarningsCalendar?(from?: string, to?: string): Promise<EarningsCalendarEntry[]>;
  getTranscript?(ticker: string, quarter: number, year: number): Promise<EarningsTranscript | null>;
  getHistoricalPrices?(ticker: string): Promise<HistoricalPrice[]>;
  getRecommendations?(ticker: string): Promise<AnalystRecommendation[]>;
  getAnalystEstimates?(ticker: string): Promise<AnalystEstimate[]>;
}
