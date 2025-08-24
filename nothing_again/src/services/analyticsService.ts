import { apiPost } from '@/utils/apiClient';
import { AnalyticsEvent } from '@/types';
import { appConfig } from '@/constants/appConfig';

/**
 * Sends analytics events to the server or logs them in development mode
 */
export const sendEvent = async (event: AnalyticsEvent): Promise<void> => {
  // In development mode with mock server, just log and return
  if (appConfig.development_mode.enable_mock_server) {
    console.log('📊 Analytics Event (Mock):', {
      event: event.event,
      properties: event.properties,
      timestamp: new Date().toISOString(),
      userId: event.userId,
      sessionId: event.sessionId
    });
    
    // Simulate network delay in development
    await new Promise(resolve => setTimeout(resolve, 100));
    return;
  }

  try {
    await apiPost('/api/analytics/nothing', event);
  } catch (error) {
    // Silently fail analytics to not disrupt user experience
    // but log the error for debugging
    console.warn('Failed to send analytics event:', error);
  }
};

/**
 * Batch send multiple analytics events
 */
export const sendEvents = async (events: AnalyticsEvent[]): Promise<void> => {
  if (appConfig.development_mode.enable_mock_server) {
    console.log('📊 Analytics Events Batch (Mock):', {
      count: events.length,
      events: events.map(e => ({ event: e.event, timestamp: new Date().toISOString() }))
    });
    
    await new Promise(resolve => setTimeout(resolve, 150));
    return;
  }

  try {
    await apiPost('/api/analytics/nothing/batch', { events });
  } catch (error) {
    console.warn('Failed to send analytics events batch:', error);
  }
};

/**
 * Initialize analytics service (placeholder for future session tracking)
 */
export const initializeAnalytics = (): void => {
  if (appConfig.development_mode.enable_mock_server) {
    console.log('📊 Analytics Service initialized (Mock mode)');
  }
};
