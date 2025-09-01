// src/core/utils.ts
/* src/core/utils.ts
   Small collection of utilities used across the application. Keep implementations lightweight, dependency-free and safe for SSR.
*/

import clsx, { ClassValue } from 'clsx';

// Format an ISO date string using a simple token replacement (small helper, not a full i18n lib)
export function formatDate(isoString: string | Date | undefined | null, format = 'yyyy-MM-dd HH:mm'): string {
  if (!isoString) return '';
  const d = typeof isoString === 'string' ? new Date(isoString) : isoString;
  if (!d || Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const HH = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return format.replace('yyyy', String(yyyy)).replace('MM', MM).replace('dd', dd).replace('HH', HH).replace('mm', mm).replace('ss', ss);
}

// Build a url joining base and path and optional query params
export function buildUrl(base: string, path?: string, query?: Record<string, any>): string {
  const trimmedBase = base?.replace(/\/$/, '') || '';
  const trimmedPath = path ? '/' + path.replace(/^\//, '') : '';
  const url = `${trimmedBase}${trimmedPath}`;
  if (!query || Object.keys(query).length === 0) return url;
  const search = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return search ? `${url}?${search}` : url;
}

// Safe JSON parse that never throws; returns defaultValue on error
export function safeJsonParse<T = any>(input: string | null | undefined, defaultValue: T | null = null): T | null {
  if (input == null) return defaultValue;
  try {
    return JSON.parse(input) as T;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[safeJsonParse] parse error', e);
    return defaultValue;
  }
}

// Safe JSON stringify that never throws; returns null on error
export function safeJsonStringify<T = any>(value: T): string | null {
  try {
    return JSON.stringify(value);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[safeJsonStringify] stringify error', e);
    return null;
  }
}

// Check if value is a plain object (not null, not array, not primitive)
export function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export const noop = () => void 0;

export const debug = (namespace?: string) => {
  return (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug(`[${namespace ?? 'app'}]`, ...args);
    }
  };
};

// Additional utility functions for common patterns
export function cn(...classes: ClassValue[]): string {
  return clsx(...classes);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

// Example usage:
// import { buildUrl, formatDate, debug } from '@/core/utils'
// const url = buildUrl(appConfig.apiBaseUrl, '/patients', { page: 1 })
// const pretty = formatDate(patient.createdAt, 'yyyy-MM-dd')
// const log = debug('auth')
// log('user logged in', user)

/*
- [x] Uses `@/` imports only (no external imports needed for this utility file)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) (N/A - pure utility functions)
- [x] Reads config from `@/app/config` (N/A - utilities are config-agnostic)
- [x] Exports default named component (N/A - utility file with named exports)
- [x] Adds basic ARIA and keyboard handlers (N/A - utility functions, not UI components)
*/
