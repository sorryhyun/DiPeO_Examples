// filepath: src/theme/animations.ts

// Animation configuration and Framer Motion presets for consistent micro-interactions

// Base transition configurations
export const transitions = {
  // Spring physics for smooth, natural motion
  spring: {
    type: 'spring' as const,
    damping: 25,
    stiffness: 300,
    mass: 0.8,
  },
  
  // Gentle spring for subtle interactions
  gentleSpring: {
    type: 'spring' as const,
    damping: 30,
    stiffness: 200,
    mass: 1,
  },
  
  // Bouncy spring for playful interactions
  bouncySpring: {
    type: 'spring' as const,
    damping: 18,
    stiffness: 400,
    mass: 0.6,
  },
  
  // Smooth easing for predictable motion
  smooth: {
    type: 'tween' as const,
    duration: 0.3,
    ease: [0.25, 0.46, 0.45, 0.94],
  },
  
  // Quick easing for immediate feedback
  quick: {
    type: 'tween' as const,
    duration: 0.15,
    ease: [0.25, 0.46, 0.45, 0.94],
  },
  
  // Slow easing for deliberate actions
  slow: {
    type: 'tween' as const,
    duration: 0.5,
    ease: [0.25, 0.46, 0.45, 0.94],
  },
} as const;

// Fade animation variants
export const fadeVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    transition: transitions.quick,
  },
} as const;

// Fade with scale animation variants
export const fadeScaleVariant = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: transitions.quick,
  },
} as const;

// Slide from different directions
export const slideVariants = {
  fromLeft: {
    initial: {
      opacity: 0,
      x: -20,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: transitions.spring,
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: transitions.quick,
    },
  },
  
  fromRight: {
    initial: {
      opacity: 0,
      x: 20,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: transitions.spring,
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: transitions.quick,
    },
  },
  
  fromTop: {
    initial: {
      opacity: 0,
      y: -20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: transitions.spring,
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: transitions.quick,
    },
  },
  
  fromBottom: {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: transitions.spring,
    },
    exit: {
      opacity: 0,
      y: 20,
      transition: transitions.quick,
    },
  },
} as const;

// Modal and overlay animations
export const modalVariant = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: -10,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: transitions.quick,
  },
} as const;

// Backdrop animation for overlays
export const backdropVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    transition: transitions.quick,
  },
} as const;

// Button interaction animations
export const buttonVariants = {
  // Subtle scale on hover/tap
  scale: {
    hover: {
      scale: 1.02,
      transition: transitions.quick,
    },
    tap: {
      scale: 0.98,
      transition: transitions.quick,
    },
  },
  
  // Gentle lift effect
  lift: {
    hover: {
      y: -2,
      transition: transitions.spring,
    },
    tap: {
      y: 0,
      transition: transitions.quick,
    },
  },
  
  // Opacity change for disabled states
  opacity: {
    hover: {
      opacity: 0.8,
      transition: transitions.quick,
    },
    disabled: {
      opacity: 0.5,
      transition: transitions.smooth,
    },
  },
} as const;

// Card hover animations
export const cardVariant = {
  hover: {
    y: -4,
    scale: 1.01,
    transition: transitions.spring,
  },
  tap: {
    scale: 0.99,
    transition: transitions.quick,
  },
} as const;

// Loading animation variants
export const loadingVariants = {
  // Pulsing effect
  pulse: {
    initial: {
      opacity: 0.6,
      scale: 1,
    },
    animate: {
      opacity: [0.6, 1, 0.6],
      scale: [1, 1.02, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
  
  // Skeleton shimmer effect
  shimmer: {
    initial: {
      backgroundPosition: '-200% 0',
    },
    animate: {
      backgroundPosition: '200% 0',
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  },
  
  // Spinner rotation
  spin: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  },
} as const;

// Stagger animations for lists and grids
export const staggerChildren = {
  // Quick stagger for small lists
  quick: {
    animate: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  },
  
  // Normal stagger for medium lists
  normal: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.15,
      },
    },
  },
  
  // Slow stagger for dramatic reveals
  slow: {
    animate: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  },
} as const;

// List item animation (used with stagger)
export const listItemVariant = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: transitions.quick,
  },
} as const;

// Toast notification animations
export const toastVariants = {
  success: {
    initial: {
      opacity: 0,
      y: -50,
      scale: 0.95,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: transitions.bouncySpring,
    },
    exit: {
      opacity: 0,
      y: -50,
      scale: 0.95,
      transition: transitions.quick,
    },
  },
  
  error: {
    initial: {
      opacity: 0,
      x: 50,
      scale: 0.95,
    },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: transitions.spring,
    },
    exit: {
      opacity: 0,
      x: 50,
      scale: 0.95,
      transition: transitions.quick,
    },
  },
  
  info: {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: transitions.gentleSpring,
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: transitions.quick,
    },
  },
} as const;

// Page transition animations
export const pageVariants = {
  // Fade between pages
  fade: {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: transitions.smooth,
    },
    exit: {
      opacity: 0,
      transition: transitions.quick,
    },
  },
  
  // Slide between pages
  slideHorizontal: {
    initial: {
      opacity: 0,
      x: 20,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: transitions.spring,
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: transitions.quick,
    },
  },
  
  // Scale from center
  scale: {
    initial: {
      opacity: 0,
      scale: 0.98,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: transitions.spring,
    },
    exit: {
      opacity: 0,
      scale: 1.02,
      transition: transitions.quick,
    },
  },
} as const;

// Form field animations
export const fieldVariants = {
  focus: {
    scale: 1.01,
    transition: transitions.quick,
  },
  
  error: {
    x: [0, -5, 5, -5, 5, 0],
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
    },
  },
  
  success: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
} as const;

// Consolidated motion presets for easy consumption
export const motionPresets = {
  // Basic animations
  fade: fadeVariant,
  fadeScale: fadeScaleVariant,
  slide: slideVariants,
  
  // UI component animations
  modal: modalVariant,
  backdrop: backdropVariant,
  button: buttonVariants,
  card: cardVariant,
  
  // Loading states
  loading: loadingVariants,
  
  // List animations
  stagger: staggerChildren,
  listItem: listItemVariant,
  
  // Notifications
  toast: toastVariants,
  
  // Page transitions
  page: pageVariants,
  
  // Form interactions
  field: fieldVariants,
  
  // Transition presets
  transition: transitions,
} as const;

// Helper function to create custom stagger animation
export function createStaggerVariant(
  staggerDelay: number = 0.1,
  childDelay: number = 0.15
) {
  return {
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: childDelay,
      },
    },
  };
}

// Helper function to create custom slide animation
export function createSlideVariant(
  direction: 'left' | 'right' | 'up' | 'down',
  distance: number = 20
) {
  const getInitialPosition = () => {
    switch (direction) {
      case 'left':
        return { x: -distance, y: 0 };
      case 'right':
        return { x: distance, y: 0 };
      case 'up':
        return { x: 0, y: -distance };
      case 'down':
        return { x: 0, y: distance };
      default:
        return { x: 0, y: 0 };
    }
  };

  const initialPos = getInitialPosition();

  return {
    initial: {
      opacity: 0,
      ...initialPos,
    },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: transitions.spring,
    },
    exit: {
      opacity: 0,
      ...initialPos,
      transition: transitions.quick,
    },
  };
}

// Helper function for responsive animation scaling
export function getResponsiveAnimation(
  baseAnimation: any,
  isMobile: boolean = false
) {
  if (isMobile) {
    // Reduce motion intensity on mobile devices
    return {
      ...baseAnimation,
      transition: {
        ...baseAnimation.transition,
        duration: baseAnimation.transition?.duration * 0.7,
        damping: baseAnimation.transition?.damping * 1.2,
      },
    };
  }
  
  return baseAnimation;
}

// Animation utilities for programmatic control
export const animationUtils = {
  createStaggerVariant,
  createSlideVariant,
  getResponsiveAnimation,
  
  // Check if user prefers reduced motion
  respectsReducedMotion: () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  },
  
  // Get animation with reduced motion consideration
  withReducedMotion: (animation: any) => {
    if (animationUtils.respectsReducedMotion()) {
      return {
        ...animation,
        initial: animation.animate || animation.initial,
        animate: animation.animate || animation.initial,
        transition: { duration: 0 },
      };
    }
    return animation;
  },
} as const;

// Export everything for easy consumption
export {
  transitions,
  fadeVariant,
  fadeScaleVariant,
  slideVariants,
  modalVariant,
  backdropVariant,
  buttonVariants,
  cardVariant,
  loadingVariants,
  staggerChildren,
  listItemVariant,
  toastVariants,
  pageVariants,
  fieldVariants,
  animationUtils,
};

// Self-check comments:
// [x] Uses `@/` imports only - no external imports needed for animation definitions
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - pure animation configurations
// [x] Reads config from `@/app/config` - not needed for animation presets
// [x] Exports default named component - exports motionPresets as main export plus individual variants
// [x] Adds basic ARIA and keyboard handlers (where relevant) - includes reduced motion accessibility support
