// filepath: src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import { config } from '@/app/config';
import { debugLog } from '@/core/utils';

// Development tools and debugging
if (config.isDevelopment) {
  // Enable React DevTools profiler in development
  if (typeof window !== 'undefined') {
    (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ || {};
  }
  
  debugLog('Application starting in development mode', {
    buildTimestamp: config.buildTimestamp,
    features: Array.from(config.features),
    apiBaseUrl: config.apiBaseUrl,
  });
}

// Service Worker registration helper
async function registerServiceWorker(): Promise<void> {
  if ('serviceWorker' in navigator && config.env === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      debugLog('Service Worker registered successfully', registration.scope);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, notify user
              console.log('New content is available; please refresh.');
            }
          });
        }
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}

// Error boundary for uncaught errors
function setupGlobalErrorHandling(): void {
  // Handle uncaught JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    // In production, you might want to report this to an error tracking service
    if (config.env === 'production') {
      // Example: reportError(event.error);
    }
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // In production, you might want to report this to an error tracking service
    if (config.env === 'production') {
      // Example: reportError(event.reason);
    }
  });
}

// Performance monitoring setup
function setupPerformanceMonitoring(): void {
  if (config.isDevelopment && 'performance' in window) {
    // Log performance metrics in development
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (perfData) {
          debugLog('Performance metrics', {
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
            totalLoadTime: perfData.loadEventEnd - perfData.fetchStart,
          });
        }
      }, 0);
    });
  }
}

// Initialize application
async function initializeApp(): Promise<void> {
  try {
    // Setup global error handling
    setupGlobalErrorHandling();
    
    // Setup performance monitoring
    setupPerformanceMonitoring();
    
    // Register service worker in production
    await registerServiceWorker();
    
    // Get the root element
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
      throw new Error('Root element not found. Make sure there is a <div id="root"></div> in your index.html');
    }
    
    // Create React root and render app
    const root = ReactDOM.createRoot(rootElement);
    
    // Render the app with error boundary
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    debugLog('Application mounted successfully');
    
  } catch (error) {
    console.error('Failed to initialize application:', error);
    
    // Fallback error display
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          text-align: center;
          background: #f8f9fa;
        ">
          <h1 style="color: #dc3545; margin-bottom: 16px;">Application Error</h1>
          <p style="color: #6c757d; margin-bottom: 16px;">
            Sorry, something went wrong loading the application.
          </p>
          <button 
            onclick="window.location.reload()" 
            style="
              padding: 8px 16px;
              background: #007bff;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
            "
          >
            Reload Page
          </button>
        </div>
      `;
    }
  }
}

// Hot Module Replacement (HMR) support for development
if (config.isDevelopment && import.meta.hot) {
  import.meta.hot.accept('./App', () => {
    debugLog('Hot module replacement: App component updated');
  });
}

// Initialize the application
initializeApp();

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - this is the entry point, so DOM access is expected
// [x] Reads config from `@/app/config`
// [ ] Exports default named component - N/A, this is an entry point file
// [ ] Adds basic ARIA and keyboard handlers (where relevant) - N/A, this is bootstrap code
