import { apiClient } from './apiClient';
import { Theme, ThemeAsset } from '../types';

/**
 * Service for managing game themes and their assets
 */
class ThemesService {
  /**
   * Fetches all available themes
   */
  async getThemes(): Promise<Theme[]> {
    try {
      const response = await apiClient.get<Theme[]>('/api/themes');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch themes:', error);
      throw new Error('Unable to load themes');
    }
  }

  /**
   * Alias for getThemes - for backward compatibility
   */
  async getAllThemes(): Promise<Theme[]> {
    return this.getThemes();
  }

  /**
   * Fetches assets for a specific theme, sized for the given pair count
   */
  async getThemeAssets(themeId: string, pairCount: number): Promise<ThemeAsset[]> {
    try {
      const response = await apiClient.get<ThemeAsset[]>(
        `/api/themes/${themeId}/assets`,
        { params: { pairCount } }
      );
      
      const assets = response.data || [];
      if (assets.length < pairCount) {
        throw new Error(`Theme ${themeId} has insufficient assets for ${pairCount} pairs`);
      }
      
      // Return only the requested number of assets
      return assets.slice(0, pairCount);
    } catch (error) {
      console.error(`Failed to fetch assets for theme ${themeId}:`, error);
      throw new Error(`Unable to load assets for theme ${themeId}`);
    }
  }

  /**
   * Gets a specific theme by ID
   */
  async getTheme(themeId: string): Promise<Theme> {
    try {
      const response = await apiClient.get<Theme>(`/api/themes/${themeId}`);
      if (!response.data) {
        throw new Error(`Theme ${themeId} not found`);
      }
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch theme ${themeId}:`, error);
      throw new Error(`Unable to load theme ${themeId}`);
    }
  }

  /**
   * Validates that a theme has enough assets for a given difficulty
   */
  async validateThemeForDifficulty(themeId: string, pairCount: number): Promise<boolean> {
    try {
      const assets = await this.getThemeAssets(themeId, pairCount);
      return assets.length >= pairCount;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const themesService = new ThemesService();

// Export individual methods for convenience
export const getThemes = () => themesService.getThemes();
export const getAllThemes = () => themesService.getAllThemes();
export const getThemeAssets = (themeId: string, pairCount: number) => 
  themesService.getThemeAssets(themeId, pairCount);
export const getTheme = (themeId: string) => themesService.getTheme(themeId);
export const validateThemeForDifficulty = (themeId: string, pairCount: number) =>
  themesService.validateThemeForDifficulty(themeId, pairCount);
