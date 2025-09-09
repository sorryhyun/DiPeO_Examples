import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/shared/components/GlassCard'
import { GradientBackground } from '@/shared/components/GradientBackground'
import { useTheme } from '@/theme/ThemeProvider'
import { config } from '@/app/config'
import { eventBus } from '@/core/events'

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  maxWidth?: string
}

export function AuthLayout({ 
  children, 
  title, 
  subtitle,
  maxWidth = '400px' 
}: AuthLayoutProps) {
  const { theme } = useTheme()
  const mainRef = useRef<HTMLMainElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    // Focus management for screen readers
    if (titleRef.current) {
      titleRef.current.focus()
    }

    // Announce page change to screen readers
    eventBus.emit('auth:layout-mounted', { title })

    return () => {
      eventBus.emit('auth:layout-unmounted', {})
    }
  }, [title])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key handling for auth flows
      if (e.key === 'Escape') {
        eventBus.emit('auth:escape-pressed', {})
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      <GradientBackground />
      
      {/* Main content container */}
      <main
        ref={mainRef}
        className="relative z-10 w-full px-4 py-8 sm:px-6 lg:px-8"
        role="main"
        aria-label={title ? `${title} page` : 'Authentication page'}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.5, 
            ease: [0.25, 0.46, 0.45, 0.94] 
          }}
          className="w-full mx-auto"
          style={{ maxWidth }}
        >
          <GlassCard className="p-6 sm:p-8">
            {/* Header section */}
            {(title || subtitle) && (
              <div className="text-center mb-8">
                {title && (
                  <h1
                    ref={titleRef}
                    className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2"
                    tabIndex={-1}
                  >
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {/* Form content area */}
            <div 
              className="space-y-6"
              role="region"
              aria-label="Authentication form"
            >
              {children}
            </div>

            {/* App branding footer */}
            <div className="mt-8 pt-6 border-t border-gray-200/20 dark:border-gray-700/20">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {config.appName}
                  {config.buildTimestamp && (
                    <span className="ml-2 opacity-60">
                      v{config.buildTimestamp}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Decorative elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-green-400 to-blue-600 blur-3xl pointer-events-none"
            aria-hidden="true"
          />
        </motion.div>
      </main>

      {/* Skip link for keyboard navigation */}
      <a
        href="#auth-form"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-white dark:bg-gray-800 px-4 py-2 rounded-md shadow-lg text-sm font-medium"
      >
        Skip to authentication form
      </a>
    </div>
  )
}

export default AuthLayout
