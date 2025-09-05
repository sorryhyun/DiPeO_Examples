// filepath: src/providers/Providers.tsx
import React from 'react';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { ToastProvider } from '@/providers/ToastProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Composes all top-level providers in the correct dependency order:
 * 1. ThemeProvider - Provides theme context and CSS variables
 * 2. QueryProvider - Sets up React Query client and cache
 * 3. AuthProvider - Manages authentication state (depends on Query for API calls)
 * 4. ToastProvider - Provides toast notifications (depends on Auth for user context)
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

// Default export alias for convenience
export default AppProviders;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - composes providers only
// [x] Reads config from `@/app/config` - not needed for composition layer
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant) - not applicable for provider composition
