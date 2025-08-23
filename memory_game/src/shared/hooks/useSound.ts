import { useContext, useCallback, useRef, useEffect } from 'react';
import { SoundContext } from '../providers/SoundProvider';

interface SoundConfig {
  volume?: number;
  loop?: boolean;
}

interface UseSound {
  play: (config?: SoundConfig) => Promise<void>;
  stop: () => void;
}

// Simple sound cache to avoid re-creating audio elements
const audioCache = new Map<string, HTMLAudioElement>();

export const useSound = (soundId: string | AudioBuffer): UseSound => {
  const soundContext = useContext(SoundContext);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Initialize Web Audio Context lazily
  const getAudioContext = useCallback(async (): Promise<AudioContext | null> => {
    if (!window.AudioContext && !(window as any).webkitAudioContext) {
      return null;
    }

    if (!audioContextRef.current) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      } catch (error) {
        console.warn('Failed to create AudioContext:', error);
        return null;
      }
    }

    // Resume context if suspended (required by browser autoplay policies)
    if (audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
      } catch (error) {
        console.warn('Failed to resume AudioContext:', error);
      }
    }

    return audioContextRef.current;
  }, []);

  // Play sound using Web Audio API for AudioBuffer
  const playWithWebAudio = useCallback(async (
    audioBuffer: AudioBuffer, 
    config: SoundConfig = {}
  ): Promise<void> => {
    if (!soundContext || soundContext.isMuted) return;

    const audioContext = await getAudioContext();
    if (!audioContext) return;

    try {
      // Stop any currently playing sound
      stop();

      // Create source node
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;

      // Create gain node for volume control
      const gainNode = audioContext.createGain();
      const volume = config.volume ?? soundContext.volume ?? 1.0;
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);

      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configure playback
      source.loop = config.loop ?? false;

      // Store references for cleanup
      sourceRef.current = source;
      gainNodeRef.current = gainNode;

      // Start playback
      source.start(0);

      // Clean up when finished (if not looping)
      if (!source.loop) {
        source.addEventListener('ended', () => {
          sourceRef.current = null;
          gainNodeRef.current = null;
        });
      }
    } catch (error) {
      console.warn('Failed to play sound with Web Audio API:', error);
    }
  }, [soundContext, getAudioContext]);

  // Fallback to HTML Audio for string sound IDs
  const playWithHtmlAudio = useCallback(async (
    soundId: string,
    config: SoundConfig = {}
  ): Promise<void> => {
    if (!soundContext || soundContext.isMuted) return;

    try {
      let audio = audioCache.get(soundId);
      
      if (!audio) {
        audio = new Audio(soundId);
        audio.preload = 'auto';
        audioCache.set(soundId, audio);
      }

      // Reset audio to beginning
      audio.currentTime = 0;
      
      // Set volume
      const volume = config.volume ?? soundContext.volume ?? 1.0;
      audio.volume = Math.max(0, Math.min(1, volume));
      
      // Set loop
      audio.loop = config.loop ?? false;

      await audio.play();
    } catch (error) {
      console.warn('Failed to play sound with HTML Audio:', error);
    }
  }, [soundContext]);

  const play = useCallback(async (config: SoundConfig = {}): Promise<void> => {
    if (soundId instanceof AudioBuffer) {
      await playWithWebAudio(soundId, config);
    } else {
      await playWithHtmlAudio(soundId, config);
    }
  }, [soundId, playWithWebAudio, playWithHtmlAudio]);

  const stop = useCallback((): void => {
    // Stop Web Audio API source
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch (error) {
        // Source might already be stopped
      }
      sourceRef.current = null;
      gainNodeRef.current = null;
    }

    // Stop HTML Audio (for string sound IDs)
    if (typeof soundId === 'string') {
      const audio = audioCache.get(soundId);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    }
  }, [soundId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { play, stop };
};

export default useSound;
