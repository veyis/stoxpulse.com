// AI SEC Filing Analyzer
// Analyzes 8-K, 10-K, 10-Q filings using Gemini 2.5 Flash

import { GoogleGenAI } from "@google/genai";
import { isAIEnabled } from "./gemini";
import { getCached, setCache } from "@/lib/data/cache";

export interface FilingAnalysis {
  ticker: string;
  filingType: string;
  filingDate: string;
  summary: string; // 2-3 sentence plain English summary
  significance: "low" | "medium" | "high" | "critical";
  keyPoints: string[]; // 3-5 bullet points
  risks: string[]; // notable risk factors
  opportunities: string[]; // positive signals
  actionItems: string[]; // what investors should watch
  sentiment: "bullish" | "bearish" | "neutral";
}

const FILING_ANALYSIS_SCHEMA = {
  type: "object" as const,
  properties: {
    summary: { type: "string" as const },
    significance: { type: "string" as const, enum: ["low", "medium", "high", "critical"] },
    keyPoints: { type: "array" as const, items: { type: "string" as const } },
    risks: { type: "array" as const, items: { type: "string" as const } },
    opportunities: { type: "array" as const, items: { type: "string" as const } },
    actionItems: { type: "array" as const, items: { type: "string" as const } },
    sentiment: { type: "string" as const, enum: ["bullish", "bearish", "neutral"] },
  },
  required: ["summary", "significance", "keyPoints", "risks", "opportunities", "actionItems", "sentiment"],
};

export async function analyzeFilingContent(
  ticker: string,
  filingType: string,
  filingDate: string,
  content: string
): Promise<FilingAnalysis | null> {
  if (!isAIEnabled()) return null;

  const cacheKey = `filing-analysis-${ticker}-${filingType}-${filingDate}`;
  const cached = await getCached<FilingAnalysis>(cacheKey);
  if (cached) return cached;

  try {
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    // Truncate to fit context window
    const truncated = content.slice(0, 100_000);

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a senior SEC filing analyst. Analyze this ${filingType} filing for ${ticker} (filed ${filingDate}).

FILING CONTENT:
${truncated}

Provide a structured analysis focused on what retail investors need to know. Be specific with numbers and facts from the filing. Do not be generic.

For significance:
- "critical" = material event affecting stock price (CEO change, acquisition, restatement, bankruptcy)
- "high" = important financial update (earnings surprise, guidance change, major contract)
- "medium" = routine quarterly/annual filing with notable details
- "low" = routine filing with nothing unusual`,
      config: {
        temperature: 0.15,
        maxOutputTokens: 2000,
        responseMimeType: "application/json",
        responseSchema: FILING_ANALYSIS_SCHEMA,
      },
    });

    const text = result.text ?? "";
    const parsed = JSON.parse(text);

    const analysis: FilingAnalysis = {
      ticker,
      filingType,
      filingDate,
      ...parsed,
    };

    await setCache(cacheKey, analysis, 30 * 24 * 3600); // 30 day cache
    return analysis;
  } catch (error) {
    console.error(`[Filing Analyzer] Error for ${ticker} ${filingType}:`, error);
    return null;
  }
}
