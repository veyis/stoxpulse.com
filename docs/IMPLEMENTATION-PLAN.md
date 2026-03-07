# StoxPulse Implementation Plan — From Good to #1

> Goal: Build the most functional, clean, and highly-rated AI stock intelligence app for retail investors
> Scope: Phase B (Core Product), Phase C (AI Moat), Phase D (Scale & Traffic)
> Auth: Deferred — all features work with anonymous/cookie-based state for now
> Date: March 7, 2026

---

## Competitive Intelligence Summary

What the #1 rated apps do that we must match or beat:

| App | What They Nail | What We Steal |
|-----|---------------|---------------|
| **Simply Wall St** | Visual "Snowflake" score (5 axes), infographic-style analysis, beautiful data viz | Our "Pulse Score" must be equally visual and instant-read |
| **TipRanks** | Smart Score (8 factors, 1-10), analyst track record weighting, consensus shifts | Multi-factor composite scoring with transparent factor breakdown |
| **Danelfin** | AI Score with explainability, sub-scores (Fundamental/Technical/Sentiment/Risk), 10K features daily | Sub-score decomposition, score evolution over time |
| **Gainify** | 5-point view (Performance/Momentum/Valuation/Outlook/Health), clean UI, AI earnings call summaries | Proprietary composite dimensions, earnings call AI |
| **WallStreetZen** | Zen Ratings (115 factors, letter grade A-F), neural network on 20yr data | Letter grade system for quick scanning |
| **Finviz** | Heatmap, density-with-clarity, speed | Sector heatmap, information density without clutter |
| **TradingView** | 400+ indicators, multi-timeframe, community | We don't compete on charting — we compete on AI analysis |

**Our edge: We read the WORDS (earnings calls, filings, news) not just the numbers. No competitor does all three with AI at our price point.**

---

## Architecture Decisions (Pre-Implementation)

### Background Jobs: Inngest (not Trigger.dev)
- **Why:** Native Vercel integration, event-driven architecture fits our use case (earnings filed -> trigger analysis), step-based retry logic, no separate infrastructure
- **Cost:** Free tier = 25K events/mo (enough for launch)
- Install: `pnpm add inngest`

### Earnings Transcripts: FMP (not API Ninjas)
- **Why:** FMP already integrated, has `/api/v4/earning_call_transcript` endpoint, covered under current $22/mo plan
- **Action:** Add `getTranscript()` to FMP provider, deprecate API Ninjas dependency

### Email: Resend + React Email
- **Why:** Best DX for Next.js, React components for email templates, free tier = 3K emails/mo
- Install: `pnpm add resend @react-email/components`

### Database: None (for now)
- Cookie-based watchlist (localStorage + cookie sync)
- File-based cache continues (.cache/)
- When auth comes later, migrate to Supabase

### Payments: Deferred
- Pricing page stays as-is (waitlist capture)
- Build everything free-tier first, add gates later

---

## Phase B: Core Product Infrastructure

> Make the app actually work as a product, not just a marketing site

### B1. Fix Critical Issues (Day 1)

**B1.1 Global Error Boundary**
```
Create: app/error.tsx
- "use client" component
- Branded error UI with retry button
- Reports to console.error (Sentry later)
- Matches dark theme
```

**B1.2 Remove Test Artifacts**
```
Delete: test-gemini.ts (root level debug file)
```

**B1.3 Fix Broken Tool Links**
```
Option A: Build the missing tool pages (preferred — more SEO value)
Option B: Remove links from tools/page.tsx until built

Missing:
- /tools/earnings-calendar -> Build in Phase B3
- /tools/portfolio-risk-scanner -> Build in Phase D2
```

**B1.4 Enable Analytics**
```
Uncomment NEXT_PUBLIC_GA_ID in .env.local
Verify GA4 is receiving pageviews
Add key conversion events:
- waitlist_signup
- tool_usage
- stock_page_view
- earnings_analysis_view
```

**B1.5 Commit All Pending Changes**
```
Stage and commit:
- components/landing/testimonials.tsx
- components/tools/form4-decoder.tsx
- All modified landing components
- Provider fixes (finnhub.ts, fmp.ts)
```

---

### B2. Cookie-Based Watchlist System (Day 2-3)

> Users can build a watchlist without auth. Stored in localStorage, synced to cookie for SSR.
> When auth is added later, migrate localStorage watchlists to user accounts.

**Files to create:**
```
lib/watchlist.ts                         — Core watchlist logic
  - getWatchlist(): string[]             — Read from cookie/localStorage
  - addToWatchlist(ticker: string)       — Add ticker
  - removeFromWatchlist(ticker: string)  — Remove ticker
  - isInWatchlist(ticker: string)        — Check membership
  - MAX_FREE = 15, MAX_PAID = 100       — Limits (enforce paid later)

components/stocks/watchlist-button.tsx    — "Add to Watchlist" button
  - Client component with optimistic UI
  - Star icon, fills on add
  - Toast notification on add/remove
  - Used on stock pages, search results, dashboard

app/api/watchlist/sync/route.ts          — Sync cookie for SSR access
  - POST: receives ticker list, sets httpOnly cookie
  - GET: returns current watchlist from cookie
```

**Integration points:**
- Stock page header (`components/stocks/stock-header.tsx`): Add watchlist button
- Dashboard watchlist card: Read from cookie, fetch live quotes
- Navbar: Show watchlist count badge

---

### B3. Free Tools — Build the Missing Two (Day 4-6)

> Free tools = SEO magnets + product demos. Each tool must be genuinely useful standalone.

**B3.1 Earnings Calendar Tool** `/tools/earnings-calendar`

```
app/tools/earnings-calendar/page.tsx

Design:
- Full-width calendar view (current week + next 2 weeks)
- Color-coded by market cap tier (mega/large/mid/small)
- Each earnings entry shows:
  - Ticker + company name
  - Date + time (BMO/AMC)
  - EPS estimate vs last quarter actual
  - Revenue estimate
  - "Add to watchlist" quick button
- Filter by: sector, market cap, date range, watchlist only
- Mobile: list view with date grouping

Data source: FMP getEarningsCalendar() (already implemented)

Schema markup: Event schema for each earnings date
SEO: Target "earnings calendar this week", "upcoming earnings"
```

**B3.2 Portfolio Risk Scanner** `/tools/portfolio-risk-scanner`

```
app/tools/portfolio-risk-scanner/page.tsx

Design:
- User enters up to 10 tickers (comma-separated input)
- Instant analysis (no account needed):
  1. Sector concentration risk (pie chart)
  2. Correlation heatmap (how similar are your stocks)
  3. Top 3 risk factors across portfolio
  4. Diversification score (A-F grade)
  5. "Missing sectors" suggestion
  6. Beta-weighted portfolio volatility
  7. Earnings cluster risk (multiple stocks reporting same week)

Data source: FMP quotes + profiles (parallel fetch)
AI: Gemini generates 3-sentence risk summary

Schema markup: SoftwareApplication
SEO: Target "portfolio risk analyzer free", "stock portfolio diversification check"
```

**B3.3 Upgrade Existing SEC Filing Translator**

```
Current state: Presentational only (no real parsing)
Upgrade:
- Actually fetch Form 4 XML from EDGAR URL
- Parse transaction data (shares, price, buy/sell, is10b5-1)
- AI summary: "What this means in plain English"
- Show comparison to insider's historical transactions
- Email gate: show first result free, require email for unlimited
```

---

### B4. Inngest Background Job System (Day 7-8)

> Event-driven pipeline for processing financial data asynchronously

**Setup:**
```
pnpm add inngest
Create: lib/inngest/client.ts          — Inngest client initialization
Create: lib/inngest/functions.ts       — All job definitions
Create: app/api/inngest/route.ts       — Inngest webhook handler
```

**Initial Jobs:**

```typescript
// 1. Daily Quote Refresh (every trading day at 4:30 PM ET)
// Fetches closing prices for all 50 tracked stocks
// Stores in .cache/ with 24hr TTL
"stoxpulse/quotes.refresh"

// 2. Earnings Calendar Sync (daily at 6 AM ET)
// Pulls next 30 days of earnings dates
// Flags any watchlist stocks with upcoming earnings
"stoxpulse/earnings.sync"

// 3. News Aggregation (every 2 hours during market hours)
// Fetches news for top 50 stocks
// AI scores each article for importance (1-10)
// Stores scored news in cache
"stoxpulse/news.aggregate"

// 4. Filing Monitor (every 30 minutes during market hours)
// Checks EDGAR for new filings (8-K, 10-K, 10-Q, Form 4)
// On new material filing -> trigger AI analysis
"stoxpulse/filings.monitor"

// 5. AI Analysis Generator (triggered by events)
// When new earnings/filing/significant news detected
// Generates full AI analysis via Gemini
// Caches result for stock page
"stoxpulse/ai.analyze"
```

---

### B5. Pulse Score — The Proprietary Composite Metric (Day 9-11)

> Our version of TipRanks Smart Score + Simply Wall St Snowflake + Danelfin AI Score.
> This is the #1 differentiator. Must be visually stunning and instantly understandable.

**The Pulse Score System:**

```
Overall Score: 1-100 (displayed as letter grade A+ through F)
Visual: Radar/spider chart with 5 axes (like Simply Wall St snowflake)

5 Dimensions (each scored 0-20, sum = Pulse Score):

1. VALUE (0-20)
   Inputs: P/E vs sector median, P/B, P/S, P/FCF, EV/EBITDA,
           FCF yield, earnings yield, PEG ratio
   Logic: Compare to sector peers + historical average
   Weight: Equal blend of absolute value + relative value

2. GROWTH (0-20)
   Inputs: Revenue growth (YoY, QoQ), EPS growth, FCF growth,
           growth acceleration/deceleration, analyst estimate revisions
   Logic: Momentum of growth matters more than absolute level
   Bonus: Growth accelerating = extra points

3. HEALTH (0-20)
   Inputs: Current ratio, D/E, interest coverage, FCF/NI quality,
           cash position, net debt trend, ROE, ROIC
   Logic: Balance sheet fortress = high score
   Penalty: Negative FCF + positive NI = earnings quality red flag

4. MOMENTUM (0-20)
   Inputs: Price vs 50/200 MA, 52W range position, volume trend,
           RSI (if available), golden/death cross status
   Logic: Trend + volume confirmation
   Bonus: New 52W high with volume = max momentum

5. SENTIMENT (0-20)
   Inputs: Analyst consensus (% buy), consensus shift direction,
           insider net buy/sell, news sentiment aggregate,
           earnings surprise history
   Logic: Smart money (insiders) weighted 2x vs analysts
   Bonus: Cluster insider buying = sentiment boost
```

**Files to create:**
```
lib/pulse-score.ts                      — Score calculation engine
  - calculatePulseScore(data: StockPageData): PulseScore
  - Each dimension function is pure (testable)
  - Returns: { total, grade, dimensions[], signals[] }

lib/pulse-score-types.ts                — Type definitions
  - PulseScore, PulseDimension, PulseGrade

components/stocks/pulse-score.tsx        — The visual component
  - Radar chart (5 axes) using SVG (no library dependency)
  - Large letter grade in center
  - Score trend sparkline (if historical data available)
  - Each dimension clickable -> shows factor breakdown
  - Color: green (A-B) / yellow (C) / red (D-F)
  - Responsive: full radar on desktop, compact bar on mobile

components/stocks/pulse-breakdown.tsx    — Detailed factor view
  - Expandable panel showing all inputs per dimension
  - "Why this score" explanation per factor
  - Comparison to sector average
  - Historical score evolution (sparkline per dimension)
```

**Visual Design (the "wow" factor):**
```
Desktop layout (stock page header):
┌──────────────────────────────────────────────────┐
│  AAPL  Apple Inc.  $187.42 +1.2%   [★ Watchlist] │
│                                                    │
│  ┌─────────────┐   Pulse Score: 82 / 100          │
│  │   Radar     │   Grade: A-                       │
│  │   Chart     │                                   │
│  │  (5 axes)   │   Value ████████████░░░░ 15/20    │
│  │             │   Growth █████████████░░░ 17/20    │
│  └─────────────┘   Health ████████████████ 20/20    │
│                    Momentum ██████████░░░░░ 14/20    │
│                    Sentiment ████████████░░░ 16/20   │
└──────────────────────────────────────────────────┘
```

---

### B6. Enhanced Dashboard — Bento Grid 2.0 (Day 12-14)

> Transform the static dashboard into a dynamic, personalized command center

**Dashboard Layout (12-column bento grid):**

```
Desktop (XL):
┌─────────────────────────┬────────────────┐
│ Market Pulse (4 indices) │ Pulse Scan     │
│ SPY QQQ DIA TLT         │ Best/Worst in  │
│ with sparklines          │ watchlist      │
├─────────────────────────┼────────────────┤
│ Watchlist Table          │ Signal Feed    │
│ Live quotes + Pulse      │ AI-generated   │
│ Score mini badges        │ alerts + news  │
│ Sorted by signal         │ scored 7+/10   │
│ strength                 │                │
├────────────┬────────────┼────────────────┤
│ Earnings   │ Sector     │ AI Daily       │
│ Calendar   │ Heatmap    │ Digest         │
│ This Week  │ (Finviz    │ "3 things that │
│            │  style)    │  matter today" │
└────────────┴────────────┴────────────────┘
```

**New Components:**

```
components/dashboard/pulse-scan.tsx
  - Shows watchlist stocks ranked by Pulse Score
  - Top 3 (green) and Bottom 3 (red) highlighted
  - "Biggest movers" in score (not price) today

components/dashboard/sector-heatmap.tsx
  - 11-sector grid, colored by daily performance
  - Size proportional to market cap
  - Hover: sector stats (P/E, performance, top stock)
  - Uses Finviz-style treemap layout (pure CSS grid)

components/dashboard/ai-daily-digest.tsx
  - Gemini generates 3-bullet daily summary
  - Covers: market context, watchlist highlights, upcoming events
  - Cached per day (regenerated at 7 AM ET via Inngest)
  - "What's important today" in plain English

components/dashboard/signal-feed-v2.tsx
  - Unified feed: AI signals + scored news + filing alerts + insider trades
  - Each item: importance badge (1-10), source icon, timestamp
  - Filter: by type, by ticker, importance threshold
  - Click -> deep link to stock page section
```

---

## Phase C: The AI Moat

> This is what makes StoxPulse irreplaceable. No competitor does all three.

### C1. AI Earnings Call Analyzer (Day 15-19)

> The flagship feature. "NVDA just reported — in 2 minutes I know everything."

**C1.1 Transcript Fetching Pipeline**

```
lib/data/providers/fmp.ts — Add method:
  getTranscript(ticker: string, quarter: number, year: number)
  - Endpoint: GET /api/v3/earning_call_transcript/{ticker}?quarter={q}&year={y}
  - Returns: full transcript text with speaker labels
  - Cache: 30 days (transcripts don't change)

lib/inngest/functions.ts — Add job:
  "stoxpulse/earnings.transcript-ready"
  - Triggered by: earnings calendar date passing
  - Waits 2 hours after scheduled time (transcript delay)
  - Fetches transcript from FMP
  - If found -> triggers AI analysis
  - If not found -> retry in 4 hours (max 3 retries)
```

**C1.2 AI Earnings Analysis Engine**

```
lib/ai/earnings-analyzer.ts

Input: Full earnings call transcript (5,000-15,000 words)
Model: Gemini 2.5 Flash (128K context, cheap, fast)

Analysis output (structured JSON):
{
  // Executive Summary (2-minute read)
  summary: string,              // 150 words max
  keyNumbers: {                  // The 5 numbers that matter
    metric: string,
    actual: string,
    estimate: string,
    surprise: string,           // "beat by 8%"
    significance: string        // "highest beat in 4 quarters"
  }[],

  // Management Tone Analysis
  sentiment: {
    overall: "bullish" | "cautious" | "defensive" | "neutral",
    confidence: number,         // 0-100
    vsLastQuarter: "improved" | "unchanged" | "deteriorated",
    toneShifts: string[],       // "CEO notably more cautious on China"
  },

  // Red Flags & Green Flags
  redFlags: {
    flag: string,               // "CFO used 'challenging' 7 times (vs 1 last Q)"
    severity: "low" | "medium" | "high",
    context: string,
  }[],
  greenFlags: {
    flag: string,
    significance: "low" | "medium" | "high",
    context: string,
  }[],

  // Forward-Looking Statements (Promise Tracker seed data)
  promises: {
    statement: string,          // "We expect margins to expand in Q3"
    speaker: string,            // "CEO Tim Cook"
    category: "guidance" | "operational" | "strategic",
    measurable: boolean,        // Can we track this next quarter?
    deadline: string,           // "Q3 2026" or "H2 2026"
  }[],

  // Key Quotes (the 5 most important sentences)
  keyQuotes: {
    text: string,
    speaker: string,
    significance: string,       // Why this quote matters
  }[],

  // Guidance Changes
  guidance: {
    metric: string,
    previous: string,
    current: string,
    direction: "raised" | "lowered" | "maintained" | "new",
  }[],

  // Q&A Highlights (analyst questions that revealed info)
  qaHighlights: {
    analyst: string,
    question: string,           // Summarized
    answer: string,             // Key point from answer
    insight: string,            // What this reveals
  }[],
}
```

**C1.3 Earnings Analysis UI**

```
components/earnings/earnings-analysis.tsx   — Full analysis view
  - Tabbed layout: Summary | Deep Dive | Promises | Transcript
  - Summary tab: key numbers grid, sentiment gauge, flags
  - Deep dive: guidance table, Q&A highlights, tone analysis
  - Promises: trackable commitments with deadline badges
  - Transcript: searchable full text with AI-highlighted sections

components/earnings/sentiment-gauge.tsx     — Visual tone meter
  - Semicircular gauge: Bearish <-> Neutral <-> Bullish
  - Comparison bar: this Q vs last Q
  - Animated on load

components/earnings/key-numbers-grid.tsx    — Beat/miss grid
  - 5 metrics, each with actual vs estimate
  - Green (beat) / Red (miss) / Gray (inline)
  - Surprise percentage prominently displayed

components/earnings/promise-tracker.tsx     — Promise cards
  - Each promise: statement, speaker, deadline, status
  - Status: "Pending" (future), "Delivered" (confirmed next Q), "Broken"
  - Links to the quote in transcript
```

**Pages:**
```
app/stocks/[ticker]/earnings/page.tsx — UPGRADE existing page
  - Add AI analysis section above raw data
  - Historical earnings with AI summaries per quarter
  - Promise tracker timeline

app/tools/earnings-call-summarizer/page.tsx — UPGRADE
  - Currently static demo
  - Make it real: enter ticker -> get latest earnings AI analysis
  - Free: last quarter only
  - Show Pulse Score impact after earnings
```

---

### C2. AI SEC Filing Monitor (Day 20-24)

> "AAPL filed an 8-K at 4:47 PM — I know about it before CNBC."

**C2.1 Filing Detection Pipeline**

```
lib/inngest/functions.ts — Enhanced filing monitor:

"stoxpulse/filings.monitor"
  - Runs every 15 minutes during market hours (9:30-6 PM ET)
  - Runs every 60 minutes outside hours
  - Checks EDGAR RSS feed for new filings
  - For tracked tickers: 50 stocks + any in user watchlists
  - On new filing detected:
    -> Classify: 8-K (material event), 10-K/10-Q (periodic), Form 4 (insider)
    -> Trigger appropriate analysis job

"stoxpulse/filings.analyze-8k"
  - Triggered by: new 8-K filing detected
  - Fetches full 8-K text from EDGAR
  - AI extracts: event type, significance, market impact
  - Stores analysis in cache

"stoxpulse/filings.analyze-periodic"
  - Triggered by: new 10-K or 10-Q
  - AI compares key sections vs previous filing:
    - Risk factors (what changed?)
    - Revenue recognition (any policy changes?)
    - Legal proceedings (new lawsuits?)
    - Related party transactions
  - Generates change summary

"stoxpulse/filings.analyze-form4"
  - Triggered by: new Form 4 insider transaction
  - Classifies: routine (10b5-1) vs discretionary
  - Checks historical pattern for this insider
  - AI context: "CFO sold $3M — unusual, last sale was 18 months ago"
```

**C2.2 Filing Analysis AI**

```
lib/ai/filing-analyzer.ts

// 8-K Material Event Analysis
analyze8K(text: string, ticker: string): {
  eventType: string,           // "Share Buyback", "CFO Resignation", etc.
  summary: string,             // 2-3 sentence plain English
  marketImpact: "positive" | "negative" | "neutral",
  significance: 1-10,
  keyDetails: string[],
  relatedFilings: string[],    // Links to referenced filings
}

// 10-K/10-Q Change Detection
analyzePeriodicFiling(current: string, previous: string, ticker: string): {
  summary: string,
  significantChanges: {
    section: string,           // "Risk Factors", "Legal Proceedings"
    changeType: "added" | "removed" | "modified",
    description: string,
    significance: "low" | "medium" | "high",
    quote: string,             // The actual changed text
  }[],
  financialHighlights: string[],
  newRisks: string[],
  removedRisks: string[],
}

// Form 4 Insider Context
analyzeInsiderTrade(trade: InsiderTransaction, history: InsiderTransaction[]): {
  summary: string,             // "CEO bought $2M worth — first purchase in 2 years"
  isRoutine: boolean,
  unusualFactors: string[],    // "Outside normal trading window", "Largest buy ever"
  historicalContext: string,
  signalStrength: "weak" | "moderate" | "strong",
}
```

**C2.3 Filing Analysis UI**

```
components/filings/filing-analysis-card.tsx  — Filing summary card
  - Filing type badge (8-K red, 10-K blue, Form 4 purple)
  - AI summary (2-3 sentences)
  - Significance badge (1-10)
  - "Read full filing" link to SEC
  - Time since filed

components/filings/change-diff.tsx           — Filing diff view
  - Side-by-side or inline diff of changed sections
  - Red (removed), Green (added) highlighting
  - AI annotation: "This new risk factor about China tariffs was added"

components/filings/insider-context.tsx       — Insider trade context
  - Transaction details + AI context
  - Historical trade timeline for this insider
  - Signal strength badge
```

---

### C3. AI News Intelligence (Day 25-28)

> Kill the noise. Surface the signal. Every news article scored 1-10.

**C3.1 News Scoring Pipeline**

```
lib/inngest/functions.ts:

"stoxpulse/news.score"
  - Triggered by: news.aggregate job (every 2 hours)
  - For each new article:
    1. AI importance score (1-10)
    2. Sentiment classification (positive/negative/neutral)
    3. Category tag (earnings, M&A, regulatory, analyst, macro, noise)
    4. Cross-reference with filings ("this was already in the 10-K")
    5. Novelty check ("is this genuinely new information?")
  - Store scored articles in cache
  - Only articles 6+/10 surface in feeds

Scoring criteria (in AI prompt):
  10: Major unexpected event (surprise CEO departure, fraud, acquisition)
  8-9: Material new information (guidance change, major contract, lawsuit)
  6-7: Relevant update (analyst rating, earnings preview, sector trend)
  4-5: Routine (conference attendance, minor partnership)
  1-3: Noise (rehashed content, speculation, clickbait)
```

**C3.2 News Intelligence UI**

```
components/news/scored-news-card.tsx         — Individual news card
  - Importance score badge (color-coded: red 8+, yellow 6-7, gray <6)
  - Headline + 1-line AI summary (not the article's summary — our own)
  - Sentiment icon (arrow up/down/sideways)
  - Source + time ago
  - "Already known" badge if covered by prior filing
  - Related tickers

components/news/news-intelligence-feed.tsx   — Filterable feed
  - Default: show 6+/10 only
  - Filter by: importance threshold, sentiment, category, ticker
  - Group by: date or ticker
  - Infinite scroll with virtual list (performance)

components/news/daily-digest.tsx             — AI daily summary
  - 3 bullet points: most important developments
  - Watchlist-aware: prioritizes your stocks
  - "Full digest" expands to 5-7 items
  - Generated once per day at 7 AM ET via Inngest
```

---

### C4. Email Digest System (Day 29-31)

> "3 things that matter for your portfolio today" — delivered to inbox

**C4.1 Setup**
```
pnpm add resend @react-email/components

Create: lib/email/client.ts              — Resend client
Create: lib/email/templates/             — React Email templates
Create: app/api/email/digest/route.ts    — Manual trigger endpoint
```

**C4.2 Email Templates (React Email)**

```
lib/email/templates/daily-digest.tsx
  - Clean, dark-themed email matching brand
  - Header: StoxPulse logo + date
  - Section 1: "Your 3 Key Takeaways"
    - AI-generated personalized bullets based on watchlist
  - Section 2: "Watchlist Snapshot"
    - Table: ticker, price, change, Pulse Score
  - Section 3: "Upcoming This Week"
    - Earnings dates for watchlist stocks
  - Footer: unsubscribe + "Powered by StoxPulse AI"

lib/email/templates/earnings-alert.tsx
  - Triggered when a watchlist stock reports earnings
  - Subject: "[AAPL] Earnings: Beat by 8% | Revenue +12% YoY"
  - Content: AI summary, key numbers grid, sentiment
  - CTA: "See Full Analysis on StoxPulse"

lib/email/templates/filing-alert.tsx
  - Triggered by material filings (8-K, large insider trades)
  - Subject: "[AAPL] 8-K Filed: $100B Buyback Authorized"
  - Content: AI summary, significance score, link to filing
  - CTA: "Read AI Analysis"
```

**C4.3 Email Collection (Pre-Auth)**
```
Email signup form on:
- Daily digest opt-in on dashboard
- Tool pages (email gate for unlimited usage)
- Earnings analysis page ("Get alerts for this stock")
- Footer CTA

Store: file-based for now (data/subscribers.json)
  { email, watchlist: string[], preferences: { daily: boolean, earnings: boolean, filings: boolean } }
Migrate to Supabase when auth is added.
```

---

### C5. Promise Tracker (Day 32-33)

> Track what management said vs what they delivered. No competitor has this.

```
lib/ai/promise-tracker.ts

// After each earnings call analysis, extract promises
// Store promises with deadlines
// When next quarter's earnings come in:
// -> AI compares promises vs results
// -> Grades each promise: Delivered / Partially / Broken / Pending

Data structure:
{
  ticker: string,
  promises: {
    id: string,
    statement: string,          // "We expect Q3 margins to expand"
    speaker: string,
    madeDate: string,           // When the promise was made
    deadline: string,           // "Q3 2026"
    status: "pending" | "delivered" | "partial" | "broken",
    resolution: string | null,  // "Q3 margins expanded 2.1pp" or "Margins contracted 0.5pp"
    resolvedDate: string | null,
  }[]
}

UI: components/earnings/promise-tracker.tsx (already planned in C1)
  - Timeline view of promises
  - Green (delivered), Yellow (partial), Red (broken), Gray (pending)
  - "Management Credibility Score": % of promises delivered
  - Trend: improving or declining credibility over time
```

---

## Phase D: Scale Content & Traffic

> More pages = more traffic = more users. Every page must be genuinely useful.

### D1. Expand Stock Universe (Day 34-36)

```
Current: 50 stocks in data/stocks/sp500.ts
Target: Full S&P 500 (503 stocks)

data/stocks/sp500-full.ts
  - All 503 current S&P 500 constituents
  - Auto-generate from FMP /api/v3/sp500_constituent endpoint
  - Fields: ticker, name, sector, industry, subIndustry, marketCap
  - Helper functions: getStockByTicker, getStocksBySector, searchStocks

Impact:
  - 503 stock pages (from 50)
  - 503 earnings history pages
  - 503 insider trading pages
  - ~1,500 new indexable pages
  - Sitemap update to include all

Build optimization:
  - Use generateStaticParams() with limited set (top 100)
  - Rest are dynamicParams: true (ISR on first visit)
  - revalidate: 3600 (1 hour)
```

### D2. Remaining Free Tools (Day 37-40)

**D2.1 Stock Comparison Tool** `/tools/compare-stocks`
```
- Enter 2-5 tickers side by side
- Compare: Pulse Score, financials, valuation, growth, momentum
- Visual: overlaid spider charts
- AI: "Stock A is better for growth, Stock B for value"
- SEO: "compare AAPL vs MSFT", "NVDA vs AMD comparison"
```

**D2.2 Dividend Calculator** `/tools/dividend-calculator`
```
- Enter ticker + investment amount + time horizon
- Shows: annual income, yield on cost, DRIP growth projection
- Compare: dividend growth rate vs inflation
- SEO: "AAPL dividend calculator", "dividend income calculator"
```

**D2.3 Valuation Calculator** `/tools/dcf-calculator`
```
- Pre-filled DCF model for any S&P 500 stock
- User adjustable: growth rate, discount rate, terminal multiple
- Shows: intrinsic value vs current price (% upside/downside)
- Visual: sensitivity table (growth vs discount rate matrix)
- SEO: "AAPL fair value", "stock DCF calculator free"
```

**D2.4 Insider Trading Tracker** `/tools/insider-tracker`
```
- Real-time feed of notable insider trades across all stocks
- Filter: buys only, large trades ($1M+), C-suite only
- AI context for each trade
- Cluster detection: "3 insiders at XYZ bought this week"
- SEO: "insider trading tracker", "insider buying today"
```

### D3. Blog Content Pipeline (Day 41-43)

```
Target: 30 posts (from current 6)

Content categories:
1. Earnings Analysis Posts (12 posts)
   - "[TICKER] Q[N] Earnings: AI Analysis & Key Takeaways"
   - Auto-generated from C1 earnings analysis data
   - Template: summary, key numbers, sentiment, promises, what to watch
   - Published within 24 hours of earnings

2. Educational Content (8 posts)
   - "How to Read a Balance Sheet in 5 Minutes"
   - "What Insider Buying Really Tells You"
   - "Understanding P/E Ratio: When High is OK"
   - "The 7 Financial Ratios Every Investor Should Know"
   - "How to Spot Accounting Red Flags in 10-K Filings"
   - "What Is Free Cash Flow and Why It Matters More Than Earnings"
   - "Understanding Stock Buybacks: Good or Bad?"
   - "How to Build a Diversified Portfolio in 2026"

3. Market Commentary (6 posts)
   - "This Week in Markets: AI-Powered Summary"
   - Weekly auto-generated from aggregated signals
   - Sector rotation analysis
   - Upcoming earnings preview

4. Tool Guides (4 posts)
   - "How to Use the StoxPulse Pulse Score"
   - "Free Earnings Calendar: Never Miss Another Report"
   - "Portfolio Risk Scanner: Find Your Blind Spots"
   - "Understanding AI Stock Signals"

Implementation:
  - Earnings posts: semi-automated (AI draft + human edit)
  - Educational: manual, evergreen, SEO-optimized
  - Market commentary: fully automated via Inngest weekly job
  - Tool guides: manual, internal linking heavy
```

### D4. Glossary Expansion (Day 44-45)

```
Current: 20 terms
Target: 100 terms (batch 1), 300+ (ongoing)

Strategy:
  - Generate terms from keyword research (finance terms with search volume)
  - Each term: 300-500 word definition + example + related terms
  - Cross-link to stock pages where relevant
  - DefinedTerm schema markup (already implemented)

Priority terms (by search volume):
  - Options terminology (calls, puts, strike price, expiration, IV)
  - Technical indicators (RSI, MACD, Bollinger Bands, support/resistance)
  - Fundamental metrics (EBITDA, working capital, book value, float)
  - Market concepts (short selling, margin, market maker, dark pool)
  - Macro terms (yield curve, Fed funds rate, inflation, GDP)
```

### D5. Sector Deep-Dive Pages (Day 46-47)

```
Upgrade existing 11 sector pages:

Current: Basic sector listing with stock links
Enhanced:
  - Sector heatmap (stocks sized by market cap, colored by daily change)
  - Sector Pulse Score (average of constituent stocks)
  - Top 5 / Bottom 5 stocks by Pulse Score
  - Sector financial metrics table (avg P/E, growth, margin)
  - AI sector analysis: trends, rotation signals, macro sensitivity
  - Earnings calendar for sector
  - Recent sector news (scored)
  - Historical sector performance chart
  - Cross-link to related sectors
```

### D6. Stock Screener Page (Day 48-50)

```
app/screener/page.tsx — The free stock screener

Filters (grouped):
  Pulse Score: A+ through F (checkboxes)
  Dimensions: Value/Growth/Health/Momentum/Sentiment (min sliders)
  Valuation: P/E range, P/B range, P/S range, EV/EBITDA range
  Financials: Revenue growth %, margin %, ROE %, D/E ratio
  Dividends: Yield %, payout ratio, dividend growth
  Technical: vs 52W high %, vs 200MA, volume trend
  Sector: 11 sector checkboxes
  Market Cap: Mega/Large/Mid/Small

Results:
  - Table with sortable columns
  - Mini Pulse Score radar per stock
  - Quick-add to watchlist
  - Export CSV (email-gated)

Performance:
  - All filtering client-side (load all 503 stocks with pre-computed scores)
  - No server round-trips for filter changes
  - Virtual scrolling for large result sets

SEO: Target "free stock screener", "AI stock screener", "stock screener with ratings"
Schema: SoftwareApplication
```

---

## Implementation Timeline

```
Week 1 (Day 1-7):   Phase B1-B4
  - Critical fixes, watchlist, missing tools, Inngest setup
  - MILESTONE: App is functional, tools work, background jobs running

Week 2 (Day 8-14):  Phase B5-B6
  - Pulse Score engine + UI, enhanced dashboard
  - MILESTONE: Every stock has a Pulse Score, dashboard is useful

Week 3 (Day 15-21): Phase C1-C2
  - Earnings call AI analyzer, SEC filing monitor
  - MILESTONE: First real earnings analysis published

Week 4 (Day 22-28): Phase C3-C4
  - News intelligence scoring, email digest system
  - MILESTONE: News feeds show importance scores, first email sent

Week 5 (Day 29-36): Phase C5 + D1
  - Promise tracker, expand to 500 stocks
  - MILESTONE: 1,500+ pages indexed, promise tracking live

Week 6 (Day 37-43): Phase D2-D3
  - 4 new tools, blog content pipeline
  - MILESTONE: 30+ blog posts, 7+ free tools

Week 7 (Day 44-50): Phase D4-D6
  - Glossary expansion, sector upgrades, stock screener
  - MILESTONE: 300+ glossary terms, screener live, full product
```

---

## Success Metrics

| Metric | Current | After Phase B | After Phase C | After Phase D |
|--------|---------|---------------|---------------|---------------|
| Indexable pages | 145 | ~160 | ~170 | 2,000+ |
| Free tools | 3 | 5 | 5 | 9 |
| Organic traffic/mo | ~0 | 500 | 2,000 | 10,000+ |
| Watchlist users | 0 | 100+ | 500+ | 2,000+ |
| Email subscribers | 0 | 0 | 200+ | 1,000+ |
| Avg time on site | ~1 min | 3 min | 5 min | 7 min |
| Stock coverage | 50 | 50 | 50 | 503 |
| Blog posts | 6 | 6 | 10 | 30+ |
| Glossary terms | 20 | 20 | 20 | 100+ |

---

## Technical Standards

### Performance Targets
- LCP < 1.5s on all pages
- CLS < 0.05
- FID < 50ms
- Lighthouse score > 95 on all pages
- API response time < 500ms (cached), < 2s (uncached)

### Code Quality
- TypeScript strict mode (already enforced)
- Zero console.log in production (console.error/warn OK for error paths)
- All AI outputs validated against JSON schema before rendering
- Graceful degradation: if AI fails, show raw data (never blank)
- All API routes rate-limited (simple in-memory for now)
- Error boundaries on every dynamic section

### SEO Standards
- Every new page: unique meta title + description
- Every new page: JSON-LD schema markup
- Every new page: OG image (dynamic for stock pages, static for tools)
- Every new tool: SoftwareApplication schema
- Internal linking: every page links to 3+ related pages
- Breadcrumbs on all pages
- Canonical URLs on all pages

### Design Standards
- Dark-first (matches brand, reduces eye strain for market watchers)
- Information density without clutter (Finviz principle)
- Every number color-coded: green (positive), red (negative), gray (neutral)
- Loading states: skeleton UI, never blank
- Mobile-first responsive (all tools work on mobile)
- Animations: subtle, purposeful (Framer Motion, <300ms)
- Typography: Space Grotesk for headings, Inter for body (already set)

---

## API Cost Projection

| Provider | Current | After Full Implementation | Monthly Cost |
|----------|---------|---------------------------|-------------|
| FMP | ~100 calls/day | ~2,000 calls/day | $22/mo (Starter) |
| Finnhub | ~50 calls/day | ~500 calls/day | Free (60/min) |
| EDGAR | ~30 calls/day | ~200 calls/day | Free |
| Gemini | ~10 calls/day | ~500 calls/day | Free tier (15 RPM) |
| Resend | 0 | ~100 emails/day | Free (<3K/mo) |
| Inngest | 0 | ~1,000 events/day | Free (<25K/mo) |
| **Total** | **$22/mo** | **$22/mo** | **$22/mo** |

Note: If FMP Starter plan limits are hit, upgrade to Professional ($44/mo) for 750 calls/min. Gemini free tier supports 15 RPM / 1M tokens/day — sufficient for 500 analyses/day.

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| FMP rate limits hit | File cache with aggressive TTL, stagger Inngest jobs |
| Gemini quality varies | Temperature 0.2, structured JSON output, validation layer |
| Transcript not available | Graceful fallback: show "Analysis pending" + raw financial data |
| Email deliverability | Use Resend (good reputation), DKIM/SPF setup on stoxpulse.com |
| Build times with 500 stocks | ISR with on-demand revalidation, only pre-render top 100 |
| Cache disk usage | Weekly cleanup job via Inngest, 7-day max retention |
| AI hallucination in analysis | Every claim must cite specific numbers from input data (enforced in prompt) |

---

## What This Gives Us vs Competitors

| Feature | StoxPulse | Simply Wall St | TipRanks | Danelfin | Gainify |
|---------|-----------|---------------|----------|----------|---------|
| Composite Score (visual) | Pulse Score | Snowflake | Smart Score | AI Score | 5-Point |
| Earnings Call AI | Full transcript analysis | No | No | No | Basic summary |
| SEC Filing AI | Change detection + summaries | No | No | No | No |
| News Scoring (1-10) | Yes, AI-powered | No | Yes (basic) | Sentiment only | No |
| Promise Tracker | Yes (unique) | No | No | No | No |
| Free Tools | 9 tools | 1 | 2 | 0 | 2 |
| Daily AI Digest | Email + in-app | No | Email (basic) | No | No |
| Insider Context | AI-analyzed | Basic | Yes | No | Yes |
| Price | Free / $19 / $49 | $10-$20 | $30-$50 | $25-$50 | $8-$27 |
| Stock Coverage | S&P 500 | Global | Global | Global | Global |

**Our unique moat: Earnings Call AI + Filing Change Detection + Promise Tracker + News Scoring. No single competitor has all four.**
