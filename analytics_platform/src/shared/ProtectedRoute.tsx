// src/shared/ProtectedRoute.tsx
/* src/shared/ProtectedRoute.tsx
   Route guard that redirects unauthenticated users to the login page. Uses useAuth internally.
   - Checks authentication status via useAuth hook
   - Shows loading spinner while auth state is being determined
   - Redirects to login page if user is not authenticated
   - Renders children if user is authenticated
   - Preserves intended destination for post-login redirect
*/

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/shared/components/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth state is being determined
  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen"
        role="status"
        aria-label="Loading authentication status"
      >
        <Spinner size="lg" />
        <span className="sr-only">Checking authentication status...</span>
      </div>
    );
  }

  // Redirect to login if not authenticated, preserving intended destination
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

// Example usage:
// import { ProtectedRoute } from '@/shared/ProtectedRoute'
// 
// function App() {
//   return (
//     <Routes>
//       <Route path="/login" element={<LoginPage />} />
//       <Route
//         path="/dashboard"
//         element={
//           <ProtectedRoute>
//             <DashboardPage />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/profile"
//         element={
//           <ProtectedRoute redirectTo="/custom-login">
//             <ProfilePage />
//           </ProtectedRoute>
//         }
//       />
//     </Routes>
//   )
// }

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses useAuth hook
- [x] Reads config from `@/app/config` (not needed for this route guard component)
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (adds role="status" and aria-label for loading state)
*/
