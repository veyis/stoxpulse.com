// AI News Intelligence — scores news articles for importance and novelty
// Used by Inngest news aggregation job and signal feed

import { GoogleGenAI } from "@google/genai";
import { isAIEnabled } from "./gemini";
import { getCached, setCache } from "@/lib/data/cache";
import type { NewsItem } from "@/lib/data/types";

export interface ScoredNews extends NewsItem {
  importanceScore: number; // 1-10
  category: "earnings" | "insider" | "analyst" | "macro" | "product" | "legal" | "other";
  isNovel: boolean; // false if this is old news repackaged
  aiSummary: string; // 1 sentence summary
}

export async function scoreNewsArticles(
  articles: NewsItem[],
  ticker: string
): Promise<ScoredNews[]> {
  if (!isAIEnabled() || articles.length === 0) {
    return articles.map((a) => ({
      ...a,
      importanceScore: 5,
      category: "other" as const,
      isNovel: true,
      aiSummary: a.summary.slice(0, 120),
    }));
  }

  const cacheKey = `scored-news-${ticker}-${articles[0]?.id}`;
  const cached = await getCached<ScoredNews[]>(cacheKey);
  if (cached) return cached;

  try {
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const articleList = articles.slice(0, 10).map((a, i) => (
      `[${i}] "${a.headline}" (${a.source}, ${a.datetime})\n${a.summary.slice(0, 200)}`
    )).join("\n\n");

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Score these ${ticker} news articles for a retail investor. For each article, provide:
- importance: 1-10 (10 = stock-moving event like earnings beat/miss, CEO change, FDA approval; 1 = filler/repackaged)
- category: one of "earnings", "insider", "analyst", "macro", "product", "legal", "other"
- isNovel: true if this is genuinely new information, false if it's rehashing old news
- aiSummary: one clear sentence (max 100 chars) about what matters

Articles:
${articleList}

Return a JSON array with one object per article, in the same order. Format:
[{"importance": 8, "category": "earnings", "isNovel": true, "aiSummary": "..."}]`,
      config: {
        temperature: 0.1,
        maxOutputTokens: 1500,
        responseMimeType: "application/json",
      },
    });

    const text = result.text ?? "[]";
    const parsed = JSON.parse(text) as Array<{
      importance: number;
      category: string;
      isNovel: boolean;
      aiSummary: string;
    }>;

    const scored: ScoredNews[] = articles.slice(0, 10).map((a, i) => ({
      ...a,
      importanceScore: parsed[i]?.importance ?? 5,
      category: (parsed[i]?.category ?? "other") as ScoredNews["category"],
      isNovel: parsed[i]?.isNovel ?? true,
      aiSummary: parsed[i]?.aiSummary ?? a.summary.slice(0, 120),
    }));

    await setCache(cacheKey, scored, 7200); // 2hr cache
    return scored;
  } catch (error) {
    console.error(`[News Scorer] Error for ${ticker}:`, error);
    return articles.map((a) => ({
      ...a,
      importanceScore: 5,
      category: "other" as const,
      isNovel: true,
      aiSummary: a.summary.slice(0, 120),
    }));
  }
}
