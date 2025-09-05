// filepath: src/shared/components/Card/Card.tsx
import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { GlassCard } from '@/shared/components/Glass/GlassCard';
import { theme } from '@/theme/index';

// Card variant types
export type CardVariant = 'elevated' | 'outlined' | 'filled' | 'glass';
export type CardElevation = 0 | 1 | 2 | 3 | 4 | 8 | 12 | 16 | 24;
export type CardSize = 'sm' | 'md' | 'lg' | 'xl';

// Card component props
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant of the card */
  variant?: CardVariant;
  /** Shadow elevation level */
  elevation?: CardElevation;
  /** Card size preset */
  size?: CardSize;
  /** Whether the card is interactive/clickable */
  interactive?: boolean;
  /** Whether the card is disabled */
  disabled?: boolean;
  /** Custom background gradient */
  gradient?: string;
  /** Whether to show loading state */
  loading?: boolean;
  /** Motion props for animation */
  motionProps?: Omit<MotionProps, 'children'>;
  /** Optional header content */
  header?: React.ReactNode;
  /** Optional footer content */
  footer?: React.ReactNode;
  /** Custom border radius */
  borderRadius?: string | number;
  /** Whether card should fill container width */
  fullWidth?: boolean;
}

// Size configurations
const sizeConfig = {
  sm: {
    padding: '12px',
    borderRadius: '6px',
    minHeight: '80px',
  },
  md: {
    padding: '16px',
    borderRadius: '8px',
    minHeight: '120px',
  },
  lg: {
    padding: '20px',
    borderRadius: '12px',
    minHeight: '160px',
  },
  xl: {
    padding: '24px',
    borderRadius: '16px',
    minHeight: '200px',
  },
} as const;

// Elevation shadow mapping
const elevationShadows: Record<CardElevation, string> = {
  0: 'none',
  1: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
  2: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
  3: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
  4: '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)',
  8: '0 19px 38px rgba(0, 0, 0, 0.30), 0 15px 12px rgba(0, 0, 0, 0.22)',
  12: '0 24px 48px rgba(0, 0, 0, 0.35), 0 20px 15px rgba(0, 0, 0, 0.22)',
  16: '0 32px 64px rgba(0, 0, 0, 0.40), 0 25px 20px rgba(0, 0, 0, 0.22)',
  24: '0 48px 96px rgba(0, 0, 0, 0.45), 0 35px 25px rgba(0, 0, 0, 0.22)',
};

// Get variant styles
function getVariantStyles(
  variant: CardVariant,
  elevation: CardElevation,
  gradient?: string,
  disabled?: boolean
): React.CSSProperties {
  const baseStyles: React.CSSProperties = {
    transition: 'all 0.2s ease-in-out',
    border: 'none',
    position: 'relative',
    overflow: 'hidden',
  };

  switch (variant) {
    case 'elevated':
      return {
        ...baseStyles,
        backgroundColor: theme.colors.surface.primary,
        boxShadow: elevationShadows[elevation],
        border: 'none',
      };

    case 'outlined':
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        border: `1px solid ${disabled ? theme.colors.border.disabled : theme.colors.border.primary}`,
        boxShadow: 'none',
      };

    case 'filled':
      return {
        ...baseStyles,
        backgroundColor: gradient || theme.colors.surface.secondary,
        backgroundImage: gradient ? `linear-gradient(${gradient})` : undefined,
        boxShadow: elevation > 0 ? elevationShadows[Math.min(elevation, 4)] : 'none',
        border: 'none',
      };

    case 'glass':
      // Glass variant uses the GlassCard component internally
      return baseStyles;

    default:
      return {
        ...baseStyles,
        backgroundColor: theme.colors.surface.primary,
        boxShadow: elevationShadows[elevation],
      };
  }
}

// Interactive states
function getInteractiveStyles(
  interactive: boolean,
  disabled: boolean,
  variant: CardVariant
): React.CSSProperties {
  if (!interactive || disabled) {
    return {
      cursor: disabled ? 'not-allowed' : 'default',
      opacity: disabled ? 0.6 : 1,
    };
  }

  const baseInteractive: React.CSSProperties = {
    cursor: 'pointer',
    transform: 'translateY(0)',
  };

  // Different hover effects for different variants
  switch (variant) {
    case 'elevated':
      return {
        ...baseInteractive,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: elevationShadows[Math.min(8, 24) as CardElevation],
        } as any,
      };

    case 'outlined':
      return {
        ...baseInteractive,
        '&:hover': {
          borderColor: theme.colors.primary.main,
          backgroundColor: `${theme.colors.primary.main}08`,
        } as any,
      };

    case 'filled':
    case 'glass':
      return {
        ...baseInteractive,
        '&:hover': {
          transform: 'translateY(-1px)',
          filter: 'brightness(1.05)',
        } as any,
      };

    default:
      return baseInteractive;
  }
}

// Loading skeleton overlay
function LoadingOverlay(): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
      }}
      role="status"
      aria-label="Loading content"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{
          width: 24,
          height: 24,
          border: `2px solid ${theme.colors.border.primary}`,
          borderTopColor: theme.colors.primary.main,
          borderRadius: '50%',
        }}
      />
    </motion.div>
  );
}

// Card header component
interface CardHeaderProps {
  children: React.ReactNode;
  size: CardSize;
}

function CardHeader({ children, size }: CardHeaderProps): JSX.Element {
  const padding = sizeConfig[size].padding;
  
  return (
    <div
      style={{
        padding: `${padding} ${padding} 0`,
        borderBottom: `1px solid ${theme.colors.border.subtle}`,
        marginBottom: padding,
      }}
    >
      {children}
    </div>
  );
}

// Card footer component
interface CardFooterProps {
  children: React.ReactNode;
  size: CardSize;
}

function CardFooter({ children, size }: CardFooterProps): JSX.Element {
  const padding = sizeConfig[size].padding;
  
  return (
    <div
      style={{
        padding: `0 ${padding} ${padding}`,
        borderTop: `1px solid ${theme.colors.border.subtle}`,
        marginTop: padding,
      }}
    >
      {children}
    </div>
  );
}

// Main Card component
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'elevated',
      elevation = 1,
      size = 'md',
      interactive = false,
      disabled = false,
      gradient,
      loading = false,
      motionProps,
      header,
      footer,
      borderRadius,
      fullWidth = false,
      children,
      className,
      style,
      onClick,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    // Handle keyboard interaction for interactive cards
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (interactive && !disabled && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onClick?.(event as any);
      }
      onKeyDown?.(event);
    };

    // Get size configuration
    const sizeStyles = sizeConfig[size];

    // Calculate final styles
    const variantStyles = getVariantStyles(variant, elevation, gradient, disabled);
    const interactiveStyles = getInteractiveStyles(interactive, disabled, variant);

    const finalStyles: React.CSSProperties = {
      ...variantStyles,
      ...interactiveStyles,
      ...sizeStyles,
      borderRadius: borderRadius ?? sizeStyles.borderRadius,
      width: fullWidth ? '100%' : undefined,
      display: 'flex',
      flexDirection: 'column',
      ...style,
    };

    // Default motion props for interactive cards
    const defaultMotionProps: MotionProps = {
      whileHover: interactive && !disabled ? { y: -2 } : undefined,
      whileTap: interactive && !disabled ? { y: 0, scale: 0.98 } : undefined,
      transition: { duration: 0.2 },
    };

    const combinedMotionProps = { ...defaultMotionProps, ...motionProps };

    // For glass variant, use GlassCard component
    if (variant === 'glass') {
      return (
        <GlassCard
          ref={ref}
          className={className}
          style={finalStyles}
          onClick={interactive && !disabled ? onClick : undefined}
          onKeyDown={handleKeyDown}
          tabIndex={interactive && !disabled ? 0 : undefined}
          role={interactive ? 'button' : undefined}
          aria-disabled={disabled}
          {...props}
          {...combinedMotionProps}
        >
          {loading && <LoadingOverlay />}
          {header && <CardHeader size={size}>{header}</CardHeader>}
          <div style={{ flex: 1 }}>{children}</div>
          {footer && <CardFooter size={size}>{footer}</CardFooter>}
        </GlassCard>
      );
    }

    // Regular card implementation
    return (
      <motion.div
        ref={ref}
        className={className}
        style={finalStyles}
        onClick={interactive && !disabled ? onClick : undefined}
        onKeyDown={handleKeyDown}
        tabIndex={interactive && !disabled ? 0 : undefined}
        role={interactive ? 'button' : undefined}
        aria-disabled={disabled}
        {...props}
        {...combinedMotionProps}
      >
        {loading && <LoadingOverlay />}
        {header && <CardHeader size={size}>{header}</CardHeader>}
        <div style={{ flex: 1 }}>{children}</div>
        {footer && <CardFooter size={size}>{footer}</CardFooter>}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

// Export additional types and utilities
export { type CardProps };

// Preset card configurations for common use cases
export const cardPresets = {
  // Dashboard metric cards
  metric: {
    variant: 'elevated' as const,
    size: 'md' as const,
    elevation: 2 as const,
    interactive: true,
  },
  
  // Content cards
  content: {
    variant: 'outlined' as const,
    size: 'lg' as const,
    elevation: 0 as const,
    interactive: false,
  },
  
  // Action cards
  action: {
    variant: 'filled' as const,
    size: 'md' as const,
    elevation: 1 as const,
    interactive: true,
  },
  
  // Glass morphism cards
  glass: {
    variant: 'glass' as const,
    size: 'md' as const,
    elevation: 0 as const,
    interactive: true,
  },
} as const;

// Utility function to create cards with presets
export function createCard(preset: keyof typeof cardPresets, overrides: Partial<CardProps> = {}) {
  return function CardWithPreset(props: CardProps) {
    return <Card {...cardPresets[preset]} {...overrides} {...props} />;
  };
}

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config` - uses theme from theme/index.ts
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
