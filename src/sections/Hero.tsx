import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Play } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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

                Billions of dollars are currently held by U.S. Customs and Border Protection (CBP).
                <br /><br />
                Interest: Under recent Court of International Trade (CIT) orders, successful refund claims are entitled to the return of the principal duty plus interest.
              </p>

              <div ref={ctaRef} className="flex flex-wrap gap-4">
                <button className="btn-primary flex items-center gap-2 group">
                  See if you Qualify for a Refund
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button className="flex items-center gap-3 text-white hover:text-[#E8B951] transition-colors">
                  <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center hover:border-[#E8B951] transition-colors">
                    <Play className="w-4 h-4 ml-1" />
                  </div>
                  <span className="font-display text-[17px] tracking-wider uppercase">
                    Watch Video
                  </span>
                </button>
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
                      Updates
                    </span>
                  </div>
                  <h2 className="text-white text-xl font-display font-bold mb-2">
                    March 27, 2026 Amended Order
                  </h2>
                  <p className="text-white/70 text-lg">
                    Unliquidated entries: The order directs CBP to liquidate all unliquidated entries entered subject to IEEPA duties, without applying those duties.
                  </p>
                  <p className="text-white/70 text-lg">
                    Liquidated but not finally liquidated entries: The order directs CBP to reliquidate such entries without regard to IEEPA duties.
                  </p>
                  <p className="text-white/70 text-lg">
                    Finally liquidated entries: CBP is directed to reliquidate even those entries for which liquidation is already final, again without applying IEEPA duties.
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                    <div>
                      <span className="text-[#E8B951] text-2xl font-display font-bold">
                        45 days
                      </span>
                      <p className="text-white/50 text-[15px]">
                        To deliver returns
                      </p>
                    </div>
                    <div>
                      <span className="text-[#E8B951] text-2xl font-display font-bold">
                        90 Day
                      </span>
                      <p className="text-white/50 text-[15px]">Re-liquidation window</p>
                    </div>
                  </div>
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
