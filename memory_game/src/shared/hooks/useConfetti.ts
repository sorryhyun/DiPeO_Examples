import { useCallback, useRef, useEffect } from 'react';

interface ConfettiOptions {
  duration?: number;
  particleCount?: number;
  colors?: string[];
  origin?: { x: number; y: number };
  spread?: number;
  startVelocity?: number;
}

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export const useConfetti = () => {
  const animationRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);

  const createParticle = (options: ConfettiOptions): ConfettiParticle => {
    const colors = options.colors || [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
      '#fd79a8', '#fdcb6e', '#6c5ce7', '#a29bfe', '#fd79a8'
    ];
    
    const origin = options.origin || { x: 0.5, y: 0.5 };
    const spread = options.spread || 60;
    const startVelocity = options.startVelocity || 45;
    
    const angle = (Math.random() * spread - spread / 2) * (Math.PI / 180);
    const velocity = Math.random() * startVelocity + startVelocity / 2;
    
    return {
      x: origin.x * window.innerWidth,
      y: origin.y * window.innerHeight,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - Math.random() * 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      life: 0,
      maxLife: options.duration || 3000,
    };
  };

  const createCanvas = (): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    document.body.appendChild(canvas);
    return canvas;
  };

  const updateParticles = (deltaTime: number) => {
    particlesRef.current = particlesRef.current.filter(particle => {
      particle.life += deltaTime;
      
      if (particle.life >= particle.maxLife) {
        return false;
      }
      
      // Apply physics
      particle.x += particle.vx * (deltaTime / 16.67); // Normalize to 60fps
      particle.y += particle.vy * (deltaTime / 16.67);
      particle.vy += 0.8; // Gravity
      particle.vx *= 0.99; // Air resistance
      
      return particle.y < window.innerHeight + 100; // Remove when off screen
    });
  };

  const renderParticles = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    particlesRef.current.forEach(particle => {
      const alpha = Math.max(0, 1 - (particle.life / particle.maxLife));
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      
      // Rotate particle based on velocity
      const rotation = Math.atan2(particle.vy, particle.vx);
      ctx.translate(particle.x, particle.y);
      ctx.rotate(rotation);
      
      // Draw as rectangle for confetti shape
      ctx.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
      
      ctx.restore();
    });
  };

  const animate = (ctx: CanvasRenderingContext2D) => {
    let lastTime = performance.now();
    
    const loop = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      updateParticles(deltaTime);
      renderParticles(ctx);
      
      if (particlesRef.current.length > 0) {
        animationRef.current = requestAnimationFrame(loop);
      } else {
        // Clean up when animation is done
        if (canvasRef.current) {
          document.body.removeChild(canvasRef.current);
          canvasRef.current = null;
        }
        animationRef.current = null;
      }
    };
    
    animationRef.current = requestAnimationFrame(loop);
  };

  const triggerConfetti = useCallback((options: ConfettiOptions = {}) => {
    // Clean up any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (canvasRef.current) {
      document.body.removeChild(canvasRef.current);
      canvasRef.current = null;
    }
    
    // Create new canvas and particles
    canvasRef.current = createCanvas();
    const ctx = canvasRef.current.getContext('2d');
    
    if (!ctx) return;
    
    // Create particles
    const particleCount = options.particleCount || 50;
    particlesRef.current = [];
    
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(createParticle(options));
    }
    
    // Start animation
    animate(ctx);
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (canvasRef.current && document.body.contains(canvasRef.current)) {
      document.body.removeChild(canvasRef.current);
      canvasRef.current = null;
    }
    
    particlesRef.current = [];
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { triggerConfetti };
};
