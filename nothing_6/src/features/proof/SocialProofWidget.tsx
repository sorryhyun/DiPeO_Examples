// filepath: src/features/proof/SocialProofWidget.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import { useState, useEffect, useRef } from 'react'
import { config } from '@/app/config'
import { eventBus } from '@/core/events'
import { analytics } from '@/services/analytics'
import Badge from '@/shared/components/Badge'

interface SocialProofWidgetProps {
  className?: string
  variant?: 'subtle' | 'prominent'
  showLiveCounter?: boolean
  showViewers?: boolean
  showRecentActivity?: boolean
}

interface LiveMetric {
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'stable'
  icon?: string
}

export function SocialProofWidget({
  className = '',
  variant = 'subtle',
  showLiveCounter = true,
  showViewers = true,
  showRecentActivity = false
}: SocialProofWidgetProps) {
  const [currentViewers, setCurrentViewers] = useState<number>(0)
  const [recentActivity, setRecentActivity] = useState<string[]>([])
  const [metrics, setMetrics] = useState<LiveMetric[]>([])
  const intervalRef = useRef<NodeJS.Timeout>()
  const activityRef = useRef<NodeJS.Timeout>()

  // Generate realistic but meaningless social proof numbers
  useEffect(() => {
    const generateMetrics = (): LiveMetric[] => [
      {
        label: 'Currently viewing nothing',
        value: '∞',
        trend: 'stable',
        icon: '👁️'
      },
      {
        label: 'Nothing delivered today',
        value: Math.floor(Math.random() * 50000 + 10000).toLocaleString(),
        trend: 'up',
        icon: '📦'
      },
      {
        label: 'Satisfied with nothing',
        value: '100%',
        trend: 'stable',
        icon: '⭐'
      },
      {
        label: 'Nothing uptime',
        value: '99.99%',
        trend: 'up',
        icon: '✅'
      }
    ]

    const updateViewers = () => {
      // Simulate fluctuating viewer count between 1337 and 9999
      const base = 1337
      const variance = Math.sin(Date.now() / 10000) * 500 + Math.random() * 3000
      setCurrentViewers(Math.floor(base + variance))
    }

    const updateActivity = () => {
      const activities = [
        'Someone just purchased Premium Nothing',
        'New user signed up for Nothing Newsletter',
        'Enterprise client upgraded to Ultimate Nothing',
        'Someone rated Nothing 5 stars',
        'Nothing API call succeeded with 200 OK',
        'User completed Nothing Tutorial',
        'Someone shared Nothing on social media',
        'New testimonial: "Best nothing ever!"'
      ]
      
      const newActivity = activities[Math.floor(Math.random() * activities.length)]
      setRecentActivity(prev => [newActivity, ...prev.slice(0, 4)])
    }

    // Initialize
    setMetrics(generateMetrics())
    updateViewers()
    if (showRecentActivity) updateActivity()

    // Set up intervals
    if (showLiveCounter) {
      intervalRef.current = setInterval(updateViewers, 3000 + Math.random() * 2000)
    }
    
    if (showRecentActivity) {
      activityRef.current = setInterval(updateActivity, 8000 + Math.random() * 5000)
    }

    // Track widget view
    analytics.track('social_proof_widget_viewed', { 
      variant,
      features: { showLiveCounter, showViewers, showRecentActivity }
    })

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (activityRef.current) clearInterval(activityRef.current)
    }
  }, [variant, showLiveCounter, showRecentActivity])

  // Handle metric click for analytics
  const handleMetricClick = (metric: LiveMetric) => {
    analytics.track('social_proof_metric_clicked', { 
      label: metric.label,
      value: metric.value 
    })
    
    eventBus.emit('analytics:event', {
      name: 'social_proof_interaction',
      properties: { metric: metric.label }
    })
  }

  const baseStyles = variant === 'subtle' 
    ? 'bg-white/5 backdrop-blur-sm border border-white/10'
    : 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-300/20'

  return (
    <div 
      className={`${baseStyles} rounded-lg p-4 space-y-3 ${className}`}
      role="complementary"
      aria-label="Social proof metrics"
    >
      {/* Live viewer count */}
      {showViewers && (
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-gray-400">Live:</span>
          </div>
          <span className="font-mono text-white font-medium">
            {currentViewers.toLocaleString()}
          </span>
          <span className="text-gray-300 text-xs">
            users currently viewing nothing
          </span>
        </div>
      )}

      {/* Key metrics */}
      {showLiveCounter && (
        <div className="grid grid-cols-2 gap-2">
          {metrics.slice(0, 4).map((metric, index) => (
            <button
              key={metric.label}
              onClick={() => handleMetricClick(metric)}
              className="text-left p-2 rounded hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400/50"
              tabIndex={0}
              aria-label={`${metric.label}: ${metric.value}`}
            >
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs opacity-75">{metric.icon}</span>
                <span className="text-xs text-gray-400 truncate">
                  {metric.label}
                </span>
                {metric.trend && (
                  <span className={`text-xs ${
                    metric.trend === 'up' ? 'text-green-400' : 
                    metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                  </span>
                )}
              </div>
              <div className="font-mono font-medium text-white text-sm">
                {metric.value}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Recent activity feed */}
      {showRecentActivity && recentActivity.length > 0 && (
        <div className="border-t border-white/10 pt-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              Recent Activity
            </span>
          </div>
          <div className="space-y-1 max-h-20 overflow-hidden">
            {recentActivity.slice(0, 3).map((activity, index) => (
              <div 
                key={`${activity}-${index}`}
                className="text-xs text-gray-300 animate-fadeIn flex items-center gap-2"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  opacity: 1 - (index * 0.3)
                }}
              >
                <div className="w-1 h-1 bg-purple-400 rounded-full flex-shrink-0" />
                <span className="truncate">{activity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trust badges */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex gap-2">
          <Badge variant="outline" size="sm" className="text-xs">
            🔒 Secure
          </Badge>
          <Badge variant="outline" size="sm" className="text-xs">
            ✓ Verified
          </Badge>
        </div>
        
        {config.isDevelopment && (
          <div className="text-xs text-gray-500 opacity-50">
            Mock Data
          </div>
        )}
      </div>
    </div>
  )
}

export default SocialProofWidget
