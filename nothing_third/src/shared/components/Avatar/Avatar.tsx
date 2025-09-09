// filepath: src/shared/components/Avatar/Avatar.tsx
import React from 'react';
import { classNames } from '@/core/utils';

export interface AvatarProps {
  /** User's full name for generating initials */
  name?: string;
  /** Image URL for avatar */
  src?: string;
  /** Alt text for image (defaults to name) */
  alt?: string;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Shape variant */
  shape?: 'circle' | 'square';
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: () => void;
  /** Whether avatar is clickable/interactive */
  clickable?: boolean;
  /** Custom background color for initials */
  backgroundColor?: string;
  /** Custom text color for initials */
  textColor?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl'
};

const shapeClasses = {
  circle: 'rounded-full',
  square: 'rounded-md'
};

/**
 * Generates initials from a full name
 * @param name - Full name string
 * @returns Up to 2 uppercase initials
 */
function getInitials(name?: string): string {
  if (!name) return '';
  
  const words = name.trim().split(/\s+/);
  
  if (words.length === 1) {
    // Single word: take first 2 characters
    return words[0].slice(0, 2).toUpperCase();
  }
  
  // Multiple words: take first letter of first and last word
  const firstInitial = words[0].charAt(0);
  const lastInitial = words[words.length - 1].charAt(0);
  
  return (firstInitial + lastInitial).toUpperCase();
}

/**
 * Generates a consistent background color based on name
 * @param name - User's name
 * @returns CSS color string
 */
function getBackgroundColor(name?: string): string {
  if (!name) return '#6b7280'; // gray-500
  
  // Simple hash function for consistent colors
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Color palette for avatars
  const colors = [
    '#ef4444', // red-500
    '#f97316', // orange-500
    '#f59e0b', // amber-500
    '#eab308', // yellow-500
    '#84cc16', // lime-500
    '#22c55e', // green-500
    '#10b981', // emerald-500
    '#06b6d4', // cyan-500
    '#3b82f6', // blue-500
    '#6366f1', // indigo-500
    '#8b5cf6', // violet-500
    '#a855f7', // purple-500
    '#d946ef', // fuchsia-500
    '#ec4899', // pink-500
  ];
  
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({
  name,
  src,
  alt,
  size = 'md',
  shape = 'circle',
  className,
  onClick,
  clickable = Boolean(onClick),
  backgroundColor,
  textColor = '#ffffff'
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoading, setImageLoading] = React.useState(Boolean(src));
  
  const initials = getInitials(name);
  const defaultBackgroundColor = backgroundColor || getBackgroundColor(name);
  const shouldShowImage = src && !imageError;
  const shouldShowInitials = !shouldShowImage && initials;
  
  const handleImageLoad = () => {
    setImageLoading(false);
  };
  
  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };
  
  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (clickable && onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick();
    }
  };
  
  const baseClasses = classNames(
    'inline-flex items-center justify-center font-medium select-none',
    sizeClasses[size],
    shapeClasses[shape],
    {
      'cursor-pointer transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2': clickable,
      'cursor-default': !clickable
    },
    className
  );
  
  const avatarStyle: React.CSSProperties = shouldShowInitials ? {
    backgroundColor: defaultBackgroundColor,
    color: textColor
  } : {};
  
  const avatarProps = {
    className: baseClasses,
    style: avatarStyle,
    ...(clickable && {
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      tabIndex: 0,
      role: 'button',
      'aria-label': `Avatar for ${name || 'user'}`
    })
  };
  
  return (
    <div {...avatarProps}>
      {shouldShowImage && (
        <img
          src={src}
          alt={alt || name || 'User avatar'}
          className={classNames(
            'w-full h-full object-cover',
            shapeClasses[shape],
            { 'opacity-0': imageLoading }
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
          draggable={false}
        />
      )}
      
      {shouldShowInitials && (
        <span
          className="font-semibold"
          aria-label={`Initials for ${name}`}
        >
          {initials}
        </span>
      )}
      
      {!shouldShowImage && !shouldShowInitials && (
        <svg
          className={classNames('w-3/4 h-3/4 text-gray-300')}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
      
      {imageLoading && shouldShowImage && (
        <div
          className={classNames(
            'absolute inset-0 bg-gray-200 animate-pulse',
            shapeClasses[shape]
          )}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/core/utils)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - pure component with internal state
- [x] Reads config from `@/app/config` (N/A for this component)
- [x] Exports default named component (exports Avatar function)
- [x] Adds basic ARIA and keyboard handlers (includes aria-label, role=button, keyboard support for clickable avatars)
*/
