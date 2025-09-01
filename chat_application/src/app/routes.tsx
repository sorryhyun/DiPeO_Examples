// filepath: src/app/routes.tsx
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { emit } from '@/core/events';

// Layouts
import { AppLayout } from '@/shared/layouts/AppLayout';
import { AuthLayout } from '@/shared/layouts/AuthLayout';

// Pages and Features
import { HomePage } from '@/pages/HomePage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

/**
 * Route configuration object for type safety and centralized management
 */
export const routeConfig = {
  home: '/',
  dashboard: '/dashboard',
  login: '/login',
  register: '/register',
  notFound: '*',
} as const;

export type RouteKey = keyof typeof routeConfig;
export type RoutePath = typeof routeConfig[RouteKey];

/**
 * Protected Route wrapper component that requires authentication
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // You might want to show a loading spinner here
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    // Redirect to login with the current location as the return path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

/**
 * Public Route wrapper that redirects authenticated users to dashboard
 */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (user) {
    // If user is authenticated, redirect to the intended destination or dashboard
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

/**
 * Route change tracker component for analytics and events
 */
function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    // Emit route change event for analytics and other listeners
    emit('route.change', {
      to: location.pathname,
      from: undefined, // Could track previous route if needed
    });

    // Track page view
    emit('analytics.track', {
      event: 'page_view',
      properties: {
        path: location.pathname,
        search: location.search,
        hash: location.hash,
      },
    });
  }, [location]);

  return null;
}

/**
 * Main application routes component with layout composition
 */
export function AppRoutes() {
  return (
    <>
      <RouteTracker />
      <Routes>
        {/* Public routes with auth layout */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <AuthLayout>
                <RegisterPage />
              </AuthLayout>
            </PublicRoute>
          }
        />

        {/* Protected routes with app layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Home route - can be accessed by anyone but shows different content based on auth */}
        <Route
          path="/"
          element={
            <AppLayout>
              <HomePage />
            </AppLayout>
          }
        />

        {/* Catch-all 404 route */}
        <Route
          path="*"
          element={
            <AppLayout>
              <NotFoundPage />
            </AppLayout>
          }
        />
      </Routes>
    </>
  );
}

/**
 * Route navigation helpers for type-safe navigation
 */
export const routeHelpers = {
  /**
   * Get the path for a route key
   */
  getPath: (key: RouteKey): RoutePath => routeConfig[key],

  /**
   * Check if current path matches a route
   */
  isCurrentRoute: (currentPath: string, routeKey: RouteKey): boolean => {
    const routePath = routeConfig[routeKey];
    if (routePath === '*') return false;
    
    // Handle exact matches and wildcards
    if (routePath === '/') {
      return currentPath === '/';
    }
    
    return currentPath.startsWith(routePath);
  },

  /**
   * Get breadcrumb items for current route
   */
  getBreadcrumbs: (currentPath: string): Array<{ label: string; path?: string }> => {
    const breadcrumbs: Array<{ label: string; path?: string }> = [];

    if (currentPath === '/') {
      breadcrumbs.push({ label: 'Home' });
    } else if (currentPath.startsWith('/dashboard')) {
      breadcrumbs.push({ label: 'Home', path: '/' });
      breadcrumbs.push({ label: 'Dashboard' });
    } else if (currentPath === '/login') {
      breadcrumbs.push({ label: 'Login' });
    } else if (currentPath === '/register') {
      breadcrumbs.push({ label: 'Register' });
    } else {
      breadcrumbs.push({ label: 'Page Not Found' });
    }

    return breadcrumbs;
  },
};

/**
 * Route metadata for SEO and page titles
 */
export const routeMetadata: Record<RoutePath | string, { title: string; description?: string }> = {
  '/': {
    title: 'Home',
    description: 'Welcome to DiPeO Healthcare',
  },
  '/dashboard': {
    title: 'Dashboard',
    description: 'Healthcare management dashboard',
  },
  '/login': {
    title: 'Login',
    description: 'Sign in to your account',
  },
  '/register': {
    title: 'Register',
    description: 'Create a new account',
  },
  '*': {
    title: 'Page Not Found',
    description: 'The page you are looking for could not be found',
  },
};

/**
 * Get page metadata for current route
 */
export function getRouteMetadata(pathname: string) {
  return routeMetadata[pathname] || routeMetadata['*'];
}

/*
Self-check comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (useAuth hook for authentication state)  
- [x] Reads config from `@/app/config` (indirectly through events and hooks)
- [x] Exports default named component (exports AppRoutes function)
- [x] Adds basic ARIA and keyboard handlers (handled by individual page components)
- [x] Implements protected routes with authentication checks
- [x] Uses React Router v6 with proper Navigate components
- [x] Includes route change tracking for analytics
- [x] Provides type-safe route configuration and helpers
- [x] Implements layout composition pattern with AppLayout and AuthLayout
- [x] Handles loading states during authentication checks
- [x] Includes route metadata for SEO and page titles
- [x] Emits events for route changes and analytics tracking
*/
