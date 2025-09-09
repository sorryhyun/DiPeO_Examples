// filepath: src/pages/Login/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { AuthLayout } from '@/shared/layouts/AuthLayout';
import { Input } from '@/shared/components/Input/Input';
import { Button } from '@/shared/components/Button/Button';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/shared/components/Skeleton/Skeleton';
import type { LoginCredentials, FormState } from '@/core/contracts';
import { config } from '@/app/config';
import { eventBus } from '@/core/events';
import { classNames } from '@/core/utils';

interface LoginFormState extends FormState<LoginCredentials> {
  isSubmitting: boolean;
}

export default function LoginPage() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [formState, setFormState] = useState<LoginFormState>({
    values: {
      email: '',
      password: ''
    },
    errors: {},
    touched: {},
    isSubmitting: false
  });

  const [loginError, setLoginError] = useState<string | null>(null);

  // Redirect if already authenticated
  if (isAuthenticated && !authLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  // Reset login error when form values change
  useEffect(() => {
    if (loginError) {
      setLoginError(null);
    }
  }, [formState.values.email, formState.values.password]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof LoginCredentials, string>> = {};
    
    // Email validation
    if (!formState.values.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.values.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formState.values.password) {
      errors.password = 'Password is required';
    } else if (formState.values.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof LoginCredentials) => (value: string) => {
    setFormState(prev => ({
      ...prev,
      values: {
        ...prev.values,
        [field]: value
      },
      touched: {
        ...prev.touched,
        [field]: true
      },
      errors: {
        ...prev.errors,
        [field]: undefined // Clear error when user types
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || formState.isSubmitting) {
      return;
    }

    setFormState(prev => ({ ...prev, isSubmitting: true }));
    setLoginError(null);

    try {
      const result = await login(formState.values);
      
      if (!result.success) {
        setLoginError(result.error?.message || 'Login failed. Please try again.');
        
        // Track login failure for analytics
        eventBus.emit('analytics:event', {
          name: 'login_failed',
          properties: {
            error_code: result.error?.code,
            email: formState.values.email
          }
        });
      } else {
        // Success is handled by AuthProvider redirect
        eventBus.emit('analytics:event', {
          name: 'login_success',
          properties: {
            email: formState.values.email
          }
        });
      }
    } catch (error) {
      setLoginError('An unexpected error occurred. Please try again.');
      
      eventBus.emit('analytics:event', {
        name: 'login_error',
        properties: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !formState.isSubmitting) {
      handleSubmit(e as any);
    }
  };

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <AuthLayout 
        title="Welcome Back"
        subtitle="Sign in to your account to continue"
      >
        <div className="space-y-4">
          <Skeleton height="48px" />
          <Skeleton height="48px" />
          <Skeleton height="44px" />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
    >
      <form 
        onSubmit={handleSubmit} 
        className="space-y-6"
        noValidate
        aria-label="Login form"
      >
        {/* Global error message */}
        {loginError && (
          <div 
            className={classNames(
              'p-4 rounded-lg border text-sm',
              'bg-red-50 border-red-200 text-red-800'
            )}
            role="alert"
            aria-live="polite"
          >
            {loginError}
          </div>
        )}

        {/* Email field */}
        <div className="space-y-2">
          <Input
            id="email"
            name="email"
            type="email"
            label="Email Address"
            placeholder="Enter your email"
            value={formState.values.email}
            onChange={handleInputChange('email')}
            error={formState.touched.email ? formState.errors.email : undefined}
            disabled={formState.isSubmitting}
            autoComplete="email"
            autoFocus
            onKeyDown={handleKeyDown}
            aria-describedby={formState.errors.email ? 'email-error' : undefined}
          />
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={formState.values.password}
            onChange={handleInputChange('password')}
            error={formState.touched.password ? formState.errors.password : undefined}
            disabled={formState.isSubmitting}
            autoComplete="current-password"
            onKeyDown={handleKeyDown}
            aria-describedby={formState.errors.password ? 'password-error' : undefined}
          />
        </div>

        {/* Forgot password link */}
        <div className="flex justify-end">
          <Link 
            to="/forgot-password"
            className={classNames(
              'text-sm font-medium transition-colors',
              'text-blue-600 hover:text-blue-500',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded'
            )}
            tabIndex={formState.isSubmitting ? -1 : 0}
          >
            Forgot your password?
          </Link>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={formState.isSubmitting}
          loading={formState.isSubmitting}
          className="mt-6"
        >
          {formState.isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>

        {/* Development mode helpers */}
        {config.isDevelopment && (
          <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 mb-2">Development Mode:</p>
            <div className="space-x-2">
              <button
                type="button"
                onClick={() => {
                  handleInputChange('email')('admin@example.com');
                  handleInputChange('password')('password123');
                }}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
                disabled={formState.isSubmitting}
              >
                Fill Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  handleInputChange('email')('doctor@example.com');
                  handleInputChange('password')('password123');
                }}
                className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded"
                disabled={formState.isSubmitting}
              >
                Fill Doctor
              </button>
            </div>
          </div>
        )}

        {/* Sign up link */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link 
              to="/signup"
              className={classNames(
                'font-medium transition-colors',
                'text-blue-600 hover:text-blue-500',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded'
              )}
              tabIndex={formState.isSubmitting ? -1 : 0}
            >
              Create one here
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

/*
Self-check comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/
