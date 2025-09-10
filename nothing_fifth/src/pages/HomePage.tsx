// filepath: src/pages/HomePage.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GradientBackground from '@/shared/components/GradientBackground';
import MetricCard from '@/features/dashboard/MetricCard';
import GlassCard from '@/shared/components/GlassCard';
import { config } from '@/app/config';
import { fadeIn, staggerContainer, staggerItem } from '@/theme/animations';
import { ChartSeries } from '@/core/contracts';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface HeroMetric {
  readonly id: string;
  readonly label: string;
  readonly value: string | number;
  readonly delta?: {
    readonly value: number;
    readonly type: 'percentage' | 'absolute';
    readonly period: string;
  };
  readonly trend?: 'up' | 'down' | 'neutral';
  readonly sparklineData?: ChartSeries;
  readonly color?: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'gray';
  readonly icon?: React.ReactNode;
}

interface FeatureHighlight {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: React.ReactNode;
  readonly href: string;
}

// ============================================================================
// MOCK DATA & CONSTANTS
// ============================================================================

const heroMetrics: HeroMetric[] = [
  {
    id: 'total-users',
    label: 'Total Users',
    value: 12847,
    delta: { value: 12, type: 'percentage', period: 'vs last month' },
    trend: 'up',
    color: 'blue',
    sparklineData: {
      id: 'users',
      name: 'Users',
      points: [
        { x: '1', y: 11200 },
        { x: '2', y: 11500 },
        { x: '3', y: 11800 },
        { x: '4', y: 12100 },
        { x: '5', y: 12400 },
        { x: '6', y: 12847 },
      ],
    },
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
  },
  {
    id: 'active-sessions',
    label: 'Active Sessions',
    value: 3247,
    delta: { value: 8, type: 'percentage', period: 'vs last week' },
    trend: 'up',
    color: 'green',
    sparklineData: {
      id: 'sessions',
      name: 'Sessions',
      points: [
        { x: '1', y: 2900 },
        { x: '2', y: 3100 },
        { x: '3', y: 2800 },
        { x: '4', y: 3200 },
        { x: '5', y: 3400 },
        { x: '6', y: 3247 },
      ],
    },
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: 'revenue',
    label: 'Revenue',
    value: '$847K',
    delta: { value: -3, type: 'percentage', period: 'vs last month' },
    trend: 'down',
    color: 'purple',
    sparklineData: {
      id: 'revenue',
      name: 'Revenue',
      points: [
        { x: '1', y: 780000 },
        { x: '2', y: 820000 },
        { x: '3', y: 900000 },
        { x: '4', y: 880000 },
        { x: '5', y: 860000 },
        { x: '6', y: 847000 },
      ],
    },
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ),
  },
  {
    id: 'satisfaction',
    label: 'Satisfaction',
    value: '94%',
    delta: { value: 2, type: 'percentage', period: 'vs last quarter' },
    trend: 'up',
    color: 'orange',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
];

const featureHighlights: FeatureHighlight[] = [
  {
    id: 'dashboard',
    title: 'Analytics Dashboard',
    description: 'Comprehensive insights and metrics to track your business performance in real-time.',
    href: '/dashboard',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: 'reports',
    title: 'Advanced Reports',
    description: 'Generate detailed reports and export data in multiple formats for deeper analysis.',
    href: '/reports',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'automation',
    title: 'Workflow Automation',
    description: 'Streamline your processes with intelligent automation and customizable workflows.',
    href: '/automation',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

// ============================================================================
// COMPONENT SECTIONS
// ============================================================================

const HeroSection: React.FC = () => (
  <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
    <div className="container mx-auto px-4 py-20 text-center relative z-10">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        <motion.h1
          variants={staggerItem}
          className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
        >
          Welcome to{' '}
          <span className="text-gradient-primary">
            {config.appName}
          </span>
        </motion.h1>
        
        <motion.p
          variants={staggerItem}
          className="text-xl md:text-2xl text-white/80 mb-8 leading-relaxed"
        >
          Transform your business with powerful analytics, intelligent automation,
          and actionable insights that drive real results.
        </motion.p>
        
        <motion.div
          variants={staggerItem}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            to="/dashboard"
            className="inline-flex items-center px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Get Started
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          
          <Link
            to="/demo"
            className="inline-flex items-center px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-gray-900 transition-colors duration-200"
          >
            View Demo
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Link>
        </motion.div>
      </motion.div>
    </div>
    
    {/* Floating elements */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{
          y: [-20, 20, -20],
          x: [-10, 10, -10],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"
      />
      <motion.div
        animate={{
          y: [20, -20, 20],
          x: [10, -10, 10],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-20 right-20 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"
      />
    </div>
  </section>
);

const MetricsSection: React.FC = () => (
  <section className="py-20 relative z-10">
    <div className="container mx-auto px-4">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <motion.h2
          variants={staggerItem}
          className="text-4xl md:text-5xl font-bold text-white mb-6"
        >
          Real-time Insights
        </motion.h2>
        <motion.p
          variants={staggerItem}
          className="text-xl text-white/70 max-w-2xl mx-auto"
        >
          Monitor your key performance indicators and make data-driven decisions
          with our comprehensive analytics platform.
        </motion.p>
      </motion.div>
      
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {heroMetrics.map((metric) => (
          <motion.div
            key={metric.id}
            variants={staggerItem}
            className="transform hover:scale-105 transition-transform duration-200"
          >
            <GlassCard intensity="medium" tint="neutral" animatedBorder>
              <MetricCard
                value={metric.value}
                label={metric.label}
                delta={metric.delta}
                trend={metric.trend}
                sparklineData={metric.sparklineData}
                color={metric.color}
                icon={metric.icon}
                size="md"
                ariaLabel={`${metric.label}: ${metric.value}${metric.delta ? `, ${metric.delta.value > 0 ? 'up' : 'down'} ${Math.abs(metric.delta.value)}% ${metric.delta.period}` : ''}`}
              />
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

const FeaturesSection: React.FC = () => (
  <section className="py-20 relative z-10">
    <div className="container mx-auto px-4">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <motion.h2
          variants={staggerItem}
          className="text-4xl md:text-5xl font-bold text-white mb-6"
        >
          Powerful Features
        </motion.h2>
        <motion.p
          variants={staggerItem}
          className="text-xl text-white/70 max-w-3xl mx-auto"
        >
          Discover the tools and capabilities that will transform how you work
          and help you achieve better results faster.
        </motion.p>
      </motion.div>
      
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {featureHighlights.map((feature) => (
          <motion.div
            key={feature.id}
            variants={staggerItem}
            className="group"
          >
            <Link
              to={feature.href}
              className="block h-full"
            >
              <GlassCard 
                intensity="light" 
                tint="neutral" 
                interactive
                className="h-full p-8 text-center group-hover:scale-105 transition-transform duration-300"
              >
                <div className="text-blue-400 mb-6 flex justify-center">
                  {feature.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-white/70 leading-relaxed mb-6">
                  {feature.description}
                </p>
                
                <div className="inline-flex items-center text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
                  Learn more
                  <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

const CTASection: React.FC = () => (
  <section className="py-20 relative z-10">
    <div className="container mx-auto px-4">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center"
      >
        <GlassCard intensity="medium" tint="primary" className="p-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          
          <p className="text-xl text-white/80 mb-8 leading-relaxed">
            Join thousands of businesses that trust {config.appName} to drive their success.
            Start your free trial today and experience the difference.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Start Free Trial
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-gray-900 transition-colors duration-200"
            >
              Contact Sales
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  </section>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const HomePage: React.FC = () => {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <GradientBackground
        variant="aurora"
        showShapes
        enableParallax
        parallaxIntensity={0.4}
        animateGradient
        animationSpeed={0.5}
        className="fixed inset-0 z-0"
      />
      
      {/* Content */}
      <div className="relative z-10">
        <HeroSection />
        <MetricsSection />
        <FeaturesSection />
        <CTASection />
      </div>
      
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>
      
      {/* Main content landmark */}
      <div id="main-content" className="sr-only">
        Main content starts here
      </div>
    </main>
  );
};

export default HomePage;

// ============================================================================
// Self-Check Comments
// ============================================================================
// [x] Uses `@/` imports only - All imports use @/ paths
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Pure React component with proper hooks
// [x] Reads config from `@/app/config` - Uses config.appName for branding
// [x] Exports default named component - Exports HomePage as both named and default
// [x] Adds basic ARIA and keyboard handlers (where relevant) - Includes skip links, landmarks, ARIA labels on interactive elements, and semantic HTML structure
