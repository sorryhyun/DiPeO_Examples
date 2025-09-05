// filepath: src/pages/LoginPage.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { User, LoginCredentials, ApiResult } from '@/core/contracts';
import { config } from '@/app/config';
import { publishEvent } from '@/core/events';
import { runHook } from '@/core/hooks';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { fadeInUp, staggerContainer, scaleIn } from '@/theme/animations';

interface LoginFormData extends LoginCredentials {
  rememberMe: boolean;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState<LoginFormData>({
    email: config.development_mode.enable_mock_data ? 'admin@hospital.local' : '',
    password: config.development_mode.enable_mock_data ? 'password' : '',
    rememberMe: false,
  });
  
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Refs for accessibility focus management
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  
  // Auto-focus email input on mount
  useEffect(() => {
    if (emailRef.current) {
      emailRef.current.focus();
    }
  }, []);
  
  // Focus error message when errors appear
  useEffect(() => {
    if (errors.general && errorRef.current) {
      errorRef.current.focus();
    }
  }, [errors.general]);
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    
    // Focus first invalid field
    if (newErrors.email && emailRef.current) {
      emailRef.current.focus();
    } else if (newErrors.password && passwordRef.current) {
      passwordRef.current.focus();
    }
    
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Run pre-login hooks
      await runHook('beforeApiRequest', {
        url: '/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          email: formData.email,
          password: formData.password,
        },
      });
      
      // Attempt login
      const result = await login({
        email: formData.email,
        password: formData.password,
      });
      
      if (result.success) {
        // Publish login event
        await publishEvent('auth:login', {
          user: result.data?.user,
          tokens: result.data?.tokens,
        });
        
        // Run post-login hooks
        await runHook('onLogin', {
          user: result.data?.user,
          tokens: result.data?.tokens,
        });
        
        // Show success toast
        await publishEvent('toast:show', {
          type: 'success',
          message: `Welcome back, ${result.data?.user?.name || 'User'}!`,
          autoDismiss: 3000,
        });
        
        // Navigate happens automatically via useAuth hook
      } else {
        // Handle login failure
        const errorMessage = result.error?.message || 'Login failed. Please try again.';
        
        setErrors({
          general: errorMessage,
        });
        
        // Show error toast
        await publishEvent('toast:show', {
          type: 'error',
          message: errorMessage,
          autoDismiss: 5000,
        });
        
        // Focus password field for retry
        if (passwordRef.current) {
          passwordRef.current.select();
          passwordRef.current.focus();
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      setErrors({
        general: errorMessage,
      });
      
      await publishEvent('toast:show', {
        type: 'error',
        message: errorMessage,
        autoDismiss: 5000,
      });
      
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleInputChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'rememberMe' ? e.target.checked : e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear field-specific errors when user starts typing
    if (errors[field as keyof LoginFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow Enter to submit form from any field
    if (e.key === 'Enter' && !isSubmitting) {
      handleSubmit(e as any);
    }
    
    // Handle escape to clear errors
    if (e.key === 'Escape') {
      setErrors({});
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div 
        className="max-w-md w-full space-y-8"
        {...staggerContainer}
      >
        {/* Header */}\n        <div className="text-center" {...fadeInUp}>\n          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 mb-4">\n            <svg\n              className="w-6 h-6 text-white"\n              fill="none"\n              stroke="currentColor"\n              viewBox="0 0 24 24"\n              aria-hidden="true"\n            >\n              <path\n                strokeLinecap="round"\n                strokeLinejoin="round"\n                strokeWidth={2}\n                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"\n              />\n            </svg>\n          </div>\n          <h2 className="text-3xl font-bold text-gray-900">\n            Sign in to {config.appName}\n          </h2>\n          <p className="mt-2 text-sm text-gray-600">\n            Enter your credentials to access your account\n          </p>\n        </div>\n\n        {/* Login Form */}\n        <div className="bg-white py-8 px-6 shadow-lg rounded-xl" {...scaleIn}>\n          <form className="space-y-6" onSubmit={handleSubmit}>\n            {/* General Error Message */}\n            {errors.general && (\n              <div\n                ref={errorRef}\n                className="bg-red-50 border border-red-200 rounded-lg p-4"\n                role="alert"\n                aria-live="assertive"\n                tabIndex={-1}\n              >\n                <div className="flex">\n                  <svg\n                    className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0"\n                    fill="none"\n                    stroke="currentColor"\n                    viewBox="0 0 24 24"\n                    aria-hidden="true"\n                  >\n                    <path\n                      strokeLinecap="round"\n                      strokeLinejoin="round"\n                      strokeWidth={2}\n                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"\n                    />\n                  </svg>\n                  <div className="text-sm text-red-800">\n                    <p className="font-medium">Login Failed</p>\n                    <p>{errors.general}</p>\n                  </div>\n                </div>\n              </div>\n            )}\n\n            {/* Email Field */}\n            <div>\n              <label htmlFor="email" className="sr-only">\n                Email address\n              </label>\n              <Input\n                ref={emailRef}\n                id="email"\n                name="email"\n                type="email"\n                autoComplete="email"\n                required\n                placeholder="Email address"\n                value={formData.email}\n                onChange={handleInputChange('email')}\n                onKeyDown={handleKeyDown}\n                error={errors.email}\n                aria-describedby={errors.email ? "email-error" : undefined}\n                disabled={isSubmitting || isLoading}\n              />\n              {errors.email && (\n                <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">\n                  {errors.email}\n                </p>\n              )}\n            </div>\n\n            {/* Password Field */}\n            <div>\n              <label htmlFor="password" className="sr-only">\n                Password\n              </label>\n              <Input\n                ref={passwordRef}\n                id="password"\n                name="password"\n                type="password"\n                autoComplete="current-password"\n                required\n                placeholder="Password"\n                value={formData.password}\n                onChange={handleInputChange('password')}\n                onKeyDown={handleKeyDown}\n                error={errors.password}\n                aria-describedby={errors.password ? "password-error" : undefined}\n                disabled={isSubmitting || isLoading}\n              />\n              {errors.password && (\n                <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">\n                  {errors.password}\n                </p>\n              )}\n            </div>\n\n            {/* Remember Me Checkbox */}\n            <div className="flex items-center justify-between">\n              <div className="flex items-center">\n                <input\n                  id="remember-me"\n                  name="remember-me"\n                  type="checkbox"\n                  checked={formData.rememberMe}\n                  onChange={handleInputChange('rememberMe')}\n                  disabled={isSubmitting || isLoading}\n                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"\n                />\n                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">\n                  Remember me\n                </label>\n              </div>\n\n              <div className="text-sm">\n                <a\n                  href="#"\n                  className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"\n                  onClick={(e) => {\n                    e.preventDefault();\n                    // TODO: Implement forgot password functionality\n                    publishEvent('toast:show', {\n                      type: 'info',\n                      message: 'Forgot password functionality coming soon',\n                      autoDismiss: 3000,\n                    });\n                  }}\n                >\n                  Forgot password?\n                </a>\n              </div>\n            </div>\n\n            {/* Submit Button */}\n            <div>\n              <Button\n                ref={submitRef}\n                type="submit"\n                variant="primary"\n                size="lg"\n                disabled={isSubmitting || isLoading}\n                loading={isSubmitting || isLoading}\n                className="w-full"\n                aria-describedby={errors.general ? "general-error" : undefined}\n              >\n                {isSubmitting || isLoading ? 'Signing in...' : 'Sign in'}\n              </Button>\n            </div>\n          </form>\n\n          {/* Development Mode Helper */}\n          {config.development_mode.enable_mock_data && import.meta.env.DEV && (\n            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">\n              <div className="flex">\n                <svg\n                  className="w-5 h-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0"\n                  fill="none"\n                  stroke="currentColor"\n                  viewBox="0 0 24 24"\n                  aria-hidden="true"\n                >\n                  <path\n                    strokeLinecap="round"\n                    strokeLinejoin="round"\n                    strokeWidth={2}\n                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"\n                  />\n                </svg>\n                <div className="text-sm text-yellow-800">\n                  <p className="font-medium">Development Mode</p>\n                  <p>Mock credentials are pre-filled. Use any password to login.</p>\n                </div>\n              </div>\n            </div>\n          )}\n        </div>\n\n        {/* Footer */}\n        <div className="text-center text-sm text-gray-600" {...fadeInUp}>\n          <p>\n            Don't have an account?{' '}\n            <a\n              href="#"\n              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"\n              onClick={(e) => {\n                e.preventDefault();\n                // TODO: Implement registration functionality\n                publishEvent('toast:show', {\n                  type: 'info',\n                  message: 'Registration functionality coming soon',\n                  autoDismiss: 3000,\n                });\n              }}\n            >\n              Sign up here\n            </a>\n          </p>\n        </div>\n      </div>\n    </div>\n  );\n};\n\nexport default LoginPage;\n\n// Self-check comments:\n// [x] Uses `@/` imports only\n// [x] Uses providers/hooks (no direct DOM/localStorage side effects)\n// [x] Reads config from `@/app/config`\n// [x] Exports default named component\n// [x] Adds basic ARIA and keyboard handlers (where relevant)\n```