// JSON helpers with type safety
export function safeParseJSON<T = any>(
  input: string | null | undefined,
  fallback: T | null = null
): T | null {
  if (!input || typeof input !== 'string') {
    return fallback;
  }

  try {
    return JSON.parse(input) as T;
  } catch {
    return fallback;
  }
}

export function safeStringify(input: any, fallback = 'null'): string {
  try {
    return JSON.stringify(input);
  } catch {
    return fallback;
  }
}

// ID generation with crypto fallback
export function generateId(prefix = ''): string {
  // Use crypto.randomUUID when available (modern browsers)
  if (globalThis.crypto?.randomUUID) {
    const uuid = globalThis.crypto.randomUUID();
    return prefix ? `${prefix}${uuid}` : uuid;
  }

  // Fallback for older browsers or environments
  const timestamp = Date.now().toString(36);
  const random = Math.floor(Math.random() * 1e6).toString(36);
  const id = `${timestamp}-${random}`;
  
  return prefix ? `${prefix}${id}` : id;
}

// Debounce with cancellation support
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait = 200
): ((...args: Parameters<T>) => void) & { cancel(): void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, wait);
  };

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

// Throttle with cancellation support
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit = 250
): ((...args: Parameters<T>) => void) & { cancel(): void } {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const throttled = (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);
    } else if (timeoutId === null) {
      // Schedule the next call
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        fn(...args);
        timeoutId = null;
      }, limit - (now - lastCall));
    }
  };

  throttled.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return throttled;
}

// Date formatting helpers
export function formatShortDate(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const currentYear = now.getFullYear();
    const dateYear = date.getFullYear();

    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    };

    // Include year if different from current year
    if (dateYear !== currentYear) {
      options.year = 'numeric';
    }

    return date.toLocaleDateString('en-US', options);
  } catch {
    return 'Invalid Date';
  }
}

export function formatTimestamp(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const timeString = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (messageDate.getTime() === today.getTime()) {
      return timeString;
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return `Yesterday ${timeString}`;
    } else {
      // For older dates, show date + time
      const dateString = formatShortDate(iso);
      return `${dateString} ${timeString}`;
    }
  } catch {
    return 'Invalid Date';
  }
}

// Validators and helpers
export function isEmail(v?: string): v is string {
  if (!v || typeof v !== 'string') {
    return false;
  }

  // Simple email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(v);
}

export function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`);
}

// Environment-aware debug logging
export const debugLog = (
  level: 'debug' | 'info' | 'warn' | 'error',
  ...args: any[]
): void => {
  // Only log in development mode
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  // Map levels to console methods
  switch (level) {
    case 'debug':
      console.debug(...args);
      break;
    case 'info':
      console.info(...args);
      break;
    case 'warn':
      console.warn(...args);
      break;
    case 'error':
      console.error(...args);
      break;
    default:
      assertNever(level);
  }
};

// Additional utility helpers
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function isEmpty(value: any): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

export function capitalize(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Sleep utility for testing or delays
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
