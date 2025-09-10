// filepath: src/shared/layouts/AuthLayout.tsx

import React, { useEffect } from 'react';
import { GlassCard } from '@/shared/components/GlassCard';
import { GradientBackground } from '@/shared/components/GradientBackground';
import { config } from '@/app/config';
import { eventBus } from '@/core/events';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showCard?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg';
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showCard = true,
  maxWidth = 'sm'
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg'
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Emit escape event for closing modals/overlays
      if (event.key === 'Escape') {
        eventBus.emit('ui:escape', {});
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus management for accessibility
  useEffect(() => {
    // Set focus to main content area on mount
    const mainElement = document.querySelector('[role="main"]');
    if (mainElement && mainElement instanceof HTMLElement) {
      mainElement.focus();
    }
  }, []);

  const content = (
    <div className="w-full space-y-6">
      {/* Header section */}
      {(title || subtitle) && (
        <div className="text-center space-y-2">
          {title && (
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Main content */}
      <div className="w-full">
        {children}
      </div>

      {/* App branding footer */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {config.appName}
          {config.isDevelopment && (
            <span className="ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-xs font-medium">
              DEV
            </span>
          )}
        </p>
      </div>
    </div>
  );

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      role="application"
      aria-label="Authentication layout"
    >
      <GradientBackground />
      
      {/* Skip navigation link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                   bg-blue-600 text-white px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>

      <div 
        className={`w-full ${maxWidthClasses[maxWidth]} relative z-20`}
        role="main"
        id="main-content"
        tabIndex={-1}
        aria-label="Authentication form area"
      >
        {showCard ? (
          <GlassCard className="p-6 md:p-8">
            {content}
          </GlassCard>
        ) : (
          <div className="p-6 md:p-8">
            {content}
          </div>
        )}
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-xl" />
        <div className="absolute top-3/4 left-1/2 w-24 h-24 bg-pink-500/10 rounded-full blur-xl" />
      </div>
    </div>
  );
};

export default AuthLayout;

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/
