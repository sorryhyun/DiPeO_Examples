// filepath: src/shared/components/Input.tsx

import React, { forwardRef, useId, useState } from 'react';
import { cn } from '@/core/utils';
import { tokens } from '@/theme';
import { useDebounce } from '@/hooks/useDebounce';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  debounceMs?: number;
  onChange?: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      prefix,
      suffix,
      variant = 'default',
      size = 'md',
      debounceMs = 0,
      onChange,
      onDebouncedChange,
      disabled,
      required,
      id: propId,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = propId || generatedId;
    const [internalValue, setInternalValue] = useState(props.value || '');

    // Debounced callback for onDebouncedChange
    const debouncedCallback = useDebounce((value: string) => {
      onDebouncedChange?.(value);
    }, debounceMs);

    // Handle input changes
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setInternalValue(newValue);
      
      // Call immediate onChange if provided
      onChange?.(newValue);
      
      // Call debounced onChange if enabled and callback provided
      if (debounceMs > 0 && onDebouncedChange) {
        debouncedCallback(newValue);
      }
    };

    // Build describedBy IDs for accessibility
    const describedByIds = [];
    if (error) describedByIds.push(`${id}-error`);
    if (helperText) describedByIds.push(`${id}-helper`);
    if (ariaDescribedBy) describedByIds.push(ariaDescribedBy);

    // Size variants
    const sizeClasses = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-3 text-base',
      lg: 'h-12 px-4 text-lg',
    };

    // Variant styles
    const variantClasses = {
      default: cn(
        'border border-neutral-300 bg-white',
        'focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
        'hover:border-neutral-400',
        error && 'border-error-500 focus:border-error-500 focus:ring-error-500'
      ),
      filled: cn(
        'border-0 bg-neutral-100',
        'focus:bg-white focus:ring-2 focus:ring-primary-500',
        'hover:bg-neutral-50',
        error && 'bg-error-50 focus:ring-error-500'
      ),
      outlined: cn(
        'border-2 border-neutral-300 bg-transparent',
        'focus:border-primary-500 focus:ring-0',
        'hover:border-neutral-400',
        error && 'border-error-500 focus:border-error-500'
      ),
    };

    const inputClasses = cn(
      // Base styles
      'w-full rounded-md transition-colors duration-150',
      'placeholder:text-neutral-400',
      'focus:outline-none',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50',
      
      // Size styles
      sizeClasses[size],
      
      // Variant styles
      variantClasses[variant],
      
      // Prefix/suffix padding adjustments
      prefix && 'pl-10',
      suffix && 'pr-10',
      
      className
    );

    const labelClasses = cn(
      'block text-sm font-medium text-neutral-700 mb-1.5',
      disabled && 'text-neutral-400',
      error && 'text-error-700'
    );

    const errorClasses = cn(
      'mt-1.5 text-sm text-error-600',
      'flex items-center gap-1'
    );

    const helperTextClasses = cn(
      'mt-1.5 text-sm text-neutral-500'
    );

    const affixClasses = cn(
      'absolute top-1/2 -translate-y-1/2',
      'text-neutral-400',
      size === 'sm' && 'text-sm',
      size === 'md' && 'text-base',
      size === 'lg' && 'text-lg'
    );

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className={labelClasses}>
            {label}
            {required && (
              <span className="ml-1 text-error-500" aria-label="required">
                *
              </span>
            )}
          </label>
        )}
        
        <div className="relative">
          {prefix && (
            <div className={cn(affixClasses, 'left-3')} aria-hidden="true">
              {prefix}
            </div>
          )}
          
          <input
            {...props}
            ref={ref}
            id={id}
            value={props.value !== undefined ? props.value : internalValue}
            onChange={handleInputChange}
            disabled={disabled}
            required={required}
            className={inputClasses}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedByIds.length > 0 ? describedByIds.join(' ') : undefined}
            aria-required={required}
          />
          
          {suffix && (
            <div className={cn(affixClasses, 'right-3')} aria-hidden="true">
              {suffix}
            </div>
          )}
        </div>
        
        {error && (
          <div id={`${id}-error`} className={errorClasses} role="alert">
            <svg
              className="h-4 w-4 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5l-3 5a1 1 0 00.867 1.5h6a1 1 0 00.867-1.5l-3-5A1 1 0 0010 7z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}
        
        {helperText && !error && (
          <div id={`${id}-helper`} className={helperTextClasses}>
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (not applicable for this component)
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/
