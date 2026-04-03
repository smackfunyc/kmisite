import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { name: 'Refund News', href: '#news' },
  { name: 'Tariff Simulator', href: 'https://tariffsimulator.vercel.app/' },
  { name: 'EDI-X12 Converter', href: 'https://chromewebstore.google.com/detail/eliipnmbdnibioljmmogiocogiailhbc?utm_source=item-share-cb' },
  { name: 'ACE Refund', href: 'https://ieepadutyrefunds.com/ACE/' },
  { name: 'HTSUS Lookup', href: '#lookup' },
  { name: 'EAR/ITAR Compliance', href: 'https://chromewebstore.google.com/detail/aempgoeebiibcbflkbclkbedobmchioc?utm_source=item-share-cb' },
  { name: 'IEEPA Refunds Chrome Extension', href: 'https://chromewebstore.google.com/detail/mcmgmmbonflhikmfeghclplagfkcihbc?utm_source=item-share-cb' },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Entrance animation
    gsap.fromTo(
      '.nav-container',
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.5 }
    );
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('http')) return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <nav
        className={`nav-container fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? 'bg-[#0F1A2E]/95 backdrop-blur-lg shadow-lg py-4'
          : 'bg-transparent py-6'
          }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="#home" className="flex items-center gap-3">
              <span
                className={`font-display font-bold text-xl transition-colors ${isScrolled ? 'text-white' : 'text-white'
                  }`}
              >
                IEEPA
              </span>
              <div className="w-30 h-10 bg-[#E8B951] rounded-lg flex items-center justify-center">

                <span className="text-[#0F1A2E] font-display font-bold text-xl">
                  DUTY REFUNDS
                </span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="nav-link"
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* CTA & Phone */}
            <div className="hidden lg:flex items-center gap-6">
              <span className="text-[#E8B951] font-display font-bold text-lg whitespace-nowrap">
                February 20, 2026 Ruling
              </span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-white"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-500 ${isMobileMenuOpen
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
          }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-[#0F1A2E]/95 backdrop-blur-lg"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Menu Content */}
        <div
          className={`absolute top-20 left-0 right-0 p-6 transition-transform duration-500 ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-10'
            }`}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="block py-4 text-white text-lg font-display border-b border-white/10 last:border-0 hover:text-[#E8B951] transition-colors"
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {link.name}
              </a>
            ))}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="text-[#E8B951] font-display font-bold text-lg text-center">
                166 Billion in Tariff Refunds
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
