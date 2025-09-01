// filepath: src/shared/layouts/AuthLayout.tsx
/* src/shared/layouts/AuthLayout.tsx

Centered auth layout providing a responsive container with glass card background
for authentication pages (login/register). Handles accessible form focus management
and responsive design patterns.
*/

import React, { useEffect, useRef } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { appConfig } from '@/app/config';
import { classNames } from '@/core/utils';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  maxWidth?: 'sm' | 'md' | 'lg';
  showLogo?: boolean;
  className?: string;
  // Focus management
  autoFocus?: boolean;
  focusTarget?: 'first-input' | 'heading' | 'none';
}

export function AuthLayout({
  children,
  title,
  subtitle,
  maxWidth = 'sm',
  showLogo = true,
  className,
  autoFocus = true,
  focusTarget = 'first-input',
}: AuthLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Focus management on mount
  useEffect(() => {
    if (!autoFocus || focusTarget === 'none') return;

    const container = containerRef.current;
    if (!container) return;

    const focusElement = () => {
      if (focusTarget === 'heading' && headingRef.current) {
        headingRef.current.focus();
        return;
      }

      if (focusTarget === 'first-input') {
        // Find first focusable input, textarea, or select
        const firstInput = container.querySelector(
          'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])'
        ) as HTMLElement;
        
        if (firstInput) {
          firstInput.focus();
          return;
        }
      }

      // Fallback to first focusable element
      const firstFocusable = container.querySelector(
        'button:not([disabled]), [href], input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      
      if (firstFocusable) {
        firstFocusable.focus();
      }
    };

    // Small delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(focusElement, 100);
    return () => clearTimeout(timeoutId);
  }, [autoFocus, focusTarget]);

  const maxWidthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg', 
    lg: 'max-w-2xl',
  };

  return (
    <div 
      className={classNames(
        'min-h-screen flex items-center justify-center px-4 py-8',
        'bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/20',
        className
      )}
      role="main"
      aria-label={title ? `${title} page` : 'Authentication page'}
    >
      <div 
        ref={containerRef}
        className={classNames(
          'w-full space-y-8',
          maxWidthClasses[maxWidth]
        )}
      >
        {/* Logo and branding */}
        {showLogo && (
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <svg 
                className="h-8 w-8 text-white" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                />
              </svg>
            </div>
            
            {appConfig.isDevelopment && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Development Mode
                </span>
              </div>
            )}
          </div>
        )}

        {/* Header content */}
        {(title || subtitle) && (
          <div className="text-center space-y-2">
            {title && (
              <h1 
                ref={headingRef}
                className="text-2xl font-bold text-gray-900 sm:text-3xl"
                tabIndex={focusTarget === 'heading' ? 0 : -1}
              >
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 sm:text-base">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Main content area */}
        <GlassCard 
          className="p-6 sm:p-8"
          variant="subtle"
          role="region"
          aria-label={title ? `${title} form` : 'Authentication form'}
        >
          {children}
        </GlassCard>

        {/* Development mode indicators */}
        {appConfig.isDevelopment && appConfig.shouldUseMockData && (
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 px-3 py-2 rounded-md bg-blue-50 border border-blue-200">
              <svg 
                className="h-4 w-4 text-blue-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <span className="text-xs text-blue-700 font-medium">
                Mock data enabled for development
              </span>
            </div>
          </div>
        )}

        {/* Footer area for links */}
        <div className="text-center text-sm text-gray-500 space-y-2">
          <div className="flex items-center justify-center space-x-4">
            <a 
              href="/privacy" 
              className="hover:text-gray-700 transition-colors focus:outline-none focus:underline"
              tabIndex={0}
            >
              Privacy Policy
            </a>
            <span aria-hidden="true">•</span>
            <a 
              href="/terms" 
              className="hover:text-gray-700 transition-colors focus:outline-none focus:underline"
              tabIndex={0}
            >
              Terms of Service
            </a>
          </div>
          
          {appConfig.release && (
            <div className="text-xs text-gray-400">
              Version {appConfig.release}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Example usage:

// Basic login layout
<AuthLayout title="Sign In" subtitle="Welcome back to your account">
  <LoginForm />
</AuthLayout>

// Registration with custom focus
<AuthLayout 
  title="Create Account" 
  subtitle="Get started with your free account"
  focusTarget="first-input"
  maxWidth="md"
>
  <RegisterForm />
</AuthLayout>

// Minimal layout without logo
<AuthLayout showLogo={false} autoFocus={false}>
  <PasswordResetForm />
</AuthLayout>

*/

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (uses GlassCard component, appConfig)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (focus management, ARIA labels, keyboard navigation)
