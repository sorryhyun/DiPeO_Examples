// src/shared/components/Button.tsx
/* src/shared/components/Button.tsx
   Accessible button component used across the app (variants, sizes).
   - Supports multiple variants (primary, secondary, outline, ghost, destructive)
   - Multiple sizes (xs, sm, md, lg, xl)
   - Loading state with spinner
   - Full accessibility support with ARIA attributes
   - Keyboard navigation support
   - Uses utility classes from core/utils for consistent styling
*/

import React, { forwardRef } from 'react';
import { cn } from '@/core/utils';

// Button variant styles
const buttonVariants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-400',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-400',
  outline: 'border-2 border-blue-600 text-blue-600 bg-transparent hover:bg-blue-50 focus:ring-blue-500 disabled:border-gray-300 disabled:text-gray-400',
  ghost: 'text-blue-600 bg-transparent hover:bg-blue-50 focus:ring-blue-500 disabled:text-gray-400',
  destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400'
};

// Button size styles
const buttonSizes = {
  xs: 'px-2 py-1 text-xs font-medium',
  sm: 'px-3 py-1.5 text-sm font-medium', 
  md: 'px-4 py-2 text-sm font-medium',
  lg: 'px-6 py-3 text-base font-medium',
  xl: 'px-8 py-4 text-lg font-medium'
};

// Base button styles
const baseButtonStyles = 'inline-flex items-center justify-center rounded-md border border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-medium';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

// Simple spinner component for loading state
const Spinner: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <svg 
      className={cn('animate-spin text-current', sizeClass)} 
      fill="none" 
      viewBox="0 0 24 24"
      role="status"
      aria-label="Loading"
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
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className,
  children,
  onClick,
  onKeyDown,
  ...props
}, ref) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Handle Enter and Space key activation for accessibility
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled && !loading && onClick) {
        onClick(e as any);
      }
    }
    onKeyDown?.(e);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  // Determine spinner size based on button size
  const spinnerSize = ['xs', 'sm'].includes(size) ? 'sm' : 'md';

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      className={cn(
        baseButtonStyles,
        buttonVariants[variant],
        buttonSizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading && (
        <Spinner size={spinnerSize} />
      )}
      {!loading && leftIcon && (
        <span className="mr-2 flex-shrink-0" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      <span className={cn(loading && 'ml-2')}>
        {children}
      </span>
      {!loading && rightIcon && (
        <span className="ml-2 flex-shrink-0" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

// Example usage:
// <Button variant="primary" size="md" onClick={handleClick}>
//   Save Changes
// </Button>
// <Button variant="outline" loading={isSubmitting} leftIcon={<PlusIcon />}>
//   Add Item
// </Button>

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (not needed for this presentational component)
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (aria-disabled, aria-busy, Enter/Space key handling)
*/
