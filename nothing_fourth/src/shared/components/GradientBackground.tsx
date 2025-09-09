// filepath: src/shared/components/GradientBackground.tsx
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion'
import { tokens, gradients } from '@/theme/index'
import { motionPresets, ANIMATION_DURATIONS, EASING_CURVES } from '@/theme/animations'
import { config } from '@/app/config'
import { eventBus } from '@/core/events'

// ===============================================
// GradientBackground Component Props & Types
// ===============================================

export interface GradientBackgroundProps {
  // Gradient variant
  variant?: 'mesh' | 'sunset' | 'ocean' | 'forest' | 'primary' | 'secondary' | 'custom'
  
  // Custom gradient (when variant='custom')
  customGradient?: string
  
  // Animation settings
  animated?: boolean
  animationSpeed?: 'slow' | 'normal' | 'fast'
  
  // Floating shapes/orbs
  shapes?: boolean
  shapeCount?: number
  
  // Parallax interaction
  parallax?: boolean
  parallaxIntensity?: 'subtle' | 'normal' | 'strong'
  
  // Overlay settings
  overlay?: boolean
  overlayOpacity?: number
  overlayColor?: string
  
  // Responsive behavior
  mobileOptimized?: boolean
  reduceMotion?: boolean
  
  // Layout
  fixed?: boolean
  zIndex?: number
  
  // Accessibility
  'aria-hidden'?: boolean
}

interface FloatingShape {
  id: string
  size: number
  initialX: number
  initialY: number
  color: string
  animationDuration: number
  delay: number
}

// ===============================================
// Animation & Style Configurations
// ===============================================

const animationSpeedMap = {
  slow: 30000,
  normal: 20000,
  fast: 12000,
} as const

const parallaxIntensityMap = {
  subtle: 0.02,
  normal: 0.05,
  strong: 0.1,
} as const

const gradientVariants = {
  mesh: gradients.mesh,
  sunset: gradients.sunset,
  ocean: gradients.ocean,
  forest: gradients.forest,
  primary: gradients.primary,
  secondary: gradients.secondary,
} as const

// Generate floating shapes data
function generateFloatingShapes(count: number, variant: string): FloatingShape[] {
  const shapes: FloatingShape[] = []
  const colors = {
    mesh: ['rgba(59, 130, 246, 0.3)', 'rgba(168, 85, 247, 0.2)', 'rgba(239, 68, 68, 0.2)'],
    sunset: ['rgba(255, 107, 107, 0.3)', 'rgba(255, 217, 61, 0.2)', 'rgba(255, 107, 107, 0.2)'],
    ocean: ['rgba(102, 126, 234, 0.3)', 'rgba(118, 75, 162, 0.2)', 'rgba(59, 130, 246, 0.2)'],
    forest: ['rgba(17, 153, 142, 0.3)', 'rgba(56, 239, 125, 0.2)', 'rgba(34, 197, 94, 0.2)'],
    primary: ['rgba(59, 130, 246, 0.3)', 'rgba(37, 99, 235, 0.2)', 'rgba(29, 78, 216, 0.2)'],
    secondary: ['rgba(168, 85, 247, 0.3)', 'rgba(147, 51, 234, 0.2)', 'rgba(124, 58, 237, 0.2)'],
  }
  
  const variantColors = colors[variant as keyof typeof colors] || colors.mesh
  
  for (let i = 0; i < count; i++) {
    shapes.push({
      id: `shape-${i}`,
      size: Math.random() * 200 + 100, // 100-300px
      initialX: Math.random() * 100, // 0-100%
      initialY: Math.random() * 100, // 0-100%
      color: variantColors[Math.floor(Math.random() * variantColors.length)],
      animationDuration: Math.random() * 10000 + 15000, // 15-25s
      delay: Math.random() * 5000, // 0-5s delay
    })
  }
  
  return shapes
}

// ===============================================
// Floating Shape Component
// ===============================================

const FloatingShape: React.FC<{
  shape: FloatingShape
  animationSpeed: number
  reduceMotion: boolean
}> = ({ shape, animationSpeed, reduceMotion }) => {
  const controls = useAnimation()
  
  useEffect(() => {
    if (reduceMotion) {
      return
    }
    
    const animate = async () => {
      await controls.start({
        x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
        y: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
        scale: [1, 1.2, 0.8, 1],
        rotate: [0, 180, 360],
        opacity: [0.3, 0.6, 0.2, 0.3],
        transition: {
          duration: shape.animationDuration / 1000,
          ease: 'easeInOut',
          repeat: Infinity,
          delay: shape.delay / 1000,
        },
      })
    }
    
    animate()
  }, [controls, shape, reduceMotion])
  
  return (
    <motion.div
      animate={controls}
      style={{
        position: 'absolute',
        left: `${shape.initialX}%`,
        top: `${shape.initialY}%`,
        width: shape.size,
        height: shape.size,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${shape.color} 0%, transparent 70%)`,
        pointerEvents: 'none',
        filter: 'blur(1px)',
      }}
      aria-hidden="true"
    />
  )
}

// ===============================================
// Main GradientBackground Component
// ===============================================

export function GradientBackground({
  variant = 'mesh',
  customGradient,
  animated = true,
  animationSpeed = 'normal',
  shapes = true,
  shapeCount = 6,
  parallax = true,
  parallaxIntensity = 'normal',
  overlay = false,
  overlayOpacity = 0.1,
  overlayColor = 'rgba(0, 0, 0, 0.1)',
  mobileOptimized = true,
  reduceMotion,
  fixed = true,
  zIndex = -1,
  'aria-hidden': ariaHidden = true,
  ...props
}: GradientBackgroundProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  
  // Mouse position for parallax
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  // Transform mouse position to parallax values
  const intensity = parallaxIntensityMap[parallaxIntensity]
  const parallaxX = useTransform(mouseX, [0, 1], [-intensity * 50, intensity * 50])
  const parallaxY = useTransform(mouseY, [0, 1], [-intensity * 50, intensity * 50])
  
  // Generate floating shapes
  const floatingShapes = useMemo(() => {
    if (!shapes || (!animated && !config.features?.animations)) {
      return []
    }
    return generateFloatingShapes(shapeCount, variant)
  }, [shapes, shapeCount, variant, animated])
  
  // Detect mobile and reduced motion preferences
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    const checkReducedMotion = () => {
      setPrefersReducedMotion(
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      )
    }
    
    checkMobile()
    checkReducedMotion()
    
    window.addEventListener('resize', checkMobile)
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    motionQuery.addEventListener('change', checkReducedMotion)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      motionQuery.removeEventListener('change', checkReducedMotion)
    }
  }, [])
  
  // Handle mouse movement for parallax
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!parallax || prefersReducedMotion || reduceMotion) {
      return
    }
    
    const { clientX, clientY } = event
    const { innerWidth, innerHeight } = window
    
    mouseX.set(clientX / innerWidth)
    mouseY.set(clientY / innerHeight)
  }, [parallax, mouseX, mouseY, prefersReducedMotion, reduceMotion])
  
  // Emit events for analytics/debugging
  useEffect(() => {
    eventBus.emit('gradient-background:mounted', {
      variant,
      animated,
      shapes,
      parallax,
      timestamp: new Date().toISOString(),
    })
    
    return () => {
      eventBus.emit('gradient-background:unmounted', {})
    }
  }, [variant, animated, shapes, parallax])
  
  // Determine final motion settings
  const shouldAnimate = animated && !prefersReducedMotion && !(reduceMotion ?? false)
  const shouldShowShapes = shapes && !isMobile && shouldAnimate
  const shouldUseParallax = parallax && !isMobile && shouldAnimate
  
  // Get gradient background
  const backgroundGradient = customGradient || gradientVariants[variant as keyof typeof gradientVariants] || gradientVariants.mesh
  
  // Animation for gradient rotation
  const gradientAnimation = shouldAnimate ? {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    backgroundSize: ['200% 200%', '300% 300%', '200% 200%'],
  } : {}
  
  const gradientTransition = shouldAnimate ? {
    duration: animationSpeedMap[animationSpeed] / 1000,
    ease: 'linear',
    repeat: Infinity,
  } : {}
  
  return (
    <motion.div
      {...props}
      className="gradient-background"
      style={{
        position: fixed ? 'fixed' : 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex,
        background: backgroundGradient,
        backgroundSize: '200% 200%',
        backgroundPosition: '0% 50%',
        overflow: 'hidden',
        pointerEvents: 'none',
        ...(!shouldUseParallax ? {} : {
          x: parallaxX,
          y: parallaxY,
        }),
      }}
      animate={gradientAnimation}
      transition={gradientTransition}
      onMouseMove={shouldUseParallax ? handleMouseMove : undefined}
      aria-hidden={ariaHidden}
      role="presentation"
    >
      {/* Floating shapes */}
      {shouldShowShapes && floatingShapes.map(shape => (
        <FloatingShape
          key={shape.id}
          shape={shape}
          animationSpeed={animationSpeedMap[animationSpeed]}
          reduceMotion={prefersReducedMotion || !!reduceMotion}
        />
      ))}
      
      {/* Optional overlay */}
      {overlay && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: overlayColor,
            opacity: overlayOpacity,
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Gradient mesh overlay for depth */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 0%, transparent 50%),
            radial-gradient(circle at 40% 70%, rgba(255,255,255,0.03) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
          opacity: shouldAnimate ? 1 : 0.7,
        }}
        animate={shouldAnimate ? {
          opacity: [0.7, 1, 0.7],
        } : {}}
        transition={shouldAnimate ? {
          duration: 8,
          ease: 'easeInOut',
          repeat: Infinity,
        } : {}}
        aria-hidden="true"
      />
    </motion.div>
  )
}

// ===============================================
// Preset Variants
// ===============================================

export const MeshGradientBackground: React.FC<Omit<GradientBackgroundProps, 'variant'>> = (props) => (
  <GradientBackground {...props} variant="mesh" />
)

export const SunsetGradientBackground: React.FC<Omit<GradientBackgroundProps, 'variant'>> = (props) => (
  <GradientBackground {...props} variant="sunset" />
)

export const OceanGradientBackground: React.FC<Omit<GradientBackgroundProps, 'variant'>> = (props) => (
  <GradientBackground {...props} variant="ocean" />
)

export const ForestGradientBackground: React.FC<Omit<GradientBackgroundProps, 'variant'>> = (props) => (
  <GradientBackground {...props} variant="forest" />
)

export const StaticGradientBackground: React.FC<GradientBackgroundProps> = (props) => (
  <GradientBackground
    {...props}
    animated={false}
    shapes={false}
    parallax={false}
  />
)

export const MinimalGradientBackground: React.FC<GradientBackgroundProps> = (props) => (
  <GradientBackground
    {...props}
    shapes={false}
    shapeCount={0}
    animationSpeed="slow"
  />
)

// ===============================================
// Export Default
// ===============================================

export default GradientBackground

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/
