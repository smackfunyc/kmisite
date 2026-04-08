import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Clock3, RefreshCw } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

type NewsItem = {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary?: string;
};

type NewsFeed = {
  lastUpdated: string;
  items: NewsItem[];
};

const STATIC_NEWS_URL = `${import.meta.env.BASE_URL}tariff-refund-news.json`;
const CLIENT_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

async function fetchNewsFeed(url: string) {
  const response = await fetch(url, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return (await response.json()) as NewsFeed;
}

function formatTimestamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date);
}

export default function News() {
  const sectionRef = useRef<HTMLElement>(null);
  const refreshFeedRef = useRef<(() => Promise<void>) | null>(null);
  const [feed, setFeed] = useState<NewsFeed>({ lastUpdated: '', items: [] });
  const [displayUpdatedAt, setDisplayUpdatedAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.news-reveal',
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      try {
        setLoading(true);
        setError('');

        let json: NewsFeed | null = null;

        try {
          json = await fetchNewsFeed('/api/tariff-refund-news');
        } catch {
          json = await fetchNewsFeed(STATIC_NEWS_URL);
        }

        if (!cancelled) {
          setFeed({
            lastUpdated: json?.lastUpdated || '',
            items: Array.isArray(json?.items) ? json.items : [],
          });
          setDisplayUpdatedAt(json?.lastUpdated || new Date().toISOString());
        }
      } catch (err) {
        if (!cancelled) {
          setError('Unable to load the latest refund news right now.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    refreshFeedRef.current = loadNews;

    void loadNews();

    const intervalId = window.setInterval(() => {
      void loadNews();
    }, CLIENT_REFRESH_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void loadNews();
      }
    };

    window.addEventListener('focus', loadNews);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', loadNews);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const updatedLabel = useMemo(() => {
    if (!displayUpdatedAt) return '';
    return formatTimestamp(displayUpdatedAt);
  }, [displayUpdatedAt]);

  return (
    <section
      ref={sectionRef}
      className="section-padding relative overflow-hidden bg-[#F7F3EA]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,185,81,0.16),transparent_32%),linear-gradient(180deg,rgba(15,26,46,0.02),transparent)]" />

      <div className="container-custom relative">
        <div className="news-reveal mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-[2px] w-10 bg-[#E8B951]" />
              <span className="font-display text-[17px] uppercase tracking-[0.25em] text-[#6F7B8A]">
                Latest Refund News
              </span>
            </div>

            <h2 className="text-4xl font-bold text-[#0F1A2E] lg:text-5xl">
              Live updates on <span className="text-[#E8B951]">tariff refund developments</span>
            </h2>

            <p className="mt-4 max-w-2xl text-[19px] leading-7 text-[#425466]">
              Fresh coverage from CBP, trade publications, and legal sources so importers can track
              refund opportunities without hunting across multiple feeds.
            </p>
          </div>

          <div className="rounded-2xl border border-[#0F1A2E]/10 bg-white/80 px-5 py-4 shadow-[0_18px_60px_rgba(15,26,46,0.08)] backdrop-blur">
            <div className="flex items-center gap-3 text-[17px] text-[#425466]">
              <button
                type="button"
                onClick={() => {
                  if (!loading) {
                    void refreshFeedRef.current?.();
                  }
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#E8B951]/10 disabled:cursor-not-allowed"
                aria-label="Refresh news feed"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 text-[#E8B951] ${loading ? 'animate-spin' : ''}`} />
              </button>
              <span>{loading ? 'Refreshing feed...' : updatedLabel ? `Last updated ${updatedLabel}` : 'Feed ready'}</span>
            </div>
          </div>
        </div>

        {error ? (
          <div className="news-reveal rounded-3xl border border-red-200 bg-white px-6 py-5 text-[#8A3B2F] shadow-sm">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {loading && feed.items.length === 0
            ? Array.from({ length: 3 }).map((_, index) => (
              <article
                key={index}
                className="news-reveal min-h-[260px] rounded-[28px] border border-[#0F1A2E]/8 bg-white/80 p-7 shadow-[0_18px_60px_rgba(15,26,46,0.06)]"
              >
                <div className="mb-5 h-4 w-24 rounded-full bg-[#E8B951]/20" />
                <div className="space-y-3">
                  <div className="h-4 rounded-full bg-[#0F1A2E]/8" />
                  <div className="h-4 rounded-full bg-[#0F1A2E]/8" />
                  <div className="h-4 w-3/4 rounded-full bg-[#0F1A2E]/8" />
                </div>
                <div className="mt-8 space-y-3">
                  <div className="h-3 rounded-full bg-[#0F1A2E]/6" />
                  <div className="h-3 rounded-full bg-[#0F1A2E]/6" />
                  <div className="h-3 w-4/5 rounded-full bg-[#0F1A2E]/6" />
                </div>
              </article>
            ))
            : feed.items.map((item) => (
              <article
                key={`${item.url}-${item.publishedAt}`}
                className="news-reveal group flex h-full flex-col rounded-[28px] border border-[#0F1A2E]/8 bg-white p-7 shadow-[0_18px_60px_rgba(15,26,46,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#E8B951]/40 hover:shadow-[0_24px_70px_rgba(15,26,46,0.1)]"
              >
                <div className="mb-5 flex items-center justify-between gap-4">
                  <span className="rounded-full bg-[#E8B951]/14 px-3 py-1 text-[15px] font-semibold uppercase tracking-[0.18em] text-[#8B6A18]">
                    {item.source}
                  </span>
                  <span className="flex items-center gap-2 text-[17px] text-[#6F7B8A]">
                    <Clock3 className="h-4 w-4" />
                    {formatTimestamp(item.publishedAt)}
                  </span>
                </div>

                <h3 className="text-2xl font-semibold leading-tight text-[#0F1A2E]">
                  {item.title}
                </h3>

                <p className="mt-4 flex-1 text-[15px] leading-7 text-[#425466]">
                  {item.summary || 'Open the article for the full update and source details.'}
                </p>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-[17px] font-semibold uppercase tracking-[0.18em] text-[#0F1A2E] transition-colors hover:text-[#B98512]"
                >
                  Read article
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </a>
              </article>
            ))}
        </div>

        {!loading && !error && feed.items.length === 0 ? (
          <div className="news-reveal mt-8 rounded-3xl border border-[#0F1A2E]/10 bg-white px-6 py-5 text-[#425466]">
            No tariff refund articles were available yet. The feed endpoint is live, so new items will
            appear here as soon as the server refreshes them.
          </div>
        ) : null}
      </div>
    </section>
  );
}
