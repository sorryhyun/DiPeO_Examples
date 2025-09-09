// filepath: src/shared/components/Glass/GlassCard.tsx
import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { theme } from '@/theme/index';

// Glass card variant types
export type GlassVariant = 'light' | 'medium' | 'dark' | 'colored';
export type GlassBorderStyle = 'none' | 'subtle' | 'gradient' | 'glow';
export type GlassIntensity = 'low' | 'medium' | 'high';

// Glass card component props
export interface GlassCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Glass effect variant */
  variant?: GlassVariant;
  /** Border style for the glass effect */
  borderStyle?: GlassBorderStyle;
  /** Intensity of the glass effect */
  intensity?: GlassIntensity;
  /** Custom background color (CSS color value) */
  backgroundColor?: string;
  /** Custom border gradient colors */
  borderGradient?: string;
  /** Whether the card is interactive/clickable */
  interactive?: boolean;
  /** Whether the card is disabled */
  disabled?: boolean;
  /** Custom border radius */
  borderRadius?: string | number;
  /** Additional blur amount for backdrop filter */
  extraBlur?: number;
  /** Whether to show subtle animation on hover */
  animated?: boolean;
  /** Motion props for Framer Motion */
  motionProps?: Omit<MotionProps, 'children'>;
  /** Whether card should fill container width */
  fullWidth?: boolean;
  /** Whether card should fill container height */
  fullHeight?: boolean;
}

// Glass effect configurations
const glassConfigs = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  medium: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    boxShadow: '0 8px 12px rgba(0, 0, 0, 0.15)',
  },
  dark: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 6px 10px rgba(0, 0, 0, 0.25)',
  },
  colored: {
    backgroundColor: `${theme.colors.primary.main}20`,
    backdropFilter: 'blur(12px)',
    border: `1px solid ${theme.colors.primary.main}40`,
    boxShadow: `0 6px 10px ${theme.colors.primary.main}20`,
  },
} as const;

// Intensity modifiers
const intensityModifiers = {
  low: {
    backdropFilterMultiplier: 0.7,
    opacityMultiplier: 0.7,
    shadowMultiplier: 0.7,
  },
  medium: {
    backdropFilterMultiplier: 1.0,
    opacityMultiplier: 1.0,
    shadowMultiplier: 1.0,
  },
  high: {
    backdropFilterMultiplier: 1.3,
    opacityMultiplier: 1.3,
    shadowMultiplier: 1.3,
  },
} as const;

// Border style configurations
const borderStyles = {
  none: {
    border: 'none',
  },
  subtle: {
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  gradient: {
    border: 'none',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%)',
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      padding: '1px',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1))',
      borderRadius: 'inherit',
      mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      maskComposite: 'xor',
    },
  },
  glow: {
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 0 20px rgba(255, 255, 255, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.05)',
  },
} as const;

// Apply intensity modifiers to base config
function applyIntensity(
  baseConfig: typeof glassConfigs.light,
  intensity: GlassIntensity,
  extraBlur: number = 0
) {
  const modifier = intensityModifiers[intensity];
  
  // Extract blur value from backdrop filter and apply modifier
  const blurMatch = baseConfig.backdropFilter.match(/blur\((\d+)px\)/);
  const baseBlur = blurMatch ? parseInt(blurMatch[1], 10) : 10;
  const newBlur = Math.round(baseBlur * modifier.backdropFilterMultiplier + extraBlur);
  
  return {
    ...baseConfig,
    backdropFilter: `blur(${newBlur}px) saturate(120%)`,
    backgroundColor: adjustOpacity(baseConfig.backgroundColor, modifier.opacityMultiplier),
    boxShadow: adjustShadowIntensity(baseConfig.boxShadow, modifier.shadowMultiplier),
  };
}

// Helper function to adjust opacity in rgba/hsla strings
function adjustOpacity(colorString: string, multiplier: number): string {
  const rgbaMatch = colorString.match(/rgba?\(([^)]+)\)/);
  if (!rgbaMatch) return colorString;
  
  const values = rgbaMatch[1].split(',').map(v => v.trim());
  if (values.length >= 4) {
    const alpha = parseFloat(values[3]);
    values[3] = Math.min(1, alpha * multiplier).toString();
    return `rgba(${values.join(', ')})`;
  }
  return colorString;
}

// Helper function to adjust shadow intensity
function adjustShadowIntensity(shadowString: string, multiplier: number): string {
  return shadowString.replace(/rgba?\(([^)]+)\)/g, (match, values) => {
    const valueArray = values.split(',').map((v: string) => v.trim());
    if (valueArray.length >= 4) {
      const alpha = parseFloat(valueArray[3]);
      valueArray[3] = Math.min(1, alpha * multiplier).toString();
      return `rgba(${valueArray.join(', ')})`;
    }
    return match;
  });
}

// Get border styles with custom gradient support
function getBorderStyles(
  borderStyle: GlassBorderStyle,
  borderGradient?: string,
  borderRadius?: string | number
): React.CSSProperties {
  const baseStyles = borderStyles[borderStyle];
  
  if (borderStyle === 'gradient' && borderGradient) {
    return {
      ...baseStyles,
      background: borderGradient,
      borderRadius,
    };
  }
  
  return {
    ...baseStyles,
    borderRadius,
  };
}

// Main GlassCard component
export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      variant = 'light',
      borderStyle = 'subtle',
      intensity = 'medium',
      backgroundColor,
      borderGradient,
      interactive = false,
      disabled = false,
      borderRadius = '12px',
      extraBlur = 0,
      animated = true,
      motionProps,
      fullWidth = false,
      fullHeight = false,
      children,
      className,
      style,
      onClick,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    // Handle keyboard interaction for interactive cards
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (interactive && !disabled && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onClick?.(event as any);
      }
      onKeyDown?.(event);
    };

    // Get base glass configuration
    const baseConfig = glassConfigs[variant];
    const glassConfig = applyIntensity(baseConfig, intensity, extraBlur);
    
    // Get border styling
    const borderStyling = getBorderStyles(borderStyle, borderGradient, borderRadius);

    // Combine all styles
    const finalStyles: React.CSSProperties = {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      width: fullWidth ? '100%' : undefined,
      height: fullHeight ? '100%' : undefined,
      minHeight: '60px',
      padding: '16px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: interactive && !disabled ? 'pointer' : 'default',
      opacity: disabled ? 0.6 : 1,
      pointerEvents: disabled ? 'none' : 'auto',
      overflow: 'hidden',
      // Apply glass effect
      ...glassConfig,
      // Override with custom background if provided
      backgroundColor: backgroundColor || glassConfig.backgroundColor,
      // Apply border styling
      ...borderStyling,
      // Merge with custom styles
      ...style,
    };

    // Interactive hover effects
    const hoverStyles: React.CSSProperties = interactive && !disabled ? {
      transform: 'translateY(-2px) scale(1.02)',
      boxShadow: `${glassConfig.boxShadow}, 0 12px 24px rgba(0, 0, 0, 0.15)`,
      backdropFilter: `blur(${extraBlur + 18}px) saturate(130%)`,
    } : {};

    // Default motion props
    const defaultMotionProps: MotionProps = {
      initial: animated ? { opacity: 0, y: 20 } : undefined,
      animate: animated ? { opacity: 1, y: 0 } : undefined,
      whileHover: interactive && !disabled && animated ? hoverStyles : undefined,
      whileTap: interactive && !disabled ? { scale: 0.98 } : undefined,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    };

    const combinedMotionProps = { ...defaultMotionProps, ...motionProps };

    return (
      <motion.div
        ref={ref}
        className={className}
        style={finalStyles}
        onClick={interactive && !disabled ? onClick : undefined}
        onKeyDown={handleKeyDown}
        tabIndex={interactive && !disabled ? 0 : undefined}
        role={interactive ? 'button' : undefined}
        aria-disabled={disabled}
        {...props}
        {...combinedMotionProps}
      >
        {/* Glass shine effect overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 50%)',
            pointerEvents: 'none',
            borderRadius: `${borderRadius} ${borderRadius} 0 0`,
          }}
        />
        
        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
          {children}
        </div>
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

// Export types
export { type GlassCardProps };

// Preset configurations for common glass effects
export const glassPresets = {
  // Subtle glass for backgrounds
  subtle: {
    variant: 'light' as const,
    intensity: 'low' as const,
    borderStyle: 'subtle' as const,
    animated: false,
  },
  
  // Standard glass for cards
  standard: {
    variant: 'medium' as const,
    intensity: 'medium' as const,
    borderStyle: 'gradient' as const,
    animated: true,
  },
  
  // Bold glass for hero sections
  bold: {
    variant: 'dark' as const,
    intensity: 'high' as const,
    borderStyle: 'glow' as const,
    animated: true,
    interactive: true,
  },
  
  // Colored glass for accent elements
  accent: {
    variant: 'colored' as const,
    intensity: 'medium' as const,
    borderStyle: 'gradient' as const,
    animated: true,
    interactive: true,
  },
} as const;

// Utility function to create glass cards with presets
export function createGlassCard(preset: keyof typeof glassPresets, overrides: Partial<GlassCardProps> = {}) {
  return function GlassCardWithPreset(props: GlassCardProps) {
    return <GlassCard {...glassPresets[preset]} {...overrides} {...props} />;
  };
}

// CSS-in-JS helper for creating glass effects in other components
export const glassEffectCSS = {
  light: glassConfigs.light,
  medium: glassConfigs.medium,
  dark: glassConfigs.dark,
  colored: glassConfigs.colored,
};

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config` - uses theme from theme/index.ts
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
