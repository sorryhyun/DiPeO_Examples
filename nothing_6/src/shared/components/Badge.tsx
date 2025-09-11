// filepath: src/shared/components/Badge.tsx

// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

/* src/shared/components/Badge.tsx

   Small badge/pill component for status & trust badges.

   Usage examples:
     <Badge variant="primary" size="sm">New</Badge>
     <Badge variant="success" icon="check">Verified</Badge>
     <Badge variant="warning" pulse>Limited Time</Badge>
*/

import React from 'react'
import { theme, themeUtils } from '@/theme'
import { config } from '@/app/config'

// Badge variant types
export type BadgeVariant = 
  | 'primary'
  | 'secondary' 
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'
  | 'trust'
  | 'status'

// Badge size types
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg'

// Badge props interface
export interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  icon?: string | React.ReactNode
  pulse?: boolean
  outlined?: boolean
  removable?: boolean
  className?: string
  onClick?: () => void
  onRemove?: () => void
  'aria-label'?: string
  role?: string
  id?: string
}

// Get variant-specific styles
const getVariantStyles = (variant: BadgeVariant, outlined: boolean = false, isDark: boolean = false): string => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200'
  
  const variantStyles = {
    primary: outlined 
      ? `border border-blue-500 text-blue-600 dark:text-blue-400 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-950/20`
      : `bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700`,
    secondary: outlined
      ? `border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50`
      : `bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600`,
    success: outlined
      ? `border border-green-500 text-green-600 dark:text-green-400 bg-transparent hover:bg-green-50 dark:hover:bg-green-950/20`
      : `bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700`,
    warning: outlined
      ? `border border-yellow-500 text-yellow-600 dark:text-yellow-400 bg-transparent hover:bg-yellow-50 dark:hover:bg-yellow-950/20`
      : `bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700`,
    error: outlined
      ? `border border-red-500 text-red-600 dark:text-red-400 bg-transparent hover:bg-red-50 dark:hover:bg-red-950/20`
      : `bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700`,
    info: outlined
      ? `border border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-transparent hover:bg-cyan-50 dark:hover:bg-cyan-950/20`
      : `bg-cyan-500 text-white hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700`,
    neutral: outlined
      ? `border border-gray-400 text-gray-600 dark:text-gray-400 dark:border-gray-500 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50`
      : `bg-gray-500 text-white hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700`,
    trust: outlined
      ? `border border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-transparent hover:bg-emerald-50 dark:hover:bg-emerald-950/20`
      : `bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600`,
    status: outlined
      ? `border border-blue-400 text-blue-600 dark:text-blue-400 dark:border-blue-500 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-950/20`
      : `bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600`,
  }
  
  return `${baseStyles} ${variantStyles[variant]}`
}

// Get size-specific styles
const getSizeStyles = (size: BadgeSize): string => {
  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-xs rounded-full min-h-[18px]',
    sm: 'px-2 py-1 text-xs rounded-full min-h-[20px]',
    md: 'px-2.5 py-1 text-sm rounded-full min-h-[24px]',
    lg: 'px-3 py-1.5 text-sm rounded-full min-h-[28px]',
  }
  
  return sizeStyles[size]
}

// Icon component for badges
const BadgeIcon: React.FC<{ 
  icon: string | React.ReactNode
  size: BadgeSize 
}> = ({ icon, size }) => {
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-4 h-4',
  }
  
  if (typeof icon === 'string') {
    return (
      <span 
        className={`${iconSizes[size]} mr-1 flex-shrink-0`}
        aria-hidden="true"
      >
        {icon}
      </span>
    )
  }
  
  return (
    <span 
      className={`${iconSizes[size]} mr-1 flex-shrink-0`}
      aria-hidden="true"
    >
      {icon}
    </span>
  )
}

// Remove button for removable badges
const RemoveButton: React.FC<{ 
  onRemove: () => void
  size: BadgeSize
}> = ({ onRemove, size }) => {
  const buttonSizes = {
    xs: 'w-3 h-3 ml-1',
    sm: 'w-3 h-3 ml-1',
    md: 'w-4 h-4 ml-1.5',
    lg: 'w-4 h-4 ml-1.5',
  }
  
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onRemove()
      }}
      className={`${buttonSizes[size]} flex-shrink-0 hover:opacity-70 transition-opacity focus:outline-none focus:ring-1 focus:ring-white/50 rounded-full`}
      aria-label="Remove badge"
    >
      <svg
        viewBox="0 0 16 16"
        fill="currentColor"
        className="w-full h-full"
        aria-hidden="true"
      >
        <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zM12 10.59L10.59 12 8 9.41 5.41 12 4 10.59 6.59 8 4 5.41 5.41 4 8 6.59 10.59 4 12 5.41 9.41 8 12 10.59z" />
      </svg>
    </button>
  )
}

// Main Badge component
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  icon,
  pulse = false,
  outlined = false,
  removable = false,
  className = '',
  onClick,
  onRemove,
  'aria-label': ariaLabel,
  role = 'status',
  id,
  ...props
}) => {
  const isDark = theme.darkMode.isDark()
  
  // Build CSS classes
  const baseClasses = getVariantStyles(variant, outlined, isDark)
  const sizeClasses = getSizeStyles(size)
  const interactionClasses = onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
  const pulseClasses = pulse ? 'animate-pulse' : ''
  const customClasses = className
  
  const allClasses = theme.resolveClasses(
    baseClasses,
    sizeClasses,
    interactionClasses,
    pulseClasses,
    customClasses
  )
  
  // Handle click events
  const handleClick = () => {
    if (onClick && !removable) {
      onClick()
    }
  }
  
  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onClick()
    }
  }
  
  // Determine element type and props
  const isInteractive = Boolean(onClick) || removable
  const elementProps = {
    className: allClasses,
    onClick: handleClick,
    onKeyDown: isInteractive ? handleKeyDown : undefined,
    tabIndex: isInteractive ? 0 : undefined,
    role: isInteractive ? 'button' : role,
    'aria-label': ariaLabel || (typeof children === 'string' ? children : undefined),
    id,
    ...props,
  }
  
  // Development debugging
  if (config.isDevelopment && !children) {
    console.warn('Badge: No children provided')
  }
  
  return (
    <span {...elementProps}>
      {icon && <BadgeIcon icon={icon} size={size} />}
      {children}
      {removable && onRemove && <RemoveButton onRemove={onRemove} size={size} />}
    </span>
  )
}

// Preset badge components for common use cases
export const StatusBadge: React.FC<Omit<BadgeProps, 'variant'> & {
  status: 'online' | 'offline' | 'away' | 'busy'
}> = ({ status, ...props }) => {
  const statusConfig = {
    online: { variant: 'success' as BadgeVariant, children: 'Online', icon: '●' },
    offline: { variant: 'neutral' as BadgeVariant, children: 'Offline', icon: '○' },
    away: { variant: 'warning' as BadgeVariant, children: 'Away', icon: '◐' },
    busy: { variant: 'error' as BadgeVariant, children: 'Busy', icon: '◯' },
  }
  
  const config = statusConfig[status]
  
  return (
    <Badge 
      variant={config.variant}
      icon={config.icon}
      {...props}
    >
      {props.children || config.children}
    </Badge>
  )
}

export const TrustBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
  <Badge 
    variant="trust" 
    icon="✓"
    role="img"
    aria-label="Verified and trusted"
    {...props} 
  />
)

export const NewBadge: React.FC<Omit<BadgeProps, 'variant' | 'children'>> = (props) => (
  <Badge 
    variant="primary" 
    pulse
    size="xs"
    {...props}
  >
    New
  </Badge>
)

// Export the main component as default
export default Badge

// Development helpers
if (config.isDevelopment && typeof window !== 'undefined') {
  (window as any).__BADGE_VARIANTS__ = {
    variants: ['primary', 'secondary', 'success', 'warning', 'error', 'info', 'neutral', 'trust', 'status'],
    sizes: ['xs', 'sm', 'md', 'lg'],
    examples: {
      basic: '<Badge>Default</Badge>',
      withIcon: '<Badge variant="success" icon="✓">Verified</Badge>',
      removable: '<Badge removable onRemove={() => {}}>Tag</Badge>',
      status: '<StatusBadge status="online" />',
      trust: '<TrustBadge>Verified</TrustBadge>',
    }
  }
}
