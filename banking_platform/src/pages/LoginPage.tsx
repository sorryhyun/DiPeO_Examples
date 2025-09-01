// filepath: src/pages/LoginPage.tsx
/* src/pages/LoginPage.tsx

Login page built with AuthLayout and accessible form, shows loading skeletons, error states, 
and integrates with AuthProvider to perform login flows.
*/

import React, { useState, useEffect, useRef } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { AuthLayout } from '@/shared/layouts/AuthLayout';
import { GlassCard } from '@/components/GlassCard';
import { GradientButton } from '@/components/GradientButton';
import { useAuth } from '@/hooks/useAuth';
import { appConfig } from '@/app/config';
import { ROUTES } from '@/constants/routes';
import { Icon } from '@/shared/components/Icon';
import type { FormState } from '@/core/contracts';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginPageProps {
  redirectTo?: string;
}

function LoginForm({ 
  onSubmit, 
  isLoading, 
  error 
}: { 
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}) {
  const [formState, setFormState] = useState<FormState<LoginFormData>>({
    values: { email: '', password: '' },
    touched: {},
    errors: {},
    submitting: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Focus email input on mount
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  // Pre-fill with mock data in development
  useEffect(() => {
    if (appConfig.shouldUseMockData && appConfig.mockUser) {
      setFormState(prev => ({
        ...prev,
        values: {
          email: appConfig.mockUser?.email || 'demo@local.test',
          password: 'password123',
        },
      }));
    }
  }, []);

  const validateField = (name: keyof LoginFormData, value: string): string | null => {
    switch (name) {
      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return null;
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return null;
      default:
        return null;
    }
  };

  const handleInputChange = (name: keyof LoginFormData, value: string) => {
    const error = validateField(name, value);
    
    setFormState(prev => ({
      ...prev,
      values: { ...prev.values, [name]: value },
      errors: { ...prev.errors, [name]: error },
      touched: { ...prev.touched, [name]: true },
    }));
  };

  const handleBlur = (name: keyof LoginFormData) => {
    const value = formState.values[name];
    const error = validateField(name, value);
    
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, [name]: error },
      touched: { ...prev.touched, [name]: true },
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validate all fields
    const errors: Partial<Record<keyof LoginFormData, string | null>> = {};
    Object.keys(formState.values).forEach(key => {
      const fieldName = key as keyof LoginFormData;
      errors[fieldName] = validateField(fieldName, formState.values[fieldName]);
    });

    const hasErrors = Object.values(errors).some(error => error !== null);
    
    setFormState(prev => ({
      ...prev,
      errors,
      touched: { email: true, password: true },
      submitting: !hasErrors,
    }));

    if (!hasErrors) {
      try {
        await onSubmit(formState.values);
      } catch (submitError) {
        // Error handling is done by the parent component
      } finally {
        setFormState(prev => ({ ...prev, submitting: false }));
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event as any);
    }
  };

  const hasFormErrors = Object.values(formState.errors).some(error => error !== null);
  const canSubmit = !hasFormErrors && formState.values.email && formState.values.password && !isLoading;

  return (
    <form 
      onSubmit={handleSubmit}
      className="login-form"
      noValidate
      aria-label="Sign in to your account"
    >
      {/* Global form error */}
      {error && (
        <div 
          className="form-error-global"
          role="alert"
          aria-live="polite"
        >
          <Icon name="alert" size="sm" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Email field */}
      <div className="form-field">
        <label 
          htmlFor="email"
          className="form-label"
        >
          Email Address
        </label>
        <input
          ref={emailInputRef}
          id="email"
          type="email"
          className={`form-input ${formState.errors.email && formState.touched.email ? 'form-input-error' : ''}`}
          value={formState.values.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          autoComplete="email"
          aria-describedby={formState.errors.email && formState.touched.email ? 'email-error' : undefined}
          aria-invalid={!!(formState.errors.email && formState.touched.email)}
          placeholder="Enter your email"
        />
        {formState.errors.email && formState.touched.email && (
          <div 
            id="email-error"
            className="form-error"
            role="alert"
            aria-live="polite"
          >
            {formState.errors.email}
          </div>
        )}
      </div>

      {/* Password field */}
      <div className="form-field">
        <label 
          htmlFor="password"
          className="form-label"
        >
          Password
        </label>
        <div className="password-input-wrapper">
          <input
            ref={passwordInputRef}
            id="password"
            type={showPassword ? 'text' : 'password'}
            className={`form-input ${formState.errors.password && formState.touched.password ? 'form-input-error' : ''}`}
            value={formState.values.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            autoComplete="current-password"
            aria-describedby={formState.errors.password && formState.touched.password ? 'password-error' : undefined}
            aria-invalid={!!(formState.errors.password && formState.touched.password)}
            placeholder="Enter your password"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(prev => !prev)}
            disabled={isLoading}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={0}
          >
            <Icon 
              name={showPassword ? 'eye-off' : 'eye'} 
              size="sm" 
              aria-hidden="true"
            />
          </button>
        </div>
        {formState.errors.password && formState.touched.password && (
          <div 
            id="password-error"
            className="form-error"
            role="alert"
            aria-live="polite"
          >
            {formState.errors.password}
          </div>
        )}
      </div>

      {/* Submit button */}
      <div className="form-actions">
        <GradientButton
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canSubmit}
          loading={isLoading}
          aria-describedby="submit-button-help"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </GradientButton>
        
        {appConfig.shouldUseMockData && (
          <div id="submit-button-help" className="form-help">
            Development mode: Form is pre-filled with demo credentials
          </div>
        )}
      </div>

      {/* Forgot password link */}
      <div className="form-footer">
        <Link 
          to="/forgot-password"
          className="forgot-password-link"
          tabIndex={isLoading ? -1 : 0}
        >
          Forgot your password?
        </Link>
      </div>

      <style jsx>{`
        .login-form {
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
        }

        .form-error-global {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          background: var(--color-error-subtle);
          color: var(--color-error);
          padding: var(--spacing-sm);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-error-border);
          margin-bottom: var(--spacing-md);
          font-size: 0.875rem;
        }

        .form-field {
          margin-bottom: var(--spacing-lg);
        }

        .form-label {
          display: block;
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: var(--spacing-xs);
          font-size: 0.875rem;
        }

        .form-input {
          width: 100%;
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-background-primary);
          color: var(--color-text-primary);
          font-size: 1rem;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px var(--color-accent-subtle);
        }

        .form-input:disabled {
          background: var(--color-background-disabled);
          color: var(--color-text-disabled);
          cursor: not-allowed;
        }

        .form-input-error {
          border-color: var(--color-error);
        }

        .form-input-error:focus {
          border-color: var(--color-error);
          box-shadow: 0 0 0 3px var(--color-error-subtle);
        }

        .password-input-wrapper {
          position: relative;
        }

        .password-input-wrapper .form-input {
          padding-right: 48px;
        }

        .password-toggle {
          position: absolute;
          right: var(--spacing-sm);
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          padding: var(--spacing-xs);
          color: var(--color-text-secondary);
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all 0.2s ease;
        }

        .password-toggle:hover:not(:disabled) {
          background: var(--color-background-secondary);
          color: var(--color-text-primary);
        }

        .password-toggle:focus {
          outline: 2px solid var(--color-accent);
          outline-offset: 2px;
        }

        .password-toggle:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .form-error {
          color: var(--color-error);
          font-size: 0.75rem;
          margin-top: var(--spacing-xs);
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }

        .form-actions {
          margin: var(--spacing-xl) 0 var(--spacing-md) 0;
        }

        .form-help {
          margin-top: var(--spacing-sm);
          font-size: 0.75rem;
          color: var(--color-text-secondary);
          text-align: center;
        }

        .form-footer {
          text-align: center;
          margin-top: var(--spacing-md);
        }

        .forgot-password-link {
          color: var(--color-accent);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .forgot-password-link:hover {
          color: var(--color-accent-dark);
          text-decoration: underline;
        }

        .forgot-password-link:focus {
          outline: 2px solid var(--color-accent);
          outline-offset: 2px;
          border-radius: var(--radius-sm);
        }

        @media (max-width: 480px) {
          .login-form {
            max-width: 100%;
          }

          .form-input {
            font-size: 16px; /* Prevent zoom on iOS */
          }
        }
      `}</style>
    </form>
  );
}

export function LoginPage({ redirectTo = ROUTES.DASHBOARD }: LoginPageProps) {
  const { user, isAuthenticated, isLoading, login, error } = useAuth();
  const [loginAttempting, setLoginAttempting] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated && user) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleLogin = async (credentials: LoginFormData) => {
    setLoginAttempting(true);
    try {
      await login(credentials.email, credentials.password);
      // Navigation will be handled by the redirect logic above
    } finally {
      setLoginAttempting(false);
    }
  };

  const isSubmitting = loginAttempting || isLoading;

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to access your healthcare dashboard"
    >
      <GlassCard 
        className="login-card"
        variant="elevated"
      >
        <div className="login-header">
          <Icon name="logo" size="xl" className="login-logo" />
          <h1 className="login-title">Sign In</h1>
          <p className="login-description">
            Enter your credentials to access your account
          </p>
        </div>

        <LoginForm
          onSubmit={handleLogin}
          isLoading={isSubmitting}
          error={error}
        />

        {appConfig.isDevelopment && (
          <div className="login-dev-info">
            <details className="dev-details">
              <summary className="dev-summary">Development Info</summary>
              <div className="dev-content">
                <p><strong>Mode:</strong> {appConfig.mode}</p>
                <p><strong>Mock Data:</strong> {appConfig.shouldUseMockData ? 'Enabled' : 'Disabled'}</p>
                {appConfig.mockUser && (
                  <>
                    <p><strong>Mock User:</strong></p>
                    <pre className="dev-code">{JSON.stringify(appConfig.mockUser, null, 2)}</pre>
                  </>
                )}
              </div>
            </details>
          </div>
        )}
      </GlassCard>

      <div className="login-footer">
        <p className="signup-prompt">
          Don't have an account?{' '}
          <Link 
            to="/signup" 
            className="signup-link"
            aria-label="Go to sign up page"
          >
            Sign up here
          </Link>
        </p>
      </div>

      <style jsx>{`
        .login-card {
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
          padding: var(--spacing-xl);
        }

        .login-header {
          text-align: center;
          margin-bottom: var(--spacing-xl);
        }

        .login-logo {
          margin-bottom: var(--spacing-md);
          color: var(--color-accent);
        }

        .login-title {
          margin: 0 0 var(--spacing-sm) 0;
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .login-description {
          margin: 0;
          color: var(--color-text-secondary);
          font-size: 1rem;
          line-height: 1.5;
        }

        .login-footer {
          text-align: center;
          margin-top: var(--spacing-lg);
        }

        .signup-prompt {
          margin: 0;
          color: var(--color-text-secondary);
          font-size: 0.875rem;
        }

        .signup-link {
          color: var(--color-accent);
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .signup-link:hover {
          color: var(--color-accent-dark);
          text-decoration: underline;
        }

        .signup-link:focus {
          outline: 2px solid var(--color-accent);
          outline-offset: 2px;
          border-radius: var(--radius-sm);
        }

        .login-dev-info {
          margin-top: var(--spacing-lg);
          padding-top: var(--spacing-md);
          border-top: 1px solid var(--color-border);
        }

        .dev-details {
          background: var(--color-background-secondary);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .dev-summary {
          padding: var(--spacing-sm) var(--spacing-md);
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          background: var(--color-background-tertiary);
          list-style: none;
          user-select: none;
        }

        .dev-summary::-webkit-details-marker {
          display: none;
        }

        .dev-summary::before {
          content: '▶';
          margin-right: var(--spacing-xs);
          transition: transform 0.2s ease;
        }

        .dev-details[open] .dev-summary::before {
          transform: rotate(90deg);
        }

        .dev-summary:hover {
          background: var(--color-background-hover);
        }

        .dev-summary:focus {
          outline: 2px solid var(--color-accent);
          outline-offset: -2px;
        }

        .dev-content {
          padding: var(--spacing-md);
          font-size: 0.75rem;
          color: var(--color-text-secondary);
          line-height: 1.4;
        }

        .dev-content p {
          margin: var(--spacing-xs) 0;
        }

        .dev-code {
          background: var(--color-background-primary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          padding: var(--spacing-sm);
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.6875rem;
          overflow-x: auto;
          white-space: pre;
          margin: var(--spacing-xs) 0;
        }

        @media (max-width: 600px) {
          .login-card {
            margin: 0;
            padding: var(--spacing-lg);
            border-radius: 0;
          }

          .login-title {
            font-size: 1.75rem;
          }
        }

        @media (max-width: 480px) {
          .login-card {
            padding: var(--spacing-md);
          }

          .login-title {
            font-size: 1.5rem;
          }

          .dev-content {
            padding: var(--spacing-sm);
          }
        }
      `}</style>
    </AuthLayout>
  );
}

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (useAuth hook, no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component (LoginPage)
// [x] Adds basic ARIA and keyboard handlers (form validation, ARIA labels, focus management, keyboard navigation)
