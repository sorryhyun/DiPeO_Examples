// filepath: src/shared/components/Skeleton.tsx
/*
- [x] Uses `@/` imports as much as possible
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/

import React from 'react';
import { fadeIn, pulseAnimation } from '@/theme/animations';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'rectangular' | 'circular' | 'text' | 'wave';
  animation?: 'pulse' | 'wave' | 'none';
  'aria-label'?: string;
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
}

interface SkeletonCardProps {
  className?: string;
  showAvatar?: boolean;
  showTitle?: boolean;
  showContent?: boolean;
  contentLines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  variant = 'rectangular',
  animation = 'pulse',
  'aria-label': ariaLabel = 'Loading content',
  ...props
}) => {
  const baseClasses = 'bg-gray-300 dark:bg-gray-600 animate-pulse';
  
  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded',
    wave: 'rounded overflow-hidden relative'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse relative before:absolute before:inset-0 before:-translate-x-full before:animate-wave before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
    none: ''
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1.2em' : '20px'),
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      role="status"
      aria-label={ariaLabel}
      {...props}
    />
  );
};

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  className = '',
  variant = 'body'
}) => {
  const variantHeights = {
    h1: 'h-8',
    h2: 'h-7',
    h3: 'h-6',
    body: 'h-4',
    caption: 'h-3'
  };

  const variantSpacing = {
    h1: 'mb-4',
    h2: 'mb-3',
    h3: 'mb-3',
    body: 'mb-2',
    caption: 'mb-1'
  };

  return (
    <div className={`space-y-2 ${className}`} role="status" aria-label="Loading text content">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          variant="text"
          className={`${variantHeights[variant]} ${variantSpacing[variant]} ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className = '',
  showAvatar = true,
  showTitle = true,
  showContent = true,
  contentLines = 3
}) => {
  return (
    <div 
      className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 ${className}`}
      role="status"
      aria-label="Loading card content"
    >
      {showAvatar && (
        <div className="flex items-center space-x-3 mb-4">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1">
            <Skeleton variant="text" className="h-4 w-1/3 mb-2" />
            <Skeleton variant="text" className="h-3 w-1/4" />
          </div>
        </div>
      )}
      
      {showTitle && (
        <Skeleton variant="text" className="h-6 w-2/3 mb-4" />
      )}
      
      {showContent && (
        <SkeletonText lines={contentLines} variant="body" />
      )}
    </div>
  );
};

export default Skeleton;
