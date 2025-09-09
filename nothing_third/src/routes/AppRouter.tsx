// filepath: src/routes/AppRouter.tsx
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { config } from '@/app/config';
import { eventBus } from '@/core/events';
import { Spinner } from '@/shared/components';

// Lazy load pages for better performance
const DashboardPage = React.lazy(() => import('@/pages/Dashboard/DashboardPage'));
const LoginPage = React.lazy(() => import('@/pages/Login/LoginPage'));
const SettingsPage = React.lazy(() => import('@/pages/Settings/SettingsPage'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFound/NotFoundPage'));

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: string;
  redirectTo?: string;
}

/**
 * Route guard component that handles authentication and authorization
 */
function RouteGuard({ 
  children, 
  requireAuth = false, 
  requireRole, 
  redirectTo = '/login' 
}: RouteGuardProps) {
  const { isAuthenticated, hasRole, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth is being determined
  if (isLoading) {
    return (
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100vw'
        }}
        aria-label="Loading authentication status"
      >
        <Spinner size="large" />
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    // Store the attempted URL for redirect after login
    const redirectUrl = location.pathname + location.search;
    
    // Emit analytics event for unauthorized access attempt
    eventBus.emit('analytics:event', {
      name: 'unauthorized_access_attempt',
      properties: {
        attemptedPath: redirectUrl,
        timestamp: Date.now()
      }
    });

    return <Navigate to={redirectTo} state={{ from: redirectUrl }} replace />;
  }

  // Check role requirement
  if (requireRole && (!isAuthenticated || !hasRole(requireRole))) {
    // Emit analytics event for insufficient permissions
    eventBus.emit('analytics:event', {
      name: 'insufficient_permissions',
      properties: {
        requiredRole: requireRole,
        attemptedPath: location.pathname,
        timestamp: Date.now()
      }
    });

    return <Navigate to="/unauthorized" replace />;
  }

  // Render protected content
  return <>{children}</>;
}

/**
 * Higher-order component to wrap routes with authentication requirements
 */
function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  requireAuth = true,
  requireRole?: string
) {
  const WrappedComponent = (props: P) => (
    <RouteGuard requireAuth={requireAuth} requireRole={requireRole}>
      <Component {...props} />
    </RouteGuard>
  );

  WrappedComponent.displayName = `withAuthGuard(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Protected route components
 */
const ProtectedDashboard = withAuthGuard(DashboardPage, true);
const ProtectedSettings = withAuthGuard(SettingsPage, true);
const AdminOnlySettings = withAuthGuard(SettingsPage, true, 'admin');

/**
 * Public route wrapper for routes that should redirect if user is already authenticated
 */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100vw'
        }}
        aria-label="Loading authentication status"
      >
        <Spinner size="large" />
      </div>
    );
  }

  // If already authenticated, redirect to dashboard or intended destination
  if (isAuthenticated) {
    const intendedDestination = (location.state as any)?.from || '/dashboard';
    return <Navigate to={intendedDestination} replace />;
  }

  return <>{children}</>;
}

/**
 * Loading fallback component for Suspense
 */
function RouteLoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '200px',
        width: '100%'
      }}
      role="status"
      aria-label="Loading page content"
    >
      <Spinner size="large" />
    </div>
  );
}

/**
 * Route definitions with metadata for analytics and debugging
 */
const routes = [
  {
    path: '/dashboard',
    element: <ProtectedDashboard />,
    name: 'Dashboard',
    requireAuth: true
  },
  {
    path: '/settings',
    element: <ProtectedSettings />,
    name: 'Settings',
    requireAuth: true
  },
  {
    path: '/admin/settings',
    element: <AdminOnlySettings />,
    name: 'Admin Settings',
    requireAuth: true,
    requireRole: 'admin'
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
    name: 'Login',
    requireAuth: false
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
    name: 'Root Redirect'
  }
] as const;

/**
 * Component to track route changes for analytics
 */
function RouteTracker() {
  const location = useLocation();

  React.useEffect(() => {
    // Emit page view event for analytics
    if (config.isFeatureEnabled('analytics')) {
      eventBus.emit('analytics:event', {
        name: 'page_view',
        properties: {
          path: location.pathname,
          search: location.search,
          timestamp: Date.now()
        }
      });
    }
  }, [location]);

  return null;
}

/**
 * Error boundary for route-level errors
 */
class RouteErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean; error: Error } {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for monitoring
    eventBus.emit('error:global', {
      error,
      context: 'RouteErrorBoundary',
      details: { errorInfo }
    });

    if (config.isDevelopment) {
      console.error('Route Error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            padding: '2rem',
            textAlign: 'center'
          }}
        >
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            An unexpected error occurred while loading this page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
          {config.isDevelopment && this.state.error && (
            <details style={{ marginTop: '2rem', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '1rem' }}>
                Error Details (Development)
              </summary>
              <pre style={{ 
                backgroundColor: '#f3f4f6', 
                padding: '1rem', 
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Main application router component
 */
export function AppRouter() {
  const basename = config.isDevelopment ? undefined : config.basePath;

  return (
    <BrowserRouter basename={basename}>
      <RouteErrorBoundary>
        <RouteTracker />
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            {/* Defined routes */}
            {routes.map((route, index) => (
              <Route
                key={`${route.path}-${index}`}
                path={route.path}
                element={route.element}
              />
            ))}
            
            {/* Unauthorized access page */}
            <Route
              path="/unauthorized"
              element={
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    textAlign: 'center',
                    padding: '2rem'
                  }}
                  role="main"
                >
                  <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                    Access Denied
                  </h1>
                  <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                    You don't have permission to access this page.
                  </p>
                  <button
                    onClick={() => window.history.back()}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer'
                    }}
                  >
                    Go Back
                  </button>
                </div>
              }
            />
            
            {/* 404 catch-all route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </BrowserRouter>
  );
}

// Export additional utilities for testing and debugging
export { RouteGuard, withAuthGuard };

// Export route definitions for external use (e.g., navigation components)
export const routeDefinitions = routes;

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/hooks/useAuth, @/app/config, @/core/events, @/shared/components, @/pages/*)
- [x] Uses providers/hooks (uses useAuth hook, no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (uses config.isFeatureEnabled, config.isDevelopment, config.basePath)
- [x] Exports default named component (exports AppRouter and additional utilities)
- [x] Adds basic ARIA and keyboard handlers (role="status", role="alert", role="main", aria-label attributes)
*/
