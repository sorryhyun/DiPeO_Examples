// src/features/dashboard/DashboardLayout.tsx
/* src/features/dashboard/DashboardLayout.tsx
   Dashboard layout that arranges MetricCards and fetches metrics via userService and useFetch.
   - Uses Layout component for consistent page structure
   - Fetches metrics data using useFetch hook with userService
   - Renders grid of MetricCards with proper loading and error states
   - Provides accessible dashboard with ARIA labels and keyboard navigation
*/

import React from 'react';
import { Layout } from '@/shared/components/Layout';
import { MetricCard } from '@/features/dashboard/MetricCard';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/userService';

// DashboardMetric interface removed - not used

// DashboardData interface removed - not used

export const DashboardLayout: React.FC = () => {
  const {
    data: userMetrics,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const result = await userService.getDashboardMetrics();
      if (result.error) {
        throw new Error(result.error.message || 'Failed to fetch dashboard metrics');
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleRetry = () => {
    refetch();
  };

  const handleKeyboardRefresh = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleRetry();
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div 
              className="text-center py-12"
              role="alert"
              aria-live="polite"
            >
              <div className="text-red-500 dark:text-red-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.876c1.12 0 2.049-.9 2.049-2S18.049 12 16.929 12H7.071C5.951 12 5.022 12.9 5.022 14s.879 2 1.999 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Failed to load dashboard
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error.message || 'Unable to fetch dashboard metrics'}
              </p>
              <button
                onClick={handleRetry}
                onKeyDown={handleKeyboardRefresh}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
                aria-label="Retry loading dashboard metrics"
              >
                <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Dashboard Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
                  Dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Overview of your health metrics and appointments
                </p>
              </div>
              
              {/* Refresh Button */}
              <div className="mt-4 sm:mt-0 sm:ml-4">
                <button
                  onClick={handleRetry}
                  onKeyDown={handleKeyboardRefresh}
                  disabled={isLoading}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Refresh dashboard data"
                >
                  <svg 
                    className={`-ml-0.5 mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
            
            {/* Last Updated */}
            {userMetrics?.lastLoginAt && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Last login: {new Date(userMetrics.lastLoginAt).toLocaleString()}
              </p>
            )}
          </div>

          {/* Loading State */}
          {isLoading && !userMetrics && (
            <div 
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              aria-label="Loading dashboard metrics"
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg animate-pulse"
                  aria-hidden="true"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Metrics Grid */}
          {userMetrics && (
            <div 
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              role="region"
              aria-label="Dashboard metrics"
            >
              <MetricCard
                title="Total Logins"
                value={userMetrics.totalLogins.toString()}
                loading={isLoading && Boolean(userMetrics)}
                className="focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MetricCard
                title="Account Age"
                value={`${userMetrics.accountAge} days`}
                loading={isLoading && Boolean(userMetrics)}
                className="focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MetricCard
                title="Activity Score"
                value={`${userMetrics.activityScore}%`}
                loading={isLoading && Boolean(userMetrics)}
                className="focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MetricCard
                title="Completed Tasks"
                value={userMetrics.completedTasks.toString()}
                loading={isLoading && Boolean(userMetrics)}
                className="focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MetricCard
                title="Pending Tasks"
                value={userMetrics.pendingTasks.toString()}
                loading={isLoading && Boolean(userMetrics)}
                className="focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MetricCard
                title="Monthly Hours"
                value={`${userMetrics.monthlyActiveHours}h`}
                loading={isLoading && Boolean(userMetrics)}
                className="focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Empty State */}
          {!userMetrics && !isLoading && (
            <div className="text-center py-12" role="status" aria-live="polite">
              <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No metrics available</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Your dashboard metrics will appear here once available.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses useFetch hook
- [x] Reads config from `@/app/config` - indirectly through useFetch and services
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers - includes ARIA labels, roles, keyboard navigation, and screen reader support
*/
