# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Vite frontend + Express server concurrently
npm run build        # Build client → dist/ and server → server-dist/
npm start            # Run production server (after build)
npm run build:client # Build frontend only
npm run build:server # Build server only
```

No test or lint commands are configured in package.json.

## Architecture

React 19 + Vite SPA served by an Express backend on port 8787.

**Stack:** React, TypeScript, TailwindCSS, Radix UI, GSAP animations, Express 5

**Frontend** (`src/`) is a single-page marketing site for IEEPA Duty Refunds with sections: Hero, News, Quote, About, Services, Testimonials, Clients, Footer. Entry: `src/main.tsx` → `src/App.tsx`.

**Backend** (`server/index.ts`) is an Express server that:
- Serves the built `dist/` frontend
- Provides `/api/tariff-refund-news` (cached news feed, auto-refreshes if >4 hours stale)
- Provides `/api/cron/tariff-refund-news?secret=CRON_SECRET` for manual/scheduled refresh
- Provides `/api/health` for deployment health checks

**News Feed Pipeline:**
1. Fetches from Google News RSS, CBP RSS feeds, and NewsAPI
2. Scores articles by relevance (tariff/refund keywords), deduplicates, selects top 6
3. Generates AI summaries via OpenAI (`gpt-4o-mini`) with Anthropic Claude fallback
4. Persists to `data/tariff-refund-news.json` (source of truth) and syncs copies to `public/` and `dist/`

**Data file:** `data/tariff-refund-news.json` — shape: `{ lastUpdated: string, items: NewsItem[] }`

**Dev proxy:** Vite proxies `/api/*` to `http://localhost:8787` during development (see `vite.config.ts`).

## Environment Variables

Copy `.env.example` to `.env.local`. Required keys:
- `OPENAI_API_KEY` / `OPENAI_SUMMARY_MODEL` (default: `gpt-4o-mini`)
- `ANTHROPIC_API_KEY` / `ANTHROPIC_SUMMARY_MODEL`
- `CRON_SECRET` — protects the cron refresh endpoint
- `NEWSAPI_KEY` — for NewsAPI source
- `PORT` — defaults to `8787`

## Deployment

Deploy to **Hostinger Node hosting** (not Vercel/serverless) because the app writes news feed data to disk. The server handles both frontend serving and API from one process. Cron job: `0 */4 * * *` calling `/api/cron/tariff-refund-news?secret=CRON_SECRET`.

## TypeScript Config

Two separate TypeScript configs:
- `tsconfig.app.json` — client (ESNext modules, React JSX)
- `tsconfig.server.json` — server (NodeNext modules, outputs to `server-dist/`)

Path alias `@/*` maps to `./src/*`.
