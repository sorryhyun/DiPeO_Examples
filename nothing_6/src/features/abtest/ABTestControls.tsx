// filepath: src/features/abtest/ABTestControls.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React, { useContext, useState } from 'react'
import { config, isDevelopment } from '@/app/config'
import { eventBus } from '@/core/events'
import Button from '@/shared/components/Button'
import Badge from '@/shared/components/Badge'
import GlassCard from '@/shared/components/GlassCard'

// Mock ABTestProvider context for this implementation
interface ABTestContext {
  experiments: Record<string, { variant: string; active: boolean }>
  getVariant: (experimentId: string) => string
  setVariant: (experimentId: string, variant: string) => void
  isExperimentActive: (experimentId: string) => boolean
  toggleExperiment: (experimentId: string) => void
}

// Create mock context - in real implementation this would be imported from ABTestProvider
const ABTestContext = React.createContext<ABTestContext | null>(null)

// Mock analytics service interface
interface AnalyticsService {
  track: (event: string, properties?: Record<string, unknown>) => void
}

// Mock analytics service - in real implementation this would be imported
const analytics: AnalyticsService = {
  track: (event: string, properties?: Record<string, unknown>) => {
    eventBus.emit('analytics:event', { name: event, properties })
  }
}

interface ExperimentConfig {
  id: string
  name: string
  description: string
  variants: string[]
  defaultVariant: string
}

const NOTHING_EXPERIMENTS: ExperimentConfig[] = [
  {
    id: 'hero-void-style',
    name: 'Hero Void Animation',
    description: 'Test different void animations in the hero section',
    variants: ['parallax', 'particles', 'matrix', 'glitch'],
    defaultVariant: 'parallax'
  },
  {
    id: 'pricing-nothing-levels',
    name: 'Nothing Pricing Tiers',
    description: 'Test different levels of nothing pricing',
    variants: ['basic', 'premium', 'enterprise', 'ultimate'],
    defaultVariant: 'basic'
  },
  {
    id: 'testimonial-emptiness',
    name: 'Testimonial Emptiness',
    description: 'Test different ways to display nothing testimonials',
    variants: ['bubbles', 'cards', 'list', 'carousel'],
    defaultVariant: 'bubbles'
  },
  {
    id: 'counter-zero-animation',
    name: 'Zero Counter Animation',
    description: 'Test different ways to animate counting to zero',
    variants: ['typewriter', 'fade', 'bounce', 'slide'],
    defaultVariant: 'typewriter'
  },
  {
    id: 'void-simulator-interaction',
    name: 'Void Simulator Interaction',
    description: 'Test different interaction modes for void simulation',
    variants: ['click', 'hover', 'scroll', 'gesture'],
    defaultVariant: 'click'
  }
]

interface ExperimentControlProps {
  experiment: ExperimentConfig
  currentVariant: string
  isActive: boolean
  onVariantChange: (variant: string) => void
  onToggleExperiment: () => void
}

const ExperimentControl: React.FC<ExperimentControlProps> = ({
  experiment,
  currentVariant,
  isActive,
  onVariantChange,
  onToggleExperiment
}) => {
  return (
    <GlassCard className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-white/90">
            {experiment.name}
          </h3>
          <p className="text-xs text-white/60 mt-1">
            {experiment.description}
          </p>
        </div>
        <Badge variant={isActive ? 'success' : 'secondary'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <Button
          size="sm"
          variant={isActive ? 'secondary' : 'primary'}
          onClick={onToggleExperiment}
          aria-label={`${isActive ? 'Disable' : 'Enable'} ${experiment.name} experiment`}
        >
          {isActive ? 'Disable' : 'Enable'}
        </Button>

        <div className="flex gap-1">
          {experiment.variants.map((variant) => (
            <Button
              key={variant}
              size="xs"
              variant={currentVariant === variant ? 'primary' : 'ghost'}
              onClick={() => onVariantChange(variant)}
              disabled={!isActive}
              aria-label={`Set ${experiment.name} to ${variant} variant`}
              className="capitalize"
            >
              {variant}
            </Button>
          ))}
        </div>
      </div>
    </GlassCard>
  )
}

const ABTestControls: React.FC = () => {
  const abTestContext = useContext(ABTestContext)
  const [isExpanded, setIsExpanded] = useState(false)

  // Don't render in production unless explicitly enabled
  if (!isDevelopment && !config.featureToggles['abtest-controls-panel']) {
    return null
  }

  // Mock data when provider is not available (for development)
  const mockExperiments = NOTHING_EXPERIMENTS.reduce((acc, exp) => ({
    ...acc,
    [exp.id]: { variant: exp.defaultVariant, active: false }
  }), {} as Record<string, { variant: string; active: boolean }>)

  const experiments = abTestContext?.experiments || mockExperiments
  const getVariant = abTestContext?.getVariant || ((id: string) => mockExperiments[id]?.variant || 'default')
  const setVariant = abTestContext?.setVariant || (() => {})
  const isExperimentActive = abTestContext?.isExperimentActive || (() => false)
  const toggleExperiment = abTestContext?.toggleExperiment || (() => {})

  const handleVariantChange = (experimentId: string, variant: string) => {
    setVariant(experimentId, variant)
    
    analytics.track('abtest_variant_changed', {
      experiment_id: experimentId,
      variant,
      source: 'dev_controls'
    })

    eventBus.emit('abtest:variant-changed', {
      experimentId,
      variant,
      timestamp: Date.now()
    })
  }

  const handleToggleExperiment = (experimentId: string) => {
    toggleExperiment(experimentId)
    
    const isActive = isExperimentActive(experimentId)
    analytics.track('abtest_experiment_toggled', {
      experiment_id: experimentId,
      active: !isActive,
      source: 'dev_controls'
    })
  }

  const activeCount = NOTHING_EXPERIMENTS.filter(exp => 
    isExperimentActive(exp.id)
  ).length

  return (
    <div 
      className="fixed bottom-4 right-4 z-50"
      role="region"
      aria-label="A/B Testing Controls"
    >
      {!isExpanded ? (
        <Button
          onClick={() => setIsExpanded(true)}
          className="shadow-lg"
          aria-label={`Open A/B test controls (${activeCount} active experiments)`}
        >
          A/B Tests ({activeCount})
        </Button>
      ) : (
        <div className="w-80 max-h-96 overflow-y-auto">
          <GlassCard className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white/90">
                A/B Test Controls
              </h2>
              <div className="flex items-center gap-2">
                <Badge variant="info" size="sm">
                  {activeCount}/{NOTHING_EXPERIMENTS.length} Active
                </Badge>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => setIsExpanded(false)}
                  aria-label="Close A/B test controls"
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {NOTHING_EXPERIMENTS.map((experiment) => (
                <ExperimentControl
                  key={experiment.id}
                  experiment={experiment}
                  currentVariant={getVariant(experiment.id)}
                  isActive={isExperimentActive(experiment.id)}
                  onVariantChange={(variant) => handleVariantChange(experiment.id, variant)}
                  onToggleExperiment={() => handleToggleExperiment(experiment.id)}
                />
              ))}
            </div>

            <div className="pt-2 border-t border-white/10">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  // Reset all experiments
                  NOTHING_EXPERIMENTS.forEach(exp => {
                    if (isExperimentActive(exp.id)) {
                      toggleExperiment(exp.id)
                    }
                  })
                  analytics.track('abtest_all_experiments_reset', {
                    source: 'dev_controls'
                  })
                }}
                className="w-full"
              >
                Reset All Experiments
              </Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}

export default ABTestControls
