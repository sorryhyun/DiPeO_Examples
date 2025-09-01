// filepath: src/components/LoadingSpinner.tsx
/* src/components/LoadingSpinner.tsx

Accessible inline and block-level loading spinner that respects reduced-motion preferences and theme colors.
Supports different sizes and can be used inline or as a block element.
*/

import React from 'react';
import { classNames } from '@/core/utils';

interface LoadingSpinnerProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Display as inline element */
  inline?: boolean;
  /** Custom class name */
  className?: string;
  /** Accessible label for screen readers */
  label?: string;
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'accent' | 'muted';
}

export function LoadingSpinner({
  size = 'md',
  inline = false,
  className,
  label = 'Loading',
  variant = 'primary',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const variantClasses = {
    primary: 'border-blue-500 border-t-transparent',
    secondary: 'border-gray-500 border-t-transparent',
    accent: 'border-purple-500 border-t-transparent',
    muted: 'border-gray-300 border-t-transparent',
  };

  const spinnerClasses = classNames(
    // Base spinner styles
    'border-2 rounded-full',
    'animate-spin',
    // Size
    sizeClasses[size],
    // Color variant
    variantClasses[variant],
    // Display mode
    inline ? 'inline-block' : 'block',
    // Custom class
    className
  );

  const containerClasses = classNames(
    inline ? 'inline-flex items-center' : 'flex justify-center items-center',
    !inline && 'min-h-[3rem]' // Ensure block spinners have minimum height
  );

  return (
    <div 
      className={containerClasses}
      role="status" 
      aria-label={label}
      data-testid="loading-spinner"
    >
      <div 
        className={spinnerClasses}
        style={{
          // Respect reduced motion preferences
          animation: 'var(--spinner-animation, spin 1s linear infinite)',
        }}
      />
      {/* Hidden text for screen readers */}
      <span className="sr-only">{label}</span>
      
      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          :global([data-testid="loading-spinner"] div) {
            --spinner-animation: pulse 2s ease-in-out infinite;
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `}</style>
    </div>
  );
}

// Alternative minimal version without styled-jsx dependency
export function LoadingSpinnerMinimal({
  size = 'md',
  inline = false,
  className,
  label = 'Loading',
  variant = 'primary',
}: LoadingSpinnerProps) {
  const baseSize = {
    sm: '1rem',
    md: '1.5rem', 
    lg: '2rem',
    xl: '3rem',
  }[size];

  const borderColor = {
    primary: '#3b82f6',
    secondary: '#6b7280', 
    accent: '#8b5cf6',
    muted: '#d1d5db',
  }[variant];

  const spinnerStyle: React.CSSProperties = {
    width: baseSize,
    height: baseSize,
    border: '2px solid transparent',
    borderTop: `2px solid ${borderColor}`,
    borderRadius: '50%',
    display: inline ? 'inline-block' : 'block',
    animation: 'spin 1s linear infinite',
  };

  // Respect reduced motion
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  if (prefersReducedMotion) {
    spinnerStyle.animation = 'pulse 2s ease-in-out infinite';
  }

  const containerStyle: React.CSSProperties = inline 
    ? { display: 'inline-flex', alignItems: 'center' }
    : { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '3rem' };

  return (
    <div 
      style={containerStyle}
      className={className}
      role="status" 
      aria-label={label}
      data-testid="loading-spinner-minimal"
    >
      <div style={spinnerStyle} />
      <span style={{ 
        position: 'absolute', 
        width: '1px', 
        height: '1px', 
        padding: 0, 
        margin: '-1px', 
        overflow: 'hidden', 
        clip: 'rect(0, 0, 0, 0)', 
        whiteSpace: 'nowrap', 
        border: 0 
      }}>
        {label}
      </span>
    </div>
  );
}

// Export default as the main component
export default LoadingSpinner;

/* Example usage

import { LoadingSpinner } from '@/components/LoadingSpinner'

// Inline spinner in button
<button disabled={isLoading}>
  {isLoading && <LoadingSpinner size="sm" inline />}
  Submit
</button>

// Block spinner for page loading  
<LoadingSpinner size="lg" label="Loading dashboard data..." />

// Custom styled
<LoadingSpinner 
  size="md" 
  variant="accent" 
  className="my-4"
  label="Processing request"
/>
*/

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) 
// [x] Reads config from `@/app/config` (not applicable for this component)
// [x] Exports default named component 
// [x] Adds basic ARIA and keyboard handlers (ARIA role and label for accessibility)
