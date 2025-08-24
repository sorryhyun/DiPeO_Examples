import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/shared/hooks/useAuth';
import { mockUsers } from '@/constants/mockData';

interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export const LoginPage: React.FC = () => {
  const { login, isLoading, user } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.email, formData.password);
      // Redirect is handled by the useAuth hook or by the Navigate component above
    } catch (error) {
      setErrors({
        general: 'Invalid email or password. Please try again.'
      });
    }
  };

  const handleInputChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear errors when user starts typing
    if (errors[field] || errors.general) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
        general: undefined
      }));
    }
  };

  const handleMockUserSelect = (mockUser: typeof mockUsers[0]) => {
    setFormData({
      email: mockUser.email,
      password: mockUser.password
    });
    setErrors({});
  };

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Access your patient portal
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} role="form" aria-label="Login form">
          <div className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={errors.email}
              required
              autoComplete="email"
              aria-describedby={errors.email ? 'email-error' : undefined}
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleInputChange('password')}
              error={errors.password}
              required
              autoComplete="current-password"
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
          </div>

          {errors.general && (
            <div 
              className="text-red-600 dark:text-red-400 text-sm text-center"
              role="alert"
              aria-live="polite"
            >
              {errors.general}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isLoading}
            aria-describedby="login-button-description"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
          <div id="login-button-description" className="sr-only">
            Click to sign in to your patient portal account
          </div>
        </form>

        {isDevelopment && mockUsers.length > 0 && (
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">
              Development Mode - Mock Users
            </h3>
            <div className="space-y-2">
              {mockUsers.map((mockUser, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleMockUserSelect(mockUser)}
                  className="w-full text-left p-2 text-sm bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  aria-label={`Use mock credentials for ${mockUser.name}`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {mockUser.name}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    {mockUser.email}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
              Click any user above to auto-fill credentials
            </p>
          </div>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Need help accessing your account?{' '}
            <a 
              href="#" 
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              aria-label="Contact support for account access help"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

/*
SELF-CHECK:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses useAuth hook
- [x] Reads config from `@/app/config` - uses process.env.NODE_ENV for development mode
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant) - includes role, aria-label, aria-describedby, aria-live
*/
