import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Send, Check, Loader2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const serviceTypes = [
  'Air Freight',
  'Ocean Freight',
  'Road Transport',
  'Warehousing',
  'Custom Solution',
];

export default function Quote() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    serviceType: '',
    message: '',
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Form entrance animation
      gsap.fromTo(
        formRef.current,
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Input fields stagger
      gsap.fromTo(
        '.form-input',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: formRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);

      // Reset after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          serviceType: '',
          message: '',
        });
      }, 3000);
    }, 2000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center py-20 overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={`${import.meta.env.BASE_URL}quote-bg.jpg`}
          alt="Port background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0F1A2E]/80" />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Text Content */}
          <div className="text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-[2px] bg-[#E8B951]" />
              <span className="text-[#E8B951] font-display text-[17px] tracking-widest uppercase">
                Get In Touch
              </span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Calculate your <span className="text-[#E8B951]">Tariff</span>
            </h2>

            <p className="text-white/70 text-lg leading-relaxed mb-8">
              Safe and Secure, we never collect your information.
              Calculate import duties, Section 301 tariffs, and
              landed costs for any product from any country.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#E8B951]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#E8B951] font-display font-bold">01</span>
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg mb-1">
                    Fast Response
                  </h4>
                  <p className="text-white/60 text-[17px]">
                    Get your quote within 24 hours of submission
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#E8B951]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#E8B951] font-display font-bold">02</span>
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg mb-1">
                    Competitive Pricing
                  </h4>
                  <p className="text-white/60 text-[17px]">
                    Best rates guaranteed with no hidden fees
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#E8B951]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#E8B951] font-display font-bold">03</span>
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg mb-1">
                    Expert Consultation
                  </h4>
                  <p className="text-white/60 text-[17px]">
                    Personalized advice from logistics professionals
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Form */}
          <div
            ref={formRef}
            className="glass rounded-2xl p-8 lg:p-10"
          >
            <h3 className="text-white text-2xl font-display font-bold mb-6">
              Fill Out The Form
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="form-input">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    required
                    className="input-field rounded-lg"
                  />
                </div>
                <div className="form-input">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    required
                    className="input-field rounded-lg"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="form-input">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="input-field rounded-lg"
                  />
                </div>
                <div className="form-input">
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Company Name"
                    className="input-field rounded-lg"
                  />
                </div>
              </div>

              <div className="form-input">
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  required
                  className="input-field rounded-lg appearance-none cursor-pointer"
                >
                  <option value="" disabled>
                    Select Service Type
                  </option>
                  {serviceTypes.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-input">
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your shipping requirements..."
                  rows={4}
                  className="input-field rounded-lg resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isSubmitted}
                className={`w-full py-4 rounded-lg font-display font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${isSubmitted
                  ? 'bg-green-500 text-white'
                  : 'bg-[#E8B951] text-[#0F1A2E] hover:bg-[#d4a73d]'
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : isSubmitted ? (
                  <>
                    <Check className="w-5 h-5" />
                    Request Submitted!
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Request
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
