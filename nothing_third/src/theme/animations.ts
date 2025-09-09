// filepath: src/theme/animations.ts

// Animation configuration constants
export const ANIMATION_CONFIG = {
  // Duration presets (in seconds)
  duration: {
    instant: 0.1,
    fast: 0.15,
    normal: 0.25,
    slow: 0.35,
    slower: 0.5,
  },
  // Easing presets
  easing: {
    ease: [0.25, 0.1, 0.25, 1],
    easeIn: [0.42, 0, 1, 1],
    easeOut: [0, 0, 0.58, 1],
    easeInOut: [0.42, 0, 0.58, 1],
    spring: [0.68, -0.55, 0.265, 1.55],
    bounce: [0.68, -0.55, 0.265, 1.55],
  },
  // Spring configuration
  spring: {
    gentle: { type: "spring", stiffness: 120, damping: 14 },
    wobbly: { type: "spring", stiffness: 180, damping: 12 },
    stiff: { type: "spring", stiffness: 400, damping: 30 },
    slow: { type: "spring", stiffness: 80, damping: 14 },
  },
  // Stagger timing
  stagger: {
    children: 0.1,
    items: 0.05,
    fast: 0.03,
    slow: 0.15,
  },
} as const;

// Motion transition presets for common patterns
export const motionPresets = {
  // Fade transitions
  fade: {
    duration: ANIMATION_CONFIG.duration.normal,
    ease: ANIMATION_CONFIG.easing.easeOut,
  },
  
  // Scale/zoom transitions
  scale: {
    duration: ANIMATION_CONFIG.duration.fast,
    ease: ANIMATION_CONFIG.easing.easeOut,
  },
  
  // Slide transitions
  slide: {
    duration: ANIMATION_CONFIG.duration.normal,
    ease: ANIMATION_CONFIG.easing.easeInOut,
  },
  
  // Spring animations
  spring: ANIMATION_CONFIG.spring.gentle,
  springWobbly: ANIMATION_CONFIG.spring.wobbly,
  springStiff: ANIMATION_CONFIG.spring.stiff,
  springSlow: ANIMATION_CONFIG.spring.slow,
  
  // Smooth transitions for layout changes
  layout: {
    duration: ANIMATION_CONFIG.duration.normal,
    ease: ANIMATION_CONFIG.easing.easeInOut,
  },
  
  // Quick micro-interactions
  micro: {
    duration: ANIMATION_CONFIG.duration.fast,
    ease: ANIMATION_CONFIG.easing.easeOut,
  },
} as const;

// Fade animation variants for consistent enter/exit animations
export const fadeVariant = {
  initial: { 
    opacity: 0 
  },
  animate: { 
    opacity: 1,
    transition: motionPresets.fade
  },
  exit: { 
    opacity: 0,
    transition: { 
      ...motionPresets.fade, 
      duration: ANIMATION_CONFIG.duration.fast 
    }
  }
} as const;

// Fade with slight vertical movement (common for modals, dropdowns)
export const fadeUpVariant = {
  initial: { 
    opacity: 0,
    y: 20
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: motionPresets.spring
  },
  exit: { 
    opacity: 0,
    y: 10,
    transition: motionPresets.micro
  }
} as const;

// Fade with slight horizontal movement (common for sidebars, drawers)
export const fadeSlideVariant = {
  initial: { 
    opacity: 0,
    x: -20
  },
  animate: { 
    opacity: 1,
    x: 0,
    transition: motionPresets.slide
  },
  exit: { 
    opacity: 0,
    x: -10,
    transition: motionPresets.micro
  }
} as const;

// Scale animation variants (great for buttons, cards)
export const scaleVariant = {
  initial: { 
    opacity: 0,
    scale: 0.95
  },
  animate: { 
    opacity: 1,
    scale: 1,
    transition: motionPresets.spring
  },
  exit: { 
    opacity: 0,
    scale: 0.98,
    transition: motionPresets.micro
  }
} as const;

// Stagger children animation for lists and grids
export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: ANIMATION_CONFIG.stagger.children,
      delayChildren: 0.1,
    }
  }
} as const;

// Fast stagger for smaller items
export const staggerChildrenFast = {
  animate: {
    transition: {
      staggerChildren: ANIMATION_CONFIG.stagger.fast,
      delayChildren: 0.05,
    }
  }
} as const;

// Slow stagger for larger items or dramatic effect
export const staggerChildrenSlow = {
  animate: {
    transition: {
      staggerChildren: ANIMATION_CONFIG.stagger.slow,
      delayChildren: 0.2,
    }
  }
} as const;

// Child animation variants to use with stagger parents
export const staggerChild = {
  initial: { 
    opacity: 0,
    y: 20
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: motionPresets.spring
  }
} as const;

// Page transition variants
export const pageVariants = {
  initial: {
    opacity: 0,
    x: 20
  },
  in: {
    opacity: 1,
    x: 0
  },
  out: {
    opacity: 0,
    x: -20
  }
} as const;

// Page transitions with different timing
export const pageTransition = {
  type: "tween",
  ease: ANIMATION_CONFIG.easing.easeInOut,
  duration: ANIMATION_CONFIG.duration.normal
} as const;

// Modal/overlay backdrop variants
export const backdropVariant = {
  initial: { 
    opacity: 0 
  },
  animate: { 
    opacity: 1,
    transition: { 
      duration: ANIMATION_CONFIG.duration.fast 
    }
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: ANIMATION_CONFIG.duration.fast,
      delay: 0.1 // Exit backdrop after content
    }
  }
} as const;

// Hover and tap animation states for interactive elements
export const interactiveVariants = {
  hover: {
    scale: 1.02,
    transition: motionPresets.micro
  },
  tap: {
    scale: 0.98,
    transition: motionPresets.micro
  }
} as const;

// Loading spinner rotation
export const spinVariant = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
} as const;

// Pulse animation for loading states
export const pulseVariant = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
} as const;

// Utility function to create custom stagger configurations
export function createStagger(
  staggerDelay: number = ANIMATION_CONFIG.stagger.children,
  delayChildren: number = 0.1
) {
  return {
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      }
    }
  };
}

// Utility function to create custom fade variants with different directions
export function createFadeVariant(
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  distance: number = 20
) {
  const getOffset = () => {
    switch (direction) {
      case 'up': return { y: distance };
      case 'down': return { y: -distance };
      case 'left': return { x: distance };
      case 'right': return { x: -distance };
      default: return { y: distance };
    }
  };

  const initialOffset = getOffset();
  
  return {
    initial: { 
      opacity: 0,
      ...initialOffset
    },
    animate: { 
      opacity: 1,
      y: 0,
      x: 0,
      transition: motionPresets.spring
    },
    exit: { 
      opacity: 0,
      ...getOffset(),
      transition: motionPresets.micro
    }
  };
}

// Utility function to create custom scale variants
export function createScaleVariant(
  initialScale: number = 0.95,
  exitScale: number = 0.98
) {
  return {
    initial: { 
      opacity: 0,
      scale: initialScale
    },
    animate: { 
      opacity: 1,
      scale: 1,
      transition: motionPresets.spring
    },
    exit: { 
      opacity: 0,
      scale: exitScale,
      transition: motionPresets.micro
    }
  };
}

// Duration helpers for conditional animations
export const getDuration = {
  byComplexity: (isComplex: boolean) => 
    isComplex ? ANIMATION_CONFIG.duration.slow : ANIMATION_CONFIG.duration.normal,
  
  byPreference: (prefersReducedMotion: boolean) => 
    prefersReducedMotion ? ANIMATION_CONFIG.duration.instant : ANIMATION_CONFIG.duration.normal,
  
  bySize: (size: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small': return ANIMATION_CONFIG.duration.fast;
      case 'medium': return ANIMATION_CONFIG.duration.normal;
      case 'large': return ANIMATION_CONFIG.duration.slow;
      default: return ANIMATION_CONFIG.duration.normal;
    }
  }
};

// Export all presets as default collection
export const animations = {
  config: ANIMATION_CONFIG,
  presets: motionPresets,
  variants: {
    fade: fadeVariant,
    fadeUp: fadeUpVariant,
    fadeSlide: fadeSlideVariant,
    scale: scaleVariant,
    page: pageVariants,
    backdrop: backdropVariant,
    interactive: interactiveVariants,
    spin: spinVariant,
    pulse: pulseVariant,
  },
  stagger: {
    children: staggerChildren,
    childrenFast: staggerChildrenFast,
    childrenSlow: staggerChildrenSlow,
    child: staggerChild,
  },
  transitions: {
    page: pageTransition,
  },
  utils: {
    createStagger,
    createFadeVariant,
    createScaleVariant,
    getDuration,
  }
} as const;

/*
Self-check comments:
- [x] Uses `@/` imports only (no external imports needed for animation presets)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - pure configuration and utility functions
- [x] Reads config from `@/app/config` (N/A for animation presets, but could be extended to read motion preferences)
- [x] Exports default named component (exports animations object and individual utilities)
- [x] Adds basic ARIA and keyboard handlers (N/A for animation configuration, but utilities support reduced motion preferences)
*/
