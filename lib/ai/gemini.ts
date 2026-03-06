// Gemini 2.5 Flash client for AI signal generation
// Uses structured output (JSON schema) for reliable parsing
// Feeds ALL 12 data sources for maximum analysis quality

import { GoogleGenAI } from "@google/genai";
import { buildStockPrompt, SYSTEM_PROMPT } from "./prompts";
import type { StockContext } from "./prompts";
import { AI_SIGNAL_SCHEMA, type AIStockAnalysis } from "./types";
import { getCached, setCache } from "@/lib/data/cache";

const AI_CACHE_TTL = 5 * 60; // 5 minutes

function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

export async function generateAISignals(
  input: StockContext
): Promise<AIStockAnalysis | null> {
  // Check cache first
  const cacheKey = `ai-signals-v2-${input.ticker}`;
  const cached = await getCached<AIStockAnalysis>(cacheKey);
  if (cached) return cached;

  const client = getClient();
  // Don't generate AI signals during Next.js build prerendering (it freezes the build)
  if (!client || process.env.NEXT_PHASE === "phase-production-build" || process.env.npm_lifecycle_event === "build") {
    if (!client) console.warn(`[AI] GEMINI_API_KEY not set — skipping AI signal generation for ${input.ticker}`);
    return null;
  }

  // Build the compressed stock context prompt with ALL data sources
  const userPrompt = buildStockPrompt(input);

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseJsonSchema: AI_SIGNAL_SCHEMA,
        temperature: 0.2, // lower temp for more consistent, factual output
        maxOutputTokens: 4096, // more room for detailed analysis
        thinkingConfig: { thinkingBudget: 1024 }, // brief reasoning = better analysis
      },
    });

    const text = response.text;
    if (!text) {
      console.warn(`[AI] Empty response for ${input.ticker}`);
      return null;
    }

    const parsed: AIStockAnalysis = {
      ...JSON.parse(text),
      ticker: input.ticker,
    };

    // Validate required fields
    if (!Array.isArray(parsed.signals) || parsed.signals.length === 0) {
      console.warn(`[AI] No signals in response for ${input.ticker}`);
      return null;
    }

    // Ensure defaults for new fields (backwards compat)
    parsed.detailedAnalysis = parsed.detailedAnalysis || parsed.summary;
    parsed.sentimentScore = parsed.sentimentScore ?? 0;
    parsed.keyMetrics = parsed.keyMetrics ?? [];
    parsed.riskFactors = parsed.riskFactors ?? [];
    parsed.catalysts = parsed.catalysts ?? [];

    // Clamp confidence values
    for (const signal of parsed.signals) {
      signal.confidence = Math.max(0, Math.min(1, signal.confidence ?? 0.5));
      signal.dataPoints = signal.dataPoints ?? [];
    }

    // Cache the result
    await setCache(cacheKey, parsed, AI_CACHE_TTL);

    return parsed;
  } catch (error) {
    console.error(`[AI] Error generating signals for ${input.ticker}:`, error);
    return null;
  }
}

export function isAIEnabled(): boolean {
  return !!process.env.GEMINI_API_KEY;
}
