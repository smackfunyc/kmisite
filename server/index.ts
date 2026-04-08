import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import OpenAI from 'openai';

type NewsItem = {
    title: string;
    url: string;
    source: string;
    publishedAt: string;
    summary?: string;
    relevanceScore?: number;
};

type StoredNewsFeed = {
    lastUpdated: string;
    items: NewsItem[];
};

function isFeedStale(feed: StoredNewsFeed) {
    if (!feed.lastUpdated || feed.items.length === 0) return true;

    const lastUpdatedTime = new Date(feed.lastUpdated).getTime();
    if (Number.isNaN(lastUpdatedTime)) return true;

    return Date.now() - lastUpdatedTime >= FEED_REFRESH_INTERVAL_MS;
}

const app = express();
const DIST_DIR = path.join(process.cwd(), 'dist');
const INDEX_FILE = path.join(DIST_DIR, 'index.html');
const STATIC_FEED_FILES = [
    path.join(process.cwd(), 'public', 'tariff-refund-news.json'),
    path.join(DIST_DIR, 'tariff-refund-news.json')
];
const FEED_REFRESH_INTERVAL_MS = 4 * 60 * 60 * 1000;
const SUMMARY_INSTRUCTIONS =
    'You are a U.S. customs and trade law expert. Write a concise 2-3 sentence summary of the following news article for importers interested in tariff refunds, duty drawback, and IEEPA/Section 301 relief.';

function loadLocalEnvFile(filePath: string) {
    if (!existsSync(filePath)) return;

    const raw = readFileSync(filePath, 'utf8');

    for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const separatorIndex = trimmed.indexOf('=');
        if (separatorIndex === -1) continue;

        const key = trimmed.slice(0, separatorIndex).trim();
        const value = trimmed.slice(separatorIndex + 1).trim();

        if (!key || process.env[key] !== undefined) continue;

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

function buildSummaryPrompt(item: NewsItem) {
    return [
        SUMMARY_INSTRUCTIONS,
        `Title: ${item.title}`,
        item.summary ? `Description: ${item.summary}` : '',
        `Source: ${item.source}`,
        `Published: ${item.publishedAt}`,
    ].filter(Boolean).join('\n');
}

async function generateOpenAiSummary(item: NewsItem): Promise<string> {
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
    } catch (err) {
        console.error('OpenAI summary failed for:', item.title, err);
        throw err;
    }
}

async function generateAnthropicSummary(item: NewsItem): Promise<string> {
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

    const json = await response.json() as {
        content?: Array<{ type?: string; text?: string }>;
    };

    const text = json.content
        ?.filter((part) => part.type === 'text')
        .map((part) => part.text || '')
        .join('\n')
        .trim();

    return text || item.summary || '';
}

async function generateAiSummary(item: NewsItem): Promise<string> {
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
        if (!provider.enabled) continue;

        try {
            return await provider.run();
        } catch (error) {
            console.error(`${provider.name} summary provider failed for:`, item.title, error);
        }
    }

    return item.summary || '';
}

async function enrichWithAiSummaries(items: NewsItem[]): Promise<NewsItem[]> {
    const CONCURRENCY = 3;
    const results: NewsItem[] = [];

    for (let i = 0; i < items.length; i += CONCURRENCY) {
        const batch = items.slice(i, i + CONCURRENCY);
        const summaries = await Promise.all(
            batch.map((item) => generateAiSummary(item))
        );
        results.push(
            ...batch.map((item, idx) => ({ ...item, summary: summaries[idx] }))
        );
    }

    return results;
}

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(process.cwd(), 'data', 'tariff-refund-news.json');

const NEWS_QUERIES = [
    'IEEPA tariff refund 2026',
    'customs duty refund importers 2026',
    'CBP tariff refund drawback',
    'tariff duties refund customs',
    '"Court of International Trade" tariff',
    'section 301 duty refund',
    'tariff drawback importers',
];

function cleanText(value: string) {
    return value.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/\s+/g, ' ').trim();
}

function extractTag(xml: string, tag: string) {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
    return xml.match(regex)?.[1]?.trim() || '';
}

function extractAllItems(xml: string, itemTag = 'item') {
    const regex = new RegExp(`<${itemTag}[^>]*>([\\s\\S]*?)<\\/${itemTag}>`, 'gi');
    return Array.from(xml.matchAll(regex)).map((m) => m[1]);
}

function scoreItem(item: NewsItem) {
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
        if (haystack.includes(term)) score += 3;
    }

    for (const term of negativeTerms) {
        if (haystack.includes(term)) score -= 4;
    }

    if (item.source.toLowerCase().includes('cbp')) score += 4;
    if (item.source.toLowerCase().includes('reuters')) score += 2;

    const ageMs = Date.now() - new Date(item.publishedAt).getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);

    if (ageDays <= 1) score += 14;
    else if (ageDays <= 2) score += 11;
    else if (ageDays <= 3) score += 8;
    else if (ageDays <= 7) score += 4;
    else if (ageDays <= 14) score += 1;
    else score -= 4;

    return score;
}

function dedupeItems(items: NewsItem[]) {
    const seen = new Set<string>();
    const result: NewsItem[] = [];

    for (const item of items) {
        const key = item.url.trim().toLowerCase();
        const titleKey = item.title.trim().toLowerCase();

        if (seen.has(key) || seen.has(titleKey)) continue;

        seen.add(key);
        seen.add(titleKey);
        result.push(item);
    }

    return result;
}

async function fetchText(url: string) {
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

async function fetchGoogleNewsRss(): Promise<NewsItem[]> {
    const results: NewsItem[] = [];

    for (const query of NEWS_QUERIES) {
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
        const xml = await fetchText(url);
        const items = extractAllItems(xml, 'item');

        for (const raw of items) {
            const title = cleanText(extractTag(raw, 'title'));
            const link = cleanText(extractTag(raw, 'link'));
            const pubDate = cleanText(extractTag(raw, 'pubDate'));
            const source = cleanText(extractTag(raw, 'source')) || 'Google News';

            if (!title || !link) continue;

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

async function fetchCbpRss(): Promise<NewsItem[]> {
    const feedUrls = [
        'https://www.cbp.gov/newsroom/feeds/press-release.xml',
        'https://www.cbp.gov/trade/feeds/cargo-systems-messaging-service.xml'
    ];

    const all: NewsItem[] = [];

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
                const relevant =
                    haystack.includes('tariff') ||
                    haystack.includes('duty') ||
                    haystack.includes('refund') ||
                    haystack.includes('drawback') ||
                    haystack.includes('customs');

                if (!relevant || !title || !link) continue;

                all.push({
                    title,
                    url: link,
                    source: 'CBP',
                    publishedAt: pubDate || new Date().toISOString(),
                    summary: description
                });
            }
        } catch (error) {
            console.error('CBP feed failed', url, error);
        }
    }

    return all;
}

async function fetchNewsApi(): Promise<NewsItem[]> {
    const apiKey = process.env.NEWSAPI_KEY;
    if (!apiKey) return [];

    const q = encodeURIComponent(
        '("U.S. Customs" OR CBP OR customs) AND (tariff OR duty OR duties) AND (refund OR refunds OR drawback)'
    );

    const url = `https://newsapi.org/v2/everything?q=${q}&language=en&pageSize=20&sortBy=publishedAt&apiKey=${apiKey}`;

    try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) {
            throw new Error(`NewsAPI failed with ${res.status}`);
        }

        const json = await res.json() as {
            articles?: Array<{
                title?: string;
                url?: string;
                publishedAt?: string;
                description?: string;
                source?: { name?: string };
            }>;
        };

        return (json.articles || [])
            .filter((article) => article.title && article.url)
            .map((article) => ({
                title: article.title || '',
                url: article.url || '',
                source: article.source?.name || 'NewsAPI',
                publishedAt: article.publishedAt || new Date().toISOString(),
                summary: article.description || ''
            }));
    } catch (error) {
        console.error('NewsAPI fetch failed', error);
        return [];
    }
}

async function getStoredNewsFeed(): Promise<StoredNewsFeed> {
    try {
        const raw = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(raw) as StoredNewsFeed;
    } catch {
        return {
            lastUpdated: '',
            items: []
        };
    }
}

async function saveNewsFeed(feed: StoredNewsFeed) {
    const serialized = JSON.stringify(feed, null, 2);

    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, serialized, 'utf8');

    await Promise.all(
        STATIC_FEED_FILES.map(async (filePath) => {
            try {
                await fs.mkdir(path.dirname(filePath), { recursive: true });
                await fs.writeFile(filePath, serialized, 'utf8');
            } catch (error) {
                console.error('Failed to sync static news feed file', filePath, error);
            }
        })
    );
}

async function refreshTariffRefundNews(): Promise<StoredNewsFeed> {
    const [googleNewsItems, cbpItems, newsApiItems] = await Promise.allSettled([
        fetchGoogleNewsRss(),
        fetchCbpRss(),
        fetchNewsApi()
    ]);

    const combined = [
        ...(googleNewsItems.status === 'fulfilled' ? googleNewsItems.value : []),
        ...(cbpItems.status === 'fulfilled' ? cbpItems.value : []),
        ...(newsApiItems.status === 'fulfilled' ? newsApiItems.value : [])
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

    const feed: StoredNewsFeed = {
        lastUpdated: new Date().toISOString(),
        items: enriched
    };

    await saveNewsFeed(feed);
    return feed;
}

app.get('/api/tariff-refund-news', async (_req, res) => {
    try {
        const stored = await getStoredNewsFeed();

        if (!isFeedStale(stored)) {
            res.set('Cache-Control', 'no-store, max-age=0');
            res.json(stored);
            return;
        }

        try {
            const refreshed = await refreshTariffRefundNews();
            res.set('Cache-Control', 'no-store, max-age=0');
            res.json(refreshed);
        } catch (refreshError) {
            console.error(refreshError);

            if (stored.items.length > 0) {
                res.set('Cache-Control', 'no-store, max-age=0');
                res.json(stored);
                return;
            }

            throw refreshError;
        }
    } catch (error) {
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
        const authHeader = req.headers.authorization;

        if (!expected || (secret !== expected && authHeader !== `Bearer ${expected}`)) {
            res.status(401).json({ ok: false, error: 'Unauthorized' });
            return;
        }

        const feed = await refreshTariffRefundNews();
        res.set('Cache-Control', 'no-store, max-age=0');
        res.json({
            ok: true,
            refreshedAt: feed.lastUpdated,
            count: feed.items.length
        });
    } catch (error) {
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
