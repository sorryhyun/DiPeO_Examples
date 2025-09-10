// filepath: src/shared/components/Skeleton.tsx

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { pulseMotion, EASINGS } from '@/theme/animations';

// ============================================================================
// SKELETON TYPES & INTERFACES
// ============================================================================

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';
export type SkeletonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface SkeletonProps {
  /**
   * Variant determines the shape of the skeleton
   */
  variant?: SkeletonVariant;
  
  /**
   * Size preset for common dimensions
   */
  size?: SkeletonSize;
  
  /**
   * Custom width (overrides size preset)
   */
  width?: string | number;
  
  /**
   * Custom height (overrides size preset)
   */
  height?: string | number;
  
  /**
   * Number of lines for text variant
   */
  lines?: number;
  
  /**
   * Custom class name
   */
  className?: string;
  
  /**
   * Whether to animate the skeleton
   */
  animate?: boolean;
  
  /**
   * Custom animation duration in seconds
   */
  animationDuration?: number;
  
  /**
   * ARIA label for accessibility
   */
  'aria-label'?: string;
}

// ============================================================================
// SIZE PRESETS
// ============================================================================

const sizePresets: Record<SkeletonVariant, Record<SkeletonSize, { width: string; height: string }>> = {
  text: {
    sm: { width: '100%', height: '0.875rem' }, // 14px
    md: { width: '100%', height: '1rem' }, // 16px
    lg: { width: '100%', height: '1.125rem' }, // 18px
    xl: { width: '100%', height: '1.25rem' }, // 20px
  },
  circular: {
    sm: { width: '2rem', height: '2rem' }, // 32px
    md: { width: '2.5rem', height: '2.5rem' }, // 40px
    lg: { width: '3rem', height: '3rem' }, // 48px
    xl: { width: '4rem', height: '4rem' }, // 64px
  },
  rectangular: {
    sm: { width: '8rem', height: '4rem' }, // 128x64px
    md: { width: '12rem', height: '6rem' }, // 192x96px
    lg: { width: '16rem', height: '8rem' }, // 256x128px
    xl: { width: '20rem', height: '10rem' }, // 320x160px
  },
  rounded: {
    sm: { width: '8rem', height: '4rem' }, // 128x64px
    md: { width: '12rem', height: '6rem' }, // 192x96px
    lg: { width: '16rem', height: '8rem' }, // 256x128px
    xl: { width: '20rem', height: '10rem' }, // 320x160px
  },
};

// ============================================================================
// VARIANT STYLES
// ============================================================================

const variantStyles: Record<SkeletonVariant, string> = {
  text: 'rounded-sm',
  circular: 'rounded-full',
  rectangular: 'rounded-none',
  rounded: 'rounded-lg',
};

// ============================================================================
// SKELETON COMPONENT
// ============================================================================

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  size = 'md',
  width,
  height,
  lines = 1,
  className = '',
  animate = true,
  animationDuration = 1.5,
  'aria-label': ariaLabel = 'Loading content',
  ...props
}) => {
  // Get dimensions from preset or use custom values
  const preset = sizePresets[variant][size];
  const finalWidth = width ?? preset.width;
  const finalHeight = height ?? preset.height;
  
  // Base skeleton classes
  const baseClasses = [
    'bg-gradient-to-r',
    'from-gray-200',
    'via-gray-300',
    'to-gray-200',
    'dark:from-gray-700',
    'dark:via-gray-600',
    'dark:to-gray-700',
    'bg-[length:200%_100%]',
    variantStyles[variant],
    className,
  ].filter(Boolean).join(' ');
  
  // Animation variants
  const shimmerVariants = {
    initial: {
      backgroundPosition: '200% 0',
    },
    animate: {
      backgroundPosition: '-200% 0',
      transition: {
        duration: animationDuration,
        ease: EASINGS.linear,
        repeat: Infinity,
      },
    },
  };
  
  // For text variant with multiple lines
  if (variant === 'text' && lines > 1) {
    return (
      <div 
        className={`flex flex-col space-y-2 ${className}`}
        role="status"
        aria-label={ariaLabel}
        {...props}
      >
        {Array.from({ length: lines }, (_, index) => {
          // Make the last line shorter for more realistic text appearance
          const isLastLine = index === lines - 1;
          const lineWidth = isLastLine && lines > 1 ? '75%' : finalWidth;
          
          return (
            <motion.div
              key={index}
              className={baseClasses}
              style={{
                width: lineWidth,
                height: finalHeight,
              }}
              variants={animate ? shimmerVariants : undefined}
              initial={animate ? 'initial' : undefined}
              animate={animate ? 'animate' : undefined}
              aria-hidden="true"
            />
          );
        })}
        <span className="sr-only">{ariaLabel}</span>
      </div>
    );
  }
  
  // Single skeleton element
  return (
    <motion.div
      className={baseClasses}
      style={{
        width: finalWidth,
        height: finalHeight,
      }}
      variants={animate ? shimmerVariants : undefined}
      initial={animate ? 'initial' : undefined}
      animate={animate ? 'animate' : undefined}
      role="status"
      aria-label={ariaLabel}
      {...props}
    >
      <span className="sr-only">{ariaLabel}</span>
    </motion.div>
  );
};

// ============================================================================
// SKELETON PRESETS
// ============================================================================

/**
 * Avatar skeleton preset
 */
export const SkeletonAvatar: React.FC<Omit<SkeletonProps, 'variant'>> = (props) => (
  <Skeleton variant="circular" {...props} />
);

/**
 * Text skeleton preset
 */
export const SkeletonText: React.FC<Omit<SkeletonProps, 'variant'>> = (props) => (
  <Skeleton variant="text" {...props} />
);

/**
 * Card skeleton preset
 */
export const SkeletonCard: React.FC<Omit<SkeletonProps, 'variant'>> = (props) => (
  <Skeleton variant="rounded" {...props} />
);

/**
 * Button skeleton preset
 */
export const SkeletonButton: React.FC<Omit<SkeletonProps, 'variant' | 'width' | 'height'>> = (props) => (
  <Skeleton 
    variant="rounded" 
    width="6rem" 
    height="2.5rem" 
    {...props} 
  />
);

// ============================================================================
// COMPOSITE SKELETON COMPONENTS
// ============================================================================

/**
 * User card skeleton with avatar and text
 */
export const SkeletonUserCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center space-x-3 ${className}`} role="status" aria-label="Loading user information">
    <SkeletonAvatar size="md" />
    <div className="flex-1 space-y-2">
      <SkeletonText size="md" width="60%" />
      <SkeletonText size="sm" width="40%" />
    </div>
    <span className="sr-only">Loading user information</span>
  </div>
);

/**
 * List item skeleton with icon and text
 */
export const SkeletonListItem: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center space-x-3 p-3 ${className}`} role="status" aria-label="Loading list item">
    <Skeleton variant="rounded" width="1.5rem" height="1.5rem" />
    <div className="flex-1 space-y-1">
      <SkeletonText size="md" width="80%" />
      <SkeletonText size="sm" width="60%" />
    </div>
    <span className="sr-only">Loading list item</span>
  </div>
);

/**
 * Table row skeleton
 */
export const SkeletonTableRow: React.FC<{ 
  columns?: number;
  className?: string;
}> = ({ 
  columns = 4, 
  className = ''
}) => (
  <tr className={className} role="status" aria-label="Loading table row">
    {Array.from({ length: columns }, (_, index) => (
      <td key={index} className="p-3">
        <SkeletonText size="md" width={index === 0 ? '100%' : '80%'} />
      </td>
    ))}
    <span className="sr-only">Loading table row</span>
  </tr>
);

/**
 * Article skeleton with title and paragraph
 */
export const SkeletonArticle: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`space-y-4 ${className}`} role="status" aria-label="Loading article">
    <SkeletonText size="xl" width="90%" />
    <SkeletonText size="md" lines={3} />
    <SkeletonText size="md" width="70%" />
    <span className="sr-only">Loading article</span>
  </div>
);

/**
 * Chart skeleton placeholder
 */
export const SkeletonChart: React.FC<{ 
  width?: string | number;
  height?: string | number;
  className?: string;
}> = ({ 
  width = '100%', 
  height = '20rem',
  className = ''
}) => (
  <div className={`relative ${className}`} role="status" aria-label="Loading chart">
    <Skeleton 
      variant="rounded" 
      width={width} 
      height={height}
      className="flex items-end justify-center p-8"
    />
    {/* Simulate chart bars */}
    <div className="absolute inset-0 flex items-end justify-center space-x-1 p-8" aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => {
        const heights = ['40%', '60%', '30%', '80%', '50%', '70%', '45%', '35%'];
        return (
          <div
            key={index}
            className="bg-white/20 rounded-sm flex-1 max-w-8"
            style={{ height: heights[index] }}
          />
        );
      })}
    </div>
    <span className="sr-only">Loading chart</span>
  </div>
);

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default Skeleton;

// ============================================================================
// Self-Check Comments
// ============================================================================
// [x] Uses `@/` imports only - Imports from @/theme/animations
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Pure component with motion
// [x] Reads config from `@/app/config` - Not needed for skeleton component
// [x] Exports default named component - Exports Skeleton as default and multiple named presets
// [x] Adds basic ARIA and keyboard handlers (where relevant) - Includes comprehensive ARIA labels, roles, and screen reader support
