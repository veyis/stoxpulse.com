// Promise Tracker — Track what management promised vs what they delivered
// Unique differentiator: no competitor tracks management credibility

import { getCached, setCache } from "@/lib/data/cache";
import type { EarningsAnalysis } from "./earnings-analyzer";

export interface ManagementPromise {
  id: string;
  ticker: string;
  statement: string;
  speaker: string;
  category: "guidance" | "operational" | "strategic";
  measurable: boolean;
  madeDate: string; // When the promise was made (earnings call date)
  madeQuarter: string; // e.g., "Q4 2025"
  deadline: string; // e.g., "Q1 2026" or "H2 2026"
  status: "pending" | "delivered" | "partial" | "broken";
  resolution: string | null; // How the promise was resolved
  resolvedDate: string | null;
}

export interface PromiseTracker {
  ticker: string;
  promises: ManagementPromise[];
  credibilityScore: number; // 0-100 (% delivered + 0.5 * partial)
  trend: "improving" | "stable" | "declining";
}

function generatePromiseId(ticker: string, statement: string, date: string): string {
  const hash = statement.slice(0, 30).replace(/\s+/g, "-").toLowerCase();
  return `${ticker}-${date}-${hash}`;
}

// Extract promises from an earnings analysis result
export function extractPromises(
  ticker: string,
  analysis: EarningsAnalysis,
  callDate: string,
  quarter: string
): ManagementPromise[] {
  if (!analysis.promises || analysis.promises.length === 0) return [];

  return analysis.promises.map((p) => ({
    id: generatePromiseId(ticker, p.statement, callDate),
    ticker,
    statement: p.statement,
    speaker: p.speaker,
    category: p.category as ManagementPromise["category"],
    measurable: p.measurable,
    madeDate: callDate,
    madeQuarter: quarter,
    deadline: p.deadline,
    status: "pending" as const,
    resolution: null,
    resolvedDate: null,
  }));
}

// Calculate credibility score from promise history
export function calculateCredibility(promises: ManagementPromise[]): {
  score: number;
  trend: "improving" | "stable" | "declining";
} {
  const resolved = promises.filter((p) => p.status !== "pending");
  if (resolved.length === 0) return { score: 50, trend: "stable" };

  const delivered = resolved.filter((p) => p.status === "delivered").length;
  const partial = resolved.filter((p) => p.status === "partial").length;
  const score = Math.round(((delivered + partial * 0.5) / resolved.length) * 100);

  // Trend: compare recent half vs older half
  const sorted = [...resolved].sort(
    (a, b) => new Date(b.resolvedDate ?? b.madeDate).getTime() -
              new Date(a.resolvedDate ?? a.madeDate).getTime()
  );
  const mid = Math.floor(sorted.length / 2);
  if (mid < 2) return { score, trend: "stable" };

  const recentHalf = sorted.slice(0, mid);
  const olderHalf = sorted.slice(mid);

  const recentScore =
    recentHalf.filter((p) => p.status === "delivered").length / recentHalf.length;
  const olderScore =
    olderHalf.filter((p) => p.status === "delivered").length / olderHalf.length;

  const diff = recentScore - olderScore;
  const trend = diff > 0.1 ? "improving" : diff < -0.1 ? "declining" : "stable";

  return { score, trend };
}

// Get or initialize promise tracker for a ticker
export async function getPromiseTracker(ticker: string): Promise<PromiseTracker> {
  const cacheKey = `promise-tracker-${ticker}`;
  const cached = await getCached<PromiseTracker>(cacheKey);
  if (cached) return cached;

  return {
    ticker,
    promises: [],
    credibilityScore: 50,
    trend: "stable",
  };
}

// Save promise tracker
export async function savePromiseTracker(tracker: PromiseTracker): Promise<void> {
  const cacheKey = `promise-tracker-${tracker.ticker}`;
  const { score, trend } = calculateCredibility(tracker.promises);
  tracker.credibilityScore = score;
  tracker.trend = trend;
  await setCache(cacheKey, tracker, 90 * 24 * 3600); // 90 day cache
}

// Add new promises from an earnings analysis
export async function addPromisesFromEarnings(
  ticker: string,
  analysis: EarningsAnalysis,
  callDate: string,
  quarter: string
): Promise<PromiseTracker> {
  const tracker = await getPromiseTracker(ticker);
  const newPromises = extractPromises(ticker, analysis, callDate, quarter);

  // Deduplicate by ID
  const existingIds = new Set(tracker.promises.map((p) => p.id));
  const unique = newPromises.filter((p) => !existingIds.has(p.id));

  tracker.promises.push(...unique);
  await savePromiseTracker(tracker);
  return tracker;
}
