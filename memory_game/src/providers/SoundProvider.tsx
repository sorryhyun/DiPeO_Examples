import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { useLocalStorage } from '../shared/hooks/useLocalStorage';
import { useSound } from '../shared/hooks/useSound';

interface SoundSettings {
  muted: boolean;
  volume: number;
}

interface SoundContextType {
  muted: boolean;
  volume: number;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
  playSound: (identifier: string) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

interface SoundProviderProps {
  children: ReactNode;
}

export const SoundProvider: React.FC<SoundProviderProps> = ({ children }) => {
  const [soundSettings, setSoundSettings] = useLocalStorage<SoundSettings>(
    'memorygame:v1:sound',
    { muted: false, volume: 0.7 }
  );

  const { playSound: playSoundHook } = useSound();

  const setMuted = useCallback((muted: boolean) => {
    setSoundSettings(prev => ({ ...prev, muted }));
  }, [setSoundSettings]);

  const setVolume = useCallback((volume: number) => {
    setSoundSettings(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
  }, [setSoundSettings]);

  const playSound = useCallback((identifier: string) => {
    if (soundSettings.muted) return;
    
    try {
      playSoundHook(identifier, soundSettings.volume);
    } catch (error) {
      console.warn('Failed to play sound:', identifier, error);
    }
  }, [playSoundHook, soundSettings.muted, soundSettings.volume]);

  const value: SoundContextType = {
    muted: soundSettings.muted,
    volume: soundSettings.volume,
    setMuted,
    setVolume,
    playSound,
  };

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSoundContext = (): SoundContextType => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSoundContext must be used within a SoundProvider');
  }
  return context;
};
