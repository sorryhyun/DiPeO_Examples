// filepath: src/pages/NotFound/NotFoundPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/Button/Button';
import { MainLayout } from '@/shared/layouts/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { config } from '@/app/config';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleGoHome = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <MainLayout>
      <div 
        className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
        role="main"
        aria-labelledby="not-found-title"
      >
        <div className="max-w-md w-full text-center">
          {/* Large 404 Number */}
          <div 
            className="text-6xl sm:text-8xl font-bold text-primary-500 mb-4"
            aria-hidden="true"
          >
            404
          </div>
          
          {/* Error Message */}
          <h1 
            id="not-found-title"
            className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-4"
          >
            Page Not Found
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg leading-relaxed">
            Sorry, we couldn't find the page you're looking for. 
            The page might have been moved, deleted, or you entered an incorrect URL.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleGoHome}
              className="order-1 sm:order-1"
              aria-describedby="home-button-description"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
            </Button>
            
            <Button
              variant="secondary"
              size="lg"
              onClick={handleGoBack}
              className="order-2 sm:order-2"
              aria-describedby="back-button-description"
            >
              Go Back
            </Button>
          </div>
          
          {/* Screen Reader Descriptions */}
          <div className="sr-only">
            <div id="home-button-description">
              {isAuthenticated 
                ? 'Navigate to the main dashboard page'
                : 'Navigate to the login page to access your account'
              }
            </div>
            <div id="back-button-description">
              Navigate back to the previous page you were viewing
            </div>
          </div>
          
          {/* Additional Help Text */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              If you believe this is an error, please{' '}
              <a 
                href={`mailto:${config.supportEmail || 'support@example.com'}`}
                className="text-primary-600 hover:text-primary-500 underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
              >
                contact support
              </a>
              {' '}or try refreshing the page.
            </p>
          </div>
          
          {/* Development Info */}
          {config.isDevelopment && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                <strong>Dev Info:</strong> Current path: {window.location.pathname}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Custom Styles */}
      <style>{`
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-float {
            animation: none;
          }
        }
      `}</style>
    </MainLayout>
  );
};

export default NotFoundPage;

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses useAuth and useNavigate hooks
- [x] Reads config from `@/app/config` - uses config for supportEmail and isDevelopment
- [x] Exports default named component - exports both named and default NotFoundPage
- [x] Adds basic ARIA and keyboard handlers (where relevant) - includes role="main", aria-labelledby, aria-describedby, focus management, and screen reader descriptions
*/
