import { apiPost } from '@/utils/apiClient';
import { AnalyticsEvent } from '@/types';
import { appConfig } from '@/constants/appConfig';

/**
 * Sends analytics events to the server or logs them in development mode
 */
export const sendEvent = async (event: AnalyticsEvent): Promise<void> => {
  // In development mode with mock server, just log and return
  if (appConfig.development_mode.enable_mock_data) {
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
  if (appConfig.development_mode.enable_mock_data) {
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
  if (appConfig.development_mode.enable_mock_data) {
    console.log('📊 Analytics Service initialized (Mock mode)');
  }
};

/**
 * Gets dashboard analytics data
 */
export const getDashboardData = async () => {
  // Mock dashboard data for development
  await new Promise(resolve => setTimeout(resolve, 200));
  return {
    totalEvents: 1234567,
    signups: 8910,
    purchases: 0, // Always zero, it's nothing
    uptime: 99.99,
    conversionRate: 0.0,
    nothingDelivered: Infinity,
    existentialCrises: 42,
    voidInteractions: 9999
  };
};

/**
 * Tracks an analytics event
 */
export const trackEvent = async (event: any) => {
  return sendEvent(event);
};

// Export as default object for easier consumption
const analyticsService = {
  sendEvent,
  sendEvents,
  initializeAnalytics,
  getDashboardData,
  trackEvent
};

export default analyticsService;
