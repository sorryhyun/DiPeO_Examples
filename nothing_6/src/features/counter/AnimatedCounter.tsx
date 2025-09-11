// filepath: src/features/counter/AnimatedCounter.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React, { useState, useEffect, useCallback } from 'react'
import { motion, useAnimation, AnimatePresence } from 'framer-motion'
import { config } from '@/app/config'
import { eventBus } from '@/core/events'
import { fadeInUp, glitchAnimation, countUpSpring } from '@/utils/framerMotionPresets'
import { clamp, randomInRange } from '@/utils/math'

interface AnimatedCounterProps {
  /** Target value to count to (default: 0) */
  targetValue?: number
  /** Duration of the counting animation in seconds */
  duration?: number
  /** Custom label to display after the number */
  label?: string
  /** Additional CSS classes */
  className?: string
  /** Whether to show the glitch effect */
  enableGlitch?: boolean
  /** Callback when counting animation completes */
  onComplete?: (value: number) => void
  /** Whether to start the animation immediately */
  autoStart?: boolean
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  targetValue = 0,
  duration = 2.5,
  label = "features delivered",
  className = "",
  enableGlitch = true,
  onComplete,
  autoStart = true
}) => {
  const [currentValue, setCurrentValue] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [hasCompleted, setHasCompleted] = useState(false)
  const [glitchActive, setGlitchActive] = useState(false)
  
  const controls = useAnimation()
  const glitchControls = useAnimation()

  // Counter animation logic
  const animateCounter = useCallback(async () => {
    if (isAnimating || hasCompleted) return
    
    setIsAnimating(true)
    
    try {
      // Start with a fake higher number to create backwards progress effect
      const fakeStartValue = targetValue + randomInRange(50, 200)
      setCurrentValue(fakeStartValue)
      
      // Emit analytics event
      eventBus.emit('counter:animation-start', { 
        targetValue, 
        startValue: fakeStartValue,
        duration 
      })
      
      // Animate the counter going backwards to target
      const startTime = Date.now()
      const animationInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000
        const progress = clamp(elapsed / duration, 0, 1)
        
        // Use easing for smooth deceleration
        const easedProgress = 1 - Math.pow(1 - progress, 3) // Cubic ease-out
        const interpolatedValue = Math.round(
          fakeStartValue - (fakeStartValue - targetValue) * easedProgress
        )
        
        setCurrentValue(interpolatedValue)
        
        if (progress >= 1) {
          clearInterval(animationInterval)
          setCurrentValue(targetValue)
          setIsAnimating(false)
          setHasCompleted(true)
          
          // Trigger glitch effect at the end
          if (enableGlitch) {
            setGlitchActive(true)
            glitchControls.start('animate').then(() => {
              setTimeout(() => setGlitchActive(false), 500)
            })
          }
          
          onComplete?.(targetValue)
          eventBus.emit('counter:animation-complete', { finalValue: targetValue })
        }
      }, 16) // ~60fps
      
    } catch (error) {
      console.error('AnimatedCounter: Animation error:', error)
      setCurrentValue(targetValue)
      setIsAnimating(false)
      eventBus.emit('counter:animation-error', { error })
    }
  }, [targetValue, duration, isAnimating, hasCompleted, enableGlitch, onComplete, glitchControls])

  // Reset counter
  const resetCounter = useCallback(() => {
    setCurrentValue(0)
    setIsAnimating(false)
    setHasCompleted(false)
    setGlitchActive(false)
    controls.set('initial')
    eventBus.emit('counter:reset')
  }, [controls])

  // Start animation on mount or when autoStart changes
  useEffect(() => {
    if (autoStart && !hasCompleted) {
      const timer = setTimeout(animateCounter, 500) // Small delay for visual impact
      return () => clearTimeout(timer)
    }
  }, [autoStart, animateCounter, hasCompleted])

  // Keyboard interaction for accessibility
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (hasCompleted) {
        resetCounter()
      } else if (!isAnimating) {
        animateCounter()
      }
    }
  }, [hasCompleted, isAnimating, resetCounter, animateCounter])

  // Format the number for display
  const formatValue = (value: number): string => {
    return value.toLocaleString()
  }

  // Development helper
  useEffect(() => {
    if (config.isDevelopment) {
      const unsubscribe = eventBus.on('counter:debug-trigger', () => {
        if (!isAnimating) animateCounter()
      })
      return unsubscribe
    }
  }, [animateCounter, isAnimating])

  return (
    <motion.div
      className={`relative inline-flex flex-col items-center justify-center ${className}`}
      initial="initial"
      animate="animate"
      variants={fadeInUp}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={hasCompleted ? resetCounter : (!isAnimating ? animateCounter : undefined)}
      aria-label={`Animated counter showing ${formatValue(currentValue)} ${label}. ${
        hasCompleted ? 'Press to restart animation' : isAnimating ? 'Animation in progress' : 'Press to start animation'
      }`}
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Main counter display */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`counter-${currentValue}`}
            className="relative"
            variants={glitchActive ? glitchAnimation : countUpSpring}
            initial="initial"
            animate={glitchActive ? glitchControls : "animate"}
            exit="exit"
          >
            <span 
              className="text-6xl md:text-8xl lg:text-9xl font-bold bg-gradient-to-r from-violet-400 via-pink-400 to-red-400 bg-clip-text text-transparent font-mono tracking-tighter leading-none"
              style={{
                textShadow: glitchActive ? '0 0 10px rgba(168, 85, 247, 0.5)' : 'none'
              }}
            >
              {formatValue(currentValue)}
            </span>
            
            {/* Glitch overlay effects */}
            {glitchActive && (
              <>
                <span 
                  className="absolute inset-0 text-6xl md:text-8xl lg:text-9xl font-bold text-red-500 font-mono tracking-tighter leading-none opacity-70"
                  style={{
                    transform: 'translate(-2px, 0)',
                    clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)'
                  }}
                >
                  {formatValue(currentValue)}
                </span>
                <span 
                  className="absolute inset-0 text-6xl md:text-8xl lg:text-9xl font-bold text-cyan-500 font-mono tracking-tighter leading-none opacity-70"
                  style={{
                    transform: 'translate(2px, 0)',
                    clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)'
                  }}
                >
                  {formatValue(currentValue)}
                </span>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Label */}
      <motion.div
        className="mt-4 text-lg md:text-xl text-gray-400 font-medium text-center tracking-wide"
        variants={fadeInUp}
        transition={{ delay: 0.3 }}
      >
        {label}
      </motion.div>

      {/* Progress indicator */}
      {isAnimating && (
        <motion.div
          className="mt-6 w-48 h-1 bg-gray-800 rounded-full overflow-hidden"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ 
              duration: duration, 
              ease: 'linear'
            }}
          />
        </motion.div>
      )}

      {/* Completion indicator */}
      {hasCompleted && !isAnimating && (
        <motion.div
          className="mt-4 px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full border border-green-500/30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Mission Accomplished
        </motion.div>
      )}

      {/* Interactive hint */}
      {!isAnimating && (
        <motion.div
          className="absolute -bottom-8 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          {hasCompleted ? 'Click to restart' : 'Click to animate'}
        </motion.div>
      )}

      {/* Debug info in development */}
      {config.isDevelopment && (
        <div className="absolute top-0 right-0 text-xs text-gray-600 bg-black/50 px-2 py-1 rounded">
          {isAnimating ? 'Animating' : hasCompleted ? 'Complete' : 'Ready'}
        </div>
      )}
    </motion.div>
  )
}

export default AnimatedCounter

// Additional hook for external control
export const useAnimatedCounter = (initialTarget: number = 0) => {
  const [target, setTarget] = useState(initialTarget)
  const [isPlaying, setIsPlaying] = useState(false)

  const start = useCallback(() => setIsPlaying(true), [])
  const reset = useCallback(() => {
    setIsPlaying(false)
    eventBus.emit('counter:external-reset')
  }, [])

  const setTargetValue = useCallback((newTarget: number) => {
    setTarget(newTarget)
  }, [])

  return {
    target,
    isPlaying,
    start,
    reset,
    setTargetValue
  }
}
