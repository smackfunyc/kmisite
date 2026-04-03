import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import OpenAI from 'openai';
const app = express();
const DIST_DIR = path.join(process.cwd(), 'dist');
const INDEX_FILE = path.join(DIST_DIR, 'index.html');
const SUMMARY_INSTRUCTIONS = 'You are a U.S. customs and trade law expert. Write a concise 2-3 sentence summary of the following news article for importers interested in tariff refunds, duty drawback, and IEEPA/Section 301 relief.';
function loadLocalEnvFile(filePath) {
    if (!existsSync(filePath))
        return;
    const raw = readFileSync(filePath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#'))
            continue;
        const separatorIndex = trimmed.indexOf('=');
        if (separatorIndex === -1)
            continue;
        const key = trimmed.slice(0, separatorIndex).trim();
        const value = trimmed.slice(separatorIndex + 1).trim();
        if (!key || process.env[key] !== undefined)
            continue;
        process.env[key] = value.replace(/^['"]|['"]$/g, '');
    }
}
loadLocalEnvFile(path.join(process.cwd(), '.env.local'));
loadLocalEnvFile(path.join(process.cwd(), '.env'));
const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '0.0.0.0';
const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;
function buildSummaryPrompt(item) {
    return [
        SUMMARY_INSTRUCTIONS,
        `Title: ${item.title}`,
        item.summary ? `Description: ${item.summary}` : '',
        `Source: ${item.source}`,
        `Published: ${item.publishedAt}`,
    ].filter(Boolean).join('\n');
}
async function generateOpenAiSummary(item) {
    if (!openai) {
        throw new Error('OPENAI_API_KEY is not configured');
    }
    try {
        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_SUMMARY_MODEL || 'gpt-4o-mini',
            messages: [{ role: 'user', content: buildSummaryPrompt(item) }],
            max_tokens: 120,
            temperature: 0.4,
        });
        return response.choices[0]?.message?.content?.trim() || item.summary || '';
    }
    catch (err) {
        console.error('OpenAI summary failed for:', item.title, err);
        throw err;
    }
}
async function generateAnthropicSummary(item) {
    if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY is not configured');
    }
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'anthropic-version': '2023-06-01',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
        },
        body: JSON.stringify({
            model: process.env.ANTHROPIC_SUMMARY_MODEL || 'claude-sonnet-4-20250514',
            max_tokens: 160,
            temperature: 0.4,
            messages: [
                {
                    role: 'user',
                    content: buildSummaryPrompt(item),
                },
            ],
        }),
    });
    if (!response.ok) {
        const details = await response.text();
        throw new Error(`Anthropic failed with ${response.status}: ${details}`);
    }
    const json = await response.json();
    const text = json.content
        ?.filter((part) => part.type === 'text')
        .map((part) => part.text || '')
        .join('\n')
        .trim();
    return text || item.summary || '';
}
async function generateAiSummary(item) {
    const providers = [
        {
            name: 'OpenAI',
            enabled: Boolean(process.env.OPENAI_API_KEY),
            run: () => generateOpenAiSummary(item),
        },
        {
            name: 'Anthropic',
            enabled: Boolean(process.env.ANTHROPIC_API_KEY),
            run: () => generateAnthropicSummary(item),
        },
    ];
    for (const provider of providers) {
        if (!provider.enabled)
            continue;
        try {
            return await provider.run();
        }
        catch (error) {
            console.error(`${provider.name} summary provider failed for:`, item.title, error);
        }
    }
    return item.summary || '';
}
async function enrichWithAiSummaries(items) {
    const CONCURRENCY = 3;
    const results = [];
    for (let i = 0; i < items.length; i += CONCURRENCY) {
        const batch = items.slice(i, i + CONCURRENCY);
        const summaries = await Promise.all(batch.map((item) => generateAiSummary(item)));
        results.push(...batch.map((item, idx) => ({ ...item, summary: summaries[idx] })));
    }
    return results;
}
app.use(cors());
app.use(express.json());
const DATA_FILE = path.join(process.cwd(), 'data', 'tariff-refund-news.json');
const NEWS_QUERIES = [
    '"U.S. Customs" tariff refunds',
    'CBP duty refunds',
    '"customs duty" drawback refunds',
    '"Court of International Trade" tariff refund',
    'tariff refund CBP duties'
];
function cleanText(value) {
    return value.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/\s+/g, ' ').trim();
}
function extractTag(xml, tag) {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
    return xml.match(regex)?.[1]?.trim() || '';
}
function extractAllItems(xml, itemTag = 'item') {
    const regex = new RegExp(`<${itemTag}[^>]*>([\\s\\S]*?)<\\/${itemTag}>`, 'gi');
    return Array.from(xml.matchAll(regex)).map((m) => m[1]);
}
function scoreItem(item) {
    const haystack = `${item.title} ${item.summary || ''} ${item.source}`.toLowerCase();
    let score = 0;
    const positiveTerms = [
        'refund',
        'refunds',
        'duty refund',
        'drawback',
        'reliquidation',
        'protest',
        'cbp',
        'customs',
        'tariff',
        'duties',
        'court of international trade',
        'ieepa',
        'section 301'
    ];
    const negativeTerms = [
        'stocks',
        'crypto',
        'fashion',
        'celebrity',
        'sports',
        'real estate'
    ];
    for (const term of positiveTerms) {
        if (haystack.includes(term))
            score += 3;
    }
    for (const term of negativeTerms) {
        if (haystack.includes(term))
            score -= 4;
    }
    if (item.source.toLowerCase().includes('cbp'))
        score += 4;
    if (item.source.toLowerCase().includes('reuters'))
        score += 2;
    const ageMs = Date.now() - new Date(item.publishedAt).getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    if (ageDays <= 7)
        score += 3;
    else if (ageDays <= 30)
        score += 1;
    return score;
}
function dedupeItems(items) {
    const seen = new Set();
    const result = [];
    for (const item of items) {
        const key = item.url.trim().toLowerCase();
        const titleKey = item.title.trim().toLowerCase();
        if (seen.has(key) || seen.has(titleKey))
            continue;
        seen.add(key);
        seen.add(titleKey);
        result.push(item);
    }
    return result;
}
async function fetchText(url) {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 tariff-refund-news-bot',
            Accept: 'application/rss+xml, application/xml, text/xml, application/json, text/html'
        }
    });
    if (!res.ok) {
        throw new Error(`Failed request ${res.status} for ${url}`);
    }
    return res.text();
}
async function fetchGoogleNewsRss() {
    const results = [];
    for (const query of NEWS_QUERIES) {
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
        const xml = await fetchText(url);
        const items = extractAllItems(xml, 'item');
        for (const raw of items) {
            const title = cleanText(extractTag(raw, 'title'));
            const link = cleanText(extractTag(raw, 'link'));
            const pubDate = cleanText(extractTag(raw, 'pubDate'));
            const source = cleanText(extractTag(raw, 'source')) || 'Google News';
            if (!title || !link)
                continue;
            results.push({
                title,
                url: link,
                source,
                publishedAt: pubDate || new Date().toISOString()
            });
        }
    }
    return results;
}
async function fetchCbpRss() {
    const feedUrls = [
        'https://www.cbp.gov/newsroom/feeds/press-release.xml',
        'https://www.cbp.gov/trade/feeds/cargo-systems-messaging-service.xml'
    ];
    const all = [];
    for (const url of feedUrls) {
        try {
            const xml = await fetchText(url);
            const items = extractAllItems(xml, 'item');
            for (const raw of items) {
                const title = cleanText(extractTag(raw, 'title'));
                const link = cleanText(extractTag(raw, 'link'));
                const description = cleanText(extractTag(raw, 'description'));
                const pubDate = cleanText(extractTag(raw, 'pubDate'));
                const haystack = `${title} ${description}`.toLowerCase();
                const relevant = haystack.includes('tariff') ||
                    haystack.includes('duty') ||
                    haystack.includes('refund') ||
                    haystack.includes('drawback') ||
                    haystack.includes('customs');
                if (!relevant || !title || !link)
                    continue;
                all.push({
                    title,
                    url: link,
                    source: 'CBP',
                    publishedAt: pubDate || new Date().toISOString(),
                    summary: description
                });
            }
        }
        catch (error) {
            console.error('CBP feed failed', url, error);
        }
    }
    return all;
}
async function getStoredNewsFeed() {
    try {
        const raw = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(raw);
    }
    catch {
        return {
            lastUpdated: '',
            items: []
        };
    }
}
async function saveNewsFeed(feed) {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(feed, null, 2), 'utf8');
}
async function refreshTariffRefundNews() {
    const [googleNewsItems, cbpItems] = await Promise.allSettled([
        fetchGoogleNewsRss(),
        fetchCbpRss()
    ]);
    const combined = [
        ...(googleNewsItems.status === 'fulfilled' ? googleNewsItems.value : []),
        ...(cbpItems.status === 'fulfilled' ? cbpItems.value : [])
    ];
    const ranked = dedupeItems(combined)
        .map((item) => ({
        ...item,
        relevanceScore: scoreItem(item)
    }))
        .filter((item) => (item.relevanceScore || 0) > 0)
        .sort((a, b) => {
        if ((b.relevanceScore || 0) !== (a.relevanceScore || 0)) {
            return (b.relevanceScore || 0) - (a.relevanceScore || 0);
        }
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    })
        .slice(0, 6);
    console.log(`Enriching ${ranked.length} articles with AI summaries...`);
    const enriched = await enrichWithAiSummaries(ranked);
    const feed = {
        lastUpdated: new Date().toISOString(),
        items: enriched
    };
    await saveNewsFeed(feed);
    return feed;
}
app.get('/api/tariff-refund-news', async (_req, res) => {
    try {
        const stored = await getStoredNewsFeed();
        if (stored.items.length > 0) {
            res.json(stored);
            return;
        }
        const refreshed = await refreshTariffRefundNews();
        res.json(refreshed);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to load tariff refund news' });
    }
});
app.get('/api/health', (_req, res) => {
    res.json({
        ok: true,
        environment: process.env.NODE_ENV || 'development',
        hasOpenAi: Boolean(process.env.OPENAI_API_KEY),
        hasAnthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    });
});
app.get('/api/cron/tariff-refund-news', async (req, res) => {
    try {
        const secret = req.query.secret;
        const expected = process.env.CRON_SECRET;
        if (!expected || secret !== expected) {
            res.status(401).json({ ok: false, error: 'Unauthorized' });
            return;
        }
        const feed = await refreshTariffRefundNews();
        res.json({
            ok: true,
            refreshedAt: feed.lastUpdated,
            count: feed.items.length
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, error: 'Refresh failed' });
    }
});
if (existsSync(DIST_DIR)) {
    app.use(express.static(DIST_DIR));
    app.get(/^(?!\/api).*/, async (_req, res) => {
        res.sendFile(INDEX_FILE);
    });
}
app.listen(PORT, HOST, () => {
    console.log(`API server running on http://${HOST}:${PORT}`);
});
