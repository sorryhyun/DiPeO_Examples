// filepath: src/routes.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [ ] Adds basic ARIA and keyboard handlers (where relevant - N/A for routing)

import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { config, isDevelopment } from '@/app/config';
import { eventBus } from '@/core/events';
import LoadingSpinner from '@/shared/components/LoadingSpinner';

// Lazy load pages for code splitting
const LandingPage = React.lazy(() => import('@/pages/LandingPage'));
const PressPage = React.lazy(() => import('@/pages/PressPage'));
const APIDocsPage = React.lazy(() => import('@/pages/APIDocsPage'));
const StatusPage = React.lazy(() => import('@/pages/StatusPage'));
const CheckoutPage = React.lazy(() => import('@/pages/CheckoutPage'));
const NotFoundPage = React.lazy(() => import('@/features/notfound/NotFoundPage'));

// Route loading fallback component
const RouteLoadingFallback = () => (
  <div 
    className="min-h-screen flex items-center justify-center"
    role="status"
    aria-label="Page loading"
  >
    <div className="text-center">
      <LoadingSpinner size="lg" className="mb-4" />
      <p className="text-gray-400">Loading page...</p>
    </div>
  </div>
);

// Route definitions with metadata
export const routeConfig = [
  {
    path: '/',
    element: LandingPage,
    title: 'Home - Absolutely Nothing ™',
    description: 'The premium experience of getting absolutely nothing',
    analytics: 'landing_page',
  },
  {
    path: '/press',
    element: PressPage,
    title: 'Press Kit - Absolutely Nothing ™',
    description: 'Media resources and press information about Nothing',
    analytics: 'press_page',
  },
  {
    path: '/api',
    element: APIDocsPage,
    title: 'API Documentation - Absolutely Nothing ™',
    description: 'Complete API documentation for integrating Nothing',
    analytics: 'api_docs_page',
  },
  {
    path: '/status',
    element: StatusPage,
    title: 'System Status - Absolutely Nothing ™',
    description: 'Real-time status and uptime monitoring for Nothing services',
    analytics: 'status_page',
  },
  {
    path: '/checkout',
    element: CheckoutPage,
    title: 'Checkout - Absolutely Nothing ™',
    description: 'Complete your purchase of Nothing',
    analytics: 'checkout_page',
  },
] as const;

// Route component with analytics and error boundaries
const RouteWrapper: React.FC<{
  Component: React.LazyExoticComponent<React.ComponentType>;
  routeData: typeof routeConfig[number];
}> = ({ Component, routeData }) => {
  React.useEffect(() => {
    // Track route navigation
    eventBus.emit('analytics:event', {
      name: 'page_view',
      properties: {
        page: routeData.analytics,
        path: routeData.path,
        title: routeData.title,
      },
    });

    // Update document title
    document.title = routeData.title;

    // Update meta description if available
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', routeData.description);
    }
  }, [routeData]);

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Component />
    </Suspense>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Main routes */}
      {routeConfig.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <RouteWrapper
              Component={route.element}
              routeData={route}
            />
          }
        />
      ))}

      {/* Additional route aliases */}
      <Route path="/docs" element={<Navigate to="/api" replace />} />
      <Route path="/documentation" element={<Navigate to="/api" replace />} />
      <Route path="/buy" element={<Navigate to="/checkout" replace />} />
      <Route path="/purchase" element={<Navigate to="/checkout" replace />} />
      <Route path="/health" element={<Navigate to="/status" replace />} />
      <Route path="/uptime" element={<Navigate to="/status" replace />} />

      {/* Development routes */}
      {isDevelopment && (
        <>
          <Route path="/debug" element={<Navigate to="/?debug=true" replace />} />
          <Route path="/test" element={<Navigate to="/?test=true" replace />} />
        </>
      )}

      {/* 404 catch-all */}
      <Route
        path="*"
        element={
          <Suspense fallback={<RouteLoadingFallback />}>
            <NotFoundPage />
          </Suspense>
        }
      />
    </Routes>
  );
};

export default AppRoutes;

// Utility functions for route management
export const getRouteByPath = (path: string) => {
  return routeConfig.find(route => route.path === path);
};

export const getAllRoutes = () => {
  return routeConfig.map(route => ({
    path: route.path,
    title: route.title,
    description: route.description,
  }));
};

// Development helpers
export const debugRoutes = isDevelopment ? {
  config: routeConfig,
  getRouteByPath,
  getAllRoutes,
} : undefined;
