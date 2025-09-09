// filepath: src/shared/components/Input/Input.tsx
import React, { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import { classNames } from '@/core/utils';
import { Icon } from '@/shared/components/Icon/Icon';
import { useDebounce } from '@/hooks/useDebounce';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  // Core props
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  
  // Validation & state
  error?: string;
  isValid?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isLoading?: boolean;
  
  // Visual styling
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'flushed' | 'unstyled';
  
  // Icons
  leftIcon?: string;
  rightIcon?: string;
  
  // Callbacks
  onChange?: (value: string, event?: React.ChangeEvent<HTMLInputElement>) => void;
  onDebounce?: (value: string) => void;
  debounceMs?: number;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  
  // Helper text
  helperText?: string;
  
  // Layout
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  // Core props
  label,
  placeholder,
  value,
  defaultValue,
  
  // Validation & state
  error,
  isValid,
  isRequired = false,
  isDisabled = false,
  isReadOnly = false,
  isLoading = false,
  
  // Visual styling
  size = 'md',
  variant = 'default',
  
  // Icons
  leftIcon,
  rightIcon,
  
  // Callbacks
  onChange,
  onDebounce,
  debounceMs = 300,
  onFocus,
  onBlur,
  
  // Helper text
  helperText,
  
  // Layout
  fullWidth = false,
  
  // Standard input props
  type = 'text',
  id,
  name,
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...restProps
}, ref) => {
  // Internal state for controlled/uncontrolled mode
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Use forwarded ref or internal ref
  const resolvedRef = (ref || inputRef) as React.RefObject<HTMLInputElement>;
  
  // Determine if component is controlled
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  
  // Generate unique IDs
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperTextId = helperText ? `${inputId}-helper` : undefined;
  const labelId = label ? `${inputId}-label` : undefined;
  
  // Determine validation state
  const hasError = Boolean(error);
  const showValid = isValid && !hasError && currentValue.length > 0;
  const showLoading = isLoading;
  
  // Handle input change
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    
    // Update internal state if uncontrolled
    if (!isControlled) {
      setInternalValue(newValue);
    }
    
    // Call onChange callback
    onChange?.(newValue, event);
  }, [isControlled, onChange]);
  
  // Debounced callback
  const debouncedValue = useDebounce(currentValue, debounceMs);
  
  useEffect(() => {
    if (onDebounce && debouncedValue !== undefined) {
      onDebounce(debouncedValue);
    }
  }, [debouncedValue, onDebounce]);
  
  // Focus/blur handlers
  const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(event);
  }, [onFocus]);
  
  const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(event);
  }, [onBlur]);
  
  // Size styles
  const sizeStyles = {
    sm: {
      input: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
      iconLeft: 'left-3',
      iconRight: 'right-3',
      paddingLeft: 'pl-9',
      paddingRight: 'pr-9'
    },
    md: {
      input: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
      iconLeft: 'left-3',
      iconRight: 'right-3',
      paddingLeft: 'pl-10',
      paddingRight: 'pr-10'
    },
    lg: {
      input: 'px-4 py-3 text-lg',
      icon: 'w-6 h-6',
      iconLeft: 'left-3',
      iconRight: 'right-3',
      paddingLeft: 'pl-12',
      paddingRight: 'pr-12'
    }
  };
  
  const currentSizeStyles = sizeStyles[size];
  
  // Variant styles
  const variantStyles = {
    default: 'border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    filled: 'border-0 rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:bg-white',
    flushed: 'border-0 border-b-2 border-gray-300 rounded-none bg-transparent focus:border-blue-500',
    unstyled: 'border-0 bg-transparent focus:ring-0 focus:outline-none'
  };
  
  // Build input class names
  const inputClassName = classNames(
    // Base styles
    'w-full transition-colors duration-200 placeholder-gray-500',
    'focus:outline-none',
    
    // Size styles
    currentSizeStyles.input,
    
    // Variant styles
    variantStyles[variant],
    
    // State styles
    {
      'border-red-500 focus:border-red-500 focus:ring-red-500': hasError && variant !== 'unstyled',
      'border-green-500 focus:border-green-500 focus:ring-green-500': showValid && variant !== 'unstyled',
      'opacity-50 cursor-not-allowed': isDisabled,
      'bg-gray-50': isReadOnly && variant === 'default',
      'cursor-text': !isDisabled && !isReadOnly
    },
    
    // Icon padding
    {
      [currentSizeStyles.paddingLeft]: leftIcon,
      [currentSizeStyles.paddingRight]: rightIcon || showLoading || showValid || hasError
    },
    
    // Full width
    { 'w-full': fullWidth },
    
    // Custom className
    className
  );
  
  // Build container class names
  const containerClassName = classNames(
    'relative',
    { 'w-full': fullWidth }
  );
  
  // Determine right icon to show
  const getRightIcon = () => {
    if (showLoading) return 'spinner';
    if (hasError) return 'alert-circle';
    if (showValid) return 'check-circle';
    return rightIcon;
  };
  
  const rightIconToShow = getRightIcon();
  const rightIconColor = hasError ? 'text-red-500' : showValid ? 'text-green-500' : 'text-gray-400';
  
  // Build aria-describedby
  const ariaDescribedByIds = [
    ariaDescribedBy,
    errorId,
    helperTextId
  ].filter(Boolean).join(' ') || undefined;
  
  return (
    <div className={fullWidth ? 'w-full' : undefined}>
      {/* Label */}
      {label && (
        <label
          id={labelId}
          htmlFor={inputId}
          className={classNames(
            'block text-sm font-medium mb-1',
            {
              'text-gray-700': !hasError,
              'text-red-700': hasError,
              'opacity-50': isDisabled
            }
          )}
        >
          {label}
          {isRequired && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}
      
      {/* Input container */}
      <div className={containerClassName}>
        {/* Left icon */}
        {leftIcon && (
          <div 
            className={classNames(
              'absolute inset-y-0 flex items-center pointer-events-none',
              currentSizeStyles.iconLeft
            )}
          >
            <Icon 
              name={leftIcon} 
              className={classNames(currentSizeStyles.icon, 'text-gray-400')}
              aria-hidden="true"
            />
          </div>
        )}
        
        {/* Input element */}
        <input
          ref={resolvedRef}
          id={inputId}
          name={name}
          type={type}
          value={currentValue}
          placeholder={placeholder}
          disabled={isDisabled}
          readOnly={isReadOnly}
          required={isRequired}
          className={inputClassName}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-label={ariaLabel}
          aria-labelledby={labelId}
          aria-describedby={ariaDescribedByIds}
          aria-invalid={hasError}
          aria-required={isRequired}
          {...restProps}
        />
        
        {/* Right icon */}
        {rightIconToShow && (
          <div 
            className={classNames(
              'absolute inset-y-0 flex items-center pointer-events-none',
              currentSizeStyles.iconRight
            )}
          >
            <Icon 
              name={rightIconToShow} 
              className={classNames(
                currentSizeStyles.icon, 
                rightIconColor,
                { 'animate-spin': showLoading && rightIconToShow === 'spinner' }
              )}
              aria-hidden="true"
            />
          </div>
        )}
      </div>
      
      {/* Helper text or error */}
      {(error || helperText) && (
        <div className="mt-1">
          {error && (
            <p
              id={errorId}
              className="text-sm text-red-600"
              role="alert"
              aria-live="polite"
            >
              {error}
            </p>
          )}
          {helperText && !error && (
            <p
              id={helperTextId}
              className="text-sm text-gray-600"
            >
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Skeleton variant for loading states
export interface InputSkeletonProps {
  size?: InputProps['size'];
  hasLabel?: boolean;
  hasHelperText?: boolean;
  fullWidth?: boolean;
}

export function InputSkeleton({
  size = 'md',
  hasLabel = true,
  hasHelperText = false,
  fullWidth = false
}: InputSkeletonProps) {
  const sizeHeights = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12'
  };
  
  return (
    <div className={classNames('animate-pulse', { 'w-full': fullWidth })}>
      {hasLabel && (
        <div className="h-5 bg-gray-200 rounded w-24 mb-1" />
      )}
      <div className={classNames(
        'bg-gray-200 rounded-md',
        sizeHeights[size],
        { 'w-full': fullWidth, 'w-64': !fullWidth }
      )} />
      {hasHelperText && (
        <div className="h-4 bg-gray-200 rounded w-32 mt-1" />
      )}
    </div>
  );
}

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/core/utils, @/shared/components/Icon/Icon, @/hooks/useDebounce)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses useDebounce hook
- [x] Reads config from `@/app/config` (N/A for this component - pure UI component)
- [x] Exports default named component (exports Input and InputSkeleton)
- [x] Adds basic ARIA and keyboard handlers (aria-label, aria-describedby, aria-invalid, aria-required, role="alert")
*/
