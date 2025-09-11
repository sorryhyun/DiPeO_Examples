
// filepath: src/features/hero/ParallaxVoid.tsx
// [ ] Uses `@/` imports as much as possible
// [ ] Uses providers/hooks (no direct DOM/localStorage side effects) 
// [ ] Reads config from `@/app/config`
// [ ] Exports default named component
// [ ] Adds basic ARIA and keyboard handlers (where relevant)

import React, { useRef, useEffect, useState } from 'react';
import { ParticleVoid } from '@/features/void/ParticleVoid';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';
import { createParallaxController } from '@/utils/three';
import { config } from '@/app/config';

interface ParallaxLayer {
  id: string;
  element: HTMLDivElement;
  speed: number;
  offset: number;
}

interface ParallaxVoidProps {
  className?: string;
  intensity?: number;
  children?: React.ReactNode;
}

export default function ParallaxVoid({ 
  className = '',
  intensity = 1,
  children 
}: ParallaxVoidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<ParallaxLayer[]>([]);
  const animationFrameRef = useRef<number>();
  const [isInitialized, setIsInitialized] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Parallax scroll handler
  const handleScroll = React.useCallback(() => {
    if (prefersReducedMotion || !isInitialized) return;

    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const scrollProgress = Math.min(scrollY / viewportHeight, 1);

    layersRef.current.forEach((layer) => {
      const parallaxOffset = scrollProgress * layer.speed * intensity;
      const totalOffset = layer.offset + parallaxOffset;
      
      layer.element.style.transform = `translate3d(0, ${totalOffset}px, 0)`;
    });
  }, [prefersReducedMotion, isInitialized, intensity]);

  // Throttled scroll handler using RAF
  const throttledScrollHandler = React.useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(handleScroll);
  }, [handleScroll]);

  // Initialize parallax layers
  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion) return;

    const container = containerRef.current;
    const layers: ParallaxLayer[] = [];

    // Create parallax layers
    const layerConfigs = [
      { id: 'bg-layer', speed: -20, offset: 0 },
      { id: 'mid-layer', speed: -40, offset: 0 },
      { id: 'fg-layer', speed: -60, offset: 0 }
    ];

    layerConfigs.forEach((config, index) => {
      const layerElement = document.createElement('div');
      layerElement.className = `parallax-layer parallax-layer-${index}`;
      layerElement.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        will-change: transform;
        pointer-events: none;
        z-index: ${index - layerConfigs.length};
      `;

      container.appendChild(layerElement);
      
      layers.push({
        id: config.id,
        element: layerElement,
        speed: config.speed,
        offset: config.offset
      });
    });

    layersRef.current = layers;
    setIsInitialized(true);

    return () => {
      layers.forEach(layer => {
        if (layer.element.parentNode) {
          layer.element.parentNode.removeChild(layer.element);
        }
      });
      layersRef.current = [];
      setIsInitialized(false);
    };
  }, [prefersReducedMotion]);

  // Setup scroll listener
  useEffect(() => {
    if (prefersReducedMotion || !isInitialized) return;

    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    
    // Initial call
    throttledScrollHandler();

    return () => {
      window.removeEventListener('scroll', throttledScrollHandler);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [throttledScrollHandler, prefersReducedMotion, isInitialized]);

  // Resize handler for responsive parallax
  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleResize = () => {
      // Recalculate parallax on resize
      throttledScrollHandler();
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [throttledScrollHandler, prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      role="presentation"
      aria-hidden="true"
      style={{
        minHeight: '100vh',
        perspective: config.isDevelopment ? '1000px' : undefined
      }}
    >
      {/* Main void particle system */}
      <div className="absolute inset-0 z-10">
        <ParticleVoid 
          intensity={prefersReducedMotion ? 0 : intensity}
          className="w-full h-full"
        />
      </div>

      {/* Content layer */}
      {children && (
        <div className="relative z-20 h-full">
          {children}
        </div>
      )}

      {/* Reduced motion fallback */}
      {prefersReducedMotion && (
        <div 
          className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40 z-5"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

// Export types for external use
export type { ParallaxVoidProps };
