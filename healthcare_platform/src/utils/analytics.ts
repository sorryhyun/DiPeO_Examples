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
        type: event.type,
        category: event.category,
        action: event.action,
        label: event.label,
        value: event.value,
        timestamp: new Date().toISOString(),
        ...event.metadata
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
    type: 'page_view',
    category: 'navigation',
    action: 'view',
    label: pageName,
    metadata: {
      page: pageName,
      url: typeof window !== 'undefined' ? window.location.href : '',
      timestamp: Date.now(),
      ...additionalData
    }
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
    type: 'interaction',
    category: 'button',
    action: 'click',
    label: buttonName,
    metadata: {
      button: buttonName,
      context: context || 'unknown',
      timestamp: Date.now(),
      ...additionalData
    }
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
    type: 'conversion',
    category: 'form',
    action: success ? 'submit_success' : 'submit_error',
    label: formName,
    value: success ? 1 : 0,
    metadata: {
      form: formName,
      success,
      timestamp: Date.now(),
      ...additionalData
    }
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
    type: 'nothing_interaction',
    category: 'nothing',
    action,
    label: `nothing_${intensity}`,
    value: 0, // Always zero for nothing events
    metadata: {
      intensity,
      nothing_level: 'absolute',
      timestamp: Date.now(),
      ...additionalData
    }
  });
};
