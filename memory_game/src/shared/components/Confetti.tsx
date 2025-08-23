import React, { useEffect, useRef, useCallback } from 'react';

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
  maxLife: number;
}

interface ConfettiProps {
  play?: boolean;
  duration?: number;
  particleCount?: number;
  colors?: string[];
}

const Confetti: React.FC<ConfettiProps> = ({
  play = false,
  duration = 3000,
  particleCount = 100,
  colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24',
    '#6c5ce7', '#a29bfe', '#fd79a8', '#00b894'
  ]
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<ConfettiParticle[]>([]);
  const startTimeRef = useRef<number>(0);

  const createParticle = useCallback((): ConfettiParticle => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error('Canvas not available');

    return {
      x: Math.random() * canvas.width,
      y: -10,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 3 + 2,
      gravity: 0.15,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 4 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      life: 0,
      maxLife: Math.random() * 60 + 60
    };
  }, [colors]);

  const updateParticle = useCallback((particle: ConfettiParticle): boolean => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += particle.gravity;
    particle.rotation += particle.rotationSpeed;
    particle.life += 1;

    // Bounce off walls
    const canvas = canvasRef.current;
    if (canvas) {
      if (particle.x < 0 || particle.x > canvas.width) {
        particle.vx *= -0.5;
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
      }
    }

    return particle.life < particle.maxLife && (canvas ? particle.y < canvas.height + 10 : true);
  }, []);

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: ConfettiParticle) => {
    const alpha = Math.max(0, 1 - particle.life / particle.maxLife);
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(particle.x, particle.y);
    ctx.rotate((particle.rotation * Math.PI) / 180);
    
    ctx.fillStyle = particle.color;
    ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
    
    ctx.restore();
  }, []);

  const animate = useCallback((currentTime: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = currentTime;
    }

    const elapsed = currentTime - startTimeRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Add new particles during the first part of the animation
    if (elapsed < duration / 2 && particlesRef.current.length < particleCount) {
      const particlesToAdd = Math.min(5, particleCount - particlesRef.current.length);
      for (let i = 0; i < particlesToAdd; i++) {
        particlesRef.current.push(createParticle());
      }
    }

    // Update and draw particles
    particlesRef.current = particlesRef.current.filter(particle => {
      const isAlive = updateParticle(particle);
      if (isAlive) {
        drawParticle(ctx, particle);
      }
      return isAlive;
    });

    // Continue animation if we have particles or haven't reached duration
    if (particlesRef.current.length > 0 || elapsed < duration) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      // Animation complete
      startTimeRef.current = 0;
    }
  }, [duration, particleCount, createParticle, updateParticle, drawParticle]);

  const startAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    particlesRef.current = [];
    startTimeRef.current = 0;
    animationRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
    
    particlesRef.current = [];
    startTimeRef.current = 0;
    
    // Clear canvas
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    
    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [resizeCanvas]);

  useEffect(() => {
    if (play) {
      startAnimation();
    } else {
      stopAnimation();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [play, startAnimation, stopAnimation]);

  if (!play) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      style={{
        width: '100vw',
        height: '100vh'
      }}
    />
  );
};

export default Confetti;
