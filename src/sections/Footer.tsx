import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowUp,
} from 'lucide-react';

const quickLinks = [
  { name: 'About Us', href: '#' },
  { name: 'Our Services', href: '#' },
  { name: 'Track Shipment', href: '#' },
  { name: 'Get Quote', href: '#' },
  { name: 'Careers', href: '#' },
  { name: 'Contact', href: '#' },
];

const services = [
  { name: 'Air Freight', href: '#' },
  { name: 'Ocean Freight', href: '#' },
  { name: 'Road Transport', href: '#' },
  { name: 'Warehousing', href: '#' },
  { name: 'Custom Clearance', href: '#' },
  { name: 'Supply Chain', href: '#' },
];

export default function Footer() {

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0F1A2E] relative">
      {/* Main Footer */}
      <div className="container-custom py-16 lg:py-20">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Column 1 - About */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#E8B951] rounded-lg flex items-center justify-center">
                <span className="text-[#0F1A2E] font-display font-bold text-lg">
                  CBP
                </span>
              </div>
              <span className="text-white font-display font-bold text-xl">
                IEEPA Duty Refunds
              </span>
            </div>
            <p className="text-white/60 text-[17px] leading-relaxed mb-6">
              Your trusted partner in IEEPA Duty Refunds. 
              We help businesses recover billions in overpaid tariffs with AI
              software and proven results.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white/60 text-[17px]">
                <MapPin className="w-4 h-4 text-[#E8B951]" />
                <span>Race Track Rd St Johns, FL 32259</span>
              </div>
              <div className="flex items-center gap-3 text-white/60 text-[17px]">
                <Phone className="w-4 h-4 text-[#E8B951]" />
                <span>+1 (347) 762-2597</span>
              </div>
              <div className="flex items-center gap-3 text-white/60 text-[17px]">
                <Mail className="w-4 h-4 text-[#E8B951]" />
                <span>admin@ieepadutyrefunds.com</span>
              </div>
              <div className="flex items-center gap-3 text-white/60 text-[17px]">
                <Clock className="w-4 h-4 text-[#E8B951]" />
                <span>Time is Money, Get your refund</span>
              </div>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h4 className="text-white font-display font-bold text-lg mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="footer-link text-[17px] flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#E8B951]" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Services */}
          <div>
            <h4 className="text-white font-display font-bold text-lg mb-6">
              Our Services
            </h4>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <a
                    href={service.href}
                    className="footer-link text-[17px] flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#E8B951]" />
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Newsletter */}
          
          {/* <div>
            <h4 className="text-white font-display font-bold text-lg mb-6">
              Newsletter
            </h4>
            <p className="text-white/60 text-[17px] mb-4">
              Subscribe to get the latest news and updates from IEEPA Duty Refunds.
            </p>
            <form onSubmit={handleSubscribe} className="mb-6">
              <div className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 bg-white/10 border border-white/20 rounded-l-lg px-4 py-3 text-white text-[17px] placeholder:text-white/40 focus:outline-none focus:border-[#E8B951]"
                />
                <button
                  type="submit"
                  className="bg-[#E8B951] hover:bg-[#d4a73d] text-[#0F1A2E] px-4 rounded-r-lg transition-colors"
                >
                  {isSubscribed ? (
                    <span className="text-green-600 font-bold">✓</span>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
              {isSubscribed && (
                <p className="text-green-400 text-[15px] mt-2">
                  Thank you for subscribing!
                </p>
              )}
            </form>


            <div>
              <p className="text-white/60 text-[17px] mb-3">Follow Us</p>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="social-icon text-white hover:text-[#0F1A2E]"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-[17px]">
              © {new Date().getFullYear()} IEEPA Duty Refunds. All rights
              reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-white/40 text-[17px] hover:text-[#E8B951] transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-white/40 text-[17px] hover:text-[#E8B951] transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-white/40 text-[17px] hover:text-[#E8B951] transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 bg-[#E8B951] text-[#0F1A2E] rounded-full shadow-lg flex items-center justify-center hover:bg-[#d4a73d] transition-all duration-300 hover:scale-110 z-50"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </footer>
  );
}
