// filepath: src/shared/components/Skeleton/Skeleton.tsx
import React from 'react';
import { classNames } from '@/core/utils';
import { animations } from '@/theme/animations';

export type SkeletonVariant = 'line' | 'avatar' | 'card' | 'button' | 'image' | 'circle';

export interface SkeletonProps {
  /** Visual variant of the skeleton */
  variant?: SkeletonVariant;
  /** Custom width (CSS value) */
  width?: string | number;
  /** Custom height (CSS value) */
  height?: string | number;
  /** Number of lines for 'line' variant */
  lines?: number;
  /** Disable shimmer animation */
  noAnimation?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom style overrides */
  style?: React.CSSProperties;
  /** ARIA label for screen readers */
  'aria-label'?: string;
}

/**
 * Skeleton loading component with shimmer animation
 * Provides visual placeholders during data loading states
 */
export function Skeleton({
  variant = 'line',
  width,
  height,
  lines = 1,
  noAnimation = false,
  className,
  style,
  'aria-label': ariaLabel,
  ...props
}: SkeletonProps) {
  // Convert number values to px
  const formatDimension = (value: string | number | undefined): string | undefined => {
    if (typeof value === 'number') return `${value}px`;
    return value;
  };

  const formattedWidth = formatDimension(width);
  const formattedHeight = formatDimension(height);

  // Base skeleton styles with shimmer effect
  const baseStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-background-secondary, #f3f4f6)',
    borderRadius: 'var(--radius-md, 0.375rem)',
    position: 'relative',
    overflow: 'hidden',
    ...(!noAnimation && {
      background: `linear-gradient(
        90deg,
        var(--color-background-secondary, #f3f4f6) 25%,
        var(--color-background-tertiary, #e5e7eb) 50%,
        var(--color-background-secondary, #f3f4f6) 75%
      )`,
      backgroundSize: '200% 100%',
      animation: `${animations.shimmer} 2s infinite ease-in-out`
    }),
    width: formattedWidth,
    height: formattedHeight,
    ...style
  };

  // Variant-specific styles
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'avatar':
        return {
          borderRadius: '50%',
          width: formattedWidth || '2.5rem',
          height: formattedHeight || '2.5rem',
          flexShrink: 0
        };

      case 'circle':
        return {
          borderRadius: '50%',
          width: formattedWidth || '1.5rem',
          height: formattedHeight || '1.5rem',
          flexShrink: 0
        };

      case 'button':
        return {
          borderRadius: 'var(--radius-md, 0.375rem)',
          width: formattedWidth || '6rem',
          height: formattedHeight || '2.5rem'
        };

      case 'image':
        return {
          borderRadius: 'var(--radius-lg, 0.5rem)',
          width: formattedWidth || '100%',
          height: formattedHeight || '12rem'
        };

      case 'card':
        return {
          borderRadius: 'var(--radius-lg, 0.5rem)',
          width: formattedWidth || '100%',
          height: formattedHeight || '8rem'
        };

      case 'line':
      default:
        return {
          borderRadius: 'var(--radius-sm, 0.25rem)',
          width: formattedWidth || '100%',
          height: formattedHeight || '1rem'
        };
    }
  };

  const variantStyles = getVariantStyles();
  const combinedStyle = { ...baseStyle, ...variantStyles };

  // Generate multiple lines for 'line' variant
  if (variant === 'line' && lines > 1) {
    return (
      <div
        className={classNames('skeleton-container', className)}
        role="status"
        aria-label={ariaLabel || 'Loading content'}
        {...props}
      >
        {Array.from({ length: lines }).map((_, index) => {
          // Vary width for last line to look more natural
          const lineStyle = {
            ...combinedStyle,
            ...(index === lines - 1 && !width && { width: '75%' }),
            marginBottom: index < lines - 1 ? '0.5rem' : '0'
          };

          return (
            <div
              key={index}
              className="skeleton-line"
              style={lineStyle}
              aria-hidden="true"
            />
          );
        })}
      </div>
    );
  }

  // Single skeleton element
  return (
    <div
      className={classNames('skeleton', `skeleton-${variant}`, className)}
      style={combinedStyle}
      role="status"
      aria-label={ariaLabel || `Loading ${variant}`}
      {...props}
    />
  );
}

// Compound components for common patterns
export interface SkeletonTextProps {
  lines?: number;
  width?: string | number;
  className?: string;
}

export function SkeletonText({ lines = 3, width, className }: SkeletonTextProps) {
  return (
    <Skeleton
      variant="line"
      lines={lines}
      width={width}
      className={className}
      aria-label="Loading text"
    />
  );
}

export interface SkeletonCardProps {
  /** Show avatar skeleton */
  showAvatar?: boolean;
  /** Show title skeleton */
  showTitle?: boolean;
  /** Number of content lines */
  contentLines?: number;
  /** Show action buttons area */
  showActions?: boolean;
  /** Custom padding */
  padding?: string;
  /** Additional CSS classes */
  className?: string;
}

export function SkeletonCard({
  showAvatar = false,
  showTitle = true,
  contentLines = 2,
  showActions = false,
  padding = '1rem',
  className
}: SkeletonCardProps) {
  return (
    <div
      className={classNames('skeleton-card-wrapper', className)}
      style={{
        padding,
        border: '1px solid var(--color-border-primary, #e5e7eb)',
        borderRadius: 'var(--radius-lg, 0.5rem)',
        backgroundColor: 'var(--color-background-primary, #ffffff)'
      }}
      role="status"
      aria-label="Loading card"
    >
      {/* Header with optional avatar */}
      {(showAvatar || showTitle) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: contentLines > 0 ? '1rem' : '0'
          }}
        >
          {showAvatar && <Skeleton variant="avatar" width={40} height={40} />}
          {showTitle && (
            <div style={{ flex: 1 }}>
              <Skeleton variant="line" width="60%" height="1.25rem" />
            </div>
          )}
        </div>
      )}

      {/* Content lines */}
      {contentLines > 0 && (
        <div style={{ marginBottom: showActions ? '1rem' : '0' }}>
          <SkeletonText lines={contentLines} />
        </div>
      )}

      {/* Action buttons */}
      {showActions && (
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            justifyContent: 'flex-end'
          }}
        >
          <Skeleton variant="button" width={80} />
          <Skeleton variant="button" width={80} />
        </div>
      )}
    </div>
  );
}

export interface SkeletonListProps {
  /** Number of list items */
  count?: number;
  /** Show avatar for each item */
  showAvatar?: boolean;
  /** Number of text lines per item */
  textLines?: number;
  /** Gap between items */
  gap?: string;
  /** Additional CSS classes */
  className?: string;
}

export function SkeletonList({
  count = 3,
  showAvatar = false,
  textLines = 2,
  gap = '1rem',
  className
}: SkeletonListProps) {
  return (
    <div
      className={classNames('skeleton-list', className)}
      style={{ display: 'flex', flexDirection: 'column', gap }}
      role="status"
      aria-label={`Loading list of ${count} items`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}
        >
          {showAvatar && <Skeleton variant="avatar" width={32} height={32} />}
          <div style={{ flex: 1 }}>
            <SkeletonText lines={textLines} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Export all skeleton components
export default Skeleton;

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/core/utils and @/theme/animations)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - pure UI component
- [x] Reads config from `@/app/config` (N/A for skeleton component)
- [x] Exports default named component (exports Skeleton as default and compound components)
- [x] Adds basic ARIA and keyboard handlers (includes role="status" and aria-label for screen readers)
*/
