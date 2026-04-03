// ── ALL EDITS MADE 4-1-26 ─────────────────────────────────────────────────────────────────


import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navigation from './sections/Navigation';
import Hero from './sections/Hero';
import About from './sections/About';
import Services from './sections/Services';
import Quote from './sections/Quote';
import Testimonials from './sections/Testimonials';
import News from './sections/News';
import Clients from './sections/Clients';
import Footer from './sections/Footer';
import './index.css';

gsap.registerPlugin(ScrollTrigger);

function App() {
  useEffect(() => {
    // Initialize smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';

    // Refresh ScrollTrigger on load
    ScrollTrigger.refresh();

    // Handle reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      gsap.globalTimeline.timeScale(0);
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="relative">
      {/* Grain Overlay */}
      <div className="grain-overlay" />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main>
        <section id="home">
          <Hero />
        </section>

        <section id="news">
          <News />
        </section>

        <section id="quote">
          <Quote />
        </section>

        <section id="about">
          <About />
        </section>

        <section id="services">
          <Services />
        </section>

        <section id="testimonials">
          <Testimonials />
        </section>

        <section id="clients">
          <Clients />
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
