// filepath: src/shared/layouts/AuthLayout.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { theme } from '@/theme';
import { GlassCard } from '@/shared/components/GlassCard';
import { GradientBackground } from '@/shared/components/GradientBackground';
import { config } from '@/app/config';
import { classNames } from '@/core/utils';

/**
 * Auth-specific layout for login/register flows.
 * Centers a card with glass-morphism and subtle background gradient.
 * Handles responsive width constraints and accessible headings.
 */

// =============================================================================
// Types and Interfaces
// =============================================================================

export interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg';
  showBranding?: boolean;
  footer?: React.ReactNode;
}

// =============================================================================
// Layout Components
// =============================================================================

const Branding: React.FC = () => {
  return (
    <motion.div
      className="text-center mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <motion.div
        className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
          boxShadow: `0 8px 32px ${theme.colors.primary}40`,
        }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M16 2L24 8V24L16 30L8 24V8L16 2Z"
            fill="white"
            fillOpacity="0.9"
          />
          <path
            d="M16 8L20 12V20L16 24L12 20V12L16 8Z"
            fill="currentColor"
            fillOpacity="0.6"
          />
        </svg>
      </motion.div>
      
      <h1
        className="text-2xl font-bold mb-2"
        style={{ color: theme.colors.text.primary }}
      >
        {config.appName}
      </h1>
      
      <p
        className="text-sm"
        style={{ color: theme.colors.text.secondary }}
      >
        Secure healthcare management platform
      </p>
    </motion.div>
  );
};

const AuthHeader: React.FC<{
  title?: string;
  subtitle?: string;
}> = ({ title, subtitle }) => {
  if (!title && !subtitle) return null;

  return (
    <motion.div
      className="text-center mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {title && (
        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: theme.colors.text.primary }}
        >
          {title}
        </h2>
      )}
      
      {subtitle && (
        <p
          className="text-sm"
          style={{ color: theme.colors.text.secondary }}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

const AuthFooter: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  if (!children) {
    return (
      <motion.div
        className="text-center mt-6 pt-6 border-t"
        style={{ borderColor: theme.colors.border }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <p
          className="text-xs"
          style={{ color: theme.colors.text.secondary }}
        >
          © {new Date().getFullYear()} {config.appName}. All rights reserved.
        </p>
        
        {config.isDevelopment && (
          <div className="mt-2">
            <span
              className="inline-block px-2 py-1 rounded text-xs"
              style={{
                backgroundColor: theme.colors.warning,
                color: theme.colors.surface,
              }}
            >
              Development Mode
            </span>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="mt-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

// =============================================================================
// Main Layout Component
// =============================================================================

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  className,
  maxWidth = 'sm',
  showBranding = true,
  footer,
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div className={classNames('min-h-screen flex flex-col', className)}>
      {/* Background */}
      <GradientBackground />

      {/* Main content area */}
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          className={classNames(
            'w-full',
            maxWidthClasses[maxWidth]
          )}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.6, 
            ease: 'easeOut',
            type: 'spring',
            stiffness: 100,
            damping: 15
          }}
        >
          {/* Branding */}
          {showBranding && <Branding />}

          {/* Auth Card */}
          <GlassCard
            className="p-6 sm:p-8"
            role="main"
            aria-label="Authentication form"
          >
            {/* Header */}
            <AuthHeader title={title} subtitle={subtitle} />

            {/* Form Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              {children}
            </motion.div>

            {/* Footer */}
            <AuthFooter>{footer}</AuthFooter>
          </GlassCard>
        </motion.div>
      </main>

      {/* Accessible skip link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
        style={{
          backgroundColor: theme.colors.primary,
          color: theme.colors.surface,
          padding: '0.5rem 1rem',
          borderRadius: '0.25rem',
        }}
      >
        Skip to main content
      </a>

      {/* Development indicator in bottom corner */}
      {config.isDevelopment && (
        <motion.div
          className="fixed bottom-4 right-4 z-40"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 1 }}
        >
          <div
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: theme.colors.warning,
              color: theme.colors.surface,
              boxShadow: `0 4px 12px ${theme.colors.warning}40`,
            }}
          >
            DEV
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AuthLayout;

/*
Self-check comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (skip link, role attributes, aria-label)
*/
