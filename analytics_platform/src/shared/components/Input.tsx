// src/shared/components/Input.tsx
/* src/shared/components/Input.tsx
   Reusable styled input component with label, error display, and accessibility support.
   - Forwards ref to input element for form libraries
   - Shows validation errors with proper ARIA attributes
   - Supports various input types with consistent styling
   - Includes focus/blur state management
*/

import React, { forwardRef, useState } from 'react';
import { cn } from '@/core/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      fullWidth = false,
      className,
      id,
      type = 'text',
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    
    // Generate unique ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperTextId = helperText ? `${inputId}-helper` : undefined;
    
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const inputClasses = cn(
      // Base styles
      'block w-full rounded-md border px-3 py-2 text-sm transition-colors',
      'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2',
      
      // Width control
      fullWidth ? 'w-full' : '',
      
      // State-based styles
      {
        // Normal state
        'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500': 
          !error && !disabled,
        
        // Error state
        'border-red-300 bg-red-50 text-red-900 placeholder:text-red-400 focus:border-red-500 focus:ring-red-500': 
          error && !disabled,
        
        // Disabled state
        'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed': disabled,
        
        // Focus state (additional ring)
        'ring-2': isFocused && !disabled
      },
      
      className
    );

    const labelClasses = cn(
      'block text-sm font-medium mb-1',
      {
        'text-gray-700': !error && !disabled,
        'text-red-700': error && !disabled,
        'text-gray-500': disabled
      }
    );

    return (
      <div className={cn('space-y-1', fullWidth ? 'w-full' : '')}>
        {label && (
          <label 
            htmlFor={inputId} 
            className={labelClasses}
          >
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}
        
        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          className={inputClasses}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={cn(
            errorId,
            helperTextId
          ) || undefined}
          {...props}
        />
        
        {error && (
          <p 
            id={errorId}
            className="text-sm text-red-600 flex items-center gap-1"
            role="alert"
            aria-live="polite"
          >
            <svg 
              className="h-4 w-4 flex-shrink-0" 
              viewBox="0 0 20 20" 
              fill="currentColor"
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5l-4 7A1 1 0 006 16h8a1 1 0 00.867-1.5l-4-7A1 1 0 0010 7z" 
                clipRule="evenodd" 
              />
            </svg>
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p 
            id={helperTextId}
            className="text-sm text-gray-500"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Example usage:
// import { Input } from '@/shared/components/Input'
// 
// <Input
//   label="Email Address"
//   type="email"
//   required
//   placeholder="Enter your email"
//   error={formErrors.email}
//   helperText="We'll never share your email"
//   fullWidth
// />

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses React hooks appropriately
- [x] Reads config from `@/app/config` - not needed for basic input component
- [x] Exports default named component - exports named Input component
- [x] Adds basic ARIA and keyboard handlers - includes aria-invalid, aria-describedby, role="alert", aria-live, and proper focus/blur handling
*/
