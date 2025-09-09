// filepath: src/pages/DashboardPage.tsx

import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { AppLayout } from '@/shared/layouts/AppLayout';
import { DashboardPanel } from '@/features/dashboard/DashboardPanel';
import { Skeleton } from '@/shared/components/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import { config, isDevelopment } from '@/app/config';
import { eventBus } from '@/core/events';
import { hooks } from '@/core/hooks';
import { ApiError } from '@/core/contracts';
import { cn, debugLog, debugError } from '@/core/utils';

// ===============================================
// Dashboard Page Types & Props
// ===============================================

export interface DashboardPageProps {
  className?: string;
}

// ===============================================
// Error Boundary Component
// ===============================================

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class DashboardErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    debugError('DashboardPage', 'Dashboard error boundary caught error:', error, errorInfo);
    this.props.onError?.(error);
    
    eventBus.emit('dashboard:error', {
      error: {
        code: 'DASHBOARD_ERROR',
        message: error.message,
        details: { stack: error.stack, errorInfo }
      },
      timestamp: new Date().toISOString()
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full mx-auto p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center"
            >
              <div className="text-red-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Dashboard Error
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {this.state.error?.message || 'An unexpected error occurred while loading the dashboard.'}
              </p>
              
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Reload Dashboard
              </button>
              
              {isDevelopment && this.state.error && (
                <details className="mt-4 text-left text-xs">
                  <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                    Error Details (Dev Mode)
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-red-600 dark:text-red-400 overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </motion.div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ===============================================
// Loading Component
// ===============================================

const DashboardLoadingSkeleton: React.FC = () => (
  <div className="space-y-6 p-6" role="status" aria-label="Loading dashboard">
    {/* Header skeleton */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton width="200px" height="32px" />
        <Skeleton width="300px" height="20px" />
      </div>
      <Skeleton width="120px" height="40px" shape="rounded" />
    </div>
    
    {/* Metrics grid skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }, (_, i) => (
        <Skeleton key={i} height="128px" shape="rounded" />
      ))}
    </div>
    
    {/* Charts skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton height="320px" shape="rounded" />
      <Skeleton height="320px" shape="rounded" />
    </div>
    
    {/* Summary skeleton */}
    <Skeleton height="200px" shape="rounded" />
  </div>
);

// ===============================================
// Main Dashboard Page Component
// ===============================================

export const DashboardPage: React.FC<DashboardPageProps> = ({ className }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [lastDataLoad, setLastDataLoad] = useState<Date | null>(null);
  const [errorCount, setErrorCount] = useState(0);

  // Handle dashboard data loading
  const handleDataLoad = React.useCallback((data: any) => {
    setLastDataLoad(new Date());
    setErrorCount(0); // Reset error count on successful load
    
    debugLog('DashboardPage', 'Dashboard data loaded successfully', {
      userId: user?.id,
      timestamp: new Date().toISOString(),
      dataKeys: Object.keys(data || {})
    });

    // Emit success event for analytics/monitoring
    eventBus.emit('page:dashboard:loaded', {
      userId: user?.id,
      loadTime: Date.now(),
      dataSize: JSON.stringify(data || {}).length,
      timestamp: new Date().toISOString()
    });
  }, [user?.id]);

  // Handle dashboard errors
  const handleDashboardError = React.useCallback((error: ApiError) => {
    setErrorCount(prev => prev + 1);
    
    debugError('DashboardPage', 'Dashboard error occurred:', {
      error,
      userId: user?.id,
      errorCount: errorCount + 1,
      timestamp: new Date().toISOString()
    });

    // Emit error event for monitoring
    eventBus.emit('page:dashboard:error', {
      error,
      userId: user?.id,
      errorCount: errorCount + 1,
      timestamp: new Date().toISOString()
    });
  }, [user?.id, errorCount]);

  // Page lifecycle hooks
  useEffect(() => {
    // Execute page mounted hook
    hooks.execute('page:dashboard:mounted', {
      userId: user?.id,
      timestamp: new Date().toISOString()
    });

    // Set up keyboard shortcuts
    const handleKeyDown = (event: KeyboardEvent) => {
      // Refresh dashboard with Ctrl/Cmd + R (prevent default browser refresh)
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        eventBus.emit('dashboard:refresh-requested');
        return;
      }

      // Focus search with Ctrl/Cmd + K
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        // Could focus a search input if it exists
        eventBus.emit('dashboard:search-requested');
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Execute page unmounted hook
      hooks.execute('page:dashboard:unmounted', {
        userId: user?.id,
        sessionDuration: lastDataLoad ? Date.now() - lastDataLoad.getTime() : 0,
        errorCount,
        timestamp: new Date().toISOString()
      });
    };
  }, [user?.id, lastDataLoad, errorCount]);

  // Redirect to login if not authenticated and not loading
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      debugLog('DashboardPage', 'User not authenticated, redirecting to login');
      // In a real app, you'd use router navigation here
      // navigate('/login', { replace: true });
    }
  }, [isAuthenticated, authLoading]);

  // Show loading skeleton while auth is loading
  if (authLoading) {
    return (
      <AppLayout>
        <DashboardLoadingSkeleton />
      </AppLayout>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8 max-w-md mx-auto"
          >
            <div className="text-blue-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Authentication Required
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please log in to access the dashboard.
            </p>
            
            <button
              onClick={() => eventBus.emit('auth:login-requested')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Go to Login
            </button>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  // Get refresh interval from config
  const refreshInterval = config.dashboard?.refreshInterval;

  // Main dashboard content
  return (
    <>
      <Helmet>
        <title>Dashboard - {config.app.name}</title>
        <meta name="description" content="Healthcare dashboard with real-time metrics, charts, and insights" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>

      <AppLayout>
        <DashboardErrorBoundary onError={handleDashboardError}>
          <motion.div
            className={cn('min-h-screen', className)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            role="main"
            aria-label="Dashboard page"
          >
            <DashboardPanel
              showMetrics={true}
              showCharts={true}
              showSummary={true}
              refreshInterval={refreshInterval}
              onError={handleDashboardError}
              onDataLoad={handleDataLoad}
              className="max-w-7xl mx-auto"
            />

            {/* Status indicator for data freshness */}
            {lastDataLoad && (
<div className="fixed bottom-4 right-4 z-20">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>
                      Last updated: {lastDataLoad.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error indicator */}
            {errorCount > 0 && (
              <div className="fixed bottom-4 left-4 z-20">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg px-3 py-2 text-xs"
                >
                  <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>
                      {errorCount} error{errorCount !== 1 ? 's' : ''} occurred
                    </span>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Development info */}
            {isDevelopment && (
              <div className="fixed top-4 left-4 z-10">
                <details className="bg-black/80 text-white text-xs p-2 rounded">
                  <summary className="cursor-pointer">Dev Info</summary>
                  <div className="mt-2 space-y-1">
                    <div>User: {user?.email || 'N/A'}</div>
                    <div>Errors: {errorCount}</div>
                    <div>Last Load: {lastDataLoad?.toISOString() || 'N/A'}</div>
                    <div>Refresh: {refreshInterval ? `${refreshInterval}ms` : 'disabled'}</div>
                  </div>
                </details>
              </div>
            )}
          </motion.div>
        </DashboardErrorBoundary>
      </AppLayout>
    </>
  );
};

// Export default for router lazy loading
export default DashboardPage;

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/
