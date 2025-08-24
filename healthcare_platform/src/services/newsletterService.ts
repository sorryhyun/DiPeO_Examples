import { apiPost } from '@/utils/apiClient';
import { NewsletterPayload } from '@/types';
import { trackEvent } from '@/utils/analytics';

/**
 * Validates email format using a simple regex pattern
 */
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Subscribes a user to the newsletter
 * @param payload - Newsletter subscription data
 * @throws Error if email is invalid or network request fails
 */
export const subscribe = async (payload: NewsletterPayload): Promise<void> => {
  // Validate email format before making API call
  if (!payload.email || !validateEmail(payload.email)) {
    throw new Error('Please enter a valid email address');
  }

  // Trim email to prevent whitespace issues
  const cleanedPayload: NewsletterPayload = {
    ...payload,
    email: payload.email.trim().toLowerCase()
  };

  try {
    // Submit to newsletter API endpoint
    await apiPost<void, NewsletterPayload>('/api/newsletter/nothing', cleanedPayload);

    // Track successful newsletter signup
    trackEvent({
      type: 'newsletter_signup',
      email: cleanedPayload.email,
      timestamp: new Date().toISOString(),
      source: 'newsletter_form'
    });
  } catch (error) {
    // Track failed newsletter signup
    trackEvent({
      type: 'newsletter_signup_failed',
      email: cleanedPayload.email,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    // Re-throw with user-friendly message
    if (error instanceof Error) {
      throw new Error(`Failed to subscribe to newsletter: ${error.message}`);
    }
    throw new Error('Failed to subscribe to newsletter. Please try again later.');
  }
};

/**
 * Unsubscribes a user from the newsletter
 * @param email - Email address to unsubscribe
 */
export const unsubscribe = async (email: string): Promise<void> => {
  if (!validateEmail(email)) {
    throw new Error('Please enter a valid email address');
  }

  try {
    await apiPost<void, { email: string }>('/api/newsletter/nothing/unsubscribe', {
      email: email.trim().toLowerCase()
    });

    trackEvent({
      type: 'newsletter_unsubscribe',
      email: email.trim().toLowerCase(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to unsubscribe: ${error.message}`);
    }
    throw new Error('Failed to unsubscribe. Please try again later.');
  }
};
