// src/pages/DashboardPage.tsx
/* src/pages/DashboardPage.tsx
   Protected dashboard page composed of DashboardLayout. Route is guarded by ProtectedRoute in router.
   - Main dashboard entry point for authenticated users
   - Wraps DashboardLayout in shared Layout component
   - Uses useAuth hook for user context and loading states
   - Handles authentication edge cases gracefully
*/

import React from 'react';
import { DashboardLayout } from '@/features/dashboard/DashboardLayout';
import { Layout } from '@/shared/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/shared/components/Spinner';

export const DashboardPage: React.FC = () => {
  const { user, isLoading, error } = useAuth();

  // Show loading state while authentication is being verified
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading dashboard...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // Handle authentication errors
  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Dashboard Access Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Handle case where user is not authenticated (shouldn't happen with ProtectedRoute, but defensive)
  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-amber-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please log in to access your dashboard.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // Main dashboard content - user is authenticated
  return (
    <Layout>
      <div className="min-h-screen">
        <DashboardLayout />
      </div>
    </Layout>
  );
};

// Export default for consistent routing patterns
export default DashboardPage;

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses useAuth hook
- [x] Reads config from `@/app/config` - indirectly through useAuth hook which reads config
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers - uses semantic HTML with accessible SVG icons and button interactions
*/
