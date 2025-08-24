import React, { useEffect, useRef } from 'react';
import { VoidAnimationSystem } from '@/features/void/VoidAnimationSystem';
import { GlitchText } from '@/shared/components/GlitchText';
import { Button } from '@/shared/components/Button';
import { useGSAP } from '@/shared/hooks/useGSAP';
import { trackEvent } from '@/utils/analytics';

export const ExistentialHero: React.FC = () => {
  const heroRef = useRef<HTMLElement>(null);
  const { setupGSAP } = useGSAP();
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Basic parallax effect on scroll
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        parallaxRef.current.style.transform = `translate3d(0, ${rate}px, 0)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (heroRef.current) {
      setupGSAP(heroRef.current, (timeline) => {
        // Entry animation sequence
        timeline
          .fromTo('.hero-title', 
            { opacity: 0, y: 50 }, 
            { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }
          )
          .fromTo('.hero-subtitle', 
            { opacity: 0, y: 30 }, 
            { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 
            '-=0.8'
          )
          .fromTo('.hero-cta', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.2, ease: 'back.out(1.7)' }, 
            '-=0.4'
          );
      });
    }
  }, [setupGSAP]);

  const handlePrimaryCTA = () => {
    trackEvent({
      event: 'cta_click',
      category: 'hero',
      properties: {
        label: 'get_started'
      },
      timestamp: Date.now()
    });

    // Smooth scroll to pricing section
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSecondaryCTA = () => {
    trackEvent({
      event: 'cta_click',
      category: 'hero',
      properties: {
        label: 'learn_more'
      },
      timestamp: Date.now()
    });

    // Smooth scroll to newsletter section
    const newsletterSection = document.getElementById('newsletter');
    if (newsletterSection) {
      newsletterSection.scrollIntoView({ behavior: 'smooth' });
      // Focus on newsletter form input
      const newsletterInput = newsletterSection.querySelector('input[type="email"]') as HTMLInputElement;
      if (newsletterInput) {
        setTimeout(() => newsletterInput.focus(), 300);
      }
    }
  };

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white"
      aria-labelledby="hero-title"
      role="banner"
    >
      {/* Parallax Background Animation */}
      <div ref={parallaxRef} className="absolute inset-0 z-0">
        <VoidAnimationSystem mode="heavy" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 
          id="hero-title"
          className="hero-title text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
        >
          The Ultimate in{' '}
          <GlitchText text="Nothing" className="inline-block" />
        </h1>
        
        <h2 className="hero-subtitle text-xl sm:text-2xl lg:text-3xl mb-8 text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Experience the revolutionary power of absolutely nothing. 
          Premium emptiness delivered with unmatched precision.
        </h2>

        <p className="hero-subtitle text-lg mb-12 text-gray-400 max-w-2xl mx-auto">
          Join millions of satisfied customers who have discovered the transformative 
          impact of our scientifically engineered void.
        </p>

        {/* CTA Buttons */}
        <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={handlePrimaryCTA}
            variant="primary"
            className="hero-cta px-8 py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            aria-label="Get started with Nothing - view pricing"
          >
            Get Started with Nothing
          </Button>
          
          <Button
            onClick={handleSecondaryCTA}
            variant="secondary"
            className="hero-cta px-8 py-4 text-lg font-semibold bg-transparent border-2 border-gray-400 text-gray-300 hover:bg-gray-800 hover:border-gray-300 rounded-lg transition-all duration-300"
            aria-label="Learn more about Nothing - join newsletter"
          >
            Learn More
          </Button>
        </div>

        {/* Subtext */}
        <p className="hero-subtitle mt-8 text-sm text-gray-500">
          * Nothing guaranteed or your money back
        </p>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default ExistentialHero;
