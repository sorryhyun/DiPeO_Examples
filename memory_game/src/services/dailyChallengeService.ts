import { apiClient } from './apiClient';
import { themesService } from './themesService';
import { seededShuffle } from '../utils/shuffle';
import type { 
  DailyChallenge, 
  Card,
  Difficulty 
} from '../types';

/**
 * Service for managing daily challenges
 * Provides deterministic challenge generation and completion tracking
 */
class DailyChallengeService {
  private todayCache: DailyChallenge | null = null;
  private cacheDate: string | null = null;

  /**
   * Get today's daily challenge
   * Caches result for the current day to avoid redundant API calls
   */
  async getToday(): Promise<DailyChallenge> {
    const today = new Date().toISOString().split('T')[0];
    
    // Return cached result if we already fetched today's challenge
    if (this.todayCache && this.cacheDate === today) {
      return this.todayCache;
    }

    try {
      const response = await apiClient.get<DailyChallenge>('/api/daily-challenge');
      
      if (response.success && response.data) {
        this.todayCache = response.data;
        this.cacheDate = today;
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Failed to fetch daily challenge');
    } catch (error) {
      console.error('Error fetching daily challenge:', error);
      throw error;
    }
  }

  /**
   * Generate a deterministic deck for the daily challenge
   * Uses seeded random number generation to ensure same deck for same seed
   */
  async getChallengeDeck(seed: number, difficulty: Difficulty): Promise<Card[]> {
    try {
      // Get available themes
      const themes = await themesService.getThemes();
      
      if (themes.length === 0) {
        throw new Error('No themes available for challenge deck generation');
      }

      // Select theme based on seed (deterministic)
      const themeIndex = seed % themes.length;
      const selectedTheme = themes[themeIndex];

      // Determine deck size based on difficulty first
      const deckSizes = {
        easy: 12,    // 6 pairs
        medium: 20,  // 10 pairs  
        hard: 32,    // 16 pairs
        expert: 40   // 20 pairs
      };

      const deckSize = deckSizes[difficulty] || deckSizes.medium;
      const pairCount = deckSize / 2;

      // Get theme assets
      const themeAssets = await themesService.getThemeAssets(selectedTheme.id, pairCount);
      
      if (!themeAssets || themeAssets.length === 0) {
        throw new Error(`No assets found for theme: ${selectedTheme.name}`);
      }


      // Select assets for the challenge (deterministic based on seed)
      const shuffledAssets = seededShuffle([...themeAssets], seed);
      const selectedAssets = shuffledAssets.slice(0, pairCount);

      // Create pairs of cards
      const cards: Card[] = [];
      selectedAssets.forEach((asset, index) => {
        // Create two cards for each asset (matching pair)
        const cardContent = asset.type === 'image' ? asset.url : asset.id;
        
        cards.push({
          id: `${seed}-${index}-1`,
          content: cardContent,
          value: asset.id,
          isFlipped: false,
          isMatched: false,
          image: asset.type === 'image' ? asset.url : undefined,
          pairId: `pair-${index}`
        });

        cards.push({
          id: `${seed}-${index}-2`,
          content: cardContent,
          value: asset.id,
          isFlipped: false,
          isMatched: false,
          image: asset.type === 'image' ? asset.url : undefined,
          pairId: `pair-${index}`
        });
      });

      // Shuffle the final deck using the same seed
      return seededShuffle(cards, seed + 1000); // Offset seed to avoid same pattern
    } catch (error) {
      console.error('Error generating challenge deck:', error);
      throw error;
    }
  }

  /**
   * Submit challenge completion
   * Records that the player completed today's challenge
   */
  async submitCompletion(challengeId: string, score: number, timeElapsed: number): Promise<boolean> {
    try {
      const response = await apiClient.post<{ success: boolean }>('/api/daily-challenge/complete', {
        challengeId,
        score,
        timeElapsed,
        completedAt: new Date().toISOString()
      });

      return response.success && response.data?.success === true;
    } catch (error) {
      console.error('Error submitting challenge completion:', error);
      return false;
    }
  }

  /**
   * Check if player has completed today's challenge
   */
  async hasCompletedToday(): Promise<boolean> {
    try {
      const response = await apiClient.get<{ completed: boolean }>('/api/daily-challenge/status');
      return response.success && response.data?.completed === true;
    } catch (error) {
      console.error('Error checking challenge completion status:', error);
      return false;
    }
  }

  /**
   * Get challenge leaderboard for today
   */
  async getTodayLeaderboard(): Promise<Array<{
    playerId: string;
    playerName: string;
    score: number;
    timeElapsed: number;
    completedAt: string;
  }>> {
    try {
      const response = await apiClient.get<Array<{
        playerId: string;
        playerName: string;
        score: number;
        timeElapsed: number;
        completedAt: string;
      }>>('/api/daily-challenge/leaderboard');

      return response.success && response.data ? response.data : [];
    } catch (error) {
      console.error('Error fetching challenge leaderboard:', error);
      return [];
    }
  }

  /**
   * Clear cache - useful for testing or manual refresh
   */
  clearCache(): void {
    this.todayCache = null;
    this.cacheDate = null;
  }
}

// Export singleton instance
export const dailyChallengeService = new DailyChallengeService();
