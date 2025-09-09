// filepath: src/shared/components/Card/Card.tsx
import React, { forwardRef } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { classNames } from '@/core/utils';
import { theme } from '@/theme';
import { GlassCard } from '@/shared/components/Glass/GlassCard';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  /** Card variant */
  variant?: 'default' | 'elevated' | 'glass' | 'gradient';
  /** Elevation level (only applies to 'elevated' variant) */
  elevation?: 'sm' | 'md' | 'lg' | 'xl';
  /** Gradient direction (only applies to 'gradient' variant) */
  gradientDirection?: 'to-r' | 'to-br' | 'to-b' | 'to-bl' | 'to-l' | 'to-tl' | 'to-t' | 'to-tr';
  /** Custom gradient colors (only applies to 'gradient' variant) */
  gradientFrom?: string;
  gradientTo?: string;
  /** Card padding */
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Border radius */
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Whether card is clickable/interactive */
  clickable?: boolean;
  /** Whether card is currently pressed/active */
  pressed?: boolean;
  /** Custom background color (overrides variant) */
  backgroundColor?: string;
  /** Custom border color */
  borderColor?: string;
  /** Whether to show border */
  bordered?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Motion props for framer-motion */
  motionProps?: Partial<MotionProps>;
  /** Children content */
  children?: React.ReactNode;
}

const elevationClasses = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl'
};

const paddingClasses = {
  none: '',
  xs: 'p-2',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8'
};

const borderRadiusClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full'
};

const gradientDirectionClasses = {
  'to-r': 'bg-gradient-to-r',
  'to-br': 'bg-gradient-to-br',
  'to-b': 'bg-gradient-to-b',
  'to-bl': 'bg-gradient-to-bl',
  'to-l': 'bg-gradient-to-l',
  'to-tl': 'bg-gradient-to-tl',
  'to-t': 'bg-gradient-to-t',
  'to-tr': 'bg-gradient-to-tr'
};

/**
 * Gets variant-specific classes and styles
 */
function getVariantProps(
  variant: CardProps['variant'],
  elevation: CardProps['elevation'],
  gradientDirection: CardProps['gradientDirection'],
  gradientFrom?: string,
  gradientTo?: string,
  backgroundColor?: string,
  borderColor?: string,
  bordered?: boolean
) {
  const props: {
    className: string;
    style?: React.CSSProperties;
  } = {
    className: '',
    style: {}
  };

  switch (variant) {
    case 'elevated':
      props.className = classNames(
        'bg-white dark:bg-gray-800',
        elevationClasses[elevation || 'md'],
        bordered ? 'border border-gray-200 dark:border-gray-700' : ''
      );
      break;

    case 'glass':
      // Glass variant is handled by GlassCard component
      props.className = '';
      break;

    case 'gradient':
      props.className = classNames(
        gradientDirectionClasses[gradientDirection || 'to-br'],
        bordered ? 'border border-gray-200 dark:border-gray-700' : ''
      );
      
      if (gradientFrom && gradientTo) {
        props.style = {
          backgroundImage: `linear-gradient(${gradientDirection?.replace('to-', '') || 'to bottom right'}, ${gradientFrom}, ${gradientTo})`
        };
      } else {
        props.className += ' from-blue-500 to-purple-600';
      }
      break;

    case 'default':
    default:
      props.className = classNames(
        'bg-white dark:bg-gray-800',
        bordered ? 'border border-gray-200 dark:border-gray-700' : ''
      );
      break;
  }

  // Apply custom colors
  if (backgroundColor) {
    props.style = { ...props.style, backgroundColor };
  }

  if (borderColor) {
    props.style = { ...props.style, borderColor };
    props.className += ' border';
  }

  return props;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      elevation = 'md',
      gradientDirection = 'to-br',
      gradientFrom,
      gradientTo,
      padding = 'md',
      borderRadius = 'lg',
      clickable = false,
      pressed = false,
      backgroundColor,
      borderColor,
      bordered = false,
      className,
      motionProps,
      children,
      onClick,
      onKeyDown,
      ...rest
    },
    ref
  ) => {
    // Handle glass variant with GlassCard
    if (variant === 'glass') {
      return (
        <GlassCard
          ref={ref}
          padding={padding}
          borderRadius={borderRadius}
          clickable={clickable}
          pressed={pressed}
          className={className}
          motionProps={motionProps}
          onClick={onClick}
          onKeyDown={onKeyDown}
          {...rest}
        >
          {children}
        </GlassCard>
      );
    }

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (clickable && onClick) {
        onClick(event);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (clickable && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        // Simulate click event
        const syntheticClickEvent = {
          ...event,
          type: 'click',
          button: 0,
          buttons: 1
        } as unknown as React.MouseEvent<HTMLDivElement>;
        
        if (onClick) {
          onClick(syntheticClickEvent);
        }
      }
      
      if (onKeyDown) {
        onKeyDown(event);
      }
    };

    const variantProps = getVariantProps(
      variant,
      elevation,
      gradientDirection,
      gradientFrom,
      gradientTo,
      backgroundColor,
      borderColor,
      bordered
    );

    const baseClasses = classNames(
      // Base styles
      'relative overflow-hidden',
      'transition-all duration-200 ease-in-out',
      
      // Variant-specific classes
      variantProps.className,
      
      // Spacing
      paddingClasses[padding],
      
      // Border radius
      borderRadiusClasses[borderRadius],
      
      // Interactive states
      {
        'cursor-pointer select-none': clickable,
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2': clickable,
        'transform': clickable,
        'hover:scale-[1.02]': clickable && !pressed,
        'active:scale-[0.98]': clickable,
        'scale-[0.98]': pressed
      },
      
      // Custom classes
      className
    );

    const defaultMotionProps: MotionProps = clickable ? {
      whileHover: pressed ? {} : { scale: 1.02, y: -2 },
      whileTap: { scale: 0.98 },
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    } : {};

    const combinedMotionProps = { ...defaultMotionProps, ...motionProps };

    const cardProps = {
      ref,
      className: baseClasses,
      style: variantProps.style,
      onClick: handleClick,
      ...(clickable && {
        onKeyDown: handleKeyDown,
        tabIndex: 0,
        role: 'button',
        'aria-pressed': pressed
      }),
      ...rest
    };

    return (
      <motion.div
        {...cardProps}
        {...combinedMotionProps}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

// Card sub-components for better composition
export interface CardHeaderProps {
  className?: string;
  children?: React.ReactNode;
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div
      className={classNames(
        'flex flex-col space-y-1.5 pb-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardTitleProps {
  className?: string;
  children?: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function CardTitle({ 
  className, 
  children, 
  as: Component = 'h3',
  ...props 
}: CardTitleProps) {
  return (
    <Component
      className={classNames(
        'text-lg font-semibold leading-none tracking-tight',
        'text-gray-900 dark:text-gray-100',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export interface CardDescriptionProps {
  className?: string;
  children?: React.ReactNode;
}

export function CardDescription({ className, children, ...props }: CardDescriptionProps) {
  return (
    <p
      className={classNames(
        'text-sm text-gray-600 dark:text-gray-400',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export interface CardContentProps {
  className?: string;
  children?: React.ReactNode;
}

export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div
      className={classNames('text-gray-700 dark:text-gray-300', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardFooterProps {
  className?: string;
  children?: React.ReactNode;
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={classNames(
        'flex items-center justify-between pt-4',
        'border-t border-gray-200 dark:border-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Export all card components together
export const CardComponents = {
  Card,
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter
};

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/core/utils, @/theme, @/shared/components/Glass/GlassCard)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - pure component with motion
- [x] Reads config from `@/app/config` (N/A for this component)
- [x] Exports default named component (exports Card with forwardRef plus sub-components)
- [x] Adds basic ARIA and keyboard handlers (role=button, aria-pressed, keyboard support for clickable cards)
*/
