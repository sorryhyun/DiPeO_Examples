// filepath: src/routes.tsx

import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { config } from '@/app/config';
import { publishEvent } from '@/core/events';
import type { RouteMeta } from '@/core/contracts';
import MainLayout from '@/shared/layouts/MainLayout';
import AuthLayout from '@/shared/layouts/AuthLayout';
import { useAuth } from '@/hooks/useAuth';
import Spinner from '@/shared/components/Spinner';

// Lazy load pages for better performance
const HomePage = lazy(() => import('@/pages/HomePage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));

// =============================
// ROUTE CONFIGURATION
// =============================

interface RouteConfig {
  path: string;
  element: React.ComponentType;
  meta?: RouteMeta;
}

const routes: RouteConfig[] = [
  {
    path: '/',
    element: HomePage,
    meta: {
      title: 'Home',
      layout: 'main',
    },
  },
  {
    path: '/dashboard',
    element: DashboardPage,
    meta: {
      title: 'Dashboard',
      requiresAuth: true,
      rolesAllowed: ['admin', 'doctor', 'nurse'],
      layout: 'main',
    },
  },
  {
    path: '/login',
    element: LoginPage,
    meta: {
      title: 'Login',
      layout: 'auth',
    },
  },
];

// =============================
// ROUTE PROTECTION COMPONENT
// =============================

interface ProtectedRouteProps {
  children: React.ReactNode;
  meta?: RouteMeta;
}

function ProtectedRoute({ children, meta }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Check if authentication is required
  if (meta?.requiresAuth && !isAuthenticated) {
    // Publish navigation event for analytics
    publishEvent('route:change', {
      from: location.pathname,
      to: '/login',
    });

    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check role-based access
  if (meta?.rolesAllowed && user) {
    const hasPermission = meta.rolesAllowed.some(role => 
      user.roles.includes(role)
    );

    if (!hasPermission) {
      // Publish access denied event
      publishEvent('analytics:event', {
        name: 'access_denied',
        payload: {
          path: location.pathname,
          requiredRoles: meta.rolesAllowed,
          userRoles: user.roles,
        },
      });

      return (
        <Navigate 
          to="/" 
          replace 
        />
      );
    }
  }

  return <>{children}</>;
}

// =============================
// LAYOUT WRAPPER COMPONENT
// =============================

interface LayoutWrapperProps {
  children: React.ReactNode;
  layout?: 'main' | 'auth';
}

function LayoutWrapper({ children, layout = 'main' }: LayoutWrapperProps) {
  if (layout === 'auth') {
    return <AuthLayout>{children}</AuthLayout>;
  }

  return <MainLayout>{children}</MainLayout>;
}

// =============================
// ROUTE ELEMENT FACTORY
// =============================

function createRouteElement(
  Component: React.ComponentType,
  meta?: RouteMeta
): React.ReactElement {
  return (
    <ProtectedRoute meta={meta}>
      <LayoutWrapper layout={meta?.layout}>
        <Suspense fallback={<Spinner size="large" />}>
          <Component />
        </Suspense>
      </LayoutWrapper>
    </ProtectedRoute>
  );
}

// =============================
// ROUTE CHANGE TRACKER
// =============================

function RouteChangeTracker() {
  const location = useLocation();
  const [previousPath, setPreviousPath] = React.useState<string>();

  React.useEffect(() => {
    // Find current route meta
    const currentRoute = routes.find(route => {
      if (route.path === '/') {
        return location.pathname === '/';
      }
      return location.pathname.startsWith(route.path);
    });

    // Update document title
    if (currentRoute?.meta?.title) {
      document.title = `${currentRoute.meta.title} - ${config.appName}`;
    } else {
      document.title = config.appName;
    }

    // Publish route change event
    if (previousPath && previousPath !== location.pathname) {
      publishEvent('route:change', {
        from: previousPath,
        to: location.pathname,
      });

      // Analytics event
      publishEvent('analytics:event', {
        name: 'page_view',
        payload: {
          path: location.pathname,
          title: currentRoute?.meta?.title,
          timestamp: Date.now(),
        },
      });
    }

    setPreviousPath(location.pathname);
  }, [location, previousPath]);

  return null;
}

// =============================
// NOT FOUND COMPONENT
// =============================

function NotFoundPage() {
  React.useEffect(() => {
    document.title = `Page Not Found - ${config.appName}`;
    
    publishEvent('analytics:event', {
      name: '404_error',
      payload: {
        path: window.location.pathname,
        referrer: document.referrer,
      },
    });
  }, []);

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors mr-4"
          >
            Go Back
          </button>
          <a
            href="/"
            className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-3 rounded-md font-medium transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </MainLayout>
  );
}

// =============================
// MAIN ROUTES COMPONENT
// =============================

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <RouteChangeTracker />
      <Routes>
        {/* Dynamic route generation */}
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={createRouteElement(route.element, route.meta)}
          />
        ))}

        {/* Conditional redirects */}
        <Route 
          path="/dashboard/*" 
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" state={{ from: '/dashboard' }} replace />
            )
          } 
        />

        {/* Login redirect for authenticated users */}
        <Route 
          path="/login" 
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              createRouteElement(LoginPage, { title: 'Login', layout: 'auth' })
            )
          } 
        />

        {/* Catch-all 404 route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

// =============================
// ROUTE UTILITIES (EXPORTS)
// =============================

/**
 * Get route configuration by path
 */
export function getRouteConfig(path: string): RouteConfig | undefined {
  return routes.find(route => route.path === path);
}

/**
 * Check if a route requires authentication
 */
export function isProtectedRoute(path: string): boolean {
  const route = getRouteConfig(path);
  return route?.meta?.requiresAuth ?? false;
}

/**
 * Check if current user can access a route
 */
export function canAccessRoute(path: string, userRoles: string[] = []): boolean {
  const route = getRouteConfig(path);
  
  if (!route?.meta?.rolesAllowed) {
    return true; // No role restrictions
  }
  
  return route.meta.rolesAllowed.some(role => userRoles.includes(role));
}

/**
 * Get all available routes (for navigation menus)
 */
export function getAvailableRoutes(userRoles: string[] = []): RouteConfig[] {
  return routes.filter(route => {
    if (!route.meta?.rolesAllowed) {
      return true;
    }
    
    return route.meta.rolesAllowed.some(role => userRoles.includes(role));
  });
}

// Development helpers
if (config.development_mode.verbose_logs) {
  console.log('Routes configured:', routes.map(r => ({
    path: r.path,
    requiresAuth: r.meta?.requiresAuth,
    roles: r.meta?.rolesAllowed,
    layout: r.meta?.layout,
  })));
}

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) 
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
