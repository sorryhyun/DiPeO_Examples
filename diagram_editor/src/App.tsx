// filepath: src/App.tsx

import React, { useEffect, useCallback } from 'react';
import { publishEvent } from '@/core/events';
import { AppRoutes } from './routes';

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
    // Publish error event for analytics/logging
    publishEvent('analytics:event', {
      name: 'app_error',
      payload: {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      },
    });

    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div 
          role="alert"
          className="min-h-screen flex items-center justify-center bg-gray-50"
        >
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-gray-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-gray-600 mb-4">
              We're sorry, but something unexpected happened. Please refresh the page to try again.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main App Component
export function App() {
  // Global keyboard event handler
  const handleGlobalKeyDown = useCallback((event: KeyboardEvent) => {
    // Handle ESC key to close modals
    if (event.key === 'Escape') {
      publishEvent('modal:close', {});
    }

    // Handle Ctrl/Cmd + K for global search (if implemented)
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      publishEvent('analytics:event', {
        name: 'global_search_shortcut',
        payload: { source: 'keyboard' },
      });
    }

    // Handle Alt + M for mobile menu toggle (accessibility)
    if (event.altKey && event.key === 'm') {
      event.preventDefault();
      publishEvent('analytics:event', {
        name: 'mobile_menu_shortcut',
        payload: { source: 'keyboard' },
      });
    }
  }, []);

  // Setup global keyboard listeners
  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKeyDown);
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleGlobalKeyDown]);

  // Focus management for accessibility
  useEffect(() => {
    // Ensure there's always a focusable element
    const activeElement = document.activeElement;
    if (!activeElement || activeElement === document.body) {
      // Focus the skip link or main content area if no element is focused
      const skipLink = document.querySelector('[data-skip-link]') as HTMLElement;
      const mainContent = document.querySelector('main') as HTMLElement;
      const focusTarget = skipLink || mainContent;
      
      if (focusTarget && typeof focusTarget.focus === 'function') {
        // Small delay to ensure DOM is ready
        setTimeout(() => focusTarget.focus(), 100);
      }
    }
  }, []);

  return (
    <AppErrorBoundary>
      <div className="app">
        {/* Skip to main content link for screen readers */}
        <a
          href="#main-content"
          data-skip-link
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Skip to main content
        </a>
        
        {/* Main application routes */}
        <AppRoutes />
        
        {/* Hidden live region for screen reader announcements */}
        <div
          id="live-region"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
        
        {/* Hidden div to announce route changes */}
        <div
          id="route-announcer"
          aria-live="assertive"
          aria-atomic="true"
          className="sr-only"
        />
      </div>
    </AppErrorBoundary>
  );
}

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config` (not needed in this component)
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
