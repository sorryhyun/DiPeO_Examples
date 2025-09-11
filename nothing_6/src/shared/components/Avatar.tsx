// filepath: src/shared/components/Avatar.tsx

// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React, { useState, useCallback } from 'react'
import { User } from '@/core/contracts'
import { config } from '@/app/config'
import { theme } from '@/theme'
import logoSvg from '@/assets/logo.svg'

export interface AvatarProps {
  user?: User | null
  src?: string
  alt?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showName?: boolean
  className?: string
  fallbackIcon?: React.ReactNode
  onClick?: () => void
  'aria-label'?: string
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-20 h-20 text-2xl',
} as const

const NAME_SIZE_CLASSES = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
} as const

function getInitials(name: string): string {
  if (!name || typeof name !== 'string') return '?'
  
  const words = name.trim().split(/\s+/)
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase()
  }
  
  return words
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('')
}

function getDisplayName(user?: User | null): string {
  if (!user) return 'Anonymous'
  return user.displayName || user.email || 'User'
}

export function Avatar({
  user,
  src,
  alt,
  size = 'md',
  showName = false,
  className = '',
  fallbackIcon,
  onClick,
  'aria-label': ariaLabel,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const displayName = getDisplayName(user)
  const initials = getInitials(displayName)
  const avatarSrc = src || user?.metadata?.avatarUrl as string || undefined
  
  const handleImageError = useCallback(() => {
    setImageError(true)
    setImageLoading(false)
  }, [])

  const handleImageLoad = useCallback(() => {
    setImageLoading(false)
    setImageError(false)
  }, [])

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick()
    }
  }, [onClick])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onClick()
    }
  }, [onClick])

  const sizeClass = SIZE_CLASSES[size]
  const nameClass = NAME_SIZE_CLASSES[size]
  
  const avatarClasses = theme.resolveClasses(
    'relative inline-flex items-center justify-center',
    'bg-gradient-to-br from-purple-500 to-blue-600',
    'text-white font-medium rounded-full',
    'overflow-hidden select-none',
    'transition-all duration-200 ease-in-out',
    sizeClass,
    onClick && 'cursor-pointer hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
    className
  )

  const effectiveAriaLabel = ariaLabel || (showName ? undefined : `Avatar for ${displayName}`)

  const avatarElement = (
    <div
      className={avatarClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={effectiveAriaLabel}
      {...props}
    >
      {/* Image layer */}
      {avatarSrc && !imageError && (
        <img
          src={avatarSrc}
          alt={alt || `${displayName} avatar`}
          className={theme.resolveClasses(
            'absolute inset-0 w-full h-full object-cover',
            imageLoading && 'opacity-0'
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
      
      {/* Loading state */}
      {imageLoading && avatarSrc && !imageError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      {/* Fallback content */}
      {(!avatarSrc || imageError) && (
        <div className="flex items-center justify-center w-full h-full">
          {fallbackIcon || (
            <span className="font-semibold tracking-wide">
              {initials}
            </span>
          )}
        </div>
      )}
      
      {/* Online/status indicator (if user has status) */}
      {user?.metadata?.isOnline && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
      )}
    </div>
  )

  // If showName is true, wrap avatar with name
  if (showName) {
    return (
      <div className={theme.resolveClasses(
        'inline-flex items-center gap-3',
        onClick && 'cursor-pointer group'
      )}>
        {avatarElement}
        <span className={theme.resolveClasses(
          'font-medium text-gray-900 dark:text-gray-100',
          onClick && 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
          nameClass
        )}>
          {displayName}
        </span>
      </div>
    )
  }

  return avatarElement
}

// Convenience component for team member avatars
export function TeamAvatar({ 
  user, 
  ...props 
}: Omit<AvatarProps, 'fallbackIcon'> & { user: User }) {
  return (
    <Avatar
      user={user}
      fallbackIcon={
        <img 
          src={logoSvg} 
          alt="Team member"
          className="w-1/2 h-1/2 opacity-60"
        />
      }
      {...props}
    />
  )
}

// Convenience component for testimonial avatars
export function TestimonialAvatar({ 
  user, 
  size = 'lg',
  ...props 
}: AvatarProps) {
  return (
    <Avatar
      user={user}
      size={size}
      className="ring-2 ring-white shadow-lg"
      {...props}
    />
  )
}

// Avatar group component for showing multiple avatars
export interface AvatarGroupProps {
  users: (User | null)[]
  max?: number
  size?: AvatarProps['size']
  className?: string
  showRemaining?: boolean
}

export function AvatarGroup({ 
  users, 
  max = 4, 
  size = 'md', 
  className = '',
  showRemaining = true 
}: AvatarGroupProps) {
  const displayUsers = users.slice(0, max)
  const remainingCount = Math.max(0, users.length - max)
  
  const groupClasses = theme.resolveClasses(
    'flex items-center -space-x-2',
    className
  )

  return (
    <div className={groupClasses}>
      {displayUsers.map((user, index) => (
        <Avatar
          key={user?.id || index}
          user={user}
          size={size}
          className="ring-2 ring-white hover:z-10 relative transition-transform hover:scale-110"
        />
      ))}
      
      {showRemaining && remainingCount > 0 && (
        <div className={theme.resolveClasses(
          'relative inline-flex items-center justify-center',
          'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300',
          'border-2 border-white rounded-full font-medium',
          SIZE_CLASSES[size]
        )}>
          +{remainingCount}
        </div>
      )}
    </div>
  )
}

// Development helpers
if (config.isDevelopment && typeof window !== 'undefined') {
  (window as any).__AVATAR_COMPONENT__ = {
    Avatar,
    TeamAvatar,
    TestimonialAvatar,
    AvatarGroup,
    SIZE_CLASSES,
    getInitials,
    getDisplayName,
  }
}

export default Avatar
