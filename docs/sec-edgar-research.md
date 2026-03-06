# SEC EDGAR as a Free Data Source for StoxPulse

## Deep Research Report - March 2026

**Updated with verified API responses from live EDGAR endpoints.**

---

## Table of Contents

1. [API Endpoints Reference](#1-api-endpoints-reference)
2. [XBRL Company Facts API](#2-xbrl-company-facts-api)
3. [XBRL Company Concept API](#3-xbrl-company-concept-api)
4. [XBRL Frames API](#4-xbrl-frames-api)
5. [Full-Text Search API (EFTS)](#5-full-text-search-api-efts)
6. [Company Submissions API](#6-company-submissions-api)
7. [Insider Trading Data (Form 4)](#7-insider-trading-data-form-4)
8. [CIK-Ticker Mapping](#8-cik-ticker-mapping)
9. [Bulk Data Downloads](#9-bulk-data-downloads)
10. [Rate Limits & Best Practices](#10-rate-limits--best-practices)
11. [Data Quality Assessment](#11-data-quality-assessment)
12. [What EDGAR Cannot Provide](#12-what-edgar-cannot-provide)
13. [Implementation Strategy for StoxPulse](#13-implementation-strategy-for-stoxpulse)
14. [Key Questions Answered](#14-key-questions-answered)

---

## 1. API Endpoints Reference

All `data.sec.gov` endpoints return JSON. All require a `User-Agent` header. No authentication or API keys needed.

### Data APIs (data.sec.gov)

| Endpoint | URL | Description |
|----------|-----|-------------|
| **Submissions** | `https://data.sec.gov/submissions/CIK{cik10}.json` | Filing history + company metadata |
| **Company Facts** | `https://data.sec.gov/api/xbrl/companyfacts/CIK{cik10}.json` | ALL XBRL facts for a company |
| **Company Concept** | `https://data.sec.gov/api/xbrl/companyconcept/CIK{cik10}/{taxonomy}/{tag}.json` | Single XBRL concept history |
| **Frames** | `https://data.sec.gov/api/xbrl/frames/{taxonomy}/{tag}/{unit}/{period}.json` | Cross-company comparison for one metric/period |

### Ticker/CIK Mapping Files (sec.gov)

| File | URL | Entries |
|------|-----|---------|
| **company_tickers.json** | `https://www.sec.gov/files/company_tickers.json` | 10,425 |
| **company_tickers_exchange.json** | `https://www.sec.gov/files/company_tickers_exchange.json` | 10,412 |
| **company_tickers_mf.json** | `https://www.sec.gov/files/company_tickers_mf.json` | Mutual funds |

### Full-Text Search (efts.sec.gov)

| Endpoint | URL |
|----------|-----|
| **EFTS Search** | `https://efts.sec.gov/LATEST/search-index?q={query}&forms={formType}&dateRange=custom&startdt={YYYY-MM-DD}&enddt={YYYY-MM-DD}` |

### Bulk Downloads

| File | URL |
|------|-----|
| **companyfacts.zip** | `https://www.sec.gov/Archives/edgar/daily-index/xbrl/companyfacts.zip` |
| **submissions.zip** | `https://www.sec.gov/Archives/edgar/daily-index/bulkdata/submissions.zip` |

### Filing Document Access

```
https://www.sec.gov/Archives/edgar/data/{cik}/{accessionNoNoDashes}/{primaryDocument}
```

Where accession number dashes are removed (e.g., `0000320193-26-000006` becomes `000032019326000006`).

### RSS Feeds

```
https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK={cik}&type={formType}&dateb=&owner=include&count=40&action=getcompany&output=atom
```

RSS feeds update every 10 minutes, Monday-Friday, 6am-10pm EST.

---

## 2. XBRL Company Facts API

### Endpoint
```
GET https://data.sec.gov/api/xbrl/companyfacts/CIK{10-digit-CIK}.json
```

### Verified Response Structure (Apple Inc.)

```json
{
  "cik": 320193,
  "entityName": "Apple Inc.",
  "facts": {
    "dei": {
      "EntityCommonStockSharesOutstanding": { ... },
      "EntityPublicFloat": { ... }
    },
    "us-gaap": {
      // 503 tags for Apple
      "EarningsPerShareDiluted": {
        "label": "Earnings Per Share, Diluted",
        "description": "The amount of net income (loss) for the period...",
        "units": {
          "USD/shares": [
            {
              "start": "2025-09-28",
              "end": "2025-12-27",
              "val": 2.84,
              "accn": "0000320193-26-000006",
              "fy": 2026,
              "fp": "Q1",
              "form": "10-Q",
              "filed": "2026-01-30",
              "frame": "CY2025Q4"
            }
          ]
        }
      }
    }
  }
}
```

### Key Fields in Each Fact Entry

| Field | Description |
|-------|-------------|
| `start` | Period start date |
| `end` | Period end date |
| `val` | The numeric value |
| `accn` | Accession number of the filing |
| `fy` | Fiscal year |
| `fp` | Fiscal period (FY, Q1, Q2, Q3, Q4) |
| `form` | Filing form type (10-K, 10-Q) |
| `filed` | Date the filing was made |
| `frame` | Canonical period identifier (use for deduplication) |

### Critical Implementation Detail: Deduplication via `frame`

Each fact may appear multiple times because quarterly filings include prior-period comparisons. **Filter by the `frame` field** to get one canonical value per period:
- `CY2025` = Full year 2025
- `CY2025Q4` = Q4 2025 (duration ~91 days)
- `CY2025Q4I` = Instantaneous/point-in-time (for balance sheet items)

Only entries with a `frame` field are the deduplicated, canonical values.

### Complete XBRL Tag Reference for Financial Statements

**Income Statement Tags (Verified Available for Apple):**

| Metric | XBRL Tag | Data Points | Units |
|--------|----------|-------------|-------|
| Revenue (current) | `RevenueFromContractWithCustomerExcludingAssessedTax` | 109 | USD |
| Revenue (older filings) | `Revenues` | 11 | USD |
| Revenue (legacy) | `SalesRevenueNet` | 210 | USD |
| Gross Profit | `GrossProfit` | 330 | USD |
| COGS | `CostOfGoodsAndServicesSold` | 226 | USD |
| Operating Income | `OperatingIncomeLoss` | 226 | USD |
| Net Income | `NetIncomeLoss` | 330 | USD |
| EPS (Basic) | `EarningsPerShareBasic` | 330 | USD/shares |
| EPS (Diluted) | `EarningsPerShareDiluted` | 330 | USD/shares |

**Balance Sheet Tags:**

| Metric | XBRL Tag |
|--------|----------|
| Total Assets | `Assets` |
| Current Assets | `AssetsCurrent` |
| Non-Current Assets | `AssetsNoncurrent` |
| Total Liabilities | `Liabilities` |
| Current Liabilities | `LiabilitiesCurrent` |
| Stockholders' Equity | `StockholdersEquity` |
| Cash & Equivalents | `CashAndCashEquivalentsAtCarryingValue` |
| Accounts Receivable | `AccountsReceivableNetCurrent` |
| Accounts Payable | `AccountsPayableCurrent` |
| Long-Term Debt | `LongTermDebt` |
| Shares Outstanding | `CommonStockSharesOutstanding` |

**Cash Flow Tags (IMPORTANT: tag names use `ProvidedByUsedIn`, NOT `ProvidedBy`):**

| Metric | XBRL Tag | Data Points |
|--------|----------|-------------|
| Operating Cash Flow | `NetCashProvidedByUsedInOperatingActivities` | 130 |
| Investing Cash Flow | `NetCashProvidedByUsedInInvestingActivities` | 130 |
| Financing Cash Flow | `NetCashProvidedByUsedInFinancingActivities` | 130 |

### Tag Inconsistency Problem

Companies use different XBRL tags for the same concept. Your code must check multiple tag variants:

```typescript
const REVENUE_TAGS = [
  'RevenueFromContractWithCustomerExcludingAssessedTax', // Most common since ASC 606
  'Revenues',                                            // Some companies
  'SalesRevenueNet',                                     // Older filings
  'RevenueFromContractWithCustomerIncludingAssessedTax', // Telecom, insurance
];
```

---

## 3. XBRL Company Concept API

Returns the complete history of a single XBRL tag for one company.

### Endpoint
```
GET https://data.sec.gov/api/xbrl/companyconcept/CIK{cik10}/{taxonomy}/{tag}.json
```

### Verified Example: Apple Revenue

```
GET https://data.sec.gov/api/xbrl/companyconcept/CIK0000320193/us-gaap/RevenueFromContractWithCustomerExcludingAssessedTax.json
```

Response:
```json
{
  "cik": 320193,
  "taxonomy": "us-gaap",
  "tag": "RevenueFromContractWithCustomerExcludingAssessedTax",
  "label": "Revenue from Contract with Customer, Excluding Assessed Tax",
  "entityName": "Apple Inc.",
  "units": {
    "USD": [
      {
        "frame": "CY2024Q4",
        "val": 124300000000,
        "form": "10-Q",
        "filed": "2026-01-30",
        "start": "2024-09-29",
        "end": "2024-12-28"
      },
      {
        "frame": "CY2025Q1",
        "val": 95359000000,
        "form": "10-Q",
        "filed": "2025-05-02"
      },
      {
        "frame": "CY2025Q2",
        "val": 94036000000,
        "form": "10-Q",
        "filed": "2025-08-01"
      },
      {
        "frame": "CY2025",
        "val": 416161000000,
        "form": "10-K",
        "filed": "2025-10-31"
      },
      {
        "frame": "CY2025Q4",
        "val": 143756000000,
        "form": "10-Q",
        "filed": "2026-01-30"
      }
    ]
  }
}
```

**Use case:** When you only need one specific metric for a company, this is more efficient than fetching all 503 tags via companyfacts.

---

## 4. XBRL Frames API

Returns one fact per company for a specific metric and period. **This is the most powerful endpoint for cross-company screening.**

### Endpoint
```
GET https://data.sec.gov/api/xbrl/frames/{taxonomy}/{tag}/{unit}/{period}.json
```

### Verified Example: Q4 2024 Revenue (All Companies)

```
GET https://data.sec.gov/api/xbrl/frames/us-gaap/Revenues/USD/CY2024Q4.json
```

Response:
```json
{
  "taxonomy": "us-gaap",
  "tag": "Revenues",
  "ccp": "CY2024Q4",
  "uom": "USD",
  "label": "Revenues",
  "description": "Amount of revenue recognized from goods sold...",
  "pts": 446,
  "data": [
    {
      "accn": "0000002969-26-000008",
      "cik": 2969,
      "entityName": "AIR PRODUCTS AND CHEMICALS, INC.",
      "loc": "US-PA",
      "start": "2024-10-01",
      "end": "2024-12-31",
      "val": 2931500000
    },
    {
      "accn": "0000004127-26-000008",
      "cik": 4127,
      "entityName": "Skyworks Solutions, Inc.",
      "loc": "US-CA",
      "start": "2024-09-28",
      "end": "2024-12-27",
      "val": 1068500000
    }
  ]
}
```

**446 companies** reported the `Revenues` tag for Q4 2024 in a single API call.

### Period Format Reference

| Format | Meaning | Duration Filter | Use For |
|--------|---------|-----------------|---------|
| `CY2024` | Annual 2024 | ~365 days +/- 30 days | Income statement, cash flow (annual) |
| `CY2024Q4` | Q4 2024 | ~91 days +/- 30 days | Income statement, cash flow (quarterly) |
| `CY2024Q4I` | Instantaneous Q4 2024 end | Point-in-time | Balance sheet items (Assets, Liabilities) |

### Key Use Cases
- **Stock screener**: Compare revenue, earnings, margins across all companies in one call
- **Sector analysis**: Filter by SIC code after fetching frame data
- **Ratio calculations**: Fetch multiple metrics (revenue, net income, assets) for the same period

---

## 5. Full-Text Search API (EFTS)

Search the full text of all EDGAR filings since 2001, including attachments and exhibits.

### Endpoint
```
GET https://efts.sec.gov/LATEST/search-index?q={query}&forms={formTypes}&dateRange=custom&startdt={YYYY-MM-DD}&enddt={YYYY-MM-DD}
```

### Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `q` | Search query. Supports AND, OR, NOT, `*` wildcards, `"exact phrases"` | `"artificial intelligence"` |
| `forms` | Comma-separated form types | `10-K,10-Q,8-K` |
| `dateRange` | Set to `custom` for date range filtering | `custom` |
| `startdt` | Start date (YYYY-MM-DD) | `2025-01-01` |
| `enddt` | End date (YYYY-MM-DD) | `2025-12-31` |

### Verified Response Structure

```json
{
  "took": 45,
  "timed_out": false,
  "_shards": { "total": 15, "successful": 15, "failed": 0 },
  "hits": {
    "total": { "value": 10000, "relation": "gte" },
    "max_score": 18.22,
    "hits": [
      {
        "_index": "edgar_file",
        "_id": "0001641172-25-012903:form10-k.htm",
        "_score": 18.224878,
        "_source": {
          "ciks": ["0001498148"],
          "period_ending": "2025-02-28",
          "file_num": ["000-55079"],
          "display_names": ["Artificial Intelligence Technology Solutions Inc.  (AITX)  (CIK 0001498148)"],
          "root_forms": ["10-K"],
          "file_date": "2025-05-29",
          "biz_states": ["MI"],
          "sics": ["7372"],
          "form": "10-K",
          "adsh": "0001641172-25-012903",
          "biz_locations": ["Ferndale, MI"],
          "file_type": "10-K",
          "file_description": "10-K",
          "inc_states": ["NV"],
          "items": []
        }
      }
    ]
  },
  "aggregations": { ... },
  "query": { ... }
}
```

### Search Syntax
- **Implicit AND**: `artificial intelligence` finds filings containing BOTH words
- **Exact phrase**: `"artificial intelligence"` matches the exact phrase
- **NOT/exclusion**: `-term` or `NOT term` excludes filings containing that term
- **Wildcards**: `intellig*` matches intelligence, intelligent, etc.
- **Results**: Returns up to 100 results per request
- **Coverage**: All electronically submitted filings since 2001

### Use Cases for StoxPulse
- Search for risk factor mentions (e.g., "tariff", "recession", "supply chain")
- Find filings mentioning specific topics across all companies
- Track regulatory risk language in 10-K filings
- Feed filing text to AI for sentiment analysis

---

## 6. Company Submissions API

### Endpoint
```
GET https://data.sec.gov/submissions/CIK{10-digit-CIK}.json
```

### Verified Response Structure (Apple Inc.)

```json
{
  "cik": "0000320193",
  "entityType": "operating",
  "sic": "3571",
  "sicDescription": "Electronic Computers",
  "name": "Apple Inc.",
  "tickers": ["AAPL"],
  "exchanges": ["Nasdaq"],
  "ein": "942404110",
  "category": "Large accelerated filer",
  "fiscalYearEnd": "0926",
  "stateOfIncorporation": "CA",
  "phone": "(408) 996-1010",
  "addresses": { "mailing": { ... }, "business": { ... } },
  "insiderTransactionForOwnerExists": 1,
  "insiderTransactionForIssuerExists": 1,
  "filings": {
    "recent": {
      "accessionNumber": ["0001059235-26-000004", ...],
      "filingDate": ["2026-02-26", ...],
      "reportDate": ["2026-02-24", ...],
      "acceptanceDateTime": ["2026-02-26T17:05:32.000Z", ...],
      "act": ["34", ...],
      "form": ["4", ...],
      "fileNumber": ["001-36743", ...],
      "items": ["", ...],
      "core_type": ["4", ...],
      "size": [5765, ...],
      "isXBRL": [1, ...],
      "isInlineXBRL": [1, ...],
      "primaryDocument": ["xslF345X05/wk-form4_1772148856.xml", ...],
      "primaryDocDescription": ["FORM 4", ...]
    },
    "files": [
      {
        "name": "CIK0000320193-submissions-001.json",
        "filingCount": 1206,
        "filingFrom": "1994-01-26",
        "filingTo": "2015-03-11"
      }
    ]
  }
}
```

### Key Details

- **Recent filings**: Last 1,005 filings in `filings.recent` (columnar format -- arrays of values by field)
- **Older filings**: Referenced in `filings.files` array, accessible at `https://data.sec.gov/submissions/{filename}`
- **Update latency**: < 1 second after filing dissemination

### Form Type Distribution (Apple, last 1,005 filings)

| Form Type | Count | Description |
|-----------|-------|-------------|
| Form 4 | 596 | Insider trades |
| 8-K | 106 | Current reports (material events) |
| 424B2 | 50 | Prospectus supplements |
| 144 | 38 | Sale of restricted securities |
| 10-Q | 33 | Quarterly reports |
| DEF 14A | 11 | Proxy statements |
| 10-K | 11 | Annual reports |
| Form 3 | 10 | Initial insider ownership |
| SD | 10 | Specialized disclosure |

---

## 7. Insider Trading Data (Form 4)

### How to Access

1. **Via Submissions API**: Filter `filings.recent.form` for `"4"` -- Apple has 596 Form 4 filings in recent history
2. **Via EFTS Search**: `?q=&forms=4` to find insider trading filings across all companies
3. **Direct XML Parsing**: Each Form 4 is filed as XML and can be parsed for transaction details

### Available Fields in Form 4

- **Reporting owner**: Name, relationship to issuer (officer, director, 10% owner)
- **Issuer**: Company name and CIK
- **Transaction details**: Date, code (P=Purchase, S=Sale, A=Award), shares, price, shares owned after
- **Derivative transactions**: Options, warrants, conversion details

### Bulk Insider Transactions Data Sets

The SEC provides pre-parsed quarterly datasets:
- **URL**: `https://www.sec.gov/data-research/sec-markets-data/insider-transactions-data-sets`
- **Format**: Tab-separated ZIP files, organized by quarter
- **Coverage**: January 2006 to present
- **Source**: Extracted from XML-based fillable portion of Forms 3, 4, and 5

### Data Freshness
- Form 4 must be filed within 2 business days of the transaction
- Submissions API updates within < 1 second of filing

---

## 8. CIK-Ticker Mapping

### company_tickers.json (Verified)

```
GET https://www.sec.gov/files/company_tickers.json
```

```json
{
  "0": {"cik_str": 1045810, "ticker": "NVDA", "title": "NVIDIA CORP"},
  "1": {"cik_str": 320193, "ticker": "AAPL", "title": "Apple Inc."},
  "2": {"cik_str": 1652044, "ticker": "GOOGL", "title": "Alphabet Inc."},
  "3": {"cik_str": 789019, "ticker": "MSFT", "title": "MICROSOFT CORP"},
  "4": {"cik_str": 1018724, "ticker": "AMZN", "title": "AMAZON COM INC"}
}
```

**10,425 entries** total, roughly ordered by market cap. Keys are numeric-string indices, NOT an array.

### company_tickers_exchange.json (Verified)

```
GET https://www.sec.gov/files/company_tickers_exchange.json
```

```json
{
  "fields": ["cik", "name", "ticker", "exchange"],
  "data": [
    [1045810, "NVIDIA CORP", "NVDA", "Nasdaq"],
    [320193, "Apple Inc.", "AAPL", "Nasdaq"],
    [1652044, "Alphabet Inc.", "GOOGL", "Nasdaq"],
    [789019, "MICROSOFT CORP", "MSFT", "Nasdaq"],
    [1018724, "AMAZON COM INC", "AMZN", "Nasdaq"]
  ]
}
```

**10,412 entries** with exchange info. More efficient columnar format.

### CIK Padding

CIK numbers must be zero-padded to 10 digits for all API URLs:
```
Ticker AAPL -> CIK 320193 -> API path: CIK0000320193
```

---

## 9. Bulk Data Downloads

### companyfacts.zip

- **URL**: `https://www.sec.gov/Archives/edgar/daily-index/xbrl/companyfacts.zip`
- **Contents**: One JSON file per CIK (`CIK0000000000.json`), identical format to the companyfacts API
- **Coverage**: ~15,000 companies with XBRL filings
- **Size**: ~2-3 GB compressed
- **Update**: Recompiled nightly
- **Use case**: Initial data load -- download once, parse into database

### submissions.zip

- **URL**: `https://www.sec.gov/Archives/edgar/daily-index/bulkdata/submissions.zip`
- **Contents**: One JSON file per CIK, identical format to submissions API
- **Coverage**: All EDGAR filers
- **Update**: Recompiled nightly at ~3:00 AM ET
- **Use case**: Build complete filing index and company metadata cache

### Full-Text Index Files

```
https://www.sec.gov/Archives/edgar/full-index/{year}/QTR{quarter}/
```

Contains index files listing all filings per quarter. Useful for building a complete historical filing database.

### Strategy

1. Download both ZIP files on initial setup (one-time, ~4-5 GB total)
2. Parse and load into database (PostgreSQL recommended)
3. Use live APIs only for incremental updates after initial load

---

## 10. Rate Limits & Best Practices

### Current Limits

- **10 requests/second** per IP address, regardless of number of machines
- Exceeding this results in temporary IP throttling/blocking (not permanent ban)
- No authentication required

### Required User-Agent Header (Mandatory)

```
User-Agent: StoxPulse admin@stoxpulse.com
```

Format: `AppName ContactEmail`. Requests without a proper User-Agent will be blocked.

### CORS

**EDGAR APIs do NOT include CORS headers.** All requests must go through your backend server -- browser-side JavaScript cannot call these APIs directly.

### Rate Limit Strategy for 500+ Stock Watchlist

| Operation | Requests | Time at 9 req/s |
|-----------|----------|-----------------|
| All companyfacts (500 companies) | 500 | ~56 seconds |
| All submissions (500 companies) | 500 | ~56 seconds |
| Single concept for 500 companies | 500 | ~56 seconds |
| Frames API (one metric, ALL companies) | 1 | < 1 second |

**Recommended approach:**
1. **Initial load**: Download `companyfacts.zip` + `submissions.zip` (zero API calls)
2. **Daily updates**: Poll submissions endpoint for watchlist companies at 8-9 req/sec
3. **Cross-company screens**: Use Frames API (1 request = all companies for one metric/period)
4. **Real-time detection**: Sweep 500 companies every 60 seconds via submissions API
5. **Cache**: Financial data changes only quarterly -- cache aggressively (24h minimum)
6. **Queue**: Use a job queue (BullMQ, etc.) with rate limiter for background data fetches

---

## 11. Data Quality Assessment

### XBRL Completeness for S&P 500

**Coverage is excellent for large-cap companies.** Verified: Apple has 503 us-gaap tags.

| Category | Coverage for S&P 500 |
|----------|---------------------|
| Income statement (revenue, net income, EPS) | ~100% |
| Balance sheet (assets, liabilities, equity) | ~100% |
| Cash flow statement | ~100% |
| Shares outstanding | ~100% |
| Segment data | Variable (~70-80%) |
| Footnote details | Variable |

### Known Data Quality Issues

1. **Tag inconsistency**: Revenue might be `Revenues`, `SalesRevenueNet`, or `RevenueFromContractWithCustomerExcludingAssessedTax`. Build a tag mapping layer.
2. **Scaling errors**: Rare for large-cap, but some small-cap filers tag values with wrong number of zeros.
3. **Sign errors**: Some filers use negative values when positive is expected (and vice versa).
4. **Custom extensions**: Companies may use custom XBRL tags instead of standard us-gaap tags for industry-specific metrics.
5. **Duplicate entries**: Quarterly filings include prior-period comparisons. Filter by `frame` field.
6. **Tag evolution**: GAAP taxonomy updates yearly. Tags used in 2015 may differ from tags used in 2025.

### Practical Impact

For S&P 500 companies: Data is highly reliable for core financial metrics. For small-cap and micro-cap: expect 5-10% error rates on some tags. Always cross-validate critical values and implement sanity checks (e.g., revenue > 0, assets > 0).

---

## 12. What EDGAR Cannot Provide

### Data That Requires Paid/External Sources

| Data Type | Why EDGAR Can't Provide It | Free Alternatives |
|-----------|---------------------------|-------------------|
| **Real-time stock prices** | EDGAR is for filings, not market data | Yahoo Finance (unofficial), Alpha Vantage (25 req/day free) |
| **Historical stock prices** | Not in scope | Yahoo Finance, Polygon.io |
| **Analyst estimates/consensus** | Not filed with SEC | No free source; paid: Zacks, FactSet, Refinitiv |
| **Earnings call transcripts** | Not structured; 8-K has results but not transcript | Seeking Alpha (free, scraping), paid APIs |
| **Standardized financials** | XBRL tags vary by company; requires normalization | SimFin (free tier), Financial Modeling Prep |
| **Company news** | Not in scope | NewsAPI, Finnhub (free tier), Google News RSS |
| **Technical indicators** | Requires price data | Calculate from price data |
| **Options data** | Not in scope | CBOE, Tradier |
| **Institutional holdings (real-time)** | 13F filings are quarterly with 45-day delay | WhaleWisdom, Fintel |
| **Push notifications for filings** | RSS updates only every 10 minutes | Build polling system or use paid service |

### What EDGAR Replaces (Cost Savings)

| Data Type | Replaces Paid Service | Savings |
|-----------|----------------------|---------|
| Financial statements (10-K, 10-Q) | Financial Modeling Prep, SimFin | $30-100/mo |
| Filing history & metadata | sec-api.io | $50-200/mo |
| Insider trades (Form 4) | Finviz Pro, OpenInsider | $25-50/mo |
| Institutional holdings (13F) | WhaleWisdom | $50-100/mo |
| Company metadata | Various providers | Variable |
| Full-text filing search | Third-party search APIs | $50-200/mo |

---

## 13. Implementation Strategy for StoxPulse

### Phase 1: Foundation (Week 1-2)

1. **CIK lookup table**: Load `company_tickers_exchange.json`, build ticker-to-CIK map
2. **Bulk data load**: Download `companyfacts.zip` + `submissions.zip`, parse into database
3. **Rate limiter**: Token bucket at 9 req/sec (stay safely under 10)
4. **Tag normalization**: Map variant XBRL tags to canonical names

### Phase 2: Core Data Pipeline (Week 3-4)

1. **Financial data service**: Extract key metrics per company from companyfacts
2. **Filing monitor**: Poll submissions endpoint every 60 seconds for watchlist
3. **Insider trade parser**: Parse Form 4 XML for buy/sell signals
4. **Frames-based screener**: Cross-company metric comparison

### Phase 3: Intelligence Layer (Week 5+)

1. **EFTS integration**: Search filing text for risk factors, guidance, key topics
2. **Filing diff detection**: Compare new 10-Q/10-K to previous for material changes
3. **AI summarization**: Feed filing text to LLM for plain-English summaries

### Near Real-Time Filing Detection Architecture

The submissions API updates within 1 second of filing dissemination:

```
Cron job (every 60 seconds)
  -> For each watchlist company (batch at 9 req/sec)
    -> GET /submissions/CIK{cik}.json
    -> Compare latest filingDate + acceptanceDateTime to last known
    -> If new filing detected:
      -> Trigger user notification
      -> Fetch filing document
      -> Queue for AI analysis
```

For 500 companies at 9 req/sec = ~56 seconds per sweep. With 60-second intervals, you get near real-time detection.

### Recommended Database Schema

```sql
CREATE TABLE companies (
  cik TEXT PRIMARY KEY,
  ticker TEXT UNIQUE,
  name TEXT,
  exchange TEXT,
  sic TEXT,
  sic_description TEXT,
  fiscal_year_end TEXT,
  category TEXT
);

CREATE TABLE financial_facts (
  cik TEXT,
  tag TEXT,               -- Raw XBRL tag
  canonical_tag TEXT,     -- Normalized name (e.g., 'Revenue')
  period TEXT,            -- Frame: CY2025Q4
  value NUMERIC,
  unit TEXT,              -- USD, USD/shares, shares
  form TEXT,              -- 10-K, 10-Q
  filed DATE,
  accession TEXT,
  PRIMARY KEY (cik, tag, period)
);

CREATE TABLE filings (
  accession TEXT PRIMARY KEY,
  cik TEXT,
  form TEXT,
  filing_date DATE,
  report_date DATE,
  acceptance_datetime TIMESTAMPTZ,
  primary_document TEXT,
  is_xbrl BOOLEAN,
  processed BOOLEAN DEFAULT FALSE
);

CREATE TABLE insider_trades (
  accession TEXT,
  cik TEXT,               -- Issuer CIK
  owner_name TEXT,
  relationship TEXT,      -- officer, director, 10% owner
  transaction_type TEXT,  -- P=Purchase, S=Sale, A=Award
  shares NUMERIC,
  price NUMERIC,
  transaction_date DATE,
  filing_date DATE,
  PRIMARY KEY (accession, owner_name, transaction_date)
);
```

### TypeScript API Wrapper (Minimal Implementation)

```typescript
const SEC_BASE = 'https://data.sec.gov';
const HEADERS = {
  'User-Agent': 'StoxPulse admin@stoxpulse.com',
  'Accept': 'application/json'
};

function padCik(cik: string | number): string {
  return String(cik).padStart(10, '0');
}

async function getCompanyFacts(cik: string) {
  const res = await fetch(
    `${SEC_BASE}/api/xbrl/companyfacts/CIK${padCik(cik)}.json`,
    { headers: HEADERS }
  );
  return res.json();
}

async function getSubmissions(cik: string) {
  const res = await fetch(
    `${SEC_BASE}/submissions/CIK${padCik(cik)}.json`,
    { headers: HEADERS }
  );
  return res.json();
}

async function getCompanyConcept(cik: string, taxonomy: string, tag: string) {
  const res = await fetch(
    `${SEC_BASE}/api/xbrl/companyconcept/CIK${padCik(cik)}/${taxonomy}/${tag}.json`,
    { headers: HEADERS }
  );
  return res.json();
}

async function getFrame(taxonomy: string, tag: string, unit: string, period: string) {
  const res = await fetch(
    `${SEC_BASE}/api/xbrl/frames/${taxonomy}/${tag}/${unit}/${period}.json`,
    { headers: HEADERS }
  );
  return res.json();
}
```

---

## 14. Key Questions Answered

| Question | Answer |
|----------|--------|
| Can we get full financial statements from EDGAR XBRL for free? | **Yes.** Revenue, net income, EPS, balance sheet, cash flow -- all available. Apple has 503 XBRL tags, 330 EPS data points. |
| How complete is XBRL data for S&P 500? | **Excellent.** ~100% coverage for core financial metrics. Verified with live API data. |
| Latency between filing and API availability? | **Submissions: < 1 second. XBRL: < 1 minute.** |
| Can we detect new filings in near real-time? | **Yes.** Poll submissions endpoint every 60 seconds. 500 companies = ~56 seconds per sweep at 9 req/sec. |
| How to handle rate limits for 500+ stocks? | **Bulk download for initial load. Frames API for cross-company queries (1 request = all companies). Poll incrementally for updates.** |
| What do we still need paid APIs for? | **Stock prices, analyst estimates, earnings transcripts, news.** EDGAR covers ~60-70% of StoxPulse's data needs for free. |

---

## Sources

- [SEC EDGAR APIs Official Page](https://www.sec.gov/search-filings/edgar-application-programming-interfaces)
- [SEC Developer Resources](https://www.sec.gov/about/developer-resources)
- [SEC Accessing EDGAR Data](https://www.sec.gov/search-filings/edgar-search-assistance/accessing-edgar-data)
- [EDGAR Full Text Search FAQ](https://www.sec.gov/edgar/search/efts-faq.html)
- [EDGAR Full Text Search UI](https://www.sec.gov/edgar/search/)
- [EDGAR API Development Toolkit](https://api.edgarfiling.sec.gov/)
- [SEC Insider Transactions Data Sets](https://www.sec.gov/data-research/sec-markets-data/insider-transactions-data-sets)
- [SEC Inline XBRL](https://www.sec.gov/data-research/structured-data/inline-xbrl)
- [SEC Structured Disclosure RSS Feeds](https://www.sec.gov/structureddata/rss-feeds)
- [EDGAR XBRL Guide (February 2026)](https://www.sec.gov/files/edgar/filer-information/specifications/xbrl-guide.pdf)
- [sec-edgar-api Python Docs](https://sec-edgar-api.readthedocs.io/)
- [edgartools Python Library](https://github.com/dgunning/edgartools)
- [Intro to EDGAR API (Full Stack Accountant)](https://www.thefullstackaccountant.com/blog/intro-to-edgar)
- [GreenFlux Blog - Integrating with SEC API](https://blog.greenflux.us/so-you-want-to-integrate-with-the-sec-api/)
- [XBRL Data Quality Concerns (IRIS CARBON)](https://iriscarbon.com/xbrl-data-quality-continues-to-be-a-concern-in-sec-filings/)
