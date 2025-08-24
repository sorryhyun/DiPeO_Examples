import { AnalyticsEvent } from '@/types/index';
import { sendEvent } from '@/services/analyticsService';
import { DEFAULT_APP_CONFIG } from '@/constants/appConfig';

/**
 * Centralized analytics tracking utility
 * Routes events to analyticsService and provides dev-mode console logging
 */
export const trackEvent = async (event: AnalyticsEvent): Promise<void> => {
  try {
    // In development mode with mock data enabled, log events to console
    if (DEFAULT_APP_CONFIG.development_mode.enable_mock_data) {
      console.log('[Analytics Dev]', {
        event: event.event,
        category: event.category,
        properties: event.properties,
        userId: event.userId,
        sessionId: event.sessionId,
        timestamp: event.timestamp,
        page: event.page,
        referrer: event.referrer
      });
    }

    // Always attempt to send to analyticsService (it will handle mocking internally)
    await sendEvent(event);
  } catch (error) {
    // Silently handle analytics errors to prevent breaking user experience
    if (DEFAULT_APP_CONFIG.development_mode.enable_mock_data) {
      console.warn('[Analytics Error]', error);
    }
  }
};

/**
 * Convenience helper to track page views
 */
export const trackPageView = (pageName: string, additionalData?: Record<string, any>): Promise<void> => {
  return trackEvent({
    event: 'page_view',
    category: 'navigation',
    properties: {
      page: pageName,
      url: typeof window !== 'undefined' ? window.location.href : '',
      ...additionalData
    },
    sessionId: 'session-' + Date.now(),
    timestamp: new Date().toISOString(),
    page: pageName
  });
};

/**
 * Convenience helper to track button clicks
 */
export const trackButtonClick = (
  buttonName: string, 
  context?: string, 
  additionalData?: Record<string, any>
): Promise<void> => {
  return trackEvent({
    event: 'button_click',
    category: 'interaction',
    properties: {
      button: buttonName,
      context: context || 'unknown',
      ...additionalData
    },
    sessionId: 'session-' + Date.now(),
    timestamp: new Date().toISOString(),
    page: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
  });
};

/**
 * Convenience helper to track form submissions
 */
export const trackFormSubmission = (
  formName: string,
  success: boolean = true,
  additionalData?: Record<string, any>
): Promise<void> => {
  return trackEvent({
    event: success ? 'form_submit_success' : 'form_submit_error',
    category: 'conversion',
    properties: {
      form: formName,
      success,
      value: success ? 1 : 0,
      ...additionalData
    },
    sessionId: 'session-' + Date.now(),
    timestamp: new Date().toISOString(),
    page: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
  });
};

/**
 * Convenience helper to track nothing-specific events (comedic tracking)
 */
export const trackNothingEvent = (
  action: string,
  intensity: 'void' | 'null' | 'empty' = 'void',
  additionalData?: Record<string, any>
): Promise<void> => {
  return trackEvent({
    event: 'nothing_interaction',
    category: 'interaction',
    properties: {
      action,
      intensity,
      nothing_level: 'absolute',
      value: 0, // Always zero for nothing events
      ...additionalData
    },
    sessionId: 'session-' + Date.now(),
    timestamp: new Date().toISOString(),
    page: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
  });
};
