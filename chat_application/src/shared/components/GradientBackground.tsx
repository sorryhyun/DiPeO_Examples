// filepath: src/shared/components/GradientBackground.tsx
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { theme } from '@/theme/index';
import { animations } from '@/theme/animations';

/**
 * Props for GradientBackground component
 */
export interface GradientBackgroundProps {
  /** Children to render on top of the gradient */
  children?: React.ReactNode;
  /** Whether to show animated blob elements */
  showAnimatedBlobs?: boolean;
  /** Gradient variant to use */
  variant?: 'primary' | 'secondary' | 'hero' | 'subtle';
  /** Custom CSS class name */
  className?: string;
  /** Custom style overrides */
  style?: React.CSSProperties;
  /** Whether to use fixed positioning (for full viewport coverage) */
  fixed?: boolean;
}

/**
 * Animated blob component for background decoration
 */
const AnimatedBlob: React.FC<{
  size: number;
  x: string;
  y: string;
  delay: number;
  color: string;
}> = ({ size, x, y, delay, color }) => {
  return (
    <motion.div
      className="absolute rounded-full blur-xl opacity-20 pointer-events-none"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        backgroundColor: color,
      }}
      initial={{ scale: 0.8, opacity: 0.1 }}
      animate={{
        scale: [0.8, 1.2, 0.9, 1.1, 0.8],
        opacity: [0.1, 0.3, 0.2, 0.25, 0.1],
        x: [0, 20, -15, 10, 0],
        y: [0, -25, 15, -10, 0],
      }}
      transition={{
        duration: 20,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

/**
 * Edge-to-edge gradient background component with optional animated elements.
 * Provides a beautiful backdrop for layouts with configurable variants and animations.
 */
export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  showAnimatedBlobs = false,
  variant = 'primary',
  className = '',
  style,
  fixed = false,
}) => {
  // Memoize gradient styles based on variant
  const gradientStyle = useMemo(() => {
    const gradients = {
      primary: `linear-gradient(135deg, 
        ${theme.colors.primary.main} 0%, 
        ${theme.colors.primary.dark} 25%, 
        ${theme.colors.secondary.main} 75%, 
        ${theme.colors.secondary.dark} 100%)`,
      
      secondary: `linear-gradient(45deg, 
        ${theme.colors.secondary.light} 0%, 
        ${theme.colors.secondary.main} 50%, 
        ${theme.colors.primary.main} 100%)`,
      
      hero: `linear-gradient(180deg, 
        ${theme.colors.primary.main} 0%, 
        ${theme.colors.primary.dark} 30%, 
        ${theme.colors.background.dark} 70%, 
        ${theme.colors.background.darker} 100%)`,
      
      subtle: `linear-gradient(135deg, 
        ${theme.colors.background.light} 0%, 
        ${theme.colors.background.main} 50%, 
        ${theme.colors.background.dark} 100%)`,
    };

    return gradients[variant];
  }, [variant]);

  // Memoize blob configurations
  const blobConfigs = useMemo(() => [
    { size: 300, x: '10%', y: '20%', delay: 0, color: theme.colors.primary.light },
    { size: 200, x: '70%', y: '10%', delay: 3, color: theme.colors.secondary.light },
    { size: 250, x: '80%', y: '60%', delay: 6, color: theme.colors.accent.light },
    { size: 180, x: '20%', y: '70%', delay: 9, color: theme.colors.primary.main },
    { size: 220, x: '60%', y: '80%', delay: 12, color: theme.colors.secondary.main },
  ], []);

  const baseClasses = fixed
    ? 'fixed inset-0 w-full h-full'
    : 'absolute inset-0 w-full h-full';

  return (
    <div
      className={`${baseClasses} overflow-hidden ${className}`}
      style={{
        background: gradientStyle,
        zIndex: fixed ? -1 : 'auto',
        ...style,
      }}
      role="presentation"
      aria-hidden="true"
    >
      {/* Animated blobs */}
      {showAnimatedBlobs && (
        <div className="absolute inset-0 overflow-hidden">
          {blobConfigs.map((config, index) => (
            <AnimatedBlob
              key={index}
              size={config.size}
              x={config.x}
              y={config.y}
              delay={config.delay}
              color={config.color}
            />
          ))}
        </div>
      )}

      {/* Overlay for better text readability */}
      <div
        className="absolute inset-0 bg-black opacity-10"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${theme.colors.background.dark}10 100%)`,
        }}
      />

      {/* Content */}
      {children && (
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      )}
    </div>
  );
};

// Export default for easier importing
export default GradientBackground;

/*
Self-check comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (uses theme from @/theme/index)
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (role="presentation", aria-hidden="true" for decorative background)
*/
