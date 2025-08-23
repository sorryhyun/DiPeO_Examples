import React, { Suspense } from 'react';
import Layout from '../shared/components/Layout';
import ExistentialHero from '../features/hero/ExistentialHero';
import PricingTiers from '../features/pricing/PricingTiers';
import TestimonialList from '../features/testimonials/TestimonialList';
import AnimatedCounter from '../features/counter/AnimatedCounter';
import FAQSection from '../features/faq/FAQSection';
import TeamSection from '../features/team/TeamSection';
import NewsletterSignup from '../features/newsletter/NewsletterSignup';
import ComparisonChart from '../features/comparison/ComparisonChart';
import CaseStudies from '../features/caseStudies/CaseStudies';
import RoadmapTimeline from '../features/roadmap/RoadmapTimeline';
import CustomerReviews from '../features/reviews/CustomerReviews';
import MoneyBackBadge from '../features/guarantee/MoneyBackBadge';
import Spinner from '../shared/components/Spinner';

// Lazy load heavy components
const VoidAnimation = React.lazy(() => import('../features/void/VoidAnimation'));
const SupportChatWidget = React.lazy(() => import('../features/chat/SupportChatWidget'));
const Showcase3D = React.lazy(() => import('../features/showcase/Showcase3D'));

const HomePage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
        {/* Hero Section */}
        <section id="hero" className="relative">
          <ExistentialHero />
          <Suspense fallback={<div className="flex justify-center py-8"><Spinner /></div>}>
            <VoidAnimation />
          </Suspense>
        </section>

        {/* Counter Section */}
        <section id="counter" className="py-16 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-8">
              People Who've Experienced Nothing
            </h2>
            <AnimatedCounter />
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-4 bg-slate-800/50">
          <div className="container mx-auto">
            <h2 className="text-5xl font-bold text-center text-white mb-4">
              Choose Your Nothing
            </h2>
            <p className="text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto">
              Select the perfect level of nothing for your needs. All plans include unlimited access to absolutely nothing.
            </p>
            <PricingTiers />
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-5xl font-bold text-center text-white mb-4">
              What People Say About Nothing
            </h2>
            <p className="text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto">
              Real testimonials from real people who've experienced absolutely nothing.
            </p>
            <TestimonialList />
          </div>
        </section>

        {/* Comparison Chart */}
        <section id="comparison" className="py-20 px-4 bg-slate-800/50">
          <div className="container mx-auto">
            <h2 className="text-5xl font-bold text-center text-white mb-4">
              Nothing vs. Everything Else
            </h2>
            <p className="text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto">
              See how nothing stacks up against the competition.
            </p>
            <ComparisonChart />
          </div>
        </section>

        {/* 3D Showcase */}
        <section id="showcase" className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-5xl font-bold text-center text-white mb-4">
              Experience Nothing in 3D
            </h2>
            <p className="text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto">
              Immerse yourself in the three-dimensional representation of nothing.
            </p>
            <Suspense fallback={
              <div className="flex justify-center items-center h-96 bg-slate-800 rounded-lg">
                <Spinner />
              </div>
            }>
              <Showcase3D />
            </Suspense>
          </div>
        </section>

        {/* Case Studies */}
        <section id="case-studies" className="py-20 px-4 bg-slate-800/50">
          <div className="container mx-auto">
            <h2 className="text-5xl font-bold text-center text-white mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto">
              How organizations worldwide have leveraged nothing for incredible results.
            </p>
            <CaseStudies />
          </div>
        </section>

        {/* Customer Reviews */}
        <section id="reviews" className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-5xl font-bold text-center text-white mb-4">
              Customer Reviews
            </h2>
            <p className="text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto">
              Verified reviews from satisfied customers who chose nothing.
            </p>
            <CustomerReviews />
          </div>
        </section>

        {/* Roadmap */}
        <section id="roadmap" className="py-20 px-4 bg-slate-800/50">
          <div className="container mx-auto">
            <h2 className="text-5xl font-bold text-center text-white mb-4">
              The Future of Nothing
            </h2>
            <p className="text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto">
              See what's coming next in our journey toward perfect nothingness.
            </p>
            <RoadmapTimeline />
          </div>
        </section>

        {/* Team Section */}
        <section id="team" className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-5xl font-bold text-center text-white mb-4">
              Meet the Team Behind Nothing
            </h2>
            <p className="text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto">
              The brilliant minds who made nothing possible.
            </p>
            <TeamSection />
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 px-4 bg-slate-800/50">
          <div className="container mx-auto">
            <h2 className="text-5xl font-bold text-center text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto">
              Everything you need to know about nothing.
            </p>
            <FAQSection />
          </div>
        </section>

        {/* Money Back Guarantee */}
        <section id="guarantee" className="py-12 px-4">
          <div className="container mx-auto flex justify-center">
            <MoneyBackBadge />
          </div>
        </section>

        {/* Newsletter Signup */}
        <section id="newsletter" className="py-20 px-4 bg-gradient-to-r from-purple-900 to-indigo-900">
          <div className="container mx-auto">
            <h2 className="text-5xl font-bold text-center text-white mb-4">
              Stay Updated on Nothing
            </h2>
            <p className="text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto">
              Subscribe to our newsletter for the latest updates on absolutely nothing.
            </p>
            <NewsletterSignup />
          </div>
        </section>

        {/* Support Chat Widget */}
        <Suspense fallback={null}>
          <SupportChatWidget />
        </Suspense>
      </div>
    </Layout>
  );
};

export default HomePage;
