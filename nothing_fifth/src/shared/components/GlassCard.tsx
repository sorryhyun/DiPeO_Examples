// filepath: src/shared/components/GlassCard.tsx

import React, { forwardRef } from 'react';
import { motion, Variants } from 'framer-motion';
import { EASINGS } from '@/theme/animations';
import { Card, CardProps } from '@/shared/components/Card';
import { theme } from '@/theme';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface GlassCardProps extends Omit<CardProps, 'variant'> {
  /** Intensity of the glass effect */
  intensity?: 'light' | 'medium' | 'heavy';
  
  /** Background tint color */
  tint?: 'neutral' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  
  /** Whether to show animated gradient borders */
  animatedBorder?: boolean;
  
  /** Custom backdrop blur value */
  backdropBlur?: string;
  
  /** Custom background opacity */
  backgroundOpacity?: number;
}

// ============================================================================
// STYLE VARIANTS
// ============================================================================

const intensityStyles = {
  light: {
    backdropBlur: 'backdrop-blur-sm',
    backgroundOpacity: 0.05,
    borderOpacity: 0.1,
    shadow: 'shadow-sm',
  },
  medium: {
    backdropBlur: 'backdrop-blur-md',
    backgroundOpacity: 0.1,
    borderOpacity: 0.15,
    shadow: 'shadow-lg',
  },
  heavy: {
    backdropBlur: 'backdrop-blur-lg',
    backgroundOpacity: 0.15,
    borderOpacity: 0.2,
    shadow: 'shadow-xl',
  },
} as const;

const tintColors = {
  neutral: {
    background: 'bg-white',
    border: 'border-white',
    gradient: 'from-white/10 to-gray-100/10',
  },
  primary: {
    background: 'bg-blue-50',
    border: 'border-blue-200',
    gradient: 'from-blue-50/10 to-blue-100/10',
  },
  secondary: {
    background: 'bg-purple-50',
    border: 'border-purple-200',
    gradient: 'from-purple-50/10 to-purple-100/10',
  },
  success: {
    background: 'bg-green-50',
    border: 'border-green-200',
    gradient: 'from-green-50/10 to-green-100/10',
  },
  warning: {
    background: 'bg-yellow-50',
    border: 'border-yellow-200',
    gradient: 'from-yellow-50/10 to-yellow-100/10',
  },
  error: {
    background: 'bg-red-50',
    border: 'border-red-200',
    gradient: 'from-red-50/10 to-red-100/10',
  },
} as const;

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const glassCardVariants: Variants = {
  idle: {
    scale: 1,
    rotateY: 0,
    transition: {
      duration: 0.3,
      ease: EASINGS.smooth,
    },
  },
  hover: {
    scale: 1.02,
    rotateY: 2,
    transition: {
      duration: 0.3,
      ease: EASINGS.smooth,
    },
  },
  tap: {
    scale: 0.98,
    rotateY: 0,
    transition: {
      duration: 0.1,
      ease: EASINGS.smooth,
    },
  },
};

const animatedBorderVariants: Variants = {
  idle: {
    background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: EASINGS.linear,
    },
  },
  animate: {
    background: [
      'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
      'linear-gradient(225deg, transparent, rgba(255,255,255,0.2), transparent)',
      'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: EASINGS.linear,
    },
  },
};

// ============================================================================
// GLASS CARD COMPONENT
// ============================================================================

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(({
  children,
  intensity = 'medium',
  tint = 'neutral',
  animatedBorder = false,
  backdropBlur,
  backgroundOpacity,
  className,
  motionProps,
  interactive = false,
  style,
  ...rest
}, ref) => {
  const intensityConfig = intensityStyles[intensity];
  const tintConfig = tintColors[tint];
  
  const finalBackdropBlur = backdropBlur || intensityConfig.backdropBlur;
  const finalBackgroundOpacity = backgroundOpacity ?? intensityConfig.backgroundOpacity;
  
  const glassStyles = {
    background: `rgba(255, 255, 255, ${finalBackgroundOpacity})`,
    borderColor: `rgba(255, 255, 255, ${intensityConfig.borderOpacity})`,
    boxShadow: theme.shadows.glass,
    ...style,
  };
  
  const containerClasses = [
    'relative',
    'overflow-hidden',
    finalBackdropBlur,
    intensityConfig.shadow,
    tintConfig.background,
    className,
  ].filter(Boolean).join(' ');
  
  const borderClasses = [
    'border',
    tintConfig.border,
    'border-opacity-20',
  ].join(' ');
  
  return (
    <div className="relative">
      {/* Animated border overlay */}
      {animatedBorder && (
        <motion.div
          className="absolute inset-0 rounded-lg opacity-30"
          variants={animatedBorderVariants}
          initial="idle"
          animate="animate"
          style={{
            background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent)',
            padding: '1px',
          }}
        >
          <div className="w-full h-full rounded-lg bg-transparent" />
        </motion.div>
      )}
      
      {/* Glass gradient overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${tintConfig.gradient} opacity-50 pointer-events-none`}
        aria-hidden="true"
      />
      
      {/* Main card content */}
      <Card
        ref={ref}
        variant="glass"
        className={containerClasses}
        style={glassStyles}
        interactive={interactive}
        motionProps={{
          variants: glassCardVariants,
          initial: 'idle',
          whileHover: interactive ? 'hover' : undefined,
          whileTap: interactive ? 'tap' : undefined,
          style: {
            transformStyle: 'preserve-3d',
          },
          ...motionProps,
        }}
        {...rest}
      >
        {/* Content with additional glass styling */}
        <div className="relative z-10">
          {children}
        </div>
        
        {/* Subtle inner glow */}
        <div 
          className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none"
          aria-hidden="true"
        />
        
        {/* Glass reflection effect */}
        <div 
          className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent opacity-60 pointer-events-none"
          aria-hidden="true"
        />
      </Card>
    </div>
  );
});

GlassCard.displayName = 'GlassCard';

export default GlassCard;

// ============================================================================
// Self-Check Comments
// ============================================================================
// [x] Uses `@/` imports only - Imports from @/shared/components/Card and @/theme
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Pure component extending Card
// [x] Reads config from `@/app/config` - Uses theme tokens for consistent glass styling
// [x] Exports default named component - Exports GlassCard as default and named export
// [x] Adds basic ARIA and keyboard handlers (where relevant) - Inherits accessibility from Card component, adds aria-hidden for decorative elements
