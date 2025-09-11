// filepath: src/features/hero/GlitchText.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { motionPresets, durations, easings } from '@/theme/animations'
import { fadeInUp, glitchEffect, typewriter } from '@/utils/framerMotionPresets'
import { config } from '@/app/config'

interface GlitchTextProps {
  text: string
  className?: string
  glitchOnHover?: boolean
  typewriterEffect?: boolean
  speed?: number
  delay?: number
  onComplete?: () => void
  'aria-label'?: string
}

const glitchCharacters = '!@#$%^&*()_+-=[]{}|;:,.<>?'
const glitchIntensity = config.animations?.glitchIntensity ?? 0.1

export default function GlitchText({
  text,
  className = '',
  glitchOnHover = true,
  typewriterEffect = false,
  speed = 50,
  delay = 0,
  onComplete,
  'aria-label': ariaLabel,
}: GlitchTextProps) {
  const [displayText, setDisplayText] = useState(typewriterEffect ? '' : text)
  const [isGlitching, setIsGlitching] = useState(false)
  const [isTyping, setIsTyping] = useState(typewriterEffect)
  const [isHovered, setIsHovered] = useState(false)
  const animationRef = useRef<number>()
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Typewriter effect implementation
  useEffect(() => {
    if (!typewriterEffect) return

    const startTyping = () => {
      let currentIndex = 0
      
      const typeNextCharacter = () => {
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1))
          currentIndex++
          timeoutRef.current = setTimeout(typeNextCharacter, speed)
        } else {
          setIsTyping(false)
          onComplete?.()
        }
      }

      timeoutRef.current = setTimeout(typeNextCharacter, delay)
    }

    startTyping()

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [text, speed, delay, typewriterEffect, onComplete])

  // Glitch effect implementation
  const triggerGlitch = useCallback(() => {
    if (isGlitching) return

    setIsGlitching(true)
    const originalText = displayText
    let glitchCount = 0
    const maxGlitches = Math.floor(originalText.length * glitchIntensity) + 1

    const performGlitch = () => {
      if (glitchCount >= maxGlitches) {
        setDisplayText(originalText)
        setIsGlitching(false)
        return
      }

      // Create glitched version of text
      const glitchedText = originalText
        .split('')
        .map((char, index) => {
          if (Math.random() < glitchIntensity && char !== ' ') {
            return glitchCharacters[Math.floor(Math.random() * glitchCharacters.length)]
          }
          return char
        })
        .join('')

      setDisplayText(glitchedText)
      glitchCount++

      animationRef.current = requestAnimationFrame(() => {
        timeoutRef.current = setTimeout(performGlitch, 50)
      })
    }

    performGlitch()
  }, [displayText, isGlitching])

  // Hover handlers
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    if (glitchOnHover && !isTyping) {
      triggerGlitch()
    }
  }, [glitchOnHover, isTyping, triggerGlitch])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  // Keyboard handler for accessibility
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (glitchOnHover && !isTyping) {
        triggerGlitch()
      }
    }
  }, [glitchOnHover, isTyping, triggerGlitch])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Motion variants for the glitch animation
  const glitchVariants = {
    normal: {
      x: 0,
      textShadow: '0 0 0 transparent',
      transition: {
        duration: durations.fast / 1000,
        ease: easings.easeOut,
      },
    },
    glitch: {
      x: [-2, 2, -1, 1, 0],
      textShadow: [
        '2px 0 #ff0000, -2px 0 #00ff00',
        '-2px 0 #ff0000, 2px 0 #00ff00',
        '1px 0 #ff0000, -1px 0 #00ff00',
        '-1px 0 #ff0000, 1px 0 #00ff00',
        '0 0 0 transparent',
      ],
      transition: {
        duration: durations.normal / 1000,
        times: [0, 0.25, 0.5, 0.75, 1],
        ease: 'linear',
      },
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: durations.fast / 1000,
        ease: easings.easeOut,
      },
    },
  }

  // Container variants for typewriter effect
  const containerVariants = {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: {
        duration: durations.normal / 1000,
        ease: easings.easeOut,
        delay: delay / 1000,
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={`inline-block ${className}`}
    >
      <motion.span
        variants={glitchVariants}
        initial="normal"
        animate={isGlitching ? 'glitch' : isHovered ? 'hover' : 'normal'}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        tabIndex={glitchOnHover ? 0 : undefined}
        role={glitchOnHover ? 'button' : undefined}
        aria-label={ariaLabel || text}
        aria-live={isTyping ? 'polite' : undefined}
        className={`
          inline-block
          font-bold
          select-none
          ${glitchOnHover ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50' : ''}
          ${isGlitching ? 'font-mono' : ''}
        `}
        style={{
          fontFamily: isGlitching ? 'monospace' : 'inherit',
        }}
      >
        <AnimatePresence mode="wait">
          {typewriterEffect ? (
            <motion.span
              key={displayText}
              variants={typewriter}
              initial="initial"
              animate="animate"
              className="relative"
            >
              {displayText}
              {isTyping && (
                <motion.span
                  animate={{
                    opacity: [1, 0, 1],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="ml-1 inline-block w-0.5 h-5 bg-current"
                />
              )}
            </motion.span>
          ) : (
            <motion.span
              key={displayText}
              variants={fadeInUp}
              initial="initial"
              animate="animate"
            >
              {displayText}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>
    </motion.div>
  )
}

// Export additional utilities for use in other components
export const createGlitchText = (
  text: string,
  options?: Partial<GlitchTextProps>
) => {
  return {
    text,
    ...options,
  }
}

export const glitchPresets = {
  subtle: {
    glitchOnHover: true,
    speed: 100,
    delay: 0,
  },
  intense: {
    glitchOnHover: true,
    speed: 30,
    delay: 0,
  },
  typewriter: {
    typewriterEffect: true,
    speed: 50,
    delay: 500,
  },
  typewriterFast: {
    typewriterEffect: true,
    speed: 25,
    delay: 200,
  },
} as const

export type GlitchPreset = keyof typeof glitchPresets
