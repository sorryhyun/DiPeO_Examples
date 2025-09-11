// filepath: src/features/testimonials/TestimonialBubble.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Avatar from '@/shared/components/Avatar'
import { bubblePreset, floatPreset } from '@/utils/framerMotionPresets'
import { config } from '@/app/config'
import { User } from '@/core/contracts'

export interface TestimonialBubbleProps {
  id: string
  user: User
  content: string
  rating: number
  timestamp?: string
  className?: string
  onBubbleClick?: (id: string) => void
  fadeToNothing?: boolean
  driftSpeed?: 'slow' | 'medium' | 'fast'
}

interface BubblePhysics {
  x: number
  y: number
  rotation: number
  opacity: number
}

const DRIFT_SPEEDS = {
  slow: { duration: 8, distance: 20 },
  medium: { duration: 6, distance: 35 },
  fast: { duration: 4, distance: 50 }
}

const TestimonialBubble: React.FC<TestimonialBubbleProps> = ({
  id,
  user,
  content,
  rating,
  timestamp,
  className = '',
  onBubbleClick,
  fadeToNothing = true,
  driftSpeed = 'medium'
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [physics, setPhysics] = useState<BubblePhysics>({
    x: 0,
    y: 0,
    rotation: 0,
    opacity: 1
  })

  const driftConfig = DRIFT_SPEEDS[driftSpeed]

  // Floating drift physics simulation
  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setPhysics(prev => ({
        x: prev.x + (Math.random() - 0.5) * 2,
        y: prev.y + (Math.random() - 0.5) * 2,
        rotation: prev.rotation + (Math.random() - 0.5) * 0.5,
        opacity: fadeToNothing ? Math.max(0.1, prev.opacity - 0.001) : prev.opacity
      }))
    }, 100)

    return () => clearInterval(interval)
  }, [isVisible, fadeToNothing])

  // Auto-fade to nothing after extended time
  useEffect(() => {
    if (!fadeToNothing) return

    const fadeTimeout = setTimeout(() => {
      setIsVisible(false)
    }, config.isDevelopment ? 30000 : 120000) // 30s dev, 2min prod

    return () => clearTimeout(fadeTimeout)
  }, [fadeToNothing])

  const handleBubbleInteraction = () => {
    onBubbleClick?.(id)
    // Reset physics on interaction
    setPhysics({ x: 0, y: 0, rotation: 0, opacity: 1 })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-sm ${
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
        aria-hidden="true"
      >
        ★
      </span>
    ))
  }

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'Just now'
    try {
      const date = new Date(timestamp)
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric' 
      })
    } catch {
      return 'Recently'
    }
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        key={id}
        className={`
          relative p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20
          hover:bg-white/20 transition-all duration-300 cursor-pointer
          shadow-lg hover:shadow-xl group
          ${className}
        `}
        style={{
          transform: `translate(${physics.x}px, ${physics.y}px) rotate(${physics.rotation}deg)`,
          opacity: physics.opacity
        }}
        initial={{ scale: 0, opacity: 0, rotate: -180 }}
        animate={{ 
          scale: 1, 
          opacity: physics.opacity,
          x: physics.x,
          y: physics.y,
          rotate: physics.rotation,
          ...floatPreset.animate
        }}
        exit={{ 
          scale: 0, 
          opacity: 0, 
          rotate: 180,
          transition: { duration: 0.6 }
        }}
        whileHover={{
          scale: 1.05,
          rotateX: 5,
          rotateY: 5,
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.95 }}
        onClick={handleBubbleInteraction}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleBubbleInteraction()
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`Testimonial from ${user.name}: ${content}`}
        {...bubblePreset}
      >
        {/* Floating background shimmer */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Header with avatar and user info */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar
            user={user}
            size="sm"
            className="ring-2 ring-white/30 group-hover:ring-white/50 transition-all"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user.name}
            </p>
            <p className="text-xs text-white/70 truncate">
              {user.role || 'Nothing Enthusiast'}
            </p>
          </div>
          <div className="text-xs text-white/60">
            {formatTimestamp(timestamp)}
          </div>
        </div>

        {/* Rating stars */}
        <div className="flex items-center gap-1 mb-2" aria-label={`Rating: ${rating} out of 5 stars`}>
          {renderStars(rating)}
          <span className="text-xs text-white/60 ml-1">
            ({rating}/5)
          </span>
        </div>

        {/* Testimonial content */}
        <blockquote className="text-sm text-white/90 leading-relaxed italic">
          "{content}"
        </blockquote>

        {/* Bubble physics indicator (dev only) */}
        {config.isDevelopment && (
          <div className="absolute top-1 right-1 text-xs text-white/40 font-mono">
            {driftSpeed}
          </div>
        )}

        {/* Subtle floating particles */}
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-white/30 rounded-full animate-pulse" />
        <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-white/20 rounded-full animate-pulse delay-500" />
      </motion.div>
    </AnimatePresence>
  )
}

export default TestimonialBubble
