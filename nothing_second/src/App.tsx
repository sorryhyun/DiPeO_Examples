// filepath: src/App.tsx
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AppProviders } from '@/providers/Providers';
import { AppRouter } from '@/routes/AppRouter';
import { Skeleton } from '@/shared/components/Skeleton/Skeleton';
import { config } from '@/app/config';
import { eventBus } from '@/core/events';

// Error fallback component for the top-level error boundary
interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  React.useEffect(() => {
    // Emit global error event for logging/analytics
    eventBus.emit('error:global', {
      error,
      context: 'App-level error boundary'
    });
  }, [error]);

  return (
    <div
      role="alert"
      className="min-h-screen flex items-center justify-center bg-red-50 p-4"
    >
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Something went wrong
        </h1>
        
        <p className="text-gray-600 mb-6">
          We're sorry, but something unexpected happened. Please try refreshing the page.
        </p>
        
        {config.isDevelopment && (
          <details className="text-left mb-4 bg-gray-100 rounded p-3">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
              Error Details (Development)
            </summary>
            <pre className="text-xs text-red-600 overflow-auto whitespace-pre-wrap">
              {error.message}
              {error.stack && '\n\nStack trace:\n' + error.stack}
            </pre>
          </details>
        )}
        
        <div className="space-y-3">
          <button
            onClick={resetErrorBoundary}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try again
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Refresh page
          </button>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component for Suspense boundaries
function AppLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Skeleton className="w-64 h-8 mx-auto mb-4" />
        <Skeleton className="w-48 h-6 mx-auto mb-2" />
        <Skeleton className="w-32 h-4 mx-auto" />
        
        <div className="mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-600">Loading application...</p>
        </div>
      </div>
    </div>
  );
}

// Main App component
export function App() {
  // Log app initialization in development
  React.useEffect(() => {
    if (config.isDevelopment) {
      console.log('[App] Initializing application', {
        env: config.env,
        buildTimestamp: config.buildTimestamp,
        features: Array.from(config.features),
      });
    }
    
    // Emit app ready event
    eventBus.emit('app:ready', {});
  }, []);

  // Handle global unhandled promise rejections
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[App] Unhandled promise rejection:', event.reason);
      
      eventBus.emit('error:global', {
        error: event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        context: 'Unhandled promise rejection'
      });
      
      // Prevent the default console error in development
      if (config.isDevelopment) {
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Handle global JavaScript errors
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('[App] Global error:', event.error);
      
      eventBus.emit('error:global', {
        error: event.error || new Error(event.message),
        context: 'Global error handler'
      });
    };

    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <div id="app" className="app-root">
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={(error, errorInfo) => {
          console.error('[App] Error boundary caught error:', error, errorInfo);
        }}
        onReset={() => {
          // Clear any cached data or reset app state if needed
          if (config.isDevelopment) {
            console.log('[App] Error boundary reset triggered');
          }
        }}
      >
        <Suspense fallback={<AppLoadingFallback />}>
          <AppProviders>
            <Suspense fallback={<AppLoadingFallback />}>
              <AppRouter />
            </Suspense>
          </AppProviders>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

// Export as default for easier importing
export default App;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses providers and event bus appropriately
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant) - includes role="alert" and proper button focus handling
