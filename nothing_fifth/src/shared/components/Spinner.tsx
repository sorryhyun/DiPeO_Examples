// filepath: src/shared/components/Spinner.tsx

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { theme } from '@/theme';
import { EASINGS } from '@/theme/animations';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SpinnerProps {
  /**
   * Size of the spinner
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Color variant
   */
  variant?: 'primary' | 'secondary' | 'accent' | 'white' | 'current';
  
  /**
   * Whether to show as a full-screen overlay
   */
  fullScreen?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Accessible label for screen readers
   */
  label?: string;
  
  /**
   * Speed of rotation (multiplier)
   */
  speed?: number;
  
  /**
   * Custom style overrides
   */
  style?: React.CSSProperties;
}

// ============================================================================
// SIZE CONFIGURATIONS
// ============================================================================

const sizeConfig = {
  xs: {
    size: 16,
    strokeWidth: 2,
  },
  sm: {
    size: 20,
    strokeWidth: 2,
  },
  md: {
    size: 24,
    strokeWidth: 2.5,
  },
  lg: {
    size: 32,
    strokeWidth: 3,
  },
  xl: {
    size: 40,
    strokeWidth: 3.5,
  },
} as const;

// ============================================================================
// COLOR CONFIGURATIONS
// ============================================================================

const colorConfig = {
  primary: {
    stroke: theme.colors.primary[500],
    strokeOpacity: 0.2,
  },
  secondary: {
    stroke: theme.colors.secondary[500],
    strokeOpacity: 0.2,
  },
  accent: {
    stroke: theme.colors.accent[500],
    strokeOpacity: 0.2,
  },
  white: {
    stroke: '#ffffff',
    strokeOpacity: 0.3,
  },
  current: {
    stroke: 'currentColor',
    strokeOpacity: 0.2,
  },
} as const;

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const overlayVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: EASINGS.smooth,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: EASINGS.sharp,
    },
  },
};

// ============================================================================
// SPINNER COMPONENT
// ============================================================================

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  fullScreen = false,
  className = '',
  label = 'Loading...',
  speed = 1,
  style,
}) => {
  const config = sizeConfig[size];
  const colors = colorConfig[variant];
  const radius = (config.size - config.strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * 0.25;

  // Create custom spin animation with speed multiplier
  const customSpinVariants: Variants = {
    spin: {
      rotate: 360,
      transition: {
        duration: 1 / speed,
        ease: EASINGS.linear,
        repeat: Infinity,
      },
    },
  };

  const spinnerElement = (
    <motion.div
      className={`inline-flex items-center justify-center ${className}`}
      style={style}
      variants={customSpinVariants}
      animate="spin"
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      <svg
        width={config.size}
        height={config.size}
        viewBox={`0 0 ${config.size} ${config.size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block"
      >
        {/* Background circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          stroke={colors.stroke}
          strokeWidth={config.strokeWidth}
          strokeOpacity={colors.strokeOpacity}
          fill="none"
        />
        
        {/* Animated circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          stroke={colors.stroke}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          fill="none"
          transform={`rotate(-90 ${config.size / 2} ${config.size / 2})`}
        />
      </svg>
      
      {/* Screen reader text */}
      <span className="sr-only">{label}</span>
    </motion.div>
  );

  // Full-screen overlay variant
  if (fullScreen) {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        <motion.div
          className="rounded-lg bg-white/90 p-6 shadow-lg backdrop-blur-md dark:bg-gray-900/90"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
        >
          <div className="flex flex-col items-center">
            <motion.div
              className={`inline-flex items-center justify-center mb-3`}
              style={style}
              variants={customSpinVariants}
              animate="spin"
              role="status"
              aria-busy="true"
              aria-label={label}
            >
              <svg
                width={size === 'xs' || size === 'sm' ? sizeConfig.lg.size : sizeConfig.xl.size}
                height={size === 'xs' || size === 'sm' ? sizeConfig.lg.size : sizeConfig.xl.size}
                viewBox={`0 0 ${size === 'xs' || size === 'sm' ? sizeConfig.lg.size : sizeConfig.xl.size} ${size === 'xs' || size === 'sm' ? sizeConfig.lg.size : sizeConfig.xl.size}`}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="block"
              >
                <circle
                  cx={(size === 'xs' || size === 'sm' ? sizeConfig.lg.size : sizeConfig.xl.size) / 2}
                  cy={(size === 'xs' || size === 'sm' ? sizeConfig.lg.size : sizeConfig.xl.size) / 2}
                  r={((size === 'xs' || size === 'sm' ? sizeConfig.lg.size : sizeConfig.xl.size) - (size === 'xs' || size === 'sm' ? sizeConfig.lg.strokeWidth : sizeConfig.xl.strokeWidth)) / 2}
                  stroke={colors.stroke}
                  strokeWidth={size === 'xs' || size === 'sm' ? sizeConfig.lg.strokeWidth : sizeConfig.xl.strokeWidth}
                  strokeOpacity={colors.strokeOpacity}
                  fill="none"
                />
                
                <circle
                  cx={(size === 'xs' || size === 'sm' ? sizeConfig.lg.size : sizeConfig.xl.size) / 2}
                  cy={(size === 'xs' || size === 'sm' ? sizeConfig.lg.size : sizeConfig.xl.size) / 2}
                  r={((size === 'xs' || size === 'sm' ? sizeConfig.lg.size : sizeConfig.xl.size) - (size === 'xs' || size === 'sm' ? sizeConfig.lg.strokeWidth : sizeConfig.xl.strokeWidth)) / 2}
                  stroke={colors.stroke}
                  strokeWidth={size === 'xs' || size === 'sm' ? sizeConfig.lg.strokeWidth : sizeConfig.xl.strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={((((size === 'xs' || size === 'sm' ? sizeConfig.lg.size : sizeConfig.xl.size) - (size === 'xs' || size === 'sm' ? sizeConfig.lg.strokeWidth : sizeConfig.xl.strokeWidth)) / 2) * 2 * Math.PI)}
                  strokeDashoffset={((((size === 'xs' || size === 'sm' ? sizeConfig.lg.size : sizeConfig.xl.size) - (size === 'xs' || size === 'sm' ? sizeConfig.lg.strokeWidth : sizeConfig.xl.strokeWidth)) / 2) * 2 * Math.PI) * 0.25}
                  fill="none"
                  transform={`rotate(-90 ${(size === 'xs' || size === 'sm' ? sizeConfig.lg.size : sizeConfig.xl.size) / 2} ${(size === 'xs' || size === 'sm' ? sizeConfig.lg.size : sizeConfig.xl.size) / 2})`}
                />
              </svg>
            </motion.div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {label}
            </p>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return spinnerElement;
};

// ============================================================================
// PRESET VARIANTS
// ============================================================================

/**
 * Small spinner for inline loading states
 */
export const SpinnerSmall: React.FC<Omit<SpinnerProps, 'size'>> = (props) => (
  <Spinner {...props} size="sm" />
);

/**
 * Large spinner for prominent loading states
 */
export const SpinnerLarge: React.FC<Omit<SpinnerProps, 'size'>> = (props) => (
  <Spinner {...props} size="lg" />
);

/**
 * Full-screen loading spinner
 */
export const SpinnerFullScreen: React.FC<Omit<SpinnerProps, 'fullScreen'>> = (props) => (
  <Spinner {...props} fullScreen />
);

/**
 * Button spinner (white variant for dark buttons)
 */
export const SpinnerButton: React.FC<Omit<SpinnerProps, 'variant' | 'size'>> = (props) => (
  <Spinner {...props} variant="white" size="sm" />
);

// ============================================================================
// LOADING WRAPPER COMPONENT
// ============================================================================

export interface LoadingWrapperProps {
  /**
   * Whether to show loading state
   */
  loading: boolean;
  
  /**
   * Content to show when not loading
   */
  children: React.ReactNode;
  
  /**
   * Spinner props
   */
  spinnerProps?: Partial<SpinnerProps>;
  
  /**
   * Whether to show overlay over children or replace them
   */
  overlay?: boolean;
  
  /**
   * Minimum loading time in milliseconds (prevents flash)
   */
  minLoadingTime?: number;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  loading,
  children,
  spinnerProps = {},
  overlay = false,
  minLoadingTime = 0,
  className = '',
}) => {
  const [showLoading, setShowLoading] = React.useState(loading);
  const [loadingStartTime, setLoadingStartTime] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (loading) {
      setLoadingStartTime(Date.now());
      setShowLoading(true);
    } else {
      const now = Date.now();
      const elapsedTime = loadingStartTime ? now - loadingStartTime : 0;
      
      if (elapsedTime < minLoadingTime) {
        const remainingTime = minLoadingTime - elapsedTime;
        setTimeout(() => {
          setShowLoading(false);
          setLoadingStartTime(null);
        }, remainingTime);
      } else {
        setShowLoading(false);
        setLoadingStartTime(null);
      }
    }
  }, [loading, loadingStartTime, minLoadingTime]);

  if (overlay) {
    return (
      <div className={`relative ${className}`}>
        {children}
        {showLoading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-900/80"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Spinner {...spinnerProps} />
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {showLoading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner {...spinnerProps} />
        </div>
      ) : (
        children
      )}
    </div>
  );
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for managing loading states with minimum duration
 */
export function useMinimumLoadingTime(loading: boolean, minTime: number = 500) {
  const [showLoading, setShowLoading] = React.useState(loading);
  const [startTime, setStartTime] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (loading) {
      setStartTime(Date.now());
      setShowLoading(true);
    } else {
      const now = Date.now();
      const elapsed = startTime ? now - startTime : 0;
      
      if (elapsed < minTime) {
        const remaining = minTime - elapsed;
        setTimeout(() => {
          setShowLoading(false);
          setStartTime(null);
        }, remaining);
      } else {
        setShowLoading(false);
        setStartTime(null);
      }
    }
  }, [loading, startTime, minTime]);

  return showLoading;
}

// Default export
export default Spinner;
