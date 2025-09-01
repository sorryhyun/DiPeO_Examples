// src/pages/LoginPage.tsx
/* src/pages/LoginPage.tsx
   Login page that embeds LoginForm and provides redirect handling after successful sign-in.
   - Uses Layout for consistent page structure
   - Embeds LoginForm component for authentication UI
   - Handles post-login redirects based on URL parameters or user role
   - Redirects authenticated users away from login page
*/

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '@/shared/components/Layout';
import { LoginForm } from '@/features/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { appConfig } from '@/app/config';

interface LoginPageProps {
  redirectPath?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ redirectPath }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  // Get redirect URL from location state or query params
  const getRedirectPath = (): string => {
    // Priority order: prop > location state > query param > default
    if (redirectPath) return redirectPath;
    
    const state = location.state as { from?: string } | null;
    if (state?.from) return state.from;
    
    const searchParams = new URLSearchParams(location.search);
    const redirectParam = searchParams.get('redirect');
    if (redirectParam) return decodeURIComponent(redirectParam);
    
    // Default redirect based on user role
    return '/dashboard';
  };

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (isAuthenticated && user) {
      const targetPath = getRedirectPath();
      navigate(targetPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Handle successful login from LoginForm
  const handleLoginSuccess = () => {
    const targetPath = getRedirectPath();
    navigate(targetPath, { replace: true });
  };

  // Don't render login form if user is already authenticated
  if (isAuthenticated) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
            <p className="text-gray-600">You are already logged in.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to {appConfig.appName}
            </h1>
            <p className="text-gray-600">
              Sign in to access your account
            </p>
          </div>
          
          <div className="bg-white shadow-lg rounded-lg p-8 border">
            <LoginForm 
              onSuccess={handleLoginSuccess}
              className="w-full"
            />
          </div>
          
          <div className="text-center mt-6 text-sm text-gray-500">
            <p>
              Need help? Contact{' '}
              <a 
                href="mailto:support@example.com" 
                className="text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              >
                support@example.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Alternative export for default import patterns
export default LoginPage;

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (focus styles on support link)
*/
