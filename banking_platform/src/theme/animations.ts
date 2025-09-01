// filepath: src/theme/animations.ts
/* src/theme/animations.ts

Animation presets (easing, durations) and Framer Motion variants used across pages for consistent micro-interactions and page transitions.
Provides standardized timing, easing functions, and reusable motion variants for components.
*/

// Animation timing constants
export const ease = {
  // Standard easing functions
  linear: [0, 0, 1, 1],
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  
  // Custom easing for different interaction types
  bounceOut: [0.34, 1.56, 0.64, 1],
  backOut: [0.34, 1.56, 0.64, 1],
  anticipate: [0.215, 0.61, 0.355, 1],
  
  // Smooth transitions
  smooth: [0.25, 0.46, 0.45, 0.94],
  snappy: [0.68, -0.55, 0.265, 1.55],
} as const;

// Duration presets in seconds
export const duration = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
  slowest: 1.2,
} as const;

// Stagger timing for lists and sequential animations
export const stagger = {
  children: 0.1,
  items: 0.05,
  cards: 0.15,
  elements: 0.08,
} as const;

// Common motion variants for Framer Motion
export const motionVariants = {
  // Page transitions
  page: {
    initial: { opacity: 0, y: 20 },
    enter: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: duration.normal,
        ease: ease.easeOut,
      },
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: {
        duration: duration.fast,
        ease: ease.easeIn,
      },
    },
  },

  // Slide in from different directions
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: duration.normal,
        ease: ease.easeOut,
      },
    },
    exit: { 
      opacity: 0, 
      y: 30,
      transition: {
        duration: duration.fast,
        ease: ease.easeIn,
      },
    },
  },

  slideDown: {
    initial: { opacity: 0, y: -30 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: duration.normal,
        ease: ease.easeOut,
      },
    },
    exit: { 
      opacity: 0, 
      y: -30,
      transition: {
        duration: duration.fast,
        ease: ease.easeIn,
      },
    },
  },

  slideLeft: {
    initial: { opacity: 0, x: 30 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: duration.normal,
        ease: ease.easeOut,
      },
    },
    exit: { 
      opacity: 0, 
      x: 30,
      transition: {
        duration: duration.fast,
        ease: ease.easeIn,
      },
    },
  },

  slideRight: {
    initial: { opacity: 0, x: -30 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: duration.normal,
        ease: ease.easeOut,
      },
    },
    exit: { 
      opacity: 0, 
      x: -30,
      transition: {
        duration: duration.fast,
        ease: ease.easeIn,
      },
    },
  },

  // Scale animations
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: duration.normal,
        ease: ease.easeOut,
      },
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: {
        duration: duration.fast,
        ease: ease.easeIn,
      },
    },
  },

  scaleInLarge: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: duration.slow,
        ease: ease.backOut,
      },
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: {
        duration: duration.normal,
        ease: ease.easeIn,
      },
    },
  },

  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        duration: duration.normal,
        ease: ease.easeOut,
      },
    },
    exit: { 
      opacity: 0,
      transition: {
        duration: duration.fast,
        ease: ease.easeIn,
      },
    },
  },

  fadeInSlow: {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        duration: duration.slow,
        ease: ease.easeOut,
      },
    },
    exit: { 
      opacity: 0,
      transition: {
        duration: duration.normal,
        ease: ease.easeIn,
      },
    },
  },

  // Staggered container for lists
  staggerContainer: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: stagger.children,
        delayChildren: 0.1,
      },
    },
    exit: {
      transition: {
        staggerChildren: stagger.children / 2,
        staggerDirection: -1,
      },
    },
  },

  // Staggered items
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: duration.normal,
        ease: ease.easeOut,
      },
    },
    exit: { 
      opacity: 0, 
      y: 20,
      transition: {
        duration: duration.fast,
        ease: ease.easeIn,
      },
    },
  },

  // Modal/overlay animations
  modal: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: duration.normal,
        ease: ease.easeOut,
      },
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: {
        duration: duration.fast,
        ease: ease.easeIn,
      },
    },
  },

  backdrop: {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        duration: duration.fast,
        ease: ease.easeOut,
      },
    },
    exit: { 
      opacity: 0,
      transition: {
        duration: duration.fast,
        ease: ease.easeIn,
      },
    },
  },

  // Button hover/tap states
  button: {
    tap: { scale: 0.97 },
    hover: { 
      scale: 1.02,
      transition: {
        duration: duration.fast,
        ease: ease.easeOut,
      },
    },
  },

  // Card hover states
  card: {
    hover: { 
      y: -4,
      scale: 1.02,
      transition: {
        duration: duration.normal,
        ease: ease.easeOut,
      },
    },
    tap: { scale: 0.98 },
  },

  // Loading/spinner animations
  spinner: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        ease: ease.linear,
        repeat: Infinity,
      },
    },
  },

  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        ease: ease.easeInOut,
        repeat: Infinity,
      },
    },
  },

  // Toast notifications
  toast: {
    initial: { opacity: 0, y: 50, scale: 0.3 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: duration.normal,
        ease: ease.backOut,
      },
    },
    exit: { 
      opacity: 0, 
      y: 50, 
      scale: 0.3,
      transition: {
        duration: duration.fast,
        ease: ease.easeIn,
      },
    },
  },

  // Drawer/sidebar animations
  drawer: {
    initial: { x: '-100%' },
    animate: { 
      x: 0,
      transition: {
        duration: duration.normal,
        ease: ease.easeOut,
      },
    },
    exit: { 
      x: '-100%',
      transition: {
        duration: duration.fast,
        ease: ease.easeIn,
      },
    },
  },

  // Accordion/collapse animations
  collapse: {
    initial: { height: 0, opacity: 0 },
    animate: { 
      height: 'auto', 
      opacity: 1,
      transition: {
        height: {
          duration: duration.normal,
          ease: ease.easeOut,
        },
        opacity: {
          duration: duration.fast,
          delay: 0.1,
        },
      },
    },
    exit: { 
      height: 0, 
      opacity: 0,
      transition: {
        height: {
          duration: duration.fast,
          ease: ease.easeIn,
        },
        opacity: {
          duration: duration.instant,
        },
      },
    },
  },
} as const;

// Preset transition configurations
export const transitions = {
  // Standard page transitions
  page: {
    duration: duration.normal,
    ease: ease.easeInOut,
  },
  
  // Quick micro-interactions
  micro: {
    duration: duration.fast,
    ease: ease.easeOut,
  },
  
  // Smooth state changes
  smooth: {
    duration: duration.slow,
    ease: ease.smooth,
  },
  
  // Snappy feedback
  snappy: {
    duration: duration.fast,
    ease: ease.snappy,
  },
  
  // Bounce effects
  bounce: {
    duration: duration.slow,
    ease: ease.bounceOut,
  },
} as const;

// Helper functions for creating custom variants
export const createSlideVariant = (direction: 'up' | 'down' | 'left' | 'right', distance = 30) => {
  const axis = direction === 'up' || direction === 'down' ? 'y' : 'x';
  const value = direction === 'up' || direction === 'left' ? -distance : distance;
  
  return {
    initial: { opacity: 0, [axis]: value },
    animate: { 
      opacity: 1, 
      [axis]: 0,
      transition: {
        duration: duration.normal,
        ease: ease.easeOut,
      },
    },
    exit: { 
      opacity: 0, 
      [axis]: value,
      transition: {
        duration: duration.fast,
        ease: ease.easeIn,
      },
    },
  };
};

export const createScaleVariant = (scale = 0.9) => ({
  initial: { opacity: 0, scale },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: duration.normal,
      ease: ease.easeOut,
    },
  },
  exit: { 
    opacity: 0, 
    scale,
    transition: {
      duration: duration.fast,
      ease: ease.easeIn,
    },
  },
});

export const createStaggerVariant = (staggerDelay = stagger.children) => ({
  container: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
    exit: {
      transition: {
        staggerChildren: staggerDelay / 2,
        staggerDirection: -1,
      },
    },
  },
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: duration.normal,
        ease: ease.easeOut,
      },
    },
    exit: { 
      opacity: 0, 
      y: 20,
      transition: {
        duration: duration.fast,
        ease: ease.easeIn,
      },
    },
  },
});

/* Example usage:

import { motion } from 'framer-motion';
import { motionVariants, createSlideVariant, transitions } from '@/theme/animations';

// Using predefined variants
<motion.div
  variants={motionVariants.fadeIn}
  initial="initial"
  animate="animate"
  exit="exit"
>
  Content
</motion.div>

// Using stagger container
<motion.ul variants={motionVariants.staggerContainer} initial="initial" animate="animate">
  {items.map((item, i) => (
    <motion.li key={i} variants={motionVariants.staggerItem}>
      {item}
    </motion.li>
  ))}
</motion.ul>

// Creating custom variants
const customSlide = createSlideVariant('left', 50);
<motion.div variants={customSlide} initial="initial" animate="animate">
  Custom slide animation
</motion.div>

// Using preset transitions
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={transitions.micro}
>
  Interactive Button
</motion.button>

*/

// Self-check comments:
// [x] Uses `@/` imports only (N/A - no external imports needed, this is the foundation)
// [x] Uses providers/hooks (N/A - this is a pure configuration/constants module)
// [x] Reads config from `@/app/config` (N/A - this provides animation constants)
// [x] Exports default named component (exports named constants and functions)
// [x] Adds basic ARIA and keyboard handlers (N/A - this is animation configuration)
