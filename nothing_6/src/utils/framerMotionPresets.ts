// src/utils/framerMotionPresets.ts
// [ ] Uses `@/` imports as much as possible
// [ ] Uses providers/hooks (no direct DOM/localStorage side effects)
// [ ] Reads config from `@/app/config`
// [ ] Exports default named component
// [ ] Adds basic ARIA and keyboard handlers (where relevant)

import type { Variants, Transition } from 'framer-motion'
import { animationDurations, easings } from '@/theme/animations'

// Common transition presets
const commonTransitions = {
  spring: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
  },
  smooth: {
    type: 'tween' as const,
    duration: animationDurations.normal,
    ease: easings.easeOut,
  },
  fast: {
    type: 'tween' as const,
    duration: animationDurations.fast,
    ease: easings.easeOut,
  },
  slow: {
    type: 'tween' as const,
    duration: animationDurations.slow,
    ease: easings.easeInOut,
  },
} satisfies Record<string, Transition>

// Fade animations
const fadeVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: commonTransitions.smooth,
  },
  exit: {
    opacity: 0,
    transition: commonTransitions.fast,
  },
}

// Slide animations
const slideVariants = {
  up: {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: commonTransitions.spring,
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: commonTransitions.fast,
    },
  },
  down: {
    initial: {
      opacity: 0,
      y: -20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: commonTransitions.spring,
    },
    exit: {
      opacity: 0,
      y: 20,
      transition: commonTransitions.fast,
    },
  },
  left: {
    initial: {
      opacity: 0,
      x: 20,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: commonTransitions.spring,
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: commonTransitions.fast,
    },
  },
  right: {
    initial: {
      opacity: 0,
      x: -20,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: commonTransitions.spring,
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: commonTransitions.fast,
    },
  },
} satisfies Record<string, Variants>

// Scale animations
const scaleVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: commonTransitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: commonTransitions.fast,
  },
}

// Glitch effect for the void theme
const glitchVariants: Variants = {
  initial: {
    opacity: 0,
    x: 0,
    y: 0,
    skew: 0,
  },
  animate: {
    opacity: 1,
    x: [0, -2, 2, 0],
    y: [0, 1, -1, 0],
    skew: [0, 1, -1, 0],
    transition: {
      duration: animationDurations.fast,
      times: [0, 0.3, 0.6, 1],
      repeat: 2,
      ease: easings.easeInOut,
    },
  },
  exit: {
    opacity: 0,
    transition: commonTransitions.fast,
  },
}

// Stagger container for animating lists
const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
}

// Hover and tap interactions
const interactionVariants = {
  hover: {
    scale: 1.05,
    transition: commonTransitions.fast,
  },
  tap: {
    scale: 0.95,
    transition: {
      type: 'tween' as const,
      duration: 0.1,
    },
  },
  focus: {
    outline: '2px solid rgba(59, 130, 246, 0.5)',
    outlineOffset: '2px',
    transition: commonTransitions.fast,
  },
}

// Modal/overlay animations
const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.75,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.75,
    y: 20,
    transition: commonTransitions.fast,
  },
}

// Backdrop overlay
const backdropVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: animationDurations.normal,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: animationDurations.fast,
    },
  },
}

// Page transitions
const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: animationDurations.normal,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: animationDurations.fast,
      ease: easings.easeIn,
    },
  },
}

// Loading spinner variants
const loadingVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

// Pulse animation for attention-grabbing elements
const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: easings.easeInOut,
    },
  },
}

/**
 * Collection of Framer Motion animation presets for consistent motion design
 * across the application. These variants follow the app's animation theme
 * and provide smooth, accessible animations.
 */
export const motionVariants = {
  // Basic animations
  fade: fadeVariants,
  scale: scaleVariants,
  slide: slideVariants,
  
  // Special effects
  glitch: glitchVariants,
  
  // Layout animations
  stagger: staggerContainer,
  modal: modalVariants,
  backdrop: backdropVariants,
  page: pageVariants,
  
  // Interactions
  interaction: interactionVariants,
  
  // Utility animations
  loading: loadingVariants,
  pulse: pulseVariants,
} as const

// Export individual variant types for TypeScript
export type MotionVariantKey = keyof typeof motionVariants
export type SlideDirection = keyof typeof slideVariants

// Helper function to get slide variants by direction
export const getSlideVariants = (direction: SlideDirection): Variants => {
  return slideVariants[direction]
}

// Helper function to create custom stagger timing
export const createStaggerVariants = (
  staggerDelay: number = 0.1,
  childDelay: number = 0.2
): Variants => ({
  initial: {},
  animate: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: childDelay,
    },
  },
  exit: {
    transition: {
      staggerChildren: staggerDelay * 0.5,
      staggerDirection: -1,
    },
  },
})

// Helper function for reduced motion support
export const getReducedMotionVariants = (variants: Variants): Variants => {
  // If user prefers reduced motion, return simplified variants
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.2 } },
      exit: { opacity: 0, transition: { duration: 0.1 } },
    }
  }
  return variants
}

// Additional named exports for backward compatibility
export const fadeInUp = slideVariants.up
export const glitchAnimation = glitchVariants
export const glitchEffect = glitchVariants
export const countUpSpring = commonTransitions.spring
export const typewriter = motionVariants.loading
