// filepath: src/features/notfound/NotFoundPage.tsx

// [ ] Uses `@/` imports as much as possible
// [ ] Uses providers/hooks (no direct DOM/localStorage side effects)
// [ ] Reads config from `@/app/config`
// [ ] Exports default named component
// [ ] Adds basic ARIA and keyboard handlers (where relevant)

import React, { useEffect, useState } from 'react'
import { config } from '@/app/config'
import Button from '@/shared/components/Button'
import GlitchText from '@/features/hero/GlitchText'

interface NotFoundPageProps {
  onNavigateHome?: () => void
  autoRedirectDelay?: number
}

export default function NotFoundPage({ 
  onNavigateHome,
  autoRedirectDelay = 10 
}: NotFoundPageProps) {
  const [countdown, setCountdown] = useState(autoRedirectDelay)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (countdown <= 0) {
      setIsRedirecting(true)
      // Auto-redirect after countdown
      const timer = setTimeout(() => {
        if (onNavigateHome) {
          onNavigateHome()
        } else if (typeof window !== 'undefined') {
          window.location.href = '/'
        }
      }, 1000)

      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [countdown, onNavigateHome])

  const handleGoHome = () => {
    setIsRedirecting(true)
    if (onNavigateHome) {
      onNavigateHome()
    } else if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleGoHome()
    }
  }

  return (
    <main 
      className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4"
      role="main"
      aria-labelledby="not-found-title"
    >
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Glitch effect for 404 */}
        <div className="mb-8">
          <GlitchText 
            text="404" 
            className="text-8xl md:text-9xl font-bold text-white mb-4"
            glitchIntensity={0.8}
          />
        </div>

        {/* Main message */}
        <div className="space-y-6">
          <h1 
            id="not-found-title"
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            You've Found Nothing
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
            Congratulations! You've discovered the void where this page used to exist. 
            This is premium-grade nothingness, exactly what we specialize in.
          </p>

          <p className="text-base text-gray-400">
            Don't worry, we'll redirect you to more nothing in{' '}
            <span className="font-mono text-white font-bold text-xl">
              {countdown}
            </span>{' '}
            {countdown === 1 ? 'second' : 'seconds'}...
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
          <Button
            variant="primary"
            onClick={handleGoHome}
            onKeyDown={handleKeyDown}
            disabled={isRedirecting}
            className="min-w-[180px]"
            aria-label="Return to homepage"
          >
            {isRedirecting ? 'Redirecting...' : 'Return to Nothing'}
          </Button>

          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            disabled={isRedirecting}
            className="text-gray-400 hover:text-white min-w-[180px]"
            aria-label="Go back to previous page"
          >
            Go Back
          </Button>
        </div>

        {/* Fun facts about nothing */}
        <div className="pt-12 border-t border-gray-800">
          <p className="text-sm text-gray-500 italic">
            "The nothing you're looking for is exactly the nothing you found. 
            That's the beauty of premium void services."
          </p>
          
          {config.isDevelopment && (
            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg text-xs text-gray-400 font-mono">
              <strong>Dev Info:</strong> 404 handler with {autoRedirectDelay}s countdown
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
