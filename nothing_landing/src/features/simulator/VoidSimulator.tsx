import React, { useRef, useEffect, useState, useCallback } from 'react';
import Button from '../../shared/components/Button';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  isDragging?: boolean;
}

interface VoidSimulatorProps {
  onClose: () => void;
}

export const VoidSimulator: React.FC<VoidSimulatorProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [speed, setSpeed] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragParticleId, setDragParticleId] = useState<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Initialize particles
  useEffect(() => {
    const initialParticles: Particle[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 400 + 50,
      y: Math.random() * 300 + 50,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      radius: Math.random() * 10 + 5,
      opacity: Math.random() * 0.5 + 0.3,
    }));
    setParticles(initialParticles);
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    setParticles(prevParticles => 
      prevParticles.map(particle => {
        let newParticle = { ...particle };

        // Skip physics if being dragged
        if (particle.isDragging) {
          return newParticle;
        }

        // Update position
        newParticle.x += newParticle.vx * speed;
        newParticle.y += newParticle.vy * speed;

        // Bounce off walls
        if (newParticle.x <= newParticle.radius || newParticle.x >= canvas.width - newParticle.radius) {
          newParticle.vx *= -0.8;
          newParticle.x = Math.max(newParticle.radius, Math.min(canvas.width - newParticle.radius, newParticle.x));
        }
        if (newParticle.y <= newParticle.radius || newParticle.y >= canvas.height - newParticle.radius) {
          newParticle.vy *= -0.8;
          newParticle.y = Math.max(newParticle.radius, Math.min(canvas.height - newParticle.radius, newParticle.y));
        }

        // Apply slight friction
        newParticle.vx *= 0.999;
        newParticle.vy *= 0.999;

        return newParticle;
      })
    );

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [speed]);

  // Draw particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100, 100, 255, ${particle.opacity})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(200, 200, 255, ${particle.opacity * 0.5})`;
      ctx.stroke();
    });
  }, [particles]);

  // Start animation
  useEffect(() => {
    animate();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);

  // Mouse event handlers
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const findParticleAt = (x: number, y: number): Particle | null => {
    return particles.find(particle => {
      const dx = particle.x - x;
      const dy = particle.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= particle.radius;
    }) || null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    const particle = findParticleAt(pos.x, pos.y);
    
    if (particle) {
      setIsDragging(true);
      setDragParticleId(particle.id);
      mouseRef.current = pos;
      
      setParticles(prev => prev.map(p => 
        p.id === particle.id ? { ...p, isDragging: true } : p
      ));
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    mouseRef.current = pos;

    if (isDragging && dragParticleId !== null) {
      setParticles(prev => prev.map(p => 
        p.id === dragParticleId 
          ? { ...p, x: pos.x, y: pos.y }
          : p
      ));
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dragParticleId !== null) {
      setParticles(prev => prev.map(p => 
        p.id === dragParticleId 
          ? { ...p, isDragging: false, vx: Math.random() * 4 - 2, vy: Math.random() * 4 - 2 }
          : p
      ));
    }
    
    setIsDragging(false);
    setDragParticleId(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) {
      const pos = getMousePos(e);
      
      // Add ripple effect at click position
      setParticles(prev => prev.map(particle => {
        const dx = particle.x - pos.x;
        const dy = particle.y - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const force = (100 - distance) / 100;
          return {
            ...particle,
            vx: particle.vx + (dx / distance) * force * 5,
            vy: particle.vy + (dy / distance) * force * 5,
          };
        }
        
        return particle;
      }));
    }
  };

  // Keyboard event handler for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Void Simulator™</h2>
        <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
          ×
        </Button>
      </div>
      
      <p className="text-gray-300 mb-4 text-sm">
        Experience the profound emptiness of nothing. Drag particles around, click for ripples, adjust speed.
        Nothing will be permanently changed.
      </p>

      <div className="mb-4 flex items-center gap-4">
        <label className="text-gray-300 text-sm flex items-center gap-2">
          Speed:
          <input
            type="range"
            min="0"
            max="3"
            step="0.5"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-xs text-gray-400">{speed}x</span>
        </label>
      </div>

      <div className="border border-gray-700 rounded-lg overflow-hidden bg-black">
        <canvas
          ref={canvasRef}
          width={500}
          height={350}
          className="block cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleClick}
        />
      </div>

      <div className="mt-4 flex justify-between items-center">
        <p className="text-xs text-gray-500">
          {particles.length} particles of nothingness simulated
        </p>
        <Button variant="secondary" onClick={onClose}>
          Close Simulator
        </Button>
      </div>
    </div>
  );
};
