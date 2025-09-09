// filepath: src/shared/components/Skeleton/Skeleton.tsx
import React from 'react';
import { shimmerAnimation } from '@/theme/animations';

interface SkeletonProps {
  variant?: 'line' | 'avatar' | 'card' | 'rectangle';
  width?: string | number;
  height?: string | number;
  className?: string;
  'aria-label'?: string;
}

interface SkeletonLineProps extends Omit<SkeletonProps, 'variant'> {
  lines?: number;
}

interface SkeletonCardProps extends Omit<SkeletonProps, 'variant'> {
  hasAvatar?: boolean;
  hasTitle?: boolean;
  hasSubtitle?: boolean;
  contentLines?: number;
}

const baseSkeletonStyles: React.CSSProperties = {
  backgroundColor: '#f0f0f0',
  borderRadius: '4px',
  animation: `${shimmerAnimation} 1.5s ease-in-out infinite`,
  display: 'inline-block',
};

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'line',
  width = '100%',
  height,
  className = '',
  'aria-label': ariaLabel = 'Loading content',
  ...props
}) => {
  const getDefaultHeight = () => {
    switch (variant) {
      case 'avatar':
        return '40px';
      case 'card':
        return '200px';
      case 'rectangle':
        return '120px';
      default:
        return '16px';
    }
  };

  const getBorderRadius = () => {
    switch (variant) {
      case 'avatar':
        return '50%';
      case 'card':
        return '8px';
      case 'rectangle':
        return '4px';
      default:
        return '4px';
    }
  };

  const getWidth = () => {
    if (variant === 'avatar') {
      return height || '40px';
    }
    return width;
  };

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
      className={className}
      style={{
        ...baseSkeletonStyles,
        width: getWidth(),
        height: height || getDefaultHeight(),
        borderRadius: getBorderRadius(),
      }}
      {...props}
    />
  );
};

const SkeletonLine: React.FC<SkeletonLineProps> = ({
  lines = 1,
  width = '100%',
  height = '16px',
  className = '',
  'aria-label': ariaLabel = `Loading ${lines} line${lines > 1 ? 's' : ''}`,
  ...props
}) => {
  if (lines === 1) {
    return (
      <Skeleton
        variant="line"
        width={width}
        height={height}
        className={className}
        aria-label={ariaLabel}
        {...props}
      />
    );
  }

  return (
    <div role="status" aria-label={ariaLabel} aria-live="polite" className={className}>
      {Array.from({ length: lines }, (_, index) => (
        <div key={index} style={{ marginBottom: index < lines - 1 ? '8px' : '0' }}>
          <Skeleton
            variant="line"
            width={index === lines - 1 ? '75%' : width}
            height={height}
            aria-hidden="true"
          />
        </div>
      ))}
    </div>
  );
};

const SkeletonAvatar: React.FC<Omit<SkeletonProps, 'variant'>> = ({
  width = '40px',
  height,
  className = '',
  'aria-label': ariaLabel = 'Loading avatar',
  ...props
}) => {
  return (
    <Skeleton
      variant="avatar"
      width={width}
      height={height || width}
      className={className}
      aria-label={ariaLabel}
      {...props}
    />
  );
};

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  hasAvatar = false,
  hasTitle = true,
  hasSubtitle = false,
  contentLines = 3,
  width = '100%',
  height,
  className = '',
  'aria-label': ariaLabel = 'Loading card content',
  ...props
}) => {
  return (
    <div
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
      className={className}
      style={{
        ...baseSkeletonStyles,
        width,
        height: height || 'auto',
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: '#fafafa',
        border: '1px solid #f0f0f0',
        animation: 'none',
      }}
      {...props}
    >
      {hasAvatar && (
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <SkeletonAvatar width="48px" aria-hidden="true" />
          <div style={{ flex: 1 }}>
            <Skeleton variant="line" width="60%" height="14px" aria-hidden="true" />
          </div>
        </div>
      )}
      
      {hasTitle && (
        <div style={{ marginBottom: '8px' }}>
          <Skeleton variant="line" width="80%" height="20px" aria-hidden="true" />
        </div>
      )}
      
      {hasSubtitle && (
        <div style={{ marginBottom: '12px' }}>
          <Skeleton variant="line" width="65%" height="14px" aria-hidden="true" />
        </div>
      )}
      
      <SkeletonLine lines={contentLines} height="14px" aria-hidden="true" />
    </div>
  );
};

// Export compound component with sub-components
export const SkeletonComponent = Object.assign(Skeleton, {
  Line: SkeletonLine,
  Avatar: SkeletonAvatar,
  Card: SkeletonCard,
});

export { SkeletonComponent as Skeleton };
export default SkeletonComponent;

// Self-Check Comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config` (not applicable for this component)
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant) - uses role="status", aria-label, aria-live
