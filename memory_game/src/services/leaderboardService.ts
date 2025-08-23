import { apiClient } from './apiClient';
import type { LeaderboardEntry } from '../types';

export interface GetTopParams {
  difficulty?: 'easy' | 'medium' | 'hard';
  limit?: number;
}

export interface SubmitScoreParams {
  playerName: string;
  score: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeElapsed: number;
  moves: number;
}

/**
 * Fetches top leaderboard entries with optional filtering
 */
export async function getTop(params: GetTopParams = {}): Promise<LeaderboardEntry[]> {
  const { difficulty, limit = 10 } = params;
  
  const searchParams = new URLSearchParams({
    limit: limit.toString(),
  });
  
  if (difficulty) {
    searchParams.set('difficulty', difficulty);
  }
  
  try {
    const response = await apiClient.get<LeaderboardEntry[]>(`/api/leaderboard?${searchParams}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    throw new Error('Unable to fetch leaderboard data');
  }
}

/**
 * Submits a new score to the leaderboard
 */
export async function submitScore(params: SubmitScoreParams): Promise<LeaderboardEntry> {
  const { playerName, score, difficulty, timeElapsed, moves } = params;
  
  try {
    const response = await apiClient.post<LeaderboardEntry>('/api/leaderboard', {
      playerName,
      score,
      difficulty,
      timeElapsed,
      moves,
      timestamp: new Date().toISOString(),
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to submit score:', error);
    throw new Error('Unable to submit score to leaderboard');
  }
}

/**
 * Gets leaderboard entries for a specific player
 */
export async function getPlayerScores(playerName: string): Promise<LeaderboardEntry[]> {
  try {
    const response = await apiClient.get<LeaderboardEntry[]>(`/api/leaderboard/player/${encodeURIComponent(playerName)}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch player scores:', error);
    throw new Error('Unable to fetch player scores');
  }
}

/**
 * Gets the player's rank for a specific difficulty
 */
export async function getPlayerRank(playerName: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<number | null> {
  try {
    const response = await apiClient.get<{ rank: number | null }>(`/api/leaderboard/player/${encodeURIComponent(playerName)}/rank?difficulty=${difficulty}`);
    return response.data.rank;
  } catch (error) {
    console.error('Failed to fetch player rank:', error);
    return null;
  }
}
