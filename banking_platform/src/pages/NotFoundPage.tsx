// filepath: src/pages/NotFoundPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/shared/layouts/AppLayout';
import { ROUTES } from '@/constants/routes';

export function NotFoundPage() {
  return (
    <AppLayout>
      <div className="not-found-container">
        <div className="not-found-content">
          <div className="error-code">404</div>
          <h1 className="error-title">Page Not Found</h1>
          <p className="error-message">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="suggestion-links">
            <Link 
              to={ROUTES.HOME} 
              className="suggestion-link primary"
              aria-label="Go to home page"
            >
              Go Home
            </Link>
            <Link 
              to={ROUTES.LOGIN} 
              className="suggestion-link secondary"
              aria-label="Go to login page"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .not-found-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          padding: 2rem 1rem;
          text-align: center;
        }

        .not-found-content {
          max-width: 500px;
        }

        .error-code {
          font-size: 8rem;
          font-weight: 800;
          color: var(--color-primary-500, #3b82f6);
          line-height: 1;
          margin-bottom: 1rem;
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .error-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--color-gray-900, #111827);
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .error-message {
          font-size: 1.125rem;
          color: var(--color-gray-600, #4b5563);
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }

        .suggestion-links {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .suggestion-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease-in-out;
          min-width: 120px;
          border: 2px solid transparent;
        }

        .suggestion-link:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .suggestion-link.primary {
          background-color: var(--color-primary-600, #2563eb);
          color: white;
          border-color: var(--color-primary-600, #2563eb);
        }

        .suggestion-link.primary:hover {
          background-color: var(--color-primary-700, #1d4ed8);
          border-color: var(--color-primary-700, #1d4ed8);
          transform: translateY(-1px);
        }

        .suggestion-link.secondary {
          background-color: transparent;
          color: var(--color-gray-700, #374151);
          border-color: var(--color-gray-300, #d1d5db);
        }

        .suggestion-link.secondary:hover {
          background-color: var(--color-gray-50, #f9fafb);
          border-color: var(--color-gray-400, #9ca3af);
          transform: translateY(-1px);
        }

        @media (max-width: 640px) {
          .error-code {
            font-size: 6rem;
          }

          .error-title {
            font-size: 2rem;
          }

          .error-message {
            font-size: 1rem;
            margin-bottom: 2rem;
          }

          .suggestion-links {
            flex-direction: column;
            align-items: center;
          }

          .suggestion-link {
            width: 200px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .suggestion-link {
            transition: none;
          }

          .suggestion-link:hover {
            transform: none;
          }
        }

        @media (prefers-color-scheme: dark) {
          .error-title {
            color: var(--color-gray-100, #f3f4f6);
          }

          .error-message {
            color: var(--color-gray-400, #9ca3af);
          }

          .suggestion-link.secondary {
            color: var(--color-gray-300, #d1d5db);
            border-color: var(--color-gray-600, #4b5563);
          }

          .suggestion-link.secondary:hover {
            background-color: var(--color-gray-800, #1f2937);
            border-color: var(--color-gray-500, #6b7280);
          }
        }
      `}</style>
    </AppLayout>
  );
}

export default NotFoundPage;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config` (not needed for this simple page)
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (aria-label on links, focus styles)
