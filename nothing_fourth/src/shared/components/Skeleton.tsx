// filepath: src/shared/components/Skeleton.tsx
import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/core/utils';
import { skeleton, pulse } from '@/theme/animations';

// ===============================================
// Skeleton Component Types & Props
// ===============================================

export type SkeletonVariant = 'shimmer' | 'pulse' | 'wave';
export type SkeletonShape = 'rectangle' | 'circle' | 'text' | 'rounded';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  // Dimensions
  width?: string | number;
  height?: string | number;
  
  // Visual variants
  variant?: SkeletonVariant;
  shape?: SkeletonShape;
  
  // Animation control
  animate?: boolean;
  duration?: number;
  delay?: number;
  
  // Content structure helpers
  lines?: number;
  avatar?: boolean;
  
  // Custom styling
  className?: string;
  children?: React.ReactNode;
  
  // Accessibility
  'aria-label'?: string;
  'aria-busy'?: boolean;
}

// ===============================================
// Skeleton Shape Configurations
// ===============================================

const shapeStyles = {
  rectangle: 'rounded-none',
  circle: 'rounded-full',
  text: 'rounded-md',
  rounded: 'rounded-lg',
} as const;

const defaultSizes = {
  rectangle: { width: '100%', height: '1rem' },
  circle: { width: '2.5rem', height: '2.5rem' },
  text: { width: '100%', height: '1rem' },
  rounded: { width: '100%', height: '8rem' },
} as const;

// ===============================================
// Animation Variants
// ===============================================

const getSkeletonAnimation = (variant: SkeletonVariant, duration: number) => {
  switch (variant) {
    case 'shimmer':
      return {
        animate: {
          backgroundPosition: ['200% 0', '-200% 0'],
        },
        transition: {
          duration: duration / 1000,
          ease: 'linear',
          repeat: Infinity,
        },
      };
    
    case 'pulse':
      return {
        ...pulse,
        transition: {
          ...pulse.transition,
          duration: duration / 1000,
        },
      };
    
    case 'wave':
      return {
        animate: {
          opacity: [0.5, 0.8, 0.5],
          transform: ['scaleX(1)', 'scaleX(1.02)', 'scaleX(1)'],
        },
        transition: {
          duration: duration / 1000,
          ease: 'easeInOut',
          repeat: Infinity,
        },
      };
    
    default:
      return skeleton;
  }
};

// ===============================================
// Shimmer Gradient Background
// ===============================================

const getShimmerBackground = (variant: SkeletonVariant) => {
  if (variant === 'shimmer') {
    return {
      background: `
        linear-gradient(
          90deg,
          transparent 0%,
          rgba(255, 255, 255, 0.4) 50%,
          transparent 100%
        ),
        linear-gradient(
          90deg,
          rgb(243 244 246) 0%,
          rgb(229 231 235) 100%
        )
      `,
      backgroundSize: '200% 100%, 100% 100%',
    };
  }
  
  return {
    backgroundColor: 'rgb(243 244 246)',
  };
};

// ===============================================
// Main Skeleton Component
// ===============================================

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(({
  width,
  height,
  variant = 'pulse',
  shape = 'rectangle',
  animate = true,
  duration = 1500,
  delay = 0,
  lines = 1,
  avatar = false,
  className,
  children,
  style = {},
  'aria-label': ariaLabel = 'Loading content',
  'aria-busy': ariaBusy = true,
  ...props
}, ref) => {
  // Determine dimensions
  const defaultSize = defaultSizes[shape];
  const dimensions = {
    width: width ?? defaultSize.width,
    height: height ?? defaultSize.height,
  };

  // Build animation configuration
  const animationConfig = animate 
    ? getSkeletonAnimation(variant, duration)
    : {};

  // Apply delay if specified
  if (delay > 0 && animationConfig.transition) {
    animationConfig.transition.delay = delay / 1000;
  }

  // Build base styles
  const baseStyles = {
    ...dimensions,
    ...getShimmerBackground(variant),
    ...style,
  };

  const baseClasses = cn(
    'skeleton',
    'animate-pulse', // Fallback CSS animation
    shapeStyles[shape],
    className
  );

  // Handle multiple text lines
  if (shape === 'text' && lines > 1) {
    return (
      <div
        ref={ref}
        className={cn('space-y-2', className)}
        role="status"
        aria-label={ariaLabel}
        aria-busy={ariaBusy}
        {...props}
      >
        {Array.from({ length: lines }, (_, index) => (
          <motion.div
            key={index}
            className={cn('skeleton', shapeStyles[shape])}
            style={{
              ...baseStyles,
              width: index === lines - 1 ? '75%' : '100%', // Last line shorter
            }}
            {...(animate ? {
              ...animationConfig,
              transition: {
                ...animationConfig.transition,
                delay: (delay + index * 100) / 1000, // Stagger lines
              },
            } : {})}
          />
        ))}
      </div>
    );
  }

  // Handle avatar skeleton (circle + text)
  if (avatar) {
    return (
      <div
        ref={ref}
        className={cn('flex items-center space-x-3', className)}
        role="status"
        aria-label={ariaLabel}
        aria-busy={ariaBusy}
        {...props}
      >
        {/* Avatar circle */}
        <motion.div
          className={cn('skeleton', shapeStyles.circle, 'flex-shrink-0')}
          style={{
            ...getShimmerBackground(variant),
            width: '2.5rem',
            height: '2.5rem',
          }}
          {...(animate ? animationConfig : {})}
        />
        
        {/* Avatar text lines */}
        <div className="flex-1 space-y-2">
          <motion.div
            className={cn('skeleton', shapeStyles.text)}
            style={{
              ...getShimmerBackground(variant),
              height: '1rem',
              width: '60%',
            }}
            {...(animate ? {
              ...animationConfig,
              transition: {
                ...animationConfig.transition,
                delay: (delay + 50) / 1000,
              },
            } : {})}
          />
          <motion.div
            className={cn('skeleton', shapeStyles.text)}
            style={{
              ...getShimmerBackground(variant),
              height: '0.75rem',
              width: '40%',
            }}
            {...(animate ? {
              ...animationConfig,
              transition: {
                ...animationConfig.transition,
                delay: (delay + 100) / 1000,
              },
            } : {})}
          />
        </div>
      </div>
    );
  }

  // Standard single skeleton
  return (
    <motion.div
      ref={ref}
      className={baseClasses}
      style={baseStyles}
      role="status"
      aria-label={ariaLabel}
      aria-busy={ariaBusy}
      {...(animate ? animationConfig : {})}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Skeleton.displayName = 'Skeleton';

// ===============================================
// Specialized Skeleton Variants
// ===============================================

export const TextSkeleton: React.FC<Omit<SkeletonProps, 'shape'>> = (props) => (
  <Skeleton {...props} shape="text" />
);

export const CircleSkeleton: React.FC<Omit<SkeletonProps, 'shape'>> = (props) => (
  <Skeleton {...props} shape="circle" />
);

export const CardSkeleton: React.FC<Omit<SkeletonProps, 'shape'>> = (props) => (
  <Skeleton {...props} shape="rounded" />
);

export const AvatarSkeleton: React.FC<Omit<SkeletonProps, 'avatar'>> = (props) => (
  <Skeleton {...props} avatar />
);

// ===============================================
// Skeleton Group Component for Complex Layouts
// ===============================================

export interface SkeletonGroupProps {
  children: React.ReactNode;
  loading?: boolean;
  fallback?: React.ReactNode;
  className?: string;
  stagger?: boolean;
  staggerDelay?: number;
}

export const SkeletonGroup: React.FC<SkeletonGroupProps> = ({
  children,
  loading = true,
  fallback,
  className,
  stagger = false,
  staggerDelay = 100,
}) => {
  if (!loading) {
    return <>{children}</>;
  }

  if (fallback) {
    return <div className={className}>{fallback}</div>;
  }

  // Auto-generate skeleton based on children structure
  const childArray = React.Children.toArray(children);
  
  return (
    <div className={cn('skeleton-group', className)} role="status" aria-label="Loading content">
      {childArray.map((_, index) => (
        <Skeleton
          key={index}
          delay={stagger ? index * staggerDelay : 0}
          className="mb-2 last:mb-0"
        />
      ))}
    </div>
  );
};

// ===============================================
// Pre-built Skeleton Layouts
// ===============================================

export const ArticleSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-4', className)} role="status" aria-label="Loading article">
    <Skeleton height="12rem" shape="rounded" />
    <Skeleton height="2rem" width="75%" shape="text" />
    <Skeleton lines={3} shape="text" />
    <div className="flex items-center space-x-3 pt-2">
      <Skeleton shape="circle" width="2rem" height="2rem" />
      <div className="space-y-1 flex-1">
        <Skeleton height="0.875rem" width="30%" shape="text" />
        <Skeleton height="0.75rem" width="20%" shape="text" />
      </div>
    </div>
  </div>
);

export const UserCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-4 space-y-3', className)} role="status" aria-label="Loading user">
    <div className="flex items-center space-x-3">
      <Skeleton shape="circle" width="3rem" height="3rem" />
      <div className="space-y-2 flex-1">
        <Skeleton height="1rem" width="60%" shape="text" />
        <Skeleton height="0.875rem" width="40%" shape="text" />
      </div>
    </div>
    <Skeleton lines={2} shape="text" />
    <div className="flex space-x-2 pt-2">
      <Skeleton height="2rem" width="5rem" shape="rounded" />
      <Skeleton height="2rem" width="5rem" shape="rounded" />
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ 
  rows?: number; 
  columns?: number; 
  className?: string; 
}> = ({ 
  rows = 5, 
  columns = 4, 
  className 
}) => (
  <div className={cn('space-y-2', className)} role="status" aria-label="Loading table">
    {/* Header row */}
    <div className="flex space-x-4 pb-2 border-b border-gray-200">
      {Array.from({ length: columns }, (_, index) => (
        <Skeleton
          key={`header-${index}`}
          height="1.25rem"
          width={`${Math.random() * 30 + 20}%`}
          shape="text"
        />
      ))}
    </div>
    
    {/* Data rows */}
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="flex space-x-4 py-2">
        {Array.from({ length: columns }, (_, colIndex) => (
          <Skeleton
            key={`cell-${rowIndex}-${colIndex}`}
            height="1rem"
            width={`${Math.random() * 40 + 15}%`}
            shape="text"
            delay={rowIndex * 50 + colIndex * 25}
          />
        ))}
      </div>
    ))}
  </div>
);

// ===============================================
// Hook for Skeleton State Management
// ===============================================

export interface UseSkeletonOptions {
  loading: boolean;
  delay?: number;
  minDuration?: number;
}

export function useSkeleton({ 
  loading, 
  delay = 0, 
  minDuration = 500 
}: UseSkeletonOptions) {
  const [showSkeleton, setShowSkeleton] = React.useState(loading);
  const [isDelayed, setIsDelayed] = React.useState(delay > 0);

  React.useEffect(() => {
    let delayTimer: NodeJS.Timeout;
    let minTimer: NodeJS.Timeout;

    if (loading) {
      if (delay > 0) {
        setIsDelayed(true);
        delayTimer = setTimeout(() => {
          setIsDelayed(false);
          setShowSkeleton(true);
        }, delay);
      } else {
        setShowSkeleton(true);
      }
    } else {
      if (showSkeleton && minDuration > 0) {
        minTimer = setTimeout(() => {
          setShowSkeleton(false);
        }, minDuration);
      } else {
        setShowSkeleton(false);
      }
    }

    return () => {
      clearTimeout(delayTimer);
      clearTimeout(minTimer);
    };
  }, [loading, delay, minDuration, showSkeleton]);

  return {
    showSkeleton: showSkeleton && !isDelayed,
    isDelayed,
  };
}

// Export default
export default Skeleton;

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (not applicable for skeleton component)
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant) - Includes proper ARIA labels and status roles
*/
