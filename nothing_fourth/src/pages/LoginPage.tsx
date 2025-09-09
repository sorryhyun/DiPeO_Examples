// filepath: src/pages/LoginPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/shared/layouts/AuthLayout';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { config } from '@/app/config';
import { eventBus } from '@/core/events';
import { debugLog } from '@/core/utils';

// ===============================================
// Types & Interfaces
// ===============================================

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

// ===============================================
// Login Page Component
// ===============================================

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  
  const [formErrors, setFormErrors] = useState<LoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Refs for form management
  const formRef = useRef<HTMLFormElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  
  // Get redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }
  
  // ===============================================
  // Form Validation
  // ===============================================
  
  const validateForm = (): boolean => {
    const errors: LoginFormErrors = {};
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!formData.email.includes('@')) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // ===============================================
  // Event Handlers
  // ===============================================
  
  const handleInputChange = (field: keyof LoginFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear general error when user starts typing
    if (formErrors.general) {
      setFormErrors(prev => ({ ...prev, general: undefined }));
    }
  };
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Clear any existing auth errors
    if (error) {
      clearError();
    }
    
    // Validate form
    if (!validateForm()) {
      // Focus first error field
      if (formErrors.email && emailInputRef.current) {
        emailInputRef.current.focus();
      }
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormErrors({});
      
      debugLog('LoginPage: Attempting login for email:', formData.email);
      
      // Emit login attempt event
      await eventBus.emit('auth:login-attempt', {
        email: formData.email,
        timestamp: new Date().toISOString(),
      });
      
      // Attempt login
      await login(formData.email, formData.password);
      
      // On success, navigate to intended destination
      debugLog('LoginPage: Login successful, redirecting to:', from);
      navigate(from, { replace: true });
      
    } catch (loginError) {
      debugLog('LoginPage: Login failed:', loginError);
      
      // Set form error based on error type
      const errorMessage = loginError instanceof Error 
        ? loginError.message 
        : 'Login failed. Please try again.';
      
      setFormErrors({ general: errorMessage });
      
      // Emit login failure event
      await eventBus.emit('auth:login-failed', {
        email: formData.email,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });
      
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Handle Enter key to submit form
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  };
  
  // ===============================================
  // Effects
  // ===============================================
  
  // Focus email input on mount
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);
  
  // Clear form errors when auth error changes
  useEffect(() => {
    if (error && formErrors.general !== error) {
      setFormErrors(prev => ({ ...prev, general: error }));
    }
  }, [error, formErrors.general]);
  
  // Handle auth errors from provider
  useEffect(() => {
    if (error) {
      setFormErrors(prev => ({ ...prev, general: error }));
    }
  }, [error]);
  
  // ===============================================
  // Development Helpers
  // ===============================================
  
  const handleDemoLogin = async () => {
    if (config.isDevelopment) {
      setFormData({
        email: 'demo@example.com',
        password: 'password123',
      });
      
      // Trigger form validation and submission
      setTimeout(() => {
        formRef.current?.requestSubmit();
      }, 100);
    }
  };
  
  // ===============================================
  // Render
  // ===============================================
  
  const displayError = formErrors.general || error;
  const isFormDisabled = isLoading || isSubmitting;
  
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account"
      maxWidth="400px"
    >
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        className="space-y-6"
        noValidate
        role="form"
        aria-label="Login form"
      >
        {/* Error Display */}
        {displayError && (
          <div 
            className="p-3 rounded-md bg-error-50 border border-error-200 dark:bg-error-900/20 dark:border-error-800"
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-error-600 dark:text-error-400 mr-2 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-error-700 dark:text-error-300">
                {displayError}
              </p>
            </div>
          </div>
        )}
        
        {/* Email Input */}
        <Input
          ref={emailInputRef}
          type="email"
          label="Email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange('email')}
          error={formErrors.email}
          disabled={isFormDisabled}
          required
          autoComplete="email"
          aria-describedby="email-requirements"
        />
        
        {/* Password Input */}
        <Input
          type="password"
          label="Password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange('password')}
          error={formErrors.password}
          disabled={isFormDisabled}
          required
          autoComplete="current-password"
          aria-describedby="password-requirements"
        />
        
        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting || isLoading}
          disabled={isFormDisabled}
          className="mt-8"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
        
        {/* Development Demo Button */}
        {config.isDevelopment && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            fullWidth
            onClick={handleDemoLogin}
            disabled={isFormDisabled}
            className="mt-2"
          >
            Use Demo Credentials
          </Button>
        )}
      </form>
      
      {/* Additional Links */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Forgot your password?{' '}
          <button
            type="button"
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 focus:outline-none focus:underline transition-colors"
            onClick={() => {
              // TODO: Implement password reset flow
              debugLog('LoginPage: Password reset clicked');
            }}
          >
            Reset it here
          </button>
        </p>
      </div>
      
      {/* Hidden requirements for screen readers */}
      <div className="sr-only">
        <div id="email-requirements">
          Email must be a valid email address
        </div>
        <div id="password-requirements">
          Password must be at least 6 characters long
        </div>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/
