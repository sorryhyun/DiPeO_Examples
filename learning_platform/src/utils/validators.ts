/**
 * Form validation utilities
 * Simple, synchronous validation functions that return error messages or undefined
 */

export const validateEmail = (email: string): string | undefined => {
  if (!email) {
    return 'Email is required';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  
  return undefined;
};

export const validateRequired = (value: string | undefined | null, fieldName = 'This field'): string | undefined => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`;
  }
  
  return undefined;
};

export const validateMaxLength = (value: string, maxLength: number, fieldName = 'This field'): string | undefined => {
  if (value && value.length > maxLength) {
    return `${fieldName} must be ${maxLength} characters or less`;
  }
  
  return undefined;
};

export const validateMinLength = (value: string, minLength: number, fieldName = 'This field'): string | undefined => {
  if (value && value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  
  return undefined;
};

export const validatePassword = (password: string): string | undefined => {
  if (!password) {
    return 'Password is required';
  }
  
  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  
  return undefined;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | undefined => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  
  return undefined;
};

export const validateNumber = (value: string, fieldName = 'This field'): string | undefined => {
  if (value && isNaN(Number(value))) {
    return `${fieldName} must be a valid number`;
  }
  
  return undefined;
};

export const validateRange = (value: number, min: number, max: number, fieldName = 'This field'): string | undefined => {
  if (value < min || value > max) {
    return `${fieldName} must be between ${min} and ${max}`;
  }
  
  return undefined;
};

/**
 * Combines multiple validators for a single field
 */
export const combineValidators = (...validators: Array<() => string | undefined>) => {
  return (): string | undefined => {
    for (const validator of validators) {
      const error = validator();
      if (error) {
        return error;
      }
    }
    return undefined;
  };
};
