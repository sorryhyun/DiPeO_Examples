// filepath: src/core/utils.ts

import type { ApiResult, ApiError } from '@/core/contracts';
import { config } from '@/app/config';
import { runHook } from '@/core/hooks';

// =============================
// FETCH UTILITIES
// =============================

export interface FetcherOptions extends RequestInit {
  getToken?: () => string | null;
  baseUrl?: string;
}

/**
 * Centralized fetch wrapper that returns standardized ApiResult.
 * Integrates with hooks system for middleware and logging.
 */
export async function fetcher<T = any>(
  input: RequestInfo | string,
  options: FetcherOptions = {}
): Promise<ApiResult<T>> {
  const { getToken, baseUrl, ...fetchOptions } = options;
  
  // Build full URL
  const base = baseUrl || config.apiBaseUrl;
  const url = typeof input === 'string' && !input.startsWith('http') 
    ? `${base}${input.startsWith('/') ? input : `/${input}`}`
    : input;

  // Prepare headers
  const headers = new Headers(fetchOptions.headers);
  
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  
  if (!headers.has('Content-Type') && (fetchOptions.method === 'POST' || fetchOptions.method === 'PUT' || fetchOptions.method === 'PATCH')) {
    headers.set('Content-Type', 'application/json');
  }

  // Add auth token if provided
  const token = getToken?.();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const requestOptions: RequestInit = {
    ...fetchOptions,
    headers,
  };

  // Create request context for hooks
  const requestContext = {
    url: typeof url === 'string' ? url : url.url,
    method: requestOptions.method || 'GET',
    headers: Object.fromEntries(headers.entries()),
    body: requestOptions.body,
  };

  try {
    // Run before request hook
    await runHook('beforeApiRequest', requestContext);

    const response = await fetch(url, requestOptions);
    
    let data: T | undefined;
    let error: ApiError | undefined;

    // Try to parse JSON response
    try {
      const text = await response.text();
      
      if (text) {
        try {
          const parsed = JSON.parse(text);
          
          if (response.ok) {
            data = parsed as T;
          } else {
            // Server returned structured error
            error = {
              status: response.status,
              message: parsed.message || parsed.error || response.statusText,
              code: parsed.code,
              details: parsed.details,
            };
          }
        } catch {
          // Non-JSON response
          if (response.ok) {
            // If response is OK but not JSON, treat as success with text data
            data = text as unknown as T;
          } else {
            error = {
              status: response.status,
              message: text || response.statusText,
            };
          }
        }
      } else {
        // Empty response
        if (!response.ok) {
          error = {
            status: response.status,
            message: response.statusText,
          };
        }
      }
    } catch (parseError) {
      error = {
        status: response.status,
        message: `Failed to parse response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
      };
    }

    const result: ApiResult<T> = {
      success: response.ok && !error,
      data,
      error,
    };

    // Create response context for hooks
    const responseContext = {
      ...requestContext,
      response: result,
      status: response.status,
      statusText: response.statusText,
    };

    // Run after response hook
    await runHook('afterApiResponse', responseContext);

    return result;

  } catch (fetchError) {
    const error: ApiError = {
      message: fetchError instanceof Error ? fetchError.message : 'Network error',
      code: 'FETCH_ERROR',
    };

    const result: ApiResult<T> = {
      success: false,
      error,
    };

    // Run after response hook for errors too
    const errorContext = {
      ...requestContext,
      response: result,
      error: fetchError,
    };

    await runHook('afterApiResponse', errorContext);

    return result;
  }
}

// =============================
// CLASS NAME UTILITIES
// =============================

export type ClassNameValue = string | Record<string, boolean> | undefined | null | false;

/**
 * Utility to conditionally join class names.
 */
export function classNames(...items: ClassNameValue[]): string {
  const classes: string[] = [];
  
  for (const item of items) {
    if (!item) continue;
    
    if (typeof item === 'string') {
      classes.push(item);
    } else if (typeof item === 'object') {
      for (const [key, value] of Object.entries(item)) {
        if (value) {
          classes.push(key);
        }
      }
    }
  }
  
  return classes.join(' ');
}

// =============================
// DATE UTILITIES
// =============================

export interface FormatDateOptions {
  dateOnly?: boolean;
  locale?: string;
  timeZone?: string;
  format?: 'short' | 'medium' | 'long' | 'full';
}

/**
 * Format dates with sensible defaults and fallbacks.
 */
export function formatDate(
  dateOrIso: string | Date | null | undefined,
  options: FormatDateOptions = {}
): string {
  if (!dateOrIso) return '';
  
  const {
    dateOnly = false,
    locale = 'en-US',
    timeZone,
    format = 'medium',
  } = options;

  try {
    const date = typeof dateOrIso === 'string' ? new Date(dateOrIso) : dateOrIso;
    
    if (isNaN(date.getTime())) {
      return String(dateOrIso);
    }

    // Use Intl.DateTimeFormat if available
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      const formatOptions: Intl.DateTimeFormatOptions = {
        timeZone,
      };

      if (dateOnly) {
        switch (format) {
          case 'short':
            formatOptions.dateStyle = 'short';
            break;
          case 'medium':
            formatOptions.dateStyle = 'medium';
            break;
          case 'long':
            formatOptions.dateStyle = 'long';
            break;
          case 'full':
            formatOptions.dateStyle = 'full';
            break;
        }
      } else {
        switch (format) {
          case 'short':
            formatOptions.dateStyle = 'short';
            formatOptions.timeStyle = 'short';
            break;
          case 'medium':
            formatOptions.dateStyle = 'medium';
            formatOptions.timeStyle = 'short';
            break;
          case 'long':
            formatOptions.dateStyle = 'long';
            formatOptions.timeStyle = 'medium';
            break;
          case 'full':
            formatOptions.dateStyle = 'full';
            formatOptions.timeStyle = 'full';
            break;
        }
      }

      return new Intl.DateTimeFormat(locale, formatOptions).format(date);
    } else {
      // Fallback for environments without Intl
      return dateOnly 
        ? date.toLocaleDateString()
        : date.toLocaleString();
    }
  } catch (error) {
    // Fallback to string representation
    return String(dateOrIso);
  }
}

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days").
 */
export function formatRelativeTime(
  dateOrIso: string | Date | null | undefined,
  locale: string = 'en-US'
): string {
  if (!dateOrIso) return '';
  
  try {
    const date = typeof dateOrIso === 'string' ? new Date(dateOrIso) : dateOrIso;
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    // Use Intl.RelativeTimeFormat if available
    if (typeof Intl !== 'undefined' && Intl.RelativeTimeFormat) {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
      
      if (Math.abs(diffDays) >= 1) {
        return rtf.format(diffDays, 'day');
      } else if (Math.abs(diffHours) >= 1) {
        return rtf.format(diffHours, 'hour');
      } else if (Math.abs(diffMinutes) >= 1) {
        return rtf.format(diffMinutes, 'minute');
      } else {
        return rtf.format(diffSeconds, 'second');
      }
    } else {
      // Simple fallback
      const abs = Math.abs;
      if (abs(diffDays) >= 1) {
        return diffDays > 0 ? `in ${abs(diffDays)} day${abs(diffDays) === 1 ? '' : 's'}` : `${abs(diffDays)} day${abs(diffDays) === 1 ? '' : 's'} ago`;
      } else if (abs(diffHours) >= 1) {
        return diffHours > 0 ? `in ${abs(diffHours)} hour${abs(diffHours) === 1 ? '' : 's'}` : `${abs(diffHours)} hour${abs(diffHours) === 1 ? '' : 's'} ago`;
      } else if (abs(diffMinutes) >= 1) {
        return diffMinutes > 0 ? `in ${abs(diffMinutes)} minute${abs(diffMinutes) === 1 ? '' : 's'}` : `${abs(diffMinutes)} minute${abs(diffMinutes) === 1 ? '' : 's'} ago`;
      } else {
        return 'just now';
      }
    }
  } catch (error) {
    return formatDate(dateOrIso);
  }
}

// =============================
// JSON UTILITIES
// =============================

/**
 * Safely parse JSON with fallback value.
 */
export function safeJSONParse<T>(
  raw: string | null | undefined, 
  fallback?: T
): T | undefined {
  if (!raw) return fallback;
  
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Safely stringify JSON with fallback.
 */
export function safeJSONStringify(
  value: any, 
  fallback: string = ''
): string {
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
}

// =============================
// ASYNC UTILITIES
// =============================

/**
 * Simple delay utility for testing and animations.
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce function calls.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), waitMs);
  };
}

/**
 * Throttle function calls.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null;
  let lastExecTime = 0;
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > waitMs) {
      func(...args);
      lastExecTime = currentTime;
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
        timeoutId = null;
      }, waitMs - (currentTime - lastExecTime));
    }
  };
}

// =============================
// DEBUG UTILITIES
// =============================

/**
 * Create namespaced debug logger that respects config settings.
 */
export function debug(namespace: string): (...args: any[]) => void {
  const isEnabled = config.development_mode.verbose_logs || 
    (import.meta.env.VITE_DEBUG && import.meta.env.VITE_DEBUG.includes(namespace));
  
  if (!isEnabled) {
    return () => {}; // No-op function
  }
  
  return (...args: any[]) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${namespace}:`, ...args);
  };
}

// =============================
// CRYPTO UTILITIES (SIMPLE)
// =============================

/**
 * Simple base64 encoding (browser-safe).
 */
export function simpleBase64Encode(value: string): string {
  try {
    if (typeof btoa !== 'undefined') {
      return btoa(value);
    } else {
      // Fallback for environments without btoa
      return Buffer.from(value).toString('base64');
    }
  } catch {
    return value; // Return original if encoding fails
  }
}

/**
 * Simple base64 decoding (browser-safe).
 */
export function simpleBase64Decode(value: string): string {
  try {
    if (typeof atob !== 'undefined') {
      return atob(value);
    } else {
      // Fallback for environments without atob
      return Buffer.from(value, 'base64').toString();
    }
  } catch {
    return value; // Return original if decoding fails
  }
}

/**
 * Simple encryption wrapper for local storage.
 * Note: This is NOT cryptographically secure - just obfuscation.
 */
export function encryptLocal(value: string): string {
  try {
    const wrapped = {
      data: simpleBase64Encode(value),
      timestamp: Date.now(),
      version: 1,
    };
    return simpleBase64Encode(JSON.stringify(wrapped));
  } catch {
    return value;
  }
}

/**
 * Simple decryption wrapper for local storage.
 */
export function decryptLocal(value: string): string {
  try {
    const decoded = simpleBase64Decode(value);
    const wrapped = JSON.parse(decoded);
    
    if (wrapped && wrapped.data && wrapped.version === 1) {
      return simpleBase64Decode(wrapped.data);
    }
    
    // Fallback for non-wrapped data
    return simpleBase64Decode(value);
  } catch {
    return value;
  }
}

// =============================
// VALIDATION UTILITIES
// =============================

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object).
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Check if a string is a valid email address.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if a value is a valid URL.
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// =============================
// OBJECT UTILITIES
// =============================

/**
 * Deep clone an object (simple implementation).
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (Array.isArray(obj)) return obj.map(deepClone) as unknown as T;
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * Pick specific keys from an object.
 */
export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Omit specific keys from an object.
 */
export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

// =============================
// ID UTILITIES
// =============================

/**
 * Generate a simple unique ID (not cryptographically secure).
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}-${timestamp}-${randomPart}` : `${timestamp}-${randomPart}`;
}

/**
 * Generate a UUID v4 (simple implementation).
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// =============================
// ARRAY UTILITIES
// =============================

/**
 * Remove duplicates from an array.
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Group array items by a key function.
 */
export function groupBy<T, K extends string | number | symbol>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  const groups = {} as Record<K, T[]>;
  
  for (const item of array) {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
  }
  
  return groups;
}

/**
 * Sort array by multiple criteria.
 */
export function sortBy<T>(
  array: T[],
  ...sortFns: Array<(item: T) => any>
): T[] {
  return [...array].sort((a, b) => {
    for (const sortFn of sortFns) {
      const aVal = sortFn(a);
      const bVal = sortFn(b);
      
      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
    }
    return 0;
  });
}

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (integrates with hook system, no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports utility functions (not components, but exports named functions)
// [x] Adds basic ARIA and keyboard handlers (N/A for utility functions)
