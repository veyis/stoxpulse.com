# StoxPulse SEO Master Plan — Complete Implementation Guide

> Goal: Rank #1 on Google for AI stock analysis keywords + get cited by AI search engines
> Timeline: 12 weeks to full implementation
> Current state: 4 indexable pages, no content, no structured data, no programmatic pages
> Research completed: March 5, 2026 — Competitive analysis, keyword research, technical SEO, schema markup

---

## Research Findings (Pre-Plan Intelligence)

### Competitive Landscape Summary

| Platform | Monthly Visits | Organic % | Pages | SEO Model |
|---|---|---|---|---|
| Yahoo Finance | #205 globally | Moderate | Tens of millions | News + data authority |
| Motley Fool | 29.2M | ~30% | ~2M | Editorial (700+ articles/mo, 18-person SEO team) |
| Finviz | 15.86M | ~5% | Small | Tool-only, NO content (weak SEO) |
| Seeking Alpha | 14.5M | ~13% | Millions | UGC (400 articles/day, 18K contributors) |
| TipRanks | 8.14M | **~33%** | Hundreds of K | Data + AI analysis + glossary |
| Simply Wall St | 4.46M | **~35%** | Hundreds of K | **Best programmatic SEO** + visual |
| Morningstar | 3.5M search | Moderate | Millions | Research reports + education |
| Koyfin | 1.15M | **~8%** | Small | SaaS tool-first (**weakest SEO**) |

**Key competitive insights:**
1. **Simply Wall St** has the best programmatic SEO URL structure: `/stocks/{country}/{sector}/{exchange-ticker}/{company-name}` — maximum keyword density in URL
2. **Seeking Alpha** dominates with UGC model (400 articles/day) — unbeatable editorially, but AI-generated per-stock analysis can match volume
3. **TipRanks** has the strongest organic search ratio (33%) — their glossary + screener + AI analysis pages drive this
4. **Schema markup is underused across ALL competitors** — none use FinancialProduct, Dataset, or speakable. This is our differentiation opportunity
5. **Koyfin is the weakest SEO competitor** (8% organic) — closest to our current stage, their gap is our opportunity
6. **Earnings transcripts are high-value SEO content** — "[TICKER] earnings transcript" is a major Seeking Alpha traffic driver
7. **Title pattern standard:** `{Company Name} ({TICKER}) {Page Type} | {Brand}`

### Keyword Research Summary

**200+ keyword opportunities identified across 7 categories.**

| Category | Example Keywords | Volume Range | Difficulty | Priority |
|---|---|---|---|---|
| Ticker earnings | "NVDA earnings", "TSLA earnings summary" | 10K-7.5M/mo per ticker | Low | **Highest** |
| AI stock tools | "AI stock analysis tool", "AI earnings analyzer" | 1K-5K/mo | Low (growing 150-200% YoY) | **Very High** |
| Stock glossary | "what is EPS", "P/E ratio meaning" | 5K-40K/mo per term | Medium | High |
| Competitor alts | "seeking alpha alternative", "bloomberg alternative" | 2K-5K/mo | Medium | High |
| Earnings calendar | "earnings calendar", "who reports today" | 25K-90K/mo | High | High |
| SEC filings | "how to read 10-K", "SEC filings explained" | 2K-15K/mo | Low | Medium |
| Stock research | "how to research stocks", "best stock tools" | 3K-8K/mo | Medium | Medium |

**Strategic insights from keyword research:**
- **91.8% of financial search queries are long-tail** — new domains should target these first
- **27% of finance keywords trigger featured snippets** — FAQ/definition format is critical
- **AI + finance keywords growing 150-200% YoY** — low competition because they're emerging
- **Ticker earnings pages are a programmatic goldmine** — repeatable across 500+ stocks with massive cumulative volume
- Full keyword research saved at `docs/seo-keyword-research.md`

### Technical SEO Findings (Next.js 16 Specific)

1. **Don't pre-render all 3,000 stock pages at build time.** Pre-render top 200 tickers, let rest generate on-demand via ISR with `dynamicParams = true`
2. **Use PPR (Partial Prerendering)** with `experimental.ppr = true` — static shell loads instantly, dynamic data streams via Suspense
3. **Split sitemaps** using `generateSitemaps()` — needed for 3,000+ URLs (Google caps at 50,000 per file)
4. **Per-ticker OG images on Edge runtime** — keep bundle under 500KB, auto-cached by CDN
5. **Request memoization** — `generateMetadata` and page component share fetch calls automatically (no duplicate requests)
6. **Granular AI bot control** — Anthropic now has 3 bots (ClaudeBot, Claude-SearchBot, Claude-User), OpenAI has 3 (GPTBot, OAI-SearchBot, ChatGPT-User)

### Schema Markup Findings

**Key discoveries for finance-specific schema:**
- `Corporation` with `tickerSymbol` property is the official way to reference stocks in schema.org
- `Dataset` schema signals machine-readable financial data to AI engines (critical for GEO, no rich result but high AI citation value)
- `speakable` property marks content for voice/AI reading — use on stock summaries and key takeaways
- `DefinedTerm` + `DefinedTermSet` for glossary terms (helps AI understand definitions)
- FAQPage rich results partially restored for high-authority sites in 2026
- Google deprecated Sitelinks Search Box (Nov 2024) but WebSite schema still provides context
- **No competitor uses Dataset, speakable, or DefinedTerm** — first-mover advantage

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Phase 1: Technical SEO Foundation (Week 1-2)](#phase-1-technical-seo-foundation)
3. [Phase 2: Structured Data & Schema (Week 2-3)](#phase-2-structured-data--schema)
4. [Phase 3: Programmatic Stock Pages (Week 3-5)](#phase-3-programmatic-stock-pages)
5. [Phase 4: Competitor & Alternative Pages (Week 5-6)](#phase-4-competitor--alternative-pages)
6. [Phase 5: Blog Infrastructure & Content (Week 6-8)](#phase-5-blog-infrastructure--content)
7. [Phase 6: Free Tools (Week 8-10)](#phase-6-free-tools)
8. [Phase 7: Financial Glossary (Week 10-11)](#phase-7-financial-glossary)
9. [Phase 8: Earnings Calendar (Week 11-12)](#phase-8-earnings-calendar)
10. [Phase 9: AI Search (GEO) Optimization (Ongoing)](#phase-9-ai-search-geo-optimization)
11. [Phase 10: Off-Page SEO & Launch (Ongoing)](#phase-10-off-page-seo--launch)
12. [Technical Architecture](#technical-architecture)
13. [Keyword Strategy](#keyword-strategy)
14. [Internal Linking Architecture](#internal-linking-architecture)
15. [Content Production Schedule](#content-production-schedule)
16. [KPIs & Measurement](#kpis--measurement)

---

## Executive Summary

### The Problem
StoxPulse has 4 indexable pages. Google has nothing to rank us for. We have zero topical authority, zero backlinks, and zero content. We're invisible.

### The Strategy
Build a **content moat** of 500+ high-quality pages across 7 content types, all interlinked, all schema-enriched, all optimized for both Google and AI search engines. The compound effect of topical authority + programmatic pages + content marketing will create exponential traffic growth.

### Expected Outcomes (12 months)
- **Month 3**: 50-100 indexed pages, first organic traffic from long-tail keywords
- **Month 6**: 300+ indexed pages, 5K-15K monthly organic visits
- **Month 9**: 500+ indexed pages, 20K-50K monthly organic visits
- **Month 12**: 1000+ indexed pages, 50K-150K monthly organic visits

### Page Count Targets
| Content Type | Pages at Launch | Pages at 6 months | Pages at 12 months |
|---|---|---|---|
| Stock pages (`/stocks/[ticker]`) | 500 (S&P 500) | 1,500 | 3,000+ |
| Blog posts (`/blog/[slug]`) | 10 | 40 | 100+ |
| Glossary terms (`/glossary/[term]`) | 50 | 150 | 300+ |
| Comparison pages (`/compare/`) | 10 | 25 | 50+ |
| Alternative pages (`/alternatives/`) | 7 | 15 | 25+ |
| Free tools (`/tools/`) | 1 | 3 | 5+ |
| Earnings calendar (`/earnings/`) | 5 | 20 | 52+ (weekly) |
| **TOTAL** | **583** | **1,753** | **3,532+** |

---

## Phase 1: Technical SEO Foundation

**Timeline: Week 1-2**
**Impact: HIGH — Unblocks everything else**

### 1.1 Update robots.txt for AI Crawlers

The current robots.txt blocks `/api/` and `/dashboard`. We need to also explicitly ALLOW AI search crawlers while blocking AI training-only crawlers.

**File: `app/robots.ts`**

```typescript
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/"],
      },
      // Allow AI search/retrieval bots (appear in AI answers)
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: ["/api/", "/dashboard/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/api/", "/dashboard/"],
      },
      {
        userAgent: "Claude-Web",
        allow: "/",
        disallow: ["/api/", "/dashboard/"],
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: ["/api/", "/dashboard/"],
      },
      // Block AI training-only crawlers (prevent content scraping)
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "Google-Extended",
        disallow: "/",
      },
      {
        userAgent: "CCBot",
        disallow: "/",
      },
      {
        userAgent: "anthropic-ai",
        disallow: "/",
      },
    ],
    sitemap: "https://stoxpulse.com/sitemap.xml",
  };
}
```

**Rationale**: Allow retrieval bots (ChatGPT-User, PerplexityBot, Claude-Web) so we appear in AI answers. Block training bots (GPTBot, Google-Extended, CCBot, anthropic-ai) to protect our content from being used for model training without citation.

### 1.2 Upgrade Root Layout Metadata

**File: `app/layout.tsx`**

Enhance the root metadata with more keyword-rich, comprehensive metadata:

```typescript
export const metadata: Metadata = {
  metadataBase: new URL("https://stoxpulse.com"),
  title: {
    default: "StoxPulse — AI Earnings Call Analysis & SEC Filing Monitor | Free Stock Intelligence",
    template: "%s | StoxPulse",
  },
  description:
    "AI-powered stock intelligence that reads earnings calls, SEC filings, and financial news for your watchlist. Get 2-minute earnings summaries, insider alerts, and sentiment analysis. Free to start.",
  keywords: [
    "AI stock analysis",
    "earnings call analyzer",
    "earnings call summary",
    "SEC filing monitor",
    "stock intelligence",
    "AI investing tool",
    "earnings transcript summary",
    "stock sentiment analysis",
    "insider trading alerts",
    "10-K filing analyzer",
  ],
  authors: [{ name: "StoxPulse", url: "https://stoxpulse.com" }],
  creator: "StoxPulse",
  publisher: "StoxPulse",
  openGraph: {
    title: "StoxPulse — AI Earnings Call Analysis & SEC Filing Monitor",
    description:
      "AI reads earnings calls, SEC filings, and financial news for your watchlist. 2-minute summaries. Instant alerts. Free to start.",
    type: "website",
    url: "https://stoxpulse.com",
    siteName: "StoxPulse",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "StoxPulse — AI Stock Intelligence",
    description:
      "Your AI analyst. Reads earnings calls, SEC filings & news so you don't have to.",
    creator: "@stoxpulse",
  },
  alternates: {
    canonical: "https://stoxpulse.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
```

### 1.3 Add FAQ Section to Landing Page

Add a FAQ section before the CTA on the homepage. FAQs trigger featured snippets and AI citations.

**File: `components/landing/faq.tsx`**

Target questions:
1. "What is StoxPulse?" — definition block for AI extraction
2. "How does AI earnings call analysis work?"
3. "Is StoxPulse free?"
4. "What SEC filings does StoxPulse monitor?"
5. "How is StoxPulse different from Seeking Alpha?"
6. "Can AI really analyze stocks?"
7. "What stocks does StoxPulse cover?"
8. "How fast do I get earnings call summaries?"

Each answer should be 40-60 words (optimal for snippet extraction), contain statistics where possible, and cite authoritative sources.

### 1.4 Optimize Core Web Vitals

**Checklist:**
- [ ] Verify `display: "swap"` on fonts (already done)
- [ ] Add `priority` prop to above-fold images
- [ ] Lazy load below-fold components with `dynamic()` or `React.lazy()`
- [ ] Minimize JavaScript bundle — analyze with `@next/bundle-analyzer`
- [ ] Ensure all images use `next/image` with proper `sizes` attribute
- [ ] Add `loading="lazy"` to below-fold images
- [ ] Check LCP < 2.5s, INP < 200ms, CLS < 0.1
- [ ] Use `<link rel="preconnect">` for external API domains

### 1.5 Create Web App Manifest

**File: `app/manifest.ts`**

```typescript
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StoxPulse — AI Stock Intelligence",
    short_name: "StoxPulse",
    description: "AI reads earnings calls, SEC filings & news for your watchlist",
    start_url: "/",
    display: "standalone",
    background_color: "#0f1118",
    theme_color: "#34d399",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
```

---

## Phase 2: Structured Data & Schema

**Timeline: Week 2-3**
**Impact: HIGH — Enables rich results + AI citation boost of 30-40%**

### 2.1 Create Reusable JSON-LD Component

**File: `components/json-ld.tsx`**

```typescript
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

### 2.2 Homepage Schema (Organization + WebSite + SoftwareApplication)

**File: `app/page.tsx`** — Add at the top of the component:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://stoxpulse.com/#organization",
      "name": "StoxPulse",
      "url": "https://stoxpulse.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://stoxpulse.com/logo.png",
        "width": 512,
        "height": 512
      },
      "sameAs": [
        "https://twitter.com/stoxpulse",
        "https://linkedin.com/company/stoxpulse"
      ],
      "description": "AI-powered stock intelligence platform that analyzes earnings calls, SEC filings, and financial news."
    },
    {
      "@type": "WebSite",
      "@id": "https://stoxpulse.com/#website",
      "name": "StoxPulse",
      "url": "https://stoxpulse.com",
      "publisher": { "@id": "https://stoxpulse.com/#organization" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://stoxpulse.com/stocks/{search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "SoftwareApplication",
      "name": "StoxPulse",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web",
      "url": "https://stoxpulse.com",
      "description": "AI-powered stock intelligence that reads earnings calls, SEC filings, and financial news for your watchlist.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Free tier with 5 stocks. Pro at $29/mo."
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "0",
        "bestRating": "5"
      }
    }
  ]
}
```

NOTE: Only add `aggregateRating` once we have real reviews. Remove until then.

### 2.3 FAQPage Schema (Homepage + Stock Pages)

For any page with an FAQ section:

```json
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is StoxPulse?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "StoxPulse is an AI-powered stock intelligence platform that analyzes earnings calls, SEC filings, and financial news for your watchlist. It provides 2-minute earnings summaries, insider transaction alerts, and sentiment analysis to help retail investors make informed decisions."
      }
    }
  ]
}
```

### 2.4 BreadcrumbList Schema (All Sub-Pages)

Create a reusable breadcrumb component with schema:

```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://stoxpulse.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Stocks",
      "item": "https://stoxpulse.com/stocks"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "NVDA",
      "item": "https://stoxpulse.com/stocks/nvda"
    }
  ]
}
```

### 2.5 Article Schema (Blog Posts)

```json
{
  "@type": "Article",
  "headline": "How to Read Earnings Calls Like a Pro",
  "description": "Complete guide to analyzing earnings calls...",
  "image": "https://stoxpulse.com/blog/og/earnings-call-guide.png",
  "datePublished": "2026-03-05",
  "dateModified": "2026-03-05",
  "author": {
    "@type": "Organization",
    "name": "StoxPulse",
    "url": "https://stoxpulse.com"
  },
  "publisher": { "@id": "https://stoxpulse.com/#organization" }
}
```

### 2.6 Additional Schema Types (From Research — No Competitor Uses These)

**Corporation with tickerSymbol** (on stock pages):
```json
{
  "@type": "Corporation",
  "name": "Apple Inc.",
  "tickerSymbol": "NASDAQ: AAPL",
  "url": "https://stoxpulse.com/stocks/aapl",
  "sameAs": ["https://www.apple.com", "https://en.wikipedia.org/wiki/Apple_Inc."]
}
```

**Dataset** (on stock pages and earnings calendar — critical for GEO/AI citation):
```json
{
  "@type": "Dataset",
  "name": "Apple Inc. (AAPL) Financial Analysis Data",
  "description": "AI-generated analysis including earnings call insights, SEC filing summaries, and news sentiment.",
  "url": "https://stoxpulse.com/stocks/aapl",
  "creator": { "@type": "Organization", "name": "StoxPulse" },
  "dateModified": "2026-03-05",
  "keywords": ["AAPL", "Apple", "stock analysis", "earnings calls"],
  "license": "https://stoxpulse.com/terms"
}
```

**speakable** (on stock summaries, blog key takeaways — marks content for AI/voice extraction):
```json
{
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".stock-summary", ".ai-analysis", ".key-takeaways"]
  }
}
```

**DefinedTerm + DefinedTermSet** (on glossary pages):
```json
{
  "@type": "DefinedTerm",
  "name": "Earnings Per Share (EPS)",
  "description": "A company's net profit divided by its outstanding shares...",
  "inDefinedTermSet": {
    "@type": "DefinedTermSet",
    "name": "StoxPulse Stock Market Glossary",
    "url": "https://stoxpulse.com/glossary"
  }
}
```

### 2.7 Schema Per Page Type Summary (Complete)

| Page Type | Schema Types |
|---|---|
| Homepage | Organization, WebSite, WebApplication, FAQPage |
| Stock page | Corporation (tickerSymbol), WebPage, Dataset, FAQPage, BreadcrumbList, speakable |
| Blog post | Article (with author + mentions), BreadcrumbList, FAQPage, speakable |
| Glossary term | DefinedTerm + DefinedTermSet, WebPage, FAQPage, BreadcrumbList, speakable |
| Comparison page | WebPage, ItemList, FAQPage, BreadcrumbList, Corporation mentions |
| Alternative page | WebPage, ItemList, FAQPage, BreadcrumbList |
| Free tool | WebApplication, HowTo, FAQPage, BreadcrumbList |
| Earnings calendar | WebPage, ItemList, Event, Dataset, BreadcrumbList |
| Privacy/Terms | WebPage |

---

## Phase 3: Programmatic Stock Pages

**Timeline: Week 3-5**
**Impact: VERY HIGH — This is the primary traffic driver**

### 3.1 Data Architecture

#### Data Source
Use **Financial Modeling Prep (FMP) API** ($19/mo) for:
- Company profiles (name, sector, industry, description, market cap)
- Stock quotes (price, change, volume)
- Earnings transcripts
- Financial statements summary
- SEC filings list

Use **SEC EDGAR** (free) for:
- Filing details and links
- Insider transactions (Form 4)

#### Data Storage Strategy

```
data/
  stocks/
    meta.json           # Master list: [{ticker, name, sector, industry, slug}]
    profiles/
      AAPL.json         # Company profile + fundamentals
      NVDA.json
      ...
    earnings/
      AAPL-2026-Q1.json # Earnings analysis cache
      ...
    filings/
      AAPL-latest.json  # Recent SEC filings
      ...
```

**Build-time strategy**: Pre-generate static JSON files for S&P 500 stocks. Use ISR with `revalidate: 86400` (24h) for freshness. On-demand revalidation via webhook when new earnings/filings arrive.

### 3.2 URL Structure

Based on competitive research, Simply Wall St has the most SEO-rich URL structure. We'll use a balanced approach — more descriptive than Seeking Alpha's `/symbol/{TICKER}` but simpler than Simply Wall St's 5-level nesting:

```
/stocks                              → Stock index page (filterable by sector)
/stocks/[ticker]                     → Individual stock page (e.g., /stocks/nvda)
/stocks/[ticker]/earnings            → Earnings history & transcripts
/stocks/[ticker]/filings             → SEC filings list
/stocks/sector/[sector]              → Sector page (e.g., /stocks/sector/technology)
```

**URL rules:**
- All lowercase tickers in URL: `/stocks/nvda` not `/stocks/NVDA`
- Canonical URL always lowercase
- Ticker displayed uppercase on page
- Title pattern: `{Company Name} ({TICKER}) AI Stock Analysis | StoxPulse` (matches industry standard)

### 3.3 Stock Index Page (`/stocks/page.tsx`)

**Target keywords:** "AI stock analysis", "stock intelligence", "stock research tool"

**Content:**
- H1: "AI Stock Analysis — Earnings, Filings & Sentiment for Every Stock"
- Search/filter bar (by name, ticker, sector)
- Grid of stock cards (ticker, name, sector, latest signal)
- Sector filter sidebar
- Stats: "Analyzing X stocks, Y earnings calls, Z filings"
- FAQ section with schema

### 3.4 Individual Stock Page Template (`/stocks/[ticker]/page.tsx`)

This is the **most important page template** in the entire site.

**Target keywords per page:**
- `{ticker} earnings call summary`
- `{ticker} AI analysis`
- `{ticker} SEC filings`
- `{ticker} stock analysis 2026`
- `{company name} earnings`

**Page structure:**

```
H1: {TICKER} AI Stock Analysis — {Company Name}
├── Meta: "{TICKER} AI Stock Analysis: Earnings Calls, SEC Filings & Sentiment | StoxPulse"
│
├── Company Overview Section
│   ├── Company description (2-3 sentences, keyword-rich)
│   ├── Key stats table (Market Cap, P/E, EPS, Sector, Industry)
│   └── Pulse Score badge (when available)
│
├── Latest AI Earnings Analysis Section
│   ├── H2: "{TICKER} Earnings Call Summary — {Quarter} {Year}"
│   ├── AI-generated summary (200-400 words)
│   ├── Key takeaways (bullet points)
│   ├── Revenue & EPS vs estimates table
│   ├── Sentiment analysis (Bullish/Neutral/Bearish)
│   ├── Management tone analysis
│   └── Red flags / highlights
│
├── SEC Filings Section
│   ├── H2: "{Company Name} SEC Filings"
│   ├── Recent filings table (type, date, summary)
│   ├── Link to full filing on EDGAR
│   └── AI plain-English summary of latest 10-K/10-Q
│
├── News Sentiment Section
│   ├── H2: "{TICKER} News Sentiment"
│   ├── Sentiment score visualization
│   ├── Recent news items with relevance scores
│   └── Trend chart (30-day sentiment)
│
├── Insider Transactions Section
│   ├── H2: "{Company Name} Insider Trading Activity"
│   ├── Recent Form 4 filings table
│   └── AI context (routine vs. notable)
│
├── Related Stocks Section
│   ├── H2: "Similar Stocks to {TICKER}"
│   ├── Same-sector stocks grid (3-6 stocks)
│   └── Internal links to those stock pages
│
├── FAQ Section (with FAQPage schema)
│   ├── "What does {TICKER}'s latest earnings call reveal?"
│   ├── "Is {TICKER} a buy in {year}?" → redirect to "Our AI analysis shows..."
│   ├── "What SEC filings has {Company Name} filed recently?"
│   ├── "What is {Company Name}'s P/E ratio?"
│   └── "What sector is {TICKER} in?"
│
├── CTA Section
│   ├── "Get real-time {TICKER} alerts"
│   └── Waitlist/signup form
│
└── Breadcrumbs: Home > Stocks > {TICKER}
```

**Critical content quality rules (YMYL compliance):**
- Every AI analysis must have a disclaimer: "This analysis was generated by AI for informational purposes only. It is not investment advice."
- Include "Last updated: {date}" prominently
- Cite data sources: "Data from SEC EDGAR and Financial Modeling Prep"
- Never say "buy" or "sell" — use "the AI analysis indicates bullish/bearish sentiment"

### 3.5 Next.js Implementation

**Critical architectural decision from research:** Don't pre-render all 3,000 stock pages at build time. Pre-render only the top 200 most-trafficked tickers. Let the rest generate on-demand via ISR. This keeps build time under 3 minutes.

```typescript
// app/stocks/[ticker]/page.tsx

import type { Metadata } from "next";

// Allow on-demand generation for tickers NOT in generateStaticParams
export const dynamicParams = true;

// ISR: Revalidate every 5 minutes for stock data freshness
// (research shows tiered approach: 5min for prices, 1hr for analysis, 24hr for filings)
export const revalidate = 300;

// Only pre-render top 200 tickers at build time
// Remaining 2,800+ pages generate on first request and are cached
export async function generateStaticParams() {
  const topStocks = await getTopStocks(200); // S&P 500 top 200 by market cap
  return topStocks.map((stock) => ({
    ticker: stock.ticker.toLowerCase(),
  }));
}

// Dynamic metadata per stock (auto-memoized with page component fetches)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params;
  const stock = await getStockProfile(ticker);

  if (!stock) return { title: "Stock Not Found | StoxPulse" };

  // Title pattern matches industry standard: {Company} ({TICKER}) {Type} | {Brand}
  const title = `${stock.name} (${ticker.toUpperCase()}) AI Stock Analysis | StoxPulse`;
  const description = `AI analysis of ${stock.name} (${ticker.toUpperCase()}): Latest earnings call summary, SEC filings, news sentiment & insider transactions. Updated ${new Date().toLocaleDateString()}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://stoxpulse.com/stocks/${ticker.toLowerCase()}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://stoxpulse.com/stocks/${ticker.toLowerCase()}`,
      siteName: "StoxPulse",
    },
    twitter: {
      card: "summary_large_image",
      title: `${ticker.toUpperCase()} AI Analysis | StoxPulse`,
      description,
    },
    robots: { index: true, follow: true },
  };
}
```

**Enable PPR in next.config.ts** for instant static shell + streaming dynamic content:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 3600,
  },
  experimental: {
    ppr: true, // Partial Prerendering — static shell + Suspense streaming
  },
};
```

**Per-ticker OG images on Edge runtime** (`app/stocks/[ticker]/opengraph-image.tsx`):
- Shows ticker, company name, price, change %
- Edge runtime for CDN-cached generation
- Keep bundle under 500KB (one font weight max)

### 3.6 Build-Time Data Pipeline

**Script: `scripts/fetch-stock-data.ts`**

Run before build to populate `data/stocks/`:

1. Fetch S&P 500 constituent list from FMP API
2. For each stock, fetch profile, latest quote, recent filings
3. For stocks with recent earnings, fetch and analyze transcript via Claude API
4. Write JSON files to `data/stocks/`
5. Run `next build`

**Cron job**: Run daily at 6am ET to refresh data before market open.

### 3.7 Sitemap Generation for Stock Pages

**File: `app/sitemap.ts`** — Must be updated to include all stock pages:

```typescript
export default async function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://stoxpulse.com";
  const stocks = await getStockList();

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/stocks`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/tools`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/glossary`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const stockPages = stocks.map((stock) => ({
    url: `${baseUrl}/stocks/${stock.ticker.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...stockPages];
}
```

For 3000+ URLs, split into multiple sitemaps using `generateSitemaps()`:

```typescript
export async function generateSitemaps() {
  const stocks = await getStockList();
  const sitemapsNeeded = Math.ceil(stocks.length / 5000);
  return Array.from({ length: sitemapsNeeded }, (_, i) => ({ id: i }));
}
```

---

## Phase 4: Competitor & Alternative Pages

**Timeline: Week 5-6**
**Impact: HIGH — Bottom-funnel, high-intent keywords**

### 4.1 Competitor Research Data

Create a data file for each competitor:

**File: `data/competitors/seeking-alpha.json`**

```json
{
  "name": "Seeking Alpha",
  "slug": "seeking-alpha",
  "url": "seekingalpha.com",
  "tagline": "Stock Market Analysis & Tools for Investors",
  "pricing": {
    "free": true,
    "plans": [
      { "name": "Basic", "price": 0, "features": ["Limited articles", "Basic data"] },
      { "name": "Premium", "price": 299, "period": "year", "features": ["Unlimited articles", "Quant ratings", "Author performance"] },
      { "name": "Pro", "price": 2399, "period": "year", "features": ["Top ideas", "VIP newsletter"] }
    ]
  },
  "strengths": [
    "Massive community of 16M+ contributors",
    "Quant rating system",
    "Deep article archive"
  ],
  "weaknesses": [
    "No AI-generated analysis of earnings calls",
    "Information overload — too much content to filter",
    "Expensive Pro tier ($200/mo)",
    "Analyst quality varies widely"
  ],
  "bestFor": "Investors who want crowdsourced opinions and community discussion",
  "notIdealFor": "Investors who want quick, AI-summarized insights without wading through articles"
}
```

### 4.2 Page Types & URLs

```
/compare/stoxpulse-vs-seeking-alpha
/compare/stoxpulse-vs-motley-fool
/compare/stoxpulse-vs-bloomberg-terminal
/compare/stoxpulse-vs-morningstar
/compare/stoxpulse-vs-yahoo-finance
/compare/stoxpulse-vs-koyfin
/compare/stoxpulse-vs-simply-wall-st
/compare/stoxpulse-vs-tipranks

/alternatives/seeking-alpha-alternatives
/alternatives/bloomberg-terminal-alternatives
/alternatives/motley-fool-alternatives
/alternatives/morningstar-alternatives
/alternatives/yahoo-finance-alternatives
/alternatives/koyfin-alternatives
/alternatives/simply-wall-st-alternatives
```

### 4.3 Comparison Page Template

**Target keywords:** "stoxpulse vs seeking alpha", "seeking alpha alternative", "best stock analysis tool 2026"

**Page structure:**

```
H1: StoxPulse vs {Competitor} — Honest Comparison ({Year})

├── TL;DR (2-3 sentences, direct answer)
│
├── At-a-Glance Comparison Table
│   ├── Feature comparison grid
│   ├── Pricing comparison
│   └── Best for / Not ideal for
│
├── Detailed Comparison by Category
│   ├── H2: Earnings Call Analysis
│   ├── H2: SEC Filing Coverage
│   ├── H2: AI Capabilities
│   ├── H2: Pricing & Value
│   ├── H2: User Experience
│   └── H2: Data Coverage
│
├── Who Should Choose StoxPulse
├── Who Should Choose {Competitor}
│
├── FAQ Section (FAQPage schema)
│   ├── "Is StoxPulse better than {Competitor}?"
│   ├── "How much does {Competitor} cost vs StoxPulse?"
│   ├── "Can I use both StoxPulse and {Competitor}?"
│   └── "What's the main difference between StoxPulse and {Competitor}?"
│
├── CTA: "Try StoxPulse Free"
└── Breadcrumbs: Home > Compare > StoxPulse vs {Competitor}
```

**Content rules:**
- Be genuinely fair and honest about competitor strengths
- Use specific feature comparisons, not vague claims
- Include pricing data with sources
- Update quarterly (add "Last updated" date)

### 4.4 Alternatives Page Template

**Target keywords:** "{competitor} alternatives", "best {competitor} alternatives 2026"

**Page structure:**

```
H1: 7 Best {Competitor} Alternatives in {Year}

├── Why People Look for {Competitor} Alternatives (validate their pain)
├── What to Look For in an Alternative (criteria framework)
│
├── List of Alternatives (StoxPulse first, then 4-6 real alternatives)
│   ├── 1. StoxPulse (positioned as best for AI analysis)
│   ├── 2. TipRanks
│   ├── 3. Simply Wall St
│   ├── 4. Koyfin
│   ├── 5. Finviz
│   ├── 6. Danelfin
│   └── 7. Alpha Spread
│
├── Comparison Table (all alternatives)
├── Recommendation by Use Case
│
├── FAQ Section
└── CTA
```

---

## Phase 5: Blog Infrastructure & Content

**Timeline: Week 6-8**
**Impact: HIGH — Builds topical authority**

### 5.1 Blog Architecture

```
app/
  blog/
    page.tsx              → Blog index (list all posts)
    [slug]/
      page.tsx            → Individual blog post
```

### 5.2 Content Management

Use MDX files stored in `content/blog/`:

```
content/
  blog/
    how-to-read-earnings-calls.mdx
    sec-filings-explained.mdx
    ...
```

Each MDX file has frontmatter:

```yaml
---
title: "How to Read Earnings Calls Like a Pro: Complete 2026 Guide"
description: "Learn to analyze earnings calls in 10 minutes..."
date: "2026-03-15"
updated: "2026-03-15"
author: "StoxPulse Team"
category: "Earnings Calls"
tags: ["earnings calls", "stock analysis", "investing"]
image: "/blog/og/earnings-call-guide.png"
readTime: "12 min"
pillar: true
cluster: "earnings-calls"
---
```

### 5.3 Content Pillars & Topic Clusters

#### Pillar 1: Earnings Calls (Highest priority — our core product)
**Hub:** "How to Read Earnings Calls Like a Pro: Complete Guide"
- Supporting: "What Happens During an Earnings Call"
- Supporting: "Earnings Call Red Flags Every Investor Should Know"
- Supporting: "How CEOs Use Language to Hide Bad News in Earnings Calls"
- Supporting: "Earnings Call vs 10-Q: What's the Difference"
- Supporting: "Best Earnings Call Transcript Sources (Free & Paid)"
- Supporting: "What is Earnings Per Share (EPS) and Why It Matters"
- Supporting: "Revenue Beat vs Miss: What It Really Means"
- Supporting: "Forward Guidance: Why It Matters More Than Results"
- Supporting: "AI Earnings Call Analysis: How It Works"

#### Pillar 2: SEC Filings
**Hub:** "SEC Filings Explained: Every Form You Need to Know in 2026"
- Supporting: "How to Read a 10-K Filing in 15 Minutes"
- Supporting: "8-K Filings: What Triggers Them and Why They Matter"
- Supporting: "Form 4 Insider Trading: Complete Guide"
- Supporting: "SEC EDGAR Tutorial: How to Find Any Filing"
- Supporting: "10-Q vs 10-K: Differences Explained"
- Supporting: "What is a Proxy Statement (DEF 14A)?"
- Supporting: "13-F Filings: Track What Hedge Funds Are Buying"

#### Pillar 3: AI Investing
**Hub:** "AI Stock Analysis: How AI is Changing Retail Investing in 2026"
- Supporting: "Can AI Predict Stock Prices? What the Research Says"
- Supporting: "AI vs Human Stock Analysts: Who's Better?"
- Supporting: "NLP in Finance: How AI Reads Earnings Calls"
- Supporting: "Best AI Tools for Stock Research (2026 Comparison)"
- Supporting: "How to Use AI for Due Diligence"
- Supporting: "Sentiment Analysis in Investing: Complete Guide"

#### Pillar 4: Stock Research for Beginners
**Hub:** "How to Research Stocks: The Complete 2026 Guide"
- Supporting: "Fundamental Analysis vs Technical Analysis"
- Supporting: "How to Build a Stock Watchlist"
- Supporting: "Due Diligence Checklist for Stock Investing"
- Supporting: "How to Read Financial Statements"
- Supporting: "Stock Valuation Methods Explained"

### 5.4 Content Specs

**Every blog post must have:**
- Unique H1 with primary keyword
- Meta title (50-60 chars) with primary keyword at start
- Meta description (150-160 chars) with keyword + CTA
- FAQ section at bottom (3-5 questions with FAQPage schema)
- "Last updated: {date}" visible on page
- Author attribution (StoxPulse Team)
- Internal links to 3+ other pages (stock pages, glossary terms, other posts)
- At least 1 CTA for waitlist/product
- At least 2 statistics with citations
- Table of contents for posts > 1500 words
- Breadcrumb navigation with schema
- OG image (generated dynamically or designed per post)

**Content quality (GEO optimized):**
- Lead every section with a direct answer (answer-first format)
- Keep key answer passages to 40-60 words for snippet extraction
- Use H2/H3 headings that match search queries
- Tables for comparisons, numbered lists for processes
- Short paragraphs (2-3 sentences max)
- Include authoritative citations (+40% AI visibility)
- Include specific statistics (+37% AI visibility)
- Use expert/authoritative tone (+25% AI visibility)

### 5.5 Publishing Schedule

| Week | Post | Pillar | Type |
|---|---|---|---|
| Week 6 | How to Read Earnings Calls (Pillar) | Earnings | Hub |
| Week 6 | SEC Filings Explained (Pillar) | SEC | Hub |
| Week 7 | AI Stock Analysis in 2026 (Pillar) | AI | Hub |
| Week 7 | Earnings Call Red Flags | Earnings | Spoke |
| Week 8 | How to Read a 10-K Filing | SEC | Spoke |
| Week 8 | Best AI Tools for Stock Research | AI | Spoke |
| Week 9 | Stock Research Complete Guide (Pillar) | Research | Hub |
| Week 9 | What is EPS | Earnings | Spoke |
| Week 10 | Form 4 Insider Trading Guide | SEC | Spoke |
| Week 10 | Can AI Predict Stock Prices | AI | Spoke |

**Ongoing:** 2 posts per week minimum after initial launch.

---

## Phase 6: Free Tools

**Timeline: Week 8-10**
**Impact: VERY HIGH — Backlink magnet + lead gen**

### 6.1 Tool #1: AI Earnings Call Summarizer (Priority 1)

**URL:** `/tools/earnings-call-summarizer`

**Target keywords:** "earnings call summary tool", "free earnings call analyzer", "earnings transcript summarizer"

**How it works:**
1. User enters a stock ticker OR pastes an earnings call transcript
2. AI analyzes and returns:
   - 2-minute summary
   - Key takeaways (bullet points)
   - Revenue/EPS vs estimates
   - Sentiment score (Bullish/Neutral/Bearish)
   - Red flags detected
3. Full report shown freely
4. "Get this for all your stocks — join StoxPulse" CTA

**Lead capture:** Show full results freely. Offer email delivery of PDF report (email capture).

**Evaluation Score:**
| Factor | Score |
|---|---|
| Search demand | 5/5 — "earnings call summary" has high volume |
| Audience match | 5/5 — exact target user |
| Uniqueness | 4/5 — no free AI tool does this well |
| Path to product | 5/5 — this IS the product in miniature |
| Build feasibility | 4/5 — use Claude API, FMP for transcripts |
| Link potential | 5/5 — finance bloggers, Reddit, Twitter will share |
| **Total** | **28/30** — Strong candidate |

### 6.2 Tool #2: SEC Filing Translator (Priority 2)

**URL:** `/tools/sec-filing-translator`

**Target keywords:** "SEC filing plain English", "understand SEC filings", "10-K translator"

**How it works:**
1. User pastes a section of an SEC filing (or enters a ticker to pull latest)
2. AI translates to plain English
3. Highlights key risks, financial changes, material events

### 6.3 Tool #3: Stock Sentiment Checker (Priority 3)

**URL:** `/tools/stock-sentiment`

**Target keywords:** "stock sentiment analysis", "stock news sentiment", "{ticker} sentiment"

**How it works:**
1. User enters a ticker
2. Shows: news sentiment score, recent news items rated by importance, 30-day trend
3. Embeddable widget for finance blogs

### 6.4 Tool Landing Page

**URL:** `/tools`

**Content:**
- H1: "Free AI Stock Analysis Tools"
- Grid of all tools with descriptions
- Each tool card links to its page
- "More tools coming soon" section
- Newsletter signup for tool launch notifications

### 6.5 Tool Page Template

Each tool page needs:
- H1 with primary keyword
- Tool interface (input + output)
- "How it works" section (HowTo schema)
- FAQ section (FAQPage schema)
- Related tools
- CTA to main product
- WebApplication schema

---

## Phase 7: Financial Glossary

**Timeline: Week 10-11**
**Impact: MEDIUM — Evergreen traffic + internal linking hub**

### 7.1 URL Structure

```
/glossary                   → Index page (A-Z list)
/glossary/[term]            → Individual term page (e.g., /glossary/earnings-per-share)
```

### 7.2 Term Selection (Start with 50)

**Priority terms (highest search volume):**

| Term | Slug | Est. Monthly Volume |
|---|---|---|
| Earnings Per Share (EPS) | earnings-per-share | 40,000+ |
| Price-to-Earnings Ratio (P/E) | price-to-earnings-ratio | 30,000+ |
| Market Capitalization | market-capitalization | 25,000+ |
| Dividend Yield | dividend-yield | 20,000+ |
| 10-K Filing | 10-k-filing | 15,000+ |
| 10-Q Filing | 10-q-filing | 8,000+ |
| 8-K Filing | 8-k-filing | 6,000+ |
| Earnings Call | earnings-call | 12,000+ |
| SEC Filing | sec-filing | 10,000+ |
| Insider Trading | insider-trading | 25,000+ |
| Form 4 | form-4-sec | 5,000+ |
| Revenue | revenue-definition | 15,000+ |
| EBITDA | ebitda | 30,000+ |
| Free Cash Flow | free-cash-flow | 15,000+ |
| Gross Margin | gross-margin | 12,000+ |
| Operating Income | operating-income | 8,000+ |
| Forward Guidance | forward-guidance | 4,000+ |
| Earnings Surprise | earnings-surprise | 3,000+ |
| Analyst Consensus | analyst-consensus | 3,000+ |
| Short Interest | short-interest | 8,000+ |
| ... (50 total) | | |

### 7.3 Glossary Term Page Template

```
H1: What is {Term}? — Definition & Examples

├── Quick Definition Box (40-60 words, optimized for featured snippet)
│   "Earnings Per Share (EPS) is a company's net profit divided by
│   its outstanding shares. It measures profitability on a per-share
│   basis. For Q4 2025, the average S&P 500 EPS was $59.25."
│
├── Detailed Explanation (300-500 words)
│   ├── How it's calculated (with formula)
│   ├── Why it matters for investors
│   ├── Real example with actual stock data
│   └── Common misconceptions
│
├── How StoxPulse Uses {Term}
│   └── Brief section connecting to our product
│
├── Related Terms (internal links to other glossary pages)
│   └── "See also: P/E Ratio, Revenue, Net Income"
│
├── FAQ Section (3 questions)
│   ├── "What is a good {term}?"
│   ├── "How do you calculate {term}?"
│   └── "Why is {term} important for investors?"
│
├── CTA: "Track {term} across your watchlist with StoxPulse"
└── Breadcrumbs: Home > Glossary > {Term}
```

**Schema:** `DefinedTerm` + `FAQPage` + `BreadcrumbList`

### 7.4 Internal Linking Strategy

Every glossary term should be auto-linked from:
- Blog posts that mention the term
- Stock pages that display the metric
- Other glossary terms that reference it
- Tool pages that use the concept

---

## Phase 8: Earnings Calendar

**Timeline: Week 11-12**
**Impact: HIGH — Massive search volume during earnings season**

### 8.1 URL Structure

```
/earnings                           → Current week's earnings
/earnings/calendar                  → Full calendar view
/earnings/today                     → Earnings reporting today
/earnings/this-week                 → This week's earnings
/earnings/next-week                 → Next week's earnings
/earnings/[year]-[quarter]          → Quarterly earnings (e.g., /earnings/2026-q1)
/earnings/week/[date]               → Specific week (e.g., /earnings/week/2026-03-10)
```

### 8.2 Target Keywords

| Keyword | Est. Monthly Volume |
|---|---|
| "earnings calendar" | 90,000+ |
| "earnings this week" | 40,000+ |
| "who reports earnings today" | 25,000+ |
| "earnings season 2026" | 15,000+ |
| "earnings calendar this week" | 30,000+ |
| "Q1 2026 earnings dates" | 10,000+ |

### 8.3 Earnings Calendar Page Template

```
H1: Earnings Calendar — {Period} {Year}

├── Week overview (which major companies report)
├── Day-by-day breakdown
│   ├── Date
│   ├── Before Market Open / After Market Close
│   ├── Company name + ticker (linked to /stocks/[ticker])
│   ├── Expected EPS
│   ├── Expected Revenue
│   └── "AI Summary" badge (if already reported)
│
├── Highlighted Earnings (major companies this period)
├── Sector breakdown
│
├── FAQ Section
│   ├── "What companies report earnings this week?"
│   ├── "When is {major company} earnings?"
│   └── "What is earnings season?"
│
├── CTA: "Get AI summaries of every earnings call — join StoxPulse"
└── Breadcrumbs: Home > Earnings > {Period}
```

**Schema:** `ItemList` + `Event` (for individual earnings events) + `FAQPage`

---

## Phase 9: AI Search (GEO) Optimization

**Timeline: Ongoing — Apply to every page**
**Impact: VERY HIGH — Future-proofs traffic as AI search grows**

### 9.1 The 9 GEO Methods (Apply to Every Page)

| Method | Boost | Implementation |
|---|---|---|
| Cite sources | +40% | Add "Source: SEC EDGAR", "According to [authority]" |
| Add statistics | +37% | Include specific numbers with dates and sources |
| Add quotations | +30% | Expert quotes with name and title |
| Authoritative tone | +25% | Write with demonstrated expertise, avoid hedging |
| Easy to understand | +20% | Simplify jargon, use plain English alongside technical terms |
| Technical terms | +18% | Include domain-specific terms (EPS, 10-K, EBITDA) |
| Unique vocabulary | +15% | Diverse word choice, avoid repetition |
| Fluency optimization | +15-30% | Clean prose, logical flow |
| ~~Keyword stuffing~~ | **-10%** | **NEVER do this — actively hurts** |

**Best combo:** Fluency + Statistics = maximum boost.

### 9.2 Content Structure for AI Extraction

Every important page section should follow this pattern:

```
[Direct answer in 40-60 words — extractable as standalone passage]

[Supporting detail with statistics and citations]

[Example or data table]
```

**Example for a stock page:**

> NVIDIA's Q4 2025 earnings call revealed revenue of $39.3 billion, beating analyst estimates by 8%. The data center segment grew 42% year-over-year. Management raised full-year 2026 guidance to $180 billion, citing continued AI infrastructure demand. CEO Jensen Huang's tone was notably more confident than Q3.
>
> Source: NVIDIA Q4 2025 Earnings Call Transcript, SEC Filing dated January 28, 2026.

This passage can be extracted by AI systems as a self-contained answer.

### 9.3 AI Bot Access (Already Covered in Phase 1)

Ensure robots.txt allows:
- ChatGPT-User (OpenAI search)
- PerplexityBot
- Claude-Web
- OAI-SearchBot

### 9.4 Third-Party Presence (Critical for AI Citations)

AI systems cite third-party sources 6.5x more than first-party. Build presence on:

- **Wikipedia**: Create StoxPulse page when notable enough
- **Reddit**: Participate in r/stocks, r/investing, r/wallstreetbets, r/SecurityAnalysis
- **G2/Capterra**: Create product listings when live
- **Crunchbase**: Company profile
- **LinkedIn**: Company page + team profiles
- **YouTube**: Create educational videos (AI analysis walkthroughs)
- **GitHub**: Open-source something (earnings parser library?)
- **Product Hunt**: Launch listing

### 9.5 Monitoring AI Visibility

Monthly manual check (until we can afford monitoring tools):

| Query | Google AI Overview | ChatGPT | Perplexity | StoxPulse Cited? |
|---|---|---|---|---|
| "best AI stock analysis tool" | | | | |
| "earnings call summary tool" | | | | |
| "AI earnings call analyzer" | | | | |
| "StoxPulse review" | | | | |
| "[competitor] alternative" | | | | |

---

## Phase 10: Off-Page SEO & Launch

**Timeline: Ongoing**
**Impact: HIGH — Builds domain authority**

### 10.1 Backlink Strategy

#### Tier 1: High-Authority Links (DA 50+)
- **HARO / Connectively / Quoted**: Respond to journalist queries about AI investing, fintech, stock analysis
- **Guest posts**: Write for Investopedia, The Motley Fool Blog, Benzinga, MarketBeat
- **Press coverage**: Pitch to TechCrunch, VentureBeat, The Verge for "AI tools" roundups
- **Data studies**: "We analyzed 10,000 earnings calls with AI. Here's what we found." → pitch to financial media

#### Tier 2: Medium-Authority Links (DA 20-50)
- **Product directories**: G2, Capterra, AlternativeTo, Product Hunt
- **Finance blogs**: Guest posts on personal finance and investing blogs
- **Tech blogs**: Write about the engineering behind AI stock analysis
- **Podcast appearances**: Get on investing and fintech podcasts

#### Tier 3: Community Links (DA varies)
- **Reddit**: Genuine participation in finance subreddits, share tools when relevant
- **Quora**: Answer stock analysis questions with detailed, helpful answers
- **Stack Overflow / Dev.to**: Share technical content about AI/NLP in finance
- **Twitter/X**: Build following in FinTwit community

### 10.2 Product Hunt Launch Plan

**Timing:** Launch when we have:
- Working product (at least free tier)
- 500+ indexed stock pages
- 1 free tool live
- 10+ blog posts
- Email list of 500+ people

**Preparation (2 weeks before):**
1. Build PH-specific landing page
2. Create demo video (60 seconds)
3. Prepare high-quality screenshots
4. Write compelling tagline and description
5. Reach out to hunters with large followings
6. Pre-notify email list: "We're launching on PH, support us"

**Launch day:**
- Post at 12:01 AM PT
- Team responds to every comment within 30 minutes
- Share on all social channels
- Email blast to waitlist
- Reddit posts in relevant subreddits (non-promotional)

**Post-launch:**
- Follow up with every PH commenter
- Write "Our Product Hunt Launch: What Worked" blog post
- Convert PH traffic to email list
- Update all comparison pages with PH badge

### 10.3 Social Media Strategy (FinTwit + Reddit)

**Twitter/X:**
- Post daily AI analysis of trending stocks
- Share interesting findings from earnings calls
- Thread format: "NVDA just reported earnings. Here's what the AI found..."
- Engage with FinTwit influencers
- Use #earnings #stocks #investing hashtags

**Reddit:**
- r/stocks: Share genuine analysis, link to tools when helpful
- r/investing: Educational content about AI in investing
- r/wallstreetbets: Meme-friendly earnings summaries
- r/SecurityAnalysis: Deep-dive AI analysis methodology
- r/algotrading: Technical content about NLP/sentiment analysis

**LinkedIn:**
- Company page with weekly updates
- Founder posts about building in public
- Share data studies and original research

---

## Technical Architecture

### Directory Structure (New Files)

```
app/
  stocks/
    page.tsx                    # Stock index page
    [ticker]/
      page.tsx                  # Individual stock page
  blog/
    page.tsx                    # Blog index
    [slug]/
      page.tsx                  # Individual blog post
  glossary/
    page.tsx                    # Glossary index (A-Z)
    [term]/
      page.tsx                  # Individual glossary term
  compare/
    page.tsx                    # Comparisons index
    [slug]/
      page.tsx                  # Individual comparison (stoxpulse-vs-seeking-alpha)
  alternatives/
    [slug]/
      page.tsx                  # Alternative pages (seeking-alpha-alternatives)
  tools/
    page.tsx                    # Tools index
    earnings-call-summarizer/
      page.tsx                  # Earnings call summarizer tool
    sec-filing-translator/
      page.tsx                  # SEC filing translator
    stock-sentiment/
      page.tsx                  # Stock sentiment checker
  earnings/
    page.tsx                    # Current earnings overview
    today/
      page.tsx                  # Earnings today
    this-week/
      page.tsx                  # Earnings this week
    [period]/
      page.tsx                  # Quarterly/weekly (2026-q1, week/2026-03-10)
  sitemap.ts                    # Updated for all pages
  robots.ts                     # Updated for AI crawlers

components/
  seo/
    json-ld.tsx                 # Reusable JSON-LD component
    breadcrumbs.tsx             # Breadcrumb nav + schema
    faq-section.tsx             # FAQ accordion + FAQPage schema
  stocks/
    stock-card.tsx              # Reusable stock card
    stock-hero.tsx              # Stock page hero section
    earnings-analysis.tsx       # AI earnings analysis display
    filings-table.tsx           # SEC filings table
    sentiment-chart.tsx         # Sentiment visualization
    insider-table.tsx           # Insider transactions table
    related-stocks.tsx          # Related stocks grid
  blog/
    post-card.tsx               # Blog post card
    post-layout.tsx             # Blog post layout with TOC
    author-bio.tsx              # Author attribution
  glossary/
    term-card.tsx               # Glossary term card
    definition-box.tsx          # Featured definition box
  tools/
    earnings-summarizer.tsx     # Tool UI component
  earnings/
    calendar-grid.tsx           # Earnings calendar grid

content/
  blog/                         # MDX blog posts
  glossary/                     # Glossary term data (JSON or MDX)

data/
  stocks/
    meta.json                   # S&P 500 stock list
    profiles/                   # Per-stock profile JSON
    earnings/                   # Per-stock earnings JSON
    filings/                    # Per-stock filings JSON
  competitors/                  # Competitor data JSON
  earnings-calendar/            # Earnings calendar data JSON

scripts/
  fetch-stock-data.ts           # Data pipeline script
  fetch-earnings-calendar.ts    # Earnings calendar data script
  generate-og-images.ts         # Batch OG image generation
```

### ISR / SSG Strategy

| Page Type | Rendering | Revalidation |
|---|---|---|
| Homepage | SSG | `revalidate: 3600` (1 hour) |
| Stock index | SSG | `revalidate: 3600` |
| Stock pages | SSG + ISR | `revalidate: 86400` (24h) + on-demand |
| Blog index | SSG | `revalidate: 3600` |
| Blog posts | SSG | No revalidation (rebuild on content change) |
| Glossary index | SSG | `revalidate: 86400` |
| Glossary terms | SSG | No revalidation (static content) |
| Comparison pages | SSG | `revalidate: 604800` (weekly) |
| Alternative pages | SSG | `revalidate: 604800` |
| Tool pages | SSR (interactive) | N/A — client-side interaction |
| Earnings calendar | SSG + ISR | `revalidate: 3600` |
| Earnings today | SSR | N/A — needs real-time data |

### On-Demand Revalidation

**File: `app/api/revalidate/route.ts`**

Webhook endpoint for revalidating stock pages when new data arrives:

```typescript
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  const { secret, ticker, type } = await request.json();

  if (secret !== process.env.REVALIDATION_SECRET) {
    return Response.json({ error: "Invalid secret" }, { status: 401 });
  }

  if (ticker) {
    revalidatePath(`/stocks/${ticker.toLowerCase()}`);
  }
  if (type === "earnings") {
    revalidatePath("/earnings");
    revalidatePath("/earnings/today");
    revalidatePath("/earnings/this-week");
  }

  return Response.json({ revalidated: true });
}
```

---

## Keyword Strategy

### Primary Keywords (Target with dedicated pages)

| Keyword | Volume | Difficulty | Page |
|---|---|---|---|
| earnings call summary | 8,100 | Medium | /tools/earnings-call-summarizer |
| SEC filings explained | 2,900 | Low | /blog/sec-filings-explained |
| AI stock analysis | 3,200 | Medium | /stocks |
| earnings calendar | 90,000 | High | /earnings |
| {ticker} earnings | 10K-100K+ | Low | /stocks/[ticker] |
| seeking alpha alternative | 5,400 | Medium | /alternatives/seeking-alpha |
| how to read earnings calls | 4,400 | Low | /blog/how-to-read-earnings-calls |
| what is EPS | 40,000 | Medium | /glossary/earnings-per-share |
| best stock research tools | 6,600 | Medium | /blog/best-ai-tools-stock-research |
| 10-K filing | 15,000 | Low | /glossary/10-k-filing |

### Long-Tail Keywords (Target via stock pages)

Every stock page targets 5-10 long-tail keywords automatically:
- `{ticker} earnings call summary 2026`
- `{ticker} SEC filings`
- `{ticker} AI analysis`
- `{ticker} earnings report`
- `{ticker} insider trading`
- `{ticker} stock analysis`
- `{company name} earnings`
- `is {ticker} a good stock`
- `{ticker} sentiment analysis`

With 500 stocks x 5-10 keywords = 2,500-5,000 long-tail keywords targeted.

### AI Signals & ML Models Content Strategy (NEW)

StoxPulse is adding AI/ML signals for stocks. This opens a massive new content vertical.

#### New Page Types

| Page | URL | Target Keywords |
|---|---|---|
| AI Signals hub | `/signals` | "AI stock signals", "AI trading signals" |
| Per-stock AI signal | `/stocks/[ticker]/signals` | "{TICKER} AI signal", "{TICKER} AI prediction" |
| AI Models explained | `/blog/ai-models-stock-analysis` | "machine learning stock prediction" |
| Signal methodology | `/signals/methodology` | "AI stock prediction accuracy", "how AI predicts stocks" |
| Signal leaderboard | `/signals/leaderboard` | "best AI stock picks", "AI stock performance" |
| Free AI signal tool | `/tools/ai-stock-signals` | "free AI stock signals", "AI stock screener" |

#### AI Signals Keywords (High Growth, Low Competition)

| Keyword | Est. Volume | Growth YoY | Difficulty |
|---|---|---|---|
| "AI stock signals" | 8K-15K/mo | 200%+ | Low-Medium |
| "AI stock prediction" | 12K-25K/mo | 180%+ | Medium |
| "machine learning stock analysis" | 3K-6K/mo | 150%+ | Low |
| "AI trading signals free" | 5K-10K/mo | 200%+ | Low |
| "best AI stock picks" | 8K-15K/mo | 170%+ | Medium |
| "AI stock screener" | 4K-8K/mo | 160%+ | Low |
| "{TICKER} AI signal" | 500-5K/mo per ticker | New | Very Low |
| "AI stock analysis accuracy" | 2K-4K/mo | 200%+ | Low |

#### Content Cluster: AI & ML in Investing

**Pillar:** "AI Stock Signals Explained: How Machine Learning Predicts Stock Movements"

**Supporting articles:**
- "How Our AI Models Work: The Technology Behind StoxPulse Signals"
- "AI vs Human Stock Analysts: Accuracy Comparison (2026 Data)"
- "NLP Sentiment Analysis for Stocks: How AI Reads Market Emotion"
- "Earnings Call NLP: How AI Detects Hidden Signals in CEO Language"
- "Machine Learning Stock Prediction: What the Research Says"
- "AI Stock Screener vs Traditional Screener: What's Different"
- "The 5 Types of AI Signals Every Investor Should Know"
- "Backtesting AI Stock Signals: How We Validate Our Models"
- "AI Signal Accuracy: Our Transparent Track Record"
- "Combining AI Signals with Fundamental Analysis: A Framework"

#### Signal Page Template (`/stocks/[ticker]/signals`)

```
H1: {TICKER} AI Signals & Predictions — {Company Name}

- AI Signal Score (1-10 composite)
- Signal breakdown: Earnings Sentiment, Filing Signals, News Sentiment, Insider Activity, Technical ML
- Confidence level and methodology link
- Historical signal accuracy for this stock
- Recent signal changes with dates
- FAQ: "How accurate are AI signals for {TICKER}?", "What data does the AI analyze?"
- Disclaimer: "AI signals are for informational purposes only. Not investment advice."
```

#### Glossary Terms to Add
- AI Stock Signal, Machine Learning, Natural Language Processing (NLP), Sentiment Analysis, Backtesting, Signal Accuracy, Confidence Interval, Feature Engineering, Neural Network, Ensemble Model

### Content Gap Opportunities

Keywords competitors rank for that we should target:

| Keyword | Ranked By | Our Page |
|---|---|---|
| "earnings whisper" | EarningsWhisper.com | /earnings + /blog |
| "SEC EDGAR search" | SEC.gov | /tools/sec-filing-translator |
| "stock screener free" | Finviz | /stocks (with filter) |
| "company financial statements" | Macrotrends | /stocks/[ticker] |
| "insider buying stocks" | OpenInsider | /stocks/[ticker] insider section |

---

## Internal Linking Architecture

### Link Hierarchy

```
Homepage (DA hub)
├── /stocks (Stock hub)
│   ├── /stocks/[ticker] ←→ /stocks/[related-ticker]
│   │   ├── → /glossary/[relevant-term] (contextual)
│   │   ├── → /blog/[relevant-post] (contextual)
│   │   └── → /earnings/[relevant-period]
│   └── /stocks/sector/[sector]
│       └── → all stocks in sector
│
├── /blog (Content hub)
│   ├── /blog/[pillar-post]
│   │   ├── → /blog/[spoke-post] (cluster links)
│   │   ├── → /stocks/[mentioned-ticker]
│   │   ├── → /glossary/[mentioned-term]
│   │   └── → /tools/[relevant-tool]
│   └── /blog/[spoke-post]
│       └── → /blog/[pillar-post] (back to hub)
│
├── /glossary (Knowledge hub)
│   ├── /glossary/[term]
│   │   ├── → /glossary/[related-term]
│   │   ├── → /blog/[relevant-post]
│   │   └── → /stocks (use this metric)
│
├── /compare + /alternatives (Conversion hub)
│   ├── → /stocks (our coverage)
│   ├── → /tools (our free tools)
│   └── → homepage CTA
│
├── /tools (Lead gen hub)
│   ├── → /stocks/[ticker] (after analysis)
│   ├── → /blog/[relevant-guide]
│   └── → homepage CTA
│
└── /earnings (Timely traffic hub)
    ├── → /stocks/[reporting-ticker]
    ├── → /blog/earnings-related
    └── → /tools/earnings-call-summarizer
```

### Auto-Linking Rules

Build a utility function that auto-links glossary terms and tickers within content:

1. **Ticker mentions** → Link to `/stocks/[ticker]` (first occurrence only per section)
2. **Glossary terms** → Link to `/glossary/[term]` (first occurrence only per page)
3. **Internal CTAs** → Contextual links to relevant tools or product

### Navigation Additions

Add to main navbar:
- Stocks (dropdown: Popular, By Sector, Browse All)
- Tools (dropdown: Earnings Summarizer, Filing Translator, Sentiment Checker)
- Learn (dropdown: Blog, Glossary, Earnings Calendar)
- Pricing

Add to footer:
- All comparison pages
- Popular stock pages (AAPL, NVDA, MSFT, TSLA, AMZN, GOOGL, META)
- Popular glossary terms
- Popular blog posts

---

## Content Production Schedule

### Week 1-2: Technical Foundation
- [ ] Update robots.txt for AI crawlers
- [ ] Upgrade root layout metadata
- [ ] Create JSON-LD component
- [ ] Add Organization + WebSite schema to homepage
- [ ] Add FAQ section to homepage with FAQPage schema
- [ ] Create breadcrumb component with schema
- [ ] Add web app manifest
- [ ] Optimize Core Web Vitals
- [ ] Set up bundle analyzer

### Week 3-5: Programmatic Stock Pages
- [ ] Set up FMP API data pipeline
- [ ] Create stock data JSON files for S&P 500
- [ ] Build stock index page (`/stocks`)
- [ ] Build stock page template (`/stocks/[ticker]`)
- [ ] Add generateStaticParams for all 500 stocks
- [ ] Add generateMetadata per stock
- [ ] Add stock page schema (WebPage, FAQPage, BreadcrumbList)
- [ ] Generate dynamic OG images per stock
- [ ] Update sitemap for all stock pages
- [ ] Add sector pages (`/stocks/sector/[sector]`)
- [ ] Build related stocks component
- [ ] Add "Last updated" dates
- [ ] Add financial disclaimers to every stock page

### Week 5-6: Competitor & Alternative Pages
- [ ] Research and create competitor data files (7 competitors)
- [ ] Build comparison page template
- [ ] Create 8 comparison pages (StoxPulse vs X)
- [ ] Build alternatives page template
- [ ] Create 7 alternatives pages (X alternatives)
- [ ] Add FAQPage schema to all comparison/alternative pages
- [ ] Create comparison hub page (`/compare`)
- [ ] Internal link all comparison pages

### Week 6-8: Blog Infrastructure & First Posts
- [ ] Set up MDX pipeline (contentlayer or manual)
- [ ] Build blog index page
- [ ] Build blog post layout (TOC, author, share, related posts)
- [ ] Write Pillar 1: How to Read Earnings Calls (3000+ words)
- [ ] Write Pillar 2: SEC Filings Explained (3000+ words)
- [ ] Write Pillar 3: AI Stock Analysis in 2026 (3000+ words)
- [ ] Write 3 spoke articles
- [ ] Add Article schema to all blog posts
- [ ] Generate OG images for blog posts
- [ ] Set up blog post FAQ sections

### Week 8-10: Free Tools
- [ ] Build earnings call summarizer tool page
- [ ] Integrate Claude API for real-time analysis
- [ ] Build tool input/output UI
- [ ] Add WebApplication + HowTo schema
- [ ] Build lead capture (email for PDF report)
- [ ] Build tools index page
- [ ] Create tool-specific OG images

### Week 10-11: Financial Glossary
- [ ] Create glossary term data (50 terms)
- [ ] Build glossary index page (A-Z navigation)
- [ ] Build glossary term page template
- [ ] Add DefinedTerm + FAQPage schema
- [ ] Write definitions for 50 terms
- [ ] Auto-link glossary terms in existing content

### Week 11-12: Earnings Calendar
- [ ] Set up earnings calendar data pipeline
- [ ] Build earnings calendar page template
- [ ] Build earnings today/this-week pages
- [ ] Add Event + ItemList schema
- [ ] Link earnings events to stock pages
- [ ] Add CTA for real-time alerts

### Ongoing (Post Week 12)
- [ ] Publish 2 blog posts per week
- [ ] Add 10 glossary terms per week until 300+
- [ ] Expand stock pages beyond S&P 500 (NASDAQ, Russell 2000)
- [ ] Build remaining free tools (filing translator, sentiment checker)
- [ ] Product Hunt launch (when ready)
- [ ] Backlink outreach (HARO, guest posts, data studies)
- [ ] Monthly AI visibility audit
- [ ] Quarterly competitor page refresh
- [ ] Weekly earnings calendar updates

---

## KPIs & Measurement

### SEO KPIs

| Metric | Month 3 Target | Month 6 Target | Month 12 Target |
|---|---|---|---|
| Indexed pages | 100+ | 500+ | 1,500+ |
| Organic monthly visits | 500-1,000 | 5,000-15,000 | 50,000-150,000 |
| Ranking keywords | 500+ | 2,000+ | 10,000+ |
| Keywords in top 10 | 20+ | 100+ | 500+ |
| Domain Authority (Ahrefs) | 10+ | 20+ | 35+ |
| Referring domains | 20+ | 100+ | 300+ |
| Avg. position (target keywords) | 30-50 | 15-30 | 5-15 |

### GEO KPIs (AI Search)

| Metric | Month 3 | Month 6 | Month 12 |
|---|---|---|---|
| AI Overview appearances | 5+ | 25+ | 100+ |
| ChatGPT citations (manual check) | 1-2 | 10+ | 50+ |
| Perplexity citations | 1-2 | 10+ | 50+ |
| Brand mentions in AI answers | Rare | Occasional | Regular |

### Business KPIs

| Metric | Month 3 | Month 6 | Month 12 |
|---|---|---|---|
| Waitlist signups (from organic) | 200+ | 1,000+ | 5,000+ |
| Tool usage (monthly) | 500+ | 5,000+ | 25,000+ |
| Email list size | 500+ | 2,000+ | 10,000+ |

### Tools to Track

- **Google Search Console** (free): Indexing, rankings, clicks, impressions
- **Google Analytics 4** (free): Traffic, engagement, conversions
- **Ahrefs Webmaster Tools** (free): Backlinks, keywords, competitors
- **Manual AI checks** (free): Monthly check across ChatGPT, Perplexity, Google AI Overview

---

## Final Notes

### E-E-A-T for YMYL (Finance)

Finance content falls under Google's "Your Money or Your Life" (YMYL) category. Extra E-E-A-T requirements:

1. **Experience**: Show real product screenshots, actual AI analysis examples
2. **Expertise**: Cite SEC.gov, Federal Reserve, peer-reviewed research
3. **Authoritativeness**: Build third-party presence (G2, media mentions, Wikipedia)
4. **Trustworthiness**: Financial disclaimers on EVERY page, privacy policy, terms of service, HTTPS, clear data sourcing

### What NOT to Do

- Never claim to provide investment advice
- Never use "buy", "sell", "hold" recommendations
- Never fabricate statistics or citations
- Never keyword-stuff (actively hurts AI visibility by 10%)
- Never create thin pages with just swapped variables
- Never block AI search crawlers (ChatGPT-User, PerplexityBot, Claude-Web)
- Never duplicate content across pages
- Never publish without financial disclaimers

### The Compound Effect

The power of this strategy is compounding:
- Each stock page links to related stock pages (network effect)
- Each blog post links to glossary terms, stock pages, and tools
- Each glossary term is auto-linked from all content
- Each tool generates leads that become users
- Each new page strengthens every other page's authority
- Domain authority grows, making every new page rank faster

**Start with Phase 1. Execute relentlessly. Measure monthly. Adjust quarterly.**
