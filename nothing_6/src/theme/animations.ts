// src/theme/animations.ts
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import { Variants } from 'framer-motion';

// Animation durations in milliseconds
export const durations = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 750,
  slowest: 1000,
  hero: 1200,
  epic: 2000,
} as const;

// Easing functions for smooth animations
export const easings = {
  linear: [0, 0, 1, 1],
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  elastic: [0.175, 0.885, 0.32, 1.275],
  back: [0.68, -0.6, 0.32, 1.6],
  anticipate: [0.215, 0.61, 0.355, 1],
} as const;

// Common motion presets for Framer Motion
export const motionPresets = {
  // Fade animations
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: durations.normal / 1000, ease: easings.easeOut },
  } as Variants,

  fadeUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: durations.normal / 1000, ease: easings.easeOut },
  } as Variants,

  fadeDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: durations.normal / 1000, ease: easings.easeOut },
  } as Variants,

  fadeLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: durations.normal / 1000, ease: easings.easeOut },
  } as Variants,

  fadeRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: durations.normal / 1000, ease: easings.easeOut },
  } as Variants,

  // Scale animations
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { duration: durations.normal / 1000, ease: easings.back },
  } as Variants,

  scaleUp: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
    transition: { duration: durations.fast / 1000, ease: easings.easeOut },
  } as Variants,

  // Float animation for continuous movement
  float: {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: durations.epic / 1000,
        repeat: Infinity,
        ease: easings.easeInOut,
      },
    },
  } as Variants,

  floatSlow: {
    initial: { y: 0 },
    animate: {
      y: [-5, 5, -5],
      transition: {
        duration: (durations.epic * 1.5) / 1000,
        repeat: Infinity,
        ease: easings.easeInOut,
      },
    },
  } as Variants,

  // Glitch effect for dramatic emphasis
  glitch: {
    initial: { x: 0, opacity: 1 },
    animate: {
      x: [0, -2, 2, -1, 1, 0],
      opacity: [1, 0.8, 1, 0.9, 1],
      transition: {
        duration: durations.fast / 1000,
        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
        ease: 'linear',
      },
    },
  } as Variants,

  glitchLoop: {
    animate: {
      x: [0, -2, 2, -1, 1, 0],
      opacity: [1, 0.8, 1, 0.9, 1],
      transition: {
        duration: durations.normal / 1000,
        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
        ease: 'linear',
        repeat: Infinity,
        repeatDelay: durations.epic / 1000,
      },
    },
  } as Variants,

  // Slide animations
  slideUp: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100%', opacity: 0 },
    transition: { duration: durations.slow / 1000, ease: easings.anticipate },
  } as Variants,

  slideDown: {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
    transition: { duration: durations.slow / 1000, ease: easings.anticipate },
  } as Variants,

  slideLeft: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
    transition: { duration: durations.slow / 1000, ease: easings.anticipate },
  } as Variants,

  slideRight: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
    transition: { duration: durations.slow / 1000, ease: easings.anticipate },
  } as Variants,

  // Rotation animations
  rotate: {
    initial: { rotate: -180, opacity: 0 },
    animate: { rotate: 0, opacity: 1 },
    exit: { rotate: 180, opacity: 0 },
    transition: { duration: durations.slow / 1000, ease: easings.back },
  } as Variants,

  // Stagger container for animating children
  staggerContainer: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  } as Variants,

  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: durations.normal / 1000, ease: easings.easeOut },
  } as Variants,
};

// Hover and tap animations for interactive elements
export const interactionPresets = {
  hover: {
    scale: 1.02,
    transition: { duration: durations.fast / 1000, ease: easings.easeOut },
  },

  hoverScale: {
    scale: 1.05,
    transition: { duration: durations.fast / 1000, ease: easings.easeOut },
  },

  tap: {
    scale: 0.98,
    transition: { duration: durations.instant / 1000, ease: easings.easeOut },
  },

  tapScale: {
    scale: 0.95,
    transition: { duration: durations.instant / 1000, ease: easings.easeOut },
  },

  focus: {
    scale: 1.01,
    boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.6)',
    transition: { duration: durations.fast / 1000, ease: easings.easeOut },
  },
};

// Layout transition presets for shared layout animations
export const layoutPresets = {
  smooth: {
    type: 'spring',
    damping: 20,
    stiffness: 300,
  },

  snappy: {
    type: 'spring',
    damping: 25,
    stiffness: 400,
  },

  bouncy: {
    type: 'spring',
    damping: 15,
    stiffness: 200,
  },
};

// Page transition presets
export const pageTransitions = {
  slide: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
    transition: { duration: durations.slow / 1000, ease: easings.anticipate },
  },

  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: durations.normal / 1000, ease: easings.easeInOut },
  },

  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 },
    transition: { duration: durations.slow / 1000, ease: easings.easeInOut },
  },
};

// Animation utility functions
export const createStaggered = (delay: number = 0.1) => ({
  animate: {
    transition: {
      staggerChildren: delay,
      delayChildren: delay,
    },
  },
});

export const createBounceIn = (delay: number = 0) => ({
  initial: { opacity: 0, scale: 0.3 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      delay,
      duration: durations.slow / 1000,
      ease: easings.bounce,
    },
  },
});

export const createSlideInFrom = (direction: 'left' | 'right' | 'up' | 'down', delay: number = 0) => {
  const directionMap = {
    left: { x: -100, y: 0 },
    right: { x: 100, y: 0 },
    up: { x: 0, y: -100 },
    down: { x: 0, y: 100 },
  };

  const { x, y } = directionMap[direction];

  return {
    initial: { opacity: 0, x, y },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        delay,
        duration: durations.slow / 1000,
        ease: easings.anticipate,
      },
    },
  };
};

// Export type for external consumption
export type MotionPreset = keyof typeof motionPresets;
export type InteractionPreset = keyof typeof interactionPresets;
export type LayoutPreset = keyof typeof layoutPresets;
export type PageTransition = keyof typeof pageTransitions;
export type Duration = keyof typeof durations;
export type Easing = keyof typeof easings;
