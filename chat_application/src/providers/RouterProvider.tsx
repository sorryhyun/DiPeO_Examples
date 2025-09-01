// filepath: src/providers/RouterProvider.tsx
import React from 'react';
import { BrowserRouter, Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { config } from '@/app/config';
import { emit } from '@/core/events';
import type { User, UserRole } from '@/core/contracts';

// Import route configuration
import { routes, routeConfig } from '@/app/routes';

/**
 * Router-level authentication and role guard hook
 */
export function useRouteGuards() {
  const location = useLocation();
  
  React.useEffect(() => {
    // Emit route change event for analytics/tracking
    emit('route.change', { 
      from: undefined, // Previous route tracking would need additional state
      to: location.pathname 
    });
  }, [location.pathname]);

  const requiresAuth = (path: string): boolean => {
    const route = Object.values(routeConfig).find(r => r.path === path);
    return route?.requiresAuth ?? false;
  };

  const hasRequiredRole = (user: User | null, path: string): boolean => {
    if (!user) return false;
    
    const route = Object.values(routeConfig).find(r => r.path === path);
    if (!route?.roles || route.roles.length === 0) return true;
    
    return route.roles.some((role: UserRole) => user.roles.includes(role));
  };

  const canAccess = (user: User | null, path: string): boolean => {
    const needsAuth = requiresAuth(path);
    
    if (!needsAuth) return true;
    if (!user) return false;
    
    return hasRequiredRole(user, path);
  };

  return {
    requiresAuth,
    hasRequiredRole,
    canAccess,
    currentPath: location.pathname,
  };
}

/**
 * Protected Route wrapper component
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  user?: User | null;
  requiresAuth?: boolean;
  roles?: UserRole[];
  fallback?: React.ReactNode;
}

function ProtectedRoute({ 
  children, 
  user, 
  requiresAuth = false, 
  roles = [], 
  fallback 
}: ProtectedRouteProps) {
  const location = useLocation();

  // Check authentication requirement
  if (requiresAuth && !user) {
    return (
      <Navigate 
        to="/auth/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check role requirements
  if (user && roles.length > 0) {
    const hasRequiredRole = roles.some(role => user.roles.includes(role));
    
    if (!hasRequiredRole) {
      return fallback || (
        <Navigate 
          to="/unauthorized" 
          state={{ from: location.pathname }} 
          replace 
        />
      );
    }
  }

  return <>{children}</>;
}

/**
 * Route resolver that handles dynamic route loading
 */
interface RouteResolverProps {
  user?: User | null;
}

function RouteResolver({ user }: RouteResolverProps) {
  return (
    <Routes>
      {routes.map((route) => {
        const routeMeta = routeConfig[route.path];
        
        return (
          <Route
            key={route.path}
            path={route.path}
            element={
              <ProtectedRoute
                user={user}
                requiresAuth={routeMeta?.requiresAuth}
                roles={routeMeta?.roles}
              >
                {route.element}
              </ProtectedRoute>
            }
          />
        );
      })}
      
      {/* Fallback route for unmatched paths */}
      <Route 
        path="*" 
        element={<Navigate to="/404" replace />} 
      />
    </Routes>
  );
}

/**
 * Main RouterProvider component props
 */
interface RouterProviderProps {
  children?: React.ReactNode;
  user?: User | null;
  basename?: string;
}

/**
 * Top-level Router provider using react-router-dom BrowserRouter.
 * Handles route guards, authentication checks, and navigation tracking.
 */
export function RouterProvider({ 
  children, 
  user, 
  basename 
}: RouterProviderProps) {
  const routerBasename = basename || config.routerBasename || '/';

  React.useEffect(() => {
    if (config.isDevelopment) {
      console.debug('RouterProvider: Initialized with basename:', routerBasename);
      console.debug('RouterProvider: Available routes:', Object.keys(routeConfig));
    }
  }, [routerBasename]);

  return (
    <BrowserRouter basename={routerBasename}>
      <RouteErrorBoundary>
        {children ? (
          // If children provided, render them (for custom route handling)
          children
        ) : (
          // Default behavior: render all configured routes
          <RouteResolver user={user} />
        )}
      </RouteErrorBoundary>
    </BrowserRouter>
  );
}

/**
 * Error boundary for route-level errors
 */
interface RouteErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class RouteErrorBoundary extends React.Component<
  { children: React.ReactNode },
  RouteErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('RouterProvider: Route error caught:', error, errorInfo);
    
    // Emit error event for logging/analytics
    emit('analytics.track', {
      event: 'route_error',
      properties: {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div 
          role="alert"
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#dc2626',
          }}
        >
          <h2>Navigation Error</h2>
          <p>Something went wrong while loading this page.</p>
          {config.isDevelopment && this.state.error && (
            <details style={{ marginTop: '1rem', textAlign: 'left' }}>
              <summary>Error Details</summary>
              <pre style={{ 
                background: '#f3f4f6', 
                padding: '1rem', 
                borderRadius: '0.375rem',
                overflow: 'auto',
                fontSize: '0.875rem',
              }}>
                {this.state.error.stack}
              </pre>
            </details>
          )}
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Export route guards hook for external use
export { ProtectedRoute };

// Export default
export default RouterProvider;

/*
Self-check comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/
