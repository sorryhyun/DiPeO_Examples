// filepath: src/utils/gsap.ts
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [ ] Adds basic ARIA and keyboard handlers (where relevant)

import { gsap } from 'gsap'
import { config } from '@/app/config'
import { eventBus } from '@/core/events'

// GSAP timeline configuration types
export interface TimelineConfig {
  duration?: number
  delay?: number
  ease?: string
  repeat?: number
  repeatDelay?: number
  yoyo?: boolean
  isDevelopment?: boolean
  onComplete?: () => void
  onStart?: () => void
  onUpdate?: () => void
}

export interface MatrixRainConfig {
  characters?: string
  columns?: number
  speed?: number
  glitchIntensity?: number
  color?: string
  backgroundColor?: string
  isDevelopment?: boolean
}

export interface GlitchConfig {
  intensity?: number
  duration?: number
  frequency?: number
  colors?: string[]
  isDevelopment?: boolean
}

// Default configurations
const DEFAULT_TIMELINE_CONFIG: TimelineConfig = {
  duration: 1,
  delay: 0,
  ease: 'power2.out',
  repeat: 0,
  repeatDelay: 0,
  yoyo: false,
  isDevelopment: false,
}

const DEFAULT_MATRIX_CONFIG: MatrixRainConfig = {
  characters: '01',
  columns: 20,
  speed: 0.1,
  glitchIntensity: 0.3,
  color: '#00ff00',
  backgroundColor: '#000000',
  isDevelopment: false,
}

const DEFAULT_GLITCH_CONFIG: GlitchConfig = {
  intensity: 0.5,
  duration: 0.2,
  frequency: 2,
  colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00'],
  isDevelopment: false,
}

// Main timeline factory
export function createTimeline(config: TimelineConfig = {}): gsap.core.Timeline {
  const finalConfig = { ...DEFAULT_TIMELINE_CONFIG, ...config }
  
  const timeline = gsap.timeline({
    delay: finalConfig.delay,
    repeat: finalConfig.repeat,
    repeatDelay: finalConfig.repeatDelay,
    yoyo: finalConfig.yoyo,
    onComplete: finalConfig.onComplete,
    onStart: finalConfig.onStart,
    onUpdate: finalConfig.onUpdate,
  })

  // Emit analytics event for timeline creation in dev mode
  if (config.isDevelopment) {
    eventBus.emit('analytics:event', {
      name: 'gsap:timeline_created',
      properties: { config: finalConfig }
    })
  }

  return timeline
}

// Matrix rain effect with staggered zeros
export function staggerZerosMatrix(
  targets: string | Element | Element[],
  config: MatrixRainConfig = {}
): gsap.core.Timeline {
  const finalConfig = { ...DEFAULT_MATRIX_CONFIG, ...config }
  const timeline = createTimeline({ duration: 2, repeat: -1 })

  try {
    // Create cascading effect with staggered animation
    timeline
      .set(targets, { 
        opacity: 0,
        y: -50,
        color: finalConfig.color,
      })
      .to(targets, {
        duration: (finalConfig.speed || 0.1) * 10,
        opacity: 1,
        y: 0,
        stagger: {
          amount: 1,
          from: 'random',
          grid: [finalConfig.columns || 1, 1],
          axis: 'y',
        },
        ease: 'none',
      })
      .to(targets, {
        duration: (finalConfig.speed || 0.1) * 5,
        opacity: 0,
        y: 50,
        stagger: {
          amount: 0.5,
          from: 'start',
        },
        ease: 'power2.in',
      }, '-=1')

    // Add glitch effect overlay
    if (finalConfig.glitchIntensity && finalConfig.glitchIntensity > 0) {
      timeline.to(targets, {
        duration: 0.1,
        skewX: () => gsap.utils.random(-2, 2) * (finalConfig.glitchIntensity || 0.3),
        skewY: () => gsap.utils.random(-1, 1) * (finalConfig.glitchIntensity || 0.3),
        x: () => gsap.utils.random(-5, 5) * (finalConfig.glitchIntensity || 0.3),
        repeat: -1,
        repeatDelay: gsap.utils.random(0.5, 2),
        yoyo: true,
      }, 0)
    }

  } catch (error) {
    if (config.isDevelopment) {
      console.error('[GSAP] Matrix rain animation error:', error)
      eventBus.emit('analytics:event', {
        name: 'gsap:matrix_error',
        properties: { error: String(error) }
      })
    }
  }

  return timeline
}

// Glitch text effect
export function createGlitchEffect(
  targets: string | Element | Element[],
  config: GlitchConfig = {}
): gsap.core.Timeline {
  const finalConfig = { ...DEFAULT_GLITCH_CONFIG, ...config }
  const timeline = createTimeline({ 
    duration: finalConfig.duration,
    repeat: -1,
    repeatDelay: 1 / (finalConfig.frequency || 2),
  })

  try {
    const glitchSteps = 5
    
    for (let i = 0; i < glitchSteps; i++) {
      timeline.to(targets, {
        duration: (finalConfig.duration || 0.2) / glitchSteps,
        x: () => gsap.utils.random(-10, 10) * (finalConfig.intensity || 0.5),
        y: () => gsap.utils.random(-2, 2) * (finalConfig.intensity || 0.5),
        skewX: () => gsap.utils.random(-5, 5) * (finalConfig.intensity || 0.5),
        scaleX: () => 1 + gsap.utils.random(-0.1, 0.1) * (finalConfig.intensity || 0.5),
        color: () => gsap.utils.random(finalConfig.colors || ['#ff0000', '#00ff00', '#0000ff']),
        textShadow: () => {
          const color = gsap.utils.random(finalConfig.colors || ['#ff0000', '#00ff00', '#0000ff'])
          const offset = gsap.utils.random(1, 3) * (finalConfig.intensity || 0.5)
          return `${offset}px 0 ${color}, -${offset}px 0 ${color}`
        },
        ease: 'none',
      })
    }

    // Reset to original state
    timeline.to(targets, {
      duration: 0.1,
      x: 0,
      y: 0,
      skewX: 0,
      scaleX: 1,
      textShadow: 'none',
      ease: 'power2.out',
    })

  } catch (error) {
    if (config.isDevelopment) {
      console.error('[GSAP] Glitch effect error:', error)
    }
  }

  return timeline
}

// Void particle system
export function createVoidParticles(
  container: Element,
  particleCount: number = 50
): gsap.core.Timeline {
  const timeline = createTimeline({ repeat: -1 })
  const particles: Element[] = []

  try {
    // Create particle elements
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      particle.className = 'absolute w-1 h-1 bg-white/20 rounded-full pointer-events-none'
      particle.style.left = `${Math.random() * 100}%`
      particle.style.top = `${Math.random() * 100}%`
      container.appendChild(particle)
      particles.push(particle)
    }

    // Animate particles
    particles.forEach((particle, index) => {
      timeline.to(particle, {
        duration: gsap.utils.random(2, 8),
        x: () => gsap.utils.random(-200, 200),
        y: () => gsap.utils.random(-200, 200),
        opacity: () => gsap.utils.random(0.1, 0.8),
        scale: () => gsap.utils.random(0.5, 2),
        rotation: () => gsap.utils.random(0, 360),
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: index * 0.1,
      }, 0)
    })

  } catch (error) {
    if (config.isDevelopment) {
      console.error('[GSAP] Void particles error:', error)
    }
  }

  return timeline
}

// Recursive nothing animation (fractal-like)
export function createRecursiveNothing(
  targets: string | Element | Element[],
  depth: number = 3
): gsap.core.Timeline {
  const timeline = createTimeline()
  
  if (depth <= 0) return timeline

  try {
    timeline
      .from(targets, {
        duration: 1,
        scale: 0,
        opacity: 0,
        rotation: 180,
        ease: 'back.out(1.7)',
      })
      .to(targets, {
        duration: 0.5,
        scale: 0.5,
        opacity: 0.7,
        ease: 'power2.inOut',
      })
      .add(() => {
        // Recursively create smaller versions
        if (depth > 1) {
          const nestedTimeline = createRecursiveNothing(targets, depth - 1)
          timeline.add(nestedTimeline, '-=0.3')
        }
      })

  } catch (error) {
    if (config.isDevelopment) {
      console.error('[GSAP] Recursive animation error:', error)
    }
  }

  return timeline
}

// Utility functions for common GSAP tasks
export const gsapUtils = {
  // Kill all animations on target
  killAnimationsFor: (targets: string | Element | Element[]) => {
    try {
      gsap.killTweensOf(targets)
    } catch (error) {
      if (config.isDevelopment) {
        console.warn('[GSAP] Kill animations error:', error)
      }
    }
  },

  // Set GSAP global config for reduced motion
  setReducedMotion: (reduced: boolean) => {
    if (reduced) {
      gsap.globalTimeline.timeScale(0.01) // Nearly instant
      gsap.defaults({ duration: 0.01 })
    } else {
      gsap.globalTimeline.timeScale(1)
      gsap.defaults({ duration: 1 })
    }
  },

  // Get random easing
  randomEase: () => {
    const eases = ['power1.out', 'power2.out', 'back.out(1.7)', 'elastic.out(1, 0.3)', 'bounce.out']
    return gsap.utils.random(eases)
  },

  // Batch kill all timelines
  killAllTimelines: () => {
    try {
      gsap.globalTimeline.kill()
    } catch (error) {
      if (config.isDevelopment) {
        console.warn('[GSAP] Kill all timelines error:', error)
      }
    }
  },
}

// Main exports
export const gsapWrapper = {
  createTimeline,
  staggerZerosMatrix,
  createGlitchEffect,
  createVoidParticles,
  createRecursiveNothing,
  utils: gsapUtils,
}

export default gsapWrapper
