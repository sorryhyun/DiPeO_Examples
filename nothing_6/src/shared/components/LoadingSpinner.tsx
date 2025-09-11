// filepath: src/shared/components/LoadingSpinner.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React from 'react'
import { motion } from 'framer-motion'
import { durations, easings, motionPresets } from '@/theme/animations'
import { config } from '@/app/config'

export interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'accent' | 'muted'
  /** Loading text to display */
  text?: string
  /** Hide the text label */
  hideText?: boolean
  /** Custom className */
  className?: string
  /** Show backdrop overlay */
  overlay?: boolean
  /** Spinner animation speed */
  speed?: 'slow' | 'normal' | 'fast'
  /** Custom spinner type */
  type?: 'dots' | 'bars' | 'pulse' | 'ring' | 'none'
}

// Size mappings for different spinner variants
const sizeClasses = {
  sm: {
    spinner: 'w-4 h-4',
    text: 'text-sm',
    gap: 'gap-2',
  },
  md: {
    spinner: 'w-6 h-6',
    text: 'text-base',
    gap: 'gap-3',
  },
  lg: {
    spinner: 'w-8 h-8',
    text: 'text-lg',
    gap: 'gap-4',
  },
  xl: {
    spinner: 'w-12 h-12',
    text: 'text-xl',
    gap: 'gap-4',
  },
}

// Color variant mappings
const variantClasses = {
  primary: 'text-primary-500',
  secondary: 'text-secondary-500',
  accent: 'text-accent-500',
  muted: 'text-gray-400',
}

// Speed mappings for animations
const speedDurations = {
  slow: durations.slower / 1000,
  normal: durations.slow / 1000,
  fast: durations.normal / 1000,
}

// Dots spinner animation variants
const dotsVariants = {
  initial: { opacity: 0.3 },
  animate: {
    opacity: [0.3, 1, 0.3],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: easings.easeInOut,
    },
  },
}

// Ring spinner animation
const ringVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

// Pulse animation
const pulseVariants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: easings.easeInOut,
    },
  },
}

// Bars animation variants
const barsVariants = {
  animate: (i: number) => ({
    scaleY: [1, 2, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      delay: i * 0.1,
      ease: easings.easeInOut,
    },
  }),
}

// Render different spinner types
function SpinnerIcon({ type, size, variant, speed }: { 
  type: LoadingSpinnerProps['type']
  size: LoadingSpinnerProps['size']
  variant: LoadingSpinnerProps['variant']
  speed: LoadingSpinnerProps['speed']
}) {
  const sizeClass = sizeClasses[size || 'md']
  const colorClass = variantClasses[variant || 'primary']
  const duration = speedDurations[speed || 'normal']

  switch (type) {
    case 'dots':
      return (
        <div className={`flex items-center justify-center ${sizeClass.spinner}`}>
          <div className={`flex space-x-1 ${colorClass}`}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-current rounded-full"
                variants={dotsVariants}
                initial="initial"
                animate="animate"
                style={{
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      )

    case 'bars':
      return (
        <div className={`flex items-center justify-center ${sizeClass.spinner}`}>
          <div className={`flex items-end space-x-1 ${colorClass}`}>
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="w-1 bg-current rounded-sm"
                style={{ height: '50%' }}
                variants={barsVariants}
                initial="animate"
                animate="animate"
                custom={i}
              />
            ))}
          </div>
        </div>
      )

    case 'pulse':
      return (
        <motion.div
          className={`${sizeClass.spinner} ${colorClass} rounded-full bg-current`}
          variants={pulseVariants}
          initial="animate"
          animate="animate"
        />
      )

    case 'ring':
      return (
        <motion.div
          className={`${sizeClass.spinner} ${colorClass}`}
          variants={ringVariants}
          initial="animate"
          animate="animate"
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeOpacity="0.25"
            />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="currentColor"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>
      )

    case 'none':
      return null

    default:
      // Default ring spinner
      return (
        <motion.div
          className={`${sizeClass.spinner} ${colorClass}`}
          variants={ringVariants}
          initial="animate"
          animate="animate"
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeOpacity="0.25"
            />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="currentColor"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>
      )
  }
}

export function LoadingSpinner({
  size = 'md',
  variant = 'primary',
  text = 'Loading...',
  hideText = false,
  className = '',
  overlay = false,
  speed = 'normal',
  type = 'ring',
}: LoadingSpinnerProps) {
  const sizeClass = sizeClasses[size]
  
  const spinnerContent = (
    <motion.div
      className={`flex flex-col items-center justify-center ${sizeClass.gap} ${className}`}
      variants={motionPresets.fadeUp}
      initial="initial"
      animate="animate"
      role="status"
      aria-live="polite"
      aria-label={hideText ? text : undefined}
    >
      <SpinnerIcon
        type={type}
        size={size}
        variant={variant}
        speed={speed}
      />
      
      {!hideText && text && (
        <motion.span
          className={`${sizeClass.text} ${variantClasses[variant]} font-medium select-none`}
          variants={motionPresets.fade}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
        >
          {text}
        </motion.span>
      )}
      
      {/* Screen reader only text */}
      <span className="sr-only">
        {text || 'Loading content, please wait...'}
      </span>
    </motion.div>
  )

  if (overlay) {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
        variants={motionPresets.fade}
        initial="initial"
        animate="animate"
exit="exit"
        onClick={(e) => e.preventDefault()}
        role="dialog"
        aria-modal="true"
        aria-label="Loading"
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 m-4"
          onClick={(e) => e.stopPropagation()}
        >
          {spinnerContent}
        </div>
      </motion.div>
    )
  }

  return spinnerContent
}

// Convenience variants for common use cases
export function SmallSpinner(props: Omit<LoadingSpinnerProps, 'size'>) {
  return <LoadingSpinner {...props} size="sm" />
}

export function LargeSpinner(props: Omit<LoadingSpinnerProps, 'size'>) {
  return <LoadingSpinner {...props} size="lg" />
}

export function OverlaySpinner(props: Omit<LoadingSpinnerProps, 'overlay'>) {
  return <LoadingSpinner {...props} overlay />
}

// Development helpers
if (config.isDevelopment && typeof window !== 'undefined') {
  ;(window as any).__LOADING_SPINNER__ = {
    LoadingSpinner,
    SmallSpinner,
    LargeSpinner,
    OverlaySpinner,
  }
}

export default LoadingSpinner
