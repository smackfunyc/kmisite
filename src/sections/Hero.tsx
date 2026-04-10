import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type NewsItem = {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary?: string;
};

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [latestArticle, setLatestArticle] = useState<NewsItem | null>(null);

  useEffect(() => {
    fetch('/api/tariff-refund-news', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        const first = data?.items?.[0];
        if (first) setLatestArticle(first);
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance animations
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

      tl.fromTo(
        bgRef.current,
        { scale: 1.2 },
        { scale: 1, duration: 1.5 }
      )
        .fromTo(
          headlineRef.current,
          { y: 100, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          0.2
        )
        .fromTo(
          subheadRef.current,
          { x: -50, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.8 },
          0.4
        )
        .fromTo(
          ctaRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          0.6
        )
        .fromTo(
          cardRef.current,
          { rotateX: 90, opacity: 0 },
          { rotateX: 0, opacity: 1, duration: 1, ease: 'back.out(1.7)' },
          0.6
        );

      // Parallax scroll effect
      gsap.to(bgRef.current, {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      // Content blur on scroll
      gsap.to(contentRef.current, {
        filter: 'blur(10px)',
        opacity: 0.5,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: '50% top',
          scrub: true,
        },
      });

      // Floating card animation
      gsap.to(cardRef.current, {
        y: -10,
        duration: 2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Mouse move parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!bgRef.current) return;
      const { clientX, clientY } = e;
      const xPercent = (clientX / window.innerWidth - 0.5) * 2;
      const yPercent = (clientY / window.innerHeight - 0.5) * 2;

      gsap.to(bgRef.current, {
        rotateY: xPercent * 2,
        rotateX: -yPercent * 2,
        duration: 0.5,
        ease: 'power2.out',
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative w-full h-screen overflow-hidden"
      style={{ perspective: '1000px' }}
    >
      {/* Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-full parallax-container"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <img
          src={`${import.meta.env.BASE_URL}hero-bg.jpg`}
          alt="Container ship"
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F1A2E]/90 via-[#0F1A2E]/60 to-transparent" />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 h-full flex items-center"
      >
        <div className="container-custom w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text Content */}
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-[2px] bg-[#E8B951]" />
                <span className="text-[#E8B951] font-display text-[17px] tracking-widest uppercase">
                  March 2026, Supreme Court Rules in Favor of Duty Refunds
                </span>
              </div>

              <h1
                ref={headlineRef}
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
              >
                IEEPA
                <br />
                <span className="text-[#E8B951]">DUTY</span>
                <br />
                REFUNDS
              </h1>

              <p
                ref={subheadRef}
                className="text-lg text-white/80 mb-8 leading-relaxed"
              >
                The Supreme Court ruled that IEEPA collected these funds unlawfully.
                <br /><br />
                Phase 2 is the designated path for "Finally Liquidated" entries,
                those that are more than 180 days past their liquidation date and were originally excluded from the April 20 launch.
              </p>

              {/* GEO: Answer-first executive summary — AI scrapes this as the eligibility snippet */}
              <div ref={ctaRef}>
                <div className="border-l-4 border-[#E8B951] bg-white/10 backdrop-blur-sm px-5 py-4 rounded-r-lg max-w-xl">
                  <p className="text-[#E8B951] text-xs font-bold uppercase tracking-widest mb-2">
                    Eligibility Summary
                  </p>
                  <p className="text-white/90 text-sm leading-relaxed">
                    Importers of record who paid IEEPA duties are currently eligible for
                    automatic refunds under the CIT's March 2026 order. Applies to unliquidated
                    entries and entries liquidated within 180 days (Phase 1). Phase 2 covers
                    finally liquidated entries excluded from the April 20, 2026 CAPE portal
                    launch. Interest accrues at the IRS corporate overpayment rate (currently 6%).
                  </p>
                  <a
                    href="https://www.cbp.gov"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-[#E8B951] text-xs font-semibold uppercase tracking-widest hover:underline"
                  >
                    Official CBP Source →
                  </a>
                </div>
              </div>
            </div>

            {/* Right - Feature Card */}
            <div className="hidden lg:block">
              <div
                ref={cardRef}
                className="glass rounded-lg overflow-hidden max-w-md ml-auto"
                style={{ transformStyle: 'preserve-3d' }}
              >

                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-white/60 text-lg">
                      {latestArticle
                        ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(new Date(latestArticle.publishedAt))
                        : 'Latest Update'}
                    </span>
                  </div>
                  <h2 className="text-white text-xl font-display font-bold mb-2">
                    {latestArticle ? latestArticle.title : 'Loading latest news…'}
                  </h2>
                  {latestArticle ? (
                    <p className="text-white/70 text-lg">
                      {latestArticle.summary || 'Click below to read the full article on the latest tariff refund developments.'}
                    </p>
                  ) : null}
                  {latestArticle ? (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <a
                        href={latestArticle.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#E8B951] text-[15px] font-semibold uppercase tracking-widest hover:underline"
                      >
                        {latestArticle.source} →
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F5F7FA] to-transparent z-20" />
    </section>
  );
}
