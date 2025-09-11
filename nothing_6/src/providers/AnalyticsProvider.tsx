// filepath: src/providers/AnalyticsProvider.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [ ] Adds basic ARIA and keyboard handlers (where relevant - N/A for provider)

import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react'
import { config, isDevelopment } from '@/app/config'
import { eventBus } from '@/core/events'
import { analytics } from '@/services/analytics'
import type { User } from '@/core/contracts'

// Analytics context interface
export interface AnalyticsContextValue {
  track: (event: string, properties?: Record<string, unknown>) => void
  identify: (userId: string, traits?: Record<string, unknown>) => void
  page: (name?: string, properties?: Record<string, unknown>) => void
  isInitialized: boolean
  userId?: string
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null)

export interface AnalyticsProviderProps {
  children: ReactNode
  userId?: string
  disabled?: boolean
}

export function AnalyticsProvider({ 
  children, 
  userId, 
  disabled = false 
}: AnalyticsProviderProps) {
  const isInitializedRef = useRef(false)
  const currentUserIdRef = useRef<string | undefined>(userId)
  
  // Initialize analytics on mount
  useEffect(() => {
    if (disabled || isInitializedRef.current) return

    const initializeAnalytics = async () => {
      try {
        await analytics.initialize()
        isInitializedRef.current = true
        
        // Track initial page view
        analytics.page(window.location.pathname, {
          referrer: document.referrer,
          timestamp: Date.now(),
          environment: config.mode,
          version: config.version
        })

        eventBus.emit('analytics:initialized', { 
          timestamp: Date.now(),
          environment: config.mode 
        })

        if (isDevelopment) {
          console.log('[AnalyticsProvider] Initialized analytics service')
        }
      } catch (error) {
        console.error('[AnalyticsProvider] Failed to initialize:', error)
        eventBus.emit('analytics:error', { error, context: 'initialization' })
      }
    }

    initializeAnalytics()
  }, [disabled])

  // Handle user identification changes
  useEffect(() => {
    if (!userId || disabled || !isInitializedRef.current) return
    if (currentUserIdRef.current === userId) return

    try {
      analytics.identify(userId, {
        timestamp: Date.now(),
        environment: config.mode
      })
      
      currentUserIdRef.current = userId
      
      eventBus.emit('analytics:user_identified', { 
        userId, 
        timestamp: Date.now() 
      })

      if (isDevelopment) {
        console.log('[AnalyticsProvider] Identified user:', userId)
      }
    } catch (error) {
      console.error('[AnalyticsProvider] Failed to identify user:', error)
      eventBus.emit('analytics:error', { error, context: 'identification', userId })
    }
  }, [userId, disabled])

  // Listen to global events for automatic tracking
  useEffect(() => {
    if (disabled) return

    const handleRouteChange = (data: { path: string; title?: string }) => {
      if (isInitializedRef.current) {
        analytics.page(data.path, {
          title: data.title || document.title,
          timestamp: Date.now()
        })
      }
    }

    const handleUserLogin = (data: { user: User }) => {
      if (isInitializedRef.current && data.user.id) {
        analytics.identify(data.user.id, {
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          timestamp: Date.now()
        })
        currentUserIdRef.current = data.user.id
      }
    }

    const handleUserLogout = () => {
      if (isInitializedRef.current) {
        analytics.track('user_logout', { timestamp: Date.now() })
        currentUserIdRef.current = undefined
      }
    }

    const handleError = (data: { error: Error; context?: string }) => {
      if (isInitializedRef.current) {
        analytics.track('error_occurred', {
          error: data.error.message,
          stack: data.error.stack,
          context: data.context,
          timestamp: Date.now()
        })
      }
    }

    eventBus.on('route:changed', handleRouteChange)
    eventBus.on('auth:login_success', handleUserLogin)
    eventBus.on('auth:logout', handleUserLogout)
    eventBus.on('error:boundary', handleError)

    return () => {
      eventBus.off('route:changed', handleRouteChange)
      eventBus.off('auth:login_success', handleUserLogin)
      eventBus.off('auth:logout', handleUserLogout)
      eventBus.off('error:boundary', handleError)
    }
  }, [disabled])

  // Context value with safety checks
  const contextValue: AnalyticsContextValue = {
    track: (event: string, properties?: Record<string, unknown>) => {
      if (disabled || !isInitializedRef.current) return

      try {
        analytics.track(event, {
          ...properties,
          timestamp: Date.now(),
          userId: currentUserIdRef.current
        })

        eventBus.emit('analytics:event_tracked', { 
          event, 
          properties, 
          timestamp: Date.now() 
        })
      } catch (error) {
        console.error('[AnalyticsProvider] Failed to track event:', error)
        eventBus.emit('analytics:error', { error, context: 'tracking', event })
      }
    },

    identify: (userId: string, traits?: Record<string, unknown>) => {
      if (disabled || !isInitializedRef.current) return

      try {
        analytics.identify(userId, {
          ...traits,
          timestamp: Date.now()
        })
        
        currentUserIdRef.current = userId
        
        eventBus.emit('analytics:user_identified', { 
          userId, 
          traits, 
          timestamp: Date.now() 
        })
      } catch (error) {
        console.error('[AnalyticsProvider] Failed to identify:', error)
        eventBus.emit('analytics:error', { error, context: 'identification', userId })
      }
    },

    page: (name?: string, properties?: Record<string, unknown>) => {
      if (disabled || !isInitializedRef.current) return

      try {
        analytics.page(name, {
          ...properties,
          timestamp: Date.now(),
          userId: currentUserIdRef.current
        })

        eventBus.emit('analytics:page_tracked', { 
          name, 
          properties, 
          timestamp: Date.now() 
        })
      } catch (error) {
        console.error('[AnalyticsProvider] Failed to track page:', error)
        eventBus.emit('analytics:error', { error, context: 'page_tracking', name })
      }
    },

    isInitialized: isInitializedRef.current,
    userId: currentUserIdRef.current
  }

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  )
}

// Hook for consuming analytics context
export function useAnalytics(): AnalyticsContextValue {
  const context = useContext(AnalyticsContext)
  
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }

  return context
}

// Convenience hooks for common analytics patterns
export function useTrackEvent() {
  const { track } = useAnalytics()
  return track
}

export function useTrackPageView() {
  const { page } = useAnalytics()
  
  useEffect(() => {
    page(window.location.pathname)
  }, [page])
}

export function useTrackUserAction(
  action: string, 
  element?: string, 
  additionalProps?: Record<string, unknown>
) {
  const { track } = useAnalytics()
  
  return (extraProps?: Record<string, unknown>) => {
    track(action, {
      element,
      ...additionalProps,
      ...extraProps,
      timestamp: Date.now()
    })
  }
}

// Named export as default
export default AnalyticsProvider
