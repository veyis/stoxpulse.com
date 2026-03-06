# StoxPulse Data API Strategy

## Executive Summary

After deep research across 13+ API providers, SEC EDGAR, and earnings transcript sources, the recommended strategy is a **three-layer architecture**:

1. **SEC EDGAR (Free)** — Foundation layer for SEC filings, XBRL financial data, insider trades
2. **Financial Modeling Prep (FMP)** — Primary paid API for quotes, transcripts, estimates, news
3. **Finnhub (Free Tier)** — Development/fallback for real-time quotes, sentiment, calendar

**Total cost: $0/mo (development) → $99-149/mo (production)**

---

## The Decision Matrix

| Data Need | SEC EDGAR (Free) | FMP ($99-149/mo) | Finnhub (Free) | Polygon ($79/mo) |
|---|:---:|:---:|:---:|:---:|
| Stock Quotes (delayed) | — | ✅ | ✅ | ✅ |
| Stock Quotes (real-time) | — | — | ✅ | ✅ (paid) |
| WebSocket Streaming | — | — | ✅ | ✅ (paid) |
| Financial Statements | ✅ (XBRL) | ✅ (parsed) | Partial | — |
| Earnings Transcripts | — | ✅ (Ultimate) | Paid only | — |
| SEC Filings (10-K/Q) | ✅ | ✅ | — | — |
| Insider Trading (Form 4) | ✅ | ✅ | — | — |
| Earnings Calendar | — | ✅ | ✅ | — |
| News/Sentiment | — | ✅ | ✅ | — |
| Analyst Estimates | — | ✅ | Paid only | — |
| Company Profiles | — | ✅ | ✅ | — |
| Technical Indicators | — | ✅ | — | — |
| Historical Prices | — | ✅ (30yr) | ✅ (1yr) | ✅ |
| Rate Limit | 10 req/s | 3,000 req/min | 60 req/min | Unlimited (paid) |

---

## Winner: FMP Ultimate + SEC EDGAR (Free)

### Why FMP is the Best Choice for StoxPulse

1. **Only all-in-one API** that includes earnings call transcripts, financials, filings, quotes, news, and analyst estimates in a single subscription
2. **$99-149/mo** covers ALL 9 data types StoxPulse needs — no need to cobble together 3-4 different APIs
3. **3,000 calls/min** rate limit handles ISR builds easily (500 stocks × 5 endpoints = 2,500 calls in ~50 seconds)
4. **8,000+ US companies** with transcript coverage
5. **30-year** historical price data
6. **Structured JSON** responses — no parsing needed

### Why SEC EDGAR Supplements FMP

1. **Completely free** — no API key, no account needed
2. **Official source** for all SEC filings (10-K, 10-Q, 8-K, Form 4, 13F)
3. **XBRL CompanyFacts API** gives structured financial history for every US public company
4. **Real-time filing detection** — submissions endpoint updates within seconds
5. **Bulk downloads** available (companyfacts.zip, submissions.zip) for initial data load
6. **Form 4 insider trading** data available for free

---

## API-by-API Breakdown

### Tier 1: Recommended

#### Financial Modeling Prep (FMP) — PRIMARY API
- **Free tier**: 250 req/day, 500MB bandwidth (sandbox only)
- **Starter**: $22/mo — 300 calls/min, 5yr history, US only, 20GB bandwidth
- **Premium**: $59/mo — 750 calls/min, 30yr history, adds UK/Canada, technicals, 50GB bandwidth
- **Ultimate**: $149/mo — 3,000 calls/min, earnings transcripts, WebSocket, global, 13F holdings, 150GB bandwidth
- **Key endpoints**: `/stable/earning-call-transcript`, `/stable/income-statement`, `/stable/quote`, `/stable/stock-news`, `/stable/analyst-estimates`
- **Transcript format**: JSON with `symbol`, `date`, `period`, `year`, `content` (full text)
- **Coverage**: 70,000+ tickers across 60+ exchanges
- **Verdict**: ⭐ Best value. One subscription covers everything.

#### SEC EDGAR — FREE FOUNDATION
- **Cost**: $0/mo
- **Rate limit**: 10 req/s (User-Agent header required: `StoxPulse support@stoxpulse.com`)
- **Key endpoints**:
  - `data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json` — All financial data for a company
  - `data.sec.gov/submissions/CIK{cik}.json` — Filing history
  - `efts.sec.gov/LATEST/search-index` — Full-text search across all filings
  - `data.sec.gov/api/xbrl/frames/us-gaap/{concept}/{unit}/CY{year}.json` — Screen one metric across ALL companies
  - `sec.gov/files/company_tickers.json` — CIK↔Ticker mapping
- **Bulk downloads**: `companyfacts.zip` and `submissions.zip` recompiled nightly
- **Caveat**: XBRL tag inconsistency — companies use different us-gaap tags for the same concept (e.g., revenue has 4+ variants: `Revenues`, `RevenueFromContractWithCustomerExcludingAssessedTax`, `SalesRevenueNet`, `SalesRevenueGoodsNet`). Must build a mapping table.

#### Finnhub — FREE DEVELOPMENT API
- **Free tier**: 60 calls/min — real-time US quotes, profiles, basic financials, calendar, news
- **Premium**: Opaque pricing (contact sales) — adds transcripts, insider data, SEC filings
- **Best free features**: Real-time quotes, earnings calendar, company news, basic financials
- **Verdict**: Use for development. Switch to FMP for production.

### Tier 2: Specialists (Add Later)

#### Polygon.io (now "Massive") — REAL-TIME STREAMING
- **When to add**: Phase 3, when you need live price tickers on the dashboard
- **Developer plan**: $79/mo — real-time data, WebSocket streaming, 10yr history
- **Best for**: WebSocket price streaming, tick-level data, options
- **Missing**: No fundamentals, no transcripts, no filings

#### Quartr API — PREMIUM TRANSCRIPTS
- **When to add**: Phase 3+, if FMP transcript quality is insufficient
- **Coverage**: 14,000+ companies across 27 markets, live transcripts with speaker diarization
- **Includes**: Audio files, slide decks, capital markets day events
- **Pricing**: Enterprise (contact sales) — likely $500+/mo
- **Used by**: TradingView, Perplexity, Toss Securities

### Tier 2.5: Budget Alternative ($51/mo)

If $149/mo is too steep for pre-launch, consider this combo:
- **FMP Starter ($22/mo)** — Financial statements, basic quotes, ratios, news
- **Finnhub Free ($0)** — Real-time quotes (60/min), earnings calendar, company news, basic SEC filings
- **Tiingo ($29/mo)** — Real-time IEX WebSocket price streaming, 30yr EOD history, curated news
- **SEC EDGAR ($0)** — Raw filings, XBRL financial data, insider trades

**Trade-off**: No earnings transcripts until you upgrade FMP to Ultimate. More engineering work to integrate 4 sources vs 1.

### Tier 3: Not Recommended

| API | Why Not |
|-----|---------|
| **Alpha Vantage** | No transcripts, 25 req/day free tier, $49/mo for just quotes + technicals |
| **Twelve Data** | No transcripts, limited fundamentals, $79/mo Grow plan for comparable features |
| **Yahoo Finance** | Unofficial API, breaks frequently, legal risk, not for production |
| **IEX Cloud** | Shut down August 2024. Dead. |
| **Marketstack** | 100 req/month free tier, no fundamentals, too limited |
| **EOD Historical Data** | No transcripts, $99/mo for comparable features to FMP |
| **Polygon.io** | Rebranded to "Massive" (Oct 2025). Great for streaming but no fundamentals/transcripts |

---

## Earnings Transcript Strategy

Earnings transcripts are the **hardest data to source** and the **core differentiator** for StoxPulse. Here's the playbook:

### Phase 1 — MVP (Use FMP)
- FMP Ultimate ($99-149/mo) includes transcripts for 8,000+ US companies
- Format: Full text in JSON `content` field (unstructured, no speaker labels)
- Historical depth: 10+ years for major companies
- Latency: Typically within 24 hours of the call
- **AI processing**: Run through Claude/GPT to extract key themes, sentiment, forward guidance

### Phase 2 — Enhanced Transcripts
- Evaluate **API Ninjas** ($39-99/mo) — includes built-in AI summaries, sentiment scores, risk factors, speaker identification for 8,000+ companies. Best value if you want pre-analyzed data.
- Or **EarningsCall.biz** / **EarningsAPI (earningscalls.dev)** for:
  - Speaker-segmented transcripts (CEO vs CFO vs Analyst)
  - Prepared Remarks vs Q&A separation
  - Word-level timestamps
- This enables features like "What did the CFO say about margins?"

### Phase 3 — Self-Hosted Pipeline (Cost Optimization)
- Use **GPT-4o Transcribe with Diarization** ($0.006/min, ~$0.36/hr) or **Deepgram Nova** ($0.26/hr)
- S&P 500 = ~2,000 calls/year × 1 hour = **$520-720/year** via API
- Audio sources: EarningsCall.biz API (provides MP3s), company IR pages, Quartr
- Bloomberg has adapted Whisper for real-time streaming earnings calls (Interspeech 2025)

### Transcript Provider Comparison

| Provider | Coverage | AI Summaries | Speaker Labels | Audio | Cost |
|----------|----------|:---:|:---:|:---:|------|
| FMP Ultimate | 8,000+ US | — | — | — | $99-149/mo (bundled) |
| API Ninjas | 8,000+ global | ✅ | ✅ | — | $39-99/mo |
| EarningsCall.biz | 5,000+ | — | ✅ | ✅ MP3 | Contact sales |
| EarningsAPI | 16,000+ | — | ✅ | — | Free tier + paid |
| Quartr | 14,000+ global | ✅ | ✅ | ✅ MP3 | Enterprise |
| Finnhub | US/UK/EU/CA/AU | — | ✅ | — | $50-200/mo |
| Benzinga | Global | — | ✅ | — | Enterprise |

### Legal Note
- **Swatch v. Bloomberg (2nd Circuit)**: Landmark ruling that distributing earnings call transcripts is **fair use**, even commercially. Strong legal precedent for StoxPulse.
- Licensed API access (FMP, API Ninjas) grants explicit display rights per ToS.
- **AI-generated summaries/analysis** of transcripts (rather than raw transcript display) adds a transformative layer, further strengthening fair use.
- SEC 8-K filings are public domain — use freely.
- **Never scrape** Seeking Alpha or Motley Fool — ToS violations and fragile scrapers.

---

## Implementation Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    StoxPulse Next.js App                     │
│                                                             │
│   ISR Pages (revalidate: 3600)   Real-time Dashboard        │
│   /stocks/[ticker]               /dashboard                 │
│   /earnings                      WebSocket quotes            │
└──────────┬───────────────────────────────┬──────────────────┘
           │                               │
           ▼                               ▼
┌──────────────────────┐      ┌───────────────────────┐
│   Data Cache Layer   │      │   Real-time Layer     │
│   (Postgres/Redis)   │      │   (Phase 3)           │
│                      │      │                       │
│   Cron: every 1-4hr  │      │   Polygon WebSocket   │
│   - FMP quotes       │      │   or Finnhub WS       │
│   - FMP financials   │      │                       │
│   - EDGAR filings    │      │                       │
│   - FMP transcripts  │      │                       │
└──────────────────────┘      └───────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────┐
│                   Data Sources                        │
│                                                      │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ FMP API  │  │ SEC EDGAR    │  │ Finnhub       │  │
│  │ Ultimate │  │ (Free)       │  │ (Free tier)   │  │
│  │ $99-149  │  │ $0/mo        │  │ $0/mo         │  │
│  │          │  │              │  │               │  │
│  │ Quotes   │  │ XBRL Data   │  │ Real-time     │  │
│  │ Finance  │  │ 10-K/10-Q   │  │ quotes        │  │
│  │ Transcr. │  │ 8-K filings │  │ Calendar      │  │
│  │ News     │  │ Form 4      │  │ News          │  │
│  │ Earnings │  │ 13F holdings │  │ Profiles      │  │
│  │ Estimates│  │ Full-text    │  │               │  │
│  │ Calendar │  │ search       │  │               │  │
│  └──────────┘  └──────────────┘  └───────────────┘  │
└──────────────────────────────────────────────────────┘
```

### Data Flow for ISR Pages

1. **Cron job** runs every 1-4 hours (Vercel Cron or external)
2. Fetches latest data from FMP + EDGAR → stores in Postgres/Redis
3. Next.js ISR pages read from cache with `revalidate: 3600`
4. On-demand revalidation triggered when new filings detected via EDGAR

### Rate Limit Budget (Daily)

| Source | Rate Limit | Daily Budget | Usage |
|--------|-----------|--------------|-------|
| FMP Ultimate | 3,000/min | ~4.3M/day | ~2,500 calls for 500 stocks |
| SEC EDGAR | 10/sec | 864,000/day | ~5,000 calls for daily scans |
| Finnhub Free | 60/min | 86,400/day | ~1,000 calls for supplements |

---

## Phased Rollout Plan

### Phase 1 — Development & Pre-Launch ($0/mo)
- **Finnhub free tier** for prototyping (quotes, profiles, calendar, news)
- **SEC EDGAR** for filing data and XBRL financial statements
- Build data layer abstractions so API source is swappable
- Create mock data for transcripts using sample JSON

### Phase 2 — Beta Launch ($99-149/mo)
- **FMP Ultimate** as single primary API
- **SEC EDGAR** for raw filing access and insider trading
- Enable earnings transcript AI analysis (summarize with Claude)
- Implement ISR data pipeline with Postgres cache

### Phase 3 — Production Scale ($180-230/mo)
- FMP Ultimate ($99-149/mo) for fundamentals + transcripts
- **Polygon Developer ($79/mo)** for real-time WebSocket price streaming
- SEC EDGAR for filings
- Optional: EarningsCall.biz or EarningsAPI for speaker-segmented transcripts

### Phase 4 — Premium Features ($300+/mo)
- **Quartr API** for global coverage, live transcripts, slide decks
- Self-hosted Whisper pipeline for cost optimization at scale
- Unusual Whales for congressional trading data (differentiation)

---

## Key Technical Decisions

### 1. XBRL Tag Mapping (Critical)
SEC EDGAR XBRL data uses inconsistent tags. You MUST build a mapping:
```typescript
const REVENUE_TAGS = [
  'Revenues',
  'RevenueFromContractWithCustomerExcludingAssessedTax',
  'SalesRevenueNet',
  'SalesRevenueGoodsNet',
  'RevenueFromContractWithCustomerIncludingAssessedTax',
];
```
Each financial metric needs a similar mapping. This is the biggest engineering challenge with EDGAR.

### 2. CIK-to-Ticker Mapping
EDGAR uses CIK numbers, not tickers. Cache the mapping from `sec.gov/files/company_tickers.json` and update weekly.

### 3. Data Freshness Strategy
- **Quotes**: Cache 15 min (ISR revalidate), real-time via WebSocket for dashboard
- **Financials**: Cache 24 hours, refresh on 10-K/10-Q filing detection
- **Transcripts**: Fetch once after earnings, store permanently
- **News**: Cache 30 min
- **Insider trades**: Cache 6 hours, check EDGAR Form 4 RSS

### 4. API Abstraction Layer
Build a provider-agnostic data layer:
```typescript
// lib/data/providers/fmp.ts
// lib/data/providers/edgar.ts
// lib/data/providers/finnhub.ts
// lib/data/index.ts — unified interface
```
This allows swapping providers without touching UI code.

---

## Cost Summary

| Phase | Monthly Cost | What You Get |
|-------|-------------|--------------|
| Development | $0 | Finnhub free + EDGAR free |
| Beta | $99-149 | FMP Ultimate + EDGAR |
| Production | $180-230 | FMP + Polygon + EDGAR |
| Premium | $300+ | + Quartr or EarningsAPI |

**Bottom line**: You can build and launch StoxPulse for **$0 during development** and **~$100-150/mo at launch** with full data coverage including earnings transcripts.
