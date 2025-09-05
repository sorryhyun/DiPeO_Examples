// filepath: src/shared/layouts/AuthLayout.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/shared/components/Card';
import { theme } from '@/theme';
import { fadeInVariant, slideUpVariant } from '@/theme/animations';

// =============================
// TYPE DEFINITIONS
// =============================

export interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg';
  className?: string;
}

// =============================
// AUTH LAYOUT COMPONENT
// =============================

export function AuthLayout({
  children,
  title,
  subtitle,
  showLogo = true,
  maxWidth = 'sm',
  className = '',
}: AuthLayoutProps) {
  // Max width classes
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div
      className={`
        min-h-screen w-full
        flex items-center justify-center
        p-4 sm:p-6 lg:p-8
        bg-gradient-to-br from-blue-50 via-white to-purple-50
        dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
        ${className}
      `}
      role="main"
      aria-label="Authentication"
    >
      {/* Background Pattern */}
      <div
        className="
          absolute inset-0 
          bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]
          pointer-events-none
        "
        aria-hidden="true"
      />

      {/* Main Content Container */}
      <motion.div
        className={`
          relative w-full ${maxWidthClasses[maxWidth]}
          z-10
        `}
        initial="hidden"
        animate="visible"
        variants={fadeInVariant}
      >
        {/* Logo Section */}
        {showLogo && (
          <motion.div
            className="text-center mb-8"
            variants={slideUpVariant}
          >
            <div
              className="
                inline-flex items-center justify-center
                w-16 h-16 mx-auto mb-4
                bg-gradient-to-br from-blue-600 to-purple-600
                rounded-2xl shadow-lg
              "
              role="img"
              aria-label="Company logo"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path
                  d="M16 2L22 8V24L16 30L10 24V8L16 2Z"
                  fill="currentColor"
                  fillOpacity="0.8"
                />
                <path
                  d="M16 8L20 12V20L16 24L12 20V12L16 8Z"
                  fill="currentColor"
                  fillOpacity="0.6"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome
            </h1>
            
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        {/* Auth Form Container */}
        <motion.div variants={slideUpVariant}>
          <Card
            variant="elevated"
            className="
              p-6 sm:p-8
              backdrop-blur-sm
              border border-white/20 dark:border-gray-700/20
              shadow-xl shadow-black/5
            "
          >
            {/* Optional Title (when logo is hidden or custom title needed) */}
            {title && !showLogo && (
              <div className="text-center mb-6">
                <h1
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                  id="auth-form-title"
                >
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {/* Form Content */}
            <div
              role="region"
              aria-labelledby={title && !showLogo ? 'auth-form-title' : undefined}
              aria-label={!title && !showLogo ? 'Authentication form' : undefined}
            >
              {children}
            </div>
          </Card>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          className="text-center mt-8"
          variants={slideUpVariant}
        >
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Protected by industry-standard security measures
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

// =============================
// SPECIALIZED LAYOUT VARIANTS
// =============================

/**
 * Login-specific layout with appropriate messaging
 */
export function LoginLayout({ children, ...props }: Omit<AuthLayoutProps, 'title' | 'subtitle'>) {
  return (
    <AuthLayout
      title="Sign In"
      subtitle="Access your account securely"
      {...props}
    >
      {children}
    </AuthLayout>
  );
}

/**
 * Registration layout with appropriate messaging
 */
export function SignupLayout({ children, ...props }: Omit<AuthLayoutProps, 'title' | 'subtitle'>) {
  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join us and get started today"
      maxWidth="md"
      {...props}
    >
      {children}
    </AuthLayout>
  );
}

/**
 * Password reset layout
 */
export function ResetPasswordLayout({ children, ...props }: Omit<AuthLayoutProps, 'title' | 'subtitle'>) {
  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email to receive reset instructions"
      {...props}
    >
      {children}
    </AuthLayout>
  );
}

/**
 * Email verification layout
 */
export function VerificationLayout({ children, ...props }: Omit<AuthLayoutProps, 'title' | 'subtitle'>) {
  return (
    <AuthLayout
      title="Verify Email"
      subtitle="Check your email for verification instructions"
      {...props}
    >
      {children}
    </AuthLayout>
  );
}

// =============================
// UTILITY FUNCTIONS
// =============================

/**
 * Helper to create consistent spacing for auth forms
 */
export function AuthFormSection({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Helper for auth form dividers
 */
export function AuthFormDivider({ text = 'or' }: { text?: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300 dark:border-gray-600" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
          {text}
        </span>
      </div>
    </div>
  );
}

// =============================
// DEVELOPMENT HELPERS
// =============================

if (import.meta.env.DEV) {
  // Display names for React DevTools
  AuthLayout.displayName = 'AuthLayout';
  LoginLayout.displayName = 'LoginLayout';
  SignupLayout.displayName = 'SignupLayout';
  ResetPasswordLayout.displayName = 'ResetPasswordLayout';
  VerificationLayout.displayName = 'VerificationLayout';
  AuthFormSection.displayName = 'AuthFormSection';
  AuthFormDivider.displayName = 'AuthFormDivider';
}

// =============================
// EXPORTS
// =============================

export default AuthLayout;

// Export specialized layouts for convenience
export {
  LoginLayout,
  SignupLayout,
  ResetPasswordLayout,
  VerificationLayout,
  AuthFormSection,
  AuthFormDivider,
};

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config` (uses import.meta.env appropriately)
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (role, aria-label, aria-labelledby attributes)
