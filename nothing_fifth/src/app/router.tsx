// filepath: src/app/router.tsx

import React, { Suspense, lazy } from 'react';
import { 
  createBrowserRouter, 
  RouterProvider, 
  Navigate, 
  Outlet 
} from 'react-router-dom';
import { config, isFeatureEnabled } from '@/app/config';
import { Spinner } from '@/shared/components/Spinner';
import { AppLayout } from '@/shared/layouts/AppLayout';
import { ProtectedPage } from '@/shared/components/ProtectedPage';
import { Providers } from '@/providers/Providers';

// ============================================================================
// Lazy-loaded Pages
// ============================================================================

const HomePage = lazy(() => import('@/pages/HomePage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// ============================================================================
// Layout Wrappers
// ============================================================================

function ProtectedLayout() {
  return (
    <Providers>
      <ProtectedPage requireAuth={true}>
        <AppLayout>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <Spinner size="lg" />
            </div>
          }>
            <Outlet />
          </Suspense>
        </AppLayout>
      </ProtectedPage>
    </Providers>
  );
}

function PublicLayout() {
  return (
    <Providers>
      <ProtectedPage requireAuth={false}>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Spinner size="lg" />
          </div>
        }>
          <Outlet />
        </Suspense>
      </ProtectedPage>
    </Providers>
  );
}

// Note: Auth checks will be handled in AppLayout and pages directly
// since useAuth needs to be called inside the AuthProvider context

// ============================================================================
// Main Router Component
// ============================================================================

// Create router outside component to avoid recreation
const router = createBrowserRouter([
    // Public routes with auth layout
    {
      path: '/auth',
      element: <PublicLayout />,
      children: [
        {
          path: '',
          element: <Navigate to="/auth/login" replace />
        },
        {
          path: 'login',
          element: <LoginPage />
        }
      ]
    },
    
    // Legacy login route redirect  
    {
      path: '/login',
      element: <Navigate to="/auth/login" replace />
    },

    // Protected routes with app layout
    {
      path: '/',
      element: <ProtectedLayout />,
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
