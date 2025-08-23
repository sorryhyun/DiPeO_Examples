import React from 'react';

interface MoveCounterProps {
  moves?: number;
  className?: string;
}

// Store interface for type safety
interface GameState {
  moves: number;
}

// Mock store hook - in real implementation this would come from src/state/store.ts
const useGameStore = (selector?: (state: GameState) => any) => {
  // Mock implementation - real store would be imported
  const mockState: GameState = {
    moves: 0
  };
  
  if (selector) {
    return selector(mockState);
  }
  
  return mockState;
};

const MoveCounter: React.FC<MoveCounterProps> = ({ 
  moves: propMoves, 
  className = '' 
}) => {
  // Read moves from store if not passed as prop
  const storeMoves = useGameStore((state: GameState) => state.moves);
  const displayMoves = propMoves ?? storeMoves;

  return (
    <div 
      className={`inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full border border-blue-200 dark:border-blue-700 ${className}`}
      role="status"
      aria-label={`Moves made: ${displayMoves}`}
    >
      <svg 
        className="w-4 h-4 mr-2" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M13 10V3L4 14h7v7l9-11h-7z" 
        />
      </svg>
      <span className="tabular-nums">
        {displayMoves} {displayMoves === 1 ? 'Move' : 'Moves'}
      </span>
    </div>
  );
};

export default MoveCounter;
