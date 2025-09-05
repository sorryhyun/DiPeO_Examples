// filepath: src/pages/Dashboard/DashboardPage.tsx
import React, { useEffect } from 'react';
import { MainLayout } from '@/shared/layouts/MainLayout';
import { MetricCard } from '@/features/dashboard/widgets/MetricCard';
import { ActivityChart } from '@/features/dashboard/widgets/ActivityChart';
import { useFetch } from '@/hooks/useFetch';
import { globalEventBus } from '@/core/events';
import { config } from '@/app/config';
import { classNames } from '@/core/utils';
import type { MetricData } from '@/features/dashboard/widgets/MetricCard';

interface DashboardMetrics {
  totalUsers: number;
  userGrowth: number;
  revenue: number;
  revenueGrowth: number;
  activeSessions: number;
  sessionGrowth: number;
  conversionRate: number;
  conversionChange: number;
}

interface ActivityData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    color: string;
  }>;
}

interface DashboardPageProps {
  className?: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ className }) => {
  const { data: metrics, loading: metricsLoading, error: metricsError, refetch: refetchMetrics } = useFetch<DashboardMetrics>('/api/dashboard/metrics');
  const { data: activityData, loading: activityLoading, error: activityError, refetch: refetchActivity } = useFetch<ActivityData>('/api/dashboard/activity');

  useEffect(() => {
    // Subscribe to dashboard refresh events
    const unsubscribe = globalEventBus.on('dashboard:refresh', () => {
      refetchMetrics();
      refetchActivity();
    });

    // Emit dashboard viewed event
    globalEventBus.emit('analytics:event', {
      name: 'page_view',
      properties: {
        page: 'dashboard',
        timestamp: Date.now()
      }
    });

    return unsubscribe;
  }, [refetchMetrics, refetchActivity]);

  const handleRefresh = () => {
    globalEventBus.emit('dashboard:refresh', {});
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'r' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleRefresh();
    }
  };

  // Convert metrics to MetricData format
  const metricCards: MetricData[] = metrics ? [
    {
      id: 'total-users',
      title: 'Total Users',
      value: metrics.totalUsers,
      previousValue: metrics.totalUsers - (metrics.totalUsers * metrics.userGrowth / 100),
      format: 'number',
      trend: metrics.userGrowth >= 0 ? 'up' : 'down'
    },
    {
      id: 'revenue',
      title: 'Revenue',
      value: metrics.revenue,
      previousValue: metrics.revenue - (metrics.revenue * metrics.revenueGrowth / 100),
      format: 'currency',
      trend: metrics.revenueGrowth >= 0 ? 'up' : 'down'
    },
    {
      id: 'active-sessions',
      title: 'Active Sessions',
      value: metrics.activeSessions,
      previousValue: metrics.activeSessions - (metrics.activeSessions * metrics.sessionGrowth / 100),
      format: 'number',
      trend: metrics.sessionGrowth >= 0 ? 'up' : 'down'
    },
    {
      id: 'conversion-rate',
      title: 'Conversion Rate',
      value: metrics.conversionRate / 100,
      previousValue: (metrics.conversionRate - metrics.conversionChange) / 100,
      format: 'percentage',
      trend: metrics.conversionChange >= 0 ? 'up' : 'down'
    }
  ] : [];

  if (metricsError || activityError) {
    return (
      <MainLayout>
        <div 
          className={classNames(
            'flex flex-col items-center justify-center',
            'min-h-96 p-8 text-center',
            'bg-red-50 border border-red-200 rounded-lg',
            className
          )}
          role="alert" 
          aria-live="polite"
        >
          <h2 className="text-2xl font-semibold text-red-800 mb-4">
            Dashboard Error
          </h2>
          <p className="text-red-600 mb-6">
            Unable to load dashboard data. Please try again.
          </p>
          <button 
            onClick={handleRefresh}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Refresh dashboard data"
          >
            Retry
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div 
        className={classNames('dashboard-page', className)}
        role="main" 
        aria-label="Dashboard"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Dashboard Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
            <h1 className="text-4xl font-bold text-gray-900">
              Dashboard
            </h1>
            <button
              onClick={handleRefresh}
              className={classNames(
                'mt-4 sm:mt-0 px-6 py-3 bg-blue-600 text-white rounded-lg',
                'font-medium transition-all duration-200',
                'hover:bg-blue-700 hover:-translate-y-0.5',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                'disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none',
                'flex items-center gap-2'
              )}
              aria-label="Refresh dashboard data"
              disabled={metricsLoading || activityLoading}
            >
              <span 
                className={classNames(
                  'text-xl transition-transform duration-1000',
                  (metricsLoading || activityLoading) && 'animate-spin'
                )}
                aria-hidden="true"
              >
                ↻
              </span>
              Refresh
            </button>
          </div>
          <p className="text-lg text-gray-600">
            Welcome back! Here's your overview for today.
          </p>
        </header>

        {/* Metrics Section */}
        <section className="mb-12" aria-label="Key metrics">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Key Metrics
          </h2>
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            role="group"
          >
            {metricsLoading ? (
              <>
                {[...Array(4)].map((_, index) => (
                  <div 
                    key={index}
                    className="h-32 bg-gray-200 rounded-xl animate-pulse"
                    aria-label="Loading metric card"
                  />
                ))}
              </>
            ) : (
              metricCards.map((metric) => (
                <MetricCard
                  key={metric.id}
                  metric={metric}
                  size="md"
                  showSparkline={false}
                  showTrend={true}
                />
              ))
            )}
          </div>
        </section>

        {/* Activity Section */}
        <section className="mb-8" aria-label="Activity overview">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Activity Overview
          </h2>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            {activityLoading ? (
              <div 
                className="h-96 bg-gray-200 rounded-lg animate-pulse"
                aria-label="Loading activity chart"
              />
            ) : activityData ? (
              <ActivityChart
                data={activityData}
                height={400}
                aria-label="Activity chart showing user engagement over time"
              />
            ) : (
              <div 
                className="h-96 flex items-center justify-center text-gray-500"
                role="status"
              >
                <p>No activity data available</p>
              </div>
            )}
          </div>
        </section>

        {/* Debug Section */}
        {config.isDevelopment && (
          <section className="opacity-70" aria-label="Debug information">
            <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                Debug Info
              </summary>
              <pre className="mt-4 text-sm text-gray-600 font-mono overflow-x-auto">
                {JSON.stringify({
                  metricsLoading,
                  activityLoading,
                  hasMetrics: !!metrics,
                  hasActivity: !!activityData,
                  timestamp: new Date().toISOString()
                }, null, 2)}
              </pre>
            </details>
          </section>
        )}
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
