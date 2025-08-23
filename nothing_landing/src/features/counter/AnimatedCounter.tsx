import React, { useEffect, useState, useRef } from 'react';
import { useIntersectionObserver } from '../../shared/hooks/useIntersectionObserver';

interface AnimatedCounterProps {
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animationIntensity, setAnimationIntensity] = useState(1);
  const counterRef = useRef<HTMLDivElement>(null);
  const loadingBarRef = useRef<HTMLDivElement>(null);

  // Use intersection observer to trigger animations when component is visible
  const { ref: intersectionRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.3,
  });

  // Combine refs
  useEffect(() => {
    if (counterRef.current && intersectionRef) {
      intersectionRef.current = counterRef.current;
    }
  }, [intersectionRef]);

  useEffect(() => {
    if (isIntersecting) {
      setIsVisible(true);
    }
  }, [isIntersecting]);

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleIntensityChange = (intensity: number) => {
    setAnimationIntensity(intensity);
  };

  return (
    <div 
      ref={counterRef}
      className={`relative bg-black/20 backdrop-blur-sm rounded-lg p-8 text-center border border-gray-800 ${className}`}
      role="region"
      aria-label="Feature delivery counter"
    >
      {/* Header */}
      <h3 className="text-xl font-semibold text-gray-300 mb-6">
        Features Delivered
      </h3>

      {/* Animated Counter Display */}
      <div className="relative mb-8">
        <div 
          className="text-6xl md:text-8xl font-bold text-white mb-2 font-mono"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="relative inline-block">
            {/* Static 0 for screen readers */}
            <span className="sr-only">0</span>
            
            {/* Animated digits */}
            <span 
              className={`
                inline-block relative overflow-hidden
                ${!prefersReducedMotion && isVisible ? 'animate-pulse' : ''}
              `}
              aria-hidden="true"
            >
              <span 
                className={`
                  block transform transition-transform duration-500
                  ${!prefersReducedMotion && isVisible ? 'animate-bounce' : ''}
                `}
                style={{
                  animationDelay: '0ms',
                  animationDuration: prefersReducedMotion ? '0ms' : `${2000 / animationIntensity}ms`
                }}
              >
                0
              </span>
            </span>
          </span>
        </div>

        {/* Fake loading digits that never change */}
        {!prefersReducedMotion && (
          <div className="absolute inset-0 pointer-events-none opacity-20">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit, index) => (
              <span
                key={digit}
                className={`
                  absolute inset-0 text-6xl md:text-8xl font-bold text-green-400 font-mono
                  ${isVisible ? 'animate-pulse' : 'opacity-0'}
                `}
                style={{
                  animationDelay: `${index * 200}ms`,
                  animationDuration: `${3000 / animationIntensity}ms`,
                  opacity: 0.1
                }}
                aria-hidden="true"
              >
                {digit}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Recursive Loading Bar */}
      <div className="relative mb-6">
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            ref={loadingBarRef}
            className={`
              h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full
              ${!prefersReducedMotion && isVisible ? 'animate-loading-recursive' : 'w-0'}
            `}
            style={{
              animationDuration: prefersReducedMotion ? '0ms' : `${4000 / animationIntensity}ms`
            }}
            aria-hidden="true"
          />
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Loading features... (This may take forever)
        </div>
      </div>

      {/* Animation Controls */}
      <div className="space-y-3">
        <div className="text-sm text-gray-400 mb-2">
          Animation Intensity
        </div>
        <div className="flex justify-center space-x-2">
          {[0.5, 1, 2, 4].map((intensity) => (
            <button
              key={intensity}
              onClick={() => handleIntensityChange(intensity)}
              className={`
                px-3 py-1 text-xs rounded transition-colors
                ${animationIntensity === intensity 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
              disabled={prefersReducedMotion}
            >
              {intensity}x
            </button>
          ))}
        </div>
        
        {prefersReducedMotion && (
          <div className="text-xs text-gray-500 mt-2">
            Animations disabled due to system preference
          </div>
        )}
      </div>

      {/* Status indicator */}
      <div className="absolute top-4 right-4">
        <div 
          className={`
            w-3 h-3 rounded-full
            ${isVisible && !prefersReducedMotion ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}
          `}
          title={isVisible ? 'Counter active' : 'Counter inactive'}
        />
      </div>

      {/* Custom CSS for recursive loading animation */}
      <style jsx>{`
        @keyframes loading-recursive {
          0% {
            width: 0%;
            opacity: 1;
          }
          45% {
            width: 98%;
            opacity: 1;
          }
          50% {
            width: 100%;
            opacity: 1;
          }
          55% {
            width: 98%;
            opacity: 0.8;
          }
          75% {
            width: 50%;
            opacity: 0.5;
          }
          90% {
            width: 10%;
            opacity: 0.2;
          }
          100% {
            width: 0%;
            opacity: 0.1;
          }
        }
        
        .animate-loading-recursive {
          animation: loading-recursive 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AnimatedCounter;
