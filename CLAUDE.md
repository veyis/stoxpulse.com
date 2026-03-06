# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (uses Turbopack)
pnpm build        # Production build
pnpm lint         # ESLint
```

## Tech Stack

- **Next.js 16** (App Router, React 19, React Compiler via babel-plugin-react-compiler)
- **Tailwind CSS v4** (PostCSS plugin, NOT tailwind.config — styles defined in `app/globals.css` via `@theme`)
- **shadcn/ui** (new-york style, RSC-enabled, installed via `pnpm dlx shadcn@latest add <component>`)
- **pnpm** as package manager
- **TypeScript** with strict mode

## Architecture

**Two-section app:** Landing site (marketing) + Dashboard (app).

- `app/page.tsx` — Landing page, assembles components from `components/landing/`
- `app/(app)/` — Route group for the authenticated app shell (sidebar layout via `SidebarProvider`)
- `app/(app)/dashboard/` — Main dashboard with watchlist grid, earnings feed, news feed, alerts
- `app/api/waitlist/` — Simple file-based waitlist API (stores to `data/waitlist.json`)
- `app/privacy/`, `app/terms/` — Legal pages

**Component organization:**
- `components/ui/` — shadcn/ui primitives (don't edit manually, re-add via shadcn CLI)
- `components/landing/` — Marketing page sections (hero, features, pricing, etc.)
- `components/dashboard/` — Dashboard-specific components (sidebar, feeds, watchlist)
- `components/navbar.tsx` — Shared top navigation

**Design system** (`app/globals.css`):
- Dark-first theme (`<html className="dark">`)
- Brand color: green (`oklch(72% 0.19 155)`)
- Semantic finance colors: `positive` (green), `negative` (red), `warning`, `info`
- Surface elevation layers: `surface-0` through `surface-3`
- Two font families: Inter (body via `--font-sans`) and Space Grotesk (headings via `--font-display`)

**Path aliases:** `@/*` maps to project root.

## Product Context

StoxPulse is an AI-powered stock intelligence platform. It reads earnings calls, SEC filings, and financial news for a user's watchlist. Target user: self-directed retail investors. Full product plan is in `docs/04-stoxpulse-product-plan.md`.
