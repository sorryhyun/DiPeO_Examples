// filepath: src/shared/layouts/AuthLayout.tsx
import React from 'react';
import { GlassCard } from '@/shared/components/Glass/GlassCard';
import { classNames } from '@/core/utils';

export interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  className?: string;
}

/**
 * Centered authentication layout with subtle background gradient and glass card.
 * Used for Login, Register, and other authentication flows.
 */
export function AuthLayout({ 
  children, 
  title, 
  subtitle, 
  showLogo = true, 
  className 
}: AuthLayoutProps) {
  return (
    <div className={classNames('auth-layout', className)}>
      {/* Background with subtle gradient */}
      <div className="auth-layout__background" />
      
      {/* Main content container */}
      <div className="auth-layout__container">
        <div className="auth-layout__content">
          {/* Optional logo */}
          {showLogo && (
            <div className="auth-layout__logo" role="img" aria-label="Application logo">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="auth-layout__logo-icon"
              >
                <rect
                  x="4"
                  y="4"
                  width="40"
                  height="40"
                  rx="8"
                  fill="currentColor"
                  fillOpacity="0.1"
                />
                <rect
                  x="8"
                  y="8"
                  width="32"
                  height="32"
                  rx="4"
                  fill="currentColor"
                  fillOpacity="0.2"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="8"
                  fill="currentColor"
                />
              </svg>
            </div>
          )}
          
          {/* Header content */}
          {(title || subtitle) && (
            <div className="auth-layout__header">
              {title && (
                <h1 className="auth-layout__title">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="auth-layout__subtitle">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          
          {/* Form content in glass card */}
          <GlassCard className="auth-layout__card">
            {children}
          </GlassCard>
          
          {/* Footer content */}
          <div className="auth-layout__footer">
            <p className="auth-layout__footer-text">
              © 2024 Healthcare App. All rights reserved.
            </p>
          </div>
        </div>
      </div>
      
      {/* Inline styles for the layout */}
      <style>{`
        .auth-layout {
          min-height: 100vh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          overflow-x: hidden;
        }
        
        .auth-layout__background {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            hsl(var(--color-primary-50)) 0%,
            hsl(var(--color-primary-100)) 25%,
            hsl(var(--color-secondary-50)) 50%,
            hsl(var(--color-primary-100)) 75%,
            hsl(var(--color-primary-200)) 100%
          );
          background-size: 400% 400%;
          animation: auth-gradient 15s ease infinite;
          z-index: -1;
        }
        
        @keyframes auth-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .auth-layout__container {
          width: 100%;
          max-width: 28rem;
          z-index: 1;
        }
        
        .auth-layout__content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }
        
        .auth-layout__logo {
          color: hsl(var(--color-primary-600));
          animation: fade-in-up 0.6s ease-out;
        }
        
        .auth-layout__logo-icon {
          width: 3rem;
          height: 3rem;
          filter: drop-shadow(0 4px 8px hsla(var(--color-primary-500), 0.2));
        }
        
        .auth-layout__header {
          text-align: center;
          animation: fade-in-up 0.6s ease-out 0.1s both;
        }
        
        .auth-layout__title {
          font-size: 2rem;
          font-weight: 700;
          color: hsl(var(--color-gray-900));
          margin: 0 0 0.5rem 0;
          line-height: 1.2;
        }
        
        .auth-layout__subtitle {
          font-size: 1rem;
          color: hsl(var(--color-gray-600));
          margin: 0;
          line-height: 1.5;
        }
        
        .auth-layout__card {
          width: 100%;
          animation: fade-in-up 0.6s ease-out 0.2s both;
        }
        
        .auth-layout__footer {
          animation: fade-in-up 0.6s ease-out 0.3s both;
        }
        
        .auth-layout__footer-text {
          font-size: 0.875rem;
          color: hsl(var(--color-gray-500));
          text-align: center;
          margin: 0;
        }
        
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(1rem);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .auth-layout__background {
            background: linear-gradient(
              135deg,
              hsl(var(--color-gray-900)) 0%,
              hsl(var(--color-gray-800)) 25%,
              hsl(var(--color-primary-900)) 50%,
              hsl(var(--color-gray-800)) 75%,
              hsl(var(--color-gray-900)) 100%
            );
          }
          
          .auth-layout__title {
            color: hsl(var(--color-gray-100));
          }
          
          .auth-layout__subtitle {
            color: hsl(var(--color-gray-400));
          }
          
          .auth-layout__footer-text {
            color: hsl(var(--color-gray-500));
          }
        }
        
        /* Responsive adjustments */
        @media (max-width: 640px) {
          .auth-layout {
            padding: 0.5rem;
          }
          
          .auth-layout__container {
            max-width: 24rem;
          }
          
          .auth-layout__title {
            font-size: 1.75rem;
          }
          
          .auth-layout__content {
            gap: 1.5rem;
          }
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .auth-layout__background {
            background: hsl(var(--color-gray-50));
          }
          
          .auth-layout__title {
            color: hsl(var(--color-gray-900));
          }
          
          .auth-layout__subtitle {
            color: hsl(var(--color-gray-700));
          }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .auth-layout__background {
            animation: none;
          }
          
          .auth-layout__logo,
          .auth-layout__header,
          .auth-layout__card,
          .auth-layout__footer {
            animation: none;
          }
        }
        
        /* Focus management for keyboard navigation */
        .auth-layout:focus-within .auth-layout__card {
          outline: 2px solid hsl(var(--color-primary-500));
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/shared/components/Glass/GlassCard and @/core/utils)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - pure layout component
- [x] Reads config from `@/app/config` (not needed for this layout component)
- [x] Exports default named component (exports AuthLayout)
- [x] Adds basic ARIA and keyboard handlers (includes role="img" for logo, focus-within styles for accessibility)
*/
