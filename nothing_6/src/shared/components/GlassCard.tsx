// filepath: src/shared/components/GlassCard.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React from 'react'
import { theme } from '@/theme'
import { config } from '@/app/config'

export interface GlassCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'premium' | 'subtle' | 'intense'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  glow?: boolean
  blur?: 'sm' | 'md' | 'lg' | 'xl'
  border?: boolean
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  interactive?: boolean
  onClick?: () => void
  onKeyDown?: (event: React.KeyboardEvent) => void
  role?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  tabIndex?: number
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  glow = false,
  blur = 'md',
  border = true,
  shadow = 'md',
  interactive = false,
  onClick,
  onKeyDown,
  role,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  tabIndex,
}) => {
  // Variant styles
  const variantStyles = {
    default: 'bg-white/10 dark:bg-white/5',
    premium: 'bg-gradient-to-br from-white/20 via-white/10 to-transparent dark:from-white/15 dark:via-white/8 dark:to-transparent',
    subtle: 'bg-white/5 dark:bg-white/3',
    intense: 'bg-white/25 dark:bg-white/15'
  }

  // Size styles
  const sizeStyles = {
    sm: 'p-3 rounded-lg',
    md: 'p-4 rounded-xl', 
    lg: 'p-6 rounded-2xl',
    xl: 'p-8 rounded-3xl'
  }

  // Blur styles
  const blurStyles = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl'
  }

  // Shadow styles
  const shadowStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md shadow-black/20',
    lg: 'shadow-lg shadow-black/25',
    xl: 'shadow-xl shadow-black/30'
  }

  // Border styles
  const borderStyles = border 
    ? 'border border-white/20 dark:border-white/10' 
    : ''

  // Glow effect
  const glowStyles = glow
    ? 'ring-1 ring-white/30 dark:ring-white/20 shadow-glow'
    : ''

  // Interactive styles
  const interactiveStyles = interactive
    ? 'transition-all duration-300 hover:bg-white/15 hover:shadow-lg hover:shadow-black/30 dark:hover:bg-white/10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent'
    : ''

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onKeyDown) {
      onKeyDown(event)
    }
    
    if (interactive && onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      onClick()
    }
  }

  // Resolve all classes
  const resolvedClassName = theme.resolveClasses(
    variantStyles[variant],
    sizeStyles[size],
    blurStyles[blur],
    shadowStyles[shadow],
    borderStyles,
    glowStyles,
    interactiveStyles,
    'relative overflow-hidden',
    className
  )

  // Determine appropriate ARIA attributes
  const ariaProps = {
    role: role || (interactive ? 'button' : undefined),
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    tabIndex: interactive ? (tabIndex ?? 0) : tabIndex,
  }

  return (
    <div
      className={resolvedClassName}
      onClick={interactive ? onClick : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
      {...ariaProps}
    >
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 dark:from-white/3 dark:to-black/10 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Additional glow ring for premium variants */}
      {glow && variant === 'premium' && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-[inherit] opacity-50 blur-sm -z-10" />
      )}
      
      {/* Development helper */}
      {config.isDevelopment && (
        <div className="absolute top-1 right-1 text-xs text-gray-500 dark:text-gray-400 opacity-50 pointer-events-none">
          {variant}
        </div>
      )}
    </div>
  )
}

// Additional CSS for glow effect (to be added to global.css)
const glowCSS = `
  .shadow-glow {
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.1), 
                0 0 40px rgba(255, 255, 255, 0.05),
                0 8px 32px rgba(0, 0, 0, 0.3);
  }
  
  .dark .shadow-glow {
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.05), 
                0 0 40px rgba(255, 255, 255, 0.02),
                0 8px 32px rgba(0, 0, 0, 0.5);
  }
`

// Export glow CSS for integration into global styles
export { glowCSS }

export default GlassCard
