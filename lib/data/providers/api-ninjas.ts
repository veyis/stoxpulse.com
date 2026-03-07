import type { DataProvider, EarningsTranscript } from "../types";
import { dataConfig, isProviderEnabled } from "../config";
import { getCached, setCache } from "../cache";

const { baseUrl, apiKey } = dataConfig.apiNinjas ?? { baseUrl: "", apiKey: "" };

async function apiNinjasFetch<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T | null> {
  if (!isProviderEnabled("apiNinjas") || !apiKey) return null;

  const url = new URL(`${baseUrl}${endpoint}`);
  for (const [key, val] of Object.entries(params)) {
    url.searchParams.set(key, val);
  }

  try {
    const res = await fetch(url.toString(), {
      headers: { "X-Api-Key": apiKey },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`API Ninjas ${endpoint}: ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.error(`API Ninjas fetch error for ${endpoint}:`, error);
    return null;
  }
}

interface ApiNinjasTranscript {
  transcript: string;
  year: number;
  quarter: number;
  ticker: string;
}

export const apiNinjasProvider: DataProvider = {
  name: "apiNinjas",

  async getTranscript(
    ticker: string,
    quarter: number,
    year: number
  ): Promise<EarningsTranscript | null> {
    const cacheKey = `apiNinjas_transcript_${ticker}_${quarter}_${year}`;
    const cached = await getCached<EarningsTranscript>(cacheKey);
    if (cached) return cached;

    const data = await apiNinjasFetch<ApiNinjasTranscript[]>(
      "/v1/earningstranscript",
      { ticker, year: String(year), quarter: String(quarter) }
    );
    if (!data || data.length === 0) return null;

    const item = data[0];
    const result: EarningsTranscript = {
      ticker: item.ticker,
      quarter: item.quarter,
      year: item.year,
      date: `${item.year}-Q${item.quarter}`,
      content: item.transcript,
    };

    await setCache(cacheKey, result, 60 * 60 * 24 * 7); // 7 days
    return result;
  },
};
