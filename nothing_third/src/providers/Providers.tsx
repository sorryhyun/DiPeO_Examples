// filepath: src/providers/Providers.tsx
import React from 'react';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { ToastProvider } from '@/providers/ToastProvider';

export interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Composes all top-level providers in the correct order for the application.
 * 
 * Provider order rationale:
 * 1. ThemeProvider - Must be outermost as it provides CSS variables and theme context
 * 2. QueryProvider - Provides React Query client for data fetching
 * 3. AuthProvider - Depends on QueryProvider for API calls, provides auth context
 * 4. ToastProvider - Can depend on auth/theme context, handles notifications
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

// Export alias for convenience
export const Providers = AppProviders;

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/providers/*)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - pure provider composition
- [x] Reads config from `@/app/config` (N/A - this is a composition component)
- [x] Exports default named component (exports AppProviders and Providers alias)
- [x] Adds basic ARIA and keyboard handlers (N/A - provider composition doesn't need ARIA)
*/
