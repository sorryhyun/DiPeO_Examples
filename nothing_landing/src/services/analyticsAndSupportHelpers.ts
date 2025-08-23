/**
 * Analytics and Support Helper Functions
 * Shared utilities for building standardized payloads across analytics and support services
 */

import { v4 as uuidv4 } from 'uuid';

// Types for analytics events
export interface BaseEventPayload {
  timestamp: string;
  clientId: string;
  sessionId: string;
  userAgent?: string;
  url?: string;
}

export interface AnalyticsEventPayload extends BaseEventPayload {
  eventType: string;
  properties: Record<string, any>;
  userId?: string;
}

// Types for support payloads
export interface SupportPayload extends BaseEventPayload {
  supportType: 'chat' | 'ticket' | 'feedback';
  message: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  userEmail?: string;
  metadata?: Record<string, any>;
}

// Client ID management
let cachedClientId: string | null = null;

/**
 * Generate or retrieve a persistent client ID
 */
function getClientId(): string {
  if (cachedClientId) {
    return cachedClientId;
  }

  // Try to get from localStorage first
  try {
    const stored = localStorage.getItem('nothing_client_id');
    if (stored) {
      cachedClientId = stored;
      return stored;
    }
  } catch (error) {
    // localStorage might not be available
  }

  // Generate new client ID
  const newClientId = uuidv4();
  cachedClientId = newClientId;

  // Try to persist it
  try {
    localStorage.setItem('nothing_client_id', newClientId);
  } catch (error) {
    // Ignore localStorage errors
  }

  return newClientId;
}

/**
 * Generate a session ID for this browser session
 */
let sessionId: string | null = null;
function getSessionId(): string {
  if (!sessionId) {
    sessionId = uuidv4();
  }
  return sessionId;
}

/**
 * Build a standardized analytics event payload
 */
export function buildEventPayload(
  eventType: string,
  properties: Record<string, any> = {},
  userId?: string
): AnalyticsEventPayload {
  const basePayload = buildBasePayload();
  
  return {
    ...basePayload,
    eventType,
    properties: {
      ...properties,
      // Add some standard properties
      page_title: document.title,
      referrer: document.referrer || undefined,
    },
    userId,
  };
}

/**
 * Build a standardized support payload
 */
export function buildSupportPayload(
  supportType: SupportPayload['supportType'],
  message: string,
  options: {
    category?: string;
    priority?: SupportPayload['priority'];
    userId?: string;
    userEmail?: string;
    metadata?: Record<string, any>;
  } = {}
): SupportPayload {
  const basePayload = buildBasePayload();
  
  return {
    ...basePayload,
    supportType,
    message,
    category: options.category,
    priority: options.priority || 'medium',
    userId: options.userId,
    userEmail: options.userEmail,
    metadata: {
      ...options.metadata,
      // Add some context that might be helpful for support
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      screen_resolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };
}

/**
 * Build the base payload with common fields
 */
function buildBasePayload(): BaseEventPayload {
  return {
    timestamp: new Date().toISOString(),
    clientId: getClientId(),
    sessionId: getSessionId(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };
}

/**
 * Validate that required fields are present in a payload
 */
export function validatePayload(payload: any): boolean {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const requiredFields = ['timestamp', 'clientId', 'sessionId'];
  return requiredFields.every(field => 
    payload[field] && typeof payload[field] === 'string'
  );
}

/**
 * Sanitize user input to prevent XSS and other issues
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .slice(0, 1000) // Limit length
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
}

/**
 * Generate a correlation ID for tracking related events
 */
export function generateCorrelationId(): string {
  return uuidv4();
}

/**
 * Get browser and environment information
 */
export function getBrowserInfo(): Record<string, any> {
  return {
    language: navigator.language,
    languages: navigator.languages,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    doNotTrack: navigator.doNotTrack,
    hardwareConcurrency: navigator.hardwareConcurrency,
    maxTouchPoints: navigator.maxTouchPoints,
  };
}

/**
 * Get performance metrics if available
 */
export function getPerformanceMetrics(): Record<string, any> | null {
  if (!window.performance || !window.performance.timing) {
    return null;
  }

  const timing = window.performance.timing;
  const navigation = timing.navigationStart;

  return {
    page_load_time: timing.loadEventEnd - navigation,
    dom_ready_time: timing.domContentLoadedEventEnd - navigation,
    first_paint: window.performance.getEntriesByType?.('paint')
      ?.find(entry => entry.name === 'first-paint')?.startTime || null,
    memory_used: (window.performance as any).memory?.usedJSHeapSize || null,
  };
}
