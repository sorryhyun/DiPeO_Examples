import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Spinner } from '@/shared/components/Spinner';

interface ProtectedPageProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const ProtectedPage: React.FC<ProtectedPageProps> = ({ 
  children, 
  requireAuth = true,
  redirectTo = '/auth/login'
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    // Save the attempted location
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (!requireAuth && isAuthenticated) {
    // Redirect to dashboard if already authenticated and trying to access public routes
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedPage;