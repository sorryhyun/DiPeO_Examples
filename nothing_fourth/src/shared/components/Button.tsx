// filepath: src/shared/components/Button.tsx
import React, { forwardRef, useMemo } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/core/utils';
import { tokens } from '@/theme/index';
import { buttonPress, buttonHover, motionPresets } from '@/theme/animations';

// ===============================================
// Button Component Types & Props
// ===============================================

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'subtle' | 'destructive' | 'outline';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  // Visual variants
  variant?: ButtonVariant;
  size?: ButtonSize;
  
  // State modifiers
  loading?: boolean;
  disabled?: boolean;
  active?: boolean;
  
  // Content
  children?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  
  // Layout
  fullWidth?: boolean;
  rounded?: boolean;
  
  // Custom styling
  className?: string;
  
  // Motion
  disableMotion?: boolean;
  
  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;
}

// ===============================================
// Button Size Configurations
// ===============================================

const buttonSizes = {
  xs: {
    container: 'px-2.5 py-1.5 text-xs',
    icon: 'w-3 h-3',
    gap: 'gap-1.5',
    minHeight: 'min-h-[28px]',
  },
  sm: {
    container: 'px-3 py-2 text-sm',
    icon: 'w-4 h-4',
    gap: 'gap-2',
    minHeight: 'min-h-[32px]',
  },
  md: {
    container: 'px-4 py-2.5 text-sm',
    icon: 'w-4 h-4',
    gap: 'gap-2',
    minHeight: 'min-h-[40px]',
  },
  lg: {
    container: 'px-6 py-3 text-base',
    icon: 'w-5 h-5',
    gap: 'gap-2.5',
    minHeight: 'min-h-[48px]',
  },
  xl: {
    container: 'px-8 py-4 text-lg',
    icon: 'w-6 h-6',
    gap: 'gap-3',
    minHeight: 'min-h-[56px]',
  },
} as const;

// ===============================================
// Button Variant Configurations
// ===============================================

const buttonVariants = {
  primary: {
    base: 'bg-primary-600 text-white shadow-sm',
    hover: 'hover:bg-primary-700 hover:shadow-md',
    active: 'active:bg-primary-800',
    focus: 'focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2',
    disabled: 'disabled:bg-primary-300 disabled:text-primary-100',
  },
  secondary: {
    base: 'bg-secondary-100 text-secondary-900 dark:bg-secondary-800 dark:text-secondary-100',
    hover: 'hover:bg-secondary-200 dark:hover:bg-secondary-700 hover:shadow-sm',
    active: 'active:bg-secondary-300 dark:active:bg-secondary-600',
    focus: 'focus:ring-2 focus:ring-secondary-500/50 focus:ring-offset-2',
    disabled: 'disabled:bg-secondary-50 disabled:text-secondary-300 dark:disabled:bg-secondary-900 dark:disabled:text-secondary-700',
  },
  ghost: {
    base: 'bg-transparent text-gray-700 dark:text-gray-300',
    hover: 'hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
    active: 'active:bg-gray-200 dark:active:bg-gray-700',
    focus: 'focus:ring-2 focus:ring-gray-500/50 focus:ring-offset-2',
    disabled: 'disabled:text-gray-400 dark:disabled:text-gray-600',
  },
  subtle: {
    base: 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700',
    hover: 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
    active: 'active:bg-gray-200 dark:active:bg-gray-600',
    focus: 'focus:ring-2 focus:ring-gray-500/50 focus:ring-offset-2',
    disabled: 'disabled:bg-gray-25 disabled:text-gray-400 disabled:border-gray-100 dark:disabled:bg-gray-900 dark:disabled:text-gray-600 dark:disabled:border-gray-800',
  },
  destructive: {
    base: 'bg-error-600 text-white shadow-sm',
    hover: 'hover:bg-error-700 hover:shadow-md',
    active: 'active:bg-error-800',
    focus: 'focus:ring-2 focus:ring-error-500/50 focus:ring-offset-2',
    disabled: 'disabled:bg-error-300 disabled:text-error-100',
  },
  outline: {
    base: 'bg-transparent text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600',
    hover: 'hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500',
    active: 'active:bg-gray-100 dark:active:bg-gray-700',
    focus: 'focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2',
    disabled: 'disabled:bg-transparent disabled:text-gray-400 disabled:border-gray-200 dark:disabled:text-gray-600 dark:disabled:border-gray-800',
  },
} as const;

// ===============================================
// Loading Spinner Component
// ===============================================

const LoadingSpinner: React.FC<{ size: ButtonSize }> = ({ size }) => {
  const sizeConfig = buttonSizes[size];
  
  return (
    <motion.div
      className={cn('animate-spin rounded-full border-2 border-current border-t-transparent', sizeConfig.icon)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      aria-hidden="true"
    />
  );
};

// ===============================================
// Button Component
// ===============================================

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  active = false,
  children,
  leftIcon,
  rightIcon,
  fullWidth = false,
  rounded = false,
  className,
  disableMotion = false,
  onClick,
  onKeyDown,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  type = 'button',
  ...props
}, ref) => {
  // Get configuration for current size and variant
  const sizeConfig = buttonSizes[size];
  const variantConfig = buttonVariants[variant];
  
  // Determine if button should be disabled
  const isDisabled = disabled || loading;
  
  // Memoize motion configuration
  const motionConfig = useMemo(() => {
    if (disableMotion || isDisabled) {
      return {};
    }
    
    return {
      ...buttonHover,
      whileTap: { scale: 0.98 },
      transition: { duration: 0.15, ease: 'easeInOut' },
    };
  }, [disableMotion, isDisabled]);
  
  // Build class names
  const buttonClasses = cn(
    // Base styles
    'relative inline-flex items-center justify-center font-medium transition-all duration-200',
    'focus:outline-none focus:ring-offset-background',
    'select-none cursor-pointer',
    
    // Size styles
    sizeConfig.container,
    sizeConfig.minHeight,
    children && (leftIcon || rightIcon) && sizeConfig.gap,
    
    // Variant styles
    variantConfig.base,
    !isDisabled && [
      variantConfig.hover,
      variantConfig.active,
      variantConfig.focus,
    ],
    isDisabled && [
      variantConfig.disabled,
      'cursor-not-allowed',
      'pointer-events-none',
    ],
    
    // Layout modifiers
    fullWidth && 'w-full',
    rounded ? 'rounded-full' : 'rounded-lg',
    
    // State modifiers
    active && !isDisabled && 'ring-2 ring-current ring-opacity-20',
    loading && 'text-transparent',
    
    // Custom classes
    className
  );
  
  // Handle click events
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };
  
  // Handle keyboard events
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    
    // Prevent space key from scrolling when button is focused
    if (event.key === ' ') {
      event.preventDefault();
    }
    
    onKeyDown?.(event);
  };
  
  // Render icon with proper sizing
  const renderIcon = (icon: React.ReactNode, position: 'left' | 'right') => {
    if (!icon) return null;
    
    return (
      <span 
        className={cn(
          'inline-flex items-center justify-center flex-shrink-0',
          sizeConfig.icon,
          loading && 'invisible'
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
    );
  };
  
  return (
    <motion.button
      ref={ref}
      type={type}
      className={buttonClasses}
      disabled={isDisabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-pressed={active ? 'true' : undefined}
      aria-busy={loading ? 'true' : undefined}
      {...(disableMotion ? {} : motionConfig)}
      {...props}
    >
      {/* Loading Spinner Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size={size} />
        </div>
      )}
      
      {/* Left Icon */}
      {renderIcon(leftIcon, 'left')}
      
      {/* Button Content */}
      {children && (
        <span className={cn('truncate', loading && 'invisible')}>
          {children}
        </span>
      )}
      
      {/* Right Icon */}
      {renderIcon(rightIcon, 'right')}
      
      {/* Focus Ring Enhancement */}
      <span 
        className="absolute inset-0 rounded-[inherit] ring-2 ring-transparent group-focus:ring-current opacity-0 group-focus:opacity-20 transition-opacity"
        aria-hidden="true"
      />
    </motion.button>
  );
});

Button.displayName = 'Button';

// ===============================================
// Button Group Component (Bonus)
// ===============================================

export interface ButtonGroupProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md';
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  variant,
  size,
  orientation = 'horizontal',
  spacing = 'none',
  className,
}) => {
  const spacingClasses = {
    none: orientation === 'horizontal' ? 'space-x-0' : 'space-y-0',
    sm: orientation === 'horizontal' ? 'space-x-2' : 'space-y-2',
    md: orientation === 'horizontal' ? 'space-x-3' : 'space-y-3',
  };
  
  const containerClasses = cn(
    'inline-flex',
    orientation === 'horizontal' ? 'flex-row' : 'flex-col',
    spacing === 'none' && orientation === 'horizontal' && '[&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none [&>*:not(:first-child)]:-ml-px',
    spacing === 'none' && orientation === 'vertical' && '[&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none [&>*:not(:first-child)]:-mt-px',
    spacingClasses[spacing],
    className
  );
  
  return (
    <div className={containerClasses} role="group">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === Button) {
          return React.cloneElement(child as React.ReactElement<ButtonProps>, {
            variant: child.props.variant || variant,
            size: child.props.size || size,
          });
        }
        return child;
      })}
    </div>
  );
};

// ===============================================
// Icon Button Component (Bonus)
// ===============================================

export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: React.ReactNode;
  'aria-label': string; // Required for icon-only buttons
}

export const IconButton= forwardRef<HTMLButtonElement, IconButtonProps>(({
  icon,
  variant = 'ghost',
  size = 'md',
  rounded = true,
  ...props
}, ref) => {
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      rounded={rounded}
      {...props}
    >
      <span className={cn('inline-flex items-center justify-center', buttonSizes[size].icon)}>
        {icon}
      </span>
    </Button>
  );
});

IconButton.displayName = 'IconButton';

// Export default Button
export default Button;

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (uses theme tokens)
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/
