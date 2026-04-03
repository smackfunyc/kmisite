import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Award, Users, Globe, Clock } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { icon: Award, value: 75, suffix: '%', label: 'Cut EDI validation time by 70–90% compared to manual Excel cross-referencing and CATAIR lookups.', },
  { icon: Users, value: 100, suffix: '%', label: 'Identify 100% of mandatory field violations instantly, reducing costly CBP rejections before submission.' },
  { icon: Globe, value: 3, suffix: '-5', label: 'Eliminate 3–5 separate tools or tabs (Excel, PDF specs, parsers, lookup tables) into a single local interface.' },
  { icon: Clock, value: 100, suffix: '%', label: 'Reduce external data exposure to 0% by keeping all processing fully local with no uploads, storage, or transmission' },
];

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Image mask reveal
      gsap.fromTo(
        imageRef.current,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1.2,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Content slide up
      gsap.fromTo(
        contentRef.current,
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Badge pop animation
      gsap.fromTo(
        badgeRef.current,
        { scale: 0, rotation: -180 },
        {
          scale: 1,
          rotation: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 50%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Stats counter animation
      const statElements = statsRef.current?.querySelectorAll('.stat-value');
      statElements?.forEach((el) => {
        const target = parseInt(el.getAttribute('data-value') || '0');
        gsap.fromTo(
          el,
          { innerText: 0 },
          {
            innerText: target,
            duration: 2,
            ease: 'power2.out',
            snap: { innerText: 1 },
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      // Inner parallax for image
      const imgElement = imageRef.current?.querySelector('img');
      if (imgElement) {
        gsap.to(imgElement, {
          yPercent: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-padding bg-[#F5F7FA] relative overflow-hidden"
    >
      <div className="container-custom">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Image - Takes 7 columns */}
          <div className="lg:col-span-7 relative">
            <div
              ref={imageRef}
              className="relative overflow-hidden rounded-lg"
              style={{ clipPath: 'inset(0 100% 0 0)' }}
            >
              <a href="https://chromewebstore.google.com/detail/eliipnmbdnibioljmmogiocogiailhbc?utm_source=item-share-cb"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#E8B951] transition-colors"
              >
                <img
                src={`${import.meta.env.BASE_URL}about-image.jpg`}
                  alt="Warehouse operations"
                  className="w-half h-[500px] object-cover"
                /></a>
            </div>

            {/* Experience Badge */}
            <div
              ref={badgeRef}
              className="absolute -bottom-8 -right-4 lg:right-12 w-40 h-40 bg-[#0F1A2E] rounded-full flex flex-col items-center justify-center shadow-2xl z-10"
            >
              <span className="text-[#E8B951] text-4xl font-display font-bold">
                EDI-X12
              </span>
              <span className="text-white text-[17px] text-center px-4">
                Converter
              </span>
            </div>
          </div>

          {/* Content - Takes 5 columns, overlaps image */}
          <div className="lg:col-span-5 lg:-ml-20 relative z-20">
            <div
              ref={contentRef}
              className="bg-white p-8 lg:p-12 rounded-lg shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-[2px] bg-[#E8B951]" />
                <span className="text-[#6F7B8A] font-display text-[17px] tracking-widest uppercase">
                  EDI-X12 CATAIR
                </span>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-[#0F1A2E] mb-6">
                <a
                  href="https://chromewebstore.google.com/detail/eliipnmbdnibioljmmogiocogiailhbc?utm_source=item-share-cb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#E8B951] transition-colors"
                >
                  Validate EDI X12 and CBP CATAIR {' '}
                </a>
              </h2>

              <p className="text-[#6F7B8A] leading-relaxed mb-6">
                <h2 className="text-3xl lg:text-4xl font-bold text-[#0F1A2E] mb-6">
                  <span className="text-[#E8B951]"> No upload. Safe and Secure</span>
                </h2>
              </p>

              <p className="text-[#6F7B8A] leading-relaxed mb-8">
                EDI-X12 Chrome extensionruns entirely in your browser, keeping every record local, secure, and invisible to the internet while eliminating the need to switch between tools, spreadsheets, and spec documents. Parse, validate, and review up to 20 rows for free, then unlock full validation, AI insights, and export capabilities knowing your data never leaves your machine, is never stored, and is never exposed.
              </p>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#E8B951]/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#E8B951]" />
                  </div>
                  <span className="text-[#0F1A2E] text-[17px] font-medium">
                    ISO Certified
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#E8B951]/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#E8B951]" />
                  </div>
                  <span className="text-[#0F1A2E] text-[17px] font-medium">
                    Global Network
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#E8B951]/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#E8B951]" />
                  </div>
                  <span className="text-[#0F1A2E] text-[17px] font-medium">
                    24/7 Support
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16"
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <stat.icon className="w-8 h-8 text-[#E8B951] mb-4" />
              <div className="stat-number">
                {stat.displayValue ? (
                  <span>{stat.displayValue}</span>
                ) : (
                  <>
                    <span className="stat-value" data-value={stat.value}>
                      0
                    </span>
                    <span>{stat.suffix}</span>
                  </>
                )}
              </div>
              <p className="text-[#6F7B8A] text-[19px] mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
