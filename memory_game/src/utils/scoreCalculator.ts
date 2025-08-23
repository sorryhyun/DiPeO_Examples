import type { Difficulty } from '../types/index.ts';

interface ScoreCalculationParams {
  moves: number;
  seconds: number;
  difficulty: Difficulty;
  streakBonus?: number;
  comboMultiplier?: number;
}

/**
 * Calculate the final game score based on performance metrics
 */
export function calculateScore({
  moves,
  seconds,
  difficulty,
  streakBonus = 0,
  comboMultiplier = 1
}: ScoreCalculationParams): number {
  // Base score multipliers by difficulty
  const difficultyMultipliers: Record<Difficulty, number> = {
    easy: 1.0,
    medium: 1.5,
    hard: 2.0,
    expert: 2.5
  };

  // Base score calculation
  const baseScore = 1000;
  const difficultyMultiplier = difficultyMultipliers[difficulty];
  
  // Time penalty - lose points for taking too long
  const timePenalty = Math.min(seconds * 2, baseScore * 0.5);
  
  // Move penalty - lose points for inefficient play
  const movePenalty = Math.max(0, (moves - 10) * 5);
  
  // Calculate final score
  let finalScore = baseScore * difficultyMultiplier;
  finalScore -= timePenalty;
  finalScore -= movePenalty;
  finalScore += streakBonus;
  finalScore *= comboMultiplier;
  
  // Ensure minimum score of 0
  return Math.max(0, Math.round(finalScore));
}

/**
 * Format score for display with appropriate separators
 */
export function formatScore(score: number): string {
  return score.toLocaleString();
}

/**
 * Calculate bonus points for consecutive correct matches
 */
export function calculateStreakBonus(streakLength: number): number {
  if (streakLength < 3) return 0;
  return streakLength * 25;
}

/**
 * Calculate combo multiplier based on speed and accuracy
 */
export function calculateComboMultiplier(consecutiveMatches: number, averageMatchTime: number): number {
  const speedBonus = averageMatchTime < 2 ? 1.2 : 1.0;
  const comboBonus = Math.min(1 + (consecutiveMatches * 0.1), 2.0);
  return speedBonus * comboBonus;
}
