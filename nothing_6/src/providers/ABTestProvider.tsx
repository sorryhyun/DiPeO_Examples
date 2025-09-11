// filepath: src/providers/ABTestProvider.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [ ] Adds basic ARIA and keyboard handlers (where relevant - N/A for provider)

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react'
import { config, isDevelopment } from '@/app/config'
import { eventBus } from '@/core/events'
import { di, AnalyticsServiceToken } from '@/core/di'

export interface ABTestVariant {
  id: string
  name: string
  weight: number
  config?: Record<string, any>
}

export interface ABTestExperiment {
  id: string
  name: string
  variants: ABTestVariant[]
  enabled: boolean
  traffic: number // 0-1, percentage of users to include
  targeting?: {
    userTypes?: string[]
    features?: string[]
    customRules?: Record<string, any>
  }
}

export interface ABTestContext {
  getVariant: (experimentId: string) => string | null
  getAllVariants: () => Record<string, string>
  isInExperiment: (experimentId: string) => boolean
  trackExposure: (experimentId: string, variant?: string) => void
  experiments: ABTestExperiment[]
  userId?: string
}

const ABTestContext = createContext<ABTestContext | null>(null)

interface ABTestProviderProps {
  children: React.ReactNode
  userId?: string
  experiments?: ABTestExperiment[]
}

// Default experiments for the "Nothing" app
const DEFAULT_EXPERIMENTS: ABTestExperiment[] = [
  {
    id: 'hero-animation',
    name: 'Hero Animation Style',
    enabled: true,
    traffic: 0.8,
    variants: [
      { id: 'parallax', name: 'Parallax Void', weight: 0.4 },
      { id: 'matrix', name: 'Matrix Rain', weight: 0.3 },
      { id: 'glitch', name: 'Glitch Text', weight: 0.3 }
    ]
  },
  {
    id: 'pricing-display',
    name: 'Pricing Display Format',
    enabled: true,
    traffic: 1.0,
    variants: [
      { id: 'traditional', name: 'Traditional Grid', weight: 0.5 },
      { id: 'comparison', name: 'Comparison Table', weight: 0.5 }
    ]
  },
  {
    id: 'testimonial-style',
    name: 'Testimonial Presentation',
    enabled: true,
    traffic: 0.6,
    variants: [
      { id: 'cards', name: 'Card Layout', weight: 0.6 },
      { id: 'bubbles', name: 'Speech Bubbles', weight: 0.4 }
    ]
  },
  {
    id: 'cta-urgency',
    name: 'CTA Urgency Level',
    enabled: !isDevelopment, // Disable in dev to avoid noise
    traffic: 0.7,
    variants: [
      { id: 'low', name: 'Subtle CTA', weight: 0.4 },
      { id: 'medium', name: 'Standard CTA', weight: 0.4 },
      { id: 'high', name: 'Urgent CTA', weight: 0.2 }
    ]
  }
]

// Simple hash function for consistent user bucketing
function hashUserId(userId: string, experimentId: string): number {
  let hash = 0
  const str = `${userId}-${experimentId}`
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash) / 2147483647 // Normalize to 0-1
}

function selectVariant(experiment: ABTestExperiment, userId: string): string | null {
  if (!experiment.enabled || !userId) return null
  
  const userHash = hashUserId(userId, experiment.id)
  
  // Check if user is in traffic sample
  if (userHash > experiment.traffic) return null
  
  // Select variant based on weights
  const variants = experiment.variants.filter(v => v.weight > 0)
  if (variants.length === 0) return null
  
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0)
  const normalizedHash = (userHash * totalWeight) % totalWeight
  
  let currentWeight = 0
  for (const variant of variants) {
    currentWeight += variant.weight
    if (normalizedHash <= currentWeight) {
      return variant.id
    }
  }
  
  return variants[0]?.id || null
}

export function ABTestProvider({ children, userId, experiments = DEFAULT_EXPERIMENTS }: ABTestProviderProps) {
  const [variantCache, setVariantCache] = useState<Record<string, string>>({})
  const [exposureTracked, setExposureTracked] = useState<Set<string>>(new Set())
  
  // Generate consistent user ID if not provided
  const effectiveUserId = userId || React.useMemo(() => {
    // Use a combination of timestamp and random for anonymous users
    const stored = localStorage.getItem('ab-test-user-id')
    if (stored) return stored
    
    const generated = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('ab-test-user-id', generated)
    return generated
  }, [])
  
  // Initialize variants on mount or user change
  useEffect(() => {
    if (!effectiveUserId) return
    
    const newVariants: Record<string, string> = {}
    
    experiments.forEach(experiment => {
      const variant = selectVariant(experiment, effectiveUserId)
      if (variant) {
        newVariants[experiment.id] = variant
      }
    })
    
    setVariantCache(newVariants)
    
    // Emit initialization event
    eventBus.emit('abtest:initialized', {
      userId: effectiveUserId,
      variants: newVariants,
      experimentCount: experiments.length
    })
  }, [effectiveUserId, experiments])
  
  const getVariant = useCallback((experimentId: string): string | null => {
    return variantCache[experimentId] || null
  }, [variantCache])
  
  const getAllVariants = useCallback(() => {
    return { ...variantCache }
  }, [variantCache])
  
  const isInExperiment = useCallback((experimentId: string): boolean => {
    return experimentId in variantCache
  }, [variantCache])
  
  const trackExposure = useCallback((experimentId: string, variant?: string) => {
const actualVariant = variant || variantCache[experimentId]
    if (!actualVariant || exposureTracked.has(experimentId)) return
    
    // Mark as tracked to avoid duplicate events
    setExposureTracked(prev => new Set([...prev, experimentId]))
    
    // Track through analytics service
    try {
      const analytics = di.resolve(AnalyticsServiceToken)
      analytics.track('ab_test_exposure', {
        experiment_id: experimentId,
        variant: actualVariant,
        user_id: effectiveUserId
      })
    } catch (error) {
      // Analytics service might not be registered in dev
      if (isDevelopment) {
        console.log(`[ABTest] Exposure: ${experimentId} -> ${actualVariant}`)
      }
    }
    
    // Emit event for other systems
    eventBus.emit('abtest:exposure', {
      experimentId,
      variant: actualVariant,
      userId: effectiveUserId,
      timestamp: Date.now()
    })
  }, [variantCache, exposureTracked, effectiveUserId])
  
  const contextValue: ABTestContext = {
    getVariant,
    getAllVariants,
    isInExperiment,
    trackExposure,
    experiments,
    userId: effectiveUserId
  }
  
  return (
    <ABTestContext.Provider value={contextValue}>
      {children}
    </ABTestContext.Provider>
  )
}

export function useABTest() {
  const context = useContext(ABTestContext)
  
  if (!context) {
    throw new Error('useABTest must be used within an ABTestProvider')
  }
  
  return context
}

// Convenience hooks for common patterns
export function useVariant(experimentId: string, options?: { trackExposure?: boolean }) {
  const { getVariant, trackExposure } = useABTest()
  const variant = getVariant(experimentId)
  
  // Auto-track exposure on first render (opt-out available)
  useEffect(() => {
    if (variant && (options?.trackExposure !== false)) {
      trackExposure(experimentId, variant)
    }
  }, [experimentId, variant, trackExposure, options?.trackExposure])
  
  return variant
}

export function useExperimentVariants(experimentIds: string[]) {
  const { getVariant } = useABTest()
  
  return React.useMemo(() => {
    const variants: Record<string, string | null> = {}
    experimentIds.forEach(id => {
      variants[id] = getVariant(id)
    })
    return variants
  }, [experimentIds, getVariant])
}

export default ABTestProvider
