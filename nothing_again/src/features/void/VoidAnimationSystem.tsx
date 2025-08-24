import React, { useCallback, useEffect, useRef, useState } from 'react';
import { VoidCanvas } from './VoidCanvas';
import { MatrixRain } from '@/shared/components/MatrixRain';
import { RecursiveLoader } from '@/shared/components/RecursiveLoader';

interface VoidAnimationSystemProps {
  mode?: 'light' | 'medium' | 'heavy';
  className?: string;
  onParallaxUpdate?: (offset: number) => void;
}

export const VoidAnimationSystem: React.FC<VoidAnimationSystemProps> = ({
  mode = 'medium',
  className = '',
  onParallaxUpdate
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Scroll-based parallax handler
  const handleScroll = useCallback(() => {
    if (isReducedMotion) return;

    const scrollY = window.scrollY;
    const parallaxOffset = scrollY * 0.3; // Reduced parallax speed
    
    setScrollOffset(parallaxOffset);
    onParallaxUpdate?.(parallaxOffset);
  }, [isReducedMotion, onParallaxUpdate]);

  useEffect(() => {
    if (isReducedMotion) return;

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll, isReducedMotion]);

  // Calculate intensity-based properties
  const getIntensityConfig = () => {
    if (isReducedMotion) {
      return {
        particleCount: 0,
        matrixDensity: 0,
        loaderComplexity: 1,
        opacity: 0.3
      };
    }

    switch (mode) {
      case 'light':
        return {
          particleCount: 50,
          matrixDensity: 10,
          loaderComplexity: 2,
          opacity: 0.4
        };
      case 'heavy':
        return {
          particleCount: 200,
          matrixDensity: 30,
          loaderComplexity: 8,
          opacity: 0.8
        };
      default: // medium
        return {
          particleCount: 100,
          matrixDensity: 20,
          loaderComplexity: 4,
          opacity: 0.6
        };
    }
  };

  const config = getIntensityConfig();

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      aria-hidden="true"
      role="presentation"
    >
      {/* Background void canvas layer */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          transform: `translateY(${scrollOffset * 0.2}px)`,
          opacity: config.opacity * 0.3
        }}
      >
        <VoidCanvas
          particleCount={config.particleCount}
          className="w-full h-full"
        />
      </div>

      {/* Matrix rain layer */}
      <div 
        className="absolute inset-0 z-10"
        style={{
          transform: `translateY(${scrollOffset * 0.4}px)`,
          opacity: config.opacity * 0.6
        }}
      >
        <MatrixRain
          intensity={config.matrixDensity / 100}
          className="w-full h-full text-gray-400/30 dark:text-gray-600/30"
        />
      </div>

      {/* Recursive loader overlay layer */}
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
        style={{
          transform: `translate(-50%, -50%) translateY(${scrollOffset * -0.1}px)`,
          opacity: config.opacity * 0.4
        }}
      >
        <RecursiveLoader
          depth={config.loaderComplexity}
          size={mode === 'heavy' ? 'lg' : mode === 'light' ? 'sm' : 'md'}
          className="text-gray-500/20 dark:text-gray-400/20"
        />
      </div>

      {/* Gradient overlay for visual cohesion */}
      <div className="absolute inset-0 z-30 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/10 dark:to-white/5" />
    </div>
  );
};
