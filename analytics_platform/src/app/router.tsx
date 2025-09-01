// src/app/router.tsx
/* src/app/router.tsx
   React Router setup with application routes.
   - Maps routes to pages using React Router v6
   - Uses ProtectedRoute wrapper for authenticated routes
   - Includes lazy loading for better performance
   - Handles 404 with NotFoundPage
*/

import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/shared/ProtectedRoute';
import { Spinner } from '@/shared/components/Spinner';

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('@/pages/HomePage'));
const LoginPage = React.lazy(() => import('@/pages/LoginPage'));
const DashboardPage = React.lazy(() => import('@/pages/DashboardPage'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'));

// Loading fallback component
function LoadingFallback() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <Spinner size="lg" />
    </div>
  );
}

export function Router() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes - require authentication */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect /app to /dashboard for convenience */}
          <Route path="/app" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

// Export as AppRouter for consistency with section exports
export const AppRouter = Router;

// Default export for convenience
export default Router;

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (not needed for routing setup)
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (loading states have proper ARIA labels)
*/
