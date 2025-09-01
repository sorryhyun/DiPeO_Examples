import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Providers
import ReactQueryProvider from '@/providers/ReactQueryProvider';
import I18nProvider from '@/providers/I18nProvider';
import ThemeProvider from '@/providers/ThemeProvider';
import AuthProvider from '@/providers/AuthProvider';
import SocketProvider from '@/providers/SocketProvider';

// Mock services for development
import { startMockServer } from '@/mock/server';
import { startMockWebSocket } from '@/mock/wsMock';

// Config
import { shouldUseMockData, isDevelopment } from '@/app/config';
import { debugLog } from '@/core/utils';

// Start mock services in development mode
async function initializeDevelopmentServices() {
  if (!shouldUseMockData) {
    return;
  }

  try {
    debugLog('info', 'Starting mock services for development...');
    
    // Start mock API server
    await startMockServer();
    debugLog('info', 'Mock API server started');
    
    // Start mock WebSocket server
    await startMockWebSocket();
    debugLog('info', 'Mock WebSocket server started');
    
  } catch (error) {
    debugLog('error', 'Failed to start mock services:', error);
    // Continue anyway - app should still work in offline mode
  }
}

// Provider composition wrapper
function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <I18nProvider>
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              {children}
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </I18nProvider>
    </ReactQueryProvider>
  );
}

// Main application bootstrap
async function bootstrap() {
  // Initialize development services first
  await initializeDevelopmentServices();

  // Get root container
  const container = document.getElementById('root');
  
  if (!container) {
    throw new Error('Root container not found. Please ensure your HTML file has a div with id="root"');
  }

  // Create React root
  const root = createRoot(container);

  // Mount the application
  root.render(
    <React.StrictMode>
      <AppProviders>
        <App />
      </AppProviders>
    </React.StrictMode>
  );

  debugLog('info', 'Application bootstrapped successfully');

  // Log environment info
  if (isDevelopment) {
    debugLog('info', 'Running in development mode', {
      mockData: shouldUseMockData,
      NODE_ENV: process.env.NODE_ENV,
    });
  }
}

// Global error handlers
function setupGlobalErrorHandlers() {
  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    debugLog('error', 'Uncaught error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    });
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    debugLog('error', 'Unhandled promise rejection:', {
      reason: event.reason,
      promise: event.promise,
    });
    
    // Prevent default browser behavior (logging to console)
    event.preventDefault();
  });

  // Handle React errors (additional safety net)
  if (isDevelopment) {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Check if it's a React error
      if (args[0] && typeof args[0] === 'string' && args[0].includes('React')) {
        debugLog('error', 'React error intercepted:', args);
      }
      originalConsoleError.apply(console, args);
    };
  }
}

// Performance monitoring (development only)
function setupPerformanceMonitoring() {
  if (!isDevelopment) return;

  // Monitor app startup time
  const startTime = performance.now();
  
  window.addEventListener('load', () => {
    const loadTime = performance.now() - startTime;
    debugLog('info', `App load time: ${Math.round(loadTime)}ms`);
  });

  // Monitor largest contentful paint
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        debugLog('info', `Largest Contentful Paint: ${Math.round(lastEntry.startTime)}ms`);
        observer.disconnect();
      });
      
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (error) {
      // Silently ignore if performance monitoring fails
    }
  }
}

// Initialize the application
(async function initializeApp() {
  try {
    // Setup error handling first
    setupGlobalErrorHandlers();
    
    // Setup performance monitoring in development
    setupPerformanceMonitoring();
    
    // Bootstrap the application
    await bootstrap();
    
  } catch (error) {
    debugLog('error', 'Failed to initialize application:', error);
    
    // Show fallback error UI
    const container = document.getElementById('root');
    if (container) {
      container.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 2rem;
          text-align: center;
          font-family: system-ui, -apple-system, sans-serif;
        ">
          <h1 style="color: #dc2626; margin-bottom: 1rem;">
            Application Failed to Start
          </h1>
          <p style="color: #6b7280; margin-bottom: 1rem;">
            Something went wrong while loading the application.
          </p>
          <button 
            onclick="window.location.reload()" 
            style="
              background: #3b82f6;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              cursor: pointer;
              font-size: 1rem;
            "
          >
            Reload Page
          </button>
          ${isDevelopment ? `
            <details style="margin-top: 2rem; text-align: left;">
              <summary style="cursor: pointer; color: #6b7280;">
                Error Details (Development)
              </summary>
              <pre style="
                background: #f3f4f6;
                padding: 1rem;
                border-radius: 0.5rem;
                overflow: auto;
                margin-top: 0.5rem;
                font-size: 0.875rem;
              ">${error instanceof Error ? error.stack : String(error)}</pre>
            </details>
          ` : ''}
        </div>
      `;
    }
    
    // Re-throw to let any monitoring tools capture it
    throw error;
  }
})();

// Hot module replacement for development
if (isDevelopment && module.hot) {
  module.hot.accept('./App', () => {
    debugLog('info', 'Hot reloading App component');
  });
}

// Export nothing - this is an entry point
export {};
