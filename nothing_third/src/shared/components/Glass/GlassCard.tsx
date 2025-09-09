// filepath: src/shared/components/Glass/GlassCard.tsx
import React, { forwardRef } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { classNames } from '@/core/utils';
import { theme } from '@/theme';

export interface GlassCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  /** Glass intensity level */
  intensity?: 'subtle' | 'medium' | 'strong';
  /** Border style */
  border?: 'none' | 'solid' | 'gradient';
  /** Gradient border colors (only applies when border='gradient') */
  borderGradient?: {
    from: string;
    to: string;
    direction?: 'to-r' | 'to-br' | 'to-b' | 'to-bl' | 'to-l' | 'to-tl' | 'to-t' | 'to-tr';
  };
  /** Card padding */
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Border radius */
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Whether card is clickable/interactive */
  clickable?: boolean;
  /** Whether card is currently pressed/active */
  pressed?: boolean;
  /** Background tint color */
  tintColor?: string;
  /** Background tint opacity (0-1) */
  tintOpacity?: number;
  /** Shadow intensity */
  shadowIntensity?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Additional CSS classes */
  className?: string;
  /** Motion props for framer-motion */
  motionProps?: Partial<MotionProps>;
  /** Children content */
  children?: React.ReactNode;
}

const intensityClasses = {
  subtle: 'backdrop-blur-sm bg-white/10 dark:bg-black/10',
  medium: 'backdrop-blur-md bg-white/20 dark:bg-black/20',
  strong: 'backdrop-blur-lg bg-white/30 dark:bg-black/30'
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

const shadowIntensityClasses = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl'
};

const borderClasses = {
  none: '',
  solid: 'border border-white/20 dark:border-white/10',
  gradient: 'border border-transparent'
};

/**
 * Creates CSS properties for gradient borders
 */
function getGradientBorderStyles(
  borderGradient: GlassCardProps['borderGradient'],
  borderRadius: string
): React.CSSProperties {
  if (!borderGradient) return {};

  const { from, to, direction = 'to-br' } = borderGradient;
  
  // Convert direction to CSS gradient direction
  const directionMap = {
    'to-r': 'to right',
    'to-br': 'to bottom right',
    'to-b': 'to bottom',
    'to-bl': 'to bottom left',
    'to-l': 'to left',
    'to-tl': 'to top left',
    'to-t': 'to top',
    'to-tr': 'to top right'
  };

  const gradientDirection = directionMap[direction];
  
  return {
    background: `linear-gradient(${gradientDirection}, ${from}, ${to})`,
    padding: '1px',
    borderRadius: borderRadius
  };
}

/**
 * Gets the inner content styles for gradient bordered cards
 */
function getInnerContentStyles(
  borderRadius: string,
  tintColor?: string,
  tintOpacity?: number
): React.CSSProperties {
  const styles: React.CSSProperties = {
    borderRadius: borderRadius,
    width: '100%',
    height: '100%'
  };

  if (tintColor && tintOpacity) {
    styles.backgroundColor = `${tintColor}${Math.round(tintOpacity * 255).toString(16).padStart(2, '0')}`;
  }

  return styles;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      intensity = 'medium',
      border = 'solid',
      borderGradient,
      padding = 'md',
      borderRadius = 'lg',
      clickable = false,
      pressed = false,
      tintColor,
      tintOpacity = 0.1,
      shadowIntensity = 'md',
      className,
      motionProps,
      children,
      onClick,
      onKeyDown,
      ...rest
    },
    ref
  ) => {
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

    const radiusValue = borderRadiusClasses[borderRadius];
    
    // For gradient borders, we need a container with the gradient background
    // and an inner element with the glass effect
    const isGradientBorder = border === 'gradient' && borderGradient;
    
    const baseClasses = classNames(
      // Base styles
      'relative overflow-hidden',
      'transition-all duration-300 ease-in-out',
      
      // Glass effect (only if not gradient border)
      !isGradientBorder && intensityClasses[intensity],
      
      // Border (only if not gradient border)
      !isGradientBorder && borderClasses[border],
      
      // Spacing (only if not gradient border)
      !isGradientBorder && paddingClasses[padding],
      
      // Border radius (only if not gradient border)
      !isGradientBorder && radiusValue,
      
      // Shadow
      shadowIntensityClasses[shadowIntensity],
      
      // Interactive states
      {
        'cursor-pointer select-none': clickable,
        'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2': clickable,
        'transform': clickable,
        'hover:backdrop-blur-xl hover:bg-white/25 dark:hover:bg-black/25': clickable && !pressed && !isGradientBorder,
        'active:scale-[0.98]': clickable,
        'scale-[0.98]': pressed
      },
      
      // Custom classes
      className
    );

    const innerContentClasses = classNames(
      // Glass effect for gradient border cards
      isGradientBorder && intensityClasses[intensity],
      
      // Spacing for gradient border cards
      isGradientBorder && paddingClasses[padding],
      
      // Interactive hover for gradient border cards
      {
        'hover:backdrop-blur-xl hover:bg-white/25 dark:hover:bg-black/25': clickable && !pressed && isGradientBorder,
      }
    );

    const defaultMotionProps: MotionProps = clickable ? {
      whileHover: pressed ? {} : { 
        scale: 1.02, 
        y: -2,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      },
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
      onClick: handleClick,
      ...(clickable && {
        onKeyDown: handleKeyDown,
        tabIndex: 0,
        role: 'button',
        'aria-pressed': pressed
      }),
      ...rest
    };

    // Render gradient border variant
    if (isGradientBorder) {
      const gradientStyles = getGradientBorderStyles(borderGradient, radiusValue);
      const innerStyles = getInnerContentStyles(
        radiusValue,
        tintColor,
        tintOpacity
      );

      return (
        <motion.div
          {...cardProps}
          style={gradientStyles}
          {...combinedMotionProps}
        >
          <div
            className={innerContentClasses}
            style={innerStyles}
          >
            {children}
          </div>
        </motion.div>
      );
    }

    // Render standard glass variant
    const cardStyles: React.CSSProperties = {};
    
    if (tintColor && tintOpacity) {
      cardStyles.backgroundColor = `${tintColor}${Math.round(tintOpacity * 255).toString(16).padStart(2, '0')}`;
    }

    return (
      <motion.div
        {...cardProps}
        style={cardStyles}
        {...combinedMotionProps}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

// Glass card variants for common use cases
export interface GlassHeroCardProps extends Omit<GlassCardProps, 'intensity' | 'border' | 'shadowIntensity'> {
  /** Optional custom props - inherits strong intensity with gradient border */
}

export const GlassHeroCard = forwardRef<HTMLDivElement, GlassHeroCardProps>(
  (props, ref) => (
    <GlassCard
      ref={ref}
      intensity="strong"
      border="gradient"
      borderGradient={{
        from: 'rgba(255, 255, 255, 0.3)',
        to: 'rgba(255, 255, 255, 0.1)',
        direction: 'to-br'
      }}
      shadowIntensity="xl"
      {...props}
    />
  )
);

GlassHeroCard.displayName = 'GlassHeroCard';

export interface GlassNavCardProps extends Omit<GlassCardProps, 'intensity' | 'border' | 'padding'> {
  /** Optional custom props - inherits subtle intensity with solid border */
}

export const GlassNavCard = forwardRef<HTMLDivElement, GlassNavCardProps>(
  (props, ref) => (
    <GlassCard
      ref={ref}
      intensity="subtle"
      border="solid"
      padding="sm"
      {...props}
    />
  )
);

GlassNavCard.displayName = 'GlassNavCard';

export interface GlassContentCardProps extends Omit<GlassCardProps, 'intensity' | 'shadowIntensity'> {
  /** Optional custom props - inherits medium intensity */
}

export const GlassContentCard = forwardRef<HTMLDivElement, GlassContentCardProps>(
  (props, ref) => (
    <GlassCard
      ref={ref}
      intensity="medium"
      shadowIntensity="md"
      {...props}
    />
  )
);

GlassContentCard.displayName = 'GlassContentCard';

// Export all glass card variants
export const GlassComponents = {
  GlassCard,
  GlassHeroCard,
  GlassNavCard,
  GlassContentCard
};

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/core/utils, @/theme)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - pure component with motion
- [x] Reads config from `@/app/config` (N/A for this component)
- [x] Exports default named component (exports GlassCard with forwardRef plus variant components)
- [x] Adds basic ARIA and keyboard handlers (role=button, aria-pressed, keyboard support for clickable cards)
*/
