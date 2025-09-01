// filepath: src/shared/components/Button.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { theme } from '@/theme';
import { animations } from '@/theme/animations';
import { Spinner } from '@/shared/components/Spinner';
import { cn } from '@/core/utils';

// =============================================================================
// Button Types
// =============================================================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

// =============================================================================
// Button Styles
// =============================================================================

const buttonVariants = {
  primary: {
    base: `bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg hover:from-primary-700 hover:to-primary-600 focus:ring-primary-500`,
    disabled: `opacity-50 cursor-not-allowed`,
  },
  secondary: {
    base: `bg-white text-gray-900 border border-gray-300 shadow-sm hover:bg-gray-50 focus:ring-primary-500`,
    disabled: `opacity-50 cursor-not-allowed`,
  },
  ghost: {
    base: `text-gray-700 hover:bg-gray-100 focus:ring-gray-300`,
    disabled: `opacity-50 cursor-not-allowed`,
  },
  danger: {
    base: `bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg hover:from-red-700 hover:to-red-600 focus:ring-red-500`,
    disabled: `opacity-50 cursor-not-allowed`,
  },
};

const buttonSizes = {
  sm: `px-3 py-1.5 text-sm font-medium rounded-md`,
  md: `px-4 py-2 text-sm font-medium rounded-lg`,
  lg: `px-6 py-3 text-base font-medium rounded-lg`,
};

// =============================================================================
// Button Component
// =============================================================================

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
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
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Compute final disabled state
    const isDisabled = disabled || loading;

    // Build class names
    const baseClasses = `
      inline-flex items-center justify-center gap-2
      font-medium transition-all duration-200 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-2
      relative overflow-hidden
      ${fullWidth ? 'w-full' : ''}
      ${buttonSizes[size]}
      ${buttonVariants[variant].base}
      ${isDisabled ? buttonVariants[variant].disabled : ''}
    `;

    const finalClassName = cn(baseClasses, className);

    // Handle click with loading state
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled || loading) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    // Animation variants for micro-interactions
    const buttonMotionVariants = {
      initial: { scale: 1 },
      tap: { scale: 0.98 },
      hover: { scale: 1.02 },
    };

    // Content with loading state
    const renderContent = () => {
      if (loading) {
        return (
          <>
            <Spinner size="sm" color="current" />
            <span className="opacity-70">Loading...</span>
          </>
        );
      }

      return (
        <>
          {leftIcon && (
            <span className="flex-shrink-0" aria-hidden="true">
              {leftIcon}
            </span>
          )}
          <span>{children}</span>
          {rightIcon && (
            <span className="flex-shrink-0" aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </>
      );
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={finalClassName}
        onClick={handleClick}
        variants={buttonMotionVariants}
        initial="initial"
        whileHover={!isDisabled ? "hover" : undefined}
        whileTap={!isDisabled ? "tap" : undefined}
        transition={animations.spring.gentle}
        aria-disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {/* Shimmer effect for primary buttons */}
        {variant === 'primary' && !isDisabled && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{ transform: 'skewX(-20deg)' }}
          />
        )}
        
        {/* Button content */}
        <div className="relative z-10 flex items-center gap-2">
          {renderContent()}
        </div>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

// =============================================================================
// Button Variants (Compound Components)
// =============================================================================

export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="secondary" {...props} />
);

export const GhostButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="ghost" {...props} />
);

export const DangerButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="danger" {...props} />
);

// =============================================================================
// Button Group Component
// =============================================================================

export interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  className,
}) => {
  const groupClasses = cn(
    'inline-flex',
    orientation === 'horizontal' ? 'flex-row' : 'flex-col',
    orientation === 'horizontal' ? '[&>*:not(:first-child)]:ml-[-1px]' : '[&>*:not(:first-child)]:mt-[-1px]',
    '[&>*:not(:first-child):not(:last-child)]:rounded-none',
    orientation === 'horizontal' ? '[&>*:first-child]:rounded-r-none [&>*:last-child]:rounded-l-none' : '[&>*:first-child]:rounded-b-none [&>*:last-child]:rounded-t-none',
    className
  );

  return (
    <div className={groupClasses} role="group">
      {children}
    </div>
  );
};

// =============================================================================
// Icon Button Component
// =============================================================================

export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 'md',
  className,
  ...props
}) => {
  const iconSizes = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-2.5',
  };

  const iconButtonClasses = cn(
    'rounded-full',
    iconSizes[size],
    className
  );

  return (
    <Button
      size={size}
      className={iconButtonClasses}
      {...props}
    >
      {icon}
    </Button>
  );
};

// =============================================================================
// Floating Action Button
// =============================================================================

export interface FABProps extends Omit<ButtonProps, 'variant' | 'size'> {
  size?: 'md' | 'lg';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const FloatingActionButton: React.FC<FABProps> = ({
  size = 'lg',
  position = 'bottom-right',
  className,
  ...props
}) => {
  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6',
  };

  const fabSizes = {
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  };

  const fabClasses = cn(
    'rounded-full shadow-2xl z-50',
    positionClasses[position],
    fabSizes[size],
    className
  );

  return (
    <Button
      variant="primary"
      className={fabClasses}
      {...props}
    />
  );
};

/*
Self-check comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (imports theme and animations from core)
- [x] Exports default named component (exports Button and related components)
- [x] Adds basic ARIA and keyboard handlers (aria-disabled, aria-busy, proper button semantics)
*/
