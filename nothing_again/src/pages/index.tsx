import { useEffect, Suspense } from 'react';
import { Layout } from '@/shared/components/Layout';
import { ExistentialHero } from '@/features/hero/ExistentialHero';
import { VoidAnimationSystem } from '@/features/void/VoidAnimationSystem';
import { PricingTiers } from '@/features/pricing/PricingTiers';
import { TestimonialGenerator } from '@/features/testimonials/TestimonialGenerator';
import { AnimatedZeroCounter } from '@/features/counter/AnimatedZeroCounter';
import { FAQSection } from '@/features/faq/FAQSection';
import { TeamSection } from '@/features/team/TeamSection';
import { NewsletterForm } from '@/features/newsletter/NewsletterForm';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { trackEvent } from '@/utils/analytics';

export const HomePage = () => {
  useEffect(() => {
    // Track page view on mount
    trackEvent({
      event: 'page_view',
      category: 'navigation',
      properties: {
        page: 'home',
        timestamp: Date.now(),
      },
      sessionId: 'session-' + Date.now(),
      timestamp: Date.now(),
      page: 'home'
    });

    // Set page title and meta description
    document.title = 'Absolutely Nothing™ - Premium Nothing for Everyone';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Experience the ultimate in premium nothingness. Our revolutionary void technology delivers absolutely nothing, guaranteed. Perfect for those seeking the purest form of absence.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Experience the ultimate in premium nothingness. Our revolutionary void technology delivers absolutely nothing, guaranteed. Perfect for those seeking the purest form of absence.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <Layout>
      <main role="main" className="min-h-screen">
        {/* Hero Section */}
        <section id="hero" aria-label="Hero section">
          <ExistentialHero />
        </section>

        {/* Void Animation System */}
        <section id="void" aria-label="Void visualization" className="relative">
          <VoidAnimationSystem />
        </section>

        {/* Counter Section */}
        <section id="counter" aria-label="Nothing counter" className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 dark:text-white">
              Total Amount of Nothing Delivered
            </h2>
            <AnimatedZeroCounter />
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" aria-label="Pricing tiers" className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              Choose Your Nothing
            </h2>
            <ErrorBoundary fallback={
              <div className="text-center py-8">
                <p className="text-red-600 dark:text-red-400">
                  Error loading pricing. Even our errors contain nothing.
                </p>
              </div>
            }>
              <Suspense fallback={
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              }>
                <PricingTiers />
              </Suspense>
            </ErrorBoundary>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" aria-label="Customer testimonials" className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              What Our Customers Say About Nothing
            </h2>
            <ErrorBoundary fallback={
              <div className="text-center py-8">
                <p className="text-red-600 dark:text-red-400">
                  Error loading testimonials. Our silence speaks volumes.
                </p>
              </div>
            }>
              <Suspense fallback={
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              }>
                <TestimonialGenerator />
              </Suspense>
            </ErrorBoundary>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" aria-label="Frequently asked questions" className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              Frequently Asked Questions About Nothing
            </h2>
            <FAQSection />
          </div>
        </section>

        {/* Team Section */}
        <section id="team" aria-label="Our team" className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              Meet the Nothing Team
            </h2>
            <TeamSection />
          </div>
        </section>

        {/* Newsletter Section */}
        <section id="newsletter" aria-label="Newsletter signup" className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                Stay Updated on Nothing
              </h2>
              <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">
                Subscribe to our newsletter and receive absolutely nothing directly in your inbox.
              </p>
              <NewsletterForm />
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default HomePage;
