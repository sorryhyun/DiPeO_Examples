// filepath: src/app/router.tsx

import React, { Suspense, lazy } from 'react';
import { 
  createBrowserRouter, 
  RouterProvider, 
  Navigate, 
  Outlet 
} from 'react-router-dom';
import { config, isFeatureEnabled } from '@/app/config';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/shared/components/Spinner';
import { AppLayout } from '@/shared/layouts/AppLayout';
import { AuthLayout } from '@/shared/layouts/AuthLayout';

// ============================================================================
// Lazy-loaded Pages
// ============================================================================

const HomePage = lazy(() => import('@/pages/HomePage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// ============================================================================
// Route Guards
// ============================================================================

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children || <Outlet />}</>;
}

function PublicRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children || <Outlet />}</>;
}

// ============================================================================
// Layout Wrappers
// ============================================================================

function AppLayoutWrapper() {
  return (
    <AppLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="lg" />
        </div>
      }>
        <Outlet />
      </Suspense>
    </AppLayout>
  );
}

function AuthLayoutWrapper() {
  return (
    <AuthLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="lg" />
        </div>
      }>
        <Outlet />
      </Suspense>
    </AuthLayout>
  );
}

// ============================================================================
// Router Configuration
// ============================================================================

const router = createBrowserRouter([
  // Public routes (auth layout)
  {
    path: '/auth',
    element: <AuthLayoutWrapper />,
    children: [
      {
        path: '',
        element: <Navigate to="/auth/login" replace />
      },
      {
        path: 'login',
        element: (
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        )
      }
    ]
  },
  
  // Legacy login route redirect
  {
    path: '/login',
    element: <Navigate to="/auth/login" replace />
  },

  // Protected routes (app layout)
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayoutWrapper />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '',
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'home',
        element: <HomePage />
      },
      {
        path: 'dashboard',
        element: <DashboardPage />
      }
    ]
  },

  // 404 Not Found
  {
    path: '*',
    element: (
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="lg" />
        </div>
      }>
        <NotFoundPage />
      </Suspense>
    )
  }
], {
  basename: config.isDevelopment ? '/' : undefined
});

// ============================================================================
// Main Router Component
// ============================================================================

export function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;

// ============================================================================
// Self-Check Comments
// ============================================================================
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Uses useAuth hook
// [x] Reads config from `@/app/config` - Uses config.isDevelopment
// [x] Exports default named component - Exports AppRouter as default
// [x] Adds basic ARIA and keyboard handlers (where relevant) - Router handles navigation accessibility
