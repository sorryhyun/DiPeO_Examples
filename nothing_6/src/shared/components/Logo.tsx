// filepath: src/shared/components/Logo.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React from 'react'
import { motion } from 'framer-motion'
import { appConfig } from '@/app/config'
import { motionPresets, interactionPresets } from '@/theme/animations'
import logoSvg from '@/assets/logo.svg'

export interface LogoProps {
  /** Size variant for the logo */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Whether to show animated variant */
  animated?: boolean
  /** Whether to show the app name beside the logo */
  showText?: boolean
  /** Custom className for styling */
  className?: string
  /** Click handler for navigation */
  onClick?: () => void
  /** Whether the logo should be clickable */
  clickable?: boolean
  /** Alt text override (defaults to app name) */
  alt?: string
  /** Whether to use monochrome variant */
  monochrome?: boolean
}

const sizeClasses = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-24 w-24',
} as const

const textSizeClasses = {
  xs: 'text-sm',
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
  xl: 'text-2xl',
} as const

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  animated = false,
  showText = false,
  className = '',
  onClick,
  clickable = false,
  alt,
  monochrome = false,
}) => {
  const isInteractive = clickable || !!onClick
  const logoAlt = alt || `${appConfig.appName} logo`
  
  // Animation variants
  const logoVariants = animated ? {
    ...motionPresets.scale,
    animate: {
      ...motionPresets.scale.animate,
      rotate: [0, 360],
      transition: {
        rotate: {
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        },
        ...motionPresets.scale.transition,
      },
    },
  } : motionPresets.fade

  const textVariants = animated ? {
    ...motionPresets.fadeLeft,
    animate: {
      ...motionPresets.fadeLeft.animate,
      transition: {
        delay: 0.2,
        ...motionPresets.fadeLeft.transition,
      },
    },
  } : motionPresets.fade

  const containerClasses = [
    'inline-flex items-center gap-3',
    isInteractive && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md',
    className,
  ].filter(Boolean).join(' ')

  const logoClasses = [
    sizeClasses[size],
    'flex-shrink-0',
    monochrome && 'filter grayscale',
    'transition-all duration-200',
  ].filter(Boolean).join(' ')

  const textClasses = [
    textSizeClasses[size],
    'font-bold text-gray-900 dark:text-white',
    'transition-colors duration-200',
  ].filter(Boolean).join(' ')

  const handleClick = (event: React.MouseEvent) => {
    if (onClick) {
      event.preventDefault()
      onClick()
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isInteractive && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      if (onClick) {
        onClick()
      }
    }
  }

  const LogoContent = () => (
    <>
      <motion.img
        src={logoSvg}
        alt={logoAlt}
        className={logoClasses}
        variants={logoVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        loading="eager"
        draggable={false}
      />
      {showText && (
        <motion.span
          className={textClasses}
          variants={textVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {appConfig.appName}
        </motion.span>
      )}
    </>
  )

  if (isInteractive) {
    return (
      <motion.div
        className={containerClasses}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`${logoAlt}${showText ? ` - ${appConfig.appName}` : ''}`}
        whileHover={interactionPresets.hover}
        whileTap={interactionPresets.tap}
        whileFocus={interactionPresets.focus}
      >
        <LogoContent />
      </motion.div>
    )
  }

  return (
    <div className={containerClasses} role="img" aria-label={logoAlt}>
      <LogoContent />
    </div>
  )
}

// Convenience presets for common use cases
export const HeaderLogo: React.FC<Omit<LogoProps, 'size' | 'showText' | 'clickable'>> = (props) => (
  <Logo size="md" showText clickable {...props} />
)

export const FooterLogo: React.FC<Omit<LogoProps, 'size' | 'monochrome'>> = (props) => (
  <Logo size="sm" monochrome {...props} />
)

export const HeroLogo: React.FC<Omit<LogoProps, 'size' | 'animated'>> = (props) => (
  <Logo size="xl" animated {...props} />
)

export const LoadingLogo: React.FC<Omit<LogoProps, 'animated' | 'size'>> = (props) => (
  <Logo size="lg" animated {...props} />
)

export default Logo
