// filepath: src/features/guarantee/GuaranteeBadge.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import Badge from '@/shared/components/Badge'
import { config } from '@/app/config'

interface GuaranteeBadgeProps {
  /** Badge size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Badge color variant */
  variant?: 'success' | 'primary' | 'secondary'
  /** Show full guarantee text vs abbreviated */
  showFullText?: boolean
  /** Custom guarantee period in days */
  guaranteeDays?: number
  /** Additional CSS classes */
  className?: string
  /** Custom click handler */
  onClick?: () => void
}

export function GuaranteeBadge({
  size = 'md',
  variant = 'success',
  showFullText = false,
  guaranteeDays = 30,
  className,
  onClick,
}: GuaranteeBadgeProps) {
  const guaranteeText = showFullText 
    ? `${guaranteeDays}-Day Money-Back Guarantee`
    : `${guaranteeDays}-Day Guarantee`

  const shortText = showFullText
    ? 'Get your money back if our nothing doesn\'t meet your expectations'
    : 'Full refund available'

  // Icon for the badge (shield or check mark)
  const BadgeIcon = () => (
    <svg 
      className="w-4 h-4 mr-1" 
      fill="currentColor" 
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path 
        fillRule="evenodd" 
        d="M10 1L3 5v6c0 5.55 3.84 9.74 9 9.74s9-4.19 9-9.74V5l-7-4zM9 16l-4-4 1.41-1.41L9 13.17l6.59-6.59L17 8l-8 8z" 
        clipRule="evenodd" 
      />
    </svg>
  )

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (config.isDevelopment) {
      console.info('GuaranteeBadge: No click handler provided')
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  return (
    <Badge
      size={size}
      variant={variant}
      className={`
        inline-flex items-center cursor-pointer transition-all duration-200
        hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2
        ${variant === 'success' ? 'focus:ring-green-500' : 'focus:ring-blue-500'}
        ${className || ''}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${guaranteeText}. ${shortText}`}
      title={showFullText ? shortText : guaranteeText}
    >
      <BadgeIcon />
      <span className="font-medium">
        {guaranteeText}
      </span>
    </Badge>
  )
}

export default GuaranteeBadge
