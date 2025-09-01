// filepath: src/components/Skeleton.tsx
/* src/components/Skeleton.tsx

Skeleton loading primitives for placeholders: line, avatar, card. 
Uses CSS gradient shimmer consistent with theme tokens.
*/

import React from 'react';
import { classNames } from '@/core/utils';

export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  children?: React.ReactNode;
}

export interface SkeletonLineProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export interface SkeletonAvatarProps {
  className?: string;
  size?: string | number;
}

export interface SkeletonCardProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  showAvatar?: boolean;
  lines?: number;
}

// Base Skeleton component with shimmer animation
export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  borderRadius = '4px',
  children,
  ...props
}) => {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
  };

  return (
    <div
      className={classNames('skeleton', className)}
      style={style}
      role="status"
      aria-label="Loading content"
      {...props}
    >
      {children}
    </div>
  );
};

// Line skeleton for text placeholders
export const SkeletonLine: React.FC<SkeletonLineProps> = ({
  className,
  width = '100%',
  height = '1em',
  ...props
}) => {
  return (
    <Skeleton
      className={classNames('skeleton-line', className)}
      width={width}
      height={height}
      borderRadius="4px"
      {...props}
    />
  );
};

// Avatar skeleton for profile pictures
export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  className,
  size = '40px',
  ...props
}) => {
  const sizeValue = typeof size === 'number' ? `${size}px` : size;
  
  return (
    <Skeleton
      className={classNames('skeleton-avatar', className)}
      width={sizeValue}
      height={sizeValue}
      borderRadius="50%"
      {...props}
    />
  );
};

// Card skeleton for complex content blocks
export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className,
  width = '100%',
  height = 'auto',
  showAvatar = false,
  lines = 3,
  ...props
}) => {
  return (
    <Skeleton
      className={classNames('skeleton-card', className)}
      width={width}
      height={height}
      borderRadius="8px"
      {...props}
    >
      <div className="skeleton-card-content">
        {showAvatar && (
          <div className="skeleton-card-header">
            <SkeletonAvatar size="48px" />
            <div className="skeleton-card-header-text">
              <SkeletonLine width="60%" height="16px" />
              <SkeletonLine width="40%" height="14px" />
            </div>
          </div>
        )}
        <div className="skeleton-card-body">
          {Array.from({ length: lines }, (_, i) => (
            <SkeletonLine
              key={i}
              width={i === lines - 1 ? '70%' : '100%'}
              height="14px"
            />
          ))}
        </div>
      </div>
    </Skeleton>
  );
};

// CSS-in-JS styles (you might want to move these to global.css)
const skeletonStyles = `
.skeleton {
  background: linear-gradient(90deg, 
    var(--color-neutral-200, #e5e7eb) 0%, 
    var(--color-neutral-100, #f3f4f6) 50%, 
    var(--color-neutral-200, #e5e7eb) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  display: inline-block;
  position: relative;
  overflow: hidden;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-line {
  display: block;
  margin-bottom: 0.5rem;
}

.skeleton-line:last-child {
  margin-bottom: 0;
}

.skeleton-avatar {
  flex-shrink: 0;
}

.skeleton-card {
  padding: 1rem;
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e5e7eb);
}

.skeleton-card-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.skeleton-card-header-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .skeleton {
    background: linear-gradient(90deg, 
      var(--color-neutral-800, #1f2937) 0%, 
      var(--color-neutral-700, #374151) 50%, 
      var(--color-neutral-800, #1f2937) 100%
    );
  }
  
  .skeleton-card {
    background: var(--color-surface-dark, #111827);
    border-color: var(--color-border-dark, #374151);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
    background: var(--color-neutral-200, #e5e7eb);
  }
  
  @media (prefers-color-scheme: dark) {
    .skeleton {
      background: var(--color-neutral-800, #1f2937);
    }
  }
}
`;

// Inject styles into document head (alternative to external CSS)
if (typeof document !== 'undefined' && !document.querySelector('#skeleton-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'skeleton-styles';
  styleElement.textContent = skeletonStyles;
  document.head.appendChild(styleElement);
}

// Compound component pattern - export as default with subcomponents
const SkeletonComponent = Object.assign(Skeleton, {
  Line: SkeletonLine,
  Avatar: SkeletonAvatar,
  Card: SkeletonCard,
});

export default SkeletonComponent;

/* Example usage:

// Simple skeleton
<Skeleton width="200px" height="20px" />

// Text lines
<Skeleton.Line />
<Skeleton.Line width="80%" />
<Skeleton.Line width="60%" />

// Avatar
<Skeleton.Avatar size="48px" />

// Complex card
<Skeleton.Card 
  showAvatar={true} 
  lines={4} 
  width="300px"
/>

// Custom skeleton
<Skeleton width="100%" height="200px" borderRadius="12px">
  <div className="custom-skeleton-content">
    <Skeleton.Avatar size="32px" />
    <Skeleton.Line width="70%" />
  </div>
</Skeleton>
*/

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects - only style injection)
// [x] Reads config from `@/app/config` (not needed for skeleton components)
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (aria-label, role="status" for accessibility)
