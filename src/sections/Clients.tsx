import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// SVG Logos for clients
const clientLogos = [
  {
    name: 'TechGlobal',
    svg: (
      <svg viewBox="0 0 120 40" className="w-full h-full" preserveAspectRatio="xMinYMid meet">
        <rect x="0" y="10" width="20" height="20" rx="4" fill="currentColor" />
        <text x="32" y="26" fontSize="14" fontWeight="600" fill="currentColor">
          ACE Account: Ensure you have a "Filer" or "Importer" ACE account.
        </text>
      </svg>
    ),
  },
  {
    name: 'RetailMax',
    svg: (
      <svg viewBox="0 0 120 40" className="w-full h-full" preserveAspectRatio="xMinYMid meet">
        <circle cx="15" cy="20" r="10" fill="currentColor" />
        <text x="32" y="26" fontSize="14" fontWeight="600" fill="currentColor">
          ACH: Verify that you are set up for ACH Refunds (different from ACH Pay)
        </text>
      </svg>
    ),
  },
  {
    name: 'AutoParts',
    svg: (
      <svg viewBox="0 0 120 40" className="w-full h-full" preserveAspectRatio="xMinYMid meet">
        <polygon points="15,5 25,35 5,35" fill="currentColor" />
        <text x="32" y="26" fontSize="14" fontWeight="600" fill="currentColor">
          Data Audit: Run a report of all IEEPA duty payments from April 2025 to February 2026.
        </text>
      </svg>
    ),
  },
  {
    name: 'FreshFoods',
    svg: (
      <svg viewBox="0 0 120 40" className="w-full h-full" preserveAspectRatio="xMinYMid meet">
        <rect x="5" y="15" width="20" height="15" fill="currentColor" />
        <polygon points="5,15 15,5 25,15" fill="currentColor" />
        <text x="32" y="26" fontSize="14" fontWeight="600" fill="currentColor">
          Counsel: Determine if you need to file a formal protest for the 180-day mark
        </text>
      </svg>
    ),
  },
  /*
  {    name: 'BuildCorp',
    svg: (
      <svg viewBox="0 0 120 40" className="w-full h-full" preserveAspectRatio="xMinYMid meet">
        <rect x="5" y="15" width="20" height="15" fill="currentColor" />
        <polygon points="5,15 15,5 25,15" fill="currentColor" />
        <text x="32" y="26" fontSize="14" fontWeight="600" fill="currentColor">
          BuildCorp
        </text>
      </svg>
    ),
  },
  {
    name: 'MediCare',
    svg: (
      <svg viewBox="0 0 120 40" className="w-full h-full" preserveAspectRatio="xMinYMid meet">
        <rect x="10" y="15" width="10" height="10" fill="currentColor" />
        <rect x="13" y="12" width="4" height="16" fill="currentColor" />
        <rect x="7" y="18" width="16" height="4" fill="currentColor" />
        <text x="32" y="26" fontSize="14" fontWeight="600" fill="currentColor">
          MediCare
        </text>
      </svg>
    ),
  },
  {
    name: 'EnergyPlus',
    svg: (
      <svg viewBox="0 0 120 40" className="w-full h-full" preserveAspectRatio="xMinYMid meet">
        <polygon points="15,5 20,20 15,20 20,35 10,20 15,20 10,5" fill="currentColor" />
        <text x="32" y="26" fontSize="14" fontWeight="600" fill="currentColor">
          EnergyPlus
        </text>
      </svg>
    ),
  },
  {
    name: 'FashionHub',
    svg: (
      <svg viewBox="0 0 120 40" className="w-full h-full" preserveAspectRatio="xMinYMid meet">
        <circle cx="10" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="20" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="3" />
        <text x="32" y="26" fontSize="14" fontWeight="600" fill="currentColor">
          FashionHub
        </text>
      </svg>
    ),
  }, */
]; 

export default function Clients() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Logo items stagger
      gsap.fromTo(
        '.client-logo-item',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Flashlight effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <section
      ref={sectionRef}
      className="section-padding bg-white relative overflow-hidden"
    >
      <div className="container-custom">
        {/* Section Header */}
        <div ref={titleRef} className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-[2px] bg-[#E8B951]" />
            <span className="text-[#6F7B8A] font-display text-[17px] tracking-widest uppercase">
              Prep to Get Your Refund
            </span>
            <div className="w-10 h-[2px] bg-[#E8B951]" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#0F1A2E] mb-4">
            Immediate <span className="text-[#E8B951]">Action Checklist</span>
          </h2>
          <p className="text-[#6F7B8A] max-w-2xl mx-auto">
           The government is pivoting to more "litigation-resistant" authorities like Section 301 and Section 232. Recovering your IEEPA funds now provides a necessary cash buffer for the new tariff investigations launched in March 2026
          </p>
        </div>

        {/* Logo Grid with Flashlight Effect */}
        <div
          ref={gridRef}
          className="relative grid grid-cols-1 gap-8 lg:gap-12 max-w-2xl mx-auto"
          onMouseMove={handleMouseMove}
          style={{
            background: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, rgba(232, 185, 81, 0.1), transparent)`,
          }}
        >
          {clientLogos.slice(0, 6).map((client, index) => (
            <div
              key={index}
              className="client-logo-item group relative p-8 rounded-xl border border-gray-100 hover:border-[#E8B951]/30 transition-all duration-500 hover:shadow-lg hover:shadow-[#E8B951]/10"
            >
              <div className="h-12 text-[#0F1A2E]/30 group-hover:text-[#0F1A2E] transition-all duration-500 flex items-center justify-start">
                {client.svg}
              </div>
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#E8B951]/0 to-[#E8B951]/0 group-hover:from-[#E8B951]/5 group-hover:to-transparent transition-all duration-500" />
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 p-8 bg-[#0F1A2E] rounded-2xl">
          <div className="text-center">
            <span className="text-[#E8B951] text-3xl lg:text-4xl font-display font-bold">
              500+
            </span>
            <p className="text-white/60 text-[17px] mt-2">Active Clients</p>
          </div>
          <div className="text-center">
            <span className="text-[#E8B951] text-3xl lg:text-4xl font-display font-bold">
              98%
            </span>
            <p className="text-white/60 text-[17px] mt-2">Retention Rate</p>
          </div>
          <div className="text-center">
            <span className="text-[#E8B951] text-3xl lg:text-4xl font-display font-bold">
              50M+
            </span>
            <p className="text-white/60 text-[17px] mt-2">Packages Delivered</p>
          </div>
          <div className="text-center">
            <span className="text-[#E8B951] text-3xl lg:text-4xl font-display font-bold">
              4.9
            </span>
            <p className="text-white/60 text-[17px] mt-2">Average Rating</p>
          </div>
        </div>
      </div>
    </section>
  );
}
