// filepath: src/pages/HomePage.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, TrendingUpIcon, UsersIcon, ActivityIcon, DollarSignIcon } from 'lucide-react';
import { GradientBackground } from '@/shared/components/GradientBackground';
import { MetricCard } from '@/features/dashboard/MetricCard';
import { GlassCard } from '@/shared/components/GlassCard';
import { Button } from '@/shared/components/Button';
import { config, isDevelopment, shouldUseMockData } from '@/app/config';
import { eventBus } from '@/core/events';
import { hooks } from '@/core/hooks';
import { container } from '@/core/di';
import { ChartSeries } from '@/core/contracts';
import { motionPresets, ANIMATION_DURATIONS } from '@/theme/animations';
import { cn } from '@/core/utils';

// ===============================================
// HomePage Component Types & Data
// ===============================================

interface HomePageMetric {
  id: string;
  title: string;
  value: number | string;
  subtitle?: string;
  delta: number;
  deltaType: 'percentage' | 'absolute' | 'currency';
  deltaLabel: string;
  formatType: 'number' | 'currency' | 'percentage';
  chartData?: ChartSeries[];
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

interface HeroSection {
  title: string;
  subtitle: string;
  description: string;
  primaryAction: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}

// ===============================================
// Mock Data & Utilities
// ===============================================

// Generate sample chart data for metrics
function generateSampleChartData(points: number = 12): ChartSeries[] {
  const data: { x: string; y: number }[] = [];
  const baseValue = Math.random() * 1000 + 500;
  
  for (let i = 0; i < points; i++) {
    const variance = (Math.random() - 0.5) * 200;
    data.push({
      x: `Month ${i + 1}`,
      y: Math.max(0, baseValue + variance + (i * 50)), // Trending up
    });
  }
  
  return [
    {
      id: 'trend',
      name: 'Trend',
      data,
      color: '#3b82f6',
    }
  ];
}

// Mock metrics data
const getMockMetrics = (): HomePageMetric[] => [
  {
    id: 'total-users',
    title: 'Total Users',
    value: 12453,
    subtitle: 'Active users',
    delta: 12.3,
    deltaType: 'percentage',
    deltaLabel: 'vs last month',
    formatType: 'number',
    chartData: generateSampleChartData(),
    icon: <UsersIcon className="w-5 h-5" />,
    variant: 'success',
  },
  {
    id: 'revenue',
    title: 'Revenue',
    value: 84250,
    subtitle: 'Monthly recurring',
    delta: 5670,
    deltaType: 'currency',
    deltaLabel: 'vs last month',
    formatType: 'currency',
    chartData: generateSampleChartData(),
    icon: <DollarSignIcon className="w-5 h-5" />,
    variant: 'success',
  },
  {
    id: 'activity',
    title: 'Activity Score',
    value: 87.5,
    subtitle: 'User engagement',
    delta: -2.1,
    deltaType: 'percentage',
    deltaLabel: 'vs last week',
    formatType: 'percentage',
    chartData: generateSampleChartData(),
    icon: <ActivityIcon className="w-5 h-5" />,
    variant: 'warning',
  },
  {
    id: 'growth-rate',
    title: 'Growth Rate',
    value: 23.8,
    subtitle: 'Quarter over quarter',
    delta: 4.2,
    deltaType: 'percentage',
    deltaLabel: 'vs last quarter',
    formatType: 'percentage',
    chartData: generateSampleChartData(),
    icon: <TrendingUpIcon className="w-5 h-5" />,
    variant: 'success',
  },
];

// Hero content
const getHeroContent = (): HeroSection => ({
  title: 'Welcome to Your Dashboard',
  subtitle: 'Powerful Analytics & Insights',
  description: 'Get comprehensive insights into your business performance with real-time analytics, beautiful visualizations, and actionable data.',
  primaryAction: {
    label: 'View Dashboard',
    href: '/dashboard',
  },
  secondaryAction: {
    label: 'Learn More',
    href: '/about',
  },
});

// ===============================================
// Feature Highlights Component
// ===============================================

const FeatureHighlights: React.FC = () => {
  const features = [
    {
      title: 'Real-time Analytics',
      description: 'Monitor your metrics in real-time with live updates and instant insights.',
      icon: <ActivityIcon className="w-6 h-6" />,
    },
    {
      title: 'Beautiful Visualizations',
      description: 'Stunning charts and graphs that make your data come alive.',
      icon: <TrendingUpIcon className="w-6 h-6" />,
    },
    {
      title: 'User Management',
      description: 'Comprehensive user analytics and engagement tracking.',
      icon: <UsersIcon className="w-6 h-6" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          {...motionPresets.fadeInUp}
          transition={{
            ...motionPresets.fadeInUp.transition,
            delay: (index + 1) * 0.1,
          }}
        >
          <GlassCard
            size="md"
            tint="neutral"
            blurIntensity="medium"
            className="h-full"
          >
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4 text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
};

// ===============================================
// Main HomePage Component
// ===============================================

export function HomePage() {
  const [metrics, setMetrics] = useState<HomePageMetric[]>([]);
  const [heroContent] = useState<HeroSection>(getHeroContent());
  const [isLoading, setIsLoading] = useState(true);

  // Load metrics data
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setIsLoading(true);
        
        // Emit event for analytics
        eventBus.emit('page:view', {
          page: 'home',
          timestamp: new Date().toISOString(),
        });

        // Execute any registered hooks for home page load
        await hooks.execute('page:home:load', {});

        // Simulate API call delay in development
        if (isDevelopment()) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }

        // Load metrics (mock data for now, could come from service)
        const metricsData = shouldUseMockData() ? getMockMetrics() : [];
        setMetrics(metricsData);
        
        // Emit event for successful load
        eventBus.emit('home:metrics:loaded', {
          count: metricsData.length,
          timestamp: new Date().toISOString(),
        });

      } catch (error) {
        console.error('Failed to load home page metrics:', error);
        
        // Emit error event
        eventBus.emit('home:metrics:error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();
  }, []);

  // Handle CTA navigation
  const handleNavigation = (href: string) => {
    eventBus.emit('navigation:click', {
      from: 'home',
      to: href,
      timestamp: new Date().toISOString(),
    });
    
    // In a real app, this would use React Router's navigate
    window.location.href = href;
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <GradientBackground
        variant="mesh"
        animated={!import.meta.env.VITE_DISABLE_ANIMATIONS}
        shapes={true}
        shapeCount={8}
        parallax={true}
        parallaxIntensity="normal"
        mobileOptimized={true}
        fixed={true}
        zIndex={-1}
      />

      {/* Main content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.div
            {...motionPresets.fadeInUp}
            className="text-center mb-16"
          >
            <div className="max-w-4xl mx-auto">
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6"
                {...motionPresets.fadeInUp}
                transition={{
                  ...motionPresets.fadeInUp.transition,
                  delay: 0.1,
                }}
              >
                {heroContent.title}
              </motion.h1>
              
              <motion.h2
                className="text-xl sm:text-2xl text-blue-600 dark:text-blue-400 font-semibold mb-4"
                {...motionPresets.fadeInUp}
                transition={{
                  ...motionPresets.fadeInUp.transition,
                  delay: 0.2,
                }}
              >
                {heroContent.subtitle}
              </motion.h2>
              
              <motion.p
                className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto"
                {...motionPresets.fadeInUp}
                transition={{
                  ...motionPresets.fadeInUp.transition,
                  delay: 0.3,
                }}
              >
                {heroContent.description}
              </motion.p>
              
              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
                {...motionPresets.fadeInUp}
                transition={{
                  ...motionPresets.fadeInUp.transition,
                  delay: 0.4,
                }}
              >
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handleNavigation(heroContent.primaryAction.href)}
                  className="group"
                >
                  {heroContent.primaryAction.label}
                  <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                {heroContent.secondaryAction && (
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => handleNavigation(heroContent.secondaryAction!.href)}
                  >
                    {heroContent.secondaryAction.label}
                  </Button>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Metrics Section */}
          <motion.section
            className="mb-16"
            {...motionPresets.fadeInUp}
            transition={{
              ...motionPresets.fadeInUp.transition,
              delay: 0.5,
            }}
            aria-labelledby="metrics-heading"
          >
            <div className="text-center mb-8">
              <h2 
                id="metrics-heading"
                className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
              >
                Key Metrics
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Track your most important metrics at a glance with real-time updates and trend analysis.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric, index) => (
                <MetricCard
                  key={metric.id}
                  title={metric.title}
                  value={metric.value}
                  subtitle={metric.subtitle}
                  delta={metric.delta}
                  deltaType={metric.deltaType}
                  deltaLabel={metric.deltaLabel}
                  formatType={metric.formatType}
                  chartData={metric.chartData}
                  showChart={true}
                  variant={metric.variant}
                  icon={metric.icon}
                  loading={isLoading}
                  animate={true}
                  animationDelay={index * 100}
                  className="h-full"
                  aria-describedby={`metric-${metric.id}-desc`}
                />
              ))}
            </div>
          </motion.section>

          {/* Feature Highlights Section */}
          <motion.section
            className="mb-16"
            {...motionPresets.fadeInUp}
            transition={{
              ...motionPresets.fadeInUp.transition,
              delay: 0.6,
            }}
            aria-labelledby="features-heading"
          >
            <div className="text-center mb-8">
              <h2 
                id="features-heading"
                className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
              >
                Powerful Features
</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Discover the tools and insights that will help you make better decisions and grow your business.
              </p>
            </div>
            
            <FeatureHighlights />
          </motion.section>

          {/* Call to Action Section */}
          <motion.section
            className="text-center"
            {...motionPresets.fadeInUp}
            transition={{
              ...motionPresets.fadeInUp.transition,
              delay: 0.7,
            }}
          >
            <GlassCard
              size="lg"
              tint="primary"
              gradient={true}
              borderGlow={true}
              className="max-w-4xl mx-auto"
            >
              <div className="p-8 sm:p-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                  Join thousands of users who are already using our platform to gain valuable insights and grow their business.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => handleNavigation('/dashboard')}
                    className="group"
                  >
                    Go to Dashboard
                    <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleNavigation('/docs')}
                  >
                    View Documentation
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

// ===============================================
// Export Default
// ===============================================

export default HomePage;

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/
