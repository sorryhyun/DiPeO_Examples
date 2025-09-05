// filepath: src/shared/components/Skeleton.tsx

import React from 'react';
import { slideIn, fadeIn } from '@/theme/animations';

// =============================
// TYPES & INTERFACES
// =============================

export interface SkeletonProps {
  /** Width of the skeleton - can be string (CSS value) or number (pixels) */
  width?: string | number;
  
  /** Height of the skeleton - can be string (CSS value) or number (pixels) */
  height?: string | number;
  
  /** Variant determines the shape and default dimensions */
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  
  /** Number of lines for text variant */
  lines?: number;
  
  /** Animation type - shimmer is default, pulse is alternative, none disables */
  animation?: 'shimmer' | 'pulse' | 'none';
  
  /** Additional CSS classes */
  className?: string;
  
  /** Inline styles */
  style?: React.CSSProperties;
  
  /** Accessibility label */
  'aria-label'?: string;
  
  /** Whether to show skeleton or children (useful for conditional loading) */
  loading?: boolean;
  
  /** Content to show when not loading */
  children?: React.ReactNode;
}

// Default dimensions for each variant
const VARIANT_DEFAULTS = {
  text: { width: '100%', height: '1em' },
  rectangular: { width: '100%', height: '200px' },
  circular: { width: '40px', height: '40px' },
  rounded: { width: '100%', height: '12px' },
} as const;

// =============================
// SKELETON COMPONENT
// =============================

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  variant = 'text',
  lines = 1,
  animation = 'shimmer',
  className = '',
  style = {},
  'aria-label': ariaLabel,
  loading = true,
  children,
}) => {
  // If not loading, render children
  if (!loading) {
    return <>{children}</>;
  }

  // Get default dimensions based on variant
  const defaults = VARIANT_DEFAULTS[variant];
  const resolvedWidth = width ?? defaults.width;
  const resolvedHeight = height ?? defaults.height;

  // Convert numbers to pixels
  const widthValue = typeof resolvedWidth === 'number' ? `${resolvedWidth}px` : resolvedWidth;
  const heightValue = typeof resolvedHeight === 'number' ? `${resolvedHeight}px` : resolvedHeight;

  // Base skeleton styles
  const baseStyles: React.CSSProperties = {
    width: widthValue,
    height: heightValue,
    backgroundColor: 'var(--skeleton-bg, #e2e8f0)',
    borderRadius: getBorderRadius(variant),
    display: 'block',
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };

  // Animation styles
  const animationStyles = getAnimationStyles(animation);

  // Combined styles
  const skeletonStyles = {
    ...baseStyles,
    ...animationStyles,
  };

  // Generate multiple lines for text variant
  if (variant === 'text' && lines > 1) {
    return (
      <div
        className={`skeleton-container ${className}`}
        aria-label={ariaLabel || 'Loading content'}
        role="status"
        aria-live="polite"
      >
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={`skeleton skeleton-${variant} skeleton-${animation}`}
            style={{
              ...skeletonStyles,
              marginBottom: index < lines - 1 ? '0.5em' : 0,
              width: index === lines - 1 ? '75%' : '100%', // Last line shorter
            }}
          />
        ))}
      </div>
    );
  }

  // Single skeleton element
  return (
    <div
      className={`skeleton skeleton-${variant} skeleton-${animation} ${className}`}
      style={skeletonStyles}
      aria-label={ariaLabel || 'Loading content'}
      role="status"
      aria-live="polite"
    />
  );
};

// =============================
// UTILITY FUNCTIONS
// =============================

/**
 * Get border radius based on variant
 */
function getBorderRadius(variant: SkeletonProps['variant']): string {
  switch (variant) {
    case 'circular':
      return '50%';
    case 'rounded':
      return '8px';
    case 'rectangular':
      return '4px';
    case 'text':
    default:
      return '4px';
  }
}

/**
 * Get animation-specific styles
 */
function getAnimationStyles(animation: SkeletonProps['animation']): React.CSSProperties {
  switch (animation) {
    case 'shimmer':
      return {
        background: `
          linear-gradient(
            90deg,
            var(--skeleton-bg, #e2e8f0) 25%,
            var(--skeleton-highlight, #f1f5f9) 50%,
            var(--skeleton-bg, #e2e8f0) 75%
          )
        `,
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
      };
    
    case 'pulse':
      return {
        animation: 'skeleton-pulse 1.5s ease-in-out infinite',
      };
    
    case 'none':
    default:
      return {};
  }
}

// =============================
// SKELETON VARIANTS
// =============================

/**
 * Text skeleton with multiple lines support
 */
export const TextSkeleton: React.FC<Omit<SkeletonProps, 'variant'>> = (props) => (
  <Skeleton {...props} variant="text" />
);

/**
 * Avatar skeleton (circular)
 */
export const AvatarSkeleton: React.FC<Omit<SkeletonProps, 'variant'>> = (props) => (
  <Skeleton {...props} variant="circular" />
);

/**
 * Card skeleton (rectangular with rounded corners)
 */
export const CardSkeleton: React.FC<Omit<SkeletonProps, 'variant'>> = (props) => (
  <Skeleton {...props} variant="rectangular" />
);

/**
 * Button skeleton (rounded)
 */
export const ButtonSkeleton: React.FC<Omit<SkeletonProps, 'variant'>> = (props) => (
  <Skeleton {...props} variant="rounded" height={props.height || '40px'} />
);

// =============================
// COMPOSITE SKELETONS
// =============================

/**
 * Profile card skeleton with avatar and text
 */
export const ProfileCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center space-x-4 p-4 ${className}`}>
    <AvatarSkeleton width={48} height={48} />
    <div className="flex-1">
      <TextSkeleton width="60%" height="1.2em" />
      <TextSkeleton width="40%" height="1em" style={{ marginTop: '0.5em' }} />
    </div>
  </div>
);

/**
 * List item skeleton with optional leading element
 */
export const ListItemSkeleton: React.FC<{
  showAvatar?: boolean;
  showSecondaryText?: boolean;
  className?: string;
}> = ({ 
  showAvatar = false, 
  showSecondaryText = true,
  className = '' 
}) => (
  <div className={`flex items-center space-x-3 p-3 ${className}`}>
    {showAvatar && <AvatarSkeleton width={32} height={32} />}
    <div className="flex-1">
      <TextSkeleton width="75%" height="1.1em" />
      {showSecondaryText && (
        <TextSkeleton width="50%" height="0.9em" style={{ marginTop: '0.25em' }} />
      )}
    </div>
  </div>
);

/**
 * Table row skeleton
 */
export const TableRowSkeleton: React.FC<{
  columns?: number;
  className?: string;
}> = ({ columns = 4, className = '' }) => (
  <tr className={className}>
    {Array.from({ length: columns }, (_, index) => (
      <td key={index} className="p-3">
        <TextSkeleton width={index === 0 ? '80%' : '60%'} height="1em" />
      </td>
    ))}
  </tr>
);

/**
 * Chart skeleton with bars/lines
 */
export const ChartSkeleton: React.FC<{
  type?: 'bar' | 'line' | 'pie';
  className?: string;
}> = ({ type = 'bar', className = '' }) => {
  if (type === 'pie') {
    return (
      <div className={`flex justify-center items-center h-64 ${className}`}>
        <AvatarSkeleton width={200} height={200} />
      </div>
    );
  }

  return (
    <div className={`h-64 p-4 ${className}`}>
      <div className="flex items-end justify-between h-full space-x-2">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="flex-1"
            style={{ height: `${Math.random() * 80 + 20}%` }}
          >
            <Skeleton
              width="100%"
              height="100%"
              variant="rectangular"
              animation="pulse"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// =============================
// GLOBAL STYLES INJECTION
// =============================

// Inject keyframes and CSS custom properties
if (typeof document !== 'undefined') {
  const styleId = 'skeleton-styles';
  
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes skeleton-shimmer {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }
      
      @keyframes skeleton-pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.4;
        }
      }
      
      :root {
        --skeleton-bg: #e2e8f0;
        --skeleton-highlight: #f1f5f9;
      }
      
      @media (prefers-color-scheme: dark) {
        :root {
          --skeleton-bg: #374151;
          --skeleton-highlight: #4b5563;
        }
      }
      
      .skeleton {
        user-select: none;
        pointer-events: none;
      }
      
      .skeleton-container {
        width: 100%;
      }
    `;
    document.head.appendChild(style);
  }
}

// =============================
// DEFAULT EXPORT
// =============================

export default Skeleton;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - minimal DOM manipulation for style injection only
// [x] Reads config from `@/app/config` - N/A for this component
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant) - includes role="status", aria-live="polite", aria-label
