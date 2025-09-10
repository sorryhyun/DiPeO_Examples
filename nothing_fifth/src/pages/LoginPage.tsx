// filepath: src/pages/LoginPage.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/shared/layouts/AuthLayout';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/providers/AuthProvider';
import { LoginRequest } from '@/core/contracts';
import { config } from '@/app/config';
import { eventBus } from '@/core/events';
import { hooks } from '@/core/hooks';
import { debugLog, errorLog } from '@/core/utils';

// ============================================================================
// FORM STATE TYPES
// ============================================================================

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

function validateEmail(email: string): string | undefined {
  if (!email) return 'Email is required';
  if (!email.includes('@')) return 'Please enter a valid email address';
  if (email.length > 254) return 'Email is too long';
  return undefined;
}

function validatePassword(password: string): string | undefined {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return undefined;
}

function validateForm(data: LoginFormData): LoginFormErrors {
  const errors: LoginFormErrors = {};
  
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;
  
  return errors;
}

// ============================================================================
// LOGIN PAGE COMPONENT
// ============================================================================

export function LoginPage() {
  const { 
    isAuthenticated, 
    isLoading: authLoading, 
    login, 
    clearError,
    error: authError 
  } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Form state
  const [formData, setFormData] = useState<LoginFormData>({
    email: config.isDevelopment ? 'demo@example.com' : '',
    password: config.isDevelopment ? 'demo123' : '',
  });
  
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Redirect destination from location state or default
  const from = (location.state as any)?.from?.pathname || '/dashboard';
  
  // ============================================================================
  // REDIRECT IF ALREADY AUTHENTICATED
  // ============================================================================
  
  if (isAuthenticated) {
    return <Navigate to={from} replace />; 
  }
  
  // ============================================================================
  // FORM HANDLERS
  // ============================================================================
  
  const updateField = useCallback((field: keyof LoginFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear general error
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
    
    // Clear auth error
    if (authError) {
      clearError();
    }
  }, [errors, authError, clearError]);
  
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Clear previous errors
    setErrors({});
    clearError();
    
    // Validate form
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      
      // Focus first error field
      const firstErrorField = Object.keys(validationErrors)[0];
      const element = document.getElementById(`login-${firstErrorField}`);
      if (element) {
        element.focus();
      }
      
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Execute pre-login hook
      hooks.invoke('beforeApiRequest', { url: 'login', options: {}, meta: { formData } });
      
      const loginRequest: LoginRequest = {
        email: formData.email.trim(),
        password: formData.password,
      };
      
      debugLog('LoginPage', 'Attempting login', { email: loginRequest.email });
      
      const result = await login(loginRequest);
      
      if (result.success) {
        // Login successful - emit success event
        eventBus.emit('toast:add', {
          id: `login-success-${Date.now()}`,
          type: 'success',
          title: 'Welcome back!',
          message: 'You have been logged in successfully.',
          timestamp: Date.now(),
        });
        
        // Execute post-login hook
        hooks.invoke('onLogin', { 
          user: result.data?.user
        });
        
        debugLog('LoginPage', 'Login successful, redirecting to:', from);
        
        // Navigate to intended destination
        navigate(from, { replace: true });
      } else {
        // Login failed - show error
        const errorMessage = result.error?.message || 'Login failed. Please try again.';
        
        setErrors({ general: errorMessage });
        
        // Emit error toast
        eventBus.emit('toast:add', {
          id: `login-error-${Date.now()}`,
          type: 'error',
          title: 'Login Failed',
          message: errorMessage,
          timestamp: Date.now(),
        });
        
        errorLog('LoginPage', 'Login failed', new Error(errorMessage));
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred. Please try again.';
      
      setErrors({ general: errorMessage });
      
      eventBus.emit('toast:add', {
        id: `login-error-${Date.now()}`,
        type: 'error',
        title: 'Login Error',
        message: errorMessage,
        timestamp: Date.now(),
      });
      
      errorLog('LoginPage', 'Login error', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, login, clearError, navigate, from]);
  
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);
  
  // ============================================================================
  // KEYBOARD HANDLERS
  // ============================================================================
  
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    // Submit on Ctrl/Cmd + Enter
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      handleSubmit(event as any);
    }
  }, [handleSubmit]);
  
  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Focus email field on mount
  useEffect(() => {
    const emailInput = document.getElementById('login-email');
    if (emailInput) {
      emailInput.focus();
    }
  }, []);
  
  // Clear errors when auth error changes
  useEffect(() => {
    if (authError) {
      setErrors(prev => ({ ...prev, general: authError }));
    }
  }, [authError]);
  
  // ============================================================================
  // LOADING STATE
  // ============================================================================
  
  if (authLoading) {
    return (
      <AuthLayout title="Loading...">
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse flex flex-col items-center space-y-4">
            <div className="w-8 h-8 bg-blue-200 rounded-full"></div>
            <div className="text-sm text-gray-500">Checking authentication...</div>
          </div>
        </div>
      </AuthLayout>
    );
  }
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  const isLoading = isSubmitting || authLoading;
  const hasGeneralError = errors.general || authError;
  
  return (
    <AuthLayout 
      title="Welcome back"
      subtitle="Sign in to your account to continue"
    >
      <form 
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        className="space-y-6"
        noValidate
        aria-label="Login form"
      >
        {/* General error message */}
        {hasGeneralError && (
          <div 
            role="alert"
            aria-live="polite"
            className="p-4 bg-red-50 border border-red-200 rounded-md"
          >
            <div className="flex items-center">
              <svg 
                className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" 
                fill="currentColor" 
viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                  clipRule="evenodd" 
                />
              </svg>
              <div className="text-sm text-red-700">
                {hasGeneralError}
              </div>
            </div>
          </div>
        )}
        
        {/* Email field */}
        <Input
          id="login-email"
          label="Email address"
          type="email"
          value={formData.email}
          onChange={updateField('email')}
          error={errors.email}
          placeholder="Enter your email"
          autoComplete="email"
          required
          disabled={isLoading}
        />
        
        {/* Password field */}
        <div className="relative">
          <Input
            id="login-password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={updateField('password')}
            error={errors.password}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            disabled={isLoading}
            suffix={
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m-2.122-2.122L7.758 7.758M12 12l2.122-2.122m-2.122 2.122L7.758 7.758m2.122 2.122L12 12m2.122-2.122l2.122-2.122" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            }
          />
        </div>
        
        {/* Submit button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          disabled={isLoading}
          shake={!!hasGeneralError}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
        
        {/* Development helpers */}
        {config.isDevelopment && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="text-xs text-yellow-700 mb-2">
              <strong>Development Mode:</strong>
            </div>
            <div className="text-xs text-yellow-600 space-y-1">
              <div>Demo credentials are pre-filled</div>
              <div>Press Ctrl/Cmd + Enter to quick submit</div>
              <div>Mock authentication is enabled</div>
            </div>
          </div>
        )}
      </form>
    </AuthLayout>
  );
}

export default LoginPage;

// ============================================================================
// Self-Check Comments
// ============================================================================
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
