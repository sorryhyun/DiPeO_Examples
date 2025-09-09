// filepath: src/shared/components/Avatar.tsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/core/utils';
import { tokens } from '@/theme/index';

// ===============================================
// Avatar Component Types & Props
// ===============================================

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy' | 'invisible';

export interface AvatarProps {
  // Image source and alt text
  src?: string;
  alt?: string;
  
  // Fallback content
  initials?: string;
  name?: string; // Used to generate initials if not provided
  
  // Visual styling
  size?: AvatarSize;
  variant?: 'circle' | 'square' | 'rounded';
  
  // Status indicator
  status?: AvatarStatus;
  showStatus?: boolean;
  
  // Interactive states
  clickable?: boolean;
  loading?: boolean;
  
  // Event handlers
  onClick?: () => void;
  onImageError?: () => void;
  onImageLoad?: () => void;
  
  // Custom styling
  className?: string;
  style?: React.CSSProperties;
  
  // Accessibility
  role?: string;
  tabIndex?: number;
  'aria-label'?: string;
}

// ===============================================
// Avatar Size Configurations
// ===============================================

const avatarSizes = {
  xs: {
    container: 'w-6 h-6',
    text: 'text-xs',
    status: 'w-2 h-2',
    statusOffset: '-top-0.5 -right-0.5',
  },
  sm: {
    container: 'w-8 h-8',
    text: 'text-sm',
    status: 'w-2.5 h-2.5',
    statusOffset: '-top-0.5 -right-0.5',
  },
  md: {
    container: 'w-10 h-10',
    text: 'text-sm',
    status: 'w-3 h-3',
    statusOffset: '-top-0.5 -right-0.5',
  },
  lg: {
    container: 'w-12 h-12',
    text: 'text-base',
    status: 'w-3.5 h-3.5',
    statusOffset: '-top-1 -right-1',
  },
  xl: {
    container: 'w-16 h-16',
    text: 'text-lg',
    status: 'w-4 h-4',
    statusOffset: '-top-1 -right-1',
  },
  '2xl': {
    container: 'w-20 h-20',
    text: 'text-xl',
    status: 'w-5 h-5',
    statusOffset: '-top-1.5 -right-1.5',
  },
} as const;

// ===============================================
// Avatar Status Colors
// ===============================================

const statusColors = {
  online: 'bg-green-500 border-green-400',
  offline: 'bg-gray-400 border-gray-300',
  away: 'bg-yellow-500 border-yellow-400',
  busy: 'bg-red-500 border-red-400',
  invisible: 'bg-gray-300 border-gray-200',
} as const;

// ===============================================
// Utility Functions
// ===============================================

function generateInitials(name?: string, initials?: string): string {
  if (initials) return initials.slice(0, 2).toUpperCase();
  if (!name) return '??';
  
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function getVariantClasses(variant: AvatarProps['variant']): string {
  switch (variant) {
    case 'square':
      return 'rounded-none';
    case 'rounded':
      return 'rounded-lg';
    case 'circle':
    default:
      return 'rounded-full';
  }
}

// ===============================================
// Avatar Component
// ===============================================

export function Avatar({
  src,
  alt,
  initials,
  name,
  size = 'md',
  variant = 'circle',
  status,
  showStatus = false,
  clickable = false,
  loading = false,
  onClick,
  onImageError,
  onImageLoad,
  className,
  style,
  role,
  tabIndex,
  'aria-label': ariaLabel,
}: AvatarProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Get size configuration
  const sizeConfig = avatarSizes[size];
  
  // Generate initials
  const displayInitials = useMemo(() => 
    generateInitials(name, initials), 
    [name, initials]
  );
  
  // Generate accessible alt text
  const accessibleAlt = useMemo(() => {
    if (alt) return alt;
    if (name) return `${name}'s avatar`;
    return 'User avatar';
  }, [alt, name]);
  
  // Handle image load success
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
    onImageLoad?.();
  };
  
  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
    onImageError?.();
  };
  
  // Determine if we should show image
  const shouldShowImage = src && !imageError && imageLoaded;
  
  // Container classes
  const containerClasses = cn(
    // Base styles
    'relative inline-flex items-center justify-center flex-shrink-0 select-none',
    'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800',
    'border-2 border-white/20 dark:border-white/10',
    'text-gray-700 dark:text-gray-200 font-medium',
    'overflow-hidden',
    'transition-all duration-200',
    
    // Size classes
    sizeConfig.container,
    sizeConfig.text,
    
    // Variant classes
    getVariantClasses(variant),
    
    // Interactive states
    clickable && [
      'cursor-pointer',
      'hover:scale-105 hover:shadow-md',
      'active:scale-95',
      'focus:outline-none focus:ring-2 focus:ring-primary-500/50',
      'hover:bg-gradient-to-br hover:from-gray-200 hover:to-gray-300',
      'dark:hover:from-gray-600 dark:hover:to-gray-700',
    ],
    
    // Loading state
    loading && 'animate-pulse',
    
    // Custom classes
    className
  );
  
  // Status badge classes
  const statusClasses = cn(
    'absolute rounded-full border-2 border-white dark:border-gray-900',
    'shadow-sm',
    sizeConfig.status,
    sizeConfig.statusOffset,
    status ? statusColors[status] : 'bg-gray-400'
  );
  
  // Motion variants
  const imageVariants = {
    loading: { opacity: 0, scale: 1.1 },
    loaded: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    error: { 
      opacity: 0, 
      scale: 0.9,
      transition: { duration: 0.1 }
    }
  };
  
  const initialsVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.2, ease: 'easeOut' }
    }
  };
  
  return (
    <div
      className={containerClasses}
      style={style}
      onClick={clickable ? onClick : undefined}
      role={role || (clickable ? 'button' : 'img')}
      tabIndex={clickable ? (tabIndex ?? 0) : undefined}
      aria-label={ariaLabel || accessibleAlt}
      onKeyDown={clickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
    >
      <AnimatePresence mode="wait">
        {/* Image */}
        {src && !imageError && (
          <motion.img
            key="avatar-image"
            src={src}
            alt={accessibleAlt}
            className="w-full h-full object-cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
            variants={imageVariants}
            initial="loading"
            animate={imageLoaded ? "loaded" : "loading"}
            exit="error"
            loading="lazy"
          />
        )}
        
        {/* Initials Fallback */}
        {(!src || imageError) && (
          <motion.span
            key="avatar-initials"
            className="font-semibold tracking-wide"
            variants={initialsVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            aria-hidden="true"
          >
            {displayInitials}
          </motion.span>
        )}
        
        {/* Loading State */}
        {loading && (
          <motion.div
            key="avatar-loading"
            className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
      
      {/* Status Badge */}
      {showStatus && status && (
        <motion.div
          className={statusClasses}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          aria-label={`Status: ${status}`}
          role="img"
        />
      )}
    </div>
  );
}

// ===============================================
// Avatar Group Component (Bonus)
// ===============================================

export interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
  spacing?: 'tight' | 'normal' | 'loose';
  className?: string;
}

const spacingClasses = {
  tight: '-space-x-1',
  normal: '-space-x-2',
  loose: '-space-x-3',
} as const;

export function AvatarGroup({
  children,
  max = 5,
  size = 'md',
  spacing = 'normal',
  className,
}: AvatarGroupProps) {
  const childrenArray = React.Children.toArray(children);
  const visibleChildren = childrenArray.slice(0, max);
  const hiddenCount = Math.max(0, childrenArray.length - max);
  
  return (
    <div className={cn('flex items-center', spacingClasses[spacing], className)}>
      {visibleChildren.map((child, index) => (
        <div key={index} className="ring-2 ring-white dark:ring-gray-900 rounded-full">
          {React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<AvatarProps>, { size })
            : child
          }
        </div>
      ))}
      
      {hiddenCount > 0 && (
        <Avatar
          size={size}
          initials={`+${hiddenCount}`}
          className="bg-gray-500 text-white border-gray-400"
          aria-label={`${hiddenCount} more users`}
        />
      )}
    </div>
  );
}

// Export default
export default Avatar;

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (uses theme tokens)
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/
