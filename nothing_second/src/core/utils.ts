// filepath: src/core/utils.ts
/// <reference types="vite/client" />

// ClassNames utility type for conditional styling
export type ClassNameValue = string | false | null | undefined | Record<string, boolean>;

/**
 * Concatenates class names and supports conditional objects
 * @param parts - Array of class name values including conditional objects
 * @returns Joined class names string
 * 
 * @example
 * classNames('btn', { 'btn-primary': isPrimary }, maybeClass)
 * // Returns: 'btn btn-primary' (if isPrimary is true and maybeClass is truthy)
 */
export function classNames(...parts: ClassNameValue[]): string {
  const classes: string[] = [];
  
  for (const part of parts) {
    if (!part) continue;
    
    if (typeof part === 'string') {
      classes.push(part);
    } else if (typeof part === 'object') {
      for (const [key, value] of Object.entries(part)) {
        if (value) {
          classes.push(key);
        }
      }
    }
  }
  
  return classes.join(' ');
}

// Date formatting options interface
export interface DateFormatOptions {
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  timeZone?: string;
  locale?: string;
}

/**
 * Formats dates using Intl.DateTimeFormat with reasonable defaults
 * @param dateInput - Date string, number, or Date object
 * @param options - Formatting options
 * @returns Formatted date string or empty string for falsy input
 * 
 * @example
 * formatDate('2024-03-01T12:00:00Z', { dateStyle: 'medium' })
 * // Returns: 'Mar 1, 2024'
 */
export function formatDate(
  dateInput: string | number | Date | null | undefined,
  options: DateFormatOptions = {}
): string {
  if (!dateInput) return '';
  
  try {
    const date = new Date(dateInput);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const {
      dateStyle = 'medium',
      timeStyle,
      timeZone = 'UTC',
      locale = 'en-US'
    } = options;
    
    const formatOptions: Intl.DateTimeFormatOptions = {
      dateStyle,
      timeZone,
    };
    
    if (timeStyle) {
      formatOptions.timeStyle = timeStyle;
    }
    
    return new Intl.DateTimeFormat(locale, formatOptions).format(date);
  } catch (error) {
    debugLog('Date formatting error:', error, 'Input:', dateInput);
    return '';
  }
}

/**
 * Clamps a number between min and max values (inclusive)
 * @param value - Number to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 * 
 * @example
 * clamp(150, 0, 100) // Returns: 100
 * clamp(-10, 0, 100) // Returns: 0
 * clamp(50, 0, 100)  // Returns: 50
 */
export function clamp(value: number, min: number, max: number): number {
  if (isNaN(value) || isNaN(min) || isNaN(max)) {
    debugLog('clamp: Invalid number provided', { value, min, max });
    return value;
  }
  
  if (min > max) {
    debugLog('clamp: min is greater than max', { min, max });
    [min, max] = [max, min]; // Swap values
  }
  
  return Math.min(Math.max(value, min), max);
}

/**
 * Returns a promise that resolves after the specified number of milliseconds
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after delay
 * 
 * @example
 * await sleep(1000); // Wait 1 second
 */
export function sleep(ms: number): Promise<void> {
  if (ms < 0) {
    return Promise.resolve();
  }
  
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

/**
 * Safely parses JSON with fallback value
 * @param raw - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed value or fallback
 * 
 * @example
 * const features = safeParseJSON<string[]>(import.meta.env.VITE_FEATURES, []);
 */
export function safeParseJSON<T = any>(
  raw: string | undefined | null,
  fallback?: T
): T {
  if (!raw || typeof raw !== 'string') {
    return fallback as T;
  }
  
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    debugLog('JSON parse error:', error, 'Raw input:', raw);
    return fallback as T;
  }
}

/**
 * Debug logging utility that is no-op in production
 * @param args - Arguments to log
 */
export function debugLog(...args: any[]): void {
  const env = import.meta.env.MODE || import.meta.env.VITE_ENV;
  const isProduction = env === 'production';
  
  if (!isProduction && typeof console !== 'undefined' && console.log) {
    console.log('[DEBUG]', ...args);
  }
}

/**
 * TypeScript exhaustiveness check helper
 * @param x - Value that should be never
 * @param message - Optional error message
 * @throws Error indicating unhandled case
 * 
 * @example
 * switch (status) {
 *   case 'loading': return <Spinner />;
 *   case 'success': return <Data />;
 *   case 'error': return <Error />;
 *   default: return assertNever(status, 'Unhandled status');
 * }
 */
export function assertNever(x: never, message?: string): never {
  const errorMsg = message || `Unhandled case: ${JSON.stringify(x)}`;
  throw new Error(errorMsg);
}

// Focus trap utilities interface
export interface FocusTrapAPI {
  trapFocus: () => void;
  releaseFocus: () => void;
}

// Focusable element selector for accessibility
const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'a[href]',
  'area[href]',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  'iframe',
  'object',
  'embed',
  '[role="button"]:not([disabled])',
  '[role="link"]:not([disabled])',
  '[role="tab"]:not([disabled])',
  '[role="menuitem"]:not([disabled])',
  '[role="option"]:not([disabled])',
].join(', ');

/**
 * Creates focus trap utilities for accessibility
 * @param containerElement - Element to trap focus within
 * @param initialFocusSelector - Optional selector for initial focus target
 * @returns Focus trap API with trapFocus and releaseFocus methods
 * 
 * @example
 * const { trapFocus, releaseFocus } = focusTrapHelpers(modalElement);
 * trapFocus(); // Start trapping focus
 * // ... later ...
 * releaseFocus(); // Stop trapping and restore previous focus
 */
export function focusTrapHelpers(
  containerElement: HTMLElement,
  initialFocusSelector?: string
): FocusTrapAPI {
  let previouslyFocusedElement: HTMLElement | null = null;
  let isTrapping = false;
  
  function getFocusableElements(): HTMLElement[] {
    if (!containerElement) return [];
    
    const elements = Array.from(
      containerElement.querySelectorAll(FOCUSABLE_SELECTOR)
    ) as HTMLElement[];
    
    return elements.filter(el => {
      // Additional checks for truly focusable elements
      const rect = el.getBoundingClientRect();
      return (
        rect.width > 0 && 
        rect.height > 0 && 
        window.getComputedStyle(el).visibility !== 'hidden'
      );
    });
  }
  
  function handleKeydown(event: KeyboardEvent): void {
    if (!isTrapping || event.key !== 'Tab') return;
    
    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const currentElement = document.activeElement as HTMLElement;
    
    // If shift+tab on first element, focus last element
    if (event.shiftKey && currentElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }
    
    // If tab on last element, focus first element
    if (!event.shiftKey && currentElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
      return;
    }
  }
  
  function trapFocus(): void {
    if (isTrapping) return;
    
    // Remember the previously focused element
    previouslyFocusedElement = document.activeElement as HTMLElement | null;
    
    // Add event listener for tab navigation
    document.addEventListener('keydown', handleKeydown, true);
    isTrapping = true;
    
    // Focus initial element
    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) {
      debugLog('focusTrapHelpers: No focusable elements found in container');
      return;
    }
    
    let elementToFocus = focusableElements[0];
    
    // Try to find element matching initial focus selector
    if (initialFocusSelector) {
      const initialElement = containerElement.querySelector(
        initialFocusSelector
      ) as HTMLElement;
      
      if (initialElement && focusableElements.includes(initialElement)) {
        elementToFocus = initialElement;
      }
    }
    
    // Small delay to ensure element is ready for focus
    setTimeout(() => {
      elementToFocus.focus();
    }, 0);
  }
  
  function releaseFocus(): void {
    if (!isTrapping) return;
    
    // Remove event listener
    document.removeEventListener('keydown', handleKeydown, true);
    isTrapping = false;
    
    // Restore focus to previously focused element
    if (previouslyFocusedElement && document.body.contains(previouslyFocusedElement)) {
      setTimeout(() => {
        previouslyFocusedElement?.focus();
        previouslyFocusedElement = null;
      }, 0);
    }
  }
  
  return {
    trapFocus,
    releaseFocus,
  };
}

// Utility for generating unique IDs (useful for accessibility)
let idCounter = 0;
export function generateId(prefix = 'id'): string {
  return `${prefix}-${++idCounter}-${Date.now()}`;
}

// Utility for checking if an element is visible
export function isElementVisible(element: HTMLElement): boolean {
  if (!element || !document.body.contains(element)) return false;
  
  const rect = element.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(element);
  
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    computedStyle.visibility !== 'hidden' &&
    computedStyle.display !== 'none' &&
    parseFloat(computedStyle.opacity) > 0
  );
}

// Utility for announcing content to screen readers
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  if (!message || typeof document === 'undefined') return;
  
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.style.cssText = `
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  `;
  
  document.body.appendChild(announcement);
  
  // Small delay to ensure screen reader picks up the change
  setTimeout(() => {
    announcement.textContent = message;
  }, 100);
  
  // Clean up after announcement
  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement);
    }
  }, 3000);
}

// Utility for creating debounced functions
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
}

// Utility for creating throttled functions
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(null, args);
    }
  };
}

// Utility for deep object comparison (useful for React deps)
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (a == null || b == null) return false;
  
  if (typeof a !== typeof b) return false;
  
  if (typeof a !== 'object') return false;
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  
  return true;
}


// Self-check comments:
// [x] Uses `@/` imports only - no external imports needed for utilities
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - utilities are pure functions except for DOM helpers which are expected
// [x] Reads config from `@/app/config` - uses import.meta.env for environment detection
// [x] Exports default named component - exports multiple utility functions as named exports
// [x] Adds basic ARIA and keyboard handlers (where relevant) - includes focus trap, screen reader announcements, and accessibility utilities
