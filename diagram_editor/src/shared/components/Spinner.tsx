// filepath: src/shared/components/Spinner.tsx

import React from 'react';
import { useTheme } from '@/hooks/useTheme';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'accent' | 'white' | 'current';
  className?: string;
  'aria-label'?: string;
}

const sizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export function Spinner({ 
  size = 'md', 
  variant = 'primary', 
  className = '',
  'aria-label': ariaLabel = 'Loading...',
}: SpinnerProps) {
  const { theme } = useTheme();
  const dimension = sizeMap[size];

  // Color mapping based on theme and variant
  const getColor = (): string => {
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'accent':
        return theme.colors.accent;
      case 'white':
        return '#ffffff';
      case 'current':
        return 'currentColor';
      default:
        return theme.colors.primary;
    }
  };

  const color = getColor();

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  return (
    <div
      className={`inline-block ${className}`}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          animation: prefersReducedMotion 
            ? 'none' 
            : 'spin 1s linear infinite',
        }}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="2"
          strokeOpacity="0.2"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      
      <span className="sr-only">{ariaLabel}</span>
      
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
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

// Alternative dot-based spinner for variety
export function DotSpinner({
  size = 'md',
  variant = 'primary',
  className = '',
  'aria-label': ariaLabel = 'Loading...',
}: SpinnerProps) {
  const { theme } = useTheme();
  const dimension = sizeMap[size];

  const getColor = (): string => {
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'accent':
        return theme.colors.accent;
      case 'white':
        return '#ffffff';
      case 'current':
        return 'currentColor';
      default:
        return theme.colors.primary;
    }
  };

  const color = getColor();
  const dotSize = Math.max(2, dimension / 8);
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
      style={{ width: dimension, height: dimension }}
    >
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          style={{
            width: dotSize,
            height: dotSize,
            backgroundColor: color,
            borderRadius: '50%',
            margin: `0 ${dotSize / 2}px`,
            animation: prefersReducedMotion
              ? 'none'
              : `dotBounce 1.4s ease-in-out ${index * 0.16}s infinite both`,
          }}
        />
      ))}
      
      <span className="sr-only">{ariaLabel}</span>
      
      <style jsx>{`
        @keyframes dotBounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
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

// Pulse spinner for loading states that need more subtlety
export function PulseSpinner({
  size = 'md',
  variant = 'primary',
  className = '',
  'aria-label': ariaLabel = 'Loading...',
}: SpinnerProps) {
  const { theme } = useTheme();
  const dimension = sizeMap[size];

  const getColor = (): string => {
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'accent':
        return theme.colors.accent;
      case 'white':
        return '#ffffff';
      case 'current':
        return 'currentColor';
      default:
        return theme.colors.primary;
    }
  };

  const color = getColor();
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  return (
    <div
      className={`inline-block ${className}`}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      <div
        style={{
          width: dimension,
          height: dimension,
          backgroundColor: color,
          borderRadius: '50%',
          opacity: prefersReducedMotion ? 0.7 : undefined,
          animation: prefersReducedMotion
            ? 'none'
            : 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      />
      
      <span className="sr-only">{ariaLabel}</span>
      
      <style jsx>{`
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

// Main export is the default SVG spinner
export default Spinner;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses useTheme hook
// [x] Reads config from `@/app/config` - not needed for spinner component
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant) - includes proper ARIA attributes
