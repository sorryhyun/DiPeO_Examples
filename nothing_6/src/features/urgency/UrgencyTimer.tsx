// filepath: src/features/urgency/UrgencyTimer.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import { useState, useEffect, useCallback } from 'react'
import { config } from '@/app/config'
import { eventBus } from '@/core/events'
import { useDebouncedState } from '@/hooks/useDebouncedState'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'

export interface UrgencyTimerProps {
  initialSeconds?: number
  onTimeUp?: () => void
  className?: string
  showProgressBar?: boolean
  title?: string
  message?: string
  variant?: 'default' | 'intense' | 'subtle'
}

export default function UrgencyTimer({
  initialSeconds = 300, // 5 minutes default
  onTimeUp,
  className = '',
  showProgressBar = true,
  title = 'Limited Time Offer!',
  message = 'This incredible deal expires in:',
  variant = 'default'
}: UrgencyTimerProps) {
  const [timeLeft, setTimeLeft] = useDebouncedState(initialSeconds, 100)
  const [isActive, setIsActive] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [hasExpired, setHasExpired] = useState(false)

  // Calculate progress (backwards - starts at 100% and goes to 0%)
  const progress = (timeLeft / initialSeconds) * 100

  // Format time display
  const formatTime = useCallback((seconds: number) => {
    if (seconds <= 0) return '00:00:00'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Timer logic
  useEffect(() => {
    if (!isActive || timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setHasExpired(true)
          setIsActive(false)
          eventBus.emit('analytics:event', { 
            name: 'urgency_timer_expired', 
            properties: { initialSeconds, variant } 
          })
          onTimeUp?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, timeLeft, initialSeconds, variant, onTimeUp, setTimeLeft])

  // Reset timer function
  const resetTimer = useCallback(() => {
    setIsLoading(true)
    setTimeout(() => {
      setTimeLeft(initialSeconds)
      setHasExpired(false)
      setIsActive(true)
      setIsLoading(false)
      eventBus.emit('analytics:event', { 
        name: 'urgency_timer_reset', 
        properties: { initialSeconds, variant } 
      })
    }, 500) // Fake loading delay for effect
  }, [initialSeconds, variant, setTimeLeft])

  // Pause/resume timer
  const toggleTimer = useCallback(() => {
    setIsActive(prev => {
      const newState = !prev
      eventBus.emit('analytics:event', { 
        name: 'urgency_timer_toggled', 
        properties: { paused: !newState, timeLeft, variant } 
      })
      return newState
    })
  }, [timeLeft, variant])

  // Style variants
  const getVariantStyles = () => {
    switch (variant) {
      case 'intense':
        return {
          container: 'bg-red-900/20 border-red-500/50 text-red-100',
          timer: 'text-red-400 font-black text-6xl',
          progress: 'from-red-600 to-red-800',
          pulse: timeLeft <= 30 ? 'animate-pulse' : ''
        }
      case 'subtle':
        return {
          container: 'bg-gray-900/10 border-gray-500/30 text-gray-700',
          timer: 'text-gray-600 font-medium text-3xl',
          progress: 'from-gray-400 to-gray-600',
          pulse: ''
        }
      default:
        return {
          container: 'bg-orange-900/20 border-orange-500/50 text-orange-100',
          timer: 'text-orange-400 font-bold text-4xl',
          progress: 'from-orange-500 to-orange-700',
          pulse: timeLeft <= 60 ? 'animate-pulse' : ''
        }
    }
  }

  const styles = getVariantStyles()

  if (config.shouldUseMockData && config.dev.enable_mock_data) {
    // In dev mode, show a mock version with faster countdown for testing
    return (
      <div className={`urgency-timer-dev p-4 border-2 border-dashed border-blue-500 ${className}`}>
        <div className="text-blue-400 text-sm mb-2">🔧 DEV MODE: UrgencyTimer</div>
        <div className="text-lg font-semibold">Mock Timer: {formatTime(timeLeft)}</div>
        <div className="text-sm text-gray-500 mt-2">
          Progress: {progress.toFixed(1)}% • Active: {isActive ? 'Yes' : 'No'}
        </div>
        <button 
          onClick={toggleTimer}
          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm"
        >
          {isActive ? 'Pause' : 'Resume'}
        </button>
      </div>
    )
  }

  return (
    <div 
      className={`urgency-timer relative overflow-hidden rounded-lg border-2 p-6 ${styles.container} ${styles.pulse} ${className}`}
      role="timer"
      aria-live="polite"
      aria-label={`${title} Timer showing ${formatTime(timeLeft)} remaining`}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <LoadingSpinner size="md" />
        </div>
      )}

      <div className="text-center space-y-4">
        {/* Title */}
        <h3 className="text-xl font-semibold opacity-90">
          {hasExpired ? 'Time\'s Up!' : title}
        </h3>

{/* Message */}
        <p className="text-sm opacity-75">
          {hasExpired ? 'This amazing offer has expired... or has it?' : message}
        </p>

        {/* Timer Display */}
        <div className={`font-mono ${styles.timer} tracking-wider`}>
          {hasExpired ? '00:00:00' : formatTime(timeLeft)}
        </div>

        {/* Progress Bar (Backwards) */}
        {showProgressBar && (
          <div className="relative">
            <div className="w-full h-2 bg-gray-800/50 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${styles.progress} transition-all duration-1000 ease-linear ${hasExpired ? 'opacity-30' : ''}`}
                style={{ width: `${Math.max(0, progress)}%` }}
                aria-hidden="true"
              />
            </div>
            <div className="text-xs opacity-60 mt-1">
              {hasExpired ? 'Expired' : `${progress.toFixed(1)}% remaining`}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-3 mt-4">
          {!hasExpired && (
            <button
              onClick={toggleTimer}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label={isActive ? 'Pause timer' : 'Resume timer'}
            >
              {isActive ? 'Pause' : 'Resume'}
            </button>
          )}
          
          {hasExpired && (
            <button
              onClick={resetTimer}
              disabled={isLoading}
              className="px-6 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Reset timer"
            >
              {isLoading ? 'Resetting...' : 'Reset Timer'}
            </button>
          )}
        </div>

        {/* Expired State Message */}
        {hasExpired && (
          <div className="mt-4 p-3 bg-black/20 rounded-md">
            <p className="text-sm opacity-80">
              Don't worry! Nothing is forever, including this timer. 
              Maybe the real urgency was the friends we made along the way? 🤔
            </p>
          </div>
        )}
      </div>

      {/* Accessibility: Screen reader announcements */}
      <div className="sr-only" aria-live="assertive">
        {hasExpired ? 'Timer has expired' : ''}
        {timeLeft <= 30 && timeLeft > 0 && !hasExpired ? `Warning: Only ${timeLeft} seconds remaining` : ''}
      </div>
    </div>
  )
}
