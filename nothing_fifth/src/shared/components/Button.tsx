// filepath: src/shared/components/Button.tsx

import { forwardRef, ReactNode } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { theme } from '@/theme';
import { buttonMotion, shakeMotion, spinMotion } from '@/theme/animations';
import { classNames } from '@/core/utils';

// ============================================================================
// BUTTON TYPES & INTERFACES
// ============================================================================

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'subtle' | 'danger';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size' | 'onAnimationStart' | 'onDragStart' | 'onDrag' | 'onDragEnd'> {
  /** Button content */
  children: ReactNode;
  
  /** Visual variant */
  variant?: ButtonVariant;
  
  /** Size variant */
  size?: ButtonSize;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Full width button */
  fullWidth?: boolean;
  
  /** Icon to show before text */
  leftIcon?: ReactNode;
  
  /** Icon to show after text */
  rightIcon?: ReactNode;
  
  /** Only show icon (no text) */
  iconOnly?: boolean;
  
  /** Show shake animation (for errors) */
  shake?: boolean;
  
  /** Custom motion props */
  motionProps?: MotionProps;
  
  /** Custom class name */
  className?: string;
}

// ============================================================================
// STYLE VARIANTS
// ============================================================================

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-xs min-h-[1.5rem]',
  sm: 'px-3 py-1.5 text-sm min-h-[2rem]',
  md: 'px-4 py-2 text-base min-h-[2.5rem]',
  lg: 'px-6 py-3 text-lg min-h-[3rem]',
  xl: 'px-8 py-4 text-xl min-h-[3.5rem]',
};

const iconSizeStyles: Record<ButtonSize, string> = {
  xs: 'p-1 min-h-[1.5rem] min-w-[1.5rem]',
  sm: 'p-1.5 min-h-[2rem] min-w-[2rem]',
  md: 'p-2 min-h-[2.5rem] min-w-[2.5rem]',
  lg: 'p-3 min-h-[3rem] min-w-[3rem]',
  xl: 'p-4 min-h-[3.5rem] min-w-[3.5rem]',
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-blue-600 to-blue-700 
    text-white 
    border border-blue-600
    hover:from-blue-700 hover:to-blue-800 
    hover:border-blue-700
    focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    active:from-blue-800 active:to-blue-900
    disabled:from-gray-400 disabled:to-gray-500 
    disabled:border-gray-400
    shadow-md hover:shadow-lg
  `,
  secondary: `
    bg-gradient-to-r from-gray-100 to-gray-200 
    text-gray-900 
    border border-gray-300
    hover:from-gray-200 hover:to-gray-300 
    hover:border-gray-400
    focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
    active:from-gray-300 active:to-gray-400
    disabled:from-gray-50 disabled:to-gray-100 
    disabled:border-gray-200 disabled:text-gray-400
    shadow-sm hover:shadow-md
  `,
  ghost: `
    bg-transparent 
    text-gray-700 
    border border-transparent
    hover:bg-gray-100 
    hover:text-gray-900
    focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
    active:bg-gray-200
    disabled:text-gray-400 disabled:hover:bg-transparent
  `,
  subtle: `
    bg-gray-50 
    text-gray-700 
    border border-gray-200
    hover:bg-gray-100 
    hover:border-gray-300
    focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
    active:bg-gray-200
    disabled:bg-gray-25 disabled:text-gray-400 
    disabled:border-gray-100
  `,
  danger: `
    bg-gradient-to-r from-red-600 to-red-700 
    text-white 
    border border-red-600
    hover:from-red-700 hover:to-red-800 
    hover:border-red-700
    focus:ring-2 focus:ring-red-500 focus:ring-offset-2
    active:from-red-800 active:to-red-900
    disabled:from-gray-400 disabled:to-gray-500 
    disabled:border-gray-400
    shadow-md hover:shadow-lg
  `,
};

// ============================================================================
// LOADING SPINNER COMPONENT
// ============================================================================

const LoadingSpinner = ({ size }: { size: ButtonSize }) => {
  const spinnerSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  return (
    <motion.div
      variants={spinMotion}
      animate="spin"
      className={classNames(
        'border-2 border-current border-t-transparent rounded-full',
        spinnerSizes[size]
      )}
      aria-hidden="true"
    />
  );
};

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      iconOnly = false,
      shake = false,
      motionProps,
      className,
      onClick,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    const buttonClasses = classNames(
      // Base styles
      'inline-flex items-center justify-center',
      'font-medium rounded-md',
      'border',
      'transition-all duration-200',
      'focus:outline-none focus:ring-offset-white',
      'disabled:cursor-not-allowed disabled:opacity-60',
      
      // Size styles
      iconOnly ? iconSizeStyles[size] : sizeStyles[size],
      
      // Variant styles
      variantStyles[variant],
      
      // Width styles
      fullWidth && 'w-full',
      
      // Custom className
      className
    );

    const motionVariants = shake ? shakeMotion : buttonMotion;
    const animateState = shake ? 'shake' : 'idle';

    return (
      <motion.button
        ref={ref}
        type="button"
        className={buttonClasses}
        disabled={isDisabled}
        onClick={handleClick}
        variants={motionVariants}
        initial="idle"
        animate={animateState}
        whileHover={!isDisabled ? 'hover' : undefined}
        whileTap={!isDisabled ? 'tap' : undefined}
        aria-busy={isLoading}
        aria-disabled={isDisabled}
        {...motionProps}
        {...rest}
      >
        {/* Left icon or loading spinner */}
        {isLoading ? (
          <LoadingSpinner size={size} />
        ) : leftIcon ? (
          <span className={classNames('flex-shrink-0', !iconOnly && 'mr-2')}>
            {leftIcon}
          </span>
        ) : null}

        {/* Button text (hidden if iconOnly) */}
        {!iconOnly && (
          <span className={classNames(isLoading && leftIcon && 'ml-2')}>
            {children}
          </span>
        )}

        {/* Right icon */}
        {!isLoading && rightIcon && (
          <span className={classNames('flex-shrink-0', !iconOnly && 'ml-2')}>
            {rightIcon}
          </span>
        )}

        {/* Loading text for screen readers */}
        {isLoading && (
          <span className="sr-only">Loading...</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default Button;

// ============================================================================
// Self-Check Comments
// ============================================================================
// [x] Uses `@/` imports only - Imports from @/theme and @/core/utils
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Pure component with props
// [x] Reads config from `@/app/config` - Not needed for button component
// [x] Exports default named component - Exports Button as default and named export
// [x] Adds basic ARIA and keyboard handlers (where relevant) - Includes aria-busy, aria-disabled, focus management, and screen reader support
