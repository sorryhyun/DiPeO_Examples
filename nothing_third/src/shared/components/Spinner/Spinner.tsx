// filepath: src/shared/components/Spinner/Spinner.tsx
import React from 'react';
import { classNames } from '@/core/utils';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'primary' | 'secondary' | 'white' | 'current';

export interface SpinnerProps {
  /** Size of the spinner */
  size?: SpinnerSize;
  /** Visual variant/color theme */
  variant?: SpinnerVariant;
  /** Custom thickness of the spinner stroke */
  thickness?: number;
  /** Whether to show with a backdrop overlay (blocking) */
  overlay?: boolean;
  /** Custom label for screen readers */
  label?: string;
  /** Additional CSS classes */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Speed of rotation (duration in seconds) */
  speed?: number;
  /** Whether spinner should be centered within its container */
  centered?: boolean;
}

const sizeConfig = {
  xs: { size: 12, stroke: 2 },
  sm: { size: 16, stroke: 2 },
  md: { size: 24, stroke: 3 },
  lg: { size: 32, stroke: 3 },
  xl: { size: 48, stroke: 4 }
};

const variantStyles = {
  primary: 'text-primary-600',
  secondary: 'text-gray-600',
  white: 'text-white',
  current: 'text-current'
};

/**
 * Lightweight, accessible spinner component for loading states
 * Supports various sizes, colors, and can be used inline or as an overlay
 */
export function Spinner({
  size = 'md',
  variant = 'primary',
  thickness,
  overlay = false,
  label = 'Loading',
  className,
  style,
  speed = 1,
  centered = false,
  ...props
}: SpinnerProps) {
  const sizeProps = sizeConfig[size];
  const strokeWidth = thickness ?? sizeProps.stroke;
  const radius = (sizeProps.size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Calculate dash array for the spinning effect
  const dashArray = circumference;
  const dashOffset = circumference * 0.25;

  const spinnerClasses = classNames(
    'inline-block animate-spin',
    variantStyles[variant],
    {
      'absolute inset-0 m-auto': centered && !overlay
    },
    className
  );

  const overlayClasses = classNames(
    'fixed inset-0 z-50 flex items-center justify-center',
    'bg-black bg-opacity-25 backdrop-blur-sm'
  );

  const spinnerStyle: React.CSSProperties = {
    width: sizeProps.size,
    height: sizeProps.size,
    animationDuration: `${1 / speed}s`,
    ...style
  };

  const SpinnerSVG = (
    <svg
      className={spinnerClasses}
      style={spinnerStyle}
      viewBox={`0 0 ${sizeProps.size} ${sizeProps.size}`}
      xmlns="http://www.w3.org/2000/svg"
      role="status"
      aria-label={label}
      aria-live="polite"
      data-testid="spinner"
      {...props}
    >
      <circle
        cx={sizeProps.size / 2}
        cy={sizeProps.size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={dashArray}
        strokeDashoffset={dashOffset}
        opacity="0.25"
      />
      <circle
        cx={sizeProps.size / 2}
        cy={sizeProps.size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={dashArray}
        strokeDashoffset={dashOffset}
        opacity="0.75"
        transform={`rotate(-90 ${sizeProps.size / 2} ${sizeProps.size / 2})`}
        style={{
          strokeDasharray: `${circumference * 0.8} ${circumference}`,
          transformOrigin: '50% 50%'
        }}
      />
    </svg>
  );

  if (overlay) {
    return (
      <div className={overlayClasses} data-testid="spinner-overlay">
        {SpinnerSVG}
      </div>
    );
  }

  if (centered) {
    return (
      <div className="flex justify-center items-center" data-testid="spinner-centered">
        {SpinnerSVG}
      </div>
    );
  }

  return SpinnerSVG;
}

// Compound components for common patterns
export interface SpinnerWithTextProps extends Omit<SpinnerProps, 'label'> {
  /** Text to display alongside the spinner */
  text: string;
  /** Position of text relative to spinner */
  textPosition?: 'right' | 'bottom';
  /** Gap between spinner and text */
  gap?: 'sm' | 'md' | 'lg';
}

export function SpinnerWithText({
  text,
  textPosition = 'right',
  gap = 'md',
  size = 'sm',
  ...spinnerProps
}: SpinnerWithTextProps) {
  const gapSizes = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-3'
  };

  const containerClasses = classNames(
    'flex items-center',
    gapSizes[gap],
    {
      'flex-row': textPosition === 'right',
      'flex-col': textPosition === 'bottom'
    }
  );

  return (
    <div className={containerClasses} data-testid="spinner-with-text">
      <Spinner size={size} label={`Loading ${text}`} {...spinnerProps} />
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {text}
      </span>
    </div>
  );
}

// Button spinner for loading states in buttons
export interface ButtonSpinnerProps extends Omit<SpinnerProps, 'size' | 'variant'> {
  /** Button size to match spinner size */
  buttonSize?: 'sm' | 'md' | 'lg';
}

export function ButtonSpinner({
  buttonSize = 'md',
  ...spinnerProps
}: ButtonSpinnerProps) {
  const sizeMap = {
    sm: 'xs' as SpinnerSize,
    md: 'sm' as SpinnerSize,
    lg: 'md' as SpinnerSize
  };

  return (
    <Spinner
      size={sizeMap[buttonSize]}
      variant="current"
      label="Processing"
      {...spinnerProps}
    />
  );
}

// Page loading spinner
export interface PageSpinnerProps extends Omit<SpinnerProps, 'overlay' | 'centered'> {
  /** Show backdrop */
  backdrop?: boolean;
  /** Custom loading message */
  message?: string;
}

export function PageSpinner({
  backdrop = true,
  message = 'Loading page...',
  size = 'lg',
  ...spinnerProps
}: PageSpinnerProps) {
  if (backdrop) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-white dark:bg-gray-900">
        <Spinner size={size} label={message} {...spinnerProps} />
        {message && (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 animate-pulse">
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Spinner size={size} label={message} {...spinnerProps} />
      {message && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          {message}
        </p>
      )}
    </div>
  );
}

// Skeleton placeholder for content areas
export interface SpinnerSkeletonProps {
  /** Show spinner instead of skeleton bars */
  showSpinner?: boolean;
  /** Number of skeleton lines */
  lines?: number;
  /** Custom height for the container */
  height?: string;
  /** Additional classes */
  className?: string;
}

export function SpinnerSkeleton({
  showSpinner = true,
  lines = 3,
  height = '200px',
  className
}: SpinnerSkeletonProps) {
  const containerClasses = classNames(
    'flex items-center justify-center w-full rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    className
  );

  if (showSpinner) {
    return (
      <div className={containerClasses} style={{ height }}>
        <Spinner size="md" variant="secondary" />
      </div>
    );
  }

  return (
    <div className={classNames('space-y-3', className)} style={{ height }}>
      <div className="animate-pulse">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={classNames(
              'h-4 bg-gray-200 dark:bg-gray-700 rounded',
              {
                'w-full': index < lines - 1,
                'w-3/4': index === lines - 1 // Last line shorter
              }
            )}
            style={{
              marginBottom: index < lines - 1 ? '0.75rem' : '0'
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Export all spinner variants
export const SpinnerComponents = {
  Spinner,
  WithText: SpinnerWithText,
  Button: ButtonSpinner,
  Page: PageSpinner,
  Skeleton: SpinnerSkeleton
};

export default Spinner;

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/core/utils)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - pure UI component
- [x] Reads config from `@/app/config` (N/A for spinner component - no config needed)
- [x] Exports default named component (exports Spinner as default plus compound components)
- [x] Adds basic ARIA and keyboard handlers (includes role="status", aria-label, aria-live for accessibility)
*/
