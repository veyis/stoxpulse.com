import type { SECFiling, InsiderTransaction } from "@/lib/types/stock";
import type {
  DataProvider,
  FinancialStatements,
  FinancialPeriod,
  CIKMapping,
} from "../types";
import { dataConfig } from "../config";
import { getCached, setCache } from "../cache";
import {
  XBRL_TAG_MAP,
  XBRL_UNITS,
  BALANCE_SHEET_METRICS,
  type FinancialMetric,
} from "../xbrl-tags";

const { baseUrl, userAgent } = dataConfig.edgar;
const HEADERS = {
  "User-Agent": userAgent,
  Accept: "application/json",
};

// ── Ticker ↔ CIK mapping ──────────────────────────────────────────

let tickerMapCache: CIKMapping | null = null;

async function getTickerMap(): Promise<CIKMapping> {
  if (tickerMapCache) return tickerMapCache;

  const cached = await getCached<CIKMapping>("edgar_ticker_map");
  if (cached) {
    tickerMapCache = cached;
    return cached;
  }

  const res = await fetch(dataConfig.edgar.tickerMapUrl, { headers: HEADERS });
  if (!res.ok) throw new Error(`Failed to fetch ticker map: ${res.status}`);

  const raw: Record<string, { cik_str: number; ticker: string; title: string }> =
    await res.json();

  const map: CIKMapping = {};
  for (const entry of Object.values(raw)) {
    map[entry.ticker.toUpperCase()] = {
      cik: String(entry.cik_str),
      name: entry.title,
    };
  }

  tickerMapCache = map;
  await setCache("edgar_ticker_map", map, dataConfig.cache.ttl.tickerMap);
  return map;
}

function padCIK(cik: string): string {
  return cik.padStart(10, "0");
}

async function tickerToCIK(ticker: string): Promise<string | null> {
  const map = await getTickerMap();
  const entry = map[ticker.toUpperCase()];
  return entry?.cik ?? null;
}

// ── EDGAR API fetch helper ─────────────────────────────────────────

async function edgarFetch<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: HEADERS,
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      if (res.status !== 404) {
        console.warn(`EDGAR ${url}: ${res.status} ${res.statusText}`);
      }
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.error(`EDGAR fetch error for ${url}:`, error);
    return null;
  }
}

// ── XBRL Financial Data ────────────────────────────────────────────

interface XBRLFact {
  end: string;
  val: number;
  accn: string;
  fy: number;
  fp: string; // "FY", "Q1", "Q2", "Q3", "Q4"
  form: string; // "10-K", "10-Q"
  filed: string;
  frame?: string; // Only canonical entries have this
}

interface CompanyFactsResponse {
  cik: number;
  entityName: string;
  facts: {
    "us-gaap"?: Record<
      string,
      {
        label: string;
        units: Record<string, XBRLFact[]>;
      }
    >;
    dei?: Record<
      string,
      {
        label: string;
        units: Record<string, XBRLFact[]>;
      }
    >;
  };
}

function extractMetric(
  facts: CompanyFactsResponse["facts"],
  metric: FinancialMetric
): XBRLFact[] {
  const tags = XBRL_TAG_MAP[metric];
  const unit = XBRL_UNITS[metric];
  const namespace = facts["us-gaap"];
  if (!namespace) return [];

  // Pick the tag with the most recent data, then by fact count as tiebreaker.
  // Companies switch tags across years (e.g. AAPL: "SalesRevenueNet" pre-2018,
  // "RevenueFromContractWithCustomerExcludingAssessedTax" post-2018).
  let bestFacts: XBRLFact[] = [];
  let bestMaxYear = 0;
  for (const tag of tags) {
    const concept = namespace[tag];
    if (!concept) continue;
    const unitData = concept.units[unit];
    if (!unitData || unitData.length === 0) continue;
    const maxYear = Math.max(...unitData.map((f) => f.fy));
    if (maxYear > bestMaxYear || (maxYear === bestMaxYear && unitData.length > bestFacts.length)) {
      bestFacts = unitData;
      bestMaxYear = maxYear;
    }
  }
  return bestFacts.length > 0 ? deduplicateFacts(bestFacts) : [];
}

function deduplicateFacts(facts: XBRLFact[]): XBRLFact[] {
  // Prefer entries with `frame` field — they are canonical
  const withFrame = facts.filter((f) => f.frame);
  if (withFrame.length > 0) return withFrame;

  // Fallback: deduplicate by end date + form type, keeping latest filing
  const seen = new Map<string, XBRLFact>();
  for (const fact of facts) {
    const key = `${fact.end}_${fact.fp}_${fact.fy}`;
    const existing = seen.get(key);
    if (!existing || fact.filed > existing.filed) {
      seen.set(key, fact);
    }
  }
  return Array.from(seen.values());
}

function factsToFinancialPeriods(
  allMetrics: Record<FinancialMetric, XBRLFact[]>,
  formType: "10-K" | "10-Q"
): FinancialPeriod[] {
  // Build a map of all unique periods
  const periodMap = new Map<string, FinancialPeriod>();

  for (const [metric, facts] of Object.entries(allMetrics) as [FinancialMetric, XBRLFact[]][]) {
    for (const fact of facts) {
      if (!fact.fp) continue; // skip facts with no period indicator
      if (formType === "10-K" && fact.fp !== "FY") continue;
      if (formType === "10-Q" && fact.fp === "FY") continue;
      // For balance sheet items in 10-Q, we still want them
      if (formType === "10-Q" && !fact.fp.startsWith("Q") && !BALANCE_SHEET_METRICS.includes(metric)) continue;

      const key = `${fact.fy}_${fact.fp}`;
      if (!periodMap.has(key)) {
        periodMap.set(key, {
          period: fact.fp,
          year: fact.fy,
          endDate: fact.end,
          filedDate: fact.filed,
          revenue: null,
          costOfRevenue: null,
          grossProfit: null,
          operatingIncome: null,
          netIncome: null,
          eps: null,
          epsDiluted: null,
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
          source: "edgar",
        });
      }
      const period = periodMap.get(key)!;
      period[metric] = fact.val;
      // Update end/filed dates if this fact is more recent
      if (fact.end > period.endDate) period.endDate = fact.end;
      if (fact.filed > period.filedDate) period.filedDate = fact.filed;
    }
  }

  // Calculate free cash flow where possible
  for (const period of periodMap.values()) {
    if (period.operatingCashFlow !== null && period.capitalExpenditures !== null && period.freeCashFlow === null) {
      period.freeCashFlow = period.operatingCashFlow - period.capitalExpenditures;
    }
  }

  return Array.from(periodMap.values()).sort(
    (a, b) => b.endDate.localeCompare(a.endDate) // newest first
  );
}

// ── Submissions (Filing History) ───────────────────────────────────

interface SubmissionsResponse {
  cik: string;
  entityType: string;
  sic: string;
  sicDescription: string;
  name: string;
  tickers: string[];
  exchanges: string[];
  filings: {
    recent: {
      accessionNumber: string[];
      filingDate: string[];
      reportDate: string[];
      form: string[];
      primaryDocument: string[];
      primaryDocDescription: string[];
    };
  };
}

// ── Provider Implementation ────────────────────────────────────────

export const edgarProvider: DataProvider = {
  name: "edgar",

  async getFinancials(ticker: string): Promise<FinancialStatements | null> {
    const cacheKey = `edgar_financials_${ticker}`;
    const cached = await getCached<FinancialStatements>(cacheKey);
    if (cached) return cached;

    const cik = await tickerToCIK(ticker);
    if (!cik) return null;

    const data = await edgarFetch<CompanyFactsResponse>(
      `${baseUrl}/api/xbrl/companyfacts/CIK${padCIK(cik)}.json`
    );
    if (!data?.facts) return null;

    // Extract all metrics
    const allMetrics: Record<FinancialMetric, XBRLFact[]> = {} as Record<FinancialMetric, XBRLFact[]>;
    for (const metric of Object.keys(XBRL_TAG_MAP) as FinancialMetric[]) {
      allMetrics[metric] = extractMetric(data.facts, metric);
    }

    const result: FinancialStatements = {
      ticker,
      annual: factsToFinancialPeriods(allMetrics, "10-K"),
      quarterly: factsToFinancialPeriods(allMetrics, "10-Q"),
    };

    await setCache(cacheKey, result, dataConfig.cache.ttl.financials);
    return result;
  },

  async getFilings(ticker: string, limit = 20): Promise<SECFiling[]> {
    const cacheKey = `edgar_filings_${ticker}_${limit}`;
    const cached = await getCached<SECFiling[]>(cacheKey);
    if (cached) return cached;

    const cik = await tickerToCIK(ticker);
    if (!cik) return [];

    const data = await edgarFetch<SubmissionsResponse>(
      `${baseUrl}/submissions/CIK${padCIK(cik)}.json`
    );
    if (!data?.filings?.recent) return [];

    const { recent } = data.filings;
    const relevantForms = new Set(["10-K", "10-Q", "8-K", "DEF 14A", "S-1", "4"]);

    const filings: SECFiling[] = [];
    const len = Math.min(recent.form.length, 100); // scan up to 100 entries

    for (let i = 0; i < len && filings.length < limit; i++) {
      const form = recent.form[i];
      if (!relevantForms.has(form)) continue;

      const accn = recent.accessionNumber[i].replace(/-/g, "");
      const accnDash = recent.accessionNumber[i];
      const primaryDoc = recent.primaryDocument[i];

      filings.push({
        type: form,
        date: recent.filingDate[i],
        description: recent.primaryDocDescription[i] || `${form} Filing`,
        url: `https://www.sec.gov/Archives/edgar/data/${cik}/${accn}/${primaryDoc}`,
      });
    }

    await setCache(cacheKey, filings, dataConfig.cache.ttl.filings);
    return filings;
  },

  async getInsiderTrades(ticker: string, limit = 20): Promise<InsiderTransaction[]> {
    const cacheKey = `edgar_insider_${ticker}_${limit}`;
    const cached = await getCached<InsiderTransaction[]>(cacheKey);
    if (cached) return cached;

    const cik = await tickerToCIK(ticker);
    if (!cik) return [];

    const data = await edgarFetch<SubmissionsResponse>(
      `${baseUrl}/submissions/CIK${padCIK(cik)}.json`
    );
    if (!data?.filings?.recent) return [];

    const { recent } = data.filings;
    const form4Filings: InsiderTransaction[] = [];

    // Form 4s are listed in submissions but the detailed data requires
    // parsing the XML of each filing. For now, we return filing metadata.
    // Full XML parsing will be added when we implement the background job.
    for (let i = 0; i < recent.form.length && form4Filings.length < limit; i++) {
      if (recent.form[i] !== "4") continue;

      form4Filings.push({
        name: recent.primaryDocDescription[i] || "Insider",
        title: "Officer/Director",
        type: "Sale", // Can't determine from submissions alone — need XML parsing
        shares: 0,
        pricePerShare: 0,
        totalValue: 0,
        date: recent.filingDate[i],
        isRoutine: true,
      });
    }

    await setCache(cacheKey, form4Filings, dataConfig.cache.ttl.insiderTrades);
    return form4Filings;
  },
};

// ── Exported utility functions ─────────────────────────────────────

export { tickerToCIK, getTickerMap, padCIK };
