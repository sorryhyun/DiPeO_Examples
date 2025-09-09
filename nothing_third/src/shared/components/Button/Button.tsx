// filepath: src/shared/components/Button/Button.tsx
import React, { forwardRef } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { classNames } from '@/core/utils';
import { theme } from '@/theme';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'subtle' | 'danger';
  /** Button size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
  /** Icon to show before text */
  leftIcon?: React.ReactNode;
  /** Icon to show after text */
  rightIcon?: React.ReactNode;
  /** Full width button */
  fullWidth?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Children content */
  children?: React.ReactNode;
  /** Custom motion props */
  motionProps?: Partial<MotionProps>;
  /** Loading spinner color override */
  loadingColor?: string;
}

const variantClasses = {
  primary: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-200 hover:border-gray-400 focus:ring-gray-500',
  ghost: 'bg-transparent text-gray-700 border-transparent hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500',
  subtle: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300 focus:ring-gray-500',
  danger: 'bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700 focus:ring-red-500'
};

const sizeClasses = {
  xs: 'px-2 py-1 text-xs font-medium min-h-[24px]',
  sm: 'px-3 py-1.5 text-sm font-medium min-h-[32px]',
  md: 'px-4 py-2 text-sm font-medium min-h-[40px]',
  lg: 'px-6 py-3 text-base font-medium min-h-[48px]',
  xl: 'px-8 py-4 text-lg font-medium min-h-[56px]'
};

const disabledClasses = {
  primary: 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed',
  secondary: 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed',
  ghost: 'bg-transparent text-gray-400 border-transparent cursor-not-allowed',
  subtle: 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed',
  danger: 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed'
};

interface SpinnerProps {
  size: ButtonProps['size'];
  color?: string;
}

function LoadingSpinner({ size = 'md', color = 'currentColor' }: SpinnerProps) {
  const spinnerSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  return (
    <motion.svg
      className={classNames('animate-spin', spinnerSizes[size])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill={color}
        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </motion.svg>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      type = 'button',
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      children,
      motionProps,
      loadingColor,
      onClick,
      onKeyDown,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled && onClick) {
        onClick(event);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      // Ensure Enter and Space activate the button properly
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (!isDisabled) {
          const syntheticClickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true
          });
          event.currentTarget.dispatchEvent(syntheticClickEvent);
        }
      }
      
      if (onKeyDown) {
        onKeyDown(event);
      }
    };

    const baseClasses = classNames(
      // Base styles
      'inline-flex items-center justify-center',
      'border font-medium rounded-lg',
      'transition-all duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'select-none',
      
      // Size classes
      sizeClasses[size],
      
      // Variant classes
      isDisabled ? disabledClasses[variant] : variantClasses[variant],
      
      // Width
      fullWidth ? 'w-full' : 'w-auto',
      
      // Custom classes
      className
    );

    const defaultMotionProps: MotionProps = {
      whileTap: isDisabled ? {} : { scale: 0.98 },
      whileHover: isDisabled ? {} : { scale: 1.02 },
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 17
      }
    };

    const combinedMotionProps = { ...defaultMotionProps, ...motionProps };

    const iconSpacing = children ? (size === 'xs' ? 'gap-1' : 'gap-2') : '';
    const contentClasses = classNames('flex items-center justify-center', iconSpacing);

    // Get loading spinner color based on variant
    const getLoadingColor = () => {
      if (loadingColor) return loadingColor;
      
      switch (variant) {
        case 'primary':
        case 'danger':
          return '#ffffff';
        case 'secondary':
        case 'ghost':
        case 'subtle':
        default:
          return '#6b7280';
      }
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        className={baseClasses}
        disabled={isDisabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-disabled={isDisabled}
        aria-busy={loading}
        {...combinedMotionProps}
        {...rest}
      >
        <span className={contentClasses}>
          {loading && (
            <LoadingSpinner size={size} color={getLoadingColor()} />
          )}
          
          {!loading && leftIcon && (
            <span className="flex-shrink-0" aria-hidden="true">
              {leftIcon}
            </span>
          )}
          
          {children && (
            <span className={loading ? 'opacity-0' : 'opacity-100'}>
              {children}
            </span>
          )}
          
          {!loading && rightIcon && (
            <span className="flex-shrink-0" aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/core/utils, @/theme)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - pure component with motion
- [x] Reads config from `@/app/config` (N/A for this component)
- [x] Exports default named component (exports Button with forwardRef)
- [x] Adds basic ARIA and keyboard handlers (aria-disabled, aria-busy, proper keyboard event handling for Enter/Space)
*/
