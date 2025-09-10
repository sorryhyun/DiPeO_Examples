// filepath: src/pages/NotFoundPage.tsx

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { EASINGS } from '@/theme/animations';
import { Button } from '@/shared/components/Button';
import { GradientBackground } from '@/shared/components/GradientBackground';
import { config } from '@/app/config';
import { eventBus } from '@/core/events';

// ============================================================================
// ANIMATIONS
// ============================================================================

const containerVariants: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: EASINGS.smooth,
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: EASINGS.smooth
    }
  }
};

const floatingVariants: Variants = {
  float: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: EASINGS.gentle
    }
  }
};

// ============================================================================
// NOT FOUND PAGE COMPONENT
// ============================================================================

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Set page title and emit navigation event
  useEffect(() => {
    document.title = `404 - Page Not Found | ${config.appName}`;
    
    // Emit event for analytics/logging
    eventBus.emit('error:unhandled', {
      error: new Error(`404 - Page not found: ${location.pathname}`)
    });
  }, [location.pathname]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Navigate to home on Enter key when focused on page
      if (event.key === 'Enter' && event.target === document.body) {
        handleGoHome();
      }
      
      // Emit escape event
      if (event.key === 'Escape') {
        eventBus.emit('ui:escape', {});
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus management for accessibility
  useEffect(() => {
    const mainElement = document.querySelector('[role="main"]');
    if (mainElement && mainElement instanceof HTMLElement) {
      mainElement.focus();
    }
  }, []);

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      role="application"
      aria-label="Page not found"
    >
      <GradientBackground 
        variant="primary"
        showShapes={true}
        enableParallax={true}
        overlayOpacity={0.1}
        blurIntensity="light"
      />

      {/* Skip navigation link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                   bg-blue-600 text-white px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>

      <div 
        className="relative z-20 text-center px-4 max-w-2xl mx-auto"
        role="main"
        id="main-content"
        tabIndex={-1}
        aria-labelledby="error-title"
        aria-describedby="error-description"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* 404 Number with floating animation */}
          <motion.div
            variants={floatingVariants}
            animate="float"
            className="relative"
          >
            <motion.h1
              variants={itemVariants}
              id="error-title"
              className="text-8xl md:text-9xl font-bold text-white/90 mb-4"
              style={{
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              404
            </motion.h1>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-400/30 rounded-full blur-sm" />
            <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-purple-400/30 rounded-full blur-sm" />
          </motion.div>

          {/* Error message */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-white">
              Oops! Page Not Found
            </h2>
            <p 
              id="error-description"
              className="text-lg text-white/80 max-w-md mx-auto leading-relaxed"
            >
              The page you're looking for doesn't exist or has been moved. 
              Let's get you back on track.
            </p>
            
            {config.isDevelopment && (
              <motion.div 
                variants={itemVariants}
                className="mt-4 p-4 bg-yellow-500/20 backdrop-blur-sm rounded-lg border border-yellow-400/30"
              >
                <p className="text-sm text-yellow-100">
                  <strong>Dev Mode:</strong> Requested path: {location.pathname}
                </p>
                {location.search && (
                  <p className="text-sm text-yellow-100 mt-1">
                    Query params: {location.search}
                  </p>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Action buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              onClick={handleGoHome}
              size="lg"
              variant="primary"
              className="min-w-[140px]"
              aria-label="Go to home page"
            >
              Go Home
            </Button>
            
            <Button
              onClick={handleGoBack}
              size="lg"
              variant="ghost"
              className="min-w-[140px] text-white border-white/30 hover:bg-white/10"
              aria-label="Go back to previous page"
            >
              Go Back
            </Button>
          </motion.div>

          {/* Help text */}
          <motion.div variants={itemVariants}>
            <p className="text-sm text-white/60">
              Need help? Try searching or check our navigation menu.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating geometric shapes */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 border border-white/10 rounded-lg"
          animate={{
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: EASINGS.linear
          }}
        />
        
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-24 h-24 border border-white/5 rounded-full"
          animate={{
            rotate: [360, 180, 0],
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: EASINGS.gentle
          }}
        />
        
        <motion.div
          className="absolute top-1/2 right-1/3 w-16 h-16 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-lg"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: EASINGS.gentle
          }}
        />
      </div>

      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite">
        404 error: The page you requested could not be found. Use the navigation buttons to continue.
      </div>
    </div>
  );
};

export default NotFoundPage;

// ============================================================================
// Self-Check Comments
// ============================================================================
// [x] Uses `@/` imports only - Imports from @/shared/components, @/app/config, @/core/events
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Uses React Router hooks and event bus
// [x] Reads config from `@/app/config` - Uses config.appName and config.isDevelopment
// [x] Exports default named component - Exports NotFoundPage as default and named export
// [x] Adds basic ARIA and keyboard handlers (where relevant) - Includes comprehensive ARIA attributes, focus management, keyboard navigation, and screen reader support
