import { apiClient } from './apiClient';
import { Achievement, ApiResponse } from '../types';

/**
 * Service for managing user achievements
 */
export class AchievementsService {
  /**
   * Fetch achievements for a player
   */
  async getAchievements(playerId?: string): Promise<Achievement[]> {
    try {
      const endpoint = playerId 
        ? `/api/achievements?playerId=${encodeURIComponent(playerId)}`
        : '/api/achievements';
      
      const response: ApiResponse<Achievement[]> = await apiClient.get(endpoint);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to fetch achievements');
    } catch (error) {
      console.error('Error fetching achievements:', error);
      throw error;
    }
  }

  /**
   * Award an achievement to a player
   */
  async awardAchievement(playerId: string, achievementId: string): Promise<Achievement> {
    try {
      const response: ApiResponse<Achievement> = await apiClient.post('/api/achievements', {
        playerId,
        achievementId,
        awardedAt: new Date().toISOString()
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to award achievement');
    } catch (error) {
      console.error('Error awarding achievement:', error);
      throw error;
    }
  }

  /**
   * Check if a player has a specific achievement
   */
  async hasAchievement(playerId: string, achievementId: string): Promise<boolean> {
    try {
      const achievements = await this.getAchievements(playerId);
      return achievements.some(achievement => achievement.id === achievementId);
    } catch (error) {
      console.error('Error checking achievement:', error);
      return false;
    }
  }

  /**
   * Get achievement progress for a player
   */
  async getAchievementProgress(playerId: string, achievementId: string): Promise<number> {
    try {
      const response: ApiResponse<{ progress: number }> = await apiClient.get(
        `/api/achievements/${encodeURIComponent(achievementId)}/progress?playerId=${encodeURIComponent(playerId)}`
      );
      
      if (response.success && response.data) {
        return response.data.progress;
      }
      
      return 0;
    } catch (error) {
      console.error('Error fetching achievement progress:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const achievementsService = new AchievementsService();

// Export individual methods for convenience
export const getAchievements = (playerId?: string) => achievementsService.getAchievements(playerId);
export const awardAchievement = (playerId: string, achievementId: string) => 
  achievementsService.awardAchievement(playerId, achievementId);
export const hasAchievement = (playerId: string, achievementId: string) => 
  achievementsService.hasAchievement(playerId, achievementId);
export const getAchievementProgress = (playerId: string, achievementId: string) => 
  achievementsService.getAchievementProgress(playerId, achievementId);
