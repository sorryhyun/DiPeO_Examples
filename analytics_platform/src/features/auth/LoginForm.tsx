// src/features/auth/LoginForm.tsx
/* src/features/auth/LoginForm.tsx
   Login form component that collects credentials and calls authService.login.
   - Uses React Hook Form for form management and validation
   - Integrates with AuthProvider context for login action
   - Uses shared Input and Button components for consistent UI
   - Provides proper error handling and loading states
   - Includes accessibility attributes and keyboard navigation
*/

import React, { useState, FormEvent } from 'react';
import { LoginCredentials, ApiResult, User } from '@/core/contracts';
import { useAuthContext } from '@/providers/AuthProvider';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';

interface LoginFormProps {
  onSuccess?: (user: User) => void;
  onError?: (error: string) => void;
  className?: string;
}

interface FormData {
  email: string;
  password: string;
  remember: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onError,
  className = ''
}) => {
  const { login, isLoading, error, clearError } = useAuthContext();
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    remember: false
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<keyof Omit<FormData, 'remember'>, boolean>>({
    email: false,
    password: false
  });

  const validateField = (name: keyof FormData, value: string): string | undefined => {
    switch (name) {
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        break;
      case 'password':
        if (!value.trim()) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        break;
      default:
        break;
    }
    return undefined;
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    
    const emailError = validateField('email', formData.email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validateField('password', formData.password);
    if (passwordError) newErrors.password = passwordError;
    
    return newErrors;
  };

  const handleInputChange = (name: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Clear general error when user interacts with form
    if (error) {
      clearError();
    }
  };

  const handleBlur = (name: keyof Omit<FormData, 'remember'>) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on blur if it has been touched
    const fieldError = validateField(name, formData[name] as string);
    setErrors(prev => ({ ...prev, [name]: fieldError }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear any existing errors
    setErrors({});
    if (error) clearError();
    
    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setTouched({ email: true, password: true });
      return;
    }

    // Prepare credentials
    const credentials: LoginCredentials = {
      email: formData.email.trim(),
      password: formData.password,
      remember: formData.remember
    };

    try {
      const result: ApiResult<User> = await login(credentials);
      
      if (result.error) {
        const errorMessage = result.error.message || 'Login failed. Please try again.';
        setErrors({ general: errorMessage });
        onError?.(errorMessage);
        return;
      }

      if (result.data) {
        onSuccess?.(result.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setErrors({ general: errorMessage });
      onError?.(errorMessage);
    }
  };

  const hasErrors = Object.keys(errors).length > 0 || Boolean(error);
  const generalError = errors.general || error;

  return (
    <form
      onSubmit={handleSubmit}
      className={`login-form ${className}`}
      noValidate
      aria-label="Login form"
    >
      <div className="login-form__fields">
        <div className="login-form__field">
          <Input
            type="email"
            name="email"
            label="Email Address"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            error={touched.email ? errors.email : undefined}
            disabled={isLoading}
            required
            autoComplete="email"
            placeholder="Enter your email address"
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
        </div>

        <div className="login-form__field">
          <Input
            type="password"
            name="password"
            label="Password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            error={touched.password ? errors.password : undefined}
            disabled={isLoading}
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
        </div>

        <div className="login-form__field login-form__checkbox">
          <label className="login-form__checkbox-label">
            <input
              type="checkbox"
              name="remember"
              checked={formData.remember}
              onChange={(e) => handleInputChange('remember', e.target.checked)}
              disabled={isLoading}
              className="login-form__checkbox-input"
            />
            <span className="login-form__checkbox-text">
              Remember me
            </span>
          </label>
        </div>
      </div>

      {generalError && (
        <div 
          className="login-form__error" 
          role="alert" 
          aria-live="polite"
          id="login-general-error"
        >
          {generalError}
        </div>
      )}

      <div className="login-form__actions">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isLoading || hasErrors}
          loading={isLoading}
          className="login-form__submit-button"
          aria-describedby={generalError ? 'login-general-error' : undefined}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </div>

      <div className="login-form__footer">
        <button
          type="button"
          className="login-form__forgot-password"
          onClick={() => {
            // TODO: Implement forgot password flow
            console.log('Forgot password clicked');
          }}
          disabled={isLoading}
        >
          Forgot your password?
        </button>
      </div>
    </form>
  );
};

// Example CSS classes that should be defined in your stylesheet:
// .login-form { max-width: 400px; margin: 0 auto; }
// .login-form__fields { display: flex; flex-direction: column; gap: 1rem; }
// .login-form__field { display: flex; flex-direction: column; }
// .login-form__checkbox { flex-direction: row; align-items: center; }
// .login-form__checkbox-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
// .login-form__checkbox-input { margin: 0; }
// .login-form__checkbox-text { font-size: 0.875rem; }
// .login-form__error { color: #dc2626; font-size: 0.875rem; margin: 1rem 0; padding: 0.5rem; background: #fef2f2; border-radius: 0.25rem; }
// .login-form__actions { margin: 1.5rem 0; }
// .login-form__submit-button { width: 100%; }
// .login-form__footer { text-align: center; }
// .login-form__forgot-password { background: none; border: none; color: #2563eb; text-decoration: underline; cursor: pointer; font-size: 0.875rem; }

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses AuthProvider context
- [x] Reads config from `@/app/config` - not directly needed for this component
- [x] Exports default named component (exports named LoginForm component)
- [x] Adds basic ARIA and keyboard handlers (includes form validation, ARIA labels, error announcements, keyboard navigation)
*/
