import React, { ButtonHTMLAttributes, forwardRef } from 'react'
import { classNames, createAriaAttributes, isSpaceKey, handleKeyboardNavigation } from '@/core/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  children: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      children,
      onClick,
      onKeyDown,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles = [
      'inline-flex items-center justify-center',
      'rounded-lg font-medium',
      'transition-all duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'active:scale-[0.98]'
    ]

    // Variant styles
    const variantStyles = {
      primary: [
        'bg-blue-600 text-white',
        'hover:bg-blue-700 focus:ring-blue-500',
        'dark:bg-blue-500 dark:hover:bg-blue-600',
        'disabled:bg-gray-300 disabled:text-gray-500'
      ],
      secondary: [
        'bg-gray-100 text-gray-900',
        'hover:bg-gray-200 focus:ring-gray-500',
        'dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
        'disabled:bg-gray-50 disabled:text-gray-400'
      ],
      outline: [
        'border border-gray-300 bg-transparent text-gray-700',
        'hover:bg-gray-50 focus:ring-gray-500',
        'dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
        'disabled:border-gray-200 disabled:text-gray-400'
      ],
      ghost: [
        'bg-transparent text-gray-600',
        'hover:bg-gray-100 focus:ring-gray-500',
        'dark:text-gray-400 dark:hover:bg-gray-800',
        'disabled:text-gray-400'
      ],
      destructive: [
        'bg-red-600 text-white',
        'hover:bg-red-700 focus:ring-red-500',
        'dark:bg-red-500 dark:hover:bg-red-600',
        'disabled:bg-gray-300 disabled:text-gray-500'
      ]
    }

    // Size styles
    const sizeStyles = {
      sm: 'h-8 px-3 text-sm gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2',
      xl: 'h-14 px-8 text-lg gap-3'
    }

    // Width styles
    const widthStyles = fullWidth ? 'w-full' : ''

    // Loading spinner component
    const LoadingSpinner = ({ size }: { size: 'sm' | 'md' | 'lg' | 'xl' }) => {
      const spinnerSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
        xl: 'w-6 h-6'
      }

      return (
        <svg
          className={classNames('animate-spin', spinnerSizes[size])}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )
    }

    // Handle keyboard interactions
    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      // Prevent activation when disabled or loading
      if (disabled || isLoading) {
        event.preventDefault()
        return
      }

      handleKeyboardNavigation(event, {
        ' ': () => onClick?.(event as any),
      })

      // Call user-provided keyDown handler
      onKeyDown?.(event)
    }

    // Handle click events
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      // Prevent click when disabled or loading
      if (disabled || isLoading) {
        event.preventDefault()
        return
      }

      onClick?.(event)
    }

    // Combine all styles
    const combinedStyles = classNames(
      baseStyles.join(' '),
      variantStyles[variant].join(' '),
      sizeStyles[size],
      widthStyles,
      className
    )

    // Determine if button should be disabled
    const isDisabled = disabled || isLoading

    // Create ARIA attributes
    const ariaAttributes = createAriaAttributes({
      disabled: isDisabled,
      // Use aria-busy for loading state instead of aria-disabled
    })

    return (
      <button
        ref={ref}
        type={type}
        className={combinedStyles}
        disabled={isDisabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-busy={isLoading}
        {...ariaAttributes}
        {...props}
      >
        {/* Left icon or loading spinner */}
        {isLoading ? (
          <LoadingSpinner size={size} />
        ) : (
          leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
        )}
        
        {/* Button content */}
        <span
          className={classNames(
            'flex-1 text-center',
            { 'opacity-70': isLoading }
          )}
        >
          {children}
        </span>
        
        {/* Right icon (hidden when loading) */}
        {rightIcon && !isLoading && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
