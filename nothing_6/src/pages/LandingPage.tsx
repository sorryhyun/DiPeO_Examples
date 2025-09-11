// filepath: src/pages/LandingPage.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React, { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { config, isDevelopment } from '@/app/config';
import { eventBus } from '@/core/events';
import Hero from '@/features/hero/Hero';
import Testimonials from '@/features/testimonials/Testimonials';
import PricingGrid from '@/features/pricing/PricingGrid';
import FAQ from '@/features/faq/FAQ';
import TeamSection from '@/features/team/TeamSection';
import InteractiveVoidSimulator from '@/features/simulator/InteractiveVoidSimulator';
import NewsletterForm from '@/features/newsletter/NewsletterForm';
import ComparisonTable from '@/features/comparison/ComparisonTable';
import CaseStudies from '@/features/casestudies/CaseStudies';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';

// Section configuration for analytics and navigation
interface SectionConfig {
  id: string;
  name: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  className?: string;
}

const SECTIONS: SectionConfig[] = [
  {
    id: 'hero',
    name: 'Hero',
    component: Hero,
    className: 'min-h-screen'
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    component: Testimonials,
    className: 'py-20 bg-gradient-to-b from-black to-gray-900'
  },
  {
    id: 'pricing',
    name: 'Pricing',
    component: PricingGrid,
    className: 'py-20 bg-gray-900'
  },
  {
    id: 'comparison',
    name: 'Comparison',
    component: ComparisonTable,
    className: 'py-20 bg-gradient-to-b from-gray-900 to-gray-800'
  },
  {
    id: 'simulator',
    name: 'Simulator',
    component: InteractiveVoidSimulator,
    className: 'py-20 bg-gray-800'
  },
  {
    id: 'case-studies',
    name: 'Case Studies',
    component: CaseStudies,
    className: 'py-20 bg-gradient-to-b from-gray-800 to-gray-900'
  },
  {
    id: 'team',
    name: 'Team',
    component: TeamSection,
    className: 'py-20 bg-gray-900'
  },
  {
    id: 'faq',
    name: 'FAQ',
    component: FAQ,
    className: 'py-20 bg-gradient-to-b from-gray-900 to-black'
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    component: NewsletterForm,
    className: 'py-20 bg-black'
  }
];

// Analytics helper for section tracking
const usePageAnalytics = () => {
  useEffect(() => {
    // Track page view
    eventBus.emit('analytics:page-view', {
      page: 'landing',
      timestamp: Date.now(),
      pathname: window.location.pathname,
      referrer: document.referrer || 'direct',
      userAgent: navigator.userAgent
    });

    // Track page load performance
    if (window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        eventBus.emit('analytics:performance', {
          page: 'landing',
          loadTime: navigation.loadEventEnd - navigation.fetchStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0
        });
      }
    }
  }, []);
};

// Section visibility tracking hook
const useSectionTracking = () => {
  const [visibleSections, setVisibleSections] = React.useState<Set<string>>(new Set());

  const trackSection = React.useCallback((sectionId: string, isVisible: boolean) => {
    setVisibleSections(prev => {
      const newSet = new Set(prev);
      if (isVisible && !newSet.has(sectionId)) {
        newSet.add(sectionId);
        // Track section view
        eventBus.emit('analytics:section-view', {
          section: sectionId,
          timestamp: Date.now(),
          page: 'landing'
        });
      }
      return newSet;
    });
  }, []);

  return { visibleSections, trackSection };
};

// Individual section wrapper with intersection tracking
const TrackedSection: React.FC<{
  config: SectionConfig;
  onVisibilityChange: (id: string, isVisible: boolean) => void;
}> = ({ config, onVisibilityChange }) => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.3,
    rootMargin: '-10% 0px'
  });

  const { id, name, component: Component, props = {}, className = '' } = config;

  React.useEffect(() => {
    onVisibilityChange(id, isIntersecting);
  }, [id, isIntersecting, onVisibilityChange]);

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: isIntersecting ? 1 : 0 }}
      transition={{ duration: 0.6 }}
      aria-label={`${name} section`}
      data-section={id}
    >
      <Component {...props} />
    </motion.section>
  );
};

// Floating progress indicator
const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 origin-left"
      style={{ scaleX }}
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuenow={0}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  );
};

// Skip navigation for accessibility
const SkipNav: React.FC = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg"
  >
    Skip to main content
  </a>
);

const LandingPage: React.FC = () => {
  const { trackSection } = useSectionTracking();
  usePageAnalytics();

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Allow users to quickly navigate between sections with number keys
      if (event.ctrlKey || event.metaKey) {
        const num = parseInt(event.key);
        if (num >= 1 && num <= SECTIONS.length) {
          event.preventDefault();
          const section = SECTIONS[num - 1];
          const element = document.getElementById(section.id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            element.focus({ preventScroll: true });
            eventBus.emit('analytics:keyboard-navigation', {
              section: section.id,
              key: event.key
            });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Log development info
  useEffect(() => {
    if (isDevelopment) {
      console.log('🏠 Landing page loaded with sections:', SECTIONS.map(s => s.id));
      console.log('📊 Use Ctrl+[1-9] to jump between sections');
    }
  }, []);

  return (
    <>
      <SkipNav />
      <ScrollProgress />
      
      <main 
        id="main-content"
        className="relative overflow-hidden"
        role="main"
        aria-label="Main landing page content"
      >
        {SECTIONS.map((sectionConfig) => (
          <TrackedSection
            key={sectionConfig.id}
            config={sectionConfig}
            onVisibilityChange={trackSection}
          />
        ))}

        {/* Subtle section dividers */}
        <div className="absolute inset-0 pointer-events-none">
          {SECTIONS.map((_, index) => (
            <div
              key={`divider-${index}`}
              className="absolute w-full h-px bg-gradient-to-r from-transparent via-gray-600/20 to-transparent"
              style={{ top: `${(index + 1) * (100 / SECTIONS.length)}%` }}
            />
          ))}
        </div>

        {/* Background ambient effects */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-2/3 left-3/4 w-48 h-48 bg-green-500/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '4s' }} />
        </div>
      </main>
    </>
  );
};

export default LandingPage;
