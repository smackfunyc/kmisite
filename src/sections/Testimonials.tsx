import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    id: 1,
    name: 'Financial Recovery (Plus Interest)',
    role: 'Successful refunds are entitled duty plus interest.',
    image: '/client1.jpg',
    content:
      'The Supreme Court ruled the government collected these funds unlawfully. Massive Scale: Billions of dollars are currently held by U.S. Customs and Border Protection (CBP).',
    rating: 5,
  },
  {
    id: 2,
    name: 'Refunds are Not Automatic',
    role: 'The government is not simply "cutting checks" to importers',
    image: '/client2.jpg',
    content:
      'Working with IEEPA Duty Refunds has been a game-changer for our business. Their global network and real-time tracking capabilities give us complete visibility and peace of mind.',
    rating: 5,
  },
  {
    id: 1,
    name: 'Strict Legal Deadlines (The 180-Day Rule)',
    role: 'Refunds depend on the "liquidation" status of your entries:',
    image: '/client3.jpg',
    content:
      'You only have 180 days to file a formal protest. If you miss this window, the government’s decision to keep your money becomes legally binding.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Avoiding "Windfall" Litigation',
    role: 'If you are an importer who passed these tariff costs down to your customers, you may face legal pressure.',
    image: '/client4.jpg',
    content:
      'Proactive Strategy: Filing for the refund now allows you to control the capital and address these contractual or consumer-protection claims on your own terms rather than being caught unprepared.',
    rating: 5,
  },
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);

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

      // Cards stagger
      gsap.fromTo(
        '.testimonial-card',
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: carouselRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    dragStartX.current = clientX;
    scrollStartX.current = currentIndex;
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = dragStartX.current - clientX;
    const threshold = 100;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
      setIsDragging(false);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <section
      ref={sectionRef}
      className="section-padding bg-[#F5F7FA] relative overflow-hidden"
    >
      <div className="container-custom">
        {/* Section Header */}
        <div ref={titleRef} className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-[2px] bg-[#E8B951]" />
            <span className="text-[#6F7B8A] font-display text-[17px] tracking-widest uppercase">
              Testimonials
            </span>
            <div className="w-10 h-[2px] bg-[#E8B951]" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#0F1A2E] mb-4">
            Why file for <span className="text-[#E8B951]"> IEEPA Duty Refunds</span>?
          </h2>
          <p className="text-[#6F7B8A] max-w-2xl mx-auto">
            While the CIT has ordered nationwide refunds, the government is expected to appeal. Many trade experts recommend filing a summons and complaint at the CIT to "stop the clock" and protect your rights in case the administrative (CBP) process is delayed or limited by future appeals
          </p>
        </div>

        {/* Carousel */}
        <div
          ref={carouselRef}
          className="relative"
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          {/* Cards Container */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                transform: `translateX(-${currentIndex * (100 / 3)}%)`,
              }}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="testimonial-card w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-4"
                >
                  <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                    {/* Author */}
                    <div className="flex items-center gap-4 pb-6 border-b border-gray-100 mb-6">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-display font-bold text-[#0F1A2E]">
                          {testimonial.name}
                        </h4>
                        <p className="text-[#6F7B8A] text-[17px]">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>

                    {/* Quote Icon */}


                    {/* Content */}
                    <p className="text-[#6F7B8A] leading-relaxed flex-1 mb-6">
                      "{testimonial.content}"
                    </p>

                    {/* Rating */}
                    <div className="flex gap-1 pt-4 border-t border-gray-100">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-[#E8B951] text-[#E8B951]"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={handlePrev}
              className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-[#0F1A2E] hover:text-white transition-all duration-300 group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={handleNext}
              className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-[#0F1A2E] hover:text-white transition-all duration-300 group"
            >
              <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                  ? 'w-8 bg-[#E8B951]'
                  : 'bg-[#0F1A2E]/20 hover:bg-[#0F1A2E]/40'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
