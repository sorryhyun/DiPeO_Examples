import React, { forwardRef, useState, useId } from 'react'
import { cn } from '@/core/utils'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'ghost' | 'outline'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  isLoading?: boolean
  required?: boolean
  showOptional?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      variant = 'default',
      leftIcon,
      rightIcon,
      isLoading = false,
      required = false,
      showOptional = false,
      className,
      disabled,
      type = 'text',
      id,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const inputId = useId()
    const finalId = id || inputId
    const errorId = `${finalId}-error`
    const helperTextId = `${finalId}-helper`
    const labelId = `${finalId}-label`

    // Build aria-describedby
    let describedBy = ariaDescribedBy || ''
    if (error) {
      describedBy = describedBy ? `${describedBy} ${errorId}` : errorId
    } else if (helperText) {
      describedBy = describedBy ? `${describedBy} ${helperTextId}` : helperTextId
    }

    // Size variants
    const sizeClasses = {
      sm: 'h-8 px-2 text-sm',
      md: 'h-10 px-3 text-sm',
      lg: 'h-12 px-4 text-base'
    }

    // Variant styles
    const variantClasses = {
      default: 'border border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-blue-400',
      ghost: 'border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-800 dark:focus:bg-gray-700',
      outline: 'border-2 border-gray-200 bg-transparent focus:border-blue-500 focus:ring-0 dark:border-gray-700 dark:focus:border-blue-400'
    }

    // State-dependent classes
    const stateClasses = cn(
      // Base styles
      'w-full rounded-md font-medium transition-colors duration-200',
      'placeholder:text-gray-400 dark:placeholder:text-gray-500',
      'focus:outline-none',
      'disabled:cursor-not-allowed disabled:opacity-50',
      
      // Size
      sizeClasses[size],
      
      // Variant
      variantClasses[variant],
      
      // Error state
      error && [
        'border-red-500 focus:border-red-500 focus:ring-red-500/20',
        'dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400/20'
      ],
      
      // Loading state
      isLoading && 'animate-pulse',
      
      // Icon padding adjustments
      leftIcon && {
        sm: 'pl-8',
        md: 'pl-9',
        lg: 'pl-11'
      }[size],
      
      rightIcon && {
        sm: 'pr-8',
        md: 'pr-9', 
        lg: 'pr-11'
      }[size],
      
      className
    )

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      onBlur?.(e)
    }

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            id={labelId}
            htmlFor={finalId}
            className={cn(
              'mb-1.5 block text-sm font-medium',
              error ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300',
              disabled && 'text-gray-400 dark:text-gray-600'
            )}
          >
            {label}
            {required && (
              <span 
                className="ml-1 text-red-500" 
                aria-label="required"
                role="img"
              >
                *
              </span>
            )}
            {!required && showOptional && (
              <span className="ml-1 text-xs text-gray-400 font-normal">
                (optional)
              </span>
            )}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div 
              className={cn(
                'absolute left-0 top-0 flex items-center justify-center text-gray-400 pointer-events-none',
                {
                  sm: 'h-8 w-8',
                  md: 'h-10 w-10',
                  lg: 'h-12 w-12'
                }[size]
              )}
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={finalId}
            type={type}
            className={stateClasses}
            disabled={disabled || isLoading}
            aria-invalid={ariaInvalid ?? !!error}
            aria-describedby={describedBy || undefined}
            aria-labelledby={label ? labelId : undefined}
            aria-required={required}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div 
              className={cn(
                'absolute right-0 top-0 flex items-center justify-center text-gray-400 pointer-events-none',
                {
                  sm: 'h-8 w-8',
                  md: 'h-10 w-10',
                  lg: 'h-12 w-12'
                }[size]
              )}
              aria-hidden="true"
            >
              {rightIcon}
            </div>
          )}

          {/* Loading Spinner */}
          {isLoading && (
            <div 
              className={cn(
                'absolute right-0 top-0 flex items-center justify-center',
                {
                  sm: 'h-8 w-8',
                  md: 'h-10 w-10', 
                  lg: 'h-12 w-12'
                }[size]
              )}
              aria-hidden="true"
            >
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-sm text-red-600 dark:text-red-400"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p
            id={helperTextId}
            className="mt-1.5 text-sm text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
