import { useState, useCallback, useEffect, useRef } from 'react';

interface UseSoundReturn {
  play: (soundName?: string) => void;
  toggleMute: () => void;
  isMuted: boolean;
  isLoading: boolean;
}

const SOUND_STORAGE_KEY = 'dipeo-sound-muted';

export function useSound(): UseSoundReturn {
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(SOUND_STORAGE_KEY) === 'true';
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasUserInteracted = useRef(false);

  // Initialize audio element and preload silence.mp3
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      setIsLoading(false);
      return;
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsLoading(false);
      return;
    }

    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = '/src/assets/sounds/silence.mp3';
    
    // Set volume to a reasonable level
    audio.volume = 0.3;
    
    const handleCanPlayThrough = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      console.warn('Failed to load sound file');
      setIsLoading(false);
    };

    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('error', handleError);
    
    audioRef.current = audio;

    // Track user interaction for autoplay policy
    const handleUserInteraction = () => {
      hasUserInteracted.current = true;
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('error', handleError);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      
      // Clean up audio element
      audio.pause();
      audio.src = '';
    };
  }, []);

  const play = useCallback((soundName?: string) => {
    // Skip if muted, loading, or no audio element
    if (isMuted || isLoading || !audioRef.current) {
      return;
    }

    // Skip if user hasn't interacted (browser autoplay policy)
    if (!hasUserInteracted.current) {
      return;
    }

    // Check for reduced motion preference
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        return;
      }
    }

    try {
      const audio = audioRef.current;
      
      // Reset audio to beginning
      audio.currentTime = 0;
      
      // Play the sound (silence.mp3 for this "nothing" theme)
      const playPromise = audio.play();
      
      // Handle promise-based play() method
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Ignore AbortError as it's common when rapidly triggering sounds
          if (error.name !== 'AbortError') {
            console.warn('Sound play failed:', error);
          }
        });
      }
    } catch (error) {
      console.warn('Sound play error:', error);
    }
  }, [isMuted, isLoading]);

  const toggleMute = useCallback(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(SOUND_STORAGE_KEY, newMutedState.toString());
    }
  }, [isMuted]);

  return {
    play,
    toggleMute,
    isMuted,
    isLoading
  };
}
