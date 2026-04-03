# IEEPA Duty Refunds

Vite front end plus an Express server that powers the tariff refund news feed and AI-generated article summaries.

## Local development

1. Copy `.env.example` to `.env.local`.
2. Fill in at least one AI provider key:
   `OPENAI_API_KEY` for the primary provider
   `ANTHROPIC_API_KEY` for the Claude backup
3. Start the app:

```bash
npm install
npm run dev
```

## Production build

```bash
npm install
npm run build
npm start
```

This builds:

- `dist/` for the Vite front end
- `server-dist/` for the compiled Express server

The Express server serves the built front end and all `/api/*` routes from one process.

## Recommended production setup

Use Hostinger Node hosting for production if you want the News section to refresh automatically and persist the cached feed between requests.

Why Hostinger is the better primary home for this repo:

- this app stores the refreshed news feed on disk
- the Express server already serves both the built frontend and the `/api/*` routes
- Hostinger Node hosting keeps the app and cached data together behind your custom domain

Vercel is still useful for previews or frontend-only deployments, but it is not the best default for this repo's disk-backed news cache unless you later move the feed storage to a durable external service.

## Hostinger deployment

Deploy this project as a Node.js web app on Hostinger Business or Cloud hosting.

Recommended settings:

- Node version: `22` or `24`
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Application root: the repository root

Set these environment variables in Hostinger hPanel instead of uploading secret files:

- `OPENAI_API_KEY`
- `OPENAI_SUMMARY_MODEL`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_SUMMARY_MODEL`
- `CRON_SECRET`
- `NEWSAPI_KEY`
- `PORT`

Useful routes after deploy:

- `/api/health` returns a quick deployment check
- `/api/tariff-refund-news` returns the current news feed
- `/api/cron/tariff-refund-news?secret=YOUR_SECRET` refreshes the feed

### Hostinger domain walkthrough

1. Create a new Node.js app in Hostinger hPanel.
2. Connect your domain or subdomain to that Node app.
3. Upload the repo or connect it through Git.
4. Set the build command to `npm install && npm run build`.
5. Set the start command to `npm start`.
6. Add the environment variables from `.env.example` using real secret values.
7. Deploy the app.
8. Open `https://your-domain.com/api/health` and confirm you get a JSON response with `"ok": true`.
9. Open `https://your-domain.com/` and confirm the site loads.

### Auto-refresh the news every 4 hours

Set a cron job in Hostinger to call this URL every 4 hours:

`https://your-domain.com/api/cron/tariff-refund-news?secret=YOUR_CRON_SECRET`

Cron schedule:

`0 */4 * * *`

That runs at:

- `00:00`
- `04:00`
- `08:00`
- `12:00`
- `16:00`
- `20:00`

If Hostinger asks for a command instead of a URL, use a `curl` command that hits the same endpoint.

Example:

```bash
curl "https://your-domain.com/api/cron/tariff-refund-news?secret=YOUR_CRON_SECRET"
```

### Static fallback

If you temporarily upload only `dist/` to `public_html`, the site will still render and the News section will fall back to `tariff-refund-news.json`, but that mode does not self-update unless an external cron process rewrites that JSON file.

## Vercel note

Vercel is fine for previews and quick frontend deploys, but this repo's current news-cache approach writes data to local disk. That makes Hostinger Node hosting the safer production choice for now.

## API key safety

- Do not commit `.env.local` to Git.
- Store production secrets only in Hostinger environment variables.
- Keep separate keys for local development and production.
- Rotate any key that has ever been pasted into chat, screenshots, or a shared file.

## AI fallback behavior

The server tries providers in this order when summarizing articles:

1. OpenAI
2. Anthropic Claude

If OpenAI is unavailable, rate-limited, or misconfigured, the server falls back to Claude automatically.
