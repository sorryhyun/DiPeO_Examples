// filepath: src/features/hero/Hero.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { config } from '@/app/config';
import { eventBus } from '@/core/events';
import ParallaxVoid from './ParallaxVoid';
import GlitchText from './GlitchText';
import MatrixRainZero from './MatrixRainZero';
import AnimatedCounter from '@/features/counter/AnimatedCounter';
import Button from '@/shared/components/Button';
import ResponsiveContainer from '@/shared/layouts/ResponsiveContainer';

interface HeroProps {
  className?: string;
}

const Hero: React.FC<HeroProps> = ({ className = '' }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [counterValue, setCounterValue] = useState(0);

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => setIsLoaded(true), 500);
    
    // Existential counter logic - counting the void
    const counterTimer = setInterval(() => {
      setCounterValue(prev => prev + Math.floor(Math.random() * 42) + 1);
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearInterval(counterTimer);
    };
  }, []);

  const handlePrimaryCTA = () => {
    eventBus.emit('hero:primary-cta-clicked', {
      timestamp: Date.now(),
      counterValue
    });
  };

  const handleSecondaryCTA = () => {
    eventBus.emit('hero:secondary-cta-clicked', {
      timestamp: Date.now(),
      counterValue
    });
  };

  return (
    <section 
      className={`relative min-h-screen overflow-hidden bg-black text-white ${className}`}
      aria-label="Hero section"
    >
      {/* Parallax void background */}
      <div className="absolute inset-0 z-0">
        <ParallaxVoid />
      </div>

      {/* Matrix rain overlay */}
      <div className="absolute inset-0 z-10 opacity-30">
        <MatrixRainZero />
      </div>

      {/* Main content */}
      <ResponsiveContainer className="relative z-20">
        <div className="flex min-h-screen flex-col items-center justify-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 50 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="text-center"
          >
            {/* Glitch heading */}
            <div className="mb-8">
              <GlitchText
                text="Embrace the Void"
                className="text-6xl md:text-8xl lg:text-9xl font-bold"
              />
            </div>

            {/* Existential subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoaded ? 1 : 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mb-12 text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              In the infinite expanse of nothingness lies everything.
              <br />
              Experience the profound beauty of absolute void.
            </motion.p>

            {/* Animated counter */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.8 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="mb-12"
            >
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2 uppercase tracking-wider">
                  Void Particles Contemplated
                </p>
                <AnimatedCounter
                  value={counterValue}
                  className="text-4xl md:text-5xl font-mono text-green-400"
                />
              </div>
            </motion.div>

            {/* Primary CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ delay: 1.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                variant="primary"
                size="large"
                onClick={handlePrimaryCTA}
                className="bg-white text-black hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
                aria-label="Enter the void - primary action"
              >
                Enter the Void
              </Button>
              
              <Button
                variant="secondary"
                size="large"
                onClick={handleSecondaryCTA}
                className="border border-white text-white hover:bg-white hover:text-black transition-all duration-300"
                aria-label="Learn more about the void"
              >
                Contemplate Nothingness
              </Button>
            </motion.div>

            {/* Existential quote */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoaded ? 1 : 0 }}
              transition={{ delay: 2, duration: 1 }}
              className="mt-16 max-w-2xl mx-auto"
            >
              <blockquote className="text-sm md:text-base text-gray-400 italic border-l-2 border-gray-600 pl-4">
                "The void does not stare back—it simply is, and in its being,
                we find the profound silence that speaks louder than any sound."
                <footer className="mt-2 text-xs text-gray-500">
                  — Anonymous Void Philosopher
                </footer>
              </blockquote>
            </motion.div>
          </motion.div>
        </div>
      </ResponsiveContainer>

      {/* Ambient glow effect */}
      <div className="absolute inset-0 z-5 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-500/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
    </section>
  );
};

export default Hero;
