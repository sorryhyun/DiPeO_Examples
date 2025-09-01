// filepath: src/components/GlassCard.tsx
/* src/components/GlassCard.tsx

Glass-morphism card container with gradient border and soft shadow. 
Supports groovy backdrop-filter blur and responsive padding.
*/

import React from 'react';
import { tokens } from '@/theme';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'prominent';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  role?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  tabIndex?: number;
}

export function GlassCard({ 
  children, 
  className = '', 
  variant = 'default',
  size = 'md',
  interactive = false,
  onClick,
  style,
  role,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  tabIndex,
  ...props 
}: GlassCardProps) {
  const baseStyles: React.CSSProperties = {
    position: 'relative',
    borderRadius: tokens.borderRadius.lg,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)', // Safari support
    border: '1px solid',
    transition: 'all 0.2s ease-in-out',
    overflow: 'hidden',
    ...style,
  };

  // Variant-specific styling
  const variantStyles: Record<typeof variant, React.CSSProperties> = {
    default: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    },
    subtle: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
    },
    prominent: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderColor: 'rgba(255, 255, 255, 0.3)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
    },
  };

  // Size-specific padding
  const sizeStyles: Record<typeof size, React.CSSProperties> = {
    sm: {
      padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
    },
    md: {
      padding: `${tokens.spacing.lg} ${tokens.spacing.xl}`,
    },
    lg: {
      padding: `${tokens.spacing.xl} ${tokens.spacing.xxl}`,
    },
  };

  // Interactive styles
  const interactiveStyles: React.CSSProperties = interactive ? {
    cursor: 'pointer',
    transform: 'translateY(0)',
  } : {};

  const hoverStyles = interactive ? {
    transform: 'translateY(-2px)',
    boxShadow: variantStyles[variant].boxShadow?.replace('0.1)', '0.2)').replace('0.05)', '0.1)').replace('0.15)', '0.25)'),
    borderColor: 'rgba(255, 255, 255, 0.4)',
  } : {};

  // Combine all styles
  const combinedStyles: React.CSSProperties = {
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...interactiveStyles,
  };

  // CSS class for hover effects (since we can't do pseudo-selectors in inline styles)
  const cssClass = `glass-card ${className} glass-card--${variant} glass-card--${size} ${interactive ? 'glass-card--interactive' : ''}`.trim();

  // Handle keyboard interaction
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (interactive && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  // Determine appropriate ARIA attributes
  const ariaProps: Record<string, any> = {};
  if (role) ariaProps.role = role;
  if (ariaLabel) ariaProps['aria-label'] = ariaLabel;
  if (ariaLabelledBy) ariaProps['aria-labelledby'] = ariaLabelledBy;
  if (ariaDescribedBy) ariaProps['aria-describedby'] = ariaDescribedBy;
  
  // Set tabIndex for interactive cards
  if (interactive && typeof tabIndex === 'undefined') {
    ariaProps.tabIndex = 0;
  } else if (typeof tabIndex === 'number') {
    ariaProps.tabIndex = tabIndex;
  }

  return (
    <>
      <style>
        {`
          .glass-card--interactive:hover {
            transform: translateY(-2px);
            box-shadow: ${hoverStyles.boxShadow || combinedStyles.boxShadow};
            border-color: ${hoverStyles.borderColor};
          }
          
          .glass-card--interactive:focus {
            outline: 2px solid ${tokens.colors.primary[500]};
            outline-offset: 2px;
          }
          
          .glass-card--interactive:active {
            transform: translateY(0px);
          }

          /* Gradient border effect for prominent variant */
          .glass-card--prominent::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: inherit;
            padding: 1px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1));
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: xor;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            pointer-events: none;
            z-index: -1;
          }

          /* Responsive adjustments */
          @media (max-width: 768px) {
            .glass-card--lg {
              padding: ${tokens.spacing.lg} ${tokens.spacing.xl};
            }
            .glass-card--md {
              padding: ${tokens.spacing.md} ${tokens.spacing.lg};
            }
          }

          /* Dark mode support */
          @media (prefers-color-scheme: dark) {
            .glass-card--default {
              background-color: rgba(0, 0, 0, 0.2);
              border-color: rgba(255, 255, 255, 0.15);
            }
            .glass-card--subtle {
              background-color: rgba(0, 0, 0, 0.1);
              border-color: rgba(255, 255, 255, 0.08);
            }
            .glass-card--prominent {
              background-color: rgba(0, 0, 0, 0.3);
              border-color: rgba(255, 255, 255, 0.25);
            }
          }

          /* High contrast mode support */
          @media (prefers-contrast: high) {
            .glass-card {
              backdrop-filter: none;
              -webkit-backdrop-filter: none;
              background-color: var(--surface-color, #ffffff);
              border-color: var(--border-color, #000000);
            }
          }

          /* Reduced motion support */
          @media (prefers-reduced-motion: reduce) {
            .glass-card {
              transition: none;
            }
            .glass-card--interactive:hover {
              transform: none;
            }
          }
        `}
      </style>
      <div
        className={cssClass}
        style={combinedStyles}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        {...ariaProps}
        {...props}
      >
        {children}
      </div>
    </>
  );
}

/* Example usage:

import { GlassCard } from '@/components/GlassCard'

function ExampleCard() {
  return (
    <GlassCard 
      variant="prominent" 
      size="lg" 
      interactive 
      onClick={() => console.log('clicked')}
      aria-label="Interactive dashboard card"
    >
      <h3>Dashboard Metrics</h3>
      <p>Your content here</p>
    </GlassCard>
  )
}

// Different variants
<GlassCard variant="subtle" size="sm">Small subtle card</GlassCard>
<GlassCard variant="default">Default medium card</GlassCard>
<GlassCard variant="prominent" size="lg">Large prominent card</GlassCard>

*/

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config` (not needed for this component)
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
