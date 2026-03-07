import { NextResponse } from "next/server";
import { getQuote, getProfile } from "@/lib/data";

const GICS_SECTORS = [
  "Technology",
  "Healthcare",
  "Financials",
  "Consumer Cyclical",
  "Communication Services",
  "Industrials",
  "Consumer Defensive",
  "Energy",
  "Utilities",
  "Real Estate",
  "Basic Materials",
] as const;

// Normalize sector names from different providers to standard GICS names
function normalizeSector(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("tech")) return "Technology";
  if (lower.includes("health") || lower.includes("pharma") || lower.includes("biotech")) return "Healthcare";
  if (lower.includes("financ") || lower.includes("bank") || lower.includes("insurance")) return "Financials";
  if (lower.includes("consumer") && (lower.includes("cycl") || lower.includes("discret"))) return "Consumer Cyclical";
  if (lower.includes("consumer") && (lower.includes("def") || lower.includes("stapl"))) return "Consumer Defensive";
  if (lower.includes("communicat") || lower.includes("media") || lower.includes("telecom")) return "Communication Services";
  if (lower.includes("industr") || lower.includes("aerospace") || lower.includes("defense")) return "Industrials";
  if (lower.includes("energy") || lower.includes("oil") || lower.includes("gas")) return "Energy";
  if (lower.includes("utilit")) return "Utilities";
  if (lower.includes("real estate") || lower.includes("reit")) return "Real Estate";
  if (lower.includes("basic") || lower.includes("material") || lower.includes("mining") || lower.includes("chemical")) return "Basic Materials";
  return raw; // fallback to original
}

function calculateDiversificationGrade(sectorCounts: Record<string, number>, totalStocks: number): {
  grade: string;
  score: number;
  label: string;
  color: string;
} {
  const sectorCount = Object.keys(sectorCounts).length;
  const maxConcentration = Math.max(...Object.values(sectorCounts)) / totalStocks;

  // Herfindahl-Hirschman Index (simplified) — lower is more diversified
  let hhi = 0;
  for (const count of Object.values(sectorCounts)) {
    const share = count / totalStocks;
    hhi += share * share;
  }

  // Score 0-100 based on sector count, HHI, and max concentration
  let score = 0;
  // Sector spread (max 40 points)
  score += Math.min(sectorCount / 8, 1) * 40;
  // HHI penalty (max 35 points, 1/n = perfect diversification)
  const perfectHHI = 1 / Math.max(sectorCount, 1);
  const hhiRatio = perfectHHI / Math.max(hhi, 0.01);
  score += Math.min(hhiRatio, 1) * 35;
  // Concentration penalty (max 25 points)
  score += (1 - maxConcentration) * 25;

  if (score >= 85) return { grade: "A", score, label: "Excellent", color: "text-positive" };
  if (score >= 70) return { grade: "B", score, label: "Good", color: "text-brand" };
  if (score >= 55) return { grade: "C", score, label: "Fair", color: "text-yellow-400" };
  if (score >= 40) return { grade: "D", score, label: "Poor", color: "text-warning" };
  return { grade: "F", score, label: "Critical", color: "text-negative" };
}

function identifyRiskFactors(
  sectorCounts: Record<string, number>,
  totalStocks: number,
  avgBeta: number | null,
  maxConcentration: { sector: string; pct: number },
  missingSectors: string[],
): { title: string; detail: string; severity: "high" | "medium" | "low" }[] {
  const risks: { title: string; detail: string; severity: "high" | "medium" | "low" }[] = [];

  // Concentration risk
  if (maxConcentration.pct >= 60) {
    risks.push({
      title: `High ${maxConcentration.sector} concentration`,
      detail: `${Math.round(maxConcentration.pct)}% of your portfolio is in one sector. A sector-specific downturn could significantly impact returns.`,
      severity: "high",
    });
  } else if (maxConcentration.pct >= 40) {
    risks.push({
      title: `${maxConcentration.sector} overweight`,
      detail: `${Math.round(maxConcentration.pct)}% allocation to a single sector increases vulnerability to sector rotation.`,
      severity: "medium",
    });
  }

  // Beta risk
  if (avgBeta !== null) {
    if (avgBeta > 1.3) {
      risks.push({
        title: `High portfolio volatility`,
        detail: `Average beta of ${avgBeta.toFixed(2)} means your portfolio swings ~${Math.round((avgBeta - 1) * 100)}% more than the market.`,
        severity: "high",
      });
    } else if (avgBeta > 1.1) {
      risks.push({
        title: `Above-average volatility`,
        detail: `Average beta of ${avgBeta.toFixed(2)} indicates slightly above-market risk exposure.`,
        severity: "medium",
      });
    } else if (avgBeta < 0.7) {
      risks.push({
        title: `Very defensive portfolio`,
        detail: `Average beta of ${avgBeta.toFixed(2)} suggests limited upside capture in bull markets.`,
        severity: "low",
      });
    }
  }

  // Missing sectors risk
  if (missingSectors.length >= 8) {
    risks.push({
      title: `Minimal sector coverage`,
      detail: `Only ${11 - missingSectors.length} of 11 sectors represented. You're missing exposure to ${missingSectors.length} sectors.`,
      severity: "high",
    });
  } else if (missingSectors.length >= 5) {
    risks.push({
      title: `Limited sector diversity`,
      detail: `Missing ${missingSectors.length} of 11 GICS sectors. Consider adding exposure to uncovered areas.`,
      severity: "medium",
    });
  }

  // Small portfolio risk
  if (totalStocks <= 3) {
    risks.push({
      title: `Under-diversified position count`,
      detail: `Only ${totalStocks} stock${totalStocks === 1 ? "" : "s"} in portfolio. Individual stock risk is very high.`,
      severity: "high",
    });
  }

  // If few risks found, add a positive note
  if (risks.length === 0) {
    risks.push({
      title: `Well-balanced portfolio`,
      detail: `No major concentration or volatility risks detected. Keep monitoring for changes.`,
      severity: "low",
    });
  }

  return risks.slice(0, 3);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tickers } = body as { tickers: string[] };

    // Validate
    if (!Array.isArray(tickers) || tickers.length === 0 || tickers.length > 10) {
      return NextResponse.json(
        { error: "Please provide between 1 and 10 tickers." },
        { status: 400 }
      );
    }

    const cleanTickers = tickers
      .map((t: string) => t.toUpperCase().replace(/[^A-Z0-9.]/g, ""))
      .filter((t: string) => t.length > 0 && t.length <= 6);

    if (cleanTickers.length === 0) {
      return NextResponse.json(
        { error: "No valid tickers provided." },
        { status: 400 }
      );
    }

    // Fetch data in parallel
    const results = await Promise.all(
      cleanTickers.map(async (ticker) => {
        const [quote, profile] = await Promise.all([
          getQuote(ticker).catch(() => null),
          getProfile(ticker).catch(() => null),
        ]);
        return { ticker, quote, profile };
      })
    );

    // Filter out failed lookups
    const valid = results.filter((r) => r.quote || r.profile);

    if (valid.length === 0) {
      return NextResponse.json(
        { error: "Could not retrieve data for any of the provided tickers. Please verify ticker symbols." },
        { status: 404 }
      );
    }

    // Calculate sector distribution
    const sectorCounts: Record<string, number> = {};
    const stockDetails: {
      ticker: string;
      name: string;
      sector: string;
      pe: number | null;
      beta: number | null;
      marketCap: number | null;
      dividendYield: number | null;
      price: number | null;
    }[] = [];

    for (const { ticker, quote, profile } of valid) {
      const rawSector = profile?.sector || "Unknown";
      const sector = normalizeSector(rawSector);
      sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;

      const price = quote?.price ?? null;
      const lastDiv = profile?.lastDividend ?? null;
      const divYield = price && lastDiv ? (lastDiv / price) * 100 : null;

      stockDetails.push({
        ticker,
        name: profile?.name || ticker,
        sector,
        pe: quote?.pe ?? null,
        beta: profile?.beta ?? null,
        marketCap: quote?.marketCap ?? profile?.marketCap ?? null,
        dividendYield: divYield,
        price,
      });
    }

    const totalStocks = valid.length;

    // Sector breakdown percentages
    const sectorBreakdown = Object.entries(sectorCounts)
      .map(([sector, count]) => ({
        sector,
        count,
        percentage: (count / totalStocks) * 100,
      }))
      .sort((a, b) => b.percentage - a.percentage);

    // Missing sectors
    const presentSectors = new Set(Object.keys(sectorCounts));
    const missingSectors = GICS_SECTORS.filter((s) => !presentSectors.has(s));

    // Portfolio stats
    const betas = stockDetails.map((s) => s.beta).filter((b): b is number => b !== null);
    const pes = stockDetails.map((s) => s.pe).filter((p): p is number => p !== null && p > 0);
    const divYields = stockDetails.map((s) => s.dividendYield).filter((d): d is number => d !== null);
    const mktCaps = stockDetails.map((s) => s.marketCap).filter((m): m is number => m !== null);

    const avgBeta = betas.length > 0 ? betas.reduce((a, b) => a + b, 0) / betas.length : null;
    const avgPE = pes.length > 0 ? pes.reduce((a, b) => a + b, 0) / pes.length : null;
    const avgDivYield = divYields.length > 0 ? divYields.reduce((a, b) => a + b, 0) / divYields.length : null;
    const totalMktCap = mktCaps.length > 0 ? mktCaps.reduce((a, b) => a + b, 0) : null;

    // Diversification grade
    const gradeInfo = calculateDiversificationGrade(sectorCounts, totalStocks);

    // Max concentration
    const topSector = sectorBreakdown[0];
    const maxConcentration = { sector: topSector.sector, pct: topSector.percentage };

    // Risk factors
    const riskFactors = identifyRiskFactors(sectorCounts, totalStocks, avgBeta, maxConcentration, missingSectors);

    return NextResponse.json({
      stockCount: totalStocks,
      failedTickers: results.filter((r) => !r.quote && !r.profile).map((r) => r.ticker),
      grade: gradeInfo,
      sectorBreakdown,
      missingSectors,
      riskFactors,
      stats: {
        avgPE: avgPE ? Math.round(avgPE * 100) / 100 : null,
        avgBeta: avgBeta ? Math.round(avgBeta * 100) / 100 : null,
        totalMktCap,
        avgDivYield: avgDivYield ? Math.round(avgDivYield * 100) / 100 : null,
      },
      stocks: stockDetails,
    });
  } catch (err) {
    console.error("Portfolio risk API error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
