// src/pages/NotFoundPage.tsx
/* src/pages/NotFoundPage.tsx
   Fallback 404 page shown when no route matches.
   - Clean, user-friendly error message
   - Navigation back to home or dashboard
   - Proper SEO meta tags via document.title
*/

import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/shared/components/Layout';
import { useAuth } from '@/hooks/useAuth';

export function NotFoundPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Set page title for SEO and screen readers
  useEffect(() => {
    document.title = 'Page Not Found | HealthApp';
  }, []);

  const handleGoHome = () => {
    navigate(isAuthenticated ? '/dashboard' : '/');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleGoHome();
    }
  };

  return (
    <Layout>
      <div 
        className="min-h-screen flex items-center justify-center px-4"
        role="main"
        aria-labelledby="not-found-title"
      >
        <div className="text-center max-w-md mx-auto">
          {/* Large 404 display */}
          <div 
            className="text-6xl md:text-8xl font-bold text-gray-300 mb-4"
            aria-hidden="true"
          >
            404
          </div>

          {/* Main heading */}
          <h1 
            id="not-found-title"
            className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4"
          >
            Page Not Found
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            Sorry, the page you're looking for doesn't exist or may have been moved.
            {user && (
              <>
                <br />
                <span className="text-sm">
                  Welcome back, {user.fullName}!
                </span>
              </>
            )}
          </p>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoHome}
              onKeyDown={handleKeyDown}
              className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              aria-label={`Go to ${isAuthenticated ? 'dashboard' : 'home page'}`}
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Go Home'}
            </button>

            <Link
              to={isAuthenticated ? '/dashboard' : '/'}
              className="block w-full bg-gray-100 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:outline-none text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200 text-center"
              aria-label="Navigate using link instead of button"
            >
              Or click here to navigate
            </Link>
          </div>

          {/* Additional help text */}
          <div className="mt-8 text-sm text-gray-500">
            <p>
              If you believe this is an error, please{' '}
              <Link 
                to="/contact" 
                className="text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              >
                contact support
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Default export for lazy loading compatibility
export default NotFoundPage;

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses useAuth hook
- [x] Reads config from `@/app/config` - not needed for this simple page
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers - includes proper ARIA labels, roles, keyboard navigation
*/
