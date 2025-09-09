// filepath: src/features/dashboard/DashboardPanel.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, debugLog, debugError, formatNumber } from '@/core/utils';
import { config, isDevelopment, shouldUseMockData } from '@/app/config';
import { eventBus } from '@/core/events';
import { ChartSeries, ApiError } from '@/core/contracts';
import { useFetch } from '@/hooks/useFetch';
import { dataService } from '@/services/dataService';
import { MetricCard } from '@/features/dashboard/MetricCard';
import { BarChart } from '@/shared/charts/BarChart';
import { Skeleton, CardSkeleton, ArticleSkeleton } from '@/shared/components/Skeleton';
import { toastError, toastSuccess } from '@/shared/components/Toast';
import { fadeInUp, stagger } from '@/theme/animations';

// ===============================================
// Dashboard Panel Types & Props
// ===============================================

export interface DashboardPanelProps {
  className?: string;
  showMetrics?: boolean;
  showCharts?: boolean;
  showSummary?: boolean;
  refreshInterval?: number;
  onError?: (error: ApiError) => void;
  onDataLoad?: (data: any) => void;
}

interface DashboardData {
  metrics: {
    totalPatients: number;
    totalAppointments: number;
    totalDoctors: number;
    pendingResults: number;
    appointmentsToday: number;
    appointmentsThisWeek: number;
    revenueThisMonth: number;
    growthPercentage: number;
  };
  appointmentStats: {
    completed: number;
    scheduled: number;
    cancelled: number;
    noShow: number;
    total: number;
  };
  revenueData: ChartSeries;
  patientGrowth: ChartSeries;
  appointmentTrends: ChartSeries[];
}

// ===============================================
// Chart Configuration
// ===============================================

const CHART_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
];

const formatChartValue = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
};

// ===============================================
// Error Boundary Component
// ===============================================

interface ErrorDisplayProps {
  error: ApiError;
  onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => (
  <motion.div
    className="p-6 text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.2 }}
  >
    <div className="text-red-600 dark:text-red-400 mb-2">
      <svg className="w-12 h-12 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
      Failed to Load Dashboard Data
    </h3>
    <p className="text-red-600 dark:text-red-400 mb-4">
      {error.message || 'An unexpected error occurred while loading the dashboard.'}
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
      >
        Try Again
      </button>
    )}
  </motion.div>
);

// ===============================================
// Main Dashboard Panel Component
// ===============================================

export const DashboardPanel: React.FC<DashboardPanelProps> = ({
  className,
  showMetrics = true,
  showCharts = true,
  showSummary = true,
  refreshInterval,
  onError,
  onDataLoad,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch dashboard data using custom hook
  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useFetch<DashboardData>(
    ['dashboard', 'overview', refreshKey.toString()],
    '/dashboard/overview',
    {
      enabled: true,
      refetchInterval: refreshInterval,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      onSuccess: (data) => {
        debugLog('DashboardPanel', 'Dashboard data loaded successfully');
        onDataLoad?.(data);
        eventBus.emit('dashboard:data-loaded', { data });
      },
      onError: (err) => {
        debugError('DashboardPanel', 'Dashboard data loading failed:', err);
        onError?.(err);
        toastError('Failed to load dashboard data. Please try refreshing the page.');
      },
    }
  );

  // Fetch revenue data for selected period
  const {
    data: periodRevenueData,
    isLoading: isRevenueLoading,
  } = useFetch<ChartSeries>(
    ['dashboard', 'revenue', selectedPeriod, refreshKey.toString()],
    `/dashboard/revenue?period=${selectedPeriod}`,
    {
      enabled: showCharts,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    try {
      debugLog('DashboardPanel', 'Manual refresh triggered');
      setRefreshKey(prev => prev + 1);
      await refetch();
      toastSuccess('Dashboard data refreshed successfully');
    } catch (err) {
      debugError('DashboardPanel', 'Manual refresh failed:', err);
      toastError('Failed to refresh dashboard data');
    }
  }, [refetch]);

  // Handle period change
  const handlePeriodChange = useCallback((period: 'daily' | 'monthly' | 'yearly') => {
    debugLog('DashboardPanel', `Changing revenue period to: ${period}`);
    setSelectedPeriod(period);
  }, []);

  // Listen for external refresh events
  useEffect(() => {
    const unsubscribe = eventBus.subscribe('dashboard:refresh-requested', () => {
      handleRefresh();
    });

    return unsubscribe;
  }, [handleRefresh]);

  // Prepare chart data
  const appointmentChartData = React.useMemo(() => {
    if (!dashboardData?.appointmentTrends) return [];
    
    return dashboardData.appointmentTrends.map((series, index) => ({
      ...series,
      color: series.color || CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [dashboardData?.appointmentTrends]);

  const revenueChartData = React.useMemo(() => {
    const data = periodRevenueData || dashboardData?.revenueData;
    if (!data) return [];

    return [{
      ...data,
      color: data.color || CHART_COLORS[0],
    }];
  }, [periodRevenueData, dashboardData?.revenueData]);

  // Render loading state
  if (isLoading && !dashboardData) {
    return (
      <div className={cn('space-y-6', className)} role="status" aria-label="Loading dashboard">
        {showMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }, (_, i) => (
              <CardSkeleton key={i} className="h-32" />
            ))}
          </div>
        )}
        
        {showCharts && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardSkeleton className="h-80" />
            <CardSkeleton className="h-80" />
          </div>
        )}
        
        {showSummary && (
          <ArticleSkeleton />
        )}
      </div>
    );
  }

  // Render error state
  if (isError && error) {
    return (
      <div className={className}>
        <ErrorDisplay error={error} onRetry={handleRefresh} />
      </div>
    );
  }

  // Render main dashboard content
  return (
    <motion.div
      className={cn('space-y-6', className)}
      role="main"
      aria-label="Dashboard overview"
      {...stagger}
    >
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time insights into your healthcare practice
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {refreshInterval && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Auto-refresh: {Math.floor(refreshInterval / 1000)}s
            </div>
          )}
          
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className={cn(
              'flex items-center px-4 py-2 rounded-lg border transition-colors duration-200',
              'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600',
              'hover:bg-gray-50 dark:hover:bg-gray-700',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isFetching && 'animate-pulse'
            )}
            aria-label={isFetching ? 'Refreshing dashboard' : 'Refresh dashboard'}
          >
            <svg 
              className={cn('w-4 h-4 mr-2', isFetching && 'animate-spin')} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      {showMetrics && dashboardData?.metrics && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          {...fadeInUp}
        >
          <MetricCard
            title="Total Patients"
            value={dashboardData.metrics.totalPatients}
            change={dashboardData.metrics.growthPercentage}
            trend="up"
            icon="users"
            color="blue"
          />
          
          <MetricCard
            title="Appointments Today"
            value={dashboardData.metrics.appointmentsToday}
            subtitle={`${dashboardData.metrics.appointmentsThisWeek} this week`}
            icon="calendar"
            color="green"
          />
          
          <MetricCard
            title="Total Doctors"
            value={dashboardData.metrics.totalDoctors}
            icon="user-md"
            color="purple"
          />
          
          <MetricCard
            title="Pending Results"
            value={dashboardData.metrics.pendingResults}
            icon="clock"
            color="amber"
            urgent={dashboardData.metrics.pendingResults > 20}
          />
          
          <MetricCard
            title="Total Appointments"
            value={dashboardData.metrics.totalAppointments}
            icon="clipboard-list"
            color="indigo"
          />
          
          <MetricCard
            title="Completed"
            value={dashboardData.appointmentStats?.completed || 0}
            subtitle={`${((dashboardData.appointmentStats?.completed || 0) / (dashboardData.appointmentStats?.total || 1) * 100).toFixed(1)}% completion rate`}
            icon="check-circle"
            color="emerald"
          />
          
          <MetricCard
            title="Revenue This Month"
            value={formatNumber(dashboardData.metrics.revenueThisMonth, { style: 'currency', currency: 'USD' })}
            change={dashboardData.metrics.growthPercentage}
            trend="up"
            icon="currency-dollar"
            color="green"
          />
          
          <MetricCard
            title="No Shows"
            value={dashboardData.appointmentStats?.noShow || 0}
            subtitle={`${((dashboardData.appointmentStats?.noShow || 0) / (dashboardData.appointmentStats?.total || 1) * 100).toFixed(1)}% no-show rate`}
            icon="x-circle"
            color="red"
            urgent={(dashboardData.appointmentStats?.noShow || 0) > 10}
          />
        </motion.div>
      )}

      {/* Charts Section */}
      {showCharts && (
        <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" {...fadeInUp}>
          {/* Appointment Trends Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Appointment Trends
              </h3>
            </div>
            
            {appointmentChartData.length > 0 ? (
              <BarChart
                data={appointmentChartData}
                height={300}
                showTooltip
                showLegend
                showGrid
                animate
                colors={CHART_COLORS}
                ariaLabel="Appointment trends bar chart"
                ariaDescription="Shows trends for scheduled, completed, and cancelled appointments over time"
              />
            ) : (
              <Skeleton height="300px" className="w-full" />
            )}
          </div>

          {/* Revenue Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Revenue Overview
              </h3>
              
              <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                {(['daily', 'monthly', 'yearly'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => handlePeriodChange(period)}
                    className={cn(
                      'px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 capitalize',
                      selectedPeriod === period
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    )}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            
            {(isRevenueLoading && !revenueChartData.length) ? (
              <Skeleton height="300px" className="w-full" />
            ) : revenueChartData.length > 0 ? (
              <BarChart
                data={revenueChartData}
                height={300}
                showTooltip
                showGrid
                animate
                colors={[CHART_COLORS[0]]}
                formatValue={formatChartValue}
                ariaLabel={`Revenue chart for ${selectedPeriod} period`}
                ariaDescription={`Shows revenue data over ${selectedPeriod} periods`}
/>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p>No revenue data available</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Summary Section */}
      {showSummary && dashboardData && (
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          {...fadeInUp}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Quick Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {((dashboardData.appointmentStats?.completed || 0) / (dashboardData.appointmentStats?.total || 1) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Appointment Completion Rate
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                {dashboardData.metrics?.growthPercentage > 0 ? '+' : ''}{dashboardData.metrics?.growthPercentage?.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Growth Rate
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {Math.round((dashboardData.metrics?.totalPatients || 0) / (dashboardData.metrics?.totalDoctors || 1))}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Patients per Doctor
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Debug info in development */}
      {isDevelopment && (
        <div className="text-xs text-gray-400 mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded border">
          <strong>Debug Info:</strong> Mock data: {shouldUseMockData ? 'enabled' : 'disabled'} | 
          Refresh interval: {refreshInterval ? `${refreshInterval}ms` : 'disabled'} |
          Data loaded: {!!dashboardData}
        </div>
      )}
    </motion.div>
  );
};

// Export default for convenience
export default DashboardPanel;

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/
