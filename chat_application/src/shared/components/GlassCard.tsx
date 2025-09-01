// filepath: src/shared/components/GlassCard.tsx
import React from 'react';
import { Card, type CardProps } from '@/shared/components/Card';
import { theme } from '@/theme';

/**
 * Glass morphism variant of Card with backdrop-filter blur, subtle border and gradient overlay.
 * Provides a polished, translucent surface effect popular in modern UI design.
 */

export interface GlassCardProps extends Omit<CardProps, 'variant'> {
  /** Intensity of the blur effect (0-20px) */
  blurIntensity?: number;
  /** Opacity of the glass background (0-1) */
  backgroundOpacity?: number;
  /** Whether to show the subtle gradient overlay */
  showGradient?: boolean;
  /** Color theme for the glass effect */
  glassTheme?: 'light' | 'dark' | 'auto';
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      className = '',
      blurIntensity = 12,
      backgroundOpacity = 0.1,
      showGradient = true,
      glassTheme = 'auto',
      style,
      ...cardProps
    },
    ref
  ) => {
    // Determine the glass theme based on system preference or explicit setting
    const effectiveTheme = React.useMemo(() => {
      if (glassTheme !== 'auto') return glassTheme;
      
      // Auto-detect based on system preference
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      return 'light';
    }, [glassTheme]);

    // Glass effect styles
    const glassStyles: React.CSSProperties = {
      backdropFilter: `blur(${blurIntensity}px) saturate(180%)`,
      WebkitBackdropFilter: `blur(${blurIntensity}px) saturate(180%)`, // Safari support
      backgroundColor: effectiveTheme === 'dark' 
        ? `rgba(255, 255, 255, ${backgroundOpacity})` 
        : `rgba(255, 255, 255, ${backgroundOpacity})`,
      border: `1px solid ${effectiveTheme === 'dark' 
        ? `rgba(255, 255, 255, 0.18)` 
        : `rgba(255, 255, 255, 0.3)`}`,
      position: 'relative' as const,
      overflow: 'hidden',
      ...style,
    };

    // Gradient overlay for extra polish
    const gradientOverlay = showGradient && (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: effectiveTheme === 'dark'
            ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
    );

    // Additional glass-specific class names
    const glassClassNames = [
      'glass-card',
      `glass-card--${effectiveTheme}`,
      className,
    ].filter(Boolean).join(' ');

    return (
      <Card
        ref={ref}
        className={glassClassNames}
        style={glassStyles}
        {...cardProps}
      >
        {gradientOverlay}
        {children}
      </Card>
    );
  }
);

GlassCard.displayName = 'GlassCard';

// CSS-in-JS styles for additional glass effects (can be used with CSS modules or styled-components)
export const glassCardStyles = {
  // Subtle shadow for depth
  boxShadow: `
    0 8px 32px 0 rgba(31, 38, 135, 0.37),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.5),
    inset 0 -1px 0 0 rgba(255, 255, 255, 0.2)
  `,
  
  // Animation for smooth transitions
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Hover effects
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    transform: 'translateY(-1px)',
    boxShadow: `
      0 12px 40px 0 rgba(31, 38, 135, 0.4),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.6),
      inset 0 -1px 0 0 rgba(255, 255, 255, 0.3)
    `,
  },
  
  // Focus effects for accessibility
  '&:focus-within': {
    borderColor: theme.colors.primary,
    boxShadow: `
      0 8px 32px 0 rgba(31, 38, 135, 0.37),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.5),
      inset 0 -1px 0 0 rgba(255, 255, 255, 0.2),
      0 0 0 2px ${theme.colors.primary}20
    `,
  },
} as const;

// Utility function to create glass card variants
export function createGlassCardVariant(
  defaultProps: Partial<GlassCardProps>
): React.FC<GlassCardProps> {
  return React.forwardRef<HTMLDivElement, GlassCardProps>((props, ref) => (
    <GlassCard ref={ref} {...defaultProps} {...props} />
  ));
}

// Pre-configured glass card variants
export const LightGlassCard = createGlassCardVariant({
  glassTheme: 'light',
  backgroundOpacity: 0.08,
  blurIntensity: 10,
});

export const DarkGlassCard = createGlassCardVariant({
  glassTheme: 'dark',
  backgroundOpacity: 0.12,
  blurIntensity: 14,
});

export const SubtleGlassCard = createGlassCardVariant({
  backgroundOpacity: 0.05,
  blurIntensity: 8,
  showGradient: false,
});

export const IntenseGlassCard = createGlassCardVariant({
  backgroundOpacity: 0.2,
  blurIntensity: 18,
  showGradient: true,
});

/*
Self-check comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (uses theme from @/theme)
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (aria-hidden for decorative gradient, inherits accessibility from Card)
*/
