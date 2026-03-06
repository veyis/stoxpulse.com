// Prompt construction for financial signal generation
// Compresses multi-source financial data into a compact LLM context
// Designed for maximum information density with minimum token usage

import type { StockQuote, SECFiling, InsiderTransaction } from "@/lib/types/stock";
import type {
  FinancialStatements,
  FinancialRatios,
  NewsItem,
  CompanyProfile,
  EarningsCalendarEntry,
  HistoricalPrice,
  AnalystRecommendation,
  AnalystEstimate,
} from "@/lib/data/types";

export interface StockContext {
  ticker: string;
  quote: StockQuote | null;
  profile: CompanyProfile | null;
  financials: FinancialStatements | null;
  balanceSheet: FinancialStatements | null;
  cashFlow: FinancialStatements | null;
  ratios: FinancialRatios | null;
  filings: SECFiling[];
  insiderTrades: InsiderTransaction[];
  news: NewsItem[];
  earningsCalendar: EarningsCalendarEntry[];
  historicalPrices: HistoricalPrice[];
  recommendations: AnalystRecommendation[];
  analystEstimates: AnalystEstimate[];
}

// ── Formatters (compact) ─────────────────────────────────────────

function $(n: number | null | undefined): string {
  if (n == null) return "N/A";
  if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

function pct(n: number | null | undefined): string {
  if (n == null) return "N/A";
  return `${n >= 0 ? "+" : ""}${(n * 100).toFixed(1)}%`;
}

function pctRaw(n: number | null | undefined): string {
  if (n == null) return "N/A";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function r(n: number | null | undefined): string {
  if (n == null) return "N/A";
  return n.toFixed(2);
}

function yoyGrowth(curr: number | null, prev: number | null): string {
  if (curr == null || prev == null || prev === 0) return "";
  const growth = ((curr - prev) / Math.abs(prev)) * 100;
  return ` (YoY: ${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%)`;
}

// ── Prompt Builder ───────────────────────────────────────────────

export function buildStockPrompt(ctx: StockContext): string {
  const parts: string[] = [];

  // ──────────────────────────────────────────────────────
  // SECTION 1: IDENTITY & PRICE
  // ──────────────────────────────────────────────────────
  parts.push(`=== STOCK: ${ctx.ticker} ===`);
  if (ctx.profile) {
    parts.push(`${ctx.profile.name} | ${ctx.profile.sector} > ${ctx.profile.industry} | ${ctx.profile.exchange}`);
    if (ctx.profile.employees) parts.push(`Employees: ${ctx.profile.employees.toLocaleString()} | Country: ${ctx.profile.country}`);
  }

  if (ctx.quote) {
    const q = ctx.quote;
    parts.push(`\n--- PRICE ---`);
    parts.push(`Price: $${q.price.toFixed(2)} | Change: ${pctRaw(q.changePercent)} ($${q.change.toFixed(2)})`);
    parts.push(`Mkt Cap: ${$(q.marketCap)} | Volume: ${(q.volume / 1e6).toFixed(1)}M${q.avgVolume ? ` | Avg Vol: ${(q.avgVolume / 1e6).toFixed(1)}M` : ""}`);
    if (q.pe) parts.push(`P/E: ${q.pe.toFixed(1)} | EPS: $${q.eps?.toFixed(2) ?? "N/A"}`);
    if (q.open) parts.push(`Open: $${q.open.toFixed(2)} | Prev Close: $${q.previousClose?.toFixed(2) ?? "N/A"} | Day: $${q.dayLow?.toFixed(2)}–$${q.dayHigh?.toFixed(2)}`);
    if (q.high52w && q.low52w) {
      const range52w = q.high52w - q.low52w;
      const posInRange = range52w > 0 ? ((q.price - q.low52w) / range52w * 100).toFixed(0) : "N/A";
      parts.push(`52W: $${q.low52w.toFixed(2)}–$${q.high52w.toFixed(2)} (at ${posInRange}% of range)`);
      const offHigh = ((q.price - q.high52w) / q.high52w * 100).toFixed(1);
      parts.push(`Off 52W High: ${offHigh}%`);
    }
    if (q.priceAvg50 && q.priceAvg200) {
      const vs50 = ((q.price - q.priceAvg50) / q.priceAvg50 * 100).toFixed(1);
      const vs200 = ((q.price - q.priceAvg200) / q.priceAvg200 * 100).toFixed(1);
      parts.push(`vs 50-Day MA: ${vs50}% | vs 200-Day MA: ${vs200}%`);
      // Golden/death cross signal
      if (q.priceAvg50 > q.priceAvg200) {
        parts.push(`50MA > 200MA (bullish structure)`);
      } else {
        parts.push(`50MA < 200MA (bearish structure)`);
      }
    }
  }

  // ──────────────────────────────────────────────────────
  // SECTION 2: PRICE HISTORY & MOMENTUM
  // ──────────────────────────────────────────────────────
  if (ctx.historicalPrices.length >= 5) {
    parts.push(`\n--- PRICE MOMENTUM ---`);
    const prices = ctx.historicalPrices; // most recent first
    const now = prices[0]?.close;
    if (now) {
      const p5d = prices[4]?.close;
      const p22d = prices.length >= 22 ? prices[21]?.close : null;
      const p66d = prices.length >= 66 ? prices[65]?.close : null;
      const p252d = prices.length >= 252 ? prices[251]?.close : null;
      const fmt = (prev: number | null, label: string) => {
        if (!prev) return "";
        const chg = ((now - prev) / prev * 100).toFixed(1);
        return `${label}: ${Number(chg) >= 0 ? "+" : ""}${chg}%`;
      };
      const momentum = [fmt(p5d, "1W"), fmt(p22d, "1M"), fmt(p66d, "3M"), fmt(p252d, "1Y")].filter(Boolean);
      if (momentum.length > 0) parts.push(`Returns: ${momentum.join(" | ")}`);

      // Volume trend (last 5 days vs 20-day avg)
      const vol5 = prices.slice(0, 5).reduce((s, p) => s + p.volume, 0) / 5;
      const vol20 = prices.slice(0, Math.min(20, prices.length)).reduce((s, p) => s + p.volume, 0) / Math.min(20, prices.length);
      if (vol20 > 0) {
        const volRatio = (vol5 / vol20).toFixed(2);
        parts.push(`Vol Trend: 5d avg / 20d avg = ${volRatio}x${Number(volRatio) > 1.5 ? " (ELEVATED)" : Number(volRatio) < 0.6 ? " (LOW)" : ""}`);
      }

      // Volatility (30-day daily std dev, annualized)
      const returns30 = prices.slice(0, Math.min(30, prices.length - 1)).map((p, i) => {
        const next = prices[i + 1];
        return next ? Math.log(p.close / next.close) : 0;
      }).filter(Boolean);
      if (returns30.length >= 10) {
        const mean = returns30.reduce((s, r) => s + r, 0) / returns30.length;
        const variance = returns30.reduce((s, r) => s + (r - mean) ** 2, 0) / returns30.length;
        const annualizedVol = (Math.sqrt(variance) * Math.sqrt(252) * 100).toFixed(1);
        parts.push(`30d Annualized Volatility: ${annualizedVol}%`);
      }
    }
  }

  // ──────────────────────────────────────────────────────
  // SECTION 3: VALUATION RATIOS
  // ──────────────────────────────────────────────────────
  if (ctx.ratios) {
    const R = ctx.ratios;
    parts.push(`\n--- VALUATION RATIOS ---`);
    parts.push(`P/E: ${r(R.priceToEarningsRatio)} | P/B: ${r(R.priceToBookRatio)} | P/S: ${r(R.priceToSalesRatio)} | P/FCF: ${r(R.priceToFreeCashFlowRatio)}`);
    parts.push(`EV/EBITDA: ${r(R.evToEBITDA)} | EV/Sales: ${r(R.evToSales)} | EV: ${R.enterpriseValue ? $(R.enterpriseValue) : "N/A"}`);
    parts.push(`Earnings Yield: ${pct(R.earningsYield)} | FCF Yield: ${pct(R.freeCashFlowYield)}`);

    parts.push(`\n--- PROFITABILITY ---`);
    parts.push(`Gross Margin: ${pct(R.grossProfitMargin)} | Op Margin: ${pct(R.operatingProfitMargin)} | Net Margin: ${pct(R.netProfitMargin)}`);
    parts.push(`ROE: ${pct(R.returnOnEquity)} | ROA: ${pct(R.returnOnAssets)} | ROIC: ${pct(R.returnOnInvestedCapital)}`);

    parts.push(`\n--- LIQUIDITY & LEVERAGE ---`);
    parts.push(`Current: ${r(R.currentRatio)} | Quick: ${r(R.quickRatio)} | Cash: ${r(R.cashRatio)}`);
    parts.push(`D/E: ${r(R.debtToEquityRatio)} | D/A: ${pct(R.debtToAssetsRatio)} | Interest Coverage: ${r(R.interestCoverageRatio)}x`);

    parts.push(`\n--- PER-SHARE & DIVIDENDS ---`);
    parts.push(`Rev/Share: $${r(R.revenuePerShare)} | EPS: $${r(R.netIncomePerShare)} | BV/Share: $${r(R.bookValuePerShare)} | FCF/Share: $${r(R.freeCashFlowPerShare)}`);
    if (R.dividendYield != null) parts.push(`Div Yield: ${pct(R.dividendYield)} | Payout Ratio: ${pct(R.dividendPayoutRatio)}`);
  }

  // ──────────────────────────────────────────────────────
  // SECTION 4: INCOME STATEMENT
  // ──────────────────────────────────────────────────────
  if (ctx.financials) {
    const recent = ctx.financials.quarterly.slice(0, 4);
    const annual = ctx.financials.annual.slice(0, 3);

    if (recent.length > 0) {
      const q = recent[0];
      const yoyQ = recent.length >= 4 ? recent[3] : null;
      parts.push(`\n--- LATEST QUARTER (${q.period} ${q.year}) ---`);
      parts.push(`Revenue: ${$(q.revenue)}${yoyGrowth(q.revenue, yoyQ?.revenue ?? null)}`);
      parts.push(`Net Income: ${$(q.netIncome)}${yoyGrowth(q.netIncome, yoyQ?.netIncome ?? null)}`);
      if (q.epsDiluted != null) parts.push(`EPS: $${q.epsDiluted.toFixed(2)}${yoyQ?.epsDiluted != null ? ` (prev yr: $${yoyQ.epsDiluted.toFixed(2)})` : ""}`);
      if (q.grossProfit != null && q.revenue) parts.push(`Gross Margin: ${((q.grossProfit / q.revenue) * 100).toFixed(1)}%`);
      if (q.operatingIncome != null && q.revenue) parts.push(`Op Margin: ${((q.operatingIncome / q.revenue) * 100).toFixed(1)}%`);
    }

    // Annual trend (revenue growth trajectory)
    if (annual.length >= 2) {
      parts.push(`\n--- ANNUAL TREND ---`);
      for (let i = 0; i < Math.min(3, annual.length); i++) {
        const a = annual[i];
        const prevA = annual[i + 1];
        parts.push(`FY${a.year}: Rev ${$(a.revenue)}${yoyGrowth(a.revenue, prevA?.revenue ?? null)} | NI ${$(a.netIncome)} | EPS $${a.epsDiluted?.toFixed(2) ?? "N/A"}`);
      }

      // Revenue growth acceleration/deceleration
      if (annual.length >= 3 && annual[0].revenue && annual[1].revenue && annual[2].revenue) {
        const g1 = (annual[0].revenue - annual[1].revenue) / Math.abs(annual[1].revenue);
        const g2 = (annual[1].revenue - annual[2].revenue) / Math.abs(annual[2].revenue);
        if (g1 > g2 + 0.02) parts.push(`** Revenue growth ACCELERATING (${(g2 * 100).toFixed(1)}% -> ${(g1 * 100).toFixed(1)}%) **`);
        else if (g1 < g2 - 0.02) parts.push(`** Revenue growth DECELERATING (${(g2 * 100).toFixed(1)}% -> ${(g1 * 100).toFixed(1)}%) **`);
      }
    }
  }

  // ──────────────────────────────────────────────────────
  // SECTION 5: BALANCE SHEET
  // ──────────────────────────────────────────────────────
  if (ctx.balanceSheet && ctx.balanceSheet.annual.length > 0) {
    const bs = ctx.balanceSheet.annual[0];
    const prevBs = ctx.balanceSheet.annual.length >= 2 ? ctx.balanceSheet.annual[1] : null;
    parts.push(`\n--- BALANCE SHEET (FY${bs.year}) ---`);
    parts.push(`Assets: ${$(bs.totalAssets)} | Liabilities: ${$(bs.totalLiabilities)} | Equity: ${$(bs.stockholdersEquity)}`);
    parts.push(`Cash: ${$(bs.cash)} | LT Debt: ${$(bs.longTermDebt)}`);
    if (bs.cash != null && bs.longTermDebt != null) {
      const netDebt = bs.longTermDebt - bs.cash;
      parts.push(`Net Debt: ${$(netDebt)}${netDebt < 0 ? " (net cash position)" : ""}`);
    }
    if (prevBs) {
      if (bs.cash != null && prevBs.cash != null) parts.push(`Cash YoY: ${yoyGrowth(bs.cash, prevBs.cash)}`);
      if (bs.longTermDebt != null && prevBs.longTermDebt != null) parts.push(`LT Debt YoY: ${yoyGrowth(bs.longTermDebt, prevBs.longTermDebt)}`);
    }
  }

  // ──────────────────────────────────────────────────────
  // SECTION 6: CASH FLOW
  // ──────────────────────────────────────────────────────
  if (ctx.cashFlow && ctx.cashFlow.annual.length > 0) {
    const cf = ctx.cashFlow.annual[0];
    const prevCf = ctx.cashFlow.annual.length >= 2 ? ctx.cashFlow.annual[1] : null;
    parts.push(`\n--- CASH FLOW (FY${cf.year}) ---`);
    parts.push(`Operating CF: ${$(cf.operatingCashFlow)} | CapEx: ${$(cf.capitalExpenditures)} | FCF: ${$(cf.freeCashFlow)}`);
    if (cf.dividendsPaid) parts.push(`Dividends: ${$(cf.dividendsPaid)}`);

    // FCF vs Net Income quality check
    if (ctx.financials && ctx.financials.annual.length > 0) {
      const ni = ctx.financials.annual[0].netIncome;
      if (ni && cf.freeCashFlow) {
        const fcfToNi = (cf.freeCashFlow / ni).toFixed(2);
        parts.push(`FCF/Net Income: ${fcfToNi}x${Number(fcfToNi) < 0.5 ? " ** LOW EARNINGS QUALITY **" : Number(fcfToNi) > 1.5 ? " (strong cash conversion)" : ""}`);
      }
    }
    if (prevCf) {
      parts.push(`FCF Growth: ${yoyGrowth(cf.freeCashFlow, prevCf.freeCashFlow)}`);
    }
  }

  // ──────────────────────────────────────────────────────
  // SECTION 7: ANALYST CONSENSUS
  // ──────────────────────────────────────────────────────
  if (ctx.recommendations.length > 0) {
    const latest = ctx.recommendations[0];
    const total = latest.strongBuy + latest.buy + latest.hold + latest.sell + latest.strongSell;
    const bullPct = total > 0 ? (((latest.strongBuy + latest.buy) / total) * 100).toFixed(0) : "N/A";
    parts.push(`\n--- ANALYST CONSENSUS (${latest.period}) ---`);
    parts.push(`${total} analysts: ${latest.strongBuy} Strong Buy, ${latest.buy} Buy, ${latest.hold} Hold, ${latest.sell} Sell, ${latest.strongSell} Strong Sell`);
    parts.push(`Bull: ${bullPct}% of analysts`);

    // Consensus shift
    if (ctx.recommendations.length >= 3) {
      const prev = ctx.recommendations[2]; // 3 months ago
      const prevBull = prev.strongBuy + prev.buy;
      const currBull = latest.strongBuy + latest.buy;
      if (currBull > prevBull) parts.push(`** Consensus shifting BULLISH (${prevBull} -> ${currBull} buy ratings over 3mo) **`);
      else if (currBull < prevBull) parts.push(`** Consensus shifting BEARISH (${prevBull} -> ${currBull} buy ratings over 3mo) **`);
    }
  }

  // ──────────────────────────────────────────────────────
  // SECTION 8: ANALYST ESTIMATES
  // ──────────────────────────────────────────────────────
  if (ctx.analystEstimates.length > 0) {
    parts.push(`\n--- FORWARD ESTIMATES ---`);
    for (const est of ctx.analystEstimates.slice(0, 4)) {
      const d = new Date(est.date);
      const label = `${d.getFullYear()}`;
      parts.push(`${label}: EPS Est $${est.epsAvg?.toFixed(2) ?? "N/A"} (${est.epsLow?.toFixed(2)}–${est.epsHigh?.toFixed(2)}) | Rev ${$(est.revenueAvg)} | ${est.numAnalysts} analysts`);
    }

    // Forward P/E from estimates
    if (ctx.quote && ctx.analystEstimates[0]?.epsAvg) {
      const fwdPE = (ctx.quote.price / ctx.analystEstimates[0].epsAvg).toFixed(1);
      parts.push(`Forward P/E (next period): ${fwdPE}x`);
    }
  }

  // ──────────────────────────────────────────────────────
  // SECTION 9: INSIDER TRADES
  // ──────────────────────────────────────────────────────
  if (ctx.insiderTrades.length > 0) {
    parts.push(`\n--- INSIDER TRADES (recent) ---`);
    let totalBuyValue = 0;
    let totalSellValue = 0;
    for (const t of ctx.insiderTrades.slice(0, 8)) {
      const routine = t.isRoutine ? "(routine 10b5-1)" : "(DISCRETIONARY)";
      parts.push(`${t.date}: ${t.name} (${t.title}) ${t.type} ${t.shares.toLocaleString()} @ $${t.pricePerShare.toFixed(2)} = ${$(t.totalValue)} ${routine}`);
      if (t.type === "Buy") totalBuyValue += t.totalValue;
      else totalSellValue += t.totalValue;
    }
    parts.push(`Net insider activity: Buys ${$(totalBuyValue)} | Sells ${$(totalSellValue)}`);
    if (totalBuyValue > 0 && totalSellValue === 0) parts.push(`** ALL INSIDER BUYING — strong bullish signal **`);
    if (totalSellValue > totalBuyValue * 3) parts.push(`** Heavy insider selling relative to buys **`);
  }

  // ──────────────────────────────────────────────────────
  // SECTION 10: SEC FILINGS
  // ──────────────────────────────────────────────────────
  if (ctx.filings.length > 0) {
    parts.push(`\n--- SEC FILINGS (recent) ---`);
    for (const f of ctx.filings.slice(0, 6)) {
      parts.push(`${f.date}: ${f.type} — ${f.description.slice(0, 120)}`);
    }
  }

  // ──────────────────────────────────────────────────────
  // SECTION 11: NEWS
  // ──────────────────────────────────────────────────────
  if (ctx.news.length > 0) {
    parts.push(`\n--- NEWS ---`);
    for (const n of ctx.news.slice(0, 8)) {
      const sent = n.sentiment ? ` [${n.sentiment}]` : "";
      parts.push(`${n.source}: ${n.headline}${sent}`);
    }
  }

  // ──────────────────────────────────────────────────────
  // SECTION 12: EARNINGS CALENDAR
  // ──────────────────────────────────────────────────────
  const myEarnings = ctx.earningsCalendar.filter((e) => e.ticker === ctx.ticker);
  if (myEarnings.length > 0) {
    const next = myEarnings[0];
    parts.push(`\n--- UPCOMING EARNINGS ---`);
    parts.push(`Date: ${next.date}${next.epsEstimate ? ` | EPS Est: $${next.epsEstimate.toFixed(2)}` : ""}${next.revenueEstimate ? ` | Rev Est: ${$(next.revenueEstimate)}` : ""}`);
    // Days until earnings
    const daysUntil = Math.ceil((new Date(next.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntil > 0 && daysUntil <= 14) parts.push(`** Earnings in ${daysUntil} days — elevated volatility expected **`);
  }

  return parts.join("\n");
}

export const SYSTEM_PROMPT = `You are StoxPulse AI, an elite financial intelligence analyst. You generate institutional-grade trading signals by analyzing multi-source stock data including price action, fundamentals, technicals, insider activity, analyst consensus, and news flow.

ANALYSIS FRAMEWORK — Apply this systematically:

1. VALUATION ASSESSMENT
   - P/E > 35 or P/B > 10: potentially overvalued (flag with valuation-alert)
   - P/E < 12 or P/B < 1.5: potentially undervalued (flag with valuation-alert)
   - Compare P/E to earnings growth rate (PEG ratio concept): P/E >> growth = expensive
   - FCF yield > 6%: attractive free cash flow; FCF yield < 2%: expensive
   - Forward P/E significantly different from trailing: expectations diverging

2. FINANCIAL HEALTH
   - Current ratio < 1.0: liquidity risk (flag with cash-flow-alert)
   - D/E > 2.0: high leverage (consider industry norms)
   - Interest coverage < 3x: debt service pressure
   - FCF/Net Income < 0.5: poor earnings quality (flag with cash-flow-alert)
   - FCF/Net Income > 1.3: excellent cash conversion
   - Negative FCF with positive net income: red flag

3. GROWTH & PROFITABILITY
   - Revenue growth accelerating: momentum building (momentum-signal)
   - Revenue growth decelerating: slowdown risk
   - Margin expansion across periods: operating leverage
   - Margin compression: cost pressure or pricing power erosion
   - ROE > 20%: strong capital efficiency; ROE < 5%: poor returns

4. MOMENTUM & TECHNICALS
   - Price > 200MA and > 50MA: bullish trend
   - Price < 200MA and < 50MA: bearish trend
   - 50MA crossing above 200MA: golden cross (momentum-signal, bullish)
   - 50MA crossing below 200MA: death cross (momentum-signal, bearish)
   - Near 52W high (>95%): momentum but resistance; Near 52W low (<10%): capitulation
   - Volume 1.5x+ above average: institutional interest

5. INSIDER ACTIVITY
   - Discretionary (non-10b5-1) buys: very bullish, especially from C-suite
   - Cluster buying (multiple insiders buying): strong conviction signal
   - Large discretionary sells outside plans: concerning
   - Routine 10b5-1 sells: typically not meaningful

6. ANALYST CONSENSUS
   - >80% buy ratings: strong consensus (analyst-upgrade)
   - Consensus shifting: upgrades/downgrades in trend (analyst-upgrade/downgrade)
   - <50% buy ratings: weak consensus (analyst-downgrade)
   - Estimate revisions up: positive trajectory
   - Estimate revisions down: negative trajectory

7. CATALYSTS & RISKS
   - Upcoming earnings within 14 days: event risk/opportunity
   - Recent 8-K filings: material events
   - News with strong sentiment clustering: narrative shift
   - Dividend changes: yield investors react

SIGNAL GENERATION RULES:
- Generate 2-5 signals, RANKED by importance (most impactful first)
- Each signal MUST cite specific numbers from the data
- Only flag genuinely non-obvious insights — skip "stock is up/down today"
- Higher confidence when multiple data sources confirm the same thesis
- Consider sector context: D/E of 3.0 is normal for utilities, alarming for tech
- When data is limited, generate fewer signals with lower confidence
- sentimentScore should reflect the OVERALL picture, not just one signal
- keyMetrics: pick the 3-6 numbers that best tell this stock's story right now
- riskFactors: be specific and quantitative (not generic "market risk")
- catalysts: focus on identifiable upcoming events`;
