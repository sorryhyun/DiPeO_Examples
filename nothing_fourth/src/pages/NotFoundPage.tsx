// filepath: src/pages/NotFoundPage.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { config } from '@/app/config';
import { eventBus } from '@/core/events';
import Button from '@/shared/components/Button';
import { GradientBackground } from '@/shared/components/GradientBackground';

// ===============================================
// NotFoundPage Component
// ===============================================

export function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Track 404 page view for analytics
  React.useEffect(() => {
    eventBus.emit('data:updated', {
      key: 'page:not-found',
      payload: {
        path: location.pathname,
        timestamp: new Date().toISOString(),
      },
    });
  }, [location.pathname]);

  // Navigate back to home
  const handleGoHome = () => {
    navigate('/');
  };

  // Navigate to previous page
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        ease: 'easeInOut',
        repeat: Infinity,
      },
    },
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <GradientBackground
        variant="mesh"
        animated={true}
        shapes={true}
        shapeCount={4}
        parallax={true}
        parallaxIntensity="subtle"
        aria-hidden="true"
      />

      {/* Content container */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 404 Number */}
          <motion.div
            variants={pulseVariants}
            animate="pulse"
            className="mb-8"
          >
            <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 drop-shadow-lg sm:text-[12rem] lg:text-[16rem]">
              404
            </h1>
          </motion.div>

          {/* Error message */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Page Not Found
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 sm:text-xl">
              Oops! The page you're looking for seems to have wandered off into the digital void.
            </p>
          </motion.div>

          {/* Current path info */}
          {location.pathname !== '/' && (
            <motion.div
              variants={itemVariants}
              className="mb-8 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 p-4"
            >
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">Requested path:</span>{' '}
                <code className="rounded bg-gray-100 dark:bg-gray-800 px-2 py-1 text-sm font-mono">
                  {location.pathname}
                </code>
              </p>
            </motion.div>
          )}

          {/* Action buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-4 sm:flex-row sm:justify-center"
          >
            <Button
              size="lg"
              variant="primary"
              onClick={handleGoHome}
              aria-label="Navigate to home page"
            >
              Go Home
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={handleGoBack}
              aria-label="Go back to previous page"
            >
              Go Back
            </Button>
          </motion.div>

          {/* Additional help text */}
          <motion.div variants={itemVariants} className="mt-12">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              If you believe this is an error, please{' '}
              <button
                onClick={() => {
                  // Emit error report event
                  eventBus.emit('data:updated', {
                    key: 'error:404-report',
                    payload: {
                      path: location.pathname,
                      userAgent: navigator.userAgent,
                      timestamp: new Date().toISOString(),
                    },
                  });
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 rounded"
                aria-label="Report this error"
              >
                report this issue
              </button>
              .
            </p>
            
            {config.isDevelopment && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-xs text-yellow-800 dark:text-yellow-300 font-mono">
                  DEV MODE: Check your router configuration in{' '}
                  <code>src/app/router.tsx</code>
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Floating question marks */}
        <motion.div
          className="absolute top-1/4 left-1/4 text-6xl text-blue-500/20"
          animate={{
            y: [-20, 20, -20],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 6,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        >
          ?
        </motion.div>
        
        <motion.div
          className="absolute top-3/4 right-1/4 text-8xl text-purple-500/20"
          animate={{
            y: [20, -20, 20],
            rotate: [5, -5, 5],
          }}
          transition={{
            duration: 8,
            ease: 'easeInOut',
            repeat: Infinity,
            delay: 1,
          }}
        >
          ?
        </motion.div>
        
        <motion.div
          className="absolute top-1/2 right-1/6 text-4xl text-pink-500/20"
          animate={{
            y: [-15, 15, -15],
            x: [-10, 10, -10],
            rotate: [-3, 3, -3],
          }}
          transition={{
            duration: 7,
            ease: 'easeInOut',
            repeat: Infinity,
            delay: 2,
          }}
        >
          ?
        </motion.div>
      </div>
    </div>
  );
}

export default NotFoundPage;

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/
