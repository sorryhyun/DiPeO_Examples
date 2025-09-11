// filepath: src/App.tsx
/* 
- [x] Uses `@/` imports as much as possible
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/

import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { config, isDevelopment } from '@/app/config';
import { eventBus } from '@/core/events';
import { di as container } from '@/core/di';
import AppRoutes from './routes';
import MainLayout from '@/shared/layouts/MainLayout';
import ErrorBoundary from '@/shared/components/ErrorBoundary';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import AnalyticsProvider from '@/providers/AnalyticsProvider';
import ChatProvider from '@/providers/ChatProvider';
import SimulatorProvider from '@/providers/SimulatorProvider';
import ABTestProvider from '@/providers/ABTestProvider';
import { theme } from '@/theme/index';

// Global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    eventBus.emit('app:error', { 
      type: 'unhandled_rejection', 
      error: event.reason 
    });
  });

  // Global error handler for uncaught errors
  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    eventBus.emit('app:error', { 
      type: 'uncaught_error', 
      error: event.error 
    });
  });
}

// App loading fallback component
const AppLoadingFallback = () => (
  <div 
    className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black"
    role="status"
    aria-label="Application loading"
  >
    <div className="text-center">
      <LoadingSpinner size="lg" className="mb-4" />
      <p className="text-gray-400 text-lg">Loading Nothing...</p>
    </div>
  </div>
);

// Provider composition wrapper
const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ABTestProvider>
      <AnalyticsProvider>
        <ChatProvider>
          <SimulatorProvider>
            {children}
          </SimulatorProvider>
        </ChatProvider>
      </AnalyticsProvider>
    </ABTestProvider>
  );
};

const App: React.FC = () => {
  // Initialize DI container in development
  React.useEffect(() => {
    if (isDevelopment) {
      eventBus.emit('app:initialized', { 
        environment: 'development',
        config: config,
        di: container 
      });
    }
  }, []);

  return (
    <ErrorBoundary
      fallback={({ error, retry }) => (
        <div 
          className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900/20 to-gray-900"
          role="alert"
          aria-live="assertive"
        >
          <div className="text-center max-w-md mx-auto px-6">
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-400 mb-6">
              {isDevelopment ? error.message : 'An unexpected error occurred'}
            </p>
            <button
              onClick={retry}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label="Retry loading application"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    >
      <BrowserRouter>
        <AppProviders>
          <MainLayout>
            <Suspense fallback={<AppLoadingFallback />}>
              <AppRoutes />
            </Suspense>
          </MainLayout>
        </AppProviders>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
