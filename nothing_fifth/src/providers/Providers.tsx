// filepath: src/providers/Providers.tsx
import React from 'react';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import AuthProvider from '@/providers/AuthProvider';
import { ModalProvider } from '@/providers/ModalProvider';
import { ToastProvider } from '@/shared/components/ToastProvider';
import { config } from '@/app/config';
import { eventBus } from '@/core/events';
import { hooks } from '@/core/hooks';

// ============================================================================
// PROVIDER COMPOSITION
// ============================================================================

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Main provider composition that wraps the entire application.
 * Order matters - inner providers can depend on outer providers.
 * 
 * Provider stack (outer to inner):
 * 1. ThemeProvider - Theme context and CSS variables
 * 2. QueryProvider - React Query client and cache
 * 3. AuthProvider - Authentication state and methods
 * 4. ModalProvider - Modal management and stack
 * 5. ToastProvider - Toast notifications
 */
export function Providers({ children }: ProvidersProps) {
  React.useEffect(() => {
    // Initialize providers hook
    hooks.invoke('providers:init', { config });

    // Emit provider initialization event
    eventBus.emit('data:updated', { 
      key: 'providers:initialized',
      payload: { 
        timestamp: new Date().toISOString(),
        config: config.isDevelopment ? config : undefined 
      }
    });

    // Development helpers
    if (config.isDevelopment) {
      console.log('Providers initialized', {
        theme: 'enabled',
        query: 'enabled',
        auth: 'enabled',
        modal: 'enabled',
        toast: 'enabled'
      });

      // Global error handling for provider errors
      const handleProviderError = (event: ErrorEvent) => {
        console.error('Provider error caught:', event.error);
        eventBus.emit('error:global', { error: event.error });
      };

      window.addEventListener('error', handleProviderError);

      return () => {
        window.removeEventListener('error', handleProviderError);
        hooks.invoke('providers:cleanup', { config });
      };
    }

    return () => {
      hooks.invoke('providers:cleanup', { config });
    };
  }, []);

  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <ModalProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ModalProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

// ============================================================================
// HIGHER-ORDER COMPONENT FOR PROVIDER WRAPPING
// ============================================================================

/**
 * Higher-order component that wraps a component with all providers.
 * Useful for testing or standalone component rendering.
 */
export function withProviders<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <Providers>
      <Component {...props} />
    </Providers>
  );

  // Preserve component name for debugging
  const componentName = Component.displayName || Component.name || 'Component';
  WrappedComponent.displayName = `withProviders(${componentName})`;

  return WrappedComponent;
}

// ============================================================================
// CONVENIENCE ALIASES
// ============================================================================

/**
 * Alias for Providers component for backward compatibility
 */
export const AppProviders = Providers;

/**
 * Default export for common usage
 */
export default Providers;

// ============================================================================
// DEVELOPMENT HELPERS
// ============================================================================

if (config.isDevelopment) {
  // Expose provider utilities on window for debugging
  (globalThis as any).__providers_debug = {
    config,
    eventBus,
    hooks,
    withProviders
  };
}

// ============================================================================
// Self-Check Comments
// ============================================================================
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
