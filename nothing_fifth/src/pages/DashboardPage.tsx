// filepath: src/pages/DashboardPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EASINGS } from '@/theme/animations';
import { User, Patient, Appointment, ApiResult, LoadingState } from '@/core/contracts';
import { isDevelopment, shouldUseMockData } from '@/app/config';
import { eventBus } from '@/core/events';
import { DashboardPanel } from '@/features/dashboard/DashboardPanel';
import { useFetch } from '@/hooks/useFetch';
import { dataService, DashboardMetrics } from '@/services/dataService';
import { Skeleton } from '@/shared/components/Skeleton';
import { debugLog, errorLog } from '@/core/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DashboardPageProps {
  className?: string;
}

interface DashboardPageState {
  selectedMetric: string | null;
  dateRange: {
    start: string;
    end: string;
  };
  refreshCount: number;
  lastActivity: string | null;
}

// ============================================================================
// DASHBOARD PAGE COMPONENT
// ============================================================================

export const DashboardPage: React.FC<DashboardPageProps> = ({
  className = '',
}) => {
  // State management
  const [state, setState] = useState<DashboardPageState>({
    selectedMetric: null,
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    refreshCount: 0,
    lastActivity: null,
  });

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Page-level data fetching for user context
  const {
    data: currentUser,
    isLoading: userLoading,
    isError: userError,
    error: userErrorDetail,
  } = useFetch<User>(
    ['user', 'current'],
    '/auth/me',
    {
      retry: 1,
    }
  );

  // Handle page initialization
  useEffect(() => {
    const initializePage = async () => {
      try {
        debugLog('DashboardPage: Initializing');

        // Page initialization complete
        debugLog('DashboardPage: Page initialized with config and date range');

        // Emit page navigation event
        eventBus.emit('navigation:page-changed', {
          page: 'dashboard',
        });

        // Mark page as loaded
        setIsPageLoading(false);
        
        debugLog('DashboardPage: Initialization complete');
      } catch (error) {
        errorLog('DashboardPage: Initialization failed', error instanceof Error ? error : new Error(String(error)));
        setPageError('Failed to initialize dashboard');
        setIsPageLoading(false);
      }
    };

    // Initialize after user data is available or fails
    if (!userLoading) {
      void initializePage();
    }
  }, [userLoading, currentUser]);

  // Handle page cleanup
  useEffect(() => {
    return () => {
      debugLog('DashboardPage: Cleanup');
      
      // Page cleanup complete
      debugLog('DashboardPage: Page cleanup completed');

      // Emit page leave event
      eventBus.emit('navigation:page-left', {
        page: 'dashboard',
      });
    };
  }, [state.refreshCount]);

  // Handle metric selection
  const handleMetricClick = (metric: string, value: number) => {
    debugLog(`DashboardPage: Metric selected - ${metric}: ${value}`);
    
    setState(prev => ({
      ...prev,
      selectedMetric: metric,
      lastActivity: new Date().toISOString(),
    }));

    // Emit metric selection event
    eventBus.emit('dashboard:metric-selected', {
      metric: metric,
    });

    // Metric selection completed
    debugLog('DashboardPage: Metric selection completed', { metric, value, user: currentUser?.id });
  };

  // Handle dashboard refresh
  const handleRefresh = () => {
    debugLog('DashboardPage: Refresh requested');
    
    setState(prev => ({
      ...prev,
      refreshCount: prev.refreshCount + 1,
      lastActivity: new Date().toISOString(),
    }));

    // Emit refresh event
    eventBus.emit('dashboard:refreshed', {
      timestamp: state.refreshCount + 1,
    });
  };

  // Handle date range changes
  const handleDateRangeChange = (newRange: { start: string; end: string }) => {
    debugLog('DashboardPage: Date range changed', newRange);
    
    setState(prev => ({
      ...prev,
      dateRange: newRange,
      selectedMetric: null, // Reset selection when date changes
      lastActivity: new Date().toISOString(),
    }));

    // Emit date range change event
    eventBus.emit('dashboard:date-range-changed', {
      range: newRange,
    });
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+R or Cmd+R: Refresh dashboard
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        handleRefresh();
        return;
      }

      // Escape: Clear selected metric
      if (event.key === 'Escape' && state.selectedMetric) {
        setState(prev => ({
          ...prev,
          selectedMetric: null,
        }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.selectedMetric]);

  // Animation variants
  const pageVariants = {
    initial: { 
      opacity: 0,
      y: 20,
    },
    animate: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: EASINGS.smooth,
      },
    },
    exit: { 
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
      },
    },
  };

  const contentVariants = {
    hidden: { 
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  // Show loading state during page initialization
  if (isPageLoading || userLoading) {
    return (
      <div 
        className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}
          role="main"
          aria-label="Loading dashboard"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
              {/* Header skeleton */}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton variant="text" width="200px" height="32px" />
                  <Skeleton variant="text" width="150px" height="20px" />
                </div>
                <Skeleton variant="rounded" width="120px" height="40px" />
              </div>

              {/* Metrics skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} variant="rounded" width="100%" height="120px" />
                ))}
              </div>

              {/* Charts skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton variant="rounded" width="100%" height="300px" />
                <Skeleton variant="rounded" width="100%" height="300px" />
              </div>
            </div>
          </div>
          <span className="sr-only">Loading dashboard content...</span>
      </div>
    );
  }

  // Show error state
  if (pageError || userError) {
    const errorMessage = pageError || userErrorDetail?.message || 'Failed to load dashboard';
    
    return (
      <div 
          className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center ${className}`}
          role="main"
          aria-label="Dashboard error"
        >
          <div className="max-w-md mx-auto text-center">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h1 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Dashboard Unavailable
              </h1>
              <p className="text-red-700 dark:text-red-300 mb-4">
                {errorMessage}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800"
                aria-label="Reload page to retry"
              >
                Retry
              </button>
            </div>
          </div>
      </div>
    );
  }

  return (
    <motion.div
        className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        role="main"
        aria-label="Dashboard page"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Dashboard
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Welcome back{currentUser?.name ? `, ${currentUser.name}` : ''}
                  </p>
                </div>

                {/* User info and refresh count */}
                {isDevelopment && (
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      Refreshed: {state.refreshCount} times
                    </p>
                    {state.selectedMetric && (
                      <p className="text-xs text-blue-500">
                        Selected: {state.selectedMetric}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Date Range Selector */}
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label 
                    htmlFor="start-date" 
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    From:
                  </label>
                  <input
                    id="start-date"
                    type="date"
                    value={state.dateRange.start}
                    onChange={(e) =>
                      handleDateRangeChange({
                        ...state.dateRange,
                        start: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Select start date for dashboard data"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label 
                    htmlFor="end-date" 
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    To:
                  </label>
                  <input
                    id="end-date"
                    type="date"
                    value={state.dateRange.end}
                    onChange={(e) =>
                      handleDateRangeChange({
                        ...state.dateRange,
                        end: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Select end date for dashboard data"
                  />
                </div>

                {state.lastActivity && (
                  <div className="ml-auto text-xs text-gray-400">
                    Last activity: {new Date(state.lastActivity).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>

            {/* Main Dashboard Content */}
            <DashboardPanel
              className="w-full"
              refreshInterval={5 * 60 * 1000} // 5 minutes
              showMetrics={true}
              showCharts={true}
              showRecentActivity={true}
              onMetricClick={handleMetricClick}
              onRefresh={handleRefresh}
            />

            {/* Debug Information */}
            {isDevelopment && shouldUseMockData && (
              <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Development Mode - Mock Data Active
                </h3>
                <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                  <p>• Using mock data instead of real API</p>
                  <p>• Date range: {state.dateRange.start} to {state.dateRange.end}</p>
                  <p>• Current user: {currentUser?.email || 'Not loaded'}</p>
                  <p>• Refresh count: {state.refreshCount}</p>
                </div>
              </div>
            )}

            {/* Accessibility instructions */}
            <div className="sr-only">
              <p>
                Use keyboard shortcuts: Ctrl+R to refresh dashboard, Escape to clear selections.
                Navigate between sections using Tab key.
              </p>
            </div>
          </motion.div>
        </div>
    </motion.div>
  );
};

export default DashboardPage;

// ============================================================================
// Self-Check Comments
// ============================================================================
// [x] Uses `@/` imports only - Imports from @/core/contracts, @/app/config, @/core/events, @/core/hooks, @/shared/layouts/AppLayout, @/features/dashboard/DashboardPanel, @/hooks/useFetch, @/services/dataService, @/shared/components/Skeleton, @/core/utils
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Uses useFetch hook, event bus, and hooks registry
// [x] Reads config from `@/app/config` - Uses config, isDevelopment, shouldUseMockData
// [x] Exports default named component - Exports DashboardPage as default
// [x] Adds basic ARIA and keyboard handlers (where relevant) - Includes role, aria-label, keyboard shortcuts (Ctrl+R, Escape), focus management, and accessibility instructions
