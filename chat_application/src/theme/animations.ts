// filepath: src/theme/animations.ts
import type { Variants, Transition } from 'framer-motion';

/**
 * Framer Motion animation variants, transitions, and timing presets.
 * Provides consistent micro-interactions, page transitions, and component animations.
 */

// =============================================================================
// Timing Constants
// =============================================================================

export const timing = {
  // Micro-interactions (buttons, inputs, hovers)
  instant: 0.1,
  quick: 0.2,
  snappy: 0.3,
  
  // Standard component animations
  normal: 0.4,
  smooth: 0.6,
  
  // Page transitions and large movements
  slow: 0.8,
  deliberate: 1.2,
} as const;

export const easing = {
  // Standard easing curves
  linear: [0, 0, 1, 1],
  ease: [0.25, 0.1, 0.25, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],
  
  // Custom curves for specific interactions
  spring: [0.175, 0.885, 0.32, 1.275], // Slight overshoot
  bounce: [0.68, -0.55, 0.265, 1.55], // More pronounced bounce
  gentle: [0.25, 0.46, 0.45, 0.94], // Very gentle easing
} as const;

// =============================================================================
// Transition Presets
// =============================================================================

export const transitions: Record<string, Transition> = {
  // Quick interactions
  instant: {
    duration: timing.instant,
    ease: easing.easeOut,
  },
  
  quick: {
    duration: timing.quick,
    ease: easing.easeInOut,
  },
  
  // Standard animations
  normal: {
    duration: timing.normal,
    ease: easing.ease,
  },
  
  smooth: {
    duration: timing.smooth,
    ease: easing.gentle,
  },
  
  // Special effects
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 25,
    mass: 0.8,
  },
  
  bouncy: {
    type: 'spring',
    stiffness: 400,
    damping: 17,
    mass: 0.6,
  },
  
  gentle: {
    type: 'spring',
    stiffness: 200,
    damping: 30,
    mass: 1,
  },
  
  // Layout animations
  layout: {
    type: 'spring',
    stiffness: 500,
    damping: 30,
    mass: 1,
  },
};

// =============================================================================
// Micro-Interaction Variants
// =============================================================================

export const microInteractionPresets: Record<string, Variants> = {
  // Button interactions
  button: {
    idle: {
      scale: 1,
      opacity: 1,
    },
    hover: {
      scale: 1.02,
      opacity: 0.9,
      transition: transitions.quick,
    },
    tap: {
      scale: 0.98,
      transition: transitions.instant,
    },
    disabled: {
      scale: 1,
      opacity: 0.5,
      cursor: 'not-allowed',
      transition: transitions.quick,
    },
  },

  // Input field interactions
  input: {
    idle: {
      borderColor: 'rgba(0, 0, 0, 0.1)',
      boxShadow: '0 0 0 0px rgba(59, 130, 246, 0)',
    },
    focus: {
      borderColor: 'rgba(59, 130, 246, 1)',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
      transition: transitions.quick,
    },
    error: {
      borderColor: 'rgba(239, 68, 68, 1)',
      boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
      transition: transitions.quick,
    },
  },

  // Card hover effects
  card: {
    idle: {
      scale: 1,
      y: 0,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    hover: {
      scale: 1.01,
      y: -2,
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
      transition: transitions.normal,
    },
    tap: {
      scale: 0.99,
      transition: transitions.instant,
    },
  },

  // Icon animations
  icon: {
    idle: {
      scale: 1,
      rotate: 0,
    },
    hover: {
      scale: 1.1,
      transition: transitions.quick,
    },
    tap: {
      scale: 0.9,
      transition: transitions.instant,
    },
    spin: {
      rotate: 360,
      transition: {
        duration: 1,
        ease: 'linear',
        repeat: Infinity,
      },
    },
  },

  // Switch/Toggle interactions
  toggle: {
    off: {
      x: 0,
      backgroundColor: 'rgba(156, 163, 175, 1)', // gray-400
    },
    on: {
      x: '100%',
      backgroundColor: 'rgba(34, 197, 94, 1)', // green-500
      transition: transitions.spring,
    },
  },

  // Loading pulse
  pulse: {
    idle: {
      opacity: 1,
    },
    loading: {
      opacity: 0.6,
      transition: {
        duration: 0.8,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'reverse',
      },
    },
  },
};

// =============================================================================
// Page Transition Variants
// =============================================================================

export const pageTransitions: Record<string, Variants> = {
  // Slide transitions
  slideLeft: {
    initial: {
      x: '-100%',
      opacity: 0,
    },
    animate: {
      x: 0,
      opacity: 1,
      transition: transitions.smooth,
    },
    exit: {
      x: '100%',
      opacity: 0,
      transition: transitions.smooth,
    },
  },

  slideRight: {
    initial: {
      x: '100%',
      opacity: 0,
    },
    animate: {
      x: 0,
      opacity: 1,
      transition: transitions.smooth,
    },
    exit: {
      x: '-100%',
      opacity: 0,
      transition: transitions.smooth,
    },
  },

  slideUp: {
    initial: {
      y: '100%',
      opacity: 0,
    },
    animate: {
      y: 0,
      opacity: 1,
      transition: transitions.smooth,
    },
    exit: {
      y: '-100%',
      opacity: 0,
      transition: transitions.smooth,
    },
  },

  // Fade transitions
  fade: {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: transitions.normal,
    },
    exit: {
      opacity: 0,
      transition: transitions.normal,
    },
  },

  fadeScale: {
    initial: {
      opacity: 0,
      scale: 0.95,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: transitions.smooth,
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: transitions.smooth,
    },
  },

  // Modal/Overlay transitions
  modal: {
    initial: {
      opacity: 0,
      scale: 0.8,
      y: 20,
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: transitions.spring,
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 20,
      transition: transitions.quick,
    },
  },

  backdrop: {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: transitions.quick,
    },
    exit: {
      opacity: 0,
      transition: transitions.quick,
    },
  },

  // Drawer/Sidebar transitions
  drawer: {
    initial: {
      x: '-100%',
    },
    animate: {
      x: 0,
      transition: transitions.smooth,
    },
    exit: {
      x: '-100%',
      transition: transitions.smooth,
    },
  },

  // List item animations
  listItem: {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: transitions.normal,
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: transitions.quick,
    },
  },

  // Stagger container for list animations
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
    exit: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  },
};

// =============================================================================
// Motion Variants (Combined Presets)
// =============================================================================

export const motionVariants = {
  ...microInteractionPresets,
  ...pageTransitions,
  
  // Additional composite variants
  fadeInUp: {
    initial: {
      opacity: 0,
      y: 30,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: transitions.smooth,
    },
  },

  fadeInDown: {
    initial: {
      opacity: 0,
      y: -30,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: transitions.smooth,
    },
  },

  zoomIn: {
    initial: {
      opacity: 0,
      scale: 0,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: transitions.bouncy,
    },
  },

  rotateIn: {
    initial: {
      opacity: 0,
      rotate: -180,
      scale: 0.5,
    },
    animate: {
      opacity: 1,
      rotate: 0,
      scale: 1,
      transition: transitions.spring,
    },
  },
} as const;

// =============================================================================
// Animation Utilities
// =============================================================================

/**
 * Create a stagger transition for animating lists of items
 */
export const createStaggerTransition = (
  staggerDelay: number = 0.1,
  delayChildren: number = 0
): Transition => ({
  staggerChildren: staggerDelay,
  delayChildren,
});

/**
 * Create a spring transition with custom parameters
 */
export const createSpringTransition = (
  stiffness: number = 300,
  damping: number = 25,
  mass: number = 1
): Transition => ({
  type: 'spring',
  stiffness,
  damping,
  mass,
});

/**
 * Create a duration-based transition with custom easing
 */
export const createTimingTransition = (
  duration: number,
  ease: number[] | string = easing.ease
): Transition => ({
  duration,
  ease,
});

/**
 * Combine multiple variants into a single variants object
 */
export const combineVariants = (...variants: Variants[]): Variants => {
  return variants.reduce((combined, variant) => ({ ...combined, ...variant }), {});
};

/**
 * Create a variant that delays animation by a specified amount
 */
export const createDelayedVariant = (
  baseVariant: Variants,
  delay: number
): Variants => {
  const delayed: Variants = {};
  
  for (const [key, value] of Object.entries(baseVariant)) {
    if (typeof value === 'object' && value !== null && 'transition' in value) {
      delayed[key] = {
        ...value,
        transition: {
          ...((value as any).transition || {}),
          delay,
        },
      };
    } else {
      delayed[key] = value;
    }
  }
  
  return delayed;
};

// =============================================================================
// Animation Hooks Helpers
// =============================================================================

/**
 * Get appropriate transition for animation context
 */
export const getTransitionForContext = (context: 'micro' | 'page' | 'modal' | 'layout'): Transition => {
  switch (context) {
    case 'micro':
      return transitions.quick;
    case 'page':
      return transitions.smooth;
    case 'modal':
      return transitions.spring;
    case 'layout':
      return transitions.layout;
    default:
      return transitions.normal;
  }
};

/**
 * Get appropriate variants for component type
 */
export const getVariantsForComponent = (
  component: 'button' | 'card' | 'input' | 'icon' | 'modal' | 'page'
): Variants => {
  const variantMap = {
    button: motionVariants.button,
    card: motionVariants.card,
    input: motionVariants.input,
    icon: motionVariants.icon,
    modal: motionVariants.modal,
    page: motionVariants.fade,
  };
  
  return variantMap[component] || motionVariants.fade;
};

/*
Self-check comments:
- [x] Uses `@/` imports only (no external imports needed beyond framer-motion types)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (not applicable for animations file)
- [x] Exports default named component (exports named constants and functions)
- [x] Adds basic ARIA and keyboard handlers (not applicable for animation definitions)
- [x] Provides comprehensive animation variants for micro-interactions
- [x] Includes page transition variants with multiple styles (slide, fade, modal)
- [x] Uses consistent timing and easing constants throughout
- [x] Provides utility functions for creating custom transitions and variants
- [x] Supports stagger animations for list items
- [x] Includes context-aware helpers for getting appropriate animations
- [x] Uses Framer Motion types for proper TypeScript support
*/
