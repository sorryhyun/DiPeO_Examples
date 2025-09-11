// src/features/testimonials/Testimonials.tsx
// Self-confirm comments:
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React, { useState, useEffect, useCallback } from 'react';
import { TestimonialBubble } from './TestimonialBubble';
import { nothingService } from '@/services/nothingService';
import Skeleton from '@/shared/components/Skeleton';
import { useFetch } from '@/hooks/useFetch';
import { config } from '@/app/config';
import { eventBus } from '@/core/events';

interface Testimonial {
  id: string;
  author: string;
  role: string;
  company: string;
  content: string;
  avatar?: string;
  rating: number;
}

interface TestimonialsProps {
  maxBubbles?: number;
  animationSpeed?: 'slow' | 'normal' | 'fast';
  className?: string;
}

export default function Testimonials({ 
  maxBubbles = 5, 
  animationSpeed = 'normal',
  className = ''
}: TestimonialsProps) {
  const [activeBubbles, setActiveBubbles] = useState<(Testimonial & { x: number; y: number; drift: number })[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const { data: testimonials, loading, error } = useFetch<Testimonial[]>(
    `${config.apiBaseUrl}/testimonials`,
    {
      fallback: [],
      retries: 2
    }
  );

  const generateBubble = useCallback((testimonial: Testimonial) => {
    const x = Math.random() * 80 + 10; // 10-90% from left
    const y = Math.random() * 60 + 20; // 20-80% from top
    const drift = (Math.random() - 0.5) * 2; // -1 to 1 drift factor
    
    return {
      ...testimonial,
      x,
      y,
      drift
    };
  }, []);

  const addTestimonial = useCallback(() => {
    if (!testimonials || testimonials.length === 0) return;
    
    const testimonial = testimonials[currentIndex % testimonials.length];
    const bubble = generateBubble(testimonial);
    
    setActiveBubbles(prev => {
      const newBubbles = [bubble, ...prev.slice(0, maxBubbles - 1)];
      return newBubbles;
    });
    
    setCurrentIndex(prev => prev + 1);
    
    // Emit event for analytics
    eventBus.emit('testimonial:displayed', { testimonialId: testimonial.id });
  }, [testimonials, currentIndex, maxBubbles, generateBubble]);

  const removeBubble = useCallback((id: string) => {
    setActiveBubbles(prev => prev.filter(bubble => bubble.id !== id));
    eventBus.emit('testimonial:disappeared', { testimonialId: id });
  }, []);

  // Auto-generate testimonials
  useEffect(() => {
    if (!testimonials || testimonials.length === 0) return;
    
    const speeds = {
      slow: 8000,
      normal: 5000,
      fast: 3000
    };
    
    const interval = setInterval(addTestimonial, speeds[animationSpeed]);
    
    // Add initial testimonial
    addTestimonial();
    
    return () => clearInterval(interval);
  }, [testimonials, animationSpeed, addTestimonial]);

  // Handle void integration
  useEffect(() => {
    const handleVoidInteraction = () => {
      // Generate a burst of testimonials when void is interacted with
      if (testimonials && testimonials.length > 0) {
        const burstCount = Math.min(3, maxBubbles - activeBubbles.length);
        for (let i = 0; i < burstCount; i++) {
          setTimeout(() => addTestimonial(), i * 200);
        }
      }
    };

    eventBus.on('void:interaction', handleVoidInteraction);
    return () => eventBus.off('void:interaction', handleVoidInteraction);
  }, [testimonials, maxBubbles, activeBubbles.length, addTestimonial]);

  // Keyboard controls for accessibility
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Space':
      case 'Enter':
        e.preventDefault();
        addTestimonial();
        break;
      case 'Escape':
        setActiveBubbles([]);
        break;
    }
  }, [addTestimonial]);

  if (loading) {
    return (
      <div className={`testimonials-container relative w-full h-96 ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl px-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-32 rounded-lg"
                variant="card"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !testimonials || testimonials.length === 0) {
    return (
      <div className={`testimonials-container relative w-full h-96 ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">
              {error ? 'Unable to load testimonials' : 'No testimonials available'}
            </p>
            <button
              onClick={() => nothingService.generateNothing()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Generate Something from Nothing
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`testimonials-container relative w-full h-96 overflow-hidden ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Floating testimonials display"
      aria-live="polite"
    >
      {/* Instructions */}
      <div className="absolute top-4 left-4 z-10 text-sm text-gray-400bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2">
        Press Space to add testimonial • ESC to clear
      </div>
      
      {/* Testimonial bubbles */}
      {activeBubbles.map((bubble, index) => (
        <TestimonialBubble
          key={`${bubble.id}-${index}`}
          testimonial={bubble}
          initialPosition={{ x: bubble.x, y: bubble.y }}
          driftFactor={bubble.drift}
          animationSpeed={animationSpeed}
          onDisappear={() => removeBubble(bubble.id)}
        />
      ))}
      
      {/* Void integration hint */}
      {activeBubbles.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-6xl mb-4 opacity-20">∅</div>
            <p className="text-lg mb-2">Testimonials drift into nothingness</p>
            <p className="text-sm">
              Interact with the void to generate testimonials
            </p>
          </div>
        </div>
      )}
      
      {/* Stats */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2">
        Active: {activeBubbles.length} / {maxBubbles}
      </div>
    </div>
  );
}
