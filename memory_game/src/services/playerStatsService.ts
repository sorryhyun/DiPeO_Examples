import { apiClient } from './apiClient';
import type { PlayerStats, GameResult, ApiResponse } from '../types';

/**
 * Service for managing player statistics and performance metrics
 */
export class PlayerStatsService {
  /**
   * Fetches comprehensive player statistics
   */
  async getPlayerStats(playerId: string): Promise<PlayerStats> {
    try {
      const response = await apiClient.get<PlayerStats>(`/api/player-stats?playerId=${playerId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch player stats:', error);
      throw new Error('Unable to load player statistics');
    }
  }

  /**
   * Updates player statistics after a game completion
   */
  async updateStats(playerId: string, gameResult: GameResult): Promise<void> {
    try {
      const statsUpdate = this.calculateStatsUpdate(gameResult);
      await apiClient.post<void>('/api/player-stats', {
        playerId,
        ...statsUpdate
      });
    } catch (error) {
      console.error('Failed to update player stats:', error);
      // Don't throw error to avoid disrupting game flow
    }
  }

  /**
   * Fetches leaderboard position for a player
   */
  async getPlayerRanking(playerId: string): Promise<{ rank: number; totalPlayers: number }> {
    try {
      const response = await apiClient.get<{ rank: number; totalPlayers: number }>(
        `/api/player-stats/ranking?playerId=${playerId}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch player ranking:', error);
      return { rank: 0, totalPlayers: 0 };
    }
  }

  /**
   * Fetches player's recent game history
   */
  async getRecentGames(playerId: string, limit: number = 10): Promise<GameResult[]> {
    try {
      const response = await apiClient.get<GameResult[]>(
        `/api/player-stats/recent?playerId=${playerId}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recent games:', error);
      return [];
    }
  }

  /**
   * Calculates statistics update from a single game result
   */
  private calculateStatsUpdate(gameResult: GameResult) {
    const { score, moves, timeElapsed, difficulty, completed } = gameResult;
    
    return {
      gamesPlayed: 1,
      gamesCompleted: completed ? 1 : 0,
      totalScore: score,
      totalMoves: moves,
      totalTime: timeElapsed,
      bestScore: score,
      bestTime: completed ? timeElapsed : null,
      difficulty,
      timestamp: Date.now()
    };
  }

  /**
   * Calculates performance metrics for achievements
   */
  calculatePerformanceMetrics(stats: PlayerStats) {
    const {
      gamesPlayed,
      gamesCompleted,
      totalScore,
      totalMoves,
      totalTime,
      bestScore,
      bestTime
    } = stats;

    const completionRate = gamesPlayed > 0 ? (gamesCompleted / gamesPlayed) * 100 : 0;
    const averageScore = gamesCompleted > 0 ? totalScore / gamesCompleted : 0;
    const averageMoves = gamesCompleted > 0 ? totalMoves / gamesCompleted : 0;
    const averageTime = gamesCompleted > 0 ? totalTime / gamesCompleted : 0;

    return {
      completionRate,
      averageScore: Math.round(averageScore),
      averageMoves: Math.round(averageMoves),
      averageTime: Math.round(averageTime),
      bestScore,
      bestTime,
      efficiency: averageMoves > 0 ? Math.round((averageScore / averageMoves) * 100) / 100 : 0
    };
  }
}

// Export singleton instance
export const playerStatsService = new PlayerStatsService();

// Export convenience functions for store usage
export const getPlayerStats = (playerId: string) => playerStatsService.getPlayerStats(playerId);
export const updatePlayerStats = (playerId: string, gameResult: GameResult) => 
  playerStatsService.updateStats(playerId, gameResult);
export const getPlayerRanking = (playerId: string) => playerStatsService.getPlayerRanking(playerId);
export const getRecentGames = (playerId: string, limit?: number) => 
  playerStatsService.getRecentGames(playerId, limit);
