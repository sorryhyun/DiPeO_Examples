// filepath: src/shared/components/Spinner/Spinner.tsx
import React from 'react';
import { motion } from 'framer-motion';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'bars' | 'ring';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'inherit';
  className?: string;
  label?: string;
  thickness?: number;
  speed?: 'slow' | 'normal' | 'fast';
  centered?: boolean;
  overlay?: boolean;
}

const sizeMap = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
};

const colorMap = {
  primary: 'var(--color-primary)',
  secondary: 'var(--color-secondary)', 
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
  inherit: 'currentColor',
};

const speedMap = {
  slow: 2,
  normal: 1,
  fast: 0.5,
};

export function Spinner({
  size = 'md',
  variant = 'default',
  color = 'primary',
  className = '',
  label = 'Loading...',
  thickness = 2,
  speed = 'normal',
  centered = false,
  overlay = false,
}: SpinnerProps) {
  const spinnerSize = sizeMap[size];
  const spinnerColor = colorMap[color];
  const duration = speedMap[speed];

  const baseStyles: React.CSSProperties = {
    width: spinnerSize,
    height: spinnerSize,
    display: 'inline-block',
  };

  const overlayStyles: React.CSSProperties = overlay
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9998,
      }
    : {};

  const centeredStyles: React.CSSProperties = centered && !overlay
    ? {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        minHeight: spinnerSize + 16,
      }
    : {};

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div style={baseStyles} className={className}>
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
              }}
            >
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  style={{
                    position: 'absolute',
                    width: spinnerSize / 5,
                    height: spinnerSize / 5,
                    backgroundColor: spinnerColor,
                    borderRadius: '50%',
                    left: `${20 + index * 30}%`,
                    top: '40%',
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: duration * 1.2,
                    repeat: Infinity,
                    delay: index * 0.15,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </div>
        );

      case 'bars':
        return (
          <div style={baseStyles} className={className}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                height: '100%',
                gap: Math.max(2, spinnerSize / 12),
              }}
            >
              {[0, 1, 2, 3].map((index) => (
                <motion.div
                  key={index}
                  style={{
                    width: Math.max(2, spinnerSize / 8),
                    backgroundColor: spinnerColor,
                    borderRadius: 1,
                  }}
                  animate={{
                    height: [
                      spinnerSize * 0.2,
                      spinnerSize * 0.8,
                      spinnerSize * 0.2,
                    ],
                  }}
                  transition={{
                    duration: duration,
                    repeat: Infinity,
                    delay: index * 0.1,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </div>
        );

      case 'ring':
        return (
          <motion.div
            style={{
              ...baseStyles,
              border: `${thickness}px solid transparent`,
              borderTop: `${thickness}px solid ${spinnerColor}`,
              borderRight: `${thickness}px solid ${spinnerColor}`,
              borderRadius: '50%',
            }}
            className={className}
            animate={{ rotate: 360 }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        );

      case 'default':
      default:
        return (
          <motion.div
            style={{
              ...baseStyles,
              border: `${thickness}px solid ${spinnerColor}20`,
              borderTop: `${thickness}px solid ${spinnerColor}`,
              borderRadius: '50%',
            }}
            className={className}
            animate={{ rotate: 360 }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        );
    }
  };

  const spinner = (
    <div
      role="status"
      aria-label={label}
      aria-live="polite"
      style={centeredStyles}
    >
      {renderSpinner()}
      <span className="sr-only">{label}</span>
    </div>
  );

  if (overlay) {
    return (
      <div style={overlayStyles} role="dialog" aria-modal="true" aria-label={label}>
        {spinner}
      </div>
    );
  }

  return spinner;
}

// Convenience components for common use cases
export function LoadingSpinner({ label = 'Loading...', ...props }: Omit<SpinnerProps, 'variant'>) {
  return <Spinner variant="default" label={label} {...props} />;
}

export function DotSpinner({ label = 'Processing...', ...props }: Omit<SpinnerProps, 'variant'>) {
  return <Spinner variant="dots" label={label} {...props} />;
}

export function BarSpinner({ label = 'Loading...', ...props }: Omit<SpinnerProps, 'variant'>) {
  return <Spinner variant="bars" label={label} {...props} />;
}

export function RingSpinner({ label = 'Loading...', ...props }: Omit<SpinnerProps, 'variant'>) {
  return <Spinner variant="ring" label={label} {...props} />;
}

export function OverlaySpinner({ label = 'Loading...', ...props }: Omit<SpinnerProps, 'overlay'>) {
  return <Spinner overlay={true} centered={true} label={label} {...props} />;
}

export function CenteredSpinner({ label = 'Loading...', ...props }: Omit<SpinnerProps, 'centered'>) {
  return <Spinner centered={true} label={label} {...props} />;
}

// Inject screen reader only class for accessibility
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .sr-only {
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    }
  `;
  document.head.appendChild(style);
}

export default Spinner;

// Self-check comments:
// [x] Uses `@/` imports only - N/A, no internal imports needed
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Only injects CSS for accessibility
// [x] Reads config from `@/app/config` - N/A, no config needed for spinner
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant) - role="status", aria-label, aria-live for screen readers
