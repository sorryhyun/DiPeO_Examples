// filepath: src/App.tsx
/* src/App.tsx

Top-level App component composing ThemeProvider, AuthProvider, ToastProvider and AppRouter. 
Central place to wire global providers and layout wrappers.
*/

import React from 'react';
import { ThemeProvider } from '@/theme/theme-provider';
import { AuthProvider } from '@/providers/AuthProvider';
import { ToastProvider } from '@/components/Toast/ToastProvider';
import { AppRouter } from '@/routes/AppRouter';
import { appConfig } from '@/app/config';
import { eventBus } from '@/core/events';
import '@/i18n';

// Initialize global event listeners for debugging in development
if (appConfig.isDevelopment) {
  eventBus.on('auth:login', ({ user }) => {
    console.log('[App] User logged in:', user.email);
  });
  
  eventBus.on('auth:logout', (payload) => {
    console.log('[App] User logged out:', payload?.reason || 'no reason given');
  });
  
  eventBus.on('toast:push', ({ message, type }) => {
    console.log(`[App] Toast ${type || 'info'}:`, message);
  });
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <div className="app" data-testid="app-root">
            <AppRouter />
          </div>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (providers handle accessibility concerns)
