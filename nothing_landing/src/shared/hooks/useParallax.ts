import { useRef, useEffect, useState, RefCallback } from 'react';

interface UseParallaxOptions {
  multiplier?: number;
  enabled?: boolean;
}

interface ParallaxResult {
  ref: RefCallback<HTMLElement>;
  style: React.CSSProperties;
}

export const useParallax = (options: UseParallaxOptions = {}): ParallaxResult => {
  const { multiplier = 0.5, enabled = true } = options;
  const elementRef = useRef<HTMLElement | null>(null);
  const [transform, setTransform] = useState('translateY(0px)');
  const animationFrameRef = useRef<number>();

  // Check for prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  const updateParallax = () => {
    if (!elementRef.current || !enabled || prefersReducedMotion) {
      setTransform('translateY(0px)');
      return;
    }

    const element = elementRef.current;
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate element's position relative to viewport center
    const elementCenter = rect.top + rect.height / 2;
    const viewportCenter = windowHeight / 2;
    const offset = (elementCenter - viewportCenter) * multiplier;

    setTransform(`translateY(${offset}px)`);
  };

  const handleScroll = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(updateParallax);
  };

  const ref: RefCallback<HTMLElement> = (element) => {
    elementRef.current = element;
    if (element) {
      // Initial calculation
      updateParallax();
    }
  };

  useEffect(() => {
    if (!enabled || prefersReducedMotion) {
      return;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    // Initial calculation
    updateParallax();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, multiplier, prefersReducedMotion]);

  return {
    ref,
    style: {
      transform,
      willChange: enabled && !prefersReducedMotion ? 'transform' : 'auto'
    }
  };
};

export default useParallax;
