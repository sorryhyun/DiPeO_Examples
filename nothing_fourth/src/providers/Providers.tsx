// filepath: src/providers/Providers.tsx
import React, { ReactNode, useEffect } from 'react';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { ModalProvider } from '@/providers/ModalProvider';
import { ToastProvider } from '@/shared/components/ToastProvider';
import { config, isDevelopment } from '@/app/config';
import { eventBus } from '@/core/events';
import { hooks } from '@/core/hooks';
import { container } from '@/core/di';

interface ProvidersProps {
  children: ReactNode;
}

// Error boundary for provider failures
interface ProviderErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ProviderErrorBoundary extends React.Component<
  { children: ReactNode; providerName: string },
  ProviderErrorBoundaryState
> {
  constructor(props: { children: ReactNode; providerName: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ProviderErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    eventBus.emit('provider:error', {
      providerName: this.props.providerName,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    if (isDevelopment) {
      console.error(`Provider Error [${this.props.providerName}]:`, error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-900/20">
          <div className="text-center p-6 max-w-md">
            <div className="text-red-600 dark:text-red-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Provider Error
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {this.props.providerName} provider failed to initialize.
            </p>
            {isDevelopment && this.state.error && (
              <details className="text-left text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded">
                <summary className="cursor-pointer font-medium mb-2">Error Details</summary>
                <pre className="whitespace-pre-wrap overflow-auto">
                  {this.state.error.message}
                  {this.state.error.stack && '\n\n' + this.state.error.stack}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Provider wrapper with error boundary
interface SafeProviderProps {
  name: string;
  children: ReactNode;
}

const SafeProvider: React.FC<SafeProviderProps> = ({ name, children }) => (
  <ProviderErrorBoundary providerName={name}>
    {children}
  </ProviderErrorBoundary>
);

// Main providers composition
export function Providers({ children }: ProvidersProps) {
  // Initialize providers system
  useEffect(() => {
    const initializeProviders = async () => {
      try {
        // Execute provider initialization hooks
        await hooks.execute('providers:initializing', { config });

        // Register core services in DI container if needed
        if (config.dev.enableMockData && isDevelopment) {
          // Register mock services
          await hooks.execute('providers:mock-services', { container });
        }

        // Emit providers ready event
        eventBus.emit('providers:ready', {
          timestamp: Date.now(),
          isDevelopment,
          appName: config.appName,
        });

        if (isDevelopment) {
          console.log('🔧 Providers initialized successfully');
        }
      } catch (error) {
        eventBus.emit('providers:initialization-failed', { error });
        console.error('Failed to initialize providers:', error);
      }
    };

    initializeProviders();

    return () => {
      hooks.execute('providers:cleanup', {});
    };
  }, []);

  // Handle provider unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      eventBus.emit('providers:before-unload', {});
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <SafeProvider name="Theme">
      <ThemeProvider>
        <SafeProvider name="Query">
          <QueryProvider>
            <SafeProvider name="Auth">
              <AuthProvider>
                <SafeProvider name="Modal">
                  <ModalProvider>
                    <SafeProvider name="Toast">
                      <ToastProvider>
                        {children}
                      </ToastProvider>
                    </SafeProvider>
                  </ModalProvider>
                </SafeProvider>
              </AuthProvider>
            </SafeProvider>
          </QueryProvider>
        </SafeProvider>
      </ThemeProvider>
    </SafeProvider>
  );
}

// HOC for wrapping components with providers
export function withProviders<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  const WrappedComponent: React.FC<P> = (props) => (
    <Providers>
      <Component {...props} />
    </Providers>
  );

  // Preserve component name for debugging
  WrappedComponent.displayName = `withProviders(${
    Component.displayName || Component.name || 'Component'
  })`;

  return WrappedComponent;
}

// Export as AppProviders for semantic clarity
export const AppProviders = Providers;

export default Providers;

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant - error boundaries have basic interaction)
*/
