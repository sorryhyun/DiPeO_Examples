import React, { useState, useEffect, useRef } from 'react';

interface AnimatedZeroCounterProps {
  className?: string;
}

export const AnimatedZeroCounter: React.FC<AnimatedZeroCounterProps> = ({
  className = ''
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefersReducedMotion = useRef(false);

  const fullText = '0 features delivered';

  useEffect(() => {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mediaQuery.matches;

    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    // If user prefers reduced motion, show static text
    if (prefersReducedMotion.current) {
      setDisplayText(fullText);
      return;
    }

    const startAnimation = () => {
      let currentIndex = 0;
      setIsTyping(true);
      setDisplayText('');

      // Typing phase
      intervalRef.current = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setDisplayText(fullText.slice(0, currentIndex));
          currentIndex++;
        } else {
          // Typing complete, pause before erasing
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          
          timeoutRef.current = setTimeout(() => {
            // Start erasing phase
            setIsTyping(false);
            let eraseIndex = fullText.length;
            
            intervalRef.current = setInterval(() => {
              if (eraseIndex >= 0) {
                setDisplayText(fullText.slice(0, eraseIndex));
                eraseIndex--;
              } else {
                // Erasing complete, pause before restarting
                if (intervalRef.current) {
                  clearInterval(intervalRef.current);
                }
                
                timeoutRef.current = setTimeout(() => {
                  startAnimation(); // Restart the cycle
                }, 1000);
              }
            }, 50);
          }, 2000); // Pause for 2 seconds before erasing
        }
      }, 100);
    };

    startAnimation();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`inline-block ${className}`}>
      <span
        className="font-mono text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent"
        aria-live="polite"
        aria-label="Animated counter showing zero features delivered"
      >
        {displayText}
        {!prefersReducedMotion.current && (
          <span
            className={`inline-block w-0.5 h-6 md:h-8 ml-1 bg-current animate-pulse ${
              isTyping ? 'opacity-100' : 'opacity-60'
            }`}
            aria-hidden="true"
          >
            |
          </span>
        )}
      </span>
    </div>
  );
};
