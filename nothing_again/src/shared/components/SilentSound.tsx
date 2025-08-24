import React, { useCallback } from 'react';

// Type for silent sound options
interface SilentSoundOptions {
  duration?: number; // Duration in milliseconds for the "silence"
  respectMotionPreferences?: boolean;
}

// Helper function to play silence (returns a promise for consistency with real audio APIs)
export const playSilence = async (options: SilentSoundOptions = {}): Promise<void> => {
  const { duration = 100, respectMotionPreferences = true } = options;
  
  // Respect user's motion preferences
  if (respectMotionPreferences && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return Promise.resolve();
  }
  
  // Create a "silent" promise that resolves after the specified duration
  // This simulates the experience of playing audio without actually producing sound
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
};

// Props for the SilentSound component
interface SilentSoundProps {
  children?: React.ReactNode;
  onSilenceComplete?: () => void;
  duration?: number;
  className?: string;
  'aria-label'?: string;
}

// Component that wraps content and can trigger silent sound effects
export const SilentSound: React.FC<SilentSoundProps> = ({
  children,
  onSilenceComplete,
  duration = 100,
  className = '',
  'aria-label': ariaLabel = 'Play silent sound effect'
}) => {
  const handlePlaySilence = useCallback(async () => {
    try {
      await playSilence({ duration });
      onSilenceComplete?.();
    } catch (error) {
      // Silent failure for silent sound - the irony is intentional
      console.debug('Silent sound failed silently:', error);
    }
  }, [duration, onSilenceComplete]);

  // If no children provided, render as a button
  if (!children) {
    return (
      <button
        type="button"
        onClick={handlePlaySilence}
        className={`inline-flex items-center justify-center ${className}`}
        aria-label={ariaLabel}
      >
        🔇
      </button>
    );
  }

  // If children provided, wrap them in a clickable container
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handlePlaySilence}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handlePlaySilence();
        }
      }}
      className={`cursor-pointer ${className}`}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
};

// Hook for using silent sound effects in other components
export const useSilentSound = () => {
  const playQuietly = useCallback((options?: SilentSoundOptions) => {
    return playSilence(options);
  }, []);

  return {
    playSilence: playQuietly,
    isSupported: true, // Silent sound is always "supported"
    volume: 0 // Always zero for comedic effect
  };
};

// Export default for consistency with other shared components
export default SilentSound;
