# StoxPulse UI/UX Design Plan

## Design Philosophy

**"Bloomberg depth, Robinhood simplicity, Apple polish."**

Three core principles borrowed from Apple HIG:
1. **Clarity** — Every element instantly understandable. Data is the star, not chrome.
2. **Deference** — UI defers to content. Minimal borders, subtle surfaces, bold data.
3. **Depth** — Surface elevation layers convey hierarchy. Progressive disclosure reveals complexity.

---

## Design System Refinements

### Typography Scale (tabular-nums everywhere)

| Element | Font | Size | Weight | Use |
|---------|------|------|--------|-----|
| Big Number | Space Grotesk | 36px | 700 | Stock price, portfolio value |
| Page Title | Space Grotesk | 28px | 700 | Page headings |
| Section Header | Space Grotesk | 20px | 600 | Card group titles |
| Card Title | Inter | 16px | 600 | Individual card headers |
| Body | Inter | 14px | 400 | Descriptions, paragraphs |
| Data Label | Inter | 12px | 500 | Metric labels (muted) |
| Data Value | Inter | 14px | 600 | Metric values |
| Caption | Inter | 11px | 400 | Timestamps, footnotes |

**Critical**: `font-variant-numeric: tabular-nums` on ALL number displays.

### Color Refinements

Keep existing brand/semantic colors. Add muted variants:

```
--color-positive-muted: oklch(72% 0.19 155 / 0.15)   /* green bg fill */
--color-negative-muted: oklch(60% 0.22 25 / 0.15)    /* red bg fill */
--color-warning-muted: oklch(75% 0.15 85 / 0.15)     /* yellow bg fill */
--color-info-muted: oklch(65% 0.15 250 / 0.15)        /* blue bg fill */
```

**Accessibility rule**: Never use red/green alone. Always pair with directional arrows (▲▼) or +/- signs.

### Surface & Elevation

```
surface-0  →  Page background (darkest)
surface-1  →  Cards, panels
surface-2  →  Hover states, elevated elements
surface-3  →  Popovers, dropdowns, command palette
glass      →  Floating overlays (frosted glass effect)
```

---

## Information Architecture

### Sidebar Navigation (Collapsible)

```
[Logo] StoxPulse

── MAIN ──────────────────
📊  Dashboard          (/)
👁  Watchlist          (/watchlist)
📈  Markets           (/markets)

── INTELLIGENCE ──────────
🎯  Signals           (/signals)
📞  Earnings          (/earnings)
📄  Filings           (/filings)
📰  News              (/news)

── TOOLS ─────────────────
🔍  Screener          (/screener)
⚙️  Settings          (/settings)
```

### What Each Page Shows

**Dashboard** — The command center. Bento grid layout:
- Market pulse bar (S&P 500, NASDAQ, DOW — mini sparklines)
- Watchlist summary (top movers from user's list)
- Today's signals (actionable alerts)
- Upcoming earnings (this week)
- Recent AI insights (latest analyses)

**Watchlist** — Portfolio tracker:
- Sortable table: Ticker, Price, Change, Market Cap, P/E, PulseScore
- Toggle: Grid view (cards) vs List view (table)
- Quick-add ticker input
- Sector breakdown donut chart

**Stock Detail** (/stocks/[ticker]) — The analysis powerhouse:
- Tabs: Overview | Financials | Analysis | News | Ownership

**Signals** — AI-generated actionable intelligence:
- Feed of cards: Earnings beats/misses, insider buys, price targets, filing alerts
- Filter by: type, ticker, severity, date
- Each card is self-contained with action

**Earnings** — Calendar + analysis:
- Week view calendar with reporting companies
- Analyzed transcripts with AI summaries
- Beat/miss history charts

**Filings** — SEC filing monitor:
- Recent filings for watchlist stocks
- AI-parsed summaries of 10-K, 10-Q, 8-K
- Quick links to SEC EDGAR originals

**News** — Sentiment-analyzed feed:
- Aggregated from FMP + Finnhub
- Sentiment badges (bullish/bearish/neutral)
- Filter by ticker, source, sentiment

---

## Stock Detail Page — Deep Design

### Tab 1: Overview (Default)

```
┌─────────────────────────────────────────────────────┐
│ ← Back to Watchlist                                  │
│                                                       │
│ AAPL                          Technology · NASDAQ     │
│ Apple Inc.                                           │
│                                                       │
│ $260.29        -$2.23 (-0.85%) ▼    After Hours: ... │
│ ████████████████████████████ (52w: $169 — $289)      │
│                                                       │
├──────────┬──────────┬──────────┬────────────────────┤
│ Overview │Financials│ Analysis │ News    │ Ownership │
├──────────┴──────────┴──────────┴────────────────────┤
│                                                       │
│  ┌─ Key Stats ────────┐  ┌─ AI Insight ───────────┐ │
│  │ Market Cap   3.83T  │  │ 🤖 StoxPulse AI        │ │
│  │ P/E          29.4   │  │                         │ │
│  │ EPS          $7.49  │  │ Apple reported strong   │ │
│  │ 52w High    $288.62 │  │ Q1 results with 4%     │ │
│  │ 52w Low     $169.21 │  │ revenue growth driven   │ │
│  │ Avg Volume   48.2M  │  │ by Services (+14%)...   │ │
│  │ Dividend     0.40%  │  │                         │ │
│  │ Beta         1.12   │  │ [Read Full Analysis →]  │ │
│  └─────────────────────┘  └─────────────────────────┘ │
│                                                       │
│  ┌─ Upcoming Events ──────────────────────────────┐  │
│  │ 📅 Earnings: Apr 24, 2026 (AMC)               │  │
│  │ 💰 Ex-Dividend: Feb 7, 2026                    │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  ┌─ Recent Signals ───────────────────────────────┐  │
│  │ 🟢 Earnings Beat — Q1 2026: EPS $2.84 vs      │  │
│  │    $2.67 est (+6.4%)                           │  │
│  │ 🔵 Insider Buy — Tim Cook bought 100K shares   │  │
│  │ 🟡 Analyst — Morgan Stanley raised PT to $280  │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  ┌─ Company Profile ─────────────────────────────┐  │
│  │ Apple designs, manufactures, and markets...    │  │
│  │ CEO: Timothy D. Cook · 164,000 employees      │  │
│  │ Founded: 1976 · Cupertino, CA                  │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  ┌─ Peer Comparison ─────────────────────────────┐  │
│  │ MSFT  $420.15  +1.2%  ▲   P/E 35.2           │  │
│  │ GOOGL $175.80  -0.3%  ▼   P/E 24.1           │  │
│  │ META  $612.40  +2.1%  ▲   P/E 28.5           │  │
│  └────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────┘
```

### Tab 2: Financials

- Income Statement / Balance Sheet / Cash Flow sub-tabs
- Annual vs Quarterly toggle
- Bar chart visualization for Revenue + Net Income trend
- Table with historical data (sortable, 10 years)
- Key ratios: Gross Margin, Operating Margin, Net Margin, ROE, ROA

### Tab 3: Analysis

- Wall Street consensus: Buy/Hold/Sell distribution bar
- Price target range (low / avg / high) vs current price
- EPS estimates chart (next 4 quarters)
- Earnings surprise history (last 8 quarters)
- Revenue estimates chart

### Tab 4: News

- Merged feed: News articles + SEC filings + earnings transcripts
- Each item: sentiment badge, source, time, headline
- Filter by type: All | News | Filings | Earnings

### Tab 5: Ownership

- Institutional holders table (top 10)
- Insider transactions list (buys highlighted, sells muted)
- Insider buy/sell ratio visualization

---

## Signal Card Design

The core UI primitive for actionable intelligence:

```
┌────────────────────────────────────────────────┐
│ 🟢 EARNINGS BEAT                    2 hours ago │
│                                                  │
│ AAPL · Apple Inc.                               │
│ Q1 2026 EPS: $2.84 vs $2.67 est (+6.4%)       │
│ Revenue: $124.3B vs $123.1B est (+1.0%)        │
│                                                  │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░ (mini sparkline)    │
│                                                  │
│ [View Analysis →]              [Dismiss]         │
└────────────────────────────────────────────────┘
```

Signal types and their visual treatment:

| Type | Left Border | Icon | Badge Color |
|------|-------------|------|-------------|
| Earnings Beat | green | ▲ | positive |
| Earnings Miss | red | ▼ | negative |
| Insider Buy | blue | 👤 | info |
| Insider Sell | orange | 👤 | warning |
| Price Target Up | green | 🎯 | positive |
| Price Target Down | red | 🎯 | negative |
| New Filing | slate | 📄 | default |
| AI Insight | brand | 🤖 | brand |

---

## Dashboard Bento Grid Layout

```
Desktop (xl):
┌──────────────────┬─────────────┐
│                  │             │
│  Market Pulse    │  Signals    │
│  (indices bar)   │  Feed       │
│                  │  (scrollable│
├────────┬─────────┤   card list)│
│        │         │             │
│Watchlist│Earnings │             │
│(top 8) │Calendar │             │
│        │(this wk)│             │
│        │         │             │
├────────┴─────────┤             │
│                  │             │
│  AI Insights     │             │
│  (latest 3)      │             │
│                  │             │
└──────────────────┴─────────────┘

Mobile:
┌─────────────────┐
│  Market Pulse   │
├─────────────────┤
│  Signals (3)    │
├─────────────────┤
│  Watchlist      │
├─────────────────┤
│  Earnings       │
├─────────────────┤
│  AI Insights    │
└─────────────────┘
```

---

## Component Inventory

### New Components Needed

**Layout:**
- `MarketPulseBar` — Horizontal strip showing S&P 500, NASDAQ, DOW with sparklines
- `BentoGrid` — CSS Grid wrapper with responsive column spanning
- `CommandPalette` — Cmd+K search overlay (search tickers, navigate pages)

**Data Display:**
- `StockPrice` — Big number with change indicator (▲▼ + color)
- `MetricCard` — Label + value + optional trend arrow
- `MetricGrid` — Grid of MetricCards for key stats
- `FiftyTwoWeekBar` — Visual range bar showing current price position
- `SparkLine` — Tiny inline chart (SVG, no library needed)
- `PeerTable` — Compact comparison table for related stocks
- `FinancialTable` — Sortable table for income/balance/cash flow data
- `FinancialChart` — Bar/line chart for revenue/income trends

**Signals & Alerts:**
- `SignalCard` — The core signal primitive (see design above)
- `SignalFeed` — Scrollable feed of SignalCards with filters
- `SignalBadge` — Type indicator (beat/miss/buy/sell/filing)

**Stock Detail:**
- `StockHeader` — Ticker, name, price, change, exchange badge
- `StockTabs` — Tab navigation (Overview/Financials/Analysis/News/Ownership)
- `KeyStats` — Grid of key financial metrics
- `AIInsight` — AI analysis card with robot icon
- `UpcomingEvents` — Calendar of next events for this stock
- `EarningsSurpriseChart` — Last 8 quarters beat/miss visualization
- `InsiderTable` — Sortable insider transaction table
- `FilingsList` — SEC filings with type badges and AI summaries

**Navigation:**
- `AppSidebar` — Refined collapsible sidebar (already exists, needs update)
- `StockSearch` — Ticker search input with autocomplete

---

## Implementation Plan

### Phase 1: Foundation (Design System + Layout Shell)
1. Update `globals.css` with muted color variants and tabular-nums
2. Create `StockPrice` component
3. Create `MetricCard` component
4. Create `SignalCard` component
5. Create `SignalBadge` component
6. Create `SparkLine` component (pure SVG)
7. Create `FiftyTwoWeekBar` component
8. Refine `AppSidebar` with new nav structure

### Phase 2: Dashboard Rebuild
1. Create `MarketPulseBar` with live index data
2. Build bento grid dashboard layout
3. Rebuild `WatchlistGrid` with live data from API
4. Build `SignalFeed` for dashboard
5. Build `EarningsCalendarCard` for upcoming earnings
6. Build `AIInsightsCard` for latest analyses

### Phase 3: Stock Detail Page
1. Create `StockHeader` with live quote data
2. Create `StockTabs` navigation
3. Build Overview tab (KeyStats, AIInsight, UpcomingEvents, PeerTable)
4. Build Financials tab (FinancialTable with income/balance/cash flow)
5. Build News tab (merged news + filings feed)
6. Build Ownership tab (InsiderTable)

### Phase 4: Signals Page
1. Build full signals feed with filtering
2. Connect to all data sources (earnings, filings, insider trades)
3. Signal importance scoring

### Phase 5: Supporting Pages
1. Earnings calendar page
2. Filings monitor page
3. News aggregator page
4. Screener page (basic filters)

---

## Tech Decisions

- **Charts**: Recharts (already compatible with shadcn/ui, SSR-friendly)
- **Tables**: @tanstack/react-table (for sortable financial data)
- **No heavy charting lib**: SparkLines will be pure SVG (no TradingView dependency)
- **Data fetching**: Server Components fetch via `lib/data/index.ts`, passed to client components
- **Real-time**: Not in v1. ISR revalidation (15 min for quotes, 1 hr for financials)
- **Command palette**: cmdk library (same as shadcn/ui uses internally)

---

## Design References

- Bloomberg Terminal — data density + progressive disclosure
- Koyfin — terminal-style command bar + clean dark UI
- Simply Wall St — Snowflake visualization + infographic approach
- Robinhood — single-number focus + card-based modularity
- Linear — monochrome base + bold typography + dark-first
- Apple Stocks — sparkline watchlists + density toggle
- Apple HIG — clarity, deference, depth + accessibility-first color
