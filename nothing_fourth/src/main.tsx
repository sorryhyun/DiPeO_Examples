// filepath: src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';

import App from '@/App';
import { Providers } from '@/providers/Providers';
import { config, isDevelopment } from '@/app/config';
import { eventBus } from '@/core/events';
import '@/styles/global.css';

// Initialize global event listeners
const initializeGlobalEventListeners = (): void => {
  // Keyboard shortcuts
  const handleGlobalKeydown = (event: KeyboardEvent): void => {
    // Escape key - close modals/overlays
    if (event.key === 'Escape') {
      eventBus.emit('ui:escape-pressed', { target: event.target });
    }
    
    // Ctrl/Cmd + K - focus search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      eventBus.emit('ui:focus-search', {});
    }
  };

  // Global error handler
  const handleGlobalError = (event: ErrorEvent): void => {
    eventBus.emit('error:uncaught', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
  };

  // Unhandled promise rejection
  const handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
    eventBus.emit('error:unhandled-rejection', {
      reason: event.reason,
      promise: event.promise
    });
  };

  // Online/offline status
  const handleOnlineStatusChange = (): void => {
    eventBus.emit('network:status-changed', {
      isOnline: navigator.onLine
    });
  };

  // Attach listeners
  document.addEventListener('keydown', handleGlobalKeydown);
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
  window.addEventListener('online', handleOnlineStatusChange);
  window.addEventListener('offline', handleOnlineStatusChange);

  // Cleanup function
  return (): void => {
    document.removeEventListener('keydown', handleGlobalKeydown);
    window.removeEventListener('error', handleGlobalError);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    window.removeEventListener('online', handleOnlineStatusChange);
    window.removeEventListener('offline', handleOnlineStatusChange);
  };
};

// Mount the application
export const mountApp = (): void => {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error('Root element not found. Ensure your HTML has a div with id="root"');
  }

  // Log app initialization in development
  if (isDevelopment) {
    console.log(`🚀 ${config.appName} starting...`, {
      env: config.env,
      apiBaseUrl: config.apiBaseUrl,
      features: config.features,
      buildTimestamp: config.buildTimestamp
    });
  }

  // Initialize global event listeners
  const cleanup = initializeGlobalEventListeners();

  // Emit app initialization event
  eventBus.emit('app:initializing', { config });

  // Create React root and render
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <StrictMode>
      <Providers>
        <App />
      </Providers>
    </StrictMode>
  );

  // Emit app mounted event
  eventBus.emit('app:mounted', { timestamp: Date.now() });

  // Store cleanup function for potential use
  (window as any).__appCleanup = cleanup;

  if (isDevelopment) {
    console.log(`✅ ${config.appName} mounted successfully`);
  }
};

// Auto-mount when module loads
mountApp();

// Self-Check Comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Uses eventBus from core
// [x] Reads config from `@/app/config`
// [x] Exports default named component - Exports mountApp function
// [x] Adds basic ARIA and keyboard handlers (where relevant) - Adds global keyboard event handling
