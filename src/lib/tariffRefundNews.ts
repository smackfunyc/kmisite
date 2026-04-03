import fs from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';

export type NewsItem = {
    title: string;
    url: string;
    source: string;
    publishedAt: string;
    summary?: string;
    relevanceScore?: number;
};

export type StoredNewsFeed = {
    lastUpdated: string;
    items: NewsItem[];
};

const DATA_FILE = path.join(process.cwd(), 'data', 'tariff-refund-news.json');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const NEWS_QUERIES = [
    '"U.S. Customs" tariff refunds',
    'CBP duty refunds',
    '"customs duty" drawback refunds',
    '"Court of International Trade" tariff refund',
    'tariff refund CBP duties',
];

async function generateAiSummary(item: NewsItem): Promise<string> {
    if (!process.env.OPENAI_API_KEY) return item.summary || '';

    try {
        const prompt = [
            `You are a U.S. customs and trade law expert. Write a concise 2-3 sentence summary of the following news article for importers interested in tariff refunds, duty drawback, and IEEPA/Section 301 relief.`,
            `Title: ${item.title}`,
            item.summary ? `Description: ${item.summary}` : '',
            `Source: ${item.source}`,
            `Published: ${item.publishedAt}`,
        ].filter(Boolean).join('\n');

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 120,
            temperature: 0.4,
        });

        return response.choices[0]?.message?.content?.trim() || item.summary || '';
    } catch (err) {
        console.error('OpenAI summary failed for:', item.title, err);
        return item.summary || '';
    }
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

function cleanText(value: string) {
    return value.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/\s+/g, ' ').trim();
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
        'section 301',
    ];

    const negativeTerms = [
        'stocks',
        'crypto',
        'fashion',
        'celebrity',
        'sports',
        'real estate',
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

    if (ageDays <= 7) score += 3;
    else if (ageDays <= 30) score += 1;

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
            Accept: 'application/rss+xml, application/xml, text/xml, application/json, text/html',
        },
        cache: 'no-store',
    });

    if (!res.ok) {
        throw new Error(`Failed request ${res.status} for ${url}`);
    }

    return res.text();
}

function extractTag(xml: string, tag: string) {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
    return xml.match(regex)?.[1]?.trim() || '';
}

function extractAllItems(xml: string, itemTag = 'item') {
    const regex = new RegExp(`<${itemTag}[^>]*>([\\s\\S]*?)<\\/${itemTag}>`, 'gi');
    return Array.from(xml.matchAll(regex)).map((m) => m[1]);
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
                publishedAt: pubDate || new Date().toISOString(),
            });
        }
    }

    return results;
}

async function fetchCbpRss(): Promise<NewsItem[]> {
    const feedUrls = [
        'https://www.cbp.gov/newsroom/feeds/press-release.xml',
        'https://www.cbp.gov/trade/feeds/cargo-systems-messaging-service.xml',
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
                    summary: description,
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

        const json = await res.json();

        return (json.articles || []).map((article: any) => ({
            title: article.title,
            url: article.url,
            source: article.source?.name || 'NewsAPI',
            publishedAt: article.publishedAt || new Date().toISOString(),
            summary: article.description || '',
        }));
    } catch (error) {
        console.error('NewsAPI fetch failed', error);
        return [];
    }
}

export async function getStoredNewsFeed(): Promise<StoredNewsFeed> {
    try {
        const raw = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(raw) as StoredNewsFeed;
    } catch {
        return {
            lastUpdated: '',
            items: [],
        };
    }
}

export async function saveNewsFeed(feed: StoredNewsFeed) {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(feed, null, 2), 'utf8');
}

export async function refreshTariffRefundNews(): Promise<StoredNewsFeed> {
    const [googleNewsItems, cbpItems, newsApiItems] = await Promise.allSettled([
        fetchGoogleNewsRss(),
        fetchCbpRss(),
        fetchNewsApi(),
    ]);

    const combined = [
        ...(googleNewsItems.status === 'fulfilled' ? googleNewsItems.value : []),
        ...(cbpItems.status === 'fulfilled' ? cbpItems.value : []),
        ...(newsApiItems.status === 'fulfilled' ? newsApiItems.value : []),
    ];

    const deduped = dedupeItems(combined)
        .map((item) => ({
            ...item,
            relevanceScore: scoreItem(item),
        }))
        .filter((item) => (item.relevanceScore || 0) > 0)
        .sort((a, b) => {
            if ((b.relevanceScore || 0) !== (a.relevanceScore || 0)) {
                return (b.relevanceScore || 0) - (a.relevanceScore || 0);
            }

            return (
                new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
            );
        })
        .slice(0, 6);

    console.log(`Enriching ${deduped.length} articles with AI summaries...`);
    const enriched = await enrichWithAiSummaries(deduped);

    const feed: StoredNewsFeed = {
        lastUpdated: new Date().toISOString(),
        items: enriched,
    };

    await saveNewsFeed(feed);
    return feed;
}