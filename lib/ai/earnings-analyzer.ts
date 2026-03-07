// AI Earnings Call Analyzer
// Feeds full transcript to Gemini for institutional-grade analysis
// Returns structured JSON with summary, sentiment, red/green flags, promises, key quotes

import { GoogleGenAI } from "@google/genai";
import { getCached, setCache } from "@/lib/data/cache";

const CACHE_TTL = 30 * 24 * 60 * 60; // 30 days (transcripts don't change)

export interface EarningsAnalysis {
  ticker: string;
  quarter: number;
  year: number;
  summary: string;
  keyNumbers: {
    metric: string;
    actual: string;
    estimate: string;
    surprise: string;
    significance: string;
  }[];
  sentiment: {
    overall: "bullish" | "cautious" | "defensive" | "neutral";
    confidence: number;
    vsLastQuarter: "improved" | "unchanged" | "deteriorated" | "unknown";
    toneShifts: string[];
  };
  redFlags: {
    flag: string;
    severity: "low" | "medium" | "high";
    context: string;
  }[];
  greenFlags: {
    flag: string;
    significance: "low" | "medium" | "high";
    context: string;
  }[];
  promises: {
    statement: string;
    speaker: string;
    category: "guidance" | "operational" | "strategic";
    measurable: boolean;
    deadline: string;
  }[];
  keyQuotes: {
    text: string;
    speaker: string;
    significance: string;
  }[];
  guidance: {
    metric: string;
    previous: string;
    current: string;
    direction: "raised" | "lowered" | "maintained" | "new";
  }[];
  qaHighlights: {
    analyst: string;
    question: string;
    answer: string;
    insight: string;
  }[];
}

const EARNINGS_ANALYSIS_SCHEMA = {
  type: "object" as const,
  properties: {
    summary: { type: "string" as const },
    keyNumbers: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          metric: { type: "string" as const },
          actual: { type: "string" as const },
          estimate: { type: "string" as const },
          surprise: { type: "string" as const },
          significance: { type: "string" as const },
        },
        required: ["metric", "actual", "surprise"],
      },
    },
    sentiment: {
      type: "object" as const,
      properties: {
        overall: { type: "string" as const, enum: ["bullish", "cautious", "defensive", "neutral"] },
        confidence: { type: "number" as const },
        vsLastQuarter: { type: "string" as const, enum: ["improved", "unchanged", "deteriorated", "unknown"] },
        toneShifts: { type: "array" as const, items: { type: "string" as const } },
      },
      required: ["overall", "confidence"],
    },
    redFlags: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          flag: { type: "string" as const },
          severity: { type: "string" as const, enum: ["low", "medium", "high"] },
          context: { type: "string" as const },
        },
        required: ["flag", "severity"],
      },
    },
    greenFlags: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          flag: { type: "string" as const },
          significance: { type: "string" as const, enum: ["low", "medium", "high"] },
          context: { type: "string" as const },
        },
        required: ["flag", "significance"],
      },
    },
    promises: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          statement: { type: "string" as const },
          speaker: { type: "string" as const },
          category: { type: "string" as const, enum: ["guidance", "operational", "strategic"] },
          measurable: { type: "boolean" as const },
          deadline: { type: "string" as const },
        },
        required: ["statement", "speaker", "category"],
      },
    },
    keyQuotes: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          text: { type: "string" as const },
          speaker: { type: "string" as const },
          significance: { type: "string" as const },
        },
        required: ["text", "speaker"],
      },
    },
    guidance: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          metric: { type: "string" as const },
          previous: { type: "string" as const },
          current: { type: "string" as const },
          direction: { type: "string" as const, enum: ["raised", "lowered", "maintained", "new"] },
        },
        required: ["metric", "current", "direction"],
      },
    },
    qaHighlights: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          analyst: { type: "string" as const },
          question: { type: "string" as const },
          answer: { type: "string" as const },
          insight: { type: "string" as const },
        },
        required: ["question", "answer"],
      },
    },
  },
  required: ["summary", "keyNumbers", "sentiment", "redFlags", "greenFlags", "promises", "keyQuotes"],
};

const SYSTEM_PROMPT = `You are StoxPulse AI, an elite financial analyst specializing in earnings call transcript analysis.

Your job: Analyze the full earnings call transcript and extract actionable intelligence.

RULES:
- Summary must be under 150 words — write for a busy investor who has 2 minutes
- keyNumbers: Extract the 3-5 most important financial metrics discussed (revenue, EPS, margins, guidance, etc.)
- sentiment: Assess management's overall tone. Is the CEO confident or hedging? Compare language patterns to typical earnings calls.
- redFlags: Look for evasive language, hedging words ("challenging", "headwinds", "uncertainty"), lowered guidance, non-answers to analyst questions, unusual accounting mentions
- greenFlags: Look for beat-and-raise patterns, accelerating growth, new initiatives, confident language, specific forward commitments
- promises: Extract any forward-looking statements that can be tracked next quarter. Must be specific and measurable where possible.
- keyQuotes: The 3-5 most revealing sentences from the call — quotes that move stocks or reveal strategy
- guidance: Any guidance given or changed (revenue, EPS, margins, capex targets)
- qaHighlights: The most informative Q&A exchanges — what did analysts probe, and what did management reveal?

Be specific. Cite numbers. No generic platitudes.`;

export async function analyzeEarningsCall(
  ticker: string,
  quarter: number,
  year: number,
  transcript: string
): Promise<EarningsAnalysis | null> {
  const cacheKey = `earnings-analysis-${ticker}-${year}-Q${quarter}`;
  const cached = await getCached<EarningsAnalysis>(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const client = new GoogleGenAI({ apiKey });

  // Truncate very long transcripts to stay within context limits
  const maxChars = 120000; // ~30K tokens for Gemini 2.5 Flash (128K context)
  const truncated = transcript.length > maxChars
    ? transcript.slice(0, maxChars) + "\n\n[TRANSCRIPT TRUNCATED — remaining content omitted for context limit]"
    : transcript;

  const userPrompt = `Analyze this ${ticker} Q${quarter} ${year} earnings call transcript:\n\n${truncated}`;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseJsonSchema: EARNINGS_ANALYSIS_SCHEMA,
        temperature: 0.15,
        maxOutputTokens: 8192,
        thinkingConfig: { thinkingBudget: 2048 },
      },
    });

    const text = response.text;
    if (!text) return null;

    const parsed = JSON.parse(text);
    const analysis: EarningsAnalysis = {
      ticker,
      quarter,
      year,
      summary: parsed.summary ?? "",
      keyNumbers: parsed.keyNumbers ?? [],
      sentiment: {
        overall: parsed.sentiment?.overall ?? "neutral",
        confidence: parsed.sentiment?.confidence ?? 50,
        vsLastQuarter: parsed.sentiment?.vsLastQuarter ?? "unknown",
        toneShifts: parsed.sentiment?.toneShifts ?? [],
      },
      redFlags: parsed.redFlags ?? [],
      greenFlags: parsed.greenFlags ?? [],
      promises: parsed.promises ?? [],
      keyQuotes: parsed.keyQuotes ?? [],
      guidance: parsed.guidance ?? [],
      qaHighlights: parsed.qaHighlights ?? [],
    };

    await setCache(cacheKey, analysis, CACHE_TTL);
    return analysis;
  } catch (error) {
    console.error(`[AI] Earnings analysis error for ${ticker} Q${quarter} ${year}:`, error);
    return null;
  }
}
