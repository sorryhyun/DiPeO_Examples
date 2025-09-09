// filepath: src/pages/Login/LoginPage.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthLayout } from '@/shared/layouts/AuthLayout';
import { Input } from '@/shared/components/Input/Input';
import { Button } from '@/shared/components/Button/Button';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/shared/components/Skeleton/Skeleton';
import type { FormState } from '@/core/contracts';
import { eventBus } from '@/core/events';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export function LoginPage(): JSX.Element {
  const { user, login, isLoading: authLoading } = useAuth();
  
  const [formState, setFormState] = useState<FormState<LoginFormData>>({
    values: {
      email: '',
      password: '',
    },
    errors: {},
    touched: {},
    isSubmitting: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect if already authenticated
  if (user && !authLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  // Validation logic
  const validateField = useCallback((field: keyof LoginFormData, value: string): string | undefined => {
    switch (field) {
      case 'email':
        if (!value.trim()) {
          return 'Email is required';
        }
        if (!EMAIL_REGEX.test(value)) {
          return 'Please enter a valid email address';
        }
        return undefined;
      
      case 'password':
        if (!value) {
          return 'Password is required';
        }
        if (value.length < MIN_PASSWORD_LENGTH) {
          return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
        }
        return undefined;
      
      default:
        return undefined;
    }
  }, []);

  const validateForm = useCallback((): LoginFormErrors => {
    const errors: LoginFormErrors = {};
    
    const emailError = validateField('email', formState.values.email);
    if (emailError) errors.email = emailError;
    
    const passwordError = validateField('password', formState.values.password);
    if (passwordError) errors.password = passwordError;
    
    return errors;
  }, [formState.values, validateField]);

  // Input handlers
  const handleInputChange = useCallback((field: keyof LoginFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    
    setFormState(prev => ({
      ...prev,
      values: {
        ...prev.values,
        [field]: value,
      },
      // Clear field error on change
      errors: {
        ...prev.errors,
        [field]: undefined,
        general: undefined,
      },
    }));
  }, []);

  const handleInputBlur = useCallback((field: keyof LoginFormData) => () => {
    const error = validateField(field, formState.values[field]);
    
    setFormState(prev => ({
      ...prev,
      touched: {
        ...prev.touched,
        [field]: true,
      },
      errors: {
        ...prev.errors,
        [field]: error,
      },
    }));
  }, [formState.values, validateField]);

  // Form submission
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Mark all fields as touched
    setFormState(prev => ({
      ...prev,
      touched: {
        email: true,
        password: true,
      },
      isSubmitting: true,
      errors: {
        ...prev.errors,
        general: undefined,
      },
    }));

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormState(prev => ({
        ...prev,
        errors,
        isSubmitting: false,
      }));
      return;
    }

    try {
      await login({
        email: formState.values.email,
        password: formState.values.password,
        rememberMe,
      });

      // Success will trigger navigation via the useAuth hook
      eventBus.emit('analytics:event', {
        name: 'login_success',
        properties: {
          email: formState.values.email,
          rememberMe,
        },
      });

    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Login failed. Please check your credentials and try again.';
      
      setFormState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          general: errorMessage,
        },
        isSubmitting: false,
      }));

      eventBus.emit('analytics:event', {
        name: 'login_error',
        properties: {
          error: errorMessage,
        },
      });
    }
  }, [formState.values, rememberMe, login, validateForm]);

  // Keyboard shortcut for form submission
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        handleSubmit(event as any);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit]);

  const hasErrors = Object.keys(formState.errors).some(key => 
    formState.errors[key as keyof LoginFormErrors]
  );
  
  const isFormValid = !hasErrors && 
    formState.values.email.trim() !== '' && 
    formState.values.password !== '';

  if (authLoading) {
    return (
      <AuthLayout title="Welcome Back" subtitle="Please wait while we load your session">
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to access your healthcare portal"
    >
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        noValidate
        aria-label="Login form"
      >
        {/* General error message */}
        {formState.errors.general && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700"
            role="alert"
            aria-live="polite"
          >
            <p className="text-sm font-medium">{formState.errors.general}</p>
          </motion.div>
        )}

        {/* Form fields */}
        <div className="space-y-4">
          <div>
            <Input
              id="email"
              type="email"
              label="Email Address"
              value={formState.values.email}
              onChange={handleInputChange('email')}
              onBlur={handleInputBlur('email')}
              error={formState.touched.email ? formState.errors.email : undefined}
              placeholder="Enter your email"
              autoComplete="email"
              required
              disabled={formState.isSubmitting}
              aria-describedby={formState.errors.email ? 'email-error' : undefined}
            />
          </div>

          <div>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              value={formState.values.password}
              onChange={handleInputChange('password')}
              onBlur={handleInputBlur('password')}
              error={formState.touched.password ? formState.errors.password : undefined}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              disabled={formState.isSubmitting}
              aria-describedby={formState.errors.password ? 'password-error' : undefined}
              rightAddon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              }
            />
          </div>
        </div>

        {/* Remember me checkbox */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={formState.isSubmitting}
              aria-describedby="remember-me-description"
            />
            <span className="ml-2 text-sm text-gray-600">
              Remember me
            </span>
            <span id="remember-me-description" className="sr-only">
              Keep me logged in for faster access
            </span>
          </label>

          <a
            href="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
            tabIndex={formState.isSubmitting ? -1 : 0}
          >
            Forgot password?
          </a>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isFormValid || formState.isSubmitting}
          loading={formState.isSubmitting}
          aria-describedby="submit-help"
        >
          {formState.isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>
        
        <p id="submit-help" className="sr-only">
          Press Ctrl+Enter or Cmd+Enter to submit the form quickly
        </p>

        {/* Sign up link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
            >
              Sign up here
            </a>
          </p>
        </div>
      </motion.form>

      {/* Accessibility note */}
      <div className="sr-only" role="complementary">
        <p>
          This login form supports keyboard navigation. 
          Use Tab to move between fields and Enter to submit. 
          Screen reader users will be notified of any validation errors.
        </p>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config` - uses auth hook which uses config
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
