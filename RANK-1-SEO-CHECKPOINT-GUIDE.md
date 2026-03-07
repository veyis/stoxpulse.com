# Rank #1 SEO Checkpoint Guide — March 2026

> **The definitive, research-backed checklist for ranking #1 on Google.** Combines Google Search Central documentation, 2026 algorithm updates, AI Overview optimization, Core Web Vitals, local SEO, E-E-A-T, and generative engine optimization (GEO) into one actionable guide.

**How to use this guide:**
- **Full audit:** Run quarterly across all 15 pillars.
- **Monthly sprint:** Pillars 1, 3, 8, 12, and 15 (indexing, CWV, local, monitoring, AI).
- **After every deploy:** Pillars 1, 2, 3 (crawlability, technical, performance).
- **Priority levels:** P0 = blocks ranking entirely; P1 = high impact on positions; P2 = competitive edge / polish.
- **Status:** Use `[x]` when verified, `[ ]` when pending, `[!]` when broken and needs fix.

**What changed in 2026:**
- Freshness is now the 6th biggest ranking factor (~6% weight) — pages updated within 12 months gain avg. 4.6 positions.
- INP replaced FID permanently; scroll performance metrics are now evaluated.
- AI Overviews cite 47% of results from pages ranking BELOW position #5 — content quality beats domain authority.
- Entity-based evaluation for local SEO — Google evaluates your business as a unified entity (GBP + website + citations).
- February 2026 Discover core update prioritizes geo-relevant content and fewer domains.
- Schema markup makes pages 3x more likely to earn AI citations.

---

## PILLAR 1 — Search Eligibility & Crawlability

*If Google can't crawl and index you, nothing else matters.*

### 1.1 Indexing

- [ ] **P0** `site:yourdomain.com` returns all key pages (homepage, services, locations, blog).
- [ ] **P0** No critical pages blocked by `robots.txt` or `noindex` — CSS/JS not blocked (Google must render).
- [ ] **P0** URL Inspection in GSC shows "URL is on Google" for top 20 pages; rendered content matches what users see.
- [ ] **P1** XML sitemap submitted in Search Console — `<50 MB`, `<50,000 URLs` per file; only indexable URLs; accurate `lastmod` dates.
- [ ] **P1** Single canonical domain version — one host (www vs non-www); 301 redirect from non-preferred. No http:// accessible.
- [ ] **P1** New pages discovered within 48 hours — verify via GSC URL Inspection or `site:` search.

### 1.2 Crawlability

- [ ] **P0** Important links in HTML `<a href="">` — no JavaScript-only navigation for key content.
- [ ] **P1** No crawl traps — session IDs, infinite pagination, calendar archives don't create unlimited URL variants.
- [ ] **P1** Zero orphan pages — every key page has at least 2+ internal links from related hub pages.
- [ ] **P1** `robots.txt` points to sitemap; allows all important crawlers (Googlebot, Bingbot, AI bots).
- [ ] **P2** Crawl budget (large sites): noindex or consolidate low-value URLs (filters, sort orders, tag pages).

### 1.3 Opt-out Controls

- [ ] **P2** Admin, staging, private, and low-value URLs blocked via `noindex` or `robots.txt`.
- [ ] **P2** User-generated links use `rel="nofollow"` or `rel="ugc"` automatically.

---

## PILLAR 2 — Technical SEO & URL Health

### 2.1 HTTPS & Security

- [ ] **P0** HTTPS sitewide — valid SSL certificate; HTTP 301-redirects to HTTPS.
- [ ] **P1** HSTS header: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`.
- [ ] **P1** No mixed content — zero HTTP resources loaded on HTTPS pages.
- [ ] **P1** Security headers present: `X-Content-Type-Options: nosniff`, `X-Frame-Options` (or CSP `frame-ancestors`), `Referrer-Policy`.
- [ ] **P2** Content Security Policy (CSP) header — at minimum, report-only mode.

### 2.2 URLs & Canonicalization

- [ ] **P0** One canonical URL per piece of content — no duplicate content without canonical or redirect.
- [ ] **P1** Descriptive URLs with words (e.g. `/services/deck-building` not `/p/123`).
- [ ] **P1** `<link rel="canonical" href="...">` on every page pointing to preferred version.
- [ ] **P1** 301 redirects from old/duplicate URLs to canonical — no chains longer than 2 hops.
- [ ] **P1** Trailing slash consistency — pick one, redirect the other.
- [ ] **P2** No URL parameters creating duplicate content — consolidate or use canonical.

### 2.3 Status Codes & Errors

- [ ] **P1** Missing pages return HTTP 404 (not soft 404s returning 200 with thin/error content).
- [ ] **P1** Removed pages use 410 Gone when permanently deleted.
- [ ] **P1** Zero broken internal links — crawl site monthly; fix or remove.
- [ ] **P2** Custom 404 page with navigation, search, and links to key pages.

### 2.4 Rendering & JavaScript

- [ ] **P1** Server-side rendered (SSR) or statically generated — critical content in initial HTML, not client-only JS.
- [ ] **P1** Google renders your pages correctly — verify via URL Inspection "View Rendered Page".
- [ ] **P2** No critical content behind lazy-load that requires user interaction to appear.

---

## PILLAR 3 — Core Web Vitals & Page Experience

*Failing CWV correlates with ~24% lower organic CTR. Google uses 75th percentile real-user data.*

### 3.1 Targets (Mobile Priority)

| Metric | Good | Poor | What It Measures |
|--------|------|------|-----------------|
| **LCP** | <= 2.5s | > 4.0s | Loading speed (largest visible element) |
| **INP** | <= 200ms | > 500ms | Responsiveness (interaction delay) |
| **CLS** | < 0.1 | > 0.25 | Visual stability (layout shifts) |

- [ ] **P0** LCP <= 2.5s on mobile for all key landing pages.
- [ ] **P0** INP <= 200ms — no long main-thread blocking tasks.
- [ ] **P0** CLS < 0.1 — no unexpected layout shifts.
- [ ] **P1** All three metrics "Good" in GSC Core Web Vitals report (CrUX field data).

### 3.2 LCP Optimization

- [ ] **P1** TTFB < 800ms — fast server/CDN response.
- [ ] **P1** LCP element is an `<img>` with `priority`/`fetchpriority="high"` — not a CSS background image.
- [ ] **P1** Hero image: modern format (WebP/AVIF), responsive `srcset`/`sizes`, quality 50-70.
- [ ] **P1** Critical CSS inlined; non-critical CSS deferred.
- [ ] **P1** Fonts: `font-display: optional` or `swap`; minimize font file count and size.
- [ ] **P1** No render-blocking third-party scripts before LCP.
- [ ] **P2** Preload LCP image via `<link rel="preload">` or framework `priority` prop.

### 3.3 INP Optimization

- [ ] **P1** Break JavaScript tasks > 50ms into smaller chunks — use `scheduler.yield()` or `requestIdleCallback`.
- [ ] **P1** Defer all non-critical third-party scripts (analytics, ads, chat) to after page interactive.
- [ ] **P1** No layout thrashing in event handlers (read then write, not interleaved).
- [ ] **P1** Hydration optimized — use partial hydration / Server Components for non-interactive content.
- [ ] **P2** `content-visibility: auto` on below-fold sections for scroll performance.

### 3.4 CLS Optimization

- [ ] **P1** Explicit `width`/`height` or `aspect-ratio` on all images, videos, iframes.
- [ ] **P1** Font loading doesn't cause visible text reflow — use `font-display: optional`.
- [ ] **P1** Reserve space (min-height / skeleton) for dynamically loaded content.
- [ ] **P1** No injected banners, ads, or cookie notices that push content down after load.

### 3.5 Measurement

- [ ] **P1** GSC "Page Experience" report — zero "Poor" URL groups.
- [ ] **P2** Monthly Lighthouse audit on top 10 pages — track trends.
- [ ] **P2** Test on real mobile devices or throttled Slow 4G simulation.

---

## PILLAR 4 — On-Page SEO & Content Quality

### 4.1 Title Tags

- [ ] **P0** Every page has a unique `<title>` — accurate, descriptive, not duplicated.
- [ ] **P1** Primary keyword appears early in title (first 30 chars ideally).
- [ ] **P1** Length: 50-60 characters to avoid SERP truncation.
- [ ] **P1** Brand name appended (not prepended) via template: `"Page Title | Brand"`.
- [ ] **P1** No duplicate titles across the site — each page targets a distinct keyword.

### 4.2 Meta Descriptions

- [ ] **P1** Unique meta description per page — 150-160 characters.
- [ ] **P1** Contains primary keyword naturally + clear CTA or value proposition.
- [ ] **P1** No duplicate descriptions on important pages.

### 4.3 Headings & Content Structure

- [ ] **P1** One H1 per page — contains primary keyword naturally.
- [ ] **P1** Logical heading hierarchy: H1 > H2 > H3 (no skipping levels).
- [ ] **P1** Headings describe sections clearly — good for featured snippets and accessibility.
- [ ] **P2** Question-style H2s/H3s for FAQ/informational content — targets "People Also Ask".

### 4.4 Content Quality (Helpful, Reliable, People-First)

- [ ] **P0** Original content — not copied or thin auto-generated fluff.
- [ ] **P0** Matches search intent — informational, navigational, commercial, or transactional.
- [ ] **P1** Substantial depth — satisfies user intent completely; no "see more" needed.
- [ ] **P1** Accurate — no factual errors; cite sources where it adds trust.
- [ ] **P1** Readable — short paragraphs, bullet points, scannable; no grammar/spelling errors.
- [ ] **P1** Up to date — refresh content at least annually (freshness = +4.6 positions avg).
- [ ] **P1** Show dates — publish date and "last updated" date visible on content pages.

### 4.5 Keyword Strategy

- [ ] **P1** Each page targets ONE primary keyword — no cannibalization across pages.
- [ ] **P1** Natural keyword variation — cover related terms, long-tail, semantic phrases.
- [ ] **P1** Zero keyword stuffing — write for humans first, search engines second.
- [ ] **P2** Keyword gap analysis quarterly — find terms competitors rank for that you don't.

### 4.6 Internal & External Links

- [ ] **P1** Descriptive anchor text — "deck builder in Bethlehem PA" not "click here".
- [ ] **P1** Key pages linked from homepage or hub pages — maximum 3 clicks to any important page.
- [ ] **P1** Every page has 3-5+ contextual internal links to related pages.
- [ ] **P1** External links only to trusted, authoritative sources.
- [ ] **P1** `rel="nofollow"` on untrusted, UGC, or sponsored external links.
- [ ] **P2** Review and update internal links quarterly — add links to new content from existing pages.

---

## PILLAR 5 — E-E-A-T (Experience, Expertise, Authoritativeness, Trust)

*Trust is the center of E-E-A-T — without trust, the other signals carry less weight. Not a direct ranking factor, but the quality signals Google evaluates map directly to E-E-A-T.*

### 5.1 Experience

- [ ] **P1** Content demonstrates first-hand experience — real project photos, case studies, process descriptions.
- [ ] **P1** Author/creator has verifiable experience in the topic — shown on page.
- [ ] **P1** Real customer testimonials and reviews (from verified platforms, not fabricated).
- [ ] **P2** Behind-the-scenes content — process videos, worksite photos, before/after galleries.

### 5.2 Expertise

- [ ] **P1** Author pages with credentials, qualifications, and relevant background.
- [ ] **P1** Content shows depth beyond the obvious — explains "why" not just "what".
- [ ] **P1** Technical terms used correctly with clear definitions where needed.
- [ ] **P1** Certifications, licenses, and professional affiliations displayed prominently.
- [ ] **P2** Expert bylines on all content — real names, real bios, real photos.

### 5.3 Authoritativeness

- [ ] **P1** Clear "About Us" page with company history, team, credentials.
- [ ] **P1** Industry association memberships visible (NADRA, BBB, manufacturer certifications).
- [ ] **P1** Cited by or linked from other authoritative sources in your industry.
- [ ] **P2** Active presence on industry platforms, directories, and professional networks.

### 5.4 Trustworthiness

- [ ] **P0** HTTPS, contact info, real business address — all verifiable.
- [ ] **P1** Privacy policy, terms of service — clear and accessible.
- [ ] **P1** Real Google reviews linked — not fabricated testimonials.
- [ ] **P1** BBB, licensing, insurance information visible and linkable.
- [ ] **P1** Transparent sourcing — claims backed by verifiable data or links.
- [ ] **P1** Consistent NAP (Name, Address, Phone) across all platforms.
- [ ] **P2** Third-party trust signals — reviews on Google, Yelp, BBB, Houzz, etc.

---

## PILLAR 6 — Search Appearance & Structured Data

### 6.1 SERP Appearance

- [ ] **P1** Favicon: correct format/size, eligible for Search display.
- [ ] **P1** Site name: set via structured data or metadata.
- [ ] **P1** Sitelinks: clear hierarchy and internal links so Google auto-generates good sitelinks.
- [ ] **P1** Publish/update dates visible — article schema or visible byline dates.
- [ ] **P2** Featured snippet optimization — clear H2 + concise 40-60 word answer directly below.
- [ ] **P2** "People Also Ask" targeting — question-format headings with direct answers.

### 6.2 Structured Data (JSON-LD)

- [ ] **P0** Valid JSON-LD on every page — no errors in Rich Results Test.
- [ ] **P1** Structured data matches visible page content — no misleading or spammy data.

**Required schema types by page:**

| Page Type | Schema Types |
|-----------|-------------|
| Every page | `Organization`, `WebSite`, `BreadcrumbList` |
| Homepage | `LocalBusiness`, `WebSite` with `SearchAction` |
| Service pages | `Service`, `FAQPage`, `HowTo` (if step-by-step) |
| Location pages | `LocalBusiness` with `areaServed`, `FAQPage` |
| Blog posts | `Article` with author, dates, images |
| Project/portfolio | `Article`, `Review` (if testimonial included) |
| About page | `Organization`, `Person` (for founders/team) |
| Contact page | `LocalBusiness` with `ContactPoint` |
| Video pages | `VideoObject` with `CollectionPage` |
| FAQ sections | `FAQPage` (2+ Q&A pairs) |
| Comparison/guide | `HowTo` or `Article` with `Speakable` |

- [ ] **P1** `LocalBusiness` schema with correct NAP, hours, `areaServed`, `geo`, `aggregateRating`.
- [ ] **P1** `BreadcrumbList` on all pages matching visible breadcrumbs.
- [ ] **P1** `FAQPage` on pages with 2+ question/answer pairs.
- [ ] **P1** `Article` schema on blog posts with `author`, `datePublished`, `dateModified`.
- [ ] **P1** `Organization` schema with `logo`, `sameAs` (all social/directory profiles), `foundingDate`.
- [ ] **P2** `HowTo` schema on step-by-step process pages with `estimatedCost`.
- [ ] **P2** `VideoObject` on video pages with `thumbnailUrl`, `uploadDate`, `duration`.
- [ ] **P2** `SpeakableSpecification` on key pages for voice search eligibility.
- [ ] **P2** `Person` schema for founders/experts with `knowsAbout`, `hasCredential`.
- [ ] **P2** Validate ALL schema quarterly with [Rich Results Test](https://search.google.com/test/rich-results).

---

## PILLAR 7 — Images & Media

- [ ] **P1** Every meaningful image has descriptive `alt` text — includes context, not just object name.
- [ ] **P1** Modern formats: WebP primary, AVIF for high-value images — never unoptimized PNG/JPG.
- [ ] **P1** Responsive images: `srcset` + `sizes` attributes for all content images.
- [ ] **P1** Explicit `width`/`height` on all images (prevents CLS).
- [ ] **P1** Lazy load below-fold images; `priority`/`fetchpriority="high"` on above-fold hero.
- [ ] **P1** Images placed near related text — context helps Google understand relevance.
- [ ] **P1** Descriptive filenames (e.g. `trex-composite-deck-easton-pa.webp` not `IMG_4523.jpg`).
- [ ] **P2** Image sitemap for image-heavy sites.
- [ ] **P2** Real photos preferred over stock — especially for local businesses (team, projects, location).
- [ ] **P2** Video pages: dedicated page per video, `VideoObject` schema, title/description/captions.

---

## PILLAR 8 — Local SEO

*For service area businesses: GBP + website + citations must tell one consistent story. Google evaluates you as a unified entity.*

### 8.1 Google Business Profile (GBP)

- [ ] **P0** Business claimed and verified on Google.
- [ ] **P0** NAP (Name, Address, Phone) identical on GBP, website, and all citations.
- [ ] **P0** Primary category is specific: "Deck Builder" not "Contractor".
- [ ] **P1** Secondary categories cover all services (e.g. "Fence Contractor", "Patio Builder").
- [ ] **P1** Service areas listed clearly — all target cities/regions.
- [ ] **P1** Hours, website URL, and all attributes complete and accurate.
- [ ] **P1** Business description keyword-rich but natural — includes primary services + service area.
- [ ] **P1** Services/menu section fully populated with all offerings and descriptions.
- [ ] **P2** GBP posts published at least 2x/month (offers, updates, project showcases).
- [ ] **P2** Q&A section seeded with common questions and answers.

### 8.2 Reviews & Engagement

- [ ] **P0** Active review generation strategy — ask every customer.
- [ ] **P1** Respond to ALL reviews (positive and negative) within 48 hours — professional and helpful.
- [ ] **P1** Review velocity steady — not bursts followed by silence.
- [ ] **P1** Reviews mention specific services and locations naturally (signals relevance).
- [ ] **P2** Reviews on multiple platforms — Google, Yelp, BBB, Houzz, Angi — not just one.

### 8.3 GBP Behavioral Signals (New in 2026)

- [ ] **P1** High click-to-call and click-to-website rates from GBP listing.
- [ ] **P1** Direction requests and photo views trending up.
- [ ] **P1** Profile active in last 90 days — recent photos, posts, review responses.
- [ ] **P2** GBP photos updated monthly — real project photos, team, and completed work.

### 8.4 On-Site Local Signals

- [ ] **P1** `LocalBusiness` schema on location/contact pages — correct NAP, hours, `areaServed`, `geo`.
- [ ] **P1** Unique location page per target city — not template duplicates; localized content, projects, testimonials.
- [ ] **P1** Service + city combination pages (e.g. "Deck Building in Allentown, PA") with unique content.
- [ ] **P1** Embedded Google Map on contact and key location pages.
- [ ] **P1** NAP in footer on every page — matches GBP exactly.
- [ ] **P2** Local content: area-specific project galleries, neighborhood references, local landmarks.

### 8.5 Citations & Directories

- [ ] **P1** NAP consistent across all directory profiles (Yelp, BBB, Angi, Houzz, HomeAdvisor, etc.).
- [ ] **P1** Top 20 directories claimed and optimized — complete profiles with descriptions, photos, categories.
- [ ] **P2** Industry-specific directories (NADRA, Trex Pro directory, manufacturer listings).
- [ ] **P2** All claimed directory URLs added to `sameAs` in Organization schema.

---

## PILLAR 9 — Site Architecture & Internal Linking

- [ ] **P0** Key pages reachable within 3 clicks from homepage.
- [ ] **P1** Topic clusters: pillar page linked to/from all cluster pages (e.g. `/services/deck-building` <-> `/materials/trex`, `/materials/timbertech`).
- [ ] **P1** Zero orphan pages — every indexed page has 2+ internal links pointing to it.
- [ ] **P1** Hub pages (services, locations, blog index) link to all child pages.
- [ ] **P1** Breadcrumbs on every page with `BreadcrumbList` schema.
- [ ] **P1** Footer links to key sections: services, locations, about, contact, blog.
- [ ] **P1** Descriptive, keyword-rich anchor text — varied but relevant.
- [ ] **P2** HTML sitemap page for users (optional but helps crawlers on larger sites).
- [ ] **P2** Related content links at bottom of blog posts and service pages.
- [ ] **P2** Cross-link between service pages and relevant location pages.

---

## PILLAR 10 — Link Building & Off-Page Authority

*Quality over quantity. One editorial link from a relevant, authoritative site > 100 directory links.*

### 10.1 Link Quality Signals (2026)

- [ ] **P1** Links from sites with real organic traffic and engaged audiences.
- [ ] **P1** Topical relevance — links from sites in your industry or related niches.
- [ ] **P1** Diverse referring domains — breadth matters more than depth.
- [ ] **P1** Editorial, naturally earned links — not paid, exchanged, or from link farms.
- [ ] **P2** Links with descriptive anchor text (not exact-match spam).

### 10.2 Link Building Strategies That Work

- [ ] **P1** Manufacturer partner pages — get listed on Trex, TimberTech, Azek dealer/contractor pages.
- [ ] **P1** Local business associations and chamber of commerce memberships.
- [ ] **P1** Industry directories (NADRA, BBB, HomeAdvisor) — claimed with links back to site.
- [ ] **P1** Linkable assets — material comparison charts, cost calculators, design guides.
- [ ] **P2** Guest expert contributions — industry blogs, local publications, podcasts.
- [ ] **P2** Local press/media — project features, community involvement, charity work.
- [ ] **P2** Supplier/partner co-marketing — joint content, case studies.

### 10.3 What to Avoid

- [ ] **P0** No paid links passing PageRank (use `rel="sponsored"` if paid).
- [ ] **P0** No link schemes, PBNs, or reciprocal link exchanges.
- [ ] **P0** No exact-match anchor text spam.

---

## PILLAR 11 — Accessibility (WCAG 2.2)

*Accessibility overlaps heavily with SEO — headings, alt text, semantic HTML all serve both.*

### 11.1 Perceivable

- [ ] **P1** All meaningful images have descriptive `alt`; decorative images use `alt=""`.
- [ ] **P1** Color contrast >= 4.5:1 normal text, >= 3:1 large text (WCAG AA).
- [ ] **P2** Captions/transcripts for video and audio content.

### 11.2 Operable

- [ ] **P1** All functionality accessible via keyboard — visible focus indicators; no keyboard traps.
- [ ] **P1** Touch targets >= 44x44px on mobile.
- [ ] **P2** "Skip to main content" link.

### 11.3 Understandable & Robust

- [ ] **P1** `lang` attribute on `<html>` element.
- [ ] **P1** Form labels associated with inputs; error messages clear and announced.
- [ ] **P2** Valid HTML; ARIA used correctly where needed.
- [ ] **P2** Lighthouse Accessibility score >= 95.

---

## PILLAR 12 — UX & Conversion Signals

*Google tracks user behavior signals — pogo-sticking (returning to search after clicking) indicates poor result quality.*

- [ ] **P0** Mobile-friendly — readable font (>= 16px), no horizontal scroll, adequate tap targets.
- [ ] **P1** No intrusive interstitials — no full-page overlays blocking content on entry.
- [ ] **P1** Clear primary CTA on every landing page — contact, quote, call.
- [ ] **P1** Above-the-fold value — user sees what they need within first viewport.
- [ ] **P1** Page answers search intent immediately — no walls of text before the answer.
- [ ] **P1** Fast, functional forms — minimal fields, clear validation, instant feedback.
- [ ] **P2** Consistent navigation — clear hierarchy and labels across all pages.
- [ ] **P2** Phone number clickable (`tel:` link) on mobile.
- [ ] **P2** Multiple contact methods visible — phone, form, email.

---

## PILLAR 13 — Content Freshness & Publishing Cadence

*Freshness is now ~6% of Google's algorithm. Pages updated within 12 months gain avg. +4.6 positions.*

- [ ] **P1** Top 20 landing pages reviewed and updated at least annually.
- [ ] **P1** Blog publishing cadence: minimum 2-4 posts/month.
- [ ] **P1** "Last updated" dates visible on service and guide pages.
- [ ] **P1** Outdated statistics, prices, and claims refreshed with current data.
- [ ] **P1** Seasonal content published ahead of season (spring deck building content published in Feb-Mar).
- [ ] **P2** Content audit quarterly — consolidate thin pages, update or remove outdated posts.
- [ ] **P2** Evergreen pages refreshed with new examples, photos, and data annually.
- [ ] **P2** News/trends content for industry developments (new materials, code changes, design trends).

---

## PILLAR 14 — Security & Trust Infrastructure

- [ ] **P0** HTTPS everywhere — see Pillar 2.
- [ ] **P1** Security headers: HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy.
- [ ] **P1** Privacy policy — clear, accessible, linked from footer.
- [ ] **P1** Contact information — real address, phone, email accessible from every page.
- [ ] **P1** Terms of service page.
- [ ] **P2** No deceptive UX — no misleading buttons, fake urgency, or dark patterns.
- [ ] **P2** Cookie consent banner (if applicable) — doesn't block content or cause CLS.

---

## PILLAR 15 — AI Search Optimization (GEO)

*47% of AI Overview citations come from pages ranking below position #5. AI systems reward content quality and extractability over domain authority.*

### 15.1 Content Structure for AI Extraction

- [ ] **P1** Write for extraction — clear structure, tight answers, zero fluff.
- [ ] **P1** Optimal AI-extractable passages: 134-167 words answering a specific question directly.
- [ ] **P1** Semantic completeness — cover the full topic; content scoring 8.5/10+ on topic coverage is 4.2x more likely to be cited.
- [ ] **P1** Direct answers under clear headings — AI pulls heading + following paragraph.
- [ ] **P1** Include specific data: costs, timeframes, measurements, statistics with sources.
- [ ] **P2** FAQ sections with concise, factual answers (50-100 words each).

### 15.2 Schema for AI Visibility

- [ ] **P1** Comprehensive JSON-LD on every page — pages with schema are 3x more likely to earn AI citations.
- [ ] **P1** `FAQPage` schema matches visible FAQ content exactly.
- [ ] **P1** `HowTo` schema on process/guide pages with clear steps.
- [ ] **P1** `SpeakableSpecification` on key pages — marks content optimized for voice/AI extraction.
- [ ] **P2** `Article` schema with full author information and dates.

### 15.3 AI Bot Access

- [ ] **P1** `robots.txt` allows AI crawlers: GPTBot, ChatGPT-User, Google-Extended, ClaudeBot, PerplexityBot, CCBot.
- [ ] **P1** `llms.txt` file at site root — structured summary for AI models.
- [ ] **P2** Crawl delays set appropriately (not blocking, but rate-limiting).

### 15.4 Entity & Brand Signals

- [ ] **P1** Consistent entity information across website, GBP, directories, social profiles.
- [ ] **P1** `sameAs` in Organization schema lists all verified profiles.
- [ ] **P1** Brand mentions on authoritative third-party sites (even without links).
- [ ] **P2** Wikipedia/Wikidata presence if eligible.

### 15.5 Fact Verification

- [ ] **P1** Claims backed by verifiable sources — link to manufacturer specs, code requirements, industry data.
- [ ] **P1** Statistics include year and source citation.
- [ ] **P1** No unverifiable superlatives ("best in the world") — use specific, provable claims.
- [ ] **P2** Content updated with recent stats — AI systems favor recent, peer-verified data (89% higher selection probability).

---

## PILLAR 16 — Monitoring & Maintenance

### 16.1 Ongoing Monitoring

- [ ] **P0** Google Search Console verified — monitor Coverage, CWV, Manual Actions, Security Issues weekly.
- [ ] **P1** GA4 (or equivalent) with key events and conversions tracked — no data gaps.
- [ ] **P1** Bing Webmaster Tools verified and monitored.
- [ ] **P1** Rank tracking for top 20 target keywords — weekly check.
- [ ] **P2** Backlink monitoring — new links, lost links, toxic link alerts.

### 16.2 Audit Cadence

| Frequency | What to Check |
|-----------|--------------|
| **Weekly** | GSC for errors, manual actions, security issues; rank tracking |
| **Monthly** | Core Web Vitals, top 10 pages health, broken links, new content published |
| **Quarterly** | Full audit (this checklist), content freshness, keyword gaps, schema validation |
| **Annually** | Complete site overhaul — redesign considerations, content pruning, strategy refresh |

### 16.3 Regression Prevention

- [ ] **P1** After every deploy: check indexing, CWV, rendering of top 5 pages.
- [ ] **P1** Traffic drop > 10%: investigate within 48 hours — correlate with deploys, algorithm updates, or technical issues.
- [ ] **P2** Automated monitoring alerts for downtime, 5xx errors, and CWV regression.

*Sites without ongoing monitoring see ~12% average quarterly traffic decline when issues accumulate.*

---

## Quick Audit Table (One-Page Summary)

| # | Pillar | P0/P1 Quick Checks |
|---|--------|-------------------|
| 1 | **Eligibility** | `site:` returns key pages; no noindex/robots blocks; sitemap in GSC |
| 2 | **Technical** | HTTPS; canonical per page; 301 redirects; no broken links |
| 3 | **Core Web Vitals** | LCP <= 2.5s, INP <= 200ms, CLS < 0.1 (mobile); zero "Poor" in GSC |
| 4 | **On-Page** | Unique title + meta per page; one H1; original content; intent match |
| 5 | **E-E-A-T** | Author bios; real reviews; certifications visible; verifiable claims |
| 6 | **Appearance** | Valid schema (JSON-LD); favicon; site name; rich results eligible |
| 7 | **Images** | Alt text; WebP/AVIF; dimensions set; lazy load below fold |
| 8 | **Local SEO** | GBP claimed; NAP consistent; reviews active; location pages unique |
| 9 | **Architecture** | 3-click depth; zero orphans; breadcrumbs; topic clusters linked |
| 10 | **Links** | Quality editorial backlinks; manufacturer listings; no paid links |
| 11 | **Accessibility** | Alt text; contrast; keyboard nav; form labels; lang attribute |
| 12 | **UX** | Mobile-friendly; no interstitials; clear CTAs; fast forms |
| 13 | **Freshness** | Content updated annually; blog 2-4x/month; dates visible |
| 14 | **Security** | HTTPS; security headers; privacy policy; contact info |
| 15 | **AI/GEO** | AI bots allowed; llms.txt; extractable answers; schema for AI |
| 16 | **Monitoring** | GSC weekly; CWV monthly; full audit quarterly; rank tracking |

---

## What NOT to Focus On

| Myth | Reality |
|------|---------|
| Meta keywords tag | Google ignores it completely |
| Keyword stuffing | Against spam policies; will hurt rankings |
| Exact-match domain | Minimal effect; brand-first is better |
| TLD choice (.com vs .org) | Only matters for country targeting |
| Subdomains vs subdirectories | Either works; choose for operations |
| "Duplicate content penalty" | Not a manual penalty; canonicalize for efficiency |
| E-E-A-T as direct ranking factor | Quality signals matter; no single E-E-A-T score in algorithm |
| Magic word count | No minimum/maximum; satisfy intent fully |
| FID metric | Replaced by INP (March 2024); use INP only |
| PageRank obsession | Links matter but Google uses hundreds of signals |
| Domain age | Entity authority matters more than age in 2026 |
| Exact heading count/order | Semantic order helps; no magic formula |

---

## Sources & References

### Google Official
- [Google Search Essentials](https://developers.google.com/search/docs/essentials)
- [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Search Appearance](https://developers.google.com/search/docs/appearance)
- [Page Experience & Core Web Vitals](https://developers.google.com/search/docs/appearance/page-experience)
- [Creating Helpful Content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Spam Policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [Structured Data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Local Business Schema](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Google Search Documentation Updates](https://developers.google.com/search/updates)

### 2026 Research
- [Google Ranking Factors 2026 - Backlinko](https://backlinko.com/google-ranking-factors)
- [Google Algorithm Updates 2026 - ClickRank](https://www.clickrank.ai/google-algorithm-updates/)
- [Local SEO Ranking Factors 2026 - MapRanks](https://www.mapranks.com/2026/02/23/google-business-seo-in-2026-whats-actually-driving-rankings-now/)
- [Local SEO 2026 for Contractors - FitzDesignz](https://www.fitzdesignz.com/blog/local-seo-in-action-how-2026-ranking-factors-compare-to-what-we-see-on-the-ground)
- [AI Overviews Ranking Factors 2026 - Wellows](https://wellows.com/blog/google-ai-overviews-ranking-factors/)
- [AI Overviews Optimization - Analytics Insight](https://www.analyticsinsight.net/seo/how-to-rank-in-google-ai-overviews-in-2026-a-tactical-seo-framework)
- [E-E-A-T Signals 2026 - Revved Digital](https://revved.digital/eeat-ai-search-ranking-signals-2026/)
- [E-E-A-T Guide 2026 - BKND Development](https://www.bknddevelopment.com/seo-insights/eeat-seo-strategy-2026-content-quality-signals/)
- [Structured Data for GEO - Digidop](https://www.digidop.com/blog/structured-data-secret-weapon-seo)
- [Schema Markup 2026 - ALM Corp](https://almcorp.com/blog/schema-markup-detailed-guide-2026-serp-visibility/)
- [Link Building 2026 - Heroic Rankings](https://heroicrankings.com/seo/linkbuilding/link-building-statistics-2026/)
- [Google Feb 2026 Discover Update - Search Engine Land](https://searchengineland.com/google-february-2026-discover-core-update-is-now-complete-469450)
- [GBP Ranking Factors 2026 - LocalMighty](https://www.localmighty.com/blog/google-business-profile-ranking-factors/)

### Standards
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [Schema.org](https://schema.org/)

---

*Created: March 2026. Combines WEBSITE-CHECKPOINT-GUIDE-ULTIMATE.md + GOOGLE-SEO-CHECKPOINT-GUIDE.md + 2026 research. Review and update quarterly.*
