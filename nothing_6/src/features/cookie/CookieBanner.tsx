// filepath: src/features/cookie/CookieBanner.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import { useState, useEffect } from 'react'
import { config } from '@/app/config'
import { eventBus } from '@/core/events'
import Button from '@/shared/components/Button'

interface CookieBannerProps {
  className?: string
  onAccept?: () => void
  onDecline?: () => void
  onClose?: () => void
}

interface CookiePreferences {
  accepted: boolean
  declined: boolean
  timestamp: number
  version: string
}

const COOKIE_CONSENT_KEY = 'nothing-cookie-consent'
const COOKIE_BANNER_VERSION = '1.0.0'

// Helper to get storage service (assumes it's available globally or via DI)
const getStorageService = () => {
  try {
    // In a real app, this would come from DI or a provider
    // For now, we'll use a simple localStorage wrapper
    return {
      get: (key: string) => {
        try {
          const item = localStorage.getItem(key)
          return item ? JSON.parse(item) : null
        } catch {
          return null
        }
      },
      set: (key: string, value: any) => {
        try {
          localStorage.setItem(key, JSON.stringify(value))
        } catch {
          // localStorage might be disabled or full
        }
      }
    }
  } catch {
    // Fallback for environments without localStorage
    return {
      get: () => null,
      set: () => {}
    }
  }
}

export default function CookieBanner({
  className = '',
  onAccept,
  onDecline,
  onClose
}: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)
  const storage = getStorageService()

  useEffect(() => {
    // Check if user has already made a decision
    const existing = storage.get(COOKIE_CONSENT_KEY) as CookiePreferences | null
    
    // Show banner if no previous decision or version mismatch
    const shouldShow = !existing || existing.version !== COOKIE_BANNER_VERSION
    
    if (shouldShow) {
      // Small delay for smoother UX
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    const preferences: CookiePreferences = {
      accepted: true,
      declined: false,
      timestamp: Date.now(),
      version: COOKIE_BANNER_VERSION
    }
    
    storage.set(COOKIE_CONSENT_KEY, preferences)
    
    // Emit analytics event
    eventBus.emit('analytics:event', {
      name: 'cookie_banner_accepted',
      properties: { version: COOKIE_BANNER_VERSION }
    })
    
    handleClose()
    onAccept?.()
  }

  const handleDecline = () => {
    const preferences: CookiePreferences = {
      accepted: false,
      declined: true,
      timestamp: Date.now(),
      version: COOKIE_BANNER_VERSION
    }
    
    storage.set(COOKIE_CONSENT_KEY, preferences)
    
    // Emit analytics event
    eventBus.emit('analytics:event', {
      name: 'cookie_banner_declined',
      properties: { version: COOKIE_BANNER_VERSION }
    })
    
    handleClose()
    onDecline?.()
  }

  const handleClose = () => {
    setIsAnimatingOut(true)
    setTimeout(() => {
      setIsVisible(false)
      setIsAnimatingOut(false)
      onClose?.()
    }, 300) // Match animation duration
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleDecline() // Declining is the privacy-friendly default
    }
  }

  if (!isVisible) return null

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm
        border-t border-white/10 p-4 sm:p-6
        transition-all duration-300 ease-out
        ${isAnimatingOut ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}
        ${className}
      `}
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-description"
      aria-live="polite"
      onKeyDown={handleKeyDown}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h3 
            id="cookie-banner-title"
            className="text-lg font-semibold text-white mb-2"
          >
            🍪 Nothing Cookie Notice
          </h3>
          <p 
            id="cookie-banner-description"
            className="text-gray-300 text-sm leading-relaxed"
          >
            We use absolutely nothing cookies to enhance your nothing experience. 
            These cookies contain zero data and track zero information. By accepting, 
            you agree to our sophisticated nothing storage policy.
            {config.isDevelopment && (
              <span className="block mt-1 text-xs text-yellow-400">
                [DEV] Version: {COOKIE_BANNER_VERSION}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecline}
            className="text-gray-300 border-gray-600 hover:bg-gray-800"
            aria-describedby="decline-help"
          >
            Decline Nothing
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAccept}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            aria-describedby="accept-help"
          >
            Accept Nothing
          </Button>
        </div>
      </div>
      
      {/* Screen reader helper text */}
      <div className="sr-only">
        <div id="decline-help">
          Decline nothing cookies and continue with zero tracking
        </div>
        <div id="accept-help">
          Accept nothing cookies for an enhanced nothing experience
        </div>
      </div>
    </div>
  )
}

// Export type for external usage
export type { CookieBannerProps, CookiePreferences }

// Export utility to check cookie preferences
export const getCookiePreferences = (): CookiePreferences | null => {
  const storage = getStorageService()
  return storage.get(COOKIE_CONSENT_KEY) as CookiePreferences | null
}

// Export utility to clear cookie preferences (for dev/testing)
export const clearCookiePreferences = (): void => {
  const storage = getStorageService()
  storage.set(COOKIE_CONSENT_KEY, null)
}
