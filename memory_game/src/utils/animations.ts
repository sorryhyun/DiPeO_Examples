import { Variants } from 'framer-motion';

// Card flip animation variants for Framer Motion
export const cardFlipVariants: Variants = {
  front: {
    rotateY: 0,
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
    },
  },
  back: {
    rotateY: 180,
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
    },
  },
};

// Card scale and opacity variants for matches and interactions
export const cardInteractionVariants: Variants = {
  idle: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  hover: {
    scale: 1.05,
    opacity: 0.9,
    transition: {
      duration: 0.2,
    },
  },
  matched: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 0.8,
      times: [0, 0.5, 1],
      ease: 'easeInOut',
    },
  },
  removed: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.4,
      ease: 'easeIn',
    },
  },
};

// Particle spawn animation variants
export const particleSpawnVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
    y: 0,
  },
  visible: {
    scale: [0, 1.2, 1],
    opacity: [0, 1, 0.8],
    y: [0, -20, -40],
    transition: {
      duration: 1.5,
      times: [0, 0.3, 1],
      ease: 'easeOut',
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    y: -60,
    transition: {
      duration: 0.5,
      ease: 'easeIn',
    },
  },
};

// Victory sequence animation variants
export const victorySequenceVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
    rotate: -180,
  },
  visible: {
    scale: [0, 1.3, 1],
    opacity: [0, 1, 1],
    rotate: [-180, 10, 0],
    transition: {
      duration: 1.2,
      times: [0, 0.6, 1],
      ease: 'easeOut',
    },
  },
};

// Particle effect options interface
export interface ParticleEffectOptions {
  count?: number;
  colors?: string[];
  size?: { min: number; max: number };
  velocity?: { min: number; max: number };
  gravity?: number;
  duration?: number;
  spread?: number;
}

// Default particle effect options
const DEFAULT_PARTICLE_OPTIONS: Required<ParticleEffectOptions> = {
  count: 50,
  colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
  size: { min: 3, max: 8 },
  velocity: { min: 2, max: 8 },
  gravity: 0.3,
  duration: 3000,
  spread: 60,
};

// Individual particle interface
interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

/**
 * Creates a particle effect within a container element
 * Used by Confetti and other particle-based components
 */
export function createParticleEffect(
  container: HTMLElement,
  options: ParticleEffectOptions = {}
): () => void {
  const opts = { ...DEFAULT_PARTICLE_OPTIONS, ...options };
  const particles: Particle[] = [];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.warn('Canvas context not available for particle effect');
    return () => {};
  }

  // Setup canvas
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '1000';
  container.appendChild(canvas);

  // Resize canvas to container
  const resizeCanvas = () => {
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  };

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Create particles
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  for (let i = 0; i < opts.count; i++) {
    const angle = (Math.PI * 2 * i) / opts.count + (Math.random() - 0.5) * (opts.spread * Math.PI / 180);
    const velocity = opts.velocity.min + Math.random() * (opts.velocity.max - opts.velocity.min);
    
    particles.push({
      id: `particle-${i}`,
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - Math.random() * 3,
      color: opts.colors[Math.floor(Math.random() * opts.colors.length)],
      size: opts.size.min + Math.random() * (opts.size.max - opts.size.min),
      life: opts.duration,
      maxLife: opts.duration,
    });
  }

  // Animation loop
  let animationFrame: number;
  
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      
      // Update physics
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += opts.gravity;
      particle.life -= 16; // Approximate 60fps
      
      // Calculate alpha based on remaining life
      const alpha = Math.max(0, particle.life / particle.maxLife);
      
      // Draw particle
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      
      // Remove dead particles
      if (particle.life <= 0) {
        particles.splice(i, 1);
      }
    }
    
    if (particles.length > 0) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      cleanup();
    }
  };
  
  const cleanup = () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    window.removeEventListener('resize', resizeCanvas);
    if (container.contains(canvas)) {
      container.removeChild(canvas);
    }
  };
  
  // Start animation
  animate();
  
  // Return cleanup function
  return cleanup;
}

/**
 * Launches a victory sequence with particles and effects
 * Used by game completion handlers and achievement unlocks
 */
export function launchVictorySequence(
  container: HTMLElement,
  options: ParticleEffectOptions = {}
): Promise<void> {
  return new Promise((resolve) => {
    const victoryOptions: ParticleEffectOptions = {
      count: 100,
      colors: ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#32CD32'],
      size: { min: 4, max: 12 },
      velocity: { min: 3, max: 10 },
      gravity: 0.2,
      duration: 4000,
      spread: 120,
      ...options,
    };
    
    const cleanup = createParticleEffect(container, victoryOptions);
    
    // Resolve after animation completes
    setTimeout(() => {
      cleanup();
      resolve();
    }, victoryOptions.duration || 4000);
  });
}

/**
 * Spring animation configuration for React Spring
 * Provides consistent timing and easing across the app
 */
export const springConfig = {
  tension: 280,
  friction: 60,
  mass: 1,
};

/**
 * Staggered animation delay calculator
 * Used for sequential card reveals or list animations
 */
export function calculateStaggerDelay(index: number, baseDelay: number = 0.1): number {
  return index * baseDelay;
}

/**
 * Easing functions for custom animations
 */
export const easingFunctions = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;
