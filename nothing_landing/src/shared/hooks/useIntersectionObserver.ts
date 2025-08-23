import { useCallback, useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
  triggerOnce?: boolean;
}

interface UseIntersectionObserverReturn {
  ref: (node: Element | null) => void;
  elementRef: (node: Element | null) => void;
  isIntersecting: boolean;
  isVisible: boolean;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0.1,
    once = false,
    triggerOnce = false
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<Element | null>(null);
  const rafRef = useRef<number | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const entry = entries[0];
        if (entry) {
          setIsIntersecting(entry.isIntersecting);
          
          if ((once || triggerOnce) && entry.isIntersecting && observerRef.current && elementRef.current) {
            observerRef.current.unobserve(elementRef.current);
            observerRef.current = null;
          }
        }
      });
    },
    [once, triggerOnce]
  );

  const ref = useCallback(
    (node: Element | null) => {
      if (elementRef.current && observerRef.current) {
        observerRef.current.unobserve(elementRef.current);
      }

      elementRef.current = node;

      if (!node) return;

      // SSR guard
      if (typeof window === 'undefined' || !window.IntersectionObserver) {
        return;
      }

      observerRef.current = new IntersectionObserver(handleIntersection, {
        root,
        rootMargin,
        threshold
      });

      observerRef.current.observe(node);
    },
    [root, rootMargin, threshold, handleIntersection]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current && elementRef.current) {
        observerRef.current.unobserve(elementRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return { 
    ref, 
    elementRef: ref, 
    isIntersecting, 
    isVisible: isIntersecting 
  };
}
