import React, { createContext, useContext, useCallback, ReactNode } from 'react';
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
    pauseGame: storePauseGame,
    resumeGame: storeResumeGame,
    endGame: storeEndGame,
    resetGame: storeResetGame,
    gameState,
    score,
    moves,
    timeElapsed,
    difficulty,
    mode,
    isGameActive,
    isGamePaused,
    isGameCompleted
  } = store;

  const startGame = useCallback((difficulty: GameDifficulty, gameMode: GameMode = 'classic') => {
    storeStartGame(difficulty, gameMode);
  }, [storeStartGame]);

  const pauseGame = useCallback(() => {
    if (isGameActive && !isGamePaused) {
      storePauseGame();
    }
  }, [storePauseGame, isGameActive, isGamePaused]);

  const resumeGame = useCallback(() => {
    if (isGameActive && isGamePaused) {
      storeResumeGame();
    }
  }, [storeResumeGame, isGameActive, isGamePaused]);

  const endGame = useCallback(() => {
    if (isGameActive) {
      storeEndGame();
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
      isCompleted: isGameCompleted,
      difficulty,
      mode,
      score,
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
