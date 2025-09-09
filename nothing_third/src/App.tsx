// filepath: src/App.tsx
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AppProviders } from '@/providers/Providers';
import { AppRouter } from '@/routes/AppRouter';
import { Skeleton } from '@/shared/components/Skeleton/Skeleton';
import { config, isDevelopment } from '@/app/config';
import { eventBus } from '@/core/events';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  // Log error for debugging
  React.useEffect(() => {
    eventBus.emit('error:global', {
      error,
      context: 'App-level error boundary'
    });
  }, [error]);

  const handleReload = () => {
    window.location.reload();
  };

  const handleReset = () => {
    resetErrorBoundary();
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: 'var(--color-background-primary, #ffffff)',
        color: 'var(--color-text-primary, #1f2937)'
      }}
    >
      <div
        style={{
          maxWidth: '500px',
          padding: '2rem',
          borderRadius: '0.75rem',
          border: '1px solid var(--color-border-error, #ef4444)',
          backgroundColor: 'var(--color-background-error, #fef2f2)'
        }}
      >
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: 'var(--color-text-error, #dc2626)'
          }}
        >
          Something went wrong
        </h1>
        
        <p
          style={{
            fontSize: '1rem',
            marginBottom: '1.5rem',
            color: 'var(--color-text-secondary, #6b7280)',
            lineHeight: '1.5'
          }}
        >
          We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
        </p>

        {isDevelopment && (
          <details
            style={{
              marginBottom: '1.5rem',
              textAlign: 'left',
              fontSize: '0.875rem',
              padding: '0.75rem',
              backgroundColor: 'var(--color-background-secondary, #f9fafb)',
              borderRadius: '0.375rem',
              border: '1px solid var(--color-border-primary, #e5e7eb)'
            }}
          >
            <summary
              style={{
                cursor: 'pointer',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}
            >
              Error Details (Development)
            </summary>
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontSize: '0.75rem',
                color: 'var(--color-text-error, #dc2626)'
              }}
            >
              {error.message}
              {error.stack && '\n\nStack trace:\n' + error.stack}
            </pre>
          </details>
        )}

        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}
        >
          <button
            onClick={handleReset}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--color-primary-600, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-700, #1d4ed8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-600, #2563eb)';
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid var(--color-primary-500, #3b82f6)';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
          >
            Try Again
          </button>
          
          <button
            onClick={handleReload}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              color: 'var(--color-text-secondary, #6b7280)',
              border: '1px solid var(--color-border-primary, #e5e7eb)',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-background-hover, #f9fafb)';
              e.currentTarget.style.borderColor = 'var(--color-border-hover, #d1d5db)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'var(--color-border-primary, #e5e7eb)';
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid var(--color-primary-500, #3b82f6)';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}

function AppSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading application"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        backgroundColor: 'var(--color-background-primary, #ffffff)'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          maxWidth: '400px',
          width: '100%'
        }}
      >
        {/* App logo/title skeleton */}
        <Skeleton
          width="120px"
          height="40px"
          borderRadius="0.375rem"
          aria-label="Loading app title"
        />
        
        {/* Navigation skeleton */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            width: '100%',
            justifyContent: 'center'
          }}
        >
          <Skeleton width="80px" height="36px" borderRadius="0.375rem" />
          <Skeleton width="80px" height="36px" borderRadius="0.375rem" />
          <Skeleton width="80px" height="36px" borderRadius="0.375rem" />
        </div>
        
        {/* Main content skeleton */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <Skeleton width="100%" height="200px" borderRadius="0.5rem" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem'
            }}
          >
            <Skeleton width="100%" height="120px" borderRadius="0.375rem" />
            <Skeleton width="100%" height="120px" borderRadius="0.375rem" />
            <Skeleton width="100%" height="120px" borderRadius="0.375rem" />
          </div>
        </div>
        
        {/* Loading text */}
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary, #6b7280)',
            textAlign: 'center',
            marginTop: '1rem'
          }}
        >
          Loading application...
        </p>
      </div>
    </div>
  );
}

function App() {
  // Handle uncaught promise rejections
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      eventBus.emit('error:global', {
        error: event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        context: 'Unhandled promise rejection'
      });

      // Prevent the default browser behavior in development
      if (isDevelopment) {
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Log app initialization in development
  React.useEffect(() => {
    if (isDevelopment && config.isFeatureEnabled('analytics')) {
      eventBus.emit('analytics:event', {
        name: 'app_initialized',
        properties: {
          environment: config.env,
          timestamp: Date.now(),
          buildTimestamp: config.buildTimestamp,
          features: Array.from(config.features)
        }
      });
    }
  }, []);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // Additional error logging
        eventBus.emit('error:global', {
          error,
          context: 'React ErrorBoundary',
          errorInfo
        });
      }}
      onReset={() => {
        // Clean up any necessary state on error boundary reset
        eventBus.emit('analytics:event', {
          name: 'error_boundary_reset',
          properties: {
            timestamp: Date.now()
          }
        });
      }}
    >
      <AppProviders>
        <Suspense fallback={<AppSkeleton />}>
          <AppRouter />
        </Suspense>
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/providers/Providers, @/routes/AppRouter, @/shared/components/Skeleton/Skeleton, @/app/config, @/core/events)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - only uses window event listeners for error handling
- [x] Reads config from `@/app/config` (uses config for environment, features, build info)
- [x] Exports default named component (exports App as default)
- [x] Adds basic ARIA and keyboard handlers (role="alert", aria-live, role="status", aria-label, focus handling on buttons)
*/
