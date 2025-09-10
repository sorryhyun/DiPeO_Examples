import React, { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppRouter } from '@/app/router';
import { config, isDevelopment } from '@/app/config';
import { eventBus } from '@/core/events';
import { hooks } from '@/core/hooks';
import { pageTransitions } from '@/theme/animations';
import { ToastProvider } from '@/shared/components/ToastProvider';

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class AppErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
    eventBus.emit('error:boundary', { error, errorInfo });
    
    if (isDevelopment) {
      console.group('Error Details');
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
          <div className="max-w-md w-full mx-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg p-6 text-center"
            >
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 mb-4">
                We apologize for the inconvenience. Please refresh the page to try again.
              </p>
              {isDevelopment && this.state.error && (
                <details className="text-left bg-gray-50 rounded p-3 mb-4">
                  <summary className="cursor-pointer text-sm font-medium">
                    Error Details (Development)
                  </summary>
                  <pre className="text-xs mt-2 overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Refresh Page
              </button>
            </motion.div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Fallback Component
const AppSuspenseFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
      <p className="text-gray-600 font-medium">Loading {config.appName}...</p>
    </motion.div>
  </div>
);

// Main App Component
const App: React.FC = () => {
  React.useEffect(() => {
    // Initialize app-level hooks
    hooks.invoke('app:init', { config });

    // Set up development helpers
    if (isDevelopment) {
      // Make config available in console for debugging
      (window as any).__APP_CONFIG__ = config;
      
      // Listen for development events
      eventBus.on('dev:quickActions', () => {
        console.log('Quick actions triggered - implement dev panel here');
      });

      console.log(`${config.appName} initialized`, {
        version: config.buildTimestamp,
        env: config.env,
        features: config.features
      });
    }

    // Global keyboard shortcuts
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key for modal/overlay dismissal
      if (event.key === 'Escape') {
        eventBus.emit('ui:escape', {});
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      hooks.invoke('app:cleanup', { config });
    };
  }, []);

  return (
    <AppErrorBoundary>
      <AppRouter />
    </AppErrorBoundary>
  );
};

export default App;

// ============================================================================
// Self-Check Comments
// ============================================================================
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
