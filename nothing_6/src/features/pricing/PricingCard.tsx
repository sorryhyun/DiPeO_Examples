// filepath: src/features/pricing/PricingCard.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import { useState, useRef, useEffect } from 'react'
import { PricingTier } from '@/core/contracts'
import { config } from '@/app/config'
import { eventBus } from '@/core/events'
import GlassCard from '@/shared/components/GlassCard'
import Button from '@/shared/components/Button'
import GuaranteeBadge from '@/features/guarantee/GuaranteeBadge'

export interface PricingCardProps {
  tier: PricingTier
  onSelect?: (tier: PricingTier) => void
  className?: string
  isLoading?: boolean
  disabled?: boolean
}

export default function PricingCard({
  tier,
  onSelect,
  className = '',
  isLoading = false,
  disabled = false
}: PricingCardProps) {
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Recursive loading bar microinteraction
  useEffect(() => {
    if (isLoading || isHovered) {
      intervalRef.current = setInterval(() => {
        setLoadingProgress(prev => {
          const next = prev + Math.random() * 15
          return next >= 100 ? 0 : next
        })
      }, 150)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setLoadingProgress(0)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isLoading, isHovered])

  const handleSelect = () => {
    if (disabled || isLoading) return
    
    eventBus.emit('analytics:track', {
      event: 'pricing_card_selected',
      properties: {
        tier_id: tier.id,
        tier_name: tier.name,
        price_cents: tier.priceCents,
      }
    })

    onSelect?.(tier)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setIsPressed(true)
      handleSelect()
    }
  }

  const handleKeyUp = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      setIsPressed(false)
    }
  }

  const formatPrice = (cents: number): string => {
    const dollars = cents / 100
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: tier.currency || 'USD',
      minimumFractionDigits: dollars % 1 === 0 ? 0 : 2,
    }).format(dollars)
  }

  const cardClasses = [
    'relative',
    'transform transition-all duration-300 ease-out',
    'cursor-pointer',
    'focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-opacity-50',
    tier.highlight ? 'scale-105 z-10' : 'hover:scale-102',
    isPressed ? 'scale-95' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div
      className={cardClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setIsPressed(false)
      }}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={`Select ${tier.name} pricing tier for ${formatPrice(tier.priceCents)}`}
      aria-disabled={disabled}
    >
      <GlassCard className="h-full p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          {tier.highlight && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium">
              Most Popular
            </div>
          )}
          
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {tier.name}
          </h3>
          
          <div className="space-y-1">
            <div className="text-4xl font-bold text-gray-900 dark:text-white">
              {formatPrice(tier.priceCents)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              per month
            </div>
          </div>
        </div>

        {/* Loading Progress Bar */}
        {(isLoading || loadingProgress > 0) && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
              role="progressbar"
              aria-valuenow={Math.round(loadingProgress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Loading progress: ${Math.round(loadingProgress)}%`}
            />
          </div>
        )}

        {/* Features */}
        <div className="space-y-3">
          {tier.features.map((feature, index) => (
            <div 
              key={index} 
              className="flex items-start space-x-3"
            >
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mt-0.5">
                <svg 
                  className="w-3 h-3 text-green-600 dark:text-green-400" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <span className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {feature}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleSelect}
          disabled={disabled || isLoading}
          className="w-full"
          variant={tier.highlight ? 'primary' : 'secondary'}
          size="lg"
          isLoading={isLoading}
        >
          {isLoading ? 'Processing...' : `Choose ${tier.name}`}
        </Button>

        {/* Money-back Guarantee Badge */}
        {config.featureToggles['money-back-guarantee-for-unsatisfied-nothing-users'] && (
          <div className="flex justify-center">
            <GuaranteeBadge 
              className="opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
        )}
      </GlassCard>
    </div>
  )
}
