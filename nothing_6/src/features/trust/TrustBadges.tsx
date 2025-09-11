// filepath: src/features/trust/TrustBadges.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React, { useState } from 'react'
import Badge from '@/shared/components/Badge'
import { config } from '@/app/config'

interface TrustBadge {
  id: string
  label: string
  description: string
  icon: string
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'
  certified: boolean
  expiresAt?: string
  clickable?: boolean
}

interface TrustBadgesProps {
  variant?: 'horizontal' | 'vertical' | 'grid'
  size?: 'sm' | 'md' | 'lg'
  showDescriptions?: boolean
  maxBadges?: number
  className?: string
  onBadgeClick?: (badge: TrustBadge) => void
}

const TRUST_BADGES: TrustBadge[] = [
  {
    id: 'nothing-certified',
    label: 'Nothing Certified™',
    description: 'Officially verified to contain absolutely nothing',
    icon: '🏆',
    color: 'blue',
    certified: true,
    expiresAt: '2099-12-31',
    clickable: true,
  },
  {
    id: 'void-compliant',
    label: 'Void Compliant',
    description: 'Meets all international void standards',
    icon: '✓',
    color: 'green',
    certified: true,
    clickable: true,
  },
  {
    id: 'iso-empty',
    label: 'ISO 0000:2024',
    description: 'International Organization for Standardization certified emptiness',
    icon: '📋',
    color: 'purple',
    certified: true,
    expiresAt: '2024-12-31',
    clickable: true,
  },
  {
    id: 'nothing-secure',
    label: 'Nothing Secure',
    description: 'Bank-grade security protecting your nothing',
    icon: '🔒',
    color: 'green',
    certified: true,
    clickable: true,
  },
  {
    id: 'zero-carbon',
    label: 'Zero Carbon',
    description: 'Environmentally friendly nothing with negative carbon footprint',
    icon: '🌱',
    color: 'green',
    certified: true,
    clickable: true,
  },
  {
    id: 'gdpr-void',
    label: 'GDPR Void',
    description: 'Compliant with European void protection regulations',
    icon: '🇪🇺',
    color: 'blue',
    certified: true,
    clickable: true,
  },
  {
    id: 'nothing-fresh',
    label: 'Nothing Fresh',
    description: 'Delivered within 0 seconds of ordering',
    icon: '⚡',
    color: 'yellow',
    certified: true,
    clickable: true,
  },
  {
    id: 'quantum-verified',
    label: 'Quantum Verified',
    description: 'Verified to exist in superposition of nothing and nothing',
    icon: '⚛️',
    color: 'purple',
    certified: true,
    clickable: true,
  },
  {
    id: 'ai-approved',
    label: 'AI Approved',
    description: 'Approved by 0 out of 0 artificial intelligences',
    icon: '🤖',
    color: 'blue',
    certified: true,
    clickable: true,
  },
  {
    id: 'money-back',
    label: '100% Money Back',
    description: 'Get your nothing back or your money back',
    icon: '💰',
    color: 'green',
    certified: true,
    clickable: true,
  },
]

export function TrustBadges({
  variant = 'horizontal',
  size = 'md',
  showDescriptions = false,
  maxBadges,
  className = '',
  onBadgeClick,
}: TrustBadgesProps) {
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null)

  // Filter and limit badges based on props
  const displayBadges = React.useMemo(() => {
    let badges = TRUST_BADGES.filter(badge => badge.certified)
    
    if (maxBadges && maxBadges > 0) {
      badges = badges.slice(0, maxBadges)
    }
    
    return badges
  }, [maxBadges])

  const handleBadgeClick = (badge: TrustBadge) => {
    if (!badge.clickable) return

    setSelectedBadge(badge.id === selectedBadge ? null : badge.id)
    onBadgeClick?.(badge)
  }

  const handleBadgeKeyDown = (event: React.KeyboardEvent, badge: TrustBadge) => {
    if (!badge.clickable) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleBadgeClick(badge)
    }
  }

  const getContainerClasses = () => {
    const base = 'flex gap-2'
    
    switch (variant) {
      case 'vertical':
        return `${base} flex-col`
      case 'grid':
        return `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2`
      default:
        return `${base} flex-wrap`
    }
  }

  const getBadgeSize = () => {
    switch (size) {
      case 'sm': return 'sm'
      case 'lg': return 'lg'
      default: return 'md'
    }
  }

  const isExpired = (badge: TrustBadge) => {
    if (!badge.expiresAt) return false
    return new Date() > new Date(badge.expiresAt)
  }

  return (
    <div 
      className={`trust-badges ${getContainerClasses()} ${className}`}
      role="region"
      aria-label="Trust badges and certifications"
    >
      {displayBadges.map((badge) => {
        const expired = isExpired(badge)
        const isSelected = selectedBadge === badge.id
        
        return (
          <div key={badge.id} className="relative">
            <Badge
              variant={badge.color}
              size={getBadgeSize()}
              className={`
                transition-all duration-200
                ${badge.clickable ? 'cursor-pointer hover:scale-105 focus:scale-105' : ''}
                ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
                ${expired ? 'opacity-50 grayscale' : ''}
                ${!badge.certified ? 'opacity-75' : ''}
              `}
              onClick={() => handleBadgeClick(badge)}
              onKeyDown={(e) => handleBadgeKeyDown(e, badge)}
              tabIndex={badge.clickable ? 0 : -1}
              role={badge.clickable ? 'button' : 'img'}
              aria-label={`${badge.label}: ${badge.description}${expired ? ' (expired)' : ''}`}
              aria-pressed={badge.clickable ? isSelected : undefined}
              aria-describedby={showDescriptions ? `${badge.id}-desc` : undefined}
            >
              <span className="mr-1" aria-hidden="true">{badge.icon}</span>
              {badge.label}
              {expired && (
                <span className="ml-1 text-xs opacity-75" aria-label="expired">
                  (expired)
                </span>
              )}
            </Badge>
            
            {showDescriptions && (
              <div 
                id={`${badge.id}-desc`}
                className={`
                  absolute z-10 mt-1 p-2 bg-gray-900 text-white text-xs rounded-md shadow-lg
                  transition-opacity duration-200 pointer-events-none
                  ${isSelected ? 'opacity-100' : 'opacity-0'}
                  ${variant === 'vertical' ? 'left-0' : 'left-1/2 transform -translate-x-1/2'}
                  min-w-max max-w-xs
                `}
                role="tooltip"
              >
                {badge.description}
                {badge.expiresAt && !expired && (
                  <div className="text-xs opacity-75 mt-1">
                    Valid until: {new Date(badge.expiresAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
      
      {config.isDevelopment && displayBadges.length === 0 && (
        <div className="text-gray-500 text-sm italic">
          No certified trust badges available
        </div>
      )}
    </div>
  )
}

// Convenience component for common use cases
export function HorizontalTrustBadges(props: Omit<TrustBadgesProps, 'variant'>) {
  return <TrustBadges {...props} variant="horizontal" />
}

export function VerticalTrustBadges(props: Omit<TrustBadgesProps, 'variant'>) {
  return <TrustBadges {...props} variant="vertical" />
}

export function GridTrustBadges(props: Omit<TrustBadgesProps, 'variant'>) {
  return <TrustBadges {...props} variant="grid" />
}

// Export individual badges for custom usage
export const trustBadges = TRUST_BADGES

export default TrustBadges
