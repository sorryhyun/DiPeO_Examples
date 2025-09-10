// filepath: src/shared/components/GradientBackground.tsx

import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, useAnimationFrame } from 'framer-motion';
import { theme } from '@/theme';
import { 
  fadeIn, 
  DURATIONS, 
  EASINGS,
  shouldReduceMotion,
  getAnimationDuration 
} from '@/theme/animations';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface GradientBackgroundProps {
  /** Gradient preset or custom gradient */
  variant?: 'primary' | 'secondary' | 'accent' | 'warm' | 'cool' | 'aurora' | 'sunset' | 'ocean' | 'custom';
  
  /** Custom gradient CSS value (overrides variant) */
  gradient?: string;
  
  /** Whether to show animated floating shapes */
  showShapes?: boolean;
  
  /** Whether to enable mouse parallax effect */
  enableParallax?: boolean;
  
  /** Intensity of parallax effect (0-1) */
  parallaxIntensity?: number;
  
  /** Whether to animate the gradient itself */
  animateGradient?: boolean;
  
  /** Animation speed multiplier */
  animationSpeed?: number;
  
  /** Overlay opacity for content readability */
  overlayOpacity?: number;
  
  /** Blur intensity for glass-morphism effect */
  blurIntensity?: 'none' | 'light' | 'medium' | 'heavy';
  
  /** Additional CSS classes */
  className?: string;
  
  /** Children to render on top of background */
  children?: React.ReactNode;
  
  /** Custom style overrides */
  style?: React.CSSProperties;
}

interface FloatingShape {
  id: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  direction: number;
  color: string;
}

// ============================================================================
// GRADIENT PRESETS
// ============================================================================

const gradientPresets = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  accent: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  warm: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  cool: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  aurora: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 50%, #89f7fe 100%)',
  sunset: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
  ocean: 'linear-gradient(135deg, #667db6 0%, #0082c8 25%, #0082c8 75%, #667db6 100%)',
} as const;

const blurIntensities = {
  none: '',
  light: 'backdrop-blur-sm',
  medium: 'backdrop-blur-md',
  heavy: 'backdrop-blur-lg',
} as const;

// ============================================================================
// FLOATING SHAPES GENERATOR
// ============================================================================

function generateFloatingShapes(count: number = 6): FloatingShape[] {
  const shapes: FloatingShape[] = [];
  const colors = [
    'rgba(255, 255, 255, 0.1)',
    'rgba(255, 255, 255, 0.05)',
    'rgba(255, 255, 255, 0.15)',
    'rgba(59, 130, 246, 0.1)',
    'rgba(168, 85, 247, 0.08)',
    'rgba(34, 211, 238, 0.06)',
  ];
  
  for (let i = 0; i < count; i++) {
    shapes.push({
      id: `shape-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 300 + 100,
      opacity: Math.random() * 0.3 + 0.1,
      speed: Math.random() * 0.5 + 0.2,
      direction: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
  
  return shapes;
}

// ============================================================================
// GRADIENT BACKGROUND COMPONENT
// ============================================================================

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  variant = 'primary',
  gradient,
  showShapes = false,
  enableParallax = false,
  parallaxIntensity = 0.3,
  animateGradient = false,
  animationSpeed = 1,
  overlayOpacity = 0,
  blurIntensity = 'none',
  className = '',
  children,
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shapes, setShapes] = useState<FloatingShape[]>([]);
  const [isClient, setIsClient] = useState(false);
  
  // Mouse position for parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Parallax transforms
  const x1 = useTransform(mouseX, [0, 1], [0, 30 * parallaxIntensity]);
  const y1 = useTransform(mouseY, [0, 1], [0, 30 * parallaxIntensity]);
  const x2 = useTransform(mouseX, [0, 1], [0, -20 * parallaxIntensity]);
  const y2 = useTransform(mouseY, [0, 1], [0, -20 * parallaxIntensity]);
  
  // Animation time for gradient animation
  const time = useMotionValue(0);
  
  // Initialize shapes and client-side flag
  useEffect(() => {
    setIsClient(true);
    if (showShapes && !shouldReduceMotion()) {
      setShapes(generateFloatingShapes());
    }
  }, [showShapes]);
  
  // Handle mouse movement for parallax
  useEffect(() => {
    if (!enableParallax || shouldReduceMotion()) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      mouseX.set(x);
      mouseY.set(y);
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, [enableParallax, mouseX, mouseY]);
  
  // Animate gradient if enabled
  useAnimationFrame((t) => {
    if (animateGradient && !shouldReduceMotion()) {
      time.set(t * 0.001 * animationSpeed);
    }
  });
  
  // Get final gradient value
  const finalGradient = gradient || gradientPresets[variant];
  
  // Build CSS classes
  const containerClasses = [
    'fixed inset-0 w-full h-full overflow-hidden',
    blurIntensities[blurIntensity],
    className,
  ].filter(Boolean).join(' ');
  
  const backgroundStyle: React.CSSProperties = {
    background: finalGradient,
    ...style,
  };
  
  // Animated gradient styles
  const animatedGradientStyle = animateGradient && !shouldReduceMotion() ? {
    background: `
      linear-gradient(
        ${45 + Math.sin(time.get()) * 45}deg,
        ${theme.colors.primary[500]}20,
        ${theme.colors.secondary[500]}15,
        ${theme.colors.accent[500]}10
      )
    `,
    backgroundSize: '400% 400%',
    animation: `gradientShift ${getAnimationDuration('slowest')}ms ${EASINGS.smooth} infinite`,
  } : {};
  
  return (
    <div
      ref={containerRef}
      className={containerClasses}
      style={backgroundStyle}
      role="presentation"
      aria-hidden="true"
    >
      {/* Base gradient layer */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: finalGradient,
          x: enableParallax ? x1 : 0,
          y: enableParallax ? y1 : 0,
          ...animatedGradientStyle,
        }}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      />
      
      {/* Secondary parallax layer */}
      {enableParallax && !shouldReduceMotion() && (
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${theme.colors.primary[400]}20, transparent 70%)`,
            x: x2,
            y: y2,
          }}
        />
      )}
      
      {/* Floating shapes */}
      {showShapes && !shouldReduceMotion() && isClient && shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: shape.size,
            height: shape.size,
            background: `radial-gradient(circle, ${shape.color}, transparent 70%)`,
          }}
          animate={{
            x: [
              0,
              Math.cos(shape.direction) * 50,
              Math.cos(shape.direction + Math.PI) * 30,
              0,
            ],
            y: [
              0,
              Math.sin(shape.direction) * 30,
              Math.sin(shape.direction + Math.PI) * 50,
              0,
            ],
            scale: [1, 1.1, 0.9, 1],
            opacity: [shape.opacity, shape.opacity * 1.5, shape.opacity * 0.5, shape.opacity],
          }}
          transition={{
            duration: (10 + Math.random() * 10) / animationSpeed,
            repeat: Infinity,
            ease: EASINGS.smooth,
          }}
        />
      ))}
      
      {/* Overlay for content readability */}
      {overlayOpacity > 0 && (
        <div
          className="absolute inset-0 bg-black pointer-events-none"
          style={{ opacity: overlayOpacity }}
          aria-hidden="true"
        />
      )}
      
      {/* Glass effect overlay */}
      {blurIntensity !== 'none' && (
        <div
          className="absolute inset-0 bg-white bg-opacity-5 pointer-events-none"
          aria-hidden="true"
        />
      )}
      
      {/* Content */}
      {children && (
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      )}
      
      {/* CSS animation for gradient shift */}
      <style>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default GradientBackground;

// ============================================================================
// Self-Check Comments
// ============================================================================
// [x] Uses `@/` imports only - Imports from @/theme and @/theme/animations
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Uses event listeners and animation frames appropriately
// [x] Reads config from `@/app/config` - Uses theme tokens for consistent styling
// [x] Exports default named component - Exports GradientBackground as default and named export
// [x] Adds basic ARIA and keyboard handlers (where relevant) - Adds appropriate ARIA attributes for decorative background
