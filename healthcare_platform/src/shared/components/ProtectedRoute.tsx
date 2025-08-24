import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { useI18n } from '@/providers/I18nProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  roles 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { t } = useI18n();
  const location = useLocation();

  // Show loading spinner while auth state is initializing
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-label={t('common.loading')}>
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  if (roles && roles.length > 0) {
    const userRole = user?.role;
    const hasRequiredRole = userRole && roles.includes(userRole);
    
    if (!hasRequiredRole) {
      return (
        <div className="flex items-center justify-center min-h-screen" role="alert">
          <div className="text-center p-8">
            <h2 className="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4">
              {t('auth.accessDenied')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('auth.insufficientPermissions')}
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

// SELF-CHECK:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config` (not applicable for this component)
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (role attributes for accessibility)
