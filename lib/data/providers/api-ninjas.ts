import type { DataProvider, EarningsTranscript, TranscriptSpeaker } from "../types";
import { dataConfig, isProviderEnabled } from "../config";
import { getCached, setCache } from "../cache";

const { baseUrl, apiKey } = dataConfig.apiNinjas;

async function ninjasFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> {
  if (!isProviderEnabled("apiNinjas")) return null;

  const url = new URL(`${baseUrl}${endpoint}`);
  for (const [key, val] of Object.entries(params)) {
    url.searchParams.set(key, val);
  }

  try {
    const res = await fetch(url.toString(), {
      headers: { "X-Api-Key": apiKey },
      next: { revalidate: 86400 }, // transcripts rarely change
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

// ── Response types ─────────────────────────────────────────────────

interface NinjasTranscript {
  ticker: string;
  transcript: string;
  participants?: Array<{
    name: string;
    role: string;
    company: string;
  }>;
  summary?: string;
  sentiment?: {
    overall: string;
    score: number;
  };
  risk_factors?: string[];
  key_metrics?: Record<string, string | number>;
  date?: string;
  quarter?: number;
  year?: number;
}

// ── Provider Implementation ────────────────────────────────────────

export const apiNinjasProvider: DataProvider = {
  name: "apiNinjas",

  async getTranscript(ticker: string, quarter: number, year: number): Promise<EarningsTranscript | null> {
    const cacheKey = `ninjas_transcript_${ticker}_${year}_Q${quarter}`;
    const cached = await getCached<EarningsTranscript>(cacheKey);
    if (cached) return cached;

    const data = await ninjasFetch<NinjasTranscript>("/earningstranscript", {
      ticker,
      quarter: String(quarter),
      year: String(year),
    });

    if (!data?.transcript) return null;

    // Parse speakers from transcript if available
    const speakers: TranscriptSpeaker[] = data.participants?.map((p) => ({
      name: p.name,
      role: p.role,
      text: "", // Full text extraction would need NLP parsing
    })) ?? [];

    const transcript: EarningsTranscript = {
      ticker,
      quarter,
      year,
      date: data.date ?? "",
      content: data.transcript,
      speakers: speakers.length > 0 ? speakers : undefined,
      aiSummary: data.summary,
      sentiment: data.sentiment?.overall,
      riskFactors: data.risk_factors,
    };

    await setCache(cacheKey, transcript, dataConfig.cache.ttl.earnings);
    return transcript;
  },
};
