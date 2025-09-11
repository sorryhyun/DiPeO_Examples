// filepath: src/shared/components/Button.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import Icon from '@/shared/components/Icon'
import { theme } from '@/theme/index'
import { config } from '@/app/config'

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'accent' 
  | 'ghost' 
  | 'outline' 
  | 'danger'
  | 'success'

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  disabled?: boolean
  leftIcon?: string
  rightIcon?: string
  children?: ReactNode
  fullWidth?: boolean
  glassy?: boolean
  className?: string
}

// Base classes for glassy styling
const glassyBase = [
  'backdrop-blur-sm',
  'bg-white/10',
  'border border-white/20',
  'shadow-lg shadow-black/25',
  'hover:bg-white/15',
  'active:bg-white/5',
  'transition-all duration-200',
].join(' ')

// Variant class mappings
const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-transparent shadow-lg shadow-blue-500/25',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-600',
  accent: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-transparent shadow-lg shadow-emerald-500/25',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent dark:hover:bg-gray-800 dark:text-gray-300',
  outline: 'bg-transparent hover:bg-gray-50 text-gray-700 border-gray-300 dark:hover:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
  danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent shadow-lg shadow-red-500/25',
  success: 'bg-green-600 hover:bg-green-700 text-white border-transparent shadow-lg shadow-green-500/25',
}

// Size class mappings
const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1.5 text-xs font-medium min-h-[28px]',
  sm: 'px-3 py-2 text-sm font-medium min-h-[32px]',
  md: 'px-4 py-2.5 text-sm font-medium min-h-[38px]',
  lg: 'px-6 py-3 text-base font-medium min-h-[44px]',
  xl: 'px-8 py-4 text-lg font-semibold min-h-[52px]',
}

// Icon size mappings
const iconSizes: Record<ButtonSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      children,
      fullWidth = false,
      glassy = false,
      className = '',
      onClick,
      onKeyDown,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    // Handle keyboard interactions
    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      // Prevent space/enter when disabled or loading
      if (isDisabled && (event.key === ' ' || event.key === 'Enter')) {
        event.preventDefault()
        return
      }

      // Call parent handler
      onKeyDown?.(event)
    }

    // Handle click interactions
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      // Prevent clicks when disabled or loading
      if (isDisabled) {
        event.preventDefault()
        return
      }

      onClick?.(event)
    }

    // Build class string
    const classes = theme.resolveClasses(
      // Base classes
      'inline-flex items-center justify-center gap-2',
      'rounded-md border font-medium',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'focus:ring-blue-500 focus:ring-offset-white',
      'dark:focus:ring-offset-gray-900',
      'transition-all duration-200 ease-in-out',
      'select-none',
      
      // Size classes
      sizeClasses[size],
      
      // Variant classes (conditionally apply glassy or normal)
      glassy ? glassyBase : variantClasses[variant],
      
      // Full width
      fullWidth && 'w-full',
      
      // Disabled state
      isDisabled && [
        'opacity-50 cursor-not-allowed',
        'hover:bg-current', // Prevent hover effects
      ],
      
      // Loading state
      loading && 'cursor-wait',
      
      // Custom className
      className
    )

    // Determine ARIA attributes
    const ariaProps = {
      'aria-disabled': isDisabled,
      'aria-busy': loading,
      'aria-describedby': loading ? 'button-loading-description' : undefined,
    }

    return (
      <>
        <button
          ref={ref}
          type={type}
          disabled={isDisabled}
          className={classes}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          {...ariaProps}
          {...props}
        >
          {/* Left Icon */}
          {leftIcon && !loading && (
            <Icon
              name={leftIcon}
              className={theme.resolveClasses(iconSizes[size], 'flex-shrink-0')}
              aria-hidden="true"
            />
          )}

          {/* Loading Spinner */}
          {loading && (
            <Icon
              name="loader"
              className={theme.resolveClasses(
                iconSizes[size],
                'flex-shrink-0 animate-spin'
              )}
              aria-hidden="true"
            />
          )}

          {/* Button Content */}
          {children && (
            <span className={theme.resolveClasses(
              'truncate',
              loading && !leftIcon && 'ml-2' // Add margin when loading replaces left icon
            )}>
              {children}
            </span>
          )}

          {/* Right Icon */}
          {rightIcon && !loading && (
            <Icon
              name={rightIcon}
              className={theme.resolveClasses(iconSizes[size], 'flex-shrink-0')}
              aria-hidden="true"
            />
          )}
        </button>

        {/* Screen reader loading description */}
        {loading && (
          <span
            id="button-loading-description"
            className="sr-only"
            aria-live="polite"
          >
            Loading, please wait
          </span>
        )}
      </>
    )
  }
)

Button.displayName = 'Button'

// Development helpers
if (config.isDevelopment) {
  // Add debug info to help with styling
  Button.displayName = 'Button (dev)'
}

export default Button

// Example usage (commented):
// <Button variant="primary" size="lg" leftIcon="plus" onClick={handleClick}>
//   Add Item
// </Button>
//
// <Button variant="ghost" loading loadingText="Saving...">
//   Save Changes  
// </Button>
//
// <Button variant="outline" glassy rightIcon="arrow-right" fullWidth>
//   Continue
// </Button>
