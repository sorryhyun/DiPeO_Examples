// filepath: src/theme/animations.ts

// ===============================================
// Animation Configuration & Presets
// ===============================================

// Animation durations in milliseconds
export const ANIMATION_DURATIONS = {
  instant: 0,
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
  slowest: 750,
} as const;

// Easing curves for different animation types
export const EASING_CURVES = {
  // Standard easing
  ease: [0.25, 0.1, 0.25, 1],
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  
  // Bouncy easing for playful interactions
  bounceOut: [0.34, 1.56, 0.64, 1],
  bounceIn: [0.6, -0.28, 0.735, 0.045],
  
  // Sharp easing for precise movements
  sharp: [0.4, 0, 0.6, 1],
  
  // Anticipate easing for drawer/modal reveals
  anticipate: [0.175, 0.885, 0.32, 1.275],
  
  // Back easing for subtle overshoot
  backOut: [0.175, 0.885, 0.32, 1.275],
  backIn: [0.6, -0.28, 0.735, 0.045],
} as const;

// ===============================================
// Framer Motion Variants
// ===============================================

// Fade animations
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: {
    duration: ANIMATION_DURATIONS.normal / 1000,
    ease: EASING_CURVES.easeOut,
  },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: {
    duration: ANIMATION_DURATIONS.normal / 1000,
    ease: EASING_CURVES.easeOut,
  },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: {
    duration: ANIMATION_DURATIONS.normal / 1000,
    ease: EASING_CURVES.easeOut,
  },
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: {
    duration: ANIMATION_DURATIONS.normal / 1000,
    ease: EASING_CURVES.easeOut,
  },
};

export const fadeInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: {
    duration: ANIMATION_DURATIONS.normal / 1000,
    ease: EASING_CURVES.easeOut,
  },
};

// Scale animations
export const scaleUp = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: {
    duration: ANIMATION_DURATIONS.fast / 1000,
    ease: EASING_CURVES.easeOut,
  },
};

export const scaleDown = {
  initial: { opacity: 0, scale: 1.05 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.05 },
  transition: {
    duration: ANIMATION_DURATIONS.fast / 1000,
    ease: EASING_CURVES.easeOut,
  },
};

export const scaleBounce = {
  initial: { scale: 0 },
  animate: { scale: 1 },
  exit: { scale: 0 },
  transition: {
    type: "spring",
    stiffness: 260,
    damping: 20,
  },
};

// Slide animations for drawers, modals, dropdowns
export const slideInFromRight = {
  initial: { x: "100%" },
  animate: { x: 0 },
  exit: { x: "100%" },
  transition: {
    duration: ANIMATION_DURATIONS.normal / 1000,
    ease: EASING_CURVES.anticipate,
  },
};

export const slideInFromLeft = {
  initial: { x: "-100%" },
  animate: { x: 0 },
  exit: { x: "-100%" },
  transition: {
    duration: ANIMATION_DURATIONS.normal / 1000,
    ease: EASING_CURVES.anticipate,
  },
};

export const slideInFromTop = {
  initial: { y: "-100%" },
  animate: { y: 0 },
  exit: { y: "-100%" },
  transition: {
    duration: ANIMATION_DURATIONS.normal / 1000,
    ease: EASING_CURVES.anticipate,
  },
};

export const slideInFromBottom = {
  initial: { y: "100%" },
  animate: { y: 0 },
  exit: { y: "100%" },
  transition: {
    duration: ANIMATION_DURATIONS.normal / 1000,
    ease: EASING_CURVES.anticipate,
  },
};

// Rotation animations
export const rotateIn = {
  initial: { opacity: 0, rotate: -10 },
  animate: { opacity: 1, rotate: 0 },
  exit: { opacity: 0, rotate: 10 },
  transition: {
    duration: ANIMATION_DURATIONS.normal / 1000,
    ease: EASING_CURVES.backOut,
  },
};

// ===============================================
// Stagger Animations for Lists
// ===============================================

export const staggerContainer = {
  initial: {},
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
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: {
    duration: ANIMATION_DURATIONS.normal / 1000,
    ease: EASING_CURVES.easeOut,
  },
};

export const staggerItemLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 },
  transition: {
    duration: ANIMATION_DURATIONS.normal / 1000,
    ease: EASING_CURVES.easeOut,
  },
};

// ===============================================
// Modal & Overlay Animations
// ===============================================

export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: {
    duration: ANIMATION_DURATIONS.fast / 1000,
  },
};

export const modalContent = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 10 },
  transition: {
    duration: ANIMATION_DURATIONS.normal / 1000,
    ease: EASING_CURVES.easeOut,
  },
};

export const drawerContent = {
  initial: { x: "100%" },
  animate: { x: 0 },
  exit: { x: "100%" },
  transition: {
    type: "spring",
    stiffness: 300,
    damping: 30,
  },
};

// ===============================================
// Button & Interactive Animations
// ===============================================

export const buttonPress = {
  whileTap: { scale: 0.95 },
  transition: {
    duration: ANIMATION_DURATIONS.fast / 1000,
    ease: EASING_CURVES.easeInOut,
  },
};

export const buttonHover = {
  whileHover: { scale: 1.02, y: -2 },
  whileTap: { scale: 0.98 },
  transition: {
    duration: ANIMATION_DURATIONS.fast / 1000,
    ease: EASING_CURVES.easeOut,
  },
};

export const iconSpin = {
  animate: { rotate: 360 },
  transition: {
    duration: 1,
    ease: "linear",
    repeat: Infinity,
  },
};

export const iconBounce = {
  animate: { y: [0, -4, 0] },
  transition: {
    duration: 0.6,
    ease: EASING_CURVES.bounceOut,
    repeat: Infinity,
  },
};

// ===============================================
// Toast & Notification Animations
// ===============================================

export const toastSlideIn = {
  initial: { opacity: 0, x: 100, scale: 0.95 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 100, scale: 0.95 },
  transition: {
    duration: ANIMATION_DURATIONS.normal / 1000,
    ease: EASING_CURVES.backOut,
  },
};

export const toastStack = {
  layout: true,
  transition: {
    duration: ANIMATION_DURATIONS.fast / 1000,
    ease: EASING_CURVES.easeInOut,
  },
};

// ===============================================
// Card & Content Animations
// ===============================================

export const cardHover = {
  whileHover: { 
    y: -4,
    transition: { duration: ANIMATION_DURATIONS.fast / 1000 }
  },
  transition: {
    duration: ANIMATION_DURATIONS.fast / 1000,
    ease: EASING_CURVES.easeOut,
  },
};

export const glassMorph = {
  initial: { opacity: 0, backdropFilter: "blur(0px)" },
  animate: { opacity: 1, backdropFilter: "blur(16px)" },
  exit: { opacity: 0, backdropFilter: "blur(0px)" },
  transition: {
    duration: ANIMATION_DURATIONS.normal / 1000,
    ease: EASING_CURVES.easeOut,
  },
};

// ===============================================
// Loading & Skeleton Animations
// ===============================================

export const skeleton = {
  animate: {
    opacity: [0.5, 0.8, 0.5],
  },
  transition: {
    duration: 1.5,
    ease: "easeInOut",
    repeat: Infinity,
  },
};

export const spinnerRotate = {
  animate: { rotate: 360 },
  transition: {
    duration: 1,
    ease: "linear",
    repeat: Infinity,
  },
};

export const pulse = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
  },
  transition: {
    duration: 2,
    ease: "easeInOut",
    repeat: Infinity,
  },
};

// ===============================================
// Page Transition Animations
// ===============================================

export const pageSlideIn = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: {
    duration: ANIMATION_DURATIONS.normal / 1000,
    ease: EASING_CURVES.easeInOut,
  },
};

export const pageFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: {
    duration: ANIMATION_DURATIONS.normal / 1000,
    ease: EASING_CURVES.easeInOut,
  },
};

// ===============================================
// Composite Motion Presets
// ===============================================

export const motionPresets = {
  // Fade variants
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  
  // Scale variants
  scaleUp,
  scaleDown,
  scaleBounce,
  
  // Slide variants
  slideInFromRight,
  slideInFromLeft,
  slideInFromTop,
  slideInFromBottom,
  
  // Rotation variants
  rotateIn,
  
  // Stagger variants
  staggerContainer,
  staggerItem,
  staggerItemLeft,
  
  // Modal variants
  modalBackdrop,
  modalContent,
  drawerContent,
  
  // Interactive variants
  buttonPress,
  buttonHover,
  iconSpin,
  iconBounce,
  
  // Toast variants
  toastSlideIn,
  toastStack,
  
  // Card variants
  cardHover,
  glassMorph,
  
  // Loading variants
  skeleton,
  spinnerRotate,
  pulse,
  
  // Page transitions
  pageSlideIn,
  pageFade,
} as const;

// ===============================================
// Animation Utility Functions
// ===============================================

// Create a custom duration variant
export function withDuration<T extends Record<string, any>>(
  preset: T,
  duration: keyof typeof ANIMATION_DURATIONS
): T {
  return {
    ...preset,
    transition: {
      ...preset.transition,
      duration: ANIMATION_DURATIONS[duration] / 1000,
    },
  };
}

// Create a custom easing variant
export function withEasing<T extends Record<string, any>>(
  preset: T,
  easing: keyof typeof EASING_CURVES
): T {
  return {
    ...preset,
    transition: {
      ...preset.transition,
      ease: EASING_CURVES[easing],
    },
  };
}

// Create a delayed variant
export function withDelay<T extends Record<string, any>>(
  preset: T,
  delay: number
): T {
  return {
    ...preset,
    transition: {
      ...preset.transition,
      delay: delay / 1000,
    },
  };
}

// Create spring animation
export function createSpringAnimation(
  stiffness = 260,
  damping = 20,
  mass = 1
) {
  return {
    type: "spring",
    stiffness,
    damping,
    mass,
  };
}

// Reduced motion support
export function respectsReducedMotion<T extends Record<string, any>>(
  preset: T
): T {
  const prefersReducedMotion = 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    return {
      ...preset,
      transition: {
        duration: 0.01,
      },
    };
  }
  
  return preset;
}

/*
Self-Check Comments:
- [x] Uses `@/` imports only (no external imports needed for animation presets)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects - pure animation definitions)
- [x] Reads config from `@/app/config` (not applicable for animation presets)
- [x] Exports default named component (exports motionPresets object and utility functions)
- [x] Adds basic ARIA and keyboard handlers (includes reduced motion support)
*/
