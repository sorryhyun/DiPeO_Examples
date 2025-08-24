import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RecursiveLoaderProps {
  className?: string;
  depth?: number;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'void' | 'default';
}

interface LoaderBarProps {
  depth: number;
  maxDepth: number;
  delay: number;
  size: 'sm' | 'md' | 'lg';
  theme: 'void' | 'default';
}

const LoaderBar: React.FC<LoaderBarProps> = ({ depth, maxDepth, delay, size, theme }) => {
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const speed = 0.5 + (depth * 0.2);
        const newProgress = prev + (direction * speed);
        
        // Never actually reach 100%, bounce between 5-95%
        if (newProgress >= 95) {
          setDirection(-1);
          return 95;
        } else if (newProgress <= 5) {
          setDirection(1);
          return 5;
        }
        
        return newProgress;
      });
    }, 50 + (delay * 10));

    return () => clearInterval(interval);
  }, [direction, delay, depth]);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const themeClasses = {
    void: 'bg-gray-800 border-gray-600',
    default: 'bg-gray-200 border-gray-300'
  };

  const progressThemeClasses = {
    void: 'bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400',
    default: 'bg-gradient-to-r from-blue-500 to-green-500'
  };

  return (
    <div className="w-full mb-1">
      <div
        className={`
          w-full rounded-full border overflow-hidden
          ${sizeClasses[size]}
          ${themeClasses[theme]}
        `}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Loading progress level ${depth + 1}`}
      >
        <motion.div
          className={`
            h-full rounded-full
            ${progressThemeClasses[theme]}
          `}
          initial={{ width: '5%' }}
          animate={{ width: `${progress}%` }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 15
          }}
        />
      </div>
      
      {depth < maxDepth - 1 && (
        <div className="ml-4 mt-1">
          <LoaderBar
            depth={depth + 1}
            maxDepth={maxDepth}
            delay={delay + depth}
            size={size}
            theme={theme}
          />
        </div>
      )}
    </div>
  );
};

export const RecursiveLoader: React.FC<RecursiveLoaderProps> = ({
  className = '',
  depth = 3,
  size = 'md',
  theme = 'default'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Delay initial appearance for dramatic effect
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  // Respect reduced motion preferences
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  if (prefersReducedMotion) {
    return (
      <div 
        className={`space-y-2 ${className}`}
        role="status"
        aria-label="Loading in progress"
      >
        {Array.from({ length: depth }).map((_, index) => (
          <div
            key={index}
            className={`
              w-full rounded-full border
              ${size === 'sm' ? 'h-1' : size === 'md' ? 'h-2' : 'h-3'}
              ${theme === 'void' ? 'bg-gray-800 border-gray-600' : 'bg-gray-200 border-gray-300'}
            `}
            style={{ marginLeft: `${index * 16}px` }}
          >
            <div
              className={`
                h-full w-1/2 rounded-full
                ${theme === 'void' 
                  ? 'bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400' 
                  : 'bg-gradient-to-r from-blue-500 to-green-500'
                }
              `}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div 
      className={`${className}`}
      role="status"
      aria-label="Recursive loading animation"
    >
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <LoaderBar
              depth={0}
              maxDepth={Math.max(1, Math.min(depth, 5))} // Clamp between 1-5
              delay={0}
              size={size}
              theme={theme}
            />
            
            {/* Subtle hint that this will never complete */}
            <motion.div
              className={`
                text-xs text-center mt-2 opacity-60
                ${theme === 'void' ? 'text-gray-400' : 'text-gray-500'}
              `}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 2 }}
            >
              Calculating the meaning of nothing...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecursiveLoader;
