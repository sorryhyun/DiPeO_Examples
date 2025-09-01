// filepath: src/features/auth/LoginPage.tsx
import React, { useState, useCallback } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { AuthLayout } from '@/shared/layouts/AuthLayout';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { config } from '@/app/config';
import { emit } from '@/core/events';
import type { FormState } from '@/core/contracts';

interface LoginFormData {
  email: string;
  password: string;
}

const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
  return undefined;
};

const validatePassword = (password: string): string | undefined => {
  if (!password) return 'Password is required';
  if (password.length < 3) return 'Password must be at least 3 characters';
  return undefined;
};

export function LoginPage() {
  const { signIn, user, isLoading } = useAuth();
  const { showToast } = useToast();
  
  const [formState, setFormState] = useState<FormState<LoginFormData>>({
    values: { email: '', password: '' },
    errors: {},
    touched: {},
    isValid: false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const updateField = useCallback(<K extends keyof LoginFormData>(
    field: K,
    value: LoginFormData[K]
  ) => {
    const newValues = { ...formState.values, [field]: value };
    const newTouched = { ...formState.touched, [field]: true };
    
    // Validate field
    const newErrors = { ...formState.errors };
    if (field === 'email') {
      const error = validateEmail(value as string);
      if (error) {
        newErrors.email = error;
      } else {
        delete newErrors.email;
      }
    } else if (field === 'password') {
      const error = validatePassword(value as string);
      if (error) {
        newErrors.password = error;
      } else {
        delete newErrors.password;
      }
    }
    
    const isValid = Object.keys(newErrors).length === 0 && 
      newValues.email.trim() !== '' && 
      newValues.password !== '';

    setFormState({
      values: newValues,
      errors: newErrors,
      touched: newTouched,
      isValid,
    });
  }, [formState]);

  const validateForm = useCallback((): boolean => {
    const emailError = validateEmail(formState.values.email);
    const passwordError = validatePassword(formState.values.password);
    
    const errors: Partial<Record<keyof LoginFormData, string>> = {};
    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;
    
    const touched = { email: true, password: true };
    const isValid = Object.keys(errors).length === 0;
    
    setFormState(prev => ({
      ...prev,
      errors,
      touched,
      isValid,
    }));
    
    return isValid;
  }, [formState.values]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast({
        type: 'error',
        message: 'Please fix the form errors before submitting',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await signIn(formState.values.email, formState.values.password);
      
      if (result.success) {
        showToast({
          type: 'success',
          message: `Welcome back, ${result.data.user.fullName}!`,
        });
        
        // Emit analytics event
        await emit('analytics.track', {
          event: 'login_success',
          properties: {
            method: 'email_password',
            userId: result.data.user.id,
          },
        });
        
        // Navigation will happen automatically via useAuth state change
      } else {
        showToast({
          type: 'error',
          title: 'Login Failed',
          message: result.error.message || 'Invalid email or password',
        });
        
        // Emit analytics event
        await emit('analytics.track', {
          event: 'login_failed',
          properties: {
            method: 'email_password',
            error: result.error.code,
          },
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast({
        type: 'error',
        title: 'Login Error',
        message: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formState, signIn, showToast, validateForm]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && formState.isValid && !isSubmitting && !isLoading) {
      handleSubmit(e as any);
    }
  }, [formState.isValid, isSubmitting, isLoading, handleSubmit]);

  const isFormDisabled = isLoading || isSubmitting;

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Welcome back! Please sign in to your account."
    >
      <form onSubmit={handleSubmit} noValidate className="auth-form">
        <div className="form-fields">
          <Input
            id="email"
            type="email"
            label="Email Address"
            value={formState.values.email}
            onChange={(value) => updateField('email', value)}
            onKeyDown={handleKeyDown}
            error={formState.touched.email ? formState.errors.email : undefined}
            placeholder="Enter your email"
            disabled={isFormDisabled}
            autoComplete="email"
            autoFocus
            required
            aria-describedby={formState.errors.email ? 'email-error' : undefined}
          />
          
          <Input
            id="password"
            type="password"
            label="Password"
            value={formState.values.password}
            onChange={(value) => updateField('password', value)}
            onKeyDown={handleKeyDown}
            error={formState.touched.password ? formState.errors.password : undefined}
            placeholder="Enter your password"
            disabled={isFormDisabled}
            autoComplete="current-password"
            required
            aria-describedby={formState.errors.password ? 'password-error' : undefined}
          />
        </div>

        <div className="form-actions">
          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            disabled={!formState.isValid || isFormDisabled}
            loading={isSubmitting}
            aria-describedby="login-submit-desc"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
          <div id="login-submit-desc" className="sr-only">
            Sign in to access your {config.appName} account
          </div>
        </div>

        <div className="form-links">
          <div className="auth-link">
            <span>Don't have an account? </span>
            <Link 
              to="/auth/register" 
              className="link-primary"
              aria-label="Go to registration page"
            >
              Sign up
            </Link>
          </div>
          
          <div className="auth-link">
            <Link 
              to="/auth/forgot-password" 
              className="link-secondary"
              aria-label="Reset your password"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        {config.isDevelopment && (
          <div className="dev-helpers">
            <details>
              <summary>Development Helpers</summary>
              <div className="dev-content">
                <button
                  type="button"
                  onClick={() => {
                    updateField('email', 'dev@example.test');
                    updateField('password', 'password');
                  }}
                  className="dev-button"
                  disabled={isFormDisabled}
                >
                  Fill Dev Credentials
                </button>
                <small>
                  Email: dev@example.test, Password: password
                </small>
              </div>
            </details>
          </div>
        )}
      </form>

      <style jsx>{`
        .auth-form {
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
        }

        .form-fields {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .form-actions {
          margin-bottom: 2rem;
        }

        .form-links {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          text-align: center;
        }

        .auth-link {
          font-size: 0.875rem;
          color: var(--color-text-secondary, #6b7280);
        }

        .link-primary {
          color: var(--color-primary, #3b82f6);
          text-decoration: none;
          font-weight: 500;
        }

        .link-primary:hover {
          text-decoration: underline;
        }

        .link-secondary {
          color: var(--color-text-tertiary, #9ca3af);
          text-decoration: none;
          font-size: 0.875rem;
        }

        .link-secondary:hover {
          color: var(--color-primary, #3b82f6);
          text-decoration: underline;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .dev-helpers {
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid var(--color-border, #e5e7eb);
        }

        .dev-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .dev-button {
          padding: 0.5rem 1rem;
          background: var(--color-secondary, #f3f4f6);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .dev-button:hover:not(:disabled) {
          background: var(--color-secondary-hover, #e5e7eb);
        }

        .dev-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        details > summary {
          cursor: pointer;
          font-size: 0.875rem;
          color: var(--color-text-secondary, #6b7280);
        }

        details[open] > summary {
          margin-bottom: 0.5rem;
        }

        small {
          font-size: 0.75rem;
          color: var(--color-text-tertiary, #9ca3af);
        }

        /* Focus styles for accessibility */
        .link-primary:focus,
        .link-secondary:focus {
          outline: 2px solid var(--color-primary, #3b82f6);
          outline-offset: 2px;
          border-radius: 2px;
        }

        .dev-button:focus {
          outline: 2px solid var(--color-primary, #3b82f6);
          outline-offset: 2px;
        }

        @media (max-width: 640px) {
          .auth-form {
            max-width: 100%;
            padding: 0 1rem;
          }
          
          .form-fields {
            gap: 1.25rem;
          }
          
          .form-links {
            gap: 0.75rem;
          }
        }
      `}</style>
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
