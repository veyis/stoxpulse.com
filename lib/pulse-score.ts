// Pulse Score — StoxPulse proprietary composite stock health metric
//
// 5 dimensions, each scored 0-20 (total 0-100):
//   VALUE     — Is the stock fairly priced?
//   GROWTH    — Is the company growing?
//   HEALTH    — Is the balance sheet strong?
//   MOMENTUM  — Is the price trending up?
//   SENTIMENT — Are insiders/analysts/news bullish?
//
// Grade: A+ (90-100) through F (0-29)

import type { StockPageData } from "@/lib/data/index";

export interface PulseDimension {
  name: "Value" | "Growth" | "Health" | "Momentum" | "Sentiment";
  score: number; // 0-20
  factors: PulseFactor[];
}

export interface PulseFactor {
  name: string;
  value: string;
  score: number; // 0-5 (contribution to dimension)
  context?: string;
}

export interface PulseScore {
  total: number; // 0-100
  grade: string; // A+ through F
  dimensions: PulseDimension[];
}

// ── Grade mapping ─────────────────────────────────────────────
export function scoreToGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 85) return "A";
  if (score >= 80) return "A-";
  if (score >= 75) return "B+";
  if (score >= 70) return "B";
  if (score >= 65) return "B-";
  if (score >= 60) return "C+";
  if (score >= 55) return "C";
  if (score >= 50) return "C-";
  if (score >= 45) return "D+";
  if (score >= 40) return "D";
  if (score >= 35) return "D-";
  return "F";
}

export function gradeColor(grade: string): string {
  if (grade.startsWith("A")) return "text-positive";
  if (grade.startsWith("B")) return "text-positive/80";
  if (grade.startsWith("C")) return "text-warning";
  if (grade.startsWith("D")) return "text-negative/80";
  return "text-negative";
}

// ── Utility ───────────────────────────────────────────────────
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function scoreBetween(value: number | null, ideal: number, worst: number, maxScore: number): number {
  if (value == null) return maxScore * 0.5; // neutral if no data
  if (ideal === worst) return maxScore * 0.5;
  const ratio = (value - worst) / (ideal - worst);
  return clamp(Math.round(ratio * maxScore), 0, maxScore);
}

// ── VALUE dimension ───────────────────────────────────────────
function calcValue(data: StockPageData): PulseDimension {
  const factors: PulseFactor[] = [];
  const r = data.ratios;
  const q = data.quote;

  // P/E: lower is better (5-30 range, 15 ideal for value)
  const pe = r?.priceToEarningsRatio ?? q?.pe ?? null;
  const peScore = pe != null && pe > 0 ? scoreBetween(pe, 10, 50, 5) : 2;
  factors.push({ name: "P/E Ratio", value: pe != null ? pe.toFixed(1) : "N/A", score: peScore });

  // P/B: lower is better
  const pb = r?.priceToBookRatio ?? null;
  const pbScore = scoreBetween(pb, 1, 10, 4);
  factors.push({ name: "Price/Book", value: pb != null ? pb.toFixed(1) : "N/A", score: pbScore });

  // EV/EBITDA: lower is better (8-25 range)
  const evEbitda = r?.evToEBITDA ?? null;
  const evScore = evEbitda != null && evEbitda > 0 ? scoreBetween(evEbitda, 8, 30, 4) : 2;
  factors.push({ name: "EV/EBITDA", value: evEbitda != null ? evEbitda.toFixed(1) : "N/A", score: evScore });

  // FCF Yield: higher is better
  const fcfYield = r?.freeCashFlowYield ?? null;
  const fcfScore = fcfYield != null ? scoreBetween(fcfYield, 0.08, -0.02, 4) : 2;
  factors.push({ name: "FCF Yield", value: fcfYield != null ? `${(fcfYield * 100).toFixed(1)}%` : "N/A", score: fcfScore });

  // Earnings Yield: higher is better
  const ey = r?.earningsYield ?? null;
  const eyScore = ey != null ? scoreBetween(ey, 0.1, 0, 3) : 1;
  factors.push({ name: "Earnings Yield", value: ey != null ? `${(ey * 100).toFixed(1)}%` : "N/A", score: eyScore });

  const total = clamp(factors.reduce((s, f) => s + f.score, 0), 0, 20);
  return { name: "Value", score: total, factors };
}

// ── GROWTH dimension ──────────────────────────────────────────
function calcGrowth(data: StockPageData): PulseDimension {
  const factors: PulseFactor[] = [];
  const fin = data.financials;

  // Revenue growth YoY (quarterly)
  let revGrowth: number | null = null;
  if (fin && fin.quarterly.length >= 5) {
    const curr = fin.quarterly[0]?.revenue;
    const prev = fin.quarterly[4]?.revenue;
    if (curr && prev && prev !== 0) revGrowth = (curr - prev) / Math.abs(prev);
  }
  const revScore = scoreBetween(revGrowth, 0.3, -0.1, 5);
  factors.push({ name: "Revenue Growth", value: revGrowth != null ? `${(revGrowth * 100).toFixed(1)}%` : "N/A", score: revScore });

  // EPS growth YoY (quarterly)
  let epsGrowth: number | null = null;
  if (fin && fin.quarterly.length >= 5) {
    const curr = fin.quarterly[0]?.epsDiluted;
    const prev = fin.quarterly[4]?.epsDiluted;
    if (curr != null && prev != null && prev !== 0) epsGrowth = (curr - prev) / Math.abs(prev);
  }
  const epsScore = scoreBetween(epsGrowth, 0.3, -0.2, 5);
  factors.push({ name: "EPS Growth", value: epsGrowth != null ? `${(epsGrowth * 100).toFixed(1)}%` : "N/A", score: epsScore });

  // Growth acceleration (is revenue growth speeding up?)
  let accel: number | null = null;
  if (fin && fin.annual.length >= 3) {
    const a = fin.annual;
    if (a[0].revenue && a[1].revenue && a[2].revenue && a[1].revenue !== 0 && a[2].revenue !== 0) {
      const g1 = (a[0].revenue - a[1].revenue) / Math.abs(a[1].revenue);
      const g2 = (a[1].revenue - a[2].revenue) / Math.abs(a[2].revenue);
      accel = g1 - g2;
    }
  }
  const accelScore = scoreBetween(accel, 0.1, -0.1, 4);
  factors.push({ name: "Growth Trend", value: accel != null ? (accel > 0 ? "Accelerating" : "Decelerating") : "N/A", score: accelScore });

  // Margin trend (operating margin improving?)
  let marginTrend: number | null = null;
  if (fin && fin.annual.length >= 2) {
    const curr = fin.annual[0];
    const prev = fin.annual[1];
    if (curr.operatingIncome && curr.revenue && prev.operatingIncome && prev.revenue) {
      const m1 = curr.operatingIncome / curr.revenue;
      const m2 = prev.operatingIncome / prev.revenue;
      marginTrend = m1 - m2;
    }
  }
  const marginScore = scoreBetween(marginTrend, 0.05, -0.05, 3);
  factors.push({ name: "Margin Trend", value: marginTrend != null ? (marginTrend > 0 ? "Expanding" : "Compressing") : "N/A", score: marginScore });

  // Analyst estimate direction
  let estDirection: number | null = null;
  if (data.analystEstimates.length >= 2) {
    const latest = data.analystEstimates[0]?.epsAvg;
    const prior = data.analystEstimates[1]?.epsAvg;
    if (latest != null && prior != null && prior !== 0) {
      estDirection = (latest - prior) / Math.abs(prior);
    }
  }
  const estScore = scoreBetween(estDirection, 0.1, -0.1, 3);
  factors.push({ name: "Estimate Revisions", value: estDirection != null ? (estDirection > 0 ? "Rising" : "Falling") : "N/A", score: estScore });

  const total = clamp(factors.reduce((s, f) => s + f.score, 0), 0, 20);
  return { name: "Growth", score: total, factors };
}

// ── HEALTH dimension ──────────────────────────────────────────
function calcHealth(data: StockPageData): PulseDimension {
  const factors: PulseFactor[] = [];
  const r = data.ratios;

  // Current ratio (>1.5 strong, <1 weak)
  const cr = r?.currentRatio ?? null;
  const crScore = scoreBetween(cr, 2.5, 0.5, 4);
  factors.push({ name: "Current Ratio", value: cr != null ? cr.toFixed(2) : "N/A", score: crScore });

  // D/E ratio (lower is better, <1 strong)
  const de = r?.debtToEquityRatio ?? null;
  const deScore = de != null ? scoreBetween(de, 0, 3, 4) : 2;
  factors.push({ name: "Debt/Equity", value: de != null ? de.toFixed(2) : "N/A", score: deScore });

  // Interest coverage (higher is better)
  const ic = r?.interestCoverageRatio ?? null;
  const icScore = ic != null ? scoreBetween(ic, 20, 1, 3) : 1;
  factors.push({ name: "Interest Coverage", value: ic != null ? `${ic.toFixed(1)}x` : "N/A", score: icScore });

  // ROE (higher is better, >15% strong)
  const roe = r?.returnOnEquity ?? null;
  const roeScore = scoreBetween(roe, 0.3, 0, 4);
  factors.push({ name: "ROE", value: roe != null ? `${(roe * 100).toFixed(1)}%` : "N/A", score: roeScore });

  // FCF to Net Income quality (>0.8 is strong)
  let fcfQuality: number | null = null;
  if (data.cashFlow && data.financials) {
    const cf = data.cashFlow.annual[0];
    const ni = data.financials.annual[0]?.netIncome;
    if (cf?.freeCashFlow && ni && ni !== 0) {
      fcfQuality = cf.freeCashFlow / ni;
    }
  }
  const fcfQScore = scoreBetween(fcfQuality, 1.5, 0.3, 5);
  factors.push({ name: "FCF Quality", value: fcfQuality != null ? `${fcfQuality.toFixed(2)}x` : "N/A", score: fcfQScore });

  const total = clamp(factors.reduce((s, f) => s + f.score, 0), 0, 20);
  return { name: "Health", score: total, factors };
}

// ── MOMENTUM dimension ────────────────────────────────────────
function calcMomentum(data: StockPageData): PulseDimension {
  const factors: PulseFactor[] = [];
  const q = data.quote;
  const prices = data.historicalPrices;

  // Position in 52W range (higher = more momentum)
  let rangePos: number | null = null;
  if (q?.high52w && q?.low52w && q.high52w > q.low52w) {
    rangePos = (q.price - q.low52w) / (q.high52w - q.low52w);
  }
  const rangePosScore = scoreBetween(rangePos, 0.95, 0.1, 5);
  factors.push({ name: "52W Position", value: rangePos != null ? `${(rangePos * 100).toFixed(0)}%` : "N/A", score: rangePosScore });

  // vs 200-day MA (above = bullish)
  let vs200: number | null = null;
  if (q?.priceAvg200 && q.priceAvg200 > 0) {
    vs200 = (q.price - q.priceAvg200) / q.priceAvg200;
  }
  const vs200Score = scoreBetween(vs200, 0.15, -0.15, 4);
  factors.push({ name: "vs 200MA", value: vs200 != null ? `${(vs200 * 100).toFixed(1)}%` : "N/A", score: vs200Score });

  // vs 50-day MA
  let vs50: number | null = null;
  if (q?.priceAvg50 && q.priceAvg50 > 0) {
    vs50 = (q.price - q.priceAvg50) / q.priceAvg50;
  }
  const vs50Score = scoreBetween(vs50, 0.1, -0.1, 4);
  factors.push({ name: "vs 50MA", value: vs50 != null ? `${(vs50 * 100).toFixed(1)}%` : "N/A", score: vs50Score });

  // 1-month return
  let mo1Return: number | null = null;
  if (prices.length >= 22) {
    const curr = prices[0]?.close;
    const prev = prices[21]?.close;
    if (curr && prev && prev > 0) mo1Return = (curr - prev) / prev;
  }
  const mo1Score = scoreBetween(mo1Return, 0.1, -0.1, 4);
  factors.push({ name: "1M Return", value: mo1Return != null ? `${(mo1Return * 100).toFixed(1)}%` : "N/A", score: mo1Score });

  // Volume trend (5d vs 20d avg)
  let volTrend: number | null = null;
  if (prices.length >= 20) {
    const vol5 = prices.slice(0, 5).reduce((s, p) => s + p.volume, 0) / 5;
    const vol20 = prices.slice(0, 20).reduce((s, p) => s + p.volume, 0) / 20;
    if (vol20 > 0) volTrend = vol5 / vol20;
  }
  const volScore = scoreBetween(volTrend, 1.5, 0.5, 3);
  factors.push({ name: "Volume Trend", value: volTrend != null ? `${volTrend.toFixed(2)}x` : "N/A", score: volScore });

  const total = clamp(factors.reduce((s, f) => s + f.score, 0), 0, 20);
  return { name: "Momentum", score: total, factors };
}

// ── SENTIMENT dimension ───────────────────────────────────────
function calcSentiment(data: StockPageData): PulseDimension {
  const factors: PulseFactor[] = [];

  // Analyst consensus (% buy/strong buy)
  let bullPct: number | null = null;
  if (data.recommendations.length > 0) {
    const r = data.recommendations[0];
    const total = r.strongBuy + r.buy + r.hold + r.sell + r.strongSell;
    if (total > 0) bullPct = (r.strongBuy + r.buy) / total;
  }
  const analystScore = scoreBetween(bullPct, 0.9, 0.3, 5);
  factors.push({ name: "Analyst Consensus", value: bullPct != null ? `${(bullPct * 100).toFixed(0)}% Buy` : "N/A", score: analystScore });

  // Consensus shift (trending more bullish?)
  let consensusShift: number | null = null;
  if (data.recommendations.length >= 3) {
    const latest = data.recommendations[0];
    const prev = data.recommendations[2];
    const currBull = latest.strongBuy + latest.buy;
    const prevBull = prev.strongBuy + prev.buy;
    const currTotal = latest.strongBuy + latest.buy + latest.hold + latest.sell + latest.strongSell;
    const prevTotal = prev.strongBuy + prev.buy + prev.hold + prev.sell + prev.strongSell;
    if (currTotal > 0 && prevTotal > 0) {
      consensusShift = currBull / currTotal - prevBull / prevTotal;
    }
  }
  const shiftScore = scoreBetween(consensusShift, 0.1, -0.1, 4);
  factors.push({ name: "Consensus Trend", value: consensusShift != null ? (consensusShift > 0 ? "Improving" : "Declining") : "N/A", score: shiftScore });

  // Insider activity (net buy = bullish, weighted 2x)
  let insiderSignal: number | null = null;
  if (data.insiderTrades.length > 0) {
    let buyVal = 0;
    let sellVal = 0;
    for (const t of data.insiderTrades.slice(0, 10)) {
      if (t.type === "Buy") buyVal += t.totalValue;
      else sellVal += t.totalValue;
    }
    const total = buyVal + sellVal;
    if (total > 0) insiderSignal = (buyVal - sellVal) / total; // -1 to 1
  }
  const insiderScore = scoreBetween(insiderSignal, 0.5, -0.5, 6); // weighted 2x (6 points)
  factors.push({ name: "Insider Activity", value: insiderSignal != null ? (insiderSignal > 0 ? "Net Buying" : "Net Selling") : "N/A", score: insiderScore });

  // News sentiment
  let newsSent: number | null = null;
  if (data.news.length > 0) {
    let pos = 0;
    let neg = 0;
    let total = 0;
    for (const n of data.news) {
      if (n.sentiment === "positive") pos++;
      else if (n.sentiment === "negative") neg++;
      total++;
    }
    if (total > 0) newsSent = (pos - neg) / total;
  }
  const newsScore = scoreBetween(newsSent, 0.5, -0.5, 5);
  factors.push({ name: "News Sentiment", value: newsSent != null ? (newsSent > 0 ? "Positive" : newsSent < 0 ? "Negative" : "Neutral") : "N/A", score: newsScore });

  const total = clamp(factors.reduce((s, f) => s + f.score, 0), 0, 20);
  return { name: "Sentiment", score: total, factors };
}

// ── Main calculator ───────────────────────────────────────────
export function calculatePulseScore(data: StockPageData): PulseScore {
  const dimensions = [
    calcValue(data),
    calcGrowth(data),
    calcHealth(data),
    calcMomentum(data),
    calcSentiment(data),
  ];

  const total = clamp(dimensions.reduce((s, d) => s + d.score, 0), 0, 100);
  const grade = scoreToGrade(total);

  return { total, grade, dimensions };
}
