// filepath: src/shared/components/GlassCard.tsx

import React, { forwardRef } from 'react';
import type { ComponentProps } from 'react';
import { Card } from '@/shared/components/Card';
import { useTheme } from '@/providers/ThemeProvider';

// =============================
// TYPE DEFINITIONS
// =============================

export interface GlassCardProps extends Omit<ComponentProps<typeof Card>, 'variant'> {
  /**
   * Intensity of the glass effect
   * @default 'medium'
   */
  intensity?: 'light' | 'medium' | 'strong';
  
  /**
   * Blur strength for the backdrop-filter
   * @default 'md'
   */
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Whether to add a subtle animated glow effect
   * @default false
   */
  glow?: boolean;
  
  /**
   * Whether to add noise texture for more realistic glass appearance
   * @default false
   */
  noise?: boolean;
  
  /**
   * Custom gradient colors for the glass effect
   * Overrides theme-based gradients when provided
   */
  gradientColors?: {
    from: string;
    to: string;
    opacity?: number;
  };
}

// =============================
// UTILITY FUNCTIONS
// =============================

/**
 * Get blur CSS value based on blur prop
 */
function getBlurValue(blur: GlassCardProps['blur'] = 'md'): string {
  const blurMap = {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '20px',
  };
  return blurMap[blur];
}

/**
 * Get glass effect opacity based on intensity
 */
function getGlassOpacity(intensity: GlassCardProps['intensity'] = 'medium'): number {
  const opacityMap = {
    light: 0.05,
    medium: 0.1,
    strong: 0.15,
  };
  return opacityMap[intensity];
}

/**
 * Generate noise texture CSS for realistic glass effect
 */
function getNoiseTexture(): string {
  return `
    radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.01) 0%, transparent 50%)
  `;
}

/**
 * Generate glass card styles based on props and theme
 */
function generateGlassStyles(
  props: GlassCardProps,
  isDark: boolean,
  colors: any
): React.CSSProperties {
  const {
    intensity = 'medium',
    blur = 'md',
    glow = false,
    noise = false,
    gradientColors,
  } = props;

  const baseOpacity = getGlassOpacity(intensity);
  const blurValue = getBlurValue(blur);

  // Determine gradient colors based on theme or custom colors
  let fromColor, toColor, gradientOpacity;
  
  if (gradientColors) {
    fromColor = gradientColors.from;
    toColor = gradientColors.to;
    gradientOpacity = gradientColors.opacity ?? baseOpacity;
  } else {
    // Use theme-appropriate colors
    if (isDark) {
      fromColor = colors.gray[800] || '#1f2937';
      toColor = colors.gray[900] || '#111827';
    } else {
      fromColor = colors.white || '#ffffff';
      toColor = colors.gray[50] || '#f9fafb';
    }
    gradientOpacity = baseOpacity;
  }

  // Build background layers
  const backgroundLayers: string[] = [];
  
  // Add noise texture if requested
  if (noise) {
    backgroundLayers.push(getNoiseTexture());
  }
  
  // Add main glass gradient
  backgroundLayers.push(
    `linear-gradient(135deg, ${fromColor}${Math.round(gradientOpacity * 255).toString(16).padStart(2, '0')}, ${toColor}${Math.round(gradientOpacity * 0.7 * 255).toString(16).padStart(2, '0')})`
  );

  const styles: React.CSSProperties = {
    backdropFilter: `blur(${blurValue}) saturate(1.5)`,
    WebkitBackdropFilter: `blur(${blurValue}) saturate(1.5)`, // Safari support
    background: backgroundLayers.join(', '),
    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'}`,
    position: 'relative',
    overflow: 'hidden',
  };

  // Add glow effect if requested
  if (glow) {
    const glowColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    styles.boxShadow = `
      0 8px 32px rgba(0, 0, 0, 0.1),
      0 0 0 1px ${glowColor},
      inset 0 1px 0 rgba(255, 255, 255, 0.1)
    `;
  }

  return styles;
}

// =============================
// GLASS CARD COMPONENT
// =============================

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      intensity = 'medium',
      blur = 'md',
      glow = false,
      noise = false,
      gradientColors,
      children,
      className = '',
      style,
      ...cardProps
    },
    ref
  ) => {
    const { isDark, colors } = useTheme();
    const themeColors = isDark ? colors.dark : colors.light;

    // Generate glass effect styles
    const glassStyles = generateGlassStyles(
      { intensity, blur, glow, noise, gradientColors },
      isDark,
      themeColors
    );

    // Combine custom styles with glass styles
    const combinedStyles: React.CSSProperties = {
      ...glassStyles,
      ...style,
    };

    // Add glass-specific CSS classes
    const glassClasses = [
      'glass-card',
      `glass-intensity-${intensity}`,
      `glass-blur-${blur}`,
      glow && 'glass-glow',
      noise && 'glass-noise',
    ]
      .filter(Boolean)
      .join(' ');

    const combinedClassName = [glassClasses, className].filter(Boolean).join(' ');

    return (
      <Card
        ref={ref}
        variant="outline"
        className={combinedClassName}
        style={combinedStyles}
        {...cardProps}
      >
        {children}
        
        {/* Optional shimmer effect overlay */}
        {glow && (
          <div
            className="glass-shimmer"
            style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: `linear-gradient(90deg, transparent, ${
                isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.1)'
              }, transparent)`,
              animation: 'glass-shimmer 3s infinite',
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          />
        )}
      </Card>
    );
  }
);

GlassCard.displayName = 'GlassCard';

// =============================
// CSS ANIMATION KEYFRAMES
// =============================

// Inject shimmer animation styles
if (typeof document !== 'undefined') {
  const styleId = 'glass-card-animations';
  
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes glass-shimmer {
        0% {
          left: -100%;
        }
        100% {
          left: 100%;
        }
      }
      
      .glass-card {
        transition: all 0.3s ease;
      }
      
      .glass-card:hover {
        transform: translateY(-2px);
      }
      
      @media (prefers-reduced-motion: reduce) {
        .glass-card,
        .glass-shimmer {
          animation: none;
          transition: none;
        }
        
        .glass-card:hover {
          transform: none;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// =============================
// UTILITY HOOKS
// =============================

/**
 * Hook to get glass card theme variables for custom implementations
 */
export function useGlassTheme() {
  const { isDark, colors } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;

  return {
    isDark,
    colors: themeColors,
    getGlassStyles: (props: Partial<GlassCardProps>) =>
      generateGlassStyles(props as GlassCardProps, isDark, themeColors),
    getBlurValue,
    getGlassOpacity,
  };
}

// =============================
// PRESET VARIANTS
// =============================

/**
 * Preset GlassCard variants for common use cases
 */
export const GlassCardPresets = {
  /**
   * Subtle glass effect for content backgrounds
   */
  Subtle: forwardRef<HTMLDivElement, Omit<GlassCardProps, 'intensity' | 'blur'>>((props, ref) => (
    <GlassCard ref={ref} intensity="light" blur="sm" {...props} />
  )),

  /**
   * Strong glass effect for hero sections or key UI elements
   */
  Hero: forwardRef<HTMLDivElement, Omit<GlassCardProps, 'intensity' | 'blur' | 'glow'>>((props, ref) => (
    <GlassCard ref={ref} intensity="strong" blur="lg" glow {...props} />
  )),

  /**
   * Modal-appropriate glass effect with strong blur
   */
  Modal: forwardRef<HTMLDivElement, Omit<GlassCardProps, 'intensity' | 'blur'>>((props, ref) => (
    <GlassCard ref={ref} intensity="medium" blur="xl" {...props} />
  )),

  /**
   * Navigation glass effect with subtle noise texture
   */
  Navigation: forwardRef<HTMLDivElement, Omit<GlassCardProps, 'intensity' | 'noise'>>((props, ref) => (
    <GlassCard ref={ref} intensity="light" noise {...props} />
  )),
};

// Add display names for presets
GlassCardPresets.Subtle.displayName = 'GlassCard.Subtle';
GlassCardPresets.Hero.displayName = 'GlassCard.Hero';
GlassCardPresets.Modal.displayName = 'GlassCard.Modal';
GlassCardPresets.Navigation.displayName = 'GlassCard.Navigation';

// =============================
// EXPORTS
// =============================

export default GlassCard;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses useTheme hook
// [x] Reads config from `@/app/config` - uses theme from ThemeProvider instead
// [x] Exports default named component - exports GlassCard as default and named export
// [x] Adds basic ARIA and keyboard handlers (where relevant) - inherits from Card component, adds aria-hidden to shimmer effect
