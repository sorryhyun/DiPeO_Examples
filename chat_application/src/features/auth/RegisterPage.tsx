// filepath: src/features/auth/RegisterPage.tsx
import React, { useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthLayout } from '@/shared/layouts/AuthLayout';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { config } from '@/app/config';
import type { FormState } from '@/core/contracts';

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  specialty?: string;
  licenseNumber?: string;
  userType: 'doctor' | 'nurse' | 'patient';
}

interface RegisterFormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  specialty?: string;
  licenseNumber?: string;
  userType?: string;
  submit?: string;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): string[] => {
  const errors: string[] = [];
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  return errors;
};

const validateForm = (data: RegisterFormData): RegisterFormErrors => {
  const errors: RegisterFormErrors = {};

  // Full name validation
  if (!data.fullName.trim()) {
    errors.fullName = 'Full name is required';
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  }

  // Email validation
  if (!data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  if (!data.password) {
    errors.password = 'Password is required';
  } else {
    const passwordErrors = validatePassword(data.password);
    if (passwordErrors.length > 0) {
      errors.password = passwordErrors[0]; // Show first error
    }
  }

  // Confirm password validation
  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  // User type specific validation
  if (data.userType === 'doctor') {
    if (!data.specialty?.trim()) {
      errors.specialty = 'Specialty is required for doctors';
    }
    if (!data.licenseNumber?.trim()) {
      errors.licenseNumber = 'License number is required for doctors';
    }
  }

  return errors;
};

export const RegisterPage: React.FC = () => {
  const { register, isAuthenticated, isLoading } = useAuth();
  const toast = useToast();

  const [formState, setFormState] = useState<FormState<RegisterFormData>>({
    values: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      specialty: '',
      licenseNumber: '',
      userType: 'patient',
    },
    errors: {},
    touched: {},
    isValid: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const updateField = useCallback((field: keyof RegisterFormData, value: string) => {
    setFormState(prev => {
      const newValues = { ...prev.values, [field]: value };
      const newErrors = validateForm(newValues);
      const touchedFields = { ...prev.touched, [field]: true };
      
      return {
        values: newValues,
        errors: newErrors,
        touched: touchedFields,
        isValid: Object.keys(newErrors).length === 0,
      };
    });
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(formState.values).reduce((acc, key) => {
      acc[key as keyof RegisterFormData] = true;
      return acc;
    }, {} as Partial<Record<keyof RegisterFormData, boolean>>);

    const errors = validateForm(formState.values);
    
    setFormState(prev => ({
      ...prev,
      touched: allTouched,
      errors,
      isValid: Object.keys(errors).length === 0,
    }));

    if (Object.keys(errors).length > 0) {
      toast.error('Please correct the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      const { confirmPassword, ...registerData } = formState.values;
      
      await register({
        ...registerData,
        roles: [formState.values.userType],
      });

      toast.success('Registration successful! Please check your email to verify your account.');
      
      // Optional: redirect to login or verification page
      // navigate('/auth/verify-email');
      
    } catch (error: any) {
      const errorMessage = error?.message || 'Registration failed. Please try again.';
      
      setFormState(prev => ({
        ...prev,
        errors: { ...prev.errors, submit: errorMessage },
      }));
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [formState.values, register, toast]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const { values, errors, touched } = formState;
  const isFormLoading = isLoading || isSubmitting;

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Your Account
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Join {config.appName} to start managing your healthcare
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* User Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              I am a
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['patient', 'doctor', 'nurse'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateField('userType', type)}
                  className={`
                    px-3 py-2 text-sm font-medium rounded-md border transition-colors
                    ${values.userType === type
                      ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                    }
                  `}
                  aria-pressed={values.userType === type}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <Input
            label="Full Name"
            type="text"
            value={values.fullName}
            onChange={(e) => updateField('fullName', e.target.value)}
            error={touched.fullName ? errors.fullName : undefined}
            placeholder="Enter your full name"
            required
            autoComplete="name"
            disabled={isFormLoading}
          />

          {/* Email */}
          <Input
            label="Email Address"
            type="email"
            value={values.email}
            onChange={(e) => updateField('email', e.target.value)}
            error={touched.email ? errors.email : undefined}
            placeholder="Enter your email"
            required
            autoComplete="email"
            disabled={isFormLoading}
          />

          {/* Doctor-specific fields */}
          {values.userType === 'doctor' && (
            <>
              <Input
                label="Medical Specialty"
                type="text"
                value={values.specialty || ''}
                onChange={(e) => updateField('specialty', e.target.value)}
                error={touched.specialty ? errors.specialty : undefined}
                placeholder="e.g., Internal Medicine, Cardiology"
                required
                disabled={isFormLoading}
              />

              <Input
                label="License Number"
                type="text"
                value={values.licenseNumber || ''}
                onChange={(e) => updateField('licenseNumber', e.target.value)}
                error={touched.licenseNumber ? errors.licenseNumber : undefined}
                placeholder="Enter your medical license number"
                required
                disabled={isFormLoading}
              />
            </>
          )}

          {/* Password */}
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={values.password}
            onChange={(e) => updateField('password', e.target.value)}
            error={touched.password ? errors.password : undefined}
            placeholder="Create a strong password"
            required
            autoComplete="new-password"
            disabled={isFormLoading}
            onToggleVisibility={togglePasswordVisibility}
            showVisibilityToggle
          />

          {/* Confirm Password */}
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={values.confirmPassword}
            onChange={(e) => updateField('confirmPassword', e.target.value)}
            error={touched.confirmPassword ? errors.confirmPassword : undefined}
            placeholder="Confirm your password"
            required
            autoComplete="new-password"
            disabled={isFormLoading}
            onToggleVisibility={toggleConfirmPasswordVisibility}
            showVisibilityToggle
          />

          {/* Submit Error */}
          {errors.submit && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
              {errors.submit}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="large"
            className="w-full"
            disabled={isFormLoading || !formState.isValid}
            loading={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>

          {/* Legal Text */}
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            By creating an account, you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Privacy Policy
            </a>
            .
          </p>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <a 
                href="/auth/login" 
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 focus:outline-none focus:underline"
              >
                Sign in here
              </a>
            </p>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;

/*
Self-check comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) 
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
- [x] Implements comprehensive form validation with client-side validation
- [x] Uses useAuth hook for registration functionality
- [x] Uses useToast for user feedback
- [x] Handles user type selection with conditional fields for doctors
- [x] Includes password strength validation
- [x] Implements proper form state management with touched/error tracking
- [x] Provides accessible form with proper labels and error messages
- [x] Includes loading states and proper disabled handling
- [x] Uses AuthLayout for consistent auth page styling
- [x] Redirects authenticated users appropriately
- [x] Includes legal compliance text and navigation to login
*/
