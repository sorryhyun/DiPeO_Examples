import React, { useRef, useEffect, useState, useCallback } from 'react';

interface MatrixRainProps {
  className?: string;
  intensity?: number; // 0-1, controls density of falling zeros
  speed?: number; // 1-5, controls falling speed
  opacity?: number; // 0-1, controls overall opacity
}

interface Drop {
  x: number;
  y: number;
  speed: number;
  opacity: number;
}

export const MatrixRain: React.FC<MatrixRainProps> = ({
  className = '',
  intensity = 0.5,
  speed = 2,
  opacity = 0.3
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const dropsRef = useRef<Drop[]>([]);
  const lastTimeRef = useRef<number>(0);
  
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Initialize drops
  const initializeDrops = useCallback((width: number, height: number) => {
    const dropCount = Math.floor((width * height * intensity) / 10000);
    dropsRef.current = [];
    
    for (let i = 0; i < dropCount; i++) {
      dropsRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: (Math.random() * speed + 0.5) * 50, // pixels per second
        opacity: Math.random() * 0.5 + 0.3
      });
    }
  }, [intensity, speed]);

  // Animation loop
  const animate = useCallback((currentTime: number) => {
    if (!canvasRef.current || prefersReducedMotion || !isVisible) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    // Clear canvas with fade effect
    ctx.fillStyle = `rgba(0, 0, 0, 0.05)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set text properties for zeros
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';

    // Update and draw drops
    dropsRef.current.forEach(drop => {
      // Update position
      drop.y += (drop.speed * deltaTime) / 1000;
      
      // Reset drop if it goes off screen
      if (drop.y > canvas.height + 20) {
        drop.y = -20;
        drop.x = Math.random() * canvas.width;
        drop.speed = (Math.random() * speed + 0.5) * 50;
        drop.opacity = Math.random() * 0.5 + 0.3;
      }

      // Draw the zero
      const alpha = drop.opacity * opacity;
      ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
      ctx.fillText('0', drop.x, drop.y);
      
      // Add slight glow effect
      ctx.shadowBlur = 3;
      ctx.shadowColor = 'rgba(0, 255, 0, 0.5)';
      ctx.fillText('0', drop.x, drop.y);
      ctx.shadowBlur = 0;
    });

    animationRef.current = requestAnimationFrame(animate);
  }, [prefersReducedMotion, isVisible, speed, opacity]);

  // Setup canvas and start animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      initializeDrops(canvas.width, canvas.height);
    };

    // Initial setup
    resizeCanvas();

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(canvas);

    // Start animation
    if (!prefersReducedMotion && isVisible) {
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [animate, initializeDrops, prefersReducedMotion, isVisible]);

  // Restart animation when visibility or motion preference changes
  useEffect(() => {
    if (prefersReducedMotion || !isVisible) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
    } else {
      if (!animationRef.current) {
        lastTimeRef.current = performance.now();
        animationRef.current = requestAnimationFrame(animate);
      }
    }
  }, [prefersReducedMotion, isVisible, animate]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 w-full h-full ${className}`}
      style={{
        background: 'transparent',
        display: prefersReducedMotion ? 'none' : 'block'
      }}
      aria-hidden="true"
      role="presentation"
    />
  );
};
