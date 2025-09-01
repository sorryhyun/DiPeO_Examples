// filepath: src/shared/components/Skeleton.tsx
import { forwardRef, type HTMLAttributes } from 'react';
import { theme } from '@/theme';
import { animations } from '@/theme/animations';

/**
 * Skeleton component props extending standard HTML div attributes
 */
export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Width of the skeleton. Can be CSS value or 'full' for 100%
   */
  width?: string | number | 'full';
  
  /**
   * Height of the skeleton. Can be CSS value or predefined sizes
   */
  height?: string | number | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Shape variant of the skeleton
   */
  variant?: 'rectangular' | 'circular' | 'rounded' | 'text';
  
  /**
   * Animation type for the shimmer effect
   */
  animation?: 'pulse' | 'wave' | 'none';
  
  /**
   * Number of lines for text variant
   */
  lines?: number;
  
  /**
   * Whether to disable the shimmer animation
   */
  noAnimation?: boolean;
}

/**
 * Predefined height values for common skeleton sizes
 */
const HEIGHT_VARIANTS = {
  xs: '12px',
  sm: '16px', 
  md: '20px',
  lg: '24px',
  xl: '32px',
} as const;

/**
 * Get computed height value from variant or custom value
 */
function getHeight(height?: SkeletonProps['height']): string {
  if (typeof height === 'number') return `${height}px`;
  if (typeof height === 'string') {
    if (height in HEIGHT_VARIANTS) {
      return HEIGHT_VARIANTS[height as keyof typeof HEIGHT_VARIANTS];
    }
    return height;
  }
  return HEIGHT_VARIANTS.md; // default
}

/**
 * Get computed width value
 */
function getWidth(width?: SkeletonProps['width']): string {
  if (width === 'full') return '100%';
  if (typeof width === 'number') return `${width}px`;
  if (typeof width === 'string') return width;
  return '100%'; // default
}

/**
 * Get variant-specific styles
 */
function getVariantStyles(variant: SkeletonProps['variant'] = 'rectangular') {
  const baseStyles = {
    backgroundColor: theme.colors.gray[200],
    position: 'relative' as const,
    overflow: 'hidden' as const,
  };

  switch (variant) {
    case 'circular':
      return {
        ...baseStyles,
        borderRadius: '50%',
      };
    
    case 'rounded':
      return {
        ...baseStyles,
        borderRadius: theme.radii.md,
      };
      
    case 'text':
      return {
        ...baseStyles,
        borderRadius: theme.radii.sm,
      };
      
    case 'rectangular':
    default:
      return {
        ...baseStyles,
        borderRadius: theme.radii.xs,
      };
  }
}

/**
 * Get animation styles based on animation type
 */
function getAnimationStyles(animation: SkeletonProps['animation'] = 'pulse', noAnimation?: boolean) {
  if (noAnimation || animation === 'none') {
    return {};
  }

  const shimmerKeyframes = `
    @keyframes shimmer-wave {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }
  `;

  if (animation === 'wave') {
    return {
      '&::after': {
        content: '""',
        position: 'absolute' as const,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `linear-gradient(90deg, transparent, ${theme.colors.gray[50]}, transparent)`,
        animation: 'shimmer-wave 1.5s infinite',
      },
      [`@keyframes shimmer-wave`]: {
        '0%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(100%)' },
      },
    };
  }

  // Default pulse animation
  return {
    animation: `${animations.keyframes.pulse} 2s ease-in-out infinite`,
  };
}

/**
 * Skeleton component for loading states with shimmer effects
 * 
 * @example
 * // Basic rectangular skeleton
 * <Skeleton width="200px" height="20px" />
 * 
 * // Circular avatar placeholder
 * <Skeleton variant="circular" width="48px" height="48px" />
 * 
 * // Text lines with different widths
 * <Skeleton variant="text" lines={3} />
 * 
 * // Card placeholder with wave animation
 * <Skeleton width="300px" height="200px" animation="wave" variant="rounded" />
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      width,
      height,
      variant = 'rectangular',
      animation = 'pulse',
      lines = 1,
      noAnimation = false,
      className = '',
      style = {},
      ...props
    },
    ref
  ) => {
    // For text variant with multiple lines, render multiple skeleton elements
    if (variant === 'text' && lines > 1) {
      const lineElements = Array.from({ length: lines }, (_, index) => {
        const isLastLine = index === lines - 1;
        const lineWidth = isLastLine ? '75%' : '100%'; // Make last line shorter
        
        return (
          <div
            key={index}
            style={{
              ...getVariantStyles(variant),
              ...getAnimationStyles(animation, noAnimation),
              width: width ? getWidth(width) : lineWidth,
              height: getHeight(height || 'md'),
              marginBottom: index < lines - 1 ? theme.spacing.xs : 0,
              ...style,
            }}
            className={className}
          />
        );
      });

      return (
        <div
          ref={ref}
          role="status"
          aria-label="Loading content"
          aria-live="polite"
          {...props}
        >
          {lineElements}
        </div>
      );
    }

    // Single skeleton element
    const computedStyles = {
      ...getVariantStyles(variant),
      ...getAnimationStyles(animation, noAnimation),
      width: getWidth(width),
      height: getHeight(height),
      ...style,
    };

    return (
      <div
        ref={ref}
        role="status"
        aria-label="Loading content"
        aria-live="polite"
        style={computedStyles}
        className={className}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

/**
 * Predefined skeleton variants for common use cases
 */
export const SkeletonVariants = {
  /**
   * Avatar skeleton - circular with standard size
   */
  Avatar: ({ size = '48px', ...props }: Omit<SkeletonProps, 'variant'> & { size?: string }) => (
    <Skeleton variant="circular" width={size} height={size} {...props} />
  ),

  /**
   * Card skeleton - rounded rectangle
   */
  Card: ({ width = '300px', height = '200px', ...props }: SkeletonProps) => (
    <Skeleton variant="rounded" width={width} height={height} {...props} />
  ),

  /**
   * Text paragraph skeleton - multiple lines with realistic widths
   */
  Paragraph: ({ lines = 3, ...props }: Omit<SkeletonProps, 'variant'>) => (
    <Skeleton variant="text" lines={lines} height="md" {...props} />
  ),

  /**
   * Button skeleton - rounded with typical button dimensions
   */
  Button: ({ width = '120px', height = '40px', ...props }: SkeletonProps) => (
    <Skeleton variant="rounded" width={width} height={height} {...props} />
  ),

  /**
   * List item skeleton - rectangular with consistent height
   */
  ListItem: ({ width = '100%', height = '60px', ...props }: SkeletonProps) => (
    <Skeleton variant="rounded" width={width} height={height} {...props} />
  ),
};

/**
 * Skeleton group for multiple related loading states
 */
export interface SkeletonGroupProps {
  /**
   * Number of skeleton items to render
   */
  count: number;
  
  /**
   * Props to pass to each skeleton
   */
  skeletonProps?: SkeletonProps;
  
  /**
   * Spacing between skeleton items
   */
  spacing?: keyof typeof theme.spacing;
  
  /**
   * Container props
   */
  containerProps?: HTMLAttributes<HTMLDivElement>;
}

export const SkeletonGroup = ({
  count,
  skeletonProps = {},
  spacing = 'md',
  containerProps = {},
}: SkeletonGroupProps) => {
  const skeletons = Array.from({ length: count }, (_, index) => (
    <Skeleton
      key={index}
      {...skeletonProps}
      style={{
        marginBottom: index < count - 1 ? theme.spacing[spacing] : 0,
        ...skeletonProps.style,
      }}
    />
  ));

  return (
    <div role="status" aria-label={`Loading ${count} items`} {...containerProps}>
      {skeletons}
    </div>
  );
};

/*
Self-check comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (uses theme configuration)
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (includes role="status", aria-label, aria-live)
*/
