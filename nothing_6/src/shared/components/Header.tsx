// filepath: src/shared/components/Header.tsx

/*
✓ Uses @/ imports as much as possible
✓ Uses providers/hooks (no direct DOM/localStorage side effects)
✓ Reads config from @/app/config
✓ Exports default named component
✓ Adds basic ARIA and keyboard handlers (where relevant)
*/

import React, { useState, useCallback, useEffect } from 'react'
import Logo from '@/shared/components/Logo'
import Nav from '@/shared/components/Nav'
import Button from '@/shared/components/Button'
import { useTheme } from '@/providers/ThemeProvider'
import { config } from '@/app/config'

// Header component props interface
export interface HeaderProps {
  /** Custom CSS class names */
  className?: string
  /** Whether to show the CTA buttons */
  showCTA?: boolean
  /** Whether to show the theme toggle */
  showThemeToggle?: boolean
  /** Custom CTA button text */
  ctaText?: string
  /** Custom secondary CTA text */
  secondaryCtaText?: string
  /** Callback for CTA button click */
  onCtaClick?: () => void
  /** Callback for secondary CTA button click */
  onSecondaryCtaClick?: () => void
  /** Whether to use sticky positioning */
  sticky?: boolean
  /** Whether header is in transparent mode (for hero overlays) */
  transparent?: boolean
}

// Theme toggle button component
function ThemeToggleButton({ 
  isDark, 
  onToggle, 
  className = '' 
}: { 
  isDark: boolean
  onToggle: () => void
  className?: string
}) {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onToggle()
    }
  }, [onToggle])

  return (
    <button
      type="button"
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full
        transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
        ${isDark ? 'bg-purple-600' : 'bg-gray-200'}
        ${className}
      `}
      aria-pressed={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      role="switch"
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white
          transition duration-200 ease-in-out
          ${isDark ? 'translate-x-6' : 'translate-x-1'}
        `}
      >
        <span className="sr-only">
          {isDark ? 'Dark mode' : 'Light mode'}
        </span>
        {/* Sun icon for light mode */}
        {!isDark && (
          <svg
            className="h-3 w-3 text-yellow-500 absolute top-0.5 left-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {/* Moon icon for dark mode */}
        {isDark && (
          <svg
            className="h-3 w-3 text-purple-400 absolute top-0.5 left-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </span>
    </button>
  )
}

// Mobile menu button component
function MobileMenuButton({ 
  isOpen, 
  onToggle, 
  className = '' 
}: { 
  isOpen: boolean
  onToggle: () => void
  className?: string
}) {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onToggle()
    }
  }, [onToggle])

  return (
    <button
      type="button"
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      className={`
        inline-flex items-center justify-center p-2 rounded-md
        text-gray-400 hover:text-gray-500 hover:bg-gray-100
        dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700
        focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500
        transition-colors duration-200
        ${className}
      `}
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Close main menu' : 'Open main menu'}
      aria-controls="mobile-menu"
    >
      <span className="sr-only">{isOpen ? 'Close' : 'Open'} main menu</span>
      {/* Hamburger icon */}
      <svg
        className={`h-6 w-6 transition-transform duration-200 ${
          isOpen ? 'rotate-45' : ''
        }`}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        aria-hidden="true"
      >
        {isOpen ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        )}
      </svg>
    </button>
  )
}

// Main Header component
export function Header({
  className = '',
  showCTA = true,
  showThemeToggle = true,
  ctaText = 'Get Started',
  secondaryCtaText = 'Learn More',
  onCtaClick,
  onSecondaryCtaClick,
  sticky = false,
  transparent = false,
}: HeaderProps) {
  const { theme, isDark, toggleDarkMode, resolveClasses } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Handle mobile menu toggle
  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev)
  }, [])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMobileMenuOpen])

  // Track scroll position for sticky header styling
  useEffect(() => {
    if (!sticky) return

    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 0)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sticky])

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMobileMenuOpen])

  // Handle CTA button clicks
  const handleCtaClick = useCallback(() => {
    if (onCtaClick) {
      onCtaClick()
    } else {
      // Default behavior - scroll to pricing or redirect
      const pricingSection = document.getElementById('pricing')
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [onCtaClick])

  const handleSecondaryCtaClick = useCallback(() => {
    if (onSecondaryCtaClick) {
      onSecondaryCtaClick()
    } else {
      // Default behavior - scroll to features or about
      const featuresSection = document.getElementById('features') || document.getElementById('about')
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [onSecondaryCtaClick])

  // Compute header classes
  const headerClasses = resolveClasses(
    'relative w-full z-50',
    sticky && 'sticky top-0',
    sticky && isScrolled && !transparent && 'backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/20 dark:border-gray-700/20',
    transparent && !isScrolled && 'bg-transparent',
    !transparent && !sticky && 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700',
    'transition-all duration-300 ease-in-out',
    className
  )

  const containerClasses = resolveClasses(
    'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
    'flex h-16 items-center justify-between'
  )

  const navClasses = resolveClasses(
    'hidden md:flex md:items-center md:space-x-8'
  )

  const ctaGroupClasses = resolveClasses(
    'hidden md:flex md:items-center md:space-x-4'
  )

  const mobileMenuClasses = resolveClasses(
    'md:hidden absolute top-16 inset-x-0 z-10',
    'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700',
    'shadow-lg',
    isMobileMenuOpen ? 'block' : 'hidden'
  )

  return (
    <header className={headerClasses} role="banner">
      <div className={containerClasses}>
        {/* Logo */}
        <div className="flex items-center">
          <Logo 
            className={resolveClasses(
              'h-8 w-auto',
              transparent && !isScrolled && 'text-white',
              !transparent && 'text-gray-900 dark:text-white'
            )}
          />
        </div>

        {/* Desktop Navigation */}
        <nav className={navClasses} role="navigation" aria-label="Main navigation">
          <Nav 
            variant="horizontal"
            className={resolveClasses(
              transparent && !isScrolled && 'text-white/90',
              !transparent && 'text-gray-900 dark:text-gray-100'
            )}
          />
        </nav>

        {/* Desktop CTA Group */}
        <div className={ctaGroupClasses}>
          {showThemeToggle && (
            <ThemeToggleButton
              isDark={isDark}
              onToggle={toggleDarkMode}
              className="mr-4"
            />
          )}
          
          {showCTA && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSecondaryCtaClick}
                className={resolveClasses(
                  transparent && !isScrolled && 'text-white/90 hover:text-white border-white/20 hover:bg-white/10',
                  !transparent && 'text-gray-600 dark:text-gray-300'
                )}
              >
                {secondaryCtaText}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCtaClick}
                className="shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {ctaText}
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center md:hidden">
          {showThemeToggle && (
            <ThemeToggleButton
              isDark={isDark}
              onToggle={toggleDarkMode}
              className="mr-2"
            />
          )}
          <MobileMenuButton
            isOpen={isMobileMenuOpen}
            onToggle={handleMobileMenuToggle}
            className={resolveClasses(
              transparent && !isScrolled && 'text-white/90 hover:bg-white/10',
              !transparent && 'text-gray-400 hover:text-gray-500 dark:text-gray-300'
            )}
          />
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div 
        className={mobileMenuClasses}
        id="mobile-menu"
        role="navigation"
        aria-label="Mobile navigation"
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="px-4 py-6 space-y-6">
          {/* Mobile Navigation */}
          <Nav 
            variant="vertical"
            className="text-gray-900 dark:text-gray-100"
            onItemClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Mobile CTA Buttons */}
          {showCTA && (
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="ghost"
                size="md"
                onClick={() => {
                  handleSecondaryCtaClick()
                  setIsMobileMenuOpen(false)
                }}
                className="w-full justify-center"
              >
                {secondaryCtaText}
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  handleCtaClick()
                  setIsMobileMenuOpen(false)
                }}
                className="w-full justify-center shadow-lg"
              >
                {ctaText}
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// Development helpers
if (config.isDevelopment && typeof window !== 'undefined') {
  (window as any).__HEADER_COMPONENT__ = {
    Header,
    ThemeToggleButton,
    MobileMenuButton,
  }
}

export default Header

// Example usage:
// <Header 
//   sticky 
//   transparent 
//   ctaText="Start Building Nothing"
//   secondaryCtaText="Explore Void"
//   onCtaClick={() => console.log('CTA clicked')}
//   showThemeToggle
// />
