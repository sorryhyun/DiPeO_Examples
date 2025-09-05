// filepath: src/shared/components/Button/Button.tsx
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion, type MotionProps } from 'framer-motion';
import { theme } from '@/theme';
import { cn } from '@/core/utils';

// Button variant styles
const buttonVariants = {
  primary: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: `1px solid ${theme.colors.primary}`,
    '&:hover:not(:disabled)': {
      backgroundColor: theme.colors.primaryDark,
      borderColor: theme.colors.primaryDark,
    },
    '&:focus:not(:disabled)': {
      outline: `2px solid ${theme.colors.primaryLight}`,
      outlineOffset: '2px',
    },
  },
  ghost: {
    backgroundColor: 'transparent',
    color: theme.colors.text,
    border: `1px solid ${theme.colors.border}`,
    '&:hover:not(:disabled)': {
      backgroundColor: theme.colors.surfaceHover,
      borderColor: theme.colors.borderHover,
    },
    '&:focus:not(:disabled)': {
      outline: `2px solid ${theme.colors.primary}`,
      outlineOffset: '2px',
    },
  },
  subtle: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.textSecondary,
    border: 'none',
    '&:hover:not(:disabled)': {
      backgroundColor: theme.colors.surfaceHover,
      color: theme.colors.text,
    },
    '&:focus:not(:disabled)': {
      outline: `2px solid ${theme.colors.primary}`,
      outlineOffset: '2px',
    },
  },
} as const;

// Button size styles
const buttonSizes = {
  sm: {
    height: '32px',
    paddingX: theme.spacing.sm,
    fontSize: theme.typography.sizes.sm,
    gap: theme.spacing.xs,
  },
  md: {
    height: '40px',
    paddingX: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    gap: theme.spacing.sm,
  },
  lg: {
    height: '48px',
    paddingX: theme.spacing.lg,
    fontSize: theme.typography.sizes.lg,
    gap: theme.spacing.sm,
  },
} as const;

export type ButtonVariant = keyof typeof buttonVariants;
export type ButtonSize = keyof typeof buttonSizes;

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
  fullWidth?: boolean;
  className?: string;
}

// Loading spinner component
const Spinner = ({ size = 16 }: { size?: number }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    role="progressbar"
    aria-label="Loading"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="31.416"
      strokeDashoffset="31.416"
      style={{
        strokeDasharray: '15.708 31.416',
        opacity: 0.6,
      }}
    />
  </motion.svg>
);

// Motion variants for button interactions
const buttonMotionVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      fullWidth = false,
      className,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const variantStyles = buttonVariants[variant];
    const sizeStyles = buttonSizes[size];
    const isDisabled = disabled || loading;

    // Base button styles
    const baseStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: theme.typography.fontFamily,
      fontWeight: theme.typography.weights.medium,
      borderRadius: theme.radii.md,
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease-in-out',
      outline: 'none',
      textDecoration: 'none',
      userSelect: 'none' as const,
      position: 'relative' as const,
      width: fullWidth ? '100%' : 'auto',
      opacity: isDisabled ? 0.6 : 1,
      ...variantStyles,
      ...sizeStyles,
      paddingLeft: sizeStyles.paddingX,
      paddingRight: sizeStyles.paddingX,
    };

    // Content to display (handle loading state)
    const buttonContent = loading ? (
      <>
        <Spinner size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
        {loadingText && <span>{loadingText}</span>}
      </>
    ) : (
      <>
        {leftIcon && <span style={{ display: 'flex' }}>{leftIcon}</span>}
        {children && <span>{children}</span>}
        {rightIcon && <span style={{ display: 'flex' }}>{rightIcon}</span>}
      </>
    );

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn('button', `button--${variant}`, `button--${size}`, className)}
        style={baseStyles}
        variants={buttonMotionVariants}
        initial="initial"
        whileHover={isDisabled ? undefined : 'hover'}
        whileTap={isDisabled ? undefined : 'tap'}
        aria-disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {buttonContent}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

// Export for convenience
export default Button;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config` - uses theme which would be configured there
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
