import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Plane, Ship, Truck, Warehouse, ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    id: 1,
    title: 'Validate ACE Account',
    description:
      'CBP refunds are strictly electronic. You must ensure your company has an active ACE Secure Data Portal account with the Importer sub-account view. Verify that your banking information is current. If you are not enrolled in ACH, your refund will be rejected. Action: Log in to the ACE Portal and navigate to the “ACH Refund Authorization” tab. Critical Check: Verify that your banking information is current. If you are not enrolled in ACH, your refund will be rejected. ',
    image: '/service-air.jpg',
    icon: Plane,
    features: ['Express Delivery', 'Charter Services', 'Door-to-Door'],
  },
  {
    id: 2,
    title: 'Prepare "CAPE Declaration"',
    description:
      ' You must identify every entry summary that included the illegal IEEPA-specific HTS numbers.Action: Compile a CSV file listing all affected entry numbers.Pro Tip: Focus on Phase 1 entries first—standard formal and informal entries. More complex entries (like those with AD/CVD orders or warehouse withdrawals) will be processed in later phases.',
    image: '/service-ocean.jpg',
    icon: Ship,
    features: ['FCL & LCL', 'Container Tracking', 'Port Handling'],
  },
  {
    id: 3,
    title: 'Submit in ACE Claim Portal',
    description:
      'CAPE Claim Portal tab within ACE (expected late April 2026). Action: Upload your CSV file through the portal. The system will run real-time validations to check for formatting errors and filer authorization.Verification: Once submitted, you will receive a confirmation status. If errors occur, you must correct and resubmit to maintain your place in the processing queue',
    image: '/service-road.jpg',
    icon: Truck,
    features: ['FTL & LTL', 'Cross-Border', 'Last Mile Delivery'],
  },
  {
    id: 4,
    title: 'Monitor Reliquidation/Deposit',
    description:
      "Once validated, CBP's system automatically removes the illegal HTS codes and recalculates your duties as if the tariffs never existed. The Payoff: The system calculates the refund amount plus interest (based on the IRS corporate overpayment rate). Timeline: Most validated claims are expected to be processed within 45 days. Funds will be deposited directly into your authorized ACH account once reliquidation is finalized.",
    image: '/service-warehouse.jpg',
    icon: Warehouse,
    features: ['Inventory Management', 'Fulfillment', 'Distribution'],
  },
];

export default function Services() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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

      // Service items stagger
      gsap.fromTo(
        '.service-accordion-item',
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.services-container',
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-padding bg-[#0F1A2E] relative overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div ref={titleRef} className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-[2px] bg-[#E8B951]" />
            <span className="text-[#E8B951] font-display text-[17px] tracking-widest uppercase">
              Steps to get a Refund from CBP
            </span>
            <div className="w-10 h-[2px] bg-[#E8B951]" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            IEEPA <span className="text-[#E8B951]">DUTY REFUNDS</span>{' '}
            Solutions
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            To capitalize on the $166 billion in refunds unlocked by the February 20, 2026, 
            Supreme Court ruling,
             your business must navigate the new CAPE (Consolidated Administration and Processing of Entries) 
             framework within the ACE Portal.
          </p>
        </div>

        {/* Services Accordion */}
        <div className="services-container flex flex-col lg:flex-row gap-4 h-auto lg:h-[600px]">
          {services.map((service, index) => {
            const Icon = service.icon;
            const isActive = activeIndex === index;

            return (
              <div
                key={service.id}
                className={`service-accordion-item relative overflow-hidden rounded-lg cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${isActive
                    ? 'lg:flex-[3] flex-auto'
                    : activeIndex !== null
                      ? 'lg:flex-[0.5] flex-auto'
                      : 'lg:flex-1 flex-auto'
                  }`}
                style={{ minHeight: '200px' }}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {/* Background Image */}
                <img
                  src={service.image}
                  alt={service.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${isActive ? 'scale-100 opacity-100' : 'scale-110 opacity-60'
                    }`}
                />

                {/* Overlay */}
                <div
                  className={`absolute inset-0 transition-all duration-500 ${isActive
                      ? 'bg-gradient-to-t from-[#0F1A2E] via-[#0F1A2E]/70 to-transparent'
                      : 'bg-[#0F1A2E]/70'
                    }`}
                />

                {/* Content */}
                <div className="relative h-full p-6 flex flex-col justify-end">
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-lg bg-[#E8B951] flex items-center justify-center mb-4 transition-all duration-500 ${isActive ? 'scale-100' : 'scale-90'
                      }`}
                  >
                    <Icon className="w-7 h-7 text-[#0F1A2E]" />
                  </div>

                  {/* Title - Always visible */}
                  <h3
                    className={`text-2xl font-display font-bold text-white mb-2 transition-all duration-500 ${isActive ? 'translate-y-0' : 'lg:translate-y-0'
                      }`}
                  >
                    {service.title}
                  </h3>

                  {/* Description - Shows on hover */}
                  <div
                    className={`overflow-hidden transition-all duration-500 ${isActive
                        ? 'max-h-96 opacity-100'
                        : 'max-h-0 opacity-0 lg:max-h-0'
                      }`}
                  >
                    <p className="text-white/70 mb-4">
                      {service.id === 1 ? (
                        <>
                          {'CBP refunds are strictly electronic. You must ensure your company has an active ACE Secure Data Portal account with the Importer sub-account view. Verify that your banking information is current. If you are not enrolled in ACH, your refund will be rejected.'}
                          <br />   <br />
                          <strong>Action:</strong>
                          {' Log in to the ACE Portal and navigate to the "ACH Refund Authorization" tab.'}
                          <br />
                          <strong>Critical Check:</strong>
                          {' Verify that your banking information is current. If you are not enrolled in ACH, your refund will be rejected.'}
                        </>
                      ) : service.id === 2 ? (
                        <>
                          {'You must identify every entry summary that included the illegal IEEPA-specific HTS numbers.'}
                          <br />   <br />
                          <strong>Action:</strong>
                          {' Compile a CSV file listing all affected entry numbers.'}
                          <br />
                          <strong>Pro Tip:</strong>
                          {' Focus on Phase 1 entries first—standard formal and informal entries. More complex entries (like those with AD/CVD orders or warehouse withdrawals) will be processed in later phases.'}
                        </>
                      ) : service.id === 3 ? (
                        <>
                          {'CAPE Claim Portal tab within ACE (expected late April 2026). '}
                          <br />   <br />
                          <strong>Action:</strong>
                          {' Upload your CSV file through the portal. The system will run real-time validations to check for formatting errors and filer authorization.'}
                          <br />
                          <strong>Verification:</strong>
                          {' Once submitted, you will receive a confirmation status. If errors occur, you must correct and resubmit to maintain your place in the processing queue.'}
                        </>
                      ) : service.id === 4 ? (
                        <>
                          {`Once validated, CBP\u2019s system automatically removes the illegal HTS codes and recalculates your duties as if the tariffs never existed.`}
                          <br />   <br />
                          <strong>The Payoff:</strong>
                          {` The system calculates the refund amount plus interest (based on the IRS corporate overpayment rate). `}
                          <strong>Timeline:</strong>
                          {` Most validated claims are expected to be processed within 45 days. Funds will be deposited directly into your authorized ACH account once reliquidation is finalized.`}
                        </>
                      ) : service.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {service.features.map((feature, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-white/10 rounded-full text-white/80 text-[15px]"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <button className="flex items-center gap-2 text-[#E8B951] font-display text-[17px] uppercase tracking-wider group">
                      Learn More
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-white/60 mb-4">
            Need to look up your HTSUS code?
          </p>
          <button className="btn-primary">HTSUS Lookup</button>
        </div>
      </div>
    </section>
  );
}
