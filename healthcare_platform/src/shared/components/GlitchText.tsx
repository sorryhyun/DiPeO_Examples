import React, { useEffect, useRef, useState, useMemo } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  trigger?: 'hover' | 'always' | 'click';
  duration?: number;
  glitchChars?: string;
}

export const GlitchText: React.FC<GlitchTextProps> = ({
  text,
  className = '',
  intensity = 'medium',
  trigger = 'hover',
  duration = 2000,
  glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?~`'
}) => {
  const [isGlitching, setIsGlitching] = useState(trigger === 'always');
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef<NodeJS.Timeout>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLSpanElement>(null);

  const glitchConfig = useMemo(() => {
    const configs = {
      low: { speed: 150, corruptionRate: 0.1, maxIterations: 8 },
      medium: { speed: 100, corruptionRate: 0.2, maxIterations: 12 },
      high: { speed: 50, corruptionRate: 0.3, maxIterations: 20 }
    };
    return configs[intensity];
  }, [intensity]);

  const startGlitch = () => {
    if (intervalRef.current) return;
    
    setIsGlitching(true);
    let iterations = 0;
    const originalText = text;

    intervalRef.current = setInterval(() => {
      if (iterations >= glitchConfig.maxIterations) {
        setDisplayText(originalText);
        stopGlitch();
        return;
      }

      const glitchedText = originalText
        .split('')
        .map(char => {
          if (Math.random() < glitchConfig.corruptionRate && char !== ' ') {
            return glitchChars[Math.floor(Math.random() * glitchChars.length)];
          }
          return char;
        })
        .join('');

      setDisplayText(glitchedText);
      iterations++;
    }, glitchConfig.speed);

    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        stopGlitch();
      }, duration);
    }
  };

  const stopGlitch = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    setDisplayText(text);
    if (trigger !== 'always') {
      setIsGlitching(false);
    }
  };

  useEffect(() => {
    if (trigger === 'always') {
      const cycleGlitch = () => {
        startGlitch();
        setTimeout(() => {
          const nextCycle = Math.random() * 3000 + 2000; // Random interval between 2-5 seconds
          setTimeout(cycleGlitch, nextCycle);
        }, duration);
      };
      
      const initialDelay = Math.random() * 1000; // Random initial delay
      setTimeout(cycleGlitch, initialDelay);
    }

    return () => {
      stopGlitch();
    };
  }, [trigger, duration]);

  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      startGlitch();
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      stopGlitch();
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      startGlitch();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (trigger === 'click' && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      startGlitch();
    }
  };

  return (
    <span
      ref={containerRef}
      className={`
        relative inline-block font-mono transition-all duration-200
        ${isGlitching ? 'animate-pulse' : ''}
        ${trigger === 'hover' ? 'cursor-pointer' : ''}
        ${trigger === 'click' ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500' : ''}
        ${className}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={trigger === 'click' ? 0 : undefined}
      role={trigger === 'click' ? 'button' : undefined}
      aria-label={trigger === 'click' ? `Click to glitch: ${text}` : undefined}
      style={{
        textShadow: isGlitching 
          ? `
              2px 0 0 #ff0000,
              -2px 0 0 #00ff00,
              0 2px 0 #0000ff,
              0 -2px 0 #ffff00
            `
          : 'none',
        filter: isGlitching ? 'contrast(1.2) brightness(1.1)' : 'none',
      }}
    >
      {displayText}
      
      {/* Glitch overlay effects */}
      {isGlitching && (
        <>
          <span
            className="absolute inset-0 opacity-70 mix-blend-multiply"
            style={{
              color: '#ff0000',
              transform: `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`,
              clipPath: `inset(${Math.random() * 100}% 0 ${Math.random() * 100}% 0)`,
            }}
            aria-hidden="true"
          >
            {displayText}
          </span>
          <span
            className="absolute inset-0 opacity-70 mix-blend-multiply"
            style={{
              color: '#00ff00',
              transform: `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`,
              clipPath: `inset(0 ${Math.random() * 100}% 0 ${Math.random() * 100}%)`,
            }}
            aria-hidden="true"
          >
            {displayText}
          </span>
          <span
            className="absolute inset-0 opacity-50 mix-blend-screen"
            style={{
              color: '#0000ff',
              transform: `translate(${Math.random() * 2 - 1}px, ${Math.random() * 2 - 1}px)`,
              clipPath: `inset(${Math.random() * 50}% ${Math.random() * 50}% ${Math.random() * 50}% ${Math.random() * 50}%)`,
            }}
            aria-hidden="true"
          >
            {displayText}
          </span>
        </>
      )}
      
      {/* Scanline effect */}
      {isGlitching && (
        <span
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background: `linear-gradient(
              90deg,
              transparent 0%,
              transparent 48%,
              rgba(255,255,255,0.8) 49%,
              rgba(255,255,255,0.8) 51%,
              transparent 52%,
              transparent 100%
            )`,
            animation: `glitch-scan ${glitchConfig.speed * 2}ms infinite linear`,
          }}
          aria-hidden="true"
        />
      )}
    </span>
  );
};

// CSS-in-JS animation keyframes would be handled by Tailwind or global CSS
// Adding inline styles for the scanline animation effect
const glitchScanKeyframes = `
  @keyframes glitch-scan {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

// Inject keyframes into document head if not already present
if (typeof document !== 'undefined' && !document.getElementById('glitch-text-styles')) {
  const style = document.createElement('style');
  style.id = 'glitch-text-styles';
  style.textContent = glitchScanKeyframes;
  document.head.appendChild(style);
}
