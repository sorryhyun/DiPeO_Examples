// filepath: src/shared/components/Avatar/Avatar.tsx
import React from 'react';
import type { User } from '@/core/contracts';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  user?: Pick<User, 'fullName' | 'avatarUrl'> | null;
  size?: AvatarSize;
  fallbackText?: string;
  className?: string;
  onClick?: () => void;
  'aria-label'?: string;
  'data-testid'?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm', 
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
} as const;

const Avatar: React.FC<AvatarProps> = ({
  user,
  size = 'md',
  fallbackText,
  className = '',
  onClick,
  'aria-label': ariaLabel,
  'data-testid': testId,
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  // Reset error state when user changes
  React.useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [user?.avatarUrl]);

  const handleImageError = React.useCallback(() => {
    setImageError(true);
  }, []);

  const handleImageLoad = React.useCallback(() => {
    setImageLoaded(true);
  }, []);

  // Generate initials from full name
  const getInitials = React.useMemo(() => {
    if (fallbackText) {
      return fallbackText.slice(0, 2).toUpperCase();
    }

    if (!user?.fullName) {
      return '?';
    }

    const names = user.fullName.trim().split(/\s+/);
    if (names.length === 1) {
      return names[0].slice(0, 2).toUpperCase();
    }
    
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }, [user?.fullName, fallbackText]);

  // Generate background color based on initials for consistency
  const getBackgroundColor = React.useMemo(() => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500',
    ];
    
    const charCode = getInitials.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  }, [getInitials]);

  const shouldShowImage = user?.avatarUrl && !imageError;
  const isClickable = typeof onClick === 'function';
  
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'rounded-full',
    'font-medium',
    'text-white',
    'select-none',
    'overflow-hidden',
    'relative',
    sizeClasses[size],
  ];

  if (isClickable) {
    baseClasses.push(
      'cursor-pointer',
      'hover:opacity-80',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-blue-500',
      'focus:ring-offset-2',
      'transition-opacity'
    );
  }

  if (!shouldShowImage) {
    baseClasses.push(getBackgroundColor);
  }

  const combinedClassName = [
    ...baseClasses,
    className,
  ].filter(Boolean).join(' ');

  const accessibleLabel = ariaLabel || 
    (user?.fullName ? `Avatar for ${user.fullName}` : 'User avatar');

  const commonProps = {
    className: combinedClassName,
    'aria-label': accessibleLabel,
    'data-testid': testId,
    role: isClickable ? 'button' : 'img',
    tabIndex: isClickable ? 0 : undefined,
    onClick: isClickable ? onClick : undefined,
    onKeyDown: isClickable ? (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.();
      }
    } : undefined,
  };

  return (
    <div {...commonProps}>
      {shouldShowImage ? (
        <>
          <img
            src={user.avatarUrl}
            alt={`Avatar for ${user.fullName || 'user'}`}
            className={`w-full h-full object-cover transition-opacity duration-200 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            draggable={false}
          />
          {!imageLoaded && (
            <div className={`absolute inset-0 flex items-center justify-center ${getBackgroundColor}`}>
              <span className="animate-pulse">
                {getInitials}
              </span>
            </div>
          )}
        </>
      ) : (
        <span className="leading-none">
          {getInitials}
        </span>
      )}
    </div>
  );
};

// Export as named export for consistency with index.ts
export { Avatar };

export default Avatar;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config` - not needed for this component
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
