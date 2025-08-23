import React, { createContext, useContext, useCallback, ReactNode, useState } from 'react';
import { useStore } from '../state/store';
import { GameDifficulty, GameMode } from '../types';

interface GameContextValue {
  startGame: (difficulty: GameDifficulty, mode?: GameMode) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  currentGame: {
    isActive: boolean;
    isPaused: boolean;
    isCompleted: boolean;
    difficulty: GameDifficulty | null;
    mode: GameMode;
    score: number;
    moves: number;
    timeElapsed: number;
  };
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const store = useStore();
  const {
    startGame: storeStartGame,
    endGame: storeEndGame,
    resetGame: storeResetGame,
    moves,
    timeElapsed,
    currentDifficulty,
    isGameActive,
    isGameComplete
  } = store;

  // Game pause/resume functionality (not in store, implementing locally)
  const [isGamePaused, setIsGamePaused] = useState(false);
  
  const storePauseGame = () => setIsGamePaused(true);
  const storeResumeGame = () => setIsGamePaused(false);

  const startGame = useCallback((difficulty: GameDifficulty, _gameMode: GameMode = 'single') => {
    storeStartGame(difficulty, typeof store.currentTheme === 'string' ? store.currentTheme : 'animals');
  }, [storeStartGame, store.currentTheme]);

  const pauseGame = useCallback(() => {
    if (isGameActive && !isGamePaused) {
      storePauseGame();
    }
  }, [isGameActive, isGamePaused]);

  const resumeGame = useCallback(() => {
    if (isGameActive && isGamePaused) {
      storeResumeGame();
    }
  }, [isGameActive, isGamePaused]);

  const endGame = useCallback(() => {
    if (isGameActive) {
      storeEndGame(true); // Assume game completed successfully
    }
  }, [storeEndGame, isGameActive]);

  const resetGame = useCallback(() => {
    storeResetGame();
  }, [storeResetGame]);

  const contextValue: GameContextValue = {
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    resetGame,
    currentGame: {
      isActive: isGameActive,
      isPaused: isGamePaused,
      isCompleted: isGameComplete,
      difficulty: currentDifficulty,
      mode: 'single' as GameMode, // Default mode since store doesn't track this
      score: timeElapsed, // Using timeElapsed as score
      moves,
      timeElapsed
    }
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = (): GameContextValue => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
