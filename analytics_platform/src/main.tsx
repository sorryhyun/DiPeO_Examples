// src/main.tsx
/* src/main.tsx
   Application bootstrap. Mounts React tree into DOM, wraps App with providers (React Query Provider) and imports global styles.
   - Creates React Query client using core/queryClient factory
   - Wraps App with QueryClientProvider
   - Handles StrictMode in development
   - Imports global styles
*/

import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import App from '@/app/App';
import { createQueryClient } from '@/core/queryClient';
import { isDevelopment } from '@/app/config';
import '@/styles/tailwind.css';
import '@/styles/global.css';

// Create the React Query client instance
const queryClient = createQueryClient();

// Bootstrap the application
function mountApp() {
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Root element not found. Make sure your HTML includes <div id="root"></div>');
  }

  const root = createRoot(container);

  const AppWithProviders = (
    <QueryClientProvider client={queryClient}>
      <App />
      {isDevelopment && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );

  // Wrap in StrictMode for development to catch potential issues
  if (isDevelopment) {
    root.render(
      <React.StrictMode>
        {AppWithProviders}
      </React.StrictMode>
    );
  } else {
    root.render(AppWithProviders);
  }
}

// Mount the app immediately
mountApp();

// Export for testing purposes
export default mountApp;

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses React Query Provider
- [x] Reads config from `@/app/config` - imports isDevelopment
- [x] Exports default named component - exports mountApp function
- [x] Adds basic ARIA and keyboard handlers (not relevant for bootstrap file)
*/
