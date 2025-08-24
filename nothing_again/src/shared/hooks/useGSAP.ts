import { useEffect, useRef, useCallback, useState } from 'react';

export interface GSAPTimelineConfig {
  paused?: boolean;
  delay?: number;
  repeat?: number;
  yoyo?: boolean;
  ease?: string;
}

export interface UseGSAPReturn {
  timeline: gsap.core.Timeline | null;
  setRef: (element: HTMLElement | null) => void;
  setupGSAP: (element: HTMLElement, callback: (timeline: gsap.core.Timeline) => void) => void;
  isReady: boolean;
}

export const useGSAP = (config?: GSAPTimelineConfig): UseGSAPReturn => {
  const [gsap, setGsap] = useState<typeof import('gsap').gsap | null>(null);
  const [isReady, setIsReady] = useState(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  // Dynamically import GSAP to avoid SSR issues
  useEffect(() => {
    let mounted = true;

    const loadGSAP = async () => {
      try {
        const gsapModule = await import('gsap');
        if (mounted) {
          setGsap(gsapModule.gsap);
          setIsReady(true);
        }
      } catch (error) {
        console.warn('Failed to load GSAP:', error);
      }
    };

    loadGSAP();

    return () => {
      mounted = false;
    };
  }, []);

  // Create timeline when GSAP is loaded and element is set
  useEffect(() => {
    if (!gsap || !elementRef.current) return;

    // Kill existing timeline if it exists
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    // Create new timeline with config
    timelineRef.current = gsap.timeline({
      paused: config?.paused ?? false,
      delay: config?.delay ?? 0,
      repeat: config?.repeat ?? 0,
      yoyo: config?.yoyo ?? false,
      ease: config?.ease ?? 'power2.out',
    });

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
    };
  }, [gsap, config]);

  // Stable ref setter callback
  const setRef = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;

    // If GSAP is ready and we have an element, recreate timeline
    if (gsap && element) {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      timelineRef.current = gsap.timeline({
        paused: config?.paused ?? false,
        delay: config?.delay ?? 0,
        repeat: config?.repeat ?? 0,
        yoyo: config?.yoyo ?? false,
        ease: config?.ease ?? 'power2.out',
      });
    }
  }, [gsap, config]);

  // Setup GSAP with callback function
  const setupGSAP = useCallback((element: HTMLElement, callback: (timeline: gsap.core.Timeline) => void) => {
    if (!gsap) return;
    
    // Set the element reference
    elementRef.current = element;
    
    // Kill existing timeline if it exists
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    // Create new timeline with config
    timelineRef.current = gsap.timeline({
      paused: config?.paused ?? false,
      delay: config?.delay ?? 0,
      repeat: config?.repeat ?? 0,
      yoyo: config?.yoyo ?? false,
      ease: config?.ease ?? 'power2.out',
    });

    // Execute the callback with the timeline
    if (timelineRef.current) {
      callback(timelineRef.current);
    }
  }, [gsap, config]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
    };
  }, []);

  return {
    timeline: timelineRef.current,
    setRef,
    setupGSAP,
    isReady,
  };
};

/*
Self-check:
- [x] Uses `@/` imports only (no internal imports needed)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (not applicable for this hook)
- [x] Exports default named component (exports named hook function)
- [x] Adds basic ARIA and keyboard handlers (not applicable for animation hook)
*/
