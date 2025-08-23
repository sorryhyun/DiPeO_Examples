import { apiClient } from '../utils/apiClient';
import type { NothingOverview } from '../types';

/**
 * Service for interacting with the /api/nothing endpoint
 * Provides core metrics and status for the absolutely nothing product
 */
class NothingService {
  /**
   * Fetches overview data including user metrics and system status
   * Used primarily by the hero section to display real-time nothing statistics
   */
  async getOverview(): Promise<NothingOverview> {
    try {
      const response = await apiClient.get<NothingOverview>('/api/nothing');
      return response;
    } catch (error) {
      // Provide fallback data when API is unavailable
      console.warn('Failed to fetch nothing overview, using fallback data:', error);
      
      return {
        usersViewingNothing: '∞',
        nothingDelivered: '∞',
        satisfactionRate: 100,
        voidLevel: 'Maximum',
        isOperational: true,
        lastUpdated: new Date().toISOString(),
        metrics: {
          totalVoidiness: '∞',
          activeNothingUsers: '∞',
          nothingUptime: '100%',
          existentialQueries: 0
        },
        status: {
          api: 'operational',
          void: 'stable',
          nothing: 'perfectly nothing'
        }
      };
    }
  }

  /**
   * Gets current operational status
   * Used for status indicators and health checks
   */
  async getStatus(): Promise<{ isOperational: boolean; status: string }> {
    try {
      const overview = await this.getOverview();
      return {
        isOperational: overview.isOperational,
        status: overview.status.nothing
      };
    } catch (error) {
      return {
        isOperational: false,
        status: 'temporarily something'
      };
    }
  }

  /**
   * Records a nothing interaction for analytics
   * Fire-and-forget method for tracking user engagement with nothing
   */
  async recordNothingInteraction(type: 'view' | 'click' | 'contemplate' = 'view'): Promise<void> {
    try {
      await apiClient.post('/api/nothing/interaction', { type, timestamp: Date.now() });
    } catch (error) {
      // Silently fail - analytics shouldn't break the nothing experience
      console.debug('Failed to record nothing interaction:', error);
    }
  }
}

// Export singleton instance
const nothingService = new NothingService();
export default nothingService;
