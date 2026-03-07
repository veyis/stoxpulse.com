import type { StockQuote } from "@/lib/types/stock";
import type {
  DataProvider,
  CompanyProfile,
  FinancialStatements,
  FinancialPeriod,
  FinancialRatios,
  NewsItem,
  EarningsCalendarEntry,
  EarningsTranscript,
  HistoricalPrice,
  AnalystEstimate,
  InsiderTrade,
  PriceTarget,
  UpgradeDowngrade,
  EarningsSurprise,
  StockPeer,
  DCFValuation,
} from "../types";
import { dataConfig, isProviderEnabled } from "../config";
import { getCached, setCache } from "../cache";

const { baseUrl, apiKey } = dataConfig.fmp;

const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

async function fmpFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> {
  if (isBuildPhase) return null;
  // Read API key at call time, not module load time (important for serverless)
  const runtimeKey = process.env.FMP_API_KEY ?? "";
  if (!runtimeKey) return null;

  const url = new URL(`${baseUrl}${endpoint}`);
  url.searchParams.set("apikey", runtimeKey);
  for (const [k, val] of Object.entries(params)) {
    url.searchParams.set(k, val);
  }

  try {
    const res = await fetch(url.toString(), {
      cache: "no-store",
    });
    if (!res.ok) {
      if (res.status !== 400 && res.status !== 402 && res.status !== 404) console.error(`FMP ${endpoint}: ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.error(`FMP fetch error for ${endpoint}:`, error);
    return null;
  }
}

// ── FMP Response types ─────────────────────────────────────────────

interface FMPQuote {
  symbol: string;
  name: string;
  price: number;
  changePercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  exchange: string;
  volume: number;
  avgVolume: number;
  open: number;
  previousClose: number;
  eps: number;
  pe: number;
  timestamp: number;
}

interface FMPProfile {
  symbol: string;
  companyName: string;
  currency: string;
  cik: string;
  isin: string;
  cusip: string;
  exchange: string;
  exchangeFullName: string;
  industry: string;
  website: string;
  description: string;
  ceo: string;
  sector: string;
  country: string;
  fullTimeEmployees: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  ipoDate: string;
  marketCap: number;
  image: string;
  beta: number;
  lastDividend: number;
  isEtf: boolean;
  isActivelyTrading: boolean;
}

interface FMPIncomeStatement {
  date: string;
  symbol: string;
  period: string;
  fiscalYear: string;
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  operatingIncome: number;
  netIncome: number;
  eps: number;
  epsDiluted: number;
  filingDate: string;
}

interface FMPBalanceSheet {
  date: string;
  symbol: string;
  period: string;
  fiscalYear: string;
  filingDate: string;
  totalAssets: number;
  totalCurrentAssets: number;
  cashAndCashEquivalents: number;
  shortTermInvestments: number;
  netReceivables: number;
  inventory: number;
  totalNonCurrentAssets: number;
  propertyPlantEquipmentNet: number;
  goodwill: number;
  longTermInvestments: number;
  totalLiabilities: number;
  totalCurrentLiabilities: number;
  shortTermDebt: number;
  accountPayables: number;
  totalNonCurrentLiabilities: number;
  longTermDebt: number;
  totalStockholdersEquity: number;
  retainedEarnings: number;
  commonStock: number;
  totalDebt: number;
  netDebt: number;
}

interface FMPCashFlow {
  date: string;
  symbol: string;
  period: string;
  fiscalYear: string;
  filingDate: string;
  netIncome: number;
  depreciationAndAmortization: number;
  stockBasedCompensation: number;
  netCashProvidedByOperatingActivities: number;
  investmentsInPropertyPlantAndEquipment: number;
  netCashProvidedByInvestingActivities: number;
  commonStockRepurchased: number;
  commonDividendsPaid: number;
  netCashProvidedByFinancingActivities: number;
  freeCashFlow: number;
}

interface FMPRatios {
  symbol: string;
  date: string;
  fiscalYear: string;
  period: string;
  grossProfitMargin: number;
  operatingProfitMargin: number;
  netProfitMargin: number;
  returnOnAssets: number;
  returnOnEquity: number;
  returnOnInvestedCapital: number;
  priceToEarningsRatio: number;
  priceToBookRatio: number;
  priceToSalesRatio: number;
  priceToFreeCashFlowRatio: number;
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;
  debtToEquityRatio: number;
  debtToAssetsRatio: number;
  interestCoverageRatio: number;
  dividendYield: number;
  dividendPayoutRatio: number;
  revenuePerShare: number;
  netIncomePerShare: number;
  bookValuePerShare: number;
  freeCashFlowPerShare: number;
  earningsYield: number;
  freeCashFlowYield: number;
}

interface FMPKeyMetrics {
  symbol: string;
  date: string;
  fiscalYear: string;
  period: string;
  marketCap: number;
  enterpriseValue: number;
  evToSales: number;
  evToOperatingCashFlow: number;
  evToFreeCashFlow: number;
  evToEBITDA: number;
}

// ── Provider Implementation ────────────────────────────────────────

export const fmpProvider: DataProvider = {
  name: "fmp",

  async getQuote(ticker: string): Promise<StockQuote | null> {
    const cacheKey = `fmp_quote_${ticker}`;
    const cached = await getCached<StockQuote>(cacheKey);
    if (cached) return cached;

    const data = await fmpFetch<FMPQuote[]>("/quote", { symbol: ticker });
    if (!data?.[0]) return null;

    const q = data[0];
    const quote: StockQuote = {
      ticker: q.symbol,
      price: q.price,
      change: q.change,
      changePercent: q.changePercentage,
      volume: q.volume,
      marketCap: q.marketCap,
      pe: q.pe || undefined,
      eps: q.eps || undefined,
      high52w: q.yearHigh || undefined,
      low52w: q.yearLow || undefined,
      avgVolume: q.avgVolume || undefined,
      open: q.open || undefined,
      previousClose: q.previousClose || undefined,
      dayHigh: q.dayHigh || undefined,
      dayLow: q.dayLow || undefined,
      priceAvg50: q.priceAvg50 || undefined,
      priceAvg200: q.priceAvg200 || undefined,
      lastUpdated: new Date(q.timestamp * 1000).toISOString(),
    };

    await setCache(cacheKey, quote, dataConfig.cache.ttl.quote);
    return quote;
  },

  async getProfile(ticker: string): Promise<CompanyProfile | null> {
    const cacheKey = `fmp_profile_${ticker}`;
    const cached = await getCached<CompanyProfile>(cacheKey);
    if (cached) return cached;

    const data = await fmpFetch<FMPProfile[]>("/profile", { symbol: ticker });
    if (!data?.[0]) return null;

    const p = data[0];
    const profile: CompanyProfile = {
      ticker: p.symbol,
      name: p.companyName,
      cik: p.cik,
      isin: p.isin,
      cusip: p.cusip,
      sector: p.sector,
      industry: p.industry,
      exchange: p.exchange,
      exchangeFullName: p.exchangeFullName,
      description: p.description,
      website: p.website,
      ceo: p.ceo,
      employees: p.fullTimeEmployees ? parseInt(p.fullTimeEmployees) : null,
      country: p.country,
      state: p.state,
      city: p.city,
      address: p.address,
      zip: p.zip,
      phone: p.phone,
      ipoDate: p.ipoDate || null,
      marketCap: p.marketCap || null,
      beta: p.beta || undefined,
      lastDividend: p.lastDividend || undefined,
      image: p.image || undefined,
      isEtf: p.isEtf,
      isActivelyTrading: p.isActivelyTrading,
    };

    await setCache(cacheKey, profile, dataConfig.cache.ttl.profile);
    return profile;
  },

  async getFinancials(ticker: string): Promise<FinancialStatements | null> {
    const cacheKey = `fmp_financials_${ticker}`;
    const cached = await getCached<FinancialStatements>(cacheKey);
    if (cached) return cached;

    const [annual, quarterly] = await Promise.all([
      fmpFetch<FMPIncomeStatement[]>("/income-statement", { symbol: ticker, period: "annual", limit: "10" }),
      fmpFetch<FMPIncomeStatement[]>("/income-statement", { symbol: ticker, period: "quarter", limit: "20" }),
    ]);

    const mapPeriod = (stmt: FMPIncomeStatement): FinancialPeriod => ({
      period: stmt.period === "FY" ? "FY" : stmt.period,
      year: parseInt(stmt.fiscalYear),
      endDate: stmt.date,
      filedDate: stmt.filingDate || stmt.date,
      revenue: stmt.revenue,
      costOfRevenue: stmt.costOfRevenue,
      grossProfit: stmt.grossProfit,
      operatingIncome: stmt.operatingIncome,
      netIncome: stmt.netIncome,
      eps: stmt.eps,
      epsDiluted: stmt.epsDiluted,
      totalAssets: null,
      totalLiabilities: null,
      stockholdersEquity: null,
      cash: null,
      longTermDebt: null,
      sharesOutstanding: null,
      operatingCashFlow: null,
      capitalExpenditures: null,
      freeCashFlow: null,
      dividendsPaid: null,
      source: "fmp",
    });

    const result: FinancialStatements = {
      ticker,
      annual: annual?.map(mapPeriod) ?? [],
      quarterly: quarterly?.map(mapPeriod) ?? [],
    };

    await setCache(cacheKey, result, dataConfig.cache.ttl.financials);
    return result;
  },

  async getRatios(ticker: string): Promise<FinancialRatios | null> {
    const cacheKey = `fmp_ratios_${ticker}`;
    const cached = await getCached<FinancialRatios>(cacheKey);
    if (cached) return cached;

    const [ratios, metrics] = await Promise.all([
      fmpFetch<FMPRatios[]>("/ratios", { symbol: ticker, period: "annual", limit: "1" }),
      fmpFetch<FMPKeyMetrics[]>("/key-metrics", { symbol: ticker, period: "annual", limit: "1" }),
    ]);

    if (!ratios?.[0]) return null;

    const r = ratios[0];
    const m = metrics?.[0];

    const result: FinancialRatios = {
      ticker,
      date: r.date,
      period: r.period,
      grossProfitMargin: r.grossProfitMargin ?? null,
      operatingProfitMargin: r.operatingProfitMargin ?? null,
      netProfitMargin: r.netProfitMargin ?? null,
      returnOnAssets: r.returnOnAssets ?? null,
      returnOnEquity: r.returnOnEquity ?? null,
      returnOnInvestedCapital: r.returnOnInvestedCapital ?? null,
      priceToEarningsRatio: r.priceToEarningsRatio ?? null,
      priceToBookRatio: r.priceToBookRatio ?? null,
      priceToSalesRatio: r.priceToSalesRatio ?? null,
      priceToFreeCashFlowRatio: r.priceToFreeCashFlowRatio ?? null,
      evToEBITDA: m?.evToEBITDA ?? null,
      evToSales: m?.evToSales ?? null,
      enterpriseValue: m?.enterpriseValue ?? null,
      earningsYield: r.earningsYield ?? null,
      freeCashFlowYield: r.freeCashFlowYield ?? null,
      currentRatio: r.currentRatio ?? null,
      quickRatio: r.quickRatio ?? null,
      cashRatio: r.cashRatio ?? null,
      debtToEquityRatio: r.debtToEquityRatio ?? null,
      debtToAssetsRatio: r.debtToAssetsRatio ?? null,
      interestCoverageRatio: r.interestCoverageRatio ?? null,
      revenuePerShare: r.revenuePerShare ?? null,
      netIncomePerShare: r.netIncomePerShare ?? null,
      bookValuePerShare: r.bookValuePerShare ?? null,
      freeCashFlowPerShare: r.freeCashFlowPerShare ?? null,
      dividendYield: r.dividendYield ?? null,
      dividendPayoutRatio: r.dividendPayoutRatio ?? null,
    };

    await setCache(cacheKey, result, dataConfig.cache.ttl.financials);
    return result;
  },

  async getBalanceSheet(ticker: string): Promise<FinancialStatements | null> {
    const cacheKey = `fmp_balance_${ticker}`;
    const cached = await getCached<FinancialStatements>(cacheKey);
    if (cached) return cached;

    const [annual, quarterly] = await Promise.all([
      fmpFetch<FMPBalanceSheet[]>("/balance-sheet-statement", { symbol: ticker, period: "annual", limit: "10" }),
      fmpFetch<FMPBalanceSheet[]>("/balance-sheet-statement", { symbol: ticker, period: "quarter", limit: "20" }),
    ]);

    const mapBs = (bs: FMPBalanceSheet): FinancialPeriod => ({
      period: bs.period === "FY" ? "FY" : bs.period,
      year: parseInt(bs.fiscalYear),
      endDate: bs.date,
      filedDate: bs.filingDate || bs.date,
      revenue: null,
      costOfRevenue: null,
      grossProfit: null,
      operatingIncome: null,
      netIncome: null,
      eps: null,
      epsDiluted: null,
      totalAssets: bs.totalAssets,
      totalLiabilities: bs.totalLiabilities,
      stockholdersEquity: bs.totalStockholdersEquity,
      cash: bs.cashAndCashEquivalents,
      longTermDebt: bs.longTermDebt,
      sharesOutstanding: null,
      operatingCashFlow: null,
      capitalExpenditures: null,
      freeCashFlow: null,
      dividendsPaid: null,
      source: "fmp",
    });

    const result: FinancialStatements = {
      ticker,
      annual: annual?.map(mapBs) ?? [],
      quarterly: quarterly?.map(mapBs) ?? [],
    };

    await setCache(cacheKey, result, dataConfig.cache.ttl.financials);
    return result;
  },

  async getCashFlow(ticker: string): Promise<FinancialStatements | null> {
    const cacheKey = `fmp_cashflow_${ticker}`;
    const cached = await getCached<FinancialStatements>(cacheKey);
    if (cached) return cached;

    const [annual, quarterly] = await Promise.all([
      fmpFetch<FMPCashFlow[]>("/cash-flow-statement", { symbol: ticker, period: "annual", limit: "10" }),
      fmpFetch<FMPCashFlow[]>("/cash-flow-statement", { symbol: ticker, period: "quarter", limit: "20" }),
    ]);

    const mapCf = (cf: FMPCashFlow): FinancialPeriod => ({
      period: cf.period === "FY" ? "FY" : cf.period,
      year: parseInt(cf.fiscalYear),
      endDate: cf.date,
      filedDate: cf.filingDate || cf.date,
      revenue: null,
      costOfRevenue: null,
      grossProfit: null,
      operatingIncome: null,
      netIncome: cf.netIncome,
      eps: null,
      epsDiluted: null,
      totalAssets: null,
      totalLiabilities: null,
      stockholdersEquity: null,
      cash: null,
      longTermDebt: null,
      sharesOutstanding: null,
      operatingCashFlow: cf.netCashProvidedByOperatingActivities,
      capitalExpenditures: cf.investmentsInPropertyPlantAndEquipment ? Math.abs(cf.investmentsInPropertyPlantAndEquipment) : null,
      freeCashFlow: cf.freeCashFlow,
      dividendsPaid: cf.commonDividendsPaid ? Math.abs(cf.commonDividendsPaid) : null,
      source: "fmp",
    });

    const result: FinancialStatements = {
      ticker,
      annual: annual?.map(mapCf) ?? [],
      quarterly: quarterly?.map(mapCf) ?? [],
    };

    await setCache(cacheKey, result, dataConfig.cache.ttl.financials);
    return result;
  },

  async getNews(ticker: string, limit = 10): Promise<NewsItem[]> {
    const cacheKey = `fmp_news_${ticker}_${limit}`;
    const cached = await getCached<NewsItem[]>(cacheKey);
    if (cached) return cached;

    const data = await fmpFetch<Array<{
      symbol: string;
      publishedDate: string;
      title: string;
      text: string;
      site: string;
      url: string;
      image: string;
    }>>("/stock-news", { symbol: ticker, limit: String(limit) });

    if (!data) return [];

    const news: NewsItem[] = data.map((item, i) => ({
      id: `fmp_${ticker}_${i}`,
      headline: item.title,
      summary: item.text?.slice(0, 300) ?? "",
      source: item.site,
      url: item.url,
      image: item.image,
      datetime: item.publishedDate,
      relatedTickers: [item.symbol],
    }));

    await setCache(cacheKey, news, dataConfig.cache.ttl.news);
    return news;
  },

  async getHistoricalPrices(ticker: string): Promise<HistoricalPrice[]> {
    const cacheKey = `fmp_historical_${ticker}`;
    const cached = await getCached<HistoricalPrice[]>(cacheKey);
    if (cached) return cached;

    const data = await fmpFetch<Array<{
      symbol: string;
      date: string;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }>>("/historical-price-eod/full", { symbol: ticker });

    if (!data) return [];

    // Return last 365 days, most recent first
    const prices: HistoricalPrice[] = data.slice(0, 365).map((d) => ({
      date: d.date,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: d.volume,
    }));

    await setCache(cacheKey, prices, dataConfig.cache.ttl.financials);
    return prices;
  },

  async getAnalystEstimates(ticker: string): Promise<AnalystEstimate[]> {
    const cacheKey = `fmp_estimates_${ticker}`;
    const cached = await getCached<AnalystEstimate[]>(cacheKey);
    if (cached) return cached;

    const data = await fmpFetch<Array<{
      date: string;
      estimatedEpsAvg: number | null;
      estimatedEpsHigh: number | null;
      estimatedEpsLow: number | null;
      estimatedRevenueAvg: number | null;
      estimatedRevenueHigh: number | null;
      estimatedRevenueLow: number | null;
      numberAnalystEstimatedEps: number;
    }>>("/analyst-estimates", { symbol: ticker, limit: "10" });

    if (!data) return [];

    const estimates: AnalystEstimate[] = data.map((d) => ({
      date: d.date,
      epsAvg: d.estimatedEpsAvg,
      epsHigh: d.estimatedEpsHigh,
      epsLow: d.estimatedEpsLow,
      revenueAvg: d.estimatedRevenueAvg,
      revenueHigh: d.estimatedRevenueHigh,
      revenueLow: d.estimatedRevenueLow,
      numAnalysts: d.numberAnalystEstimatedEps ?? 0,
    }));

    await setCache(cacheKey, estimates, dataConfig.cache.ttl.financials);
    return estimates;
  },

  async getEarningsCalendar(from?: string, to?: string): Promise<EarningsCalendarEntry[]> {
    const cacheKey = `fmp_calendar_${from}_${to}`;
    const cached = await getCached<EarningsCalendarEntry[]>(cacheKey);
    if (cached) return cached;

    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;

    const data = await fmpFetch<Array<{
      date: string;
      symbol: string;
      eps: number | null;
      epsEstimated: number | null;
      revenue: number | null;
      revenueEstimated: number | null;
      fiscalDateEnding: string;
    }>>("/earnings-calendar", params);

    if (!data) return [];

    const calendar: EarningsCalendarEntry[] = data.map((entry) => ({
      ticker: entry.symbol,
      date: entry.date,
      quarter: 0, // FMP doesn't return quarter directly
      year: parseInt(entry.fiscalDateEnding?.split("-")[0] ?? "0"),
      epsEstimate: entry.epsEstimated,
      revenueEstimate: entry.revenueEstimated,
      hour: null,
    }));

    await setCache(cacheKey, calendar, dataConfig.cache.ttl.calendar);
    return calendar;
  },

  async getTranscript(ticker: string, quarter: number, year: number): Promise<EarningsTranscript | null> {
    const cacheKey = `fmp_transcript_${ticker}_${quarter}_${year}`;
    const cached = await getCached<EarningsTranscript>(cacheKey);
    if (cached) return cached;

    const data = await fmpFetch<Array<{
      symbol: string;
      quarter: number;
      year: number;
      date: string;
      content: string;
    }>>("/earning-call-transcript", { symbol: ticker, quarter: String(quarter), year: String(year) });

    if (!data?.[0]) return null;

    const t = data[0];
    const transcript: EarningsTranscript = {
      ticker: t.symbol,
      quarter: t.quarter,
      year: t.year,
      date: t.date,
      content: t.content,
    };

    await setCache(cacheKey, transcript, dataConfig.cache.ttl.financials);
    return transcript;
  },

  async getInsiderTrading(ticker: string, limit = 20): Promise<InsiderTrade[]> {
    const cacheKey = `fmp_insider_${ticker}_${limit}`;
    const cached = await getCached<InsiderTrade[]>(cacheKey);
    if (cached) return cached;

    const data = await fmpFetch<Array<{
      symbol: string;
      reportingName: string;
      typeOfOwner: string;
      acquistionOrDisposition: string;
      securitiesTransacted: number;
      price: number;
      transactionDate: string;
      filingDate: string;
    }>>("/insider-trading", { symbol: ticker, limit: String(limit) });

    if (!data) return [];

    const trades: InsiderTrade[] = data.map((t) => ({
      ticker: t.symbol,
      name: t.reportingName,
      title: t.typeOfOwner,
      type: (t.acquistionOrDisposition === "A" ? "Buy" : "Sale") as "Buy" | "Sale",
      transactionType: (t.acquistionOrDisposition === "A" ? "Buy" : "Sell") as InsiderTrade["transactionType"],
      shares: Math.abs(t.securitiesTransacted),
      pricePerShare: t.price || 0,
      totalValue: Math.abs(t.securitiesTransacted * (t.price || 0)),
      date: t.transactionDate,
      filingDate: t.filingDate,
      isRoutine: false, // FMP doesn't indicate 10b5-1 plans
    }));

    await setCache(cacheKey, trades, dataConfig.cache.ttl.insiderTrades);
    return trades;
  },

  async getPriceTargets(ticker: string): Promise<PriceTarget[]> {
    const cacheKey = `fmp_pt_${ticker}`;
    const cached = await getCached<PriceTarget[]>(cacheKey);
    if (cached) return cached;

    const data = await fmpFetch<Array<{
      symbol: string;
      analystName: string;
      analystCompany: string;
      adjPriceTarget: number;
      priceWhenPosted: number;
      newsTitle: string;
      publishedDate: string;
    }>>("/price-target", { symbol: ticker });

    if (!data) return [];

    const targets: PriceTarget[] = data.slice(0, 20).map((t) => ({
      ticker: t.symbol,
      analystName: t.analystName,
      analystCompany: t.analystCompany,
      targetPrice: t.adjPriceTarget,
      priceWhenPosted: t.priceWhenPosted,
      action: t.newsTitle,
      ratingCurrent: "",
      date: t.publishedDate,
    }));

    await setCache(cacheKey, targets, dataConfig.cache.ttl.financials);
    return targets;
  },

  async getUpgradesDowngrades(ticker: string): Promise<UpgradeDowngrade[]> {
    const cacheKey = `fmp_upgrades_${ticker}`;
    const cached = await getCached<UpgradeDowngrade[]>(cacheKey);
    if (cached) return cached;

    const data = await fmpFetch<Array<{
      symbol: string;
      gradingCompany: string;
      action: string;
      previousGrade: string;
      newGrade: string;
      priceTargetPrevious: number | null;
      priceTargetCurrent: number | null;
      publishedDate: string;
    }>>("/upgrades-downgrades", { symbol: ticker });

    if (!data) return [];

    const grades: UpgradeDowngrade[] = data.slice(0, 20).map((g) => ({
      ticker: g.symbol,
      analystCompany: g.gradingCompany,
      action: g.action?.toLowerCase() ?? "",
      ratingFrom: g.previousGrade ?? "",
      ratingTo: g.newGrade ?? "",
      priceTargetFrom: g.priceTargetPrevious,
      priceTargetTo: g.priceTargetCurrent,
      date: g.publishedDate,
    }));

    await setCache(cacheKey, grades, dataConfig.cache.ttl.financials);
    return grades;
  },

  async getEarningsSurprises(ticker: string): Promise<EarningsSurprise[]> {
    const cacheKey = `fmp_surprises_${ticker}`;
    const cached = await getCached<EarningsSurprise[]>(cacheKey);
    if (cached) return cached;

    const data = await fmpFetch<Array<{
      symbol: string;
      date: string;
      estimatedEarning: number | null;
      actualEarningResult: number | null;
      estimatedRevenue: number | null;
      actualRevenue: number | null;
    }>>("/earnings-surprises", { symbol: ticker });

    if (!data) return [];

    const surprises: EarningsSurprise[] = data.slice(0, 16).map((s) => ({
      ticker: s.symbol,
      date: s.date,
      epsEstimate: s.estimatedEarning,
      epsActual: s.actualEarningResult,
      epsSurprise: s.estimatedEarning != null && s.actualEarningResult != null
        ? s.actualEarningResult - s.estimatedEarning
        : null,
      epsSurprisePercent: s.estimatedEarning != null && s.actualEarningResult != null && s.estimatedEarning !== 0
        ? ((s.actualEarningResult - s.estimatedEarning) / Math.abs(s.estimatedEarning)) * 100
        : null,
      revenueEstimate: s.estimatedRevenue,
      revenueActual: s.actualRevenue,
      revenueSurprise: s.estimatedRevenue != null && s.actualRevenue != null
        ? s.actualRevenue - s.estimatedRevenue
        : null,
    }));

    await setCache(cacheKey, surprises, dataConfig.cache.ttl.financials);
    return surprises;
  },

  async getPeers(ticker: string): Promise<StockPeer[]> {
    const cacheKey = `fmp_peers_${ticker}`;
    const cached = await getCached<StockPeer[]>(cacheKey);
    if (cached) return cached;

    const data = await fmpFetch<string[]>("/stock-peers", { symbol: ticker });

    if (!data || !Array.isArray(data)) return [];

    // FMP returns array of ticker strings
    const peers: StockPeer[] = (Array.isArray(data[0]) ? data[0] : data)
      .filter((t: string) => t !== ticker)
      .slice(0, 10)
      .map((t: string) => ({ ticker: t }));

    await setCache(cacheKey, peers, dataConfig.cache.ttl.profile);
    return peers;
  },

  async getDCF(ticker: string): Promise<DCFValuation | null> {
    const cacheKey = `fmp_dcf_${ticker}`;
    const cached = await getCached<DCFValuation>(cacheKey);
    if (cached) return cached;

    const data = await fmpFetch<Array<{
      symbol: string;
      dcf: number;
      "Stock Price": number;
      date: string;
    }>>("/discounted-cash-flow", { symbol: ticker });

    if (!data?.[0]) return null;

    const d = data[0];
    const dcf: DCFValuation = {
      ticker: d.symbol,
      dcf: d.dcf,
      price: d["Stock Price"],
      date: d.date,
    };

    await setCache(cacheKey, dcf, dataConfig.cache.ttl.financials);
    return dcf;
  },
};
