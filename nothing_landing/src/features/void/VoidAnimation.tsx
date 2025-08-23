import React, { useEffect, useRef, useCallback } from 'react';
import { useParallax } from '../../shared/hooks/useParallax';
import { useTheme } from '../shared/hooks/useTheme';

interface VoidAnimationProps {
  anchorRef?: React.RefObject<HTMLElement>;
  intensity?: number;
  speed?: number;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  speed: number;
  opacity: number;
  char: string;
}

const VoidAnimation: React.FC<VoidAnimationProps> = ({
  anchorRef,
  intensity = 0.3,
  speed = 1,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const lastTimeRef = useRef<number>(0);
  
  const { theme } = useTheme();
  const parallaxOffset = useParallax(anchorRef);
  
  const isDarkMode = theme === 'dark';
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const initParticles = useCallback((width: number, height: number) => {
    const particleCount = Math.floor((width * height) / 10000 * intensity);
    const particles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: (Math.random() * 2 + 0.5) * speed,
        opacity: Math.random() * 0.5 + 0.1,
        char: Math.random() > 0.8 ? '0' : (Math.random() > 0.5 ? '∅' : '○')
      });
    }
    
    particlesRef.current = particles;
  }, [intensity, speed]);

  const drawParticles = useCallback((
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number,
    deltaTime: number
  ) => {
    ctx.clearRect(0, 0, width, height);
    
    // Apply parallax offset
    const offsetY = parallaxOffset * 0.1;
    
    ctx.font = '14px monospace';
    ctx.fillStyle = isDarkMode 
      ? 'rgba(34, 197, 94, 0.6)' // green-500 with opacity
      : 'rgba(15, 23, 42, 0.4)'; // slate-900 with opacity
    
    particlesRef.current.forEach(particle => {
      // Update position
      particle.y += particle.speed * deltaTime * 0.1;
      
      // Reset particle if it goes off screen
      if (particle.y > height + 20) {
        particle.y = -20;
        particle.x = Math.random() * width;
      }
      
      // Apply parallax and draw
      const drawY = particle.y + offsetY;
      ctx.globalAlpha = particle.opacity;
      ctx.fillText(particle.char, particle.x, drawY);
    });
    
    ctx.globalAlpha = 1;
  }, [parallaxOffset, isDarkMode]);

  const animate = useCallback((currentTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;
    
    const { width, height } = canvas;
    
    if (particlesRef.current.length === 0) {
      initParticles(width, height);
    }
    
    drawParticles(ctx, width, height, deltaTime);
    
    if (!prefersReducedMotion) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [drawParticles, initParticles, prefersReducedMotion]);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Reinitialize particles for new dimensions
    initParticles(rect.width, rect.height);
  }, [initParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set initial canvas size
    handleResize();
    
    // Start animation
    lastTimeRef.current = performance.now();
    if (!prefersReducedMotion) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    // Add resize listener
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [animate, handleResize, prefersReducedMotion]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-1000 ${className}`}
      style={{
        width: '100%',
        height: '100%'
      }}
      aria-hidden="true"
    />
  );
};

export default VoidAnimation;
