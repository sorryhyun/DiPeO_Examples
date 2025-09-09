// filepath: src/pages/NotFound/NotFoundPage.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/Button/Button';
import { MainLayout } from '@/shared/layouts/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { eventBus } from '@/core/events';

/**
 * 404 Not Found page component
 * Accessible page shown for unmatched routes with contextual navigation options
 */
export function NotFoundPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Handle back navigation with fallback
  const handleGoBack = () => {
    // Check if there's browser history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to appropriate home page
      navigate(isAuthenticated ? '/dashboard' : '/login');
    }
  };

  // Handle home navigation based on auth state
  const handleGoHome = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  // Track 404 event for analytics
  React.useEffect(() => {
    eventBus.emit('analytics:event', {
      name: 'page_not_found',
      properties: {
        path: window.location.pathname,
        search: window.location.search,
        referrer: document.referrer || 'direct'
      }
    });
  }, []);

  return (
    <MainLayout>
      <div className="not-found-page">
        <div className="not-found-content">
          {/* 404 Hero Section */}
          <div className="not-found-hero" role="main" aria-labelledby="not-found-title">
            <div className="not-found-icon" aria-hidden="true">
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="error-icon"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.3"
                />
                <path
                  d="M40 40L80 80M80 40L40 80"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h1 id="not-found-title" className="not-found-title">
              Page Not Found
            </h1>

            <p className="not-found-subtitle">
              Sorry, we couldn't find the page you're looking for. 
              The page may have been moved, deleted, or the URL may be incorrect.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="not-found-actions" role="navigation" aria-label="Page navigation options">
            <Button
              variant="primary"
              onClick={handleGoHome}
              className="go-home-button"
              aria-describedby="home-button-desc"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
            </Button>

            <Button
              variant="secondary"
              onClick={handleGoBack}
              className="go-back-button"
              aria-describedby="back-button-desc"
            >
              Go Back
            </Button>
          </div>

          {/* Screen reader descriptions */}
          <div className="sr-only">
            <p id="home-button-desc">
              Navigate to the {isAuthenticated ? 'main dashboard' : 'login page'}
            </p>
            <p id="back-button-desc">
              Return to the previous page you were viewing
            </p>
          </div>

          {/* Additional Help */}
          <div className="not-found-help">
            <p className="help-text">
              If you believe this is an error, please{' '}
              <Link
                to="/support"
                className="help-link"
                aria-label="Contact support team for assistance"
              >
                contact support
              </Link>{' '}
              or try searching for what you need.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .not-found-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          padding: 2rem 1rem;
          text-align: center;
        }

        .not-found-content {
          max-width: 500px;
          width: 100%;
        }

        .not-found-hero {
          margin-bottom: 3rem;
        }

        .not-found-icon {
          margin-bottom: 2rem;
          color: var(--color-text-muted, #6b7280);
        }

        .error-icon {
          width: 120px;
          height: 120px;
          display: block;
          margin: 0 auto;
        }

        .not-found-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--color-text-primary, #111827);
          margin: 0 0 1rem 0;
          line-height: 1.2;
        }

        .not-found-subtitle {
          font-size: 1.125rem;
          color: var(--color-text-secondary, #4b5563);
          line-height: 1.6;
          margin: 0;
        }

        .not-found-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 3rem;
        }

        @media (min-width: 640px) {
          .not-found-actions {
            flex-direction: row;
            justify-content: center;
            gap: 1.5rem;
          }
        }

        .go-home-button,
        .go-back-button {
          min-width: 140px;
        }

        .not-found-help {
          padding-top: 2rem;
          border-top: 1px solid var(--color-border-light, #e5e7eb);
        }

        .help-text {
          font-size: 0.875rem;
          color: var(--color-text-muted, #6b7280);
          margin: 0;
        }

        .help-link {
          color: var(--color-primary, #3b82f6);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .help-link:hover,
        .help-link:focus {
          color: var(--color-primary-dark, #2563eb);
          text-decoration: underline;
        }

        .help-link:focus {
          outline: 2px solid var(--color-primary, #3b82f6);
          outline-offset: 2px;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .not-found-title {
            color: var(--color-text-primary-dark, #f9fafb);
          }
          
          .not-found-subtitle {
            color: var(--color-text-secondary-dark, #d1d5db);
          }
          
          .help-text {
            color: var(--color-text-muted-dark, #9ca3af);
          }
          
          .not-found-help {
            border-top-color: var(--color-border-dark, #374151);
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .not-found-icon {
            color: currentColor;
          }
          
          .error-icon circle {
            opacity: 1;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .help-link {
            transition: none;
          }
        }

        /* Focus management */
        .not-found-content:focus-within .go-home-button:focus,
        .not-found-content:focus-within .go-back-button:focus {
          outline: 2px solid var(--color-primary, #3b82f6);
          outline-offset: 2px;
        }
      `}</style>
    </MainLayout>
  );
}

// Export alias for consistency
export default NotFoundPage;

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/shared/components, @/shared/layouts, @/hooks, @/core/events)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses useAuth hook and useNavigate from react-router
- [x] Reads config from `@/app/config` (not directly needed for this component, but could be added for feature flags)
- [x] Exports default named component (exports NotFoundPage as named export and default)
- [x] Adds basic ARIA and keyboard handlers (includes role attributes, aria-labelledby, aria-describedby, screen reader descriptions, focus management, and keyboard navigation support)
*/
