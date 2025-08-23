import { apiClient } from './apiClient';
import type { PlayerStats, GameResult } from '../types';

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
      if (!response.data) {
        throw new Error('No player stats found');
      }
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
      return response.data || { rank: 0, totalPlayers: 0 };
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
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch recent games:', error);
      return [];
    }
  }

  /**
   * Calculates statistics update from a single game result
   */
  private calculateStatsUpdate(gameResult: GameResult) {
    const { moves, time, difficulty, won } = gameResult;
    
    return {
      totalGamesPlayed: 1,
      totalGamesWon: won ? 1 : 0,
      totalMoves: moves,
      totalTimeSpent: time,
      difficulty,
      timestamp: Date.now()
    };
  }

  /**
   * Calculates performance metrics for achievements
   */
  calculatePerformanceMetrics(stats: PlayerStats) {
    const {
      totalGamesPlayed,
      totalGamesWon,
      winRate,
      averageMoves,
      averageTime
    } = stats;

    const completionRate = totalGamesPlayed > 0 ? (totalGamesWon / totalGamesPlayed) * 100 : 0;

    return {
      completionRate,
      winRate,
      averageMoves: Math.round(averageMoves),
      averageTime: Math.round(averageTime),
      totalGamesPlayed,
      totalGamesWon,
      efficiency: averageMoves > 0 ? Math.round((totalGamesWon / averageMoves) * 100) / 100 : 0
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
