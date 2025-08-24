/**
 * Fallback UI utilities for generating consistent error messages and safe render helpers
 * when backend services are unavailable or components fail to load.
 */

/**
 * Domain-specific fallback messages for different areas of the healthcare portal
 */
const DOMAIN_FALLBACK_KEYS = {
  appointments: 'fallback.appointments.unavailable',
  medicalRecords: 'fallback.medicalRecords.unavailable',
  prescriptions: 'fallback.prescriptions.unavailable',
  telemedicine: 'fallback.telemedicine.unavailable',
  dashboard: 'fallback.dashboard.unavailable',
  labResults: 'fallback.labResults.unavailable',
  insurance: 'fallback.insurance.unavailable',
  medications: 'fallback.medications.unavailable',
  auth: 'fallback.auth.unavailable',
  general: 'fallback.general.unavailable'
} as const;

/**
 * Returns a fallback message key for i18n translation based on the domain/feature area.
 * This provides consistent error messaging across the healthcare portal when services fail.
 * 
 * @param domain - The feature domain (appointments, medicalRecords, etc.)
 * @returns Translation key for the fallback message
 * 
 * @example
 * const messageKey = getFallbackMessage('appointments');
 * // Returns: 'fallback.appointments.unavailable'
 */
export const getFallbackMessage = (domain: string): string => {
  const key = domain as keyof typeof DOMAIN_FALLBACK_KEYS;
  return DOMAIN_FALLBACK_KEYS[key] || DOMAIN_FALLBACK_KEYS.general;
};

/**
 * Returns a user-friendly fallback message for network or service errors.
 * This is used when the i18n system is also unavailable.
 * 
 * @param domain - The feature domain experiencing the error
 * @returns Plain text fallback message
 */
export const getPlainFallbackMessage = (domain: string): string => {
  const messages = {
    appointments: 'Appointment services are temporarily unavailable. Please try again later.',
    medicalRecords: 'Medical records are temporarily unavailable. Please try again later.',
    prescriptions: 'Prescription services are temporarily unavailable. Please try again later.',
    telemedicine: 'Telemedicine services are temporarily unavailable. Please try again later.',
    dashboard: 'Health dashboard is temporarily unavailable. Please try again later.',
    labResults: 'Lab results are temporarily unavailable. Please try again later.',
    insurance: 'Insurance services are temporarily unavailable. Please try again later.',
    medications: 'Medication services are temporarily unavailable. Please try again later.',
    auth: 'Authentication services are temporarily unavailable. Please try again later.',
    general: 'This service is temporarily unavailable. Please try again later.'
  } as const;

  const key = domain as keyof typeof messages;
  return messages[key] || messages.general;
};

/**
 * Creates a retry action message key for i18n translation.
 * Used by ErrorBoundary and feature components to show retry options.
 * 
 * @param domain - The feature domain that failed
 * @returns Translation key for retry message
 */
export const getRetryMessage = (domain: string): string => {
  return `fallback.${domain}.retry` as const;
};

/**
 * Returns a plain text retry message when i18n is unavailable.
 * 
 * @param domain - The feature domain that failed
 * @returns Plain text retry message
 */
export const getPlainRetryMessage = (domain: string): string => {
  return `Click to retry loading ${domain}`;
};

/**
 * Safely renders fallback content when a component or service fails.
 * This helper ensures consistent fallback UI structure across the application.
 * 
 * @param domain - The feature domain experiencing the error
 * @param error - Optional error object for debugging
 * @returns Object with message keys and error info
 */
export const createFallbackContent = (domain: string, error?: Error) => {
  return {
    messageKey: getFallbackMessage(domain),
    plainMessage: getPlainFallbackMessage(domain),
    retryKey: getRetryMessage(domain),
    plainRetryMessage: getPlainRetryMessage(domain),
    domain,
    error: error?.message || null,
    timestamp: new Date().toISOString()
  };
};

/**
 * Type definition for fallback content structure
 */
export type FallbackContent = ReturnType<typeof createFallbackContent>;

// Self-check comments:
// [x] Uses named exports only (no default exports)
// [x] Provides consistent fallback messaging for i18n integration
// [x] Includes proper TypeScript types
// [x] Documents usage with JSDoc comments
// [x] Handles edge cases with fallback to 'general' domain
// [x] Provides both i18n keys and plain text fallbacks
