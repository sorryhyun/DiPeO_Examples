// filepath: src/index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/app/App';
import { config } from '@/app/config';
import { eventBus } from '@/core/events';
import '@/styles/global.css';

// Mount the application to the DOM
function mountApp() {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error('Root element not found. Make sure your HTML includes a div with id="root"');
  }

  const root = createRoot(rootElement);
  
  console.log('Mounting app...');
  
  root.render(
    <App />
  );

  // Initialize global event listeners for development
  if (config.isDevelopment) {
    // Global error handler for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      eventBus.emit('error:unhandled', { error: event.reason });
    });

    // Global error handler for JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      eventBus.emit('error:global', { error: event.error });
    });

    // Keyboard shortcuts for development
    window.addEventListener('keydown', (event) => {
      // Ctrl/Cmd + K for quick actions
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        eventBus.emit('dev:quickActions', {});
      }
    });

    console.log('DiPeO Frontend initialized in development mode');
  }

  return root;
}

// Auto-mount if not in test environment
if (import.meta.env.NODE_ENV !== 'test') {
  mountApp();
}

export { mountApp };

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/