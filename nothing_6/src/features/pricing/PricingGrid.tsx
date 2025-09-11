// filepath: src/features/pricing/PricingGrid.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React, { useState, useMemo } from 'react'
import { PricingTier, ApiResult } from '@/core/contracts'
import { config, shouldUseMockData } from '@/app/config'
import { eventBus } from '@/core/events'
import PricingCard from './PricingCard'
import { nothingService } from '@/services/nothingService'
import ResponsiveContainer from '@/shared/layouts/ResponsiveContainer'

interface PricingGridProps {
  className?: string
  onTierSelect?: (tier: PricingTier) => void
  highlightedTier?: string
  showAnnualToggle?: boolean
  showComparison?: boolean
}

type BillingCycle = 'monthly' | 'annual'

const PricingGrid: React.FC<PricingGridProps> = ({
  className = '',
  onTierSelect,
  highlightedTier = 'pro',
  showAnnualToggle = true,
  showComparison = false,
}) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch pricing data with annual discount calculation
  const pricingData = useMemo(() => {
    const tiers: PricingTier[] = shouldUseMockData ? [
      {
        id: 'basic',
        name: 'Basic Nothing',
        description: 'Perfect for those just starting their journey into nothingness',
        price: 0,
        originalPrice: 9.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Absolutely nothing',
          'Zero features included',
          'Negative value proposition',
          'Emptiness guarantee',
          'Void support (none)',
        ],
        highlighted: false,
        popular: false,
        comingSoon: false,
        badge: 'Most Popular',
      },
      {
        id: 'pro',
        name: 'Pro Nothing',
        description: 'Advanced nothingness for professionals who need more nothing',
        price: 19.99,
        originalPrice: 29.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Premium nothing',
          'Enhanced emptiness',
          'Professional void',
          'Priority no-support',
          'Advanced nothing analytics',
          'Nothing API access',
        ],
        highlighted: true,
        popular: true,
        comingSoon: false,
        badge: 'Best Value',
      },
      {
        id: 'enterprise',
        name: 'Enterprise Nothing',
        description: 'Ultimate nothingness solution for large organizations',
        price: 99.99,
        originalPrice: 199.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Enterprise-grade nothing',
          'Unlimited emptiness',
          'Custom void solutions',
          'Dedicated nothing manager',
          'SLA for nothing delivery',
          'White-label nothingness',
          'Nothing compliance suite',
        ],
        highlighted: false,
        popular: false,
        comingSoon: false,
        badge: 'Enterprise',
      },
    ] : []

    // Apply annual discount (20% off)
    return tiers.map(tier => ({
      ...tier,
      price: billingCycle === 'annual' ? tier.price * 0.8 * 12 : tier.price,
      originalPrice: billingCycle === 'annual' ? tier.originalPrice * 0.8 * 12 : tier.originalPrice,
      interval: billingCycle === 'annual' ? 'year' : 'month',
    }))
  }, [billingCycle])

  const handleTierSelect = async (tier: PricingTier) => {
    if (loading) return

    setLoading(true)
    setError(null)

    try {
      // Track pricing interaction
      eventBus.emit('analytics:event', {
        name: 'pricing_tier_selected',
        properties: {
          tier_id: tier.id,
          tier_name: tier.name,
          billing_cycle: billingCycle,
          price: tier.price,
        },
      })

      // Call service to handle tier selection
      const result: ApiResult<any> = await nothingService.selectPricingTier({
        tierId: tier.id,
        billingCycle,
        price: tier.price,
      })

      if (result.success) {
        onTierSelect?.(tier)
        eventBus.emit('pricing:tier-selected', { tier, billingCycle })
      } else {
        throw new Error(result.error?.message || 'Failed to select pricing tier')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      eventBus.emit('analytics:event', {
        name: 'pricing_selection_error',
        properties: { error: message, tier_id: tier.id },
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBillingToggle = (cycle: BillingCycle) => {
    setBillingCycle(cycle)
    eventBus.emit('analytics:event', {
      name: 'billing_cycle_changed',
      properties: { cycle, previous_cycle: billingCycle },
    })
  }

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      action()
    }
  }

  return (
    <ResponsiveContainer className={`py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Choose Your Level of{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Nothing
            </span>
          </h2>
<p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Experience the perfect void with our carefully curated nothing packages.
            Each tier delivers exactly what you expect: absolutely nothing.
          </p>
        </div>

        {/* Billing Toggle */}
        {showAnnualToggle && (
          <div className="flex justify-center mb-12">
            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => handleBillingToggle('monthly')}
                  onKeyDown={(e) => handleKeyDown(e, () => handleBillingToggle('monthly'))}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    billingCycle === 'monthly'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  aria-pressed={billingCycle === 'monthly'}
                  aria-label="Select monthly billing"
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => handleBillingToggle('annual')}
                  onKeyDown={(e) => handleKeyDown(e, () => handleBillingToggle('annual'))}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 relative ${
                    billingCycle === 'annual'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  aria-pressed={billingCycle === 'annual'}
                  aria-label="Select annual billing with 20% discount"
                >
                  Annual
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 py-0.5 rounded text-center">
                    20% off
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-300 text-center" role="alert">
              {error}
            </p>
          </div>
        )}

        {/* Pricing Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12"
          role="group"
          aria-label="Pricing tiers"
        >
          {pricingData.map((tier, index) => (
            <div
              key={tier.id}
              className={`transform transition-all duration-300 ${
                tier.highlighted || tier.id === highlightedTier
                  ? 'scale-105 z-10'
                  : 'hover:scale-102'
              }`}
            >
              <PricingCard
                tier={tier}
                onSelect={() => handleTierSelect(tier)}
                loading={loading}
                highlighted={tier.highlighted || tier.id === highlightedTier}
                showComparison={showComparison}
                className={`h-full ${
                  tier.highlighted || tier.id === highlightedTier
                    ? 'border-2 border-purple-500 shadow-2xl shadow-purple-500/20'
                    : ''
                }`}
              />
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            All plans include our 30-day money-back guarantee for nothing.
            {billingCycle === 'annual' && ' Annual plans save 20% and include nothing extra.'}
          </p>
          
          {config.isDevelopment && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                Development Mode: Using mock pricing data
              </p>
            </div>
          )}
          
          <div className="flex justify-center items-center space-x-4 mt-6 text-sm text-gray-500">
            <span>✓ No setup fees</span>
            <span>✓ Cancel anytime</span>
            <span>✓ Nothing included</span>
          </div>
        </div>
      </div>
    </ResponsiveContainer>
  )
}

export default PricingGrid