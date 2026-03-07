# StoxPulse API Audit & Data Strategy

> Date: March 7, 2026
> Status: Comprehensive audit of all API providers, endpoints, gaps, and recommendations

---

## Table of Contents

1. [Current API Inventory](#1-current-api-inventory)
2. [Endpoint-by-Endpoint Audit](#2-endpoint-by-endpoint-audit)
3. [What We Use vs What's Available](#3-what-we-use-vs-whats-available)
4. [Critical Plan Mismatch Issues](#4-critical-plan-mismatch-issues)
5. [Data Coverage Gap Analysis](#5-data-coverage-gap-analysis)
6. [UI Components: Real Data vs Fake/Missing](#6-ui-components-real-data-vs-fakemissing)
7. [Product Vision vs Current API Capability](#7-product-vision-vs-current-api-capability)
8. [Cost Analysis & Optimization](#8-cost-analysis--optimization)
9. [Recommendations](#9-recommendations)
10. [Action Plan](#10-action-plan)

---

## 1. Current API Inventory

| Provider | Plan | Monthly Cost | API Key Env Var | Status |
|----------|------|-------------|-----------------|--------|
| **FMP** (Financial Modeling Prep) | Starter | $22/mo | `FMP_API_KEY` | Active |
| **Finnhub** | Free | $0/mo | `FINNHUB_API_KEY` | Active |
| **SEC EDGAR** | Free (no key) | $0/mo | N/A | Active |
| **API Ninjas** | Developer (?) | ~$14/mo | `API_NINJAS_API_KEY` | Active but limited |
| **Google Gemini** | Free | $0/mo | `GEMINI_API_KEY` | Active |
| **Google Analytics** | Free | $0/mo | `NEXT_PUBLIC_GA_ID` | Not configured |

**Current total: ~$36/mo**

---

## 2. Endpoint-by-Endpoint Audit

### FMP Endpoints Currently Called

| Endpoint | Used In | Data Returned | Works on Starter? |
|----------|---------|---------------|-------------------|
| `/stable/quote` | `fmp.ts`, commodity routes, dashboard | Price, change, volume, marketCap, 52w, MAs | YES |
| `/stable/profile` | `fmp.ts` | Company info, sector, CEO, employees, etc. | YES |
| `/stable/income-statement` | `fmp.ts` | Revenue, net income, EPS (annual + quarterly) | YES |
| `/stable/balance-sheet-statement` | `fmp.ts` | Assets, liabilities, equity, cash, debt | YES |
| `/stable/cash-flow-statement` | `fmp.ts` | Operating CF, CapEx, FCF, dividends | YES |
| `/stable/ratios` | `fmp.ts` | 30+ financial ratios (margins, P/E, D/E, etc.) | YES |
| `/stable/key-metrics` | `fmp.ts` | EV, EV/EBITDA, EV/Sales | YES |
| `/stable/stock-news` | `fmp.ts` | Headlines, text, source, image | YES |
| `/stable/historical-price-eod/full` | `fmp.ts`, commodity-quote | Daily OHLCV (365 days for stocks, 1400 for commodities) | YES |
| `/stable/analyst-estimates` | `fmp.ts` | Forward EPS/revenue estimates | YES |
| `/stable/earnings-calendar` | `fmp.ts` | Upcoming earnings dates, EPS/rev estimates | YES |
| `/stable/technical-indicators/rsi` | commodity-technicals | RSI 14 (daily + 4h) | **NO - Premium+** |
| `/stable/technical-indicators/sma` | commodity-technicals | SMA 20/50/200 | **NO - Premium+** |
| `/stable/technical-indicators/ema` | commodity-technicals | EMA 9/21/50 | **NO - Premium+** |
| `/stable/historical-chart/1hour` | commodity-intraday | 1h OHLCV candles (~78 days) | **NO - Premium+** |
| `/stable/news/stock` | commodity-technicals | Commodity-specific news | YES |
| `/stable/economic-calendar` | commodity-context | Economic events (CPI, FOMC, etc.) | YES (likely) |

### Finnhub Endpoints Currently Called

| Endpoint | Used In | Data Returned | Free Tier? |
|----------|---------|---------------|------------|
| `/api/v1/quote` | `finnhub.ts` | Current price, change, open, prev close | YES |
| `/api/v1/stock/profile2` | `finnhub.ts` | Name, industry, logo, market cap, IPO date | YES |
| `/api/v1/company-news` | `finnhub.ts` | Headlines, summaries, source, URL (7-day window) | YES |
| `/api/v1/stock/recommendation` | `finnhub.ts` | Buy/hold/sell consensus (12 months) | YES |
| `/api/v1/calendar/earnings` | `finnhub.ts` | Earnings dates, EPS/rev estimates, hour | YES |

### SEC EDGAR Endpoints Currently Called

| Endpoint | Used In | Data Returned | Free? |
|----------|---------|---------------|-------|
| `data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json` | `edgar.ts` | All XBRL financial data (income, BS, CF) | YES |
| `data.sec.gov/submissions/CIK{cik}.json` | `edgar.ts` | Filing history (10-K, 10-Q, 8-K, Form 4) | YES |
| `sec.gov/files/company_tickers.json` | `edgar.ts` | Ticker-to-CIK mapping | YES |

### API Ninjas Endpoints Currently Called

| Endpoint | Used In | Data Returned | Works on Current Plan? |
|----------|---------|---------------|----------------------|
| `/v1/earningstranscript` | `api-ninjas.ts` | Full transcript, participants, summary, sentiment | **UNKNOWN - Needs premium** |

### Google Gemini Usage

| Model | Used In | Purpose | Free Tier Limits |
|-------|---------|---------|-----------------|
| `gemini-2.5-flash` | `lib/ai/gemini.ts` | AI signal generation from 12 data sources | 10 RPM, 250 RPD |

---

## 3. What We Use vs What's Available

### FMP: Available on Starter But NOT Used

These endpoints are available on our current $22/mo plan but we haven't integrated them:

| Endpoint | What It Provides | Value for StoxPulse |
|----------|-----------------|---------------------|
| `/stable/stock-screener` | Filter stocks by 50+ criteria | HIGH - Screener feature |
| `/stable/price-target-summary` | Analyst price targets (avg, high, low) | HIGH - Missing from stock pages |
| `/stable/analyst-stock-recommendations` | Individual analyst ratings & grades | HIGH - More detail than Finnhub |
| `/stable/upgrades-downgrades` | Real-time analyst upgrades/downgrades | HIGH - Signal generation |
| `/stable/dividend-calendar` | Upcoming dividend dates & amounts | MEDIUM - Dividend investors |
| `/stable/stock-split-calendar` | Upcoming stock splits | MEDIUM |
| `/stable/ipo-calendar` | Upcoming IPO dates | MEDIUM |
| `/stable/institutional-holders` | Top institutional holders | MEDIUM - Ownership tab |
| `/stable/mutual-fund-holders` | Top mutual fund holders | MEDIUM - Ownership tab |
| `/stable/insider-trading` | Insider buy/sell with $ amounts | HIGH - Better than EDGAR parsing |
| `/stable/stock-peers` | Related/peer companies | MEDIUM - Related stocks |
| `/stable/earnings-surprises` | Historical EPS beat/miss | HIGH - Earnings track record |
| `/stable/grade` | Analyst grades/ratings changes | MEDIUM |
| `/stable/financial-growth` | Revenue/EPS growth rates | MEDIUM |
| `/stable/discounted-cash-flow` | DCF fair value estimate | MEDIUM - Valuation feature |
| `/stable/sector-performance` | Sector ETF performance | LOW - Already have |
| `/stable/market-biggest-gainers` | Top gainers/losers | LOW - Dashboard |
| `/stable/market-biggest-losers` | Top losers | LOW |
| `/stable/market-most-active` | Most active stocks | LOW |
| `/stable/social-sentiment` | Social media sentiment | MEDIUM - Alternative data |

### FMP: NOT Available on Starter (Need Upgrade)

| Endpoint | Required Plan | What It Provides | Priority |
|----------|--------------|-----------------|----------|
| `/stable/technical-indicators/*` | Premium ($59/mo) | RSI, SMA, EMA, MACD, etc. | **CRITICAL** - Currently broken on commodity pages |
| `/stable/historical-chart/{timeframe}` | Premium ($59/mo) | Intraday charts (1min-4hr) | **CRITICAL** - Currently broken on commodity pages |
| `/stable/earning-call-transcript` | Ultimate ($149/mo) | Full earnings transcripts | HIGH - Core product feature |
| `/stable/etf-holder` | Ultimate ($149/mo) | ETF holdings data | LOW |
| `/stable/institutional-holders-13f` | Ultimate ($149/mo) | 13F institutional holdings | LOW |
| WebSocket streaming | Ultimate ($149/mo) | Real-time price updates | MEDIUM |
| 1-minute intraday | Ultimate ($149/mo) | Tick-level data | LOW |
| Bulk/batch delivery | Ultimate ($149/mo) | Mass data download | LOW |
| Global markets (non-US) | Ultimate ($149/mo) | International stocks | LOW for now |

### Finnhub: Available Free But NOT Used

| Endpoint | What It Provides | Value |
|----------|-----------------|-------|
| `/api/v1/stock/candle` | OHLCV historical candles | MEDIUM - Alternative to FMP |
| `/api/v1/stock/metric` | Basic financials (52w, beta, 10/13/26/52 week returns) | LOW - Already have from FMP |
| `/api/v1/stock/insider-transactions` | Insider transactions (premium only) | N/A |
| `/api/v1/stock/insider-sentiment` | Insider sentiment MSPR score | PAID only |
| `/api/v1/scan/support-resistance` | Support/resistance levels | PAID only |
| `/api/v1/stock/social-sentiment` | Reddit/Twitter mentions | PAID only |
| `/api/v1/press-releases` | Company press releases | YES (free) |
| `/api/v1/stock/peers` | Related companies | YES (free) |
| `/api/v1/calendar/ipo` | IPO calendar | YES (free) |
| `/api/v1/stock/dividend` | Dividend history (2yr) | YES (free) |
| `/api/v1/stock/revenue-breakdown` | Revenue by segment/geography | PAID only |

### EDGAR: Available Free But NOT Used

| Data Source | What It Provides | Value |
|-------------|-----------------|-------|
| `efts.sec.gov/LATEST/search-index` | Full-text search across all filings | HIGH - Filing content search |
| `data.sec.gov/api/xbrl/frames` | Screen one metric across ALL companies | HIGH - Screener data |
| Form 4 XML parsing | Actual insider trade details (shares, price, type) | HIGH - Currently returns zeros |
| RSS feeds (`sec.gov/cgi-bin/browse-edgar?action=getcompany&type=4&dateb=&owner=include&count=40&search_text=&action=getcompany&company=&CIK=AAPL&type=4&dateb=&owner=include&count=40&search_text=&output=atom`) | Real-time new filing notifications | MEDIUM - Filing alerts |
| `companyfacts.zip` bulk download | All company financial data in one file | MEDIUM - Initial data load |
| Form 13F filings | Institutional holdings (free from EDGAR) | MEDIUM - No need for FMP Ultimate |

---

## 4. Critical Plan Mismatch Issues

These are endpoints we're **actively calling** that likely **fail silently** on our Starter plan:

### Issue 1: Technical Indicators (BROKEN)

**Files affected:**
- `app/api/commodity-technicals/route.ts` (lines 54-65)

**Endpoints called:**
- `/stable/technical-indicators/rsi` (2 calls: daily + 4h)
- `/stable/technical-indicators/sma` (3 calls: 20/50/200)
- `/stable/technical-indicators/ema` (3 calls: 9/21/50)

**Required plan:** Premium ($59/mo)
**Current plan:** Starter ($22/mo)

**Impact:** 8 out of 10 parallel API calls in the commodity technicals route are likely returning 402/403 errors. The code handles this gracefully (returns empty data), but the entire technical analysis section on gold/silver pages is **showing incomplete or no data**.

### Issue 2: Intraday Charts (BROKEN)

**File affected:**
- `app/api/commodity-intraday/route.ts` (line 19)

**Endpoint called:**
- `/stable/historical-chart/1hour`

**Required plan:** Premium ($59/mo)
**Impact:** The interactive chart's intraday timeframes (1D, 1W) on commodity pages show **no data**.

### Issue 3: Earnings Transcripts (NOT WORKING)

**File affected:**
- `lib/data/providers/api-ninjas.ts` (line 63)

**Endpoint called:**
- `/v1/earningstranscript`

**Issue:** API Ninjas earnings transcript endpoint likely requires their premium plan. The `API_NINJAS_API_KEY` is set, but the endpoint may return 403.

**Impact:** Earnings transcript feature — the core differentiator per the product plan — is completely non-functional.

---

## 5. Data Coverage Gap Analysis

### What a "Great Stock Intelligence App" Needs vs What We Have

| Data Category | Need | Have | Source | Gap |
|---------------|------|------|--------|-----|
| **Real-time quotes** | YES | Delayed 15min | FMP/Finnhub | Need WebSocket for real-time |
| **Historical prices (EOD)** | YES | YES (365 days) | FMP | Could extend to 5yr (available on Starter) |
| **Intraday prices** | YES | NO (broken) | FMP Premium needed | **GAP** |
| **Company profiles** | YES | YES | FMP + Finnhub | OK |
| **Income statement** | YES | YES (10yr annual, 20 quarterly) | FMP + EDGAR | OK |
| **Balance sheet** | YES | YES | FMP | OK |
| **Cash flow** | YES | YES | FMP | OK |
| **Financial ratios** | YES | YES (30+ ratios) | FMP | OK |
| **SEC filings list** | YES | YES | EDGAR | OK |
| **SEC filing CONTENT** | YES | NO | EDGAR full-text search exists | **GAP** |
| **Insider trades (detailed)** | YES | PARTIAL (metadata only, no $ amounts) | EDGAR | **GAP** - Need XML parsing or FMP |
| **Insider trades (parsed)** | YES | NO | FMP `/insider-trading` (available on Starter!) | **GAP** - Not integrated |
| **News** | YES | YES | FMP + Finnhub | OK |
| **News sentiment** | Ideal | NO | Not provided by either API | **GAP** |
| **Earnings calendar** | YES | YES | FMP + Finnhub | OK |
| **Earnings transcripts** | CORE | NO (broken) | API Ninjas (needs premium) or FMP Ultimate | **CRITICAL GAP** |
| **Analyst recommendations** | YES | YES (buy/hold/sell counts) | Finnhub | OK |
| **Analyst price targets** | YES | NO | FMP `/price-target-summary` (Starter!) | **GAP** - Not integrated |
| **Analyst upgrades/downgrades** | YES | NO | FMP `/upgrades-downgrades` (Starter!) | **GAP** - Not integrated |
| **Analyst estimates** | YES | YES (forward EPS/revenue) | FMP | OK |
| **Earnings surprises** | YES | NO | FMP `/earnings-surprises` (Starter!) | **GAP** - Not integrated |
| **Technical indicators** | YES | NO (broken on Starter) | FMP Premium needed | **GAP** |
| **Dividend data** | YES | PARTIAL (yield only in ratios) | Finnhub free has dividend history | **GAP** - Not integrated |
| **IPO calendar** | Nice | NO | Finnhub free + FMP Starter | **GAP** - Not integrated |
| **Stock screener** | YES | NO | FMP `/stock-screener` (Starter!) | **GAP** - Not integrated |
| **Peer companies** | YES | NO | FMP `/stock-peers` (Starter!) or Finnhub | **GAP** - Not integrated |
| **DCF valuation** | Nice | NO | FMP `/discounted-cash-flow` (Starter!) | **GAP** - Not integrated |
| **Institutional holders** | YES | NO | FMP (Starter: basic) / EDGAR 13F (free) | **GAP** |
| **Social sentiment** | Nice | NO | FMP `/social-sentiment` (Starter?) | **GAP** |
| **Short interest** | Nice | NO | Not available from any current provider | **GAP** |
| **Options data** | Nice | NO | Not available (need Polygon/Tradier) | Not priority |
| **Economic indicators** | Partial | YES (commodity pages only) | FMP economic calendar | Partial |
| **AI analysis** | CORE | YES | Gemini 2.5 Flash (free tier) | Rate-limited |
| **Real-time alerts** | YES | NO | Need push infrastructure | **GAP** |
| **WebSocket streaming** | Nice | NO | Need Polygon ($79/mo) or FMP Ultimate | **GAP** |

### Summary: 15 gaps identified, 3 critical

---

## 6. UI Components: Real Data vs Fake/Missing

### Stock Pages (`/stocks/[ticker]`)

| Component | File | Data Source | Real or Fake? |
|-----------|------|-------------|---------------|
| Stock price & change | `stock-header.tsx` | FMP quote API | **REAL** |
| 52-week range bar | `fifty-two-week-bar.tsx` | FMP quote API | **REAL** |
| Key stats grid | `key-stats.tsx` | FMP quote + ratios | **REAL** |
| Income statement table | `financials-table.tsx` | FMP + EDGAR | **REAL** |
| AI insight card | `ai-insight-card.tsx` | Gemini AI | **REAL** (rate-limited) |
| Signal badges | `signal-badge.tsx` | Gemini AI | **REAL** |
| SEC filings list | `filings-list.tsx` | EDGAR | **REAL** |
| Insider trades table | `insider-table.tsx` | EDGAR | **PARTIAL** - shows dates but $0 values |
| News feed | `news-list.tsx` | FMP + Finnhub | **REAL** |
| Sparkline chart | `spark-line.tsx` | Historical prices | **REAL** |

### Dashboard (`/dashboard`)

| Component | File | Data Source | Real or Fake? |
|-----------|------|-------------|---------------|
| Market indices (SPY/QQQ/DIA/TLT/GLD/SLV) | `market-pulse.tsx` | FMP quotes | **REAL** |
| Index sparklines | `market-pulse.tsx` | `generateSparkData()` | **FAKE** - Synthetic from price/change, not real historical |
| Watchlist table | `live-watchlist.tsx` | FMP quotes | **REAL** |
| Watchlist sparklines | `live-watchlist.tsx` | `generateSparkData()` | **FAKE** - Same synthetic function |
| Signal feed | `signal-feed.tsx` | Gemini AI | **REAL** (rate-limited to 4 stocks) |
| Earnings calendar | `earnings-calendar-card.tsx` | FMP/Finnhub | **REAL** |
| News feed | `news-feed-card.tsx` | FMP + Finnhub | **REAL** |

### Commodity Pages (`/stocks/xauusd`, `/stocks/xagusd`)

| Feature | Data Source | Real or Fake? |
|---------|-------------|---------------|
| Live price + flash animation | FMP quote (polls 30s) | **REAL** |
| Day/52W range bars | FMP quote | **REAL** |
| Per-gram/kg pricing | Calculated from quote | **REAL** |
| AI Summary + Buy/Sell/Hold | Client-side calculated | **CALCULATED** (not AI) |
| RSI gauges (daily + 4h) | FMP technical indicators | **LIKELY BROKEN** (Premium required) |
| SMA/EMA table (6 MAs) | FMP technical indicators | **LIKELY BROKEN** (Premium required) |
| Bollinger bands | Calculated from SMA/prices | **LIKELY BROKEN** (depends on SMA) |
| MACD indicator | Client-side calculated from prices | **CALCULATED** |
| Stochastic oscillator | Client-side calculated from prices | **CALCULATED** |
| Fibonacci retracement | Calculated from 52W high/low | **REAL** |
| Pivot points | Calculated from OHLC | **REAL** |
| Interactive chart (EOD) | FMP historical-price-eod | **REAL** |
| Interactive chart (intraday) | FMP historical-chart/1hour | **LIKELY BROKEN** (Premium required) |
| Gold/silver calculator | Pure math | **REAL** |
| Position sizer | Pure math | **REAL** |
| Trade planner | Pure math | **REAL** |
| Performance heatmap | Calculated from historical | **REAL** |
| Drawdown analysis | Calculated from historical | **REAL** |
| Currency conversions | FMP FX quotes | **REAL** |
| VIX/SPY context | FMP quotes | **REAL** |
| Economic calendar | FMP economic-calendar | **REAL** |
| Seasonal pattern | Calculated from 5yr history | **REAL** |
| News | FMP stock news | **REAL** |

---

## 7. Product Vision vs Current API Capability

From `docs/04-stoxpulse-product-plan.md`, here's what the product envisions vs what we can deliver:

### Core Differentiator Features

| Feature | Product Plan Says | Current Status | Blocker |
|---------|------------------|----------------|---------|
| "Reads earnings calls" | Core pitch | **NOT WORKING** | No transcript API access |
| "Reads SEC filings" | Core pitch | **PARTIAL** - Lists filings, doesn't analyze content | Need EDGAR full-text search + AI |
| "Monitors news" | Core pitch | **WORKING** | OK |
| "Separates signal from noise" | Pillar #2 | **WORKING** via Gemini AI | Rate-limited to 10 RPM |
| "Tracks promises vs reality" | Pillar #3 | **NOT BUILT** | Needs transcript + NLP pipeline |
| AI research analyst quality | Core positioning | **PARTIAL** - Good signals but missing earnings data | Transcript gap |

### MVP Features (from Product Plan)

| Feature | Status | API Ready? |
|---------|--------|------------|
| Watchlist management | Hardcoded 8 stocks | Need user auth + DB |
| AI signals per stock | Working (Gemini) | YES - but rate-limited |
| Earnings call summaries | NOT built | NO - no transcript access |
| Filing monitor with alerts | NOT built | PARTIAL - EDGAR filings exist |
| News with sentiment | PARTIAL - no sentiment scores | NO - neither API provides |
| Price alerts | NOT built | Need push infrastructure |
| Dashboard | WORKING | YES |

### V2 Features (from Product Plan)

| Feature | Status | API Ready? |
|---------|--------|------------|
| Stock screener | NOT built | YES - FMP `/stock-screener` on Starter |
| Earnings calendar page | NOT built | YES - FMP + Finnhub |
| Sector analysis | NOT built | YES - FMP sector data |
| Promise tracking | NOT built | NO - needs transcripts |
| Portfolio tracking | NOT built | Need user auth |
| Email/push alerts | NOT built | Need infrastructure |

---

## 8. Cost Analysis & Optimization

### Current Spend: $36/mo

| Provider | Plan | Cost | Value Delivered |
|----------|------|------|-----------------|
| FMP Starter | Quotes, financials, news | $22/mo | HIGH - Powers most features |
| API Ninjas | Transcripts (broken?) | $14/mo | **ZERO** - Not working |
| Finnhub Free | Fallback quotes, recommendations | $0/mo | MEDIUM |
| EDGAR Free | Filings, XBRL data | $0/mo | MEDIUM |
| Gemini Free | AI signals | $0/mo | HIGH |

### Problem: $14/mo wasted on API Ninjas with no value

### Upgrade Scenarios

#### Option A: FMP Premium ($59/mo) — Recommended for now

| What You Get | Impact |
|-------------|--------|
| Technical indicators (RSI, SMA, EMA, MACD) | **Fixes** broken commodity pages |
| Intraday charts (5min, 15min, 30min, 1hr, 4hr) | **Fixes** broken commodity intraday |
| UK + Canada coverage | Expands market coverage |
| 750 calls/min (vs 300) | 2.5x more capacity |
| 30yr history (vs 5yr) | Better historical analysis |
| 50GB bandwidth (vs 20GB) | 2.5x more data |
| Corporate calendars (dividends, splits, IPOs) | New features enabled |

**Cost change:** $22 -> $59 (+$37/mo)
**Cancel API Ninjas:** -$14/mo
**Net change:** +$23/mo (total $59/mo)

#### Option B: FMP Ultimate ($149/mo) — Full vision

Everything in Premium PLUS:
- Earnings call transcripts (8,000+ companies)
- ETF/mutual fund holdings
- 13F institutional holdings
- WebSocket streaming
- 1-minute intraday
- Global coverage
- 3,000 calls/min

**Cost change:** $22 -> $149 (+$127/mo)
**Cancel API Ninjas:** -$14/mo
**Net change:** +$113/mo (total $149/mo)

#### Option C: Stay on Starter + Calculate Technicals Ourselves ($22/mo)

Instead of upgrading FMP for technical indicators, calculate them client-side from historical price data:

| Indicator | Can Calculate from EOD Data? | Accuracy |
|-----------|----------------------------|----------|
| SMA (20/50/200) | YES - trivial | Identical |
| EMA (9/21/50) | YES - trivial | Identical |
| RSI (14) | YES - Wilder's method | Identical |
| MACD (12,26,9) | YES - already doing this | Identical |
| Stochastic | YES - already doing this | Identical |
| Bollinger Bands | YES - SMA + std dev | Identical |
| ATR | YES - from OHLC | Identical |
| Fibonacci | YES - already doing this | Identical |

**This completely eliminates the need for FMP Premium's technical indicators endpoint.** We already have 1400 days of EOD data from the Starter plan's `/historical-price-eod/full` endpoint.

The ONLY thing we'd still miss is **intraday charts** (1h candles). Alternative: Use Finnhub `/api/v1/stock/candle` for intraday (free tier supports it with some limitations).

---

## 9. Recommendations

### Immediate Actions (This Week)

#### 1. Cancel API Ninjas — Save $14/mo
It's not delivering value. The earnings transcript endpoint either doesn't work on the current plan or requires premium. Kill the cost.

#### 2. Calculate Technical Indicators Client-Side
We already have 1400 days of daily OHLCV data from FMP Starter. All indicators (RSI, SMA, EMA, MACD, Stochastic, Bollinger, ATR) can be calculated in a `lib/technicals.ts` utility. This **fixes the commodity pages** without upgrading FMP.

#### 3. Integrate FMP Endpoints We're Already Paying For

These are available RIGHT NOW on Starter but we haven't built:

| Endpoint | Feature It Enables | Priority |
|----------|-------------------|----------|
| `/stable/insider-trading` | Real insider trades with $ amounts (fixes $0 issue) | **P0** |
| `/stable/price-target-summary` | Analyst price targets on stock pages | **P0** |
| `/stable/upgrades-downgrades` | Analyst upgrade/downgrade signals | **P0** |
| `/stable/earnings-surprises` | Historical beat/miss track record | **P1** |
| `/stable/stock-peers` | Related stocks on stock pages | **P1** |
| `/stable/discounted-cash-flow` | Fair value estimate | **P1** |
| `/stable/stock-screener` | Stock screener page | **P2** |
| `/stable/dividend-calendar` | Dividend calendar | **P2** |
| `/stable/ipo-calendar` | IPO calendar | **P2** |

#### 4. Fix Dashboard Sparklines
Replace `generateSparkData()` (fake) with real intraday/EOD data. Use FMP's `/stable/historical-price-eod/full` with `limit=20` to get last 20 days for sparklines.

### Short-Term (1-2 Weeks)

#### 5. Build `lib/technicals.ts` Utility

```
calculateSMA(prices, period) -> number[]
calculateEMA(prices, period) -> number[]
calculateRSI(prices, period) -> number[]
calculateMACD(prices, fast, slow, signal) -> { macd, signal, histogram }[]
calculateBollingerBands(prices, period, stdDev) -> { upper, middle, lower }[]
calculateATR(ohlc, period) -> number[]
calculateStochastic(ohlc, kPeriod, dPeriod) -> { k, d }[]
```

This replaces 8 FMP Premium API calls per commodity page load with pure math.

#### 6. Integrate FMP Insider Trading
Replace EDGAR Form 4 metadata (which returns $0 values) with FMP's `/stable/insider-trading` endpoint. This gives us actual transaction details: who, what, how many shares, at what price.

#### 7. Add Price Targets & Upgrades/Downgrades
Two simple integrations that add high-value data to stock pages and AI signal generation.

### Medium-Term (1-2 Months)

#### 8. Upgrade to FMP Premium ($59/mo) When Revenue Starts
The main reason to upgrade:
- Intraday charts (not calculable from EOD data)
- 30yr history (better for seasonality, long-term analysis)
- 750 calls/min (handles more concurrent users)

#### 9. Build Earnings Transcript Pipeline
Instead of paying for API Ninjas or FMP Ultimate for transcripts, consider:

**Option A: FMP Ultimate ($149/mo)** — Simplest. Single API for everything including transcripts.

**Option B: EarningsAPI (earningscalls.dev)** — Free tier available, 16,000+ companies, speaker-segmented. Worth evaluating.

**Option C: Self-hosted pipeline** — Download audio from company IR pages, transcribe with Gemini Flash (free) or Whisper. Lowest cost at scale but most engineering work.

**Recommendation:** Start with Option B (EarningsAPI) for free tier, evaluate quality. Upgrade to FMP Ultimate only when you have paying users to justify the cost.

#### 10. Gemini Rate Limit Strategy
Current free tier: 10 RPM, 250 RPD for Gemini 2.5 Flash.

At 250 requests/day, you can generate AI signals for ~250 unique stocks per day. With 5-minute caching, a single stock can be served to thousands of users from cache. This is sufficient for pre-launch and early users.

**When to upgrade Gemini:** When daily unique stock signal requests exceed 200. The paid tier is $0.15/1M input tokens — extremely cheap for financial analysis.

**Alternative: Route simple tasks to Gemini 2.5 Flash-Lite** (15 RPM, 1000 RPD free) for things like news sentiment classification, save Flash for complex signal generation.

### Long-Term

#### 11. Add Finnhub Free Endpoints
These are free and add value:
- `/api/v1/press-releases` — Company press releases
- `/api/v1/stock/peers` — Related companies
- `/api/v1/calendar/ipo` — IPO calendar
- `/api/v1/stock/dividend` — 2yr dividend history

#### 12. EDGAR Full-Text Search
Use `efts.sec.gov/LATEST/search-index` to let users search inside SEC filings. Combined with AI summarization, this delivers on the "reads the filings" promise.

#### 13. EDGAR XBRL Frames for Screener
Use `data.sec.gov/api/xbrl/frames/us-gaap/{concept}/{unit}/CY{year}.json` to screen stocks by financial metrics across ALL companies — completely free. This powers a free stock screener backed by SEC data.

---

## 10. Action Plan

### Priority Matrix

| Action | Effort | Impact | Cost Change | Priority |
|--------|--------|--------|-------------|----------|
| Cancel API Ninjas | 5 min | Save $14/mo | -$14 | **DO NOW** |
| Build `lib/technicals.ts` | 4-6 hrs | Fixes commodity pages | $0 | **P0** |
| Integrate FMP insider-trading | 2 hrs | Fixes $0 insider data | $0 | **P0** |
| Integrate FMP price-targets | 1 hr | Adds analyst PT to pages | $0 | **P0** |
| Integrate FMP upgrades-downgrades | 1 hr | Better AI signals | $0 | **P0** |
| Fix dashboard sparklines (real data) | 2 hrs | Fixes fake charts | $0 | **P0** |
| Integrate FMP earnings-surprises | 1 hr | Beat/miss history | $0 | **P1** |
| Integrate FMP stock-peers | 1 hr | Related stocks | $0 | **P1** |
| Integrate FMP DCF valuation | 1 hr | Fair value estimate | $0 | **P1** |
| Evaluate EarningsAPI free tier | 2 hrs | Transcript source | $0 | **P1** |
| Build stock screener page | 8 hrs | New feature | $0 | **P2** |
| Upgrade FMP to Premium | 5 min | Intraday charts, more history | +$37 | **When revenue starts** |
| Add Finnhub free endpoints | 4 hrs | More data sources | $0 | **P2** |
| EDGAR full-text filing search | 8 hrs | Filing content search | $0 | **P2** |

### Revised Monthly Cost After Optimization

| Phase | APIs | Cost | What's Working |
|-------|------|------|----------------|
| **Now (optimized)** | FMP Starter + Finnhub Free + EDGAR + Gemini Free | **$22/mo** | Everything except intraday charts & transcripts |
| **With revenue** | FMP Premium + Finnhub Free + EDGAR + Gemini Free | **$59/mo** | + Intraday charts, 30yr history, UK/CA |
| **At scale** | FMP Ultimate + Finnhub Free + EDGAR + Gemini Paid | **$155/mo** | + Transcripts, WebSocket, global, 13F |

---

## Appendix A: FMP API Call Budget (Starter Plan)

**Rate limit:** 300 calls/min = 18,000 calls/hr = 432,000 calls/day
**Bandwidth:** 20GB/30 days

### Per Stock Page Load: ~12 API calls
- Quote (1) + Profile (1) + Income Statement (2: annual+quarterly) + Balance Sheet (2) + Cash Flow (2) + Ratios (1) + Key Metrics (1) + News (1) + Historical Prices (1) + Analyst Estimates (1) + Earnings Calendar (1)

### Per Dashboard Load: ~20 API calls
- 6 index quotes + 8 watchlist quotes + 4 news feeds + 1 earnings calendar + 4 filing checks

### Daily Capacity (with caching)
- Quotes cached 15min: 96 refreshes/day per stock
- Profiles cached 24hr: 1 call/day per stock
- Financials cached 24hr: 1 call/day per stock
- News cached 30min: 48 refreshes/day per stock

**At 500+ stocks:** ~50,000 calls/day (11.6% of daily limit)

We have massive headroom on the Starter plan.

## Appendix B: Gemini AI Token Budget

### Per AI Signal Generation
- Input: ~2,000-4,000 tokens (compressed financial context)
- Output: ~500-1,000 tokens (JSON response)
- Thinking: 1,024 tokens budget

### Free Tier Capacity
- 250 requests/day with Gemini 2.5 Flash
- With 5-min cache: Can serve ~72,000 page views/day from cache
- 1,000 requests/day with Flash-Lite (for simpler tasks)

### When to Go Paid
- At 250+ unique stock analyses per day
- Paid pricing: ~$0.15/1M input tokens = ~$0.0006 per signal generation
- 10,000 signals/month = ~$6/month

---

## Appendix C: Complete Environment Variable Reference

```bash
# Required — Powers core features
FMP_API_KEY=           # FMP Starter+ ($22/mo) — quotes, financials, news, estimates
FINNHUB_API_KEY=       # Free — fallback quotes, recommendations, calendar

# Optional — Enhances features
GEMINI_API_KEY=        # Free — AI signal generation (remove GEMINI_API_KEY_2, only need one)
GEMINI_API_KEY_2=      # Backup — DELETE THIS, unnecessary

# Currently Wasting Money
API_NINJAS_API_KEY=    # $14/mo — NOT WORKING, cancel subscription

# Not Yet Configured
NEXT_PUBLIC_GA_ID=     # Free — Google Analytics tracking
# GOOGLE_SEARCH_CONSOLE= # Free — GSC verification (done via meta tag in layout.tsx)

# Future (when needed)
# POLYGON_API_KEY=     # $79/mo — Real-time WebSocket streaming (Phase 3)
# EARNINGSAPI_KEY=     # Free tier available — Earnings transcripts
# SUPABASE_URL=        # Free — User auth, watchlists, preferences
# SUPABASE_ANON_KEY=   # Free — Client-side Supabase access
# RESEND_API_KEY=      # Free tier — Email alerts, notifications
# UPSTASH_REDIS_URL=   # Free tier — Rate limiting, real-time cache
```

---

## Appendix D: Provider Comparison Matrix

| Capability | FMP Starter ($22) | FMP Premium ($59) | FMP Ultimate ($149) | Finnhub Free | EDGAR Free | API Ninjas (~$14) |
|------------|:-:|:-:|:-:|:-:|:-:|:-:|
| US Stock Quotes | YES | YES | YES | YES (real-time) | -- | -- |
| Global Quotes | -- | UK/CA | YES (60+ exchanges) | -- | -- | -- |
| Income Statement | YES | YES | YES | Partial | YES (XBRL) | -- |
| Balance Sheet | YES | YES | YES | -- | YES (XBRL) | -- |
| Cash Flow | YES | YES | YES | -- | YES (XBRL) | -- |
| Financial Ratios | YES | YES | YES | -- | -- | -- |
| Key Metrics | YES | YES | YES | -- | -- | -- |
| Company Profile | YES | YES | YES | YES | -- | -- |
| Stock News | YES | YES | YES | YES | -- | -- |
| Historical EOD | YES (5yr) | YES (30yr) | YES (30yr) | YES (1yr) | -- | -- |
| Intraday Charts | -- | YES | YES | Partial | -- | -- |
| Technical Indicators | -- | YES | YES | -- | -- | -- |
| Earnings Calendar | YES | YES | YES | YES | -- | -- |
| Earnings Transcripts | -- | -- | YES | Paid | -- | Needs premium |
| Analyst Estimates | YES | YES | YES | Paid | -- | -- |
| Analyst Ratings | YES | YES | YES | YES | -- | -- |
| Price Targets | YES | YES | YES | -- | -- | -- |
| Upgrades/Downgrades | YES | YES | YES | -- | -- | -- |
| Insider Trading | YES | YES | YES | Paid | YES (raw) | -- |
| Earnings Surprises | YES | YES | YES | -- | -- | -- |
| SEC Filings | -- | -- | -- | -- | YES | -- |
| 13F Holdings | -- | -- | YES | -- | YES (raw) | -- |
| Stock Screener | YES | YES | YES | -- | Partial (XBRL) | -- |
| DCF Valuation | YES | YES | YES | -- | -- | -- |
| Dividend Calendar | YES | YES | YES | YES | -- | -- |
| IPO Calendar | YES | YES | YES | YES | -- | -- |
| Economic Calendar | YES | YES | YES | -- | -- | -- |
| Forex Quotes | YES | YES | YES | YES | -- | -- |
| Commodity Quotes | YES | YES | YES | -- | -- | -- |
| Social Sentiment | ? | ? | YES | Paid | -- | -- |
| WebSocket Streaming | -- | -- | YES | YES | -- | -- |
| Rate Limit | 300/min | 750/min | 3,000/min | 60/min | 10/sec | 50/sec |
| Bandwidth | 20GB/mo | 50GB/mo | 150GB/mo | Unlimited | Unlimited | ? |

---

*This audit was generated on March 7, 2026. Review and update quarterly or when API providers change their plans.*
