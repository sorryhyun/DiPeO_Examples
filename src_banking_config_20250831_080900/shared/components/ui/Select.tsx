import { appConfig } from '@/app/config'

// Global counter for unique ID generation to avoid conflicts
let idCounter = 0

/**
 * Format currency using Intl.NumberFormat or fallback
 * @param amount - The numeric amount to format
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale for formatting (default: browser locale or 'en-US')
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale = (typeof navigator !== 'undefined' ? navigator.language : 'en-US')
): string {
  try {
    if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)
    }
  } catch (error) {
    // Fallback on error
    console.warn('Intl.NumberFormat failed, using fallback:', error)
  }

  // Simple fallback for environments without Intl support
  const symbol = getCurrencySymbol(currency)
  return `${symbol}${amount.toFixed(2)}`
}

/**
 * Get currency symbol for fallback formatting
 */
function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'CHF',
    CNY: '¥',
    INR: '₹',
    BRL: 'R$',
    MXN: '$'
  }
  return symbols[currency] || `${currency} `
}

/**
 * Format date using Intl.DateTimeFormat or fallback
 * @param date - Date to format (string, Date, or timestamp)
 * @param opts - Optional Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date | number,
  opts?: Intl.DateTimeFormatOptions
): string {
  try {
    const dateObj = normalizeDate(date)
    const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US'

    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      const defaultOpts: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...opts
      }
      
      return new Intl.DateTimeFormat(locale, defaultOpts).format(dateObj)
    }
  } catch (error) {
    console.warn('Date formatting failed, using fallback:', error)
  }

  // Simple fallback
  const dateObj = normalizeDate(date)
  return dateObj.toLocaleDateString()
}

/**
 * Normalize various date inputs to Date object
 */
function normalizeDate(date: string | Date | number): Date {
  if (date instanceof Date) {
    return date
  }
  
  if (typeof date === 'number') {
    return new Date(date)
  }
  
  if (typeof date === 'string') {
    // Handle ISO strings and other formats
    const parsed = new Date(date)
    if (isNaN(parsed.getTime())) {
      throw new Error(`Invalid date string: ${date}`)
    }
    return parsed
  }
  
  throw new Error(`Invalid date input: ${date}`)
}

/**
 * Safely parse JSON with fallback
 * @param value - JSON string to parse (can be null)
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export function safeJsonParse<T>(value: string | null, fallback?: T): T | undefined {
  if (!value || typeof value !== 'string') {
    return fallback
  }

  try {
    const parsed = JSON.parse(value)
    return parsed as T
  } catch (error) {
    console.warn('JSON parse failed:', error)
    return fallback
  }
}

/**
 * Sleep for specified milliseconds
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Tailwind-friendly class name utility
 * Combines conditional classes into a single string
 * @param args - Class names, objects with boolean conditions, or falsy values
 * @returns Combined class string
 */
export function classNames(
  ...args: Array<string | false | null | undefined | Record<string, boolean>>
): string {
  const classes: string[] = []

  for (const arg of args) {
    if (!arg) continue

    if (typeof arg === 'string') {
      classes.push(arg)
    } else if (typeof arg === 'object') {
      for (const [key, condition] of Object.entries(arg)) {
        if (condition) {
          classes.push(key)
        }
      }
    }
  }

  return classes.join(' ')
}

/**
 * Check if we're running in a browser environment
 */
export const isBrowser = typeof window !== 'undefined'

/**
 * Debug logger with namespace filtering
 * @param namespace - Namespace for this log entry
 * @param args - Arguments to log
 */
export function debugLog(namespace: string, ...args: any[]): void {
  // Check if debugging is enabled
  if (!shouldLog(namespace)) {
    return
  }

  const timestamp = new Date().toISOString()
  console.debug(`[${timestamp}] [${namespace}]`, ...args)
}

/**
 * Check if logging should be enabled for a namespace
 */
function shouldLog(namespace: string): boolean {
  try {
    // Check environment variable (for Node.js/build time)
    if (typeof process !== 'undefined' && process.env?.DEBUG) {
      const debugPattern = process.env.DEBUG
      if (debugPattern === '*' || debugPattern.includes(namespace)) {
        return true
      }
    }

    // Check app config
    if (appConfig?.debug?.enabled) {
      const namespaces = appConfig.debug.namespaces
      if (!namespaces || namespaces.length === 0 || namespaces.includes('*')) {
        return true
      }
      return namespaces.some(pattern => 
        pattern === namespace || namespace.startsWith(pattern.replace('*', ''))
      )
    }

    // Check URL parameter in browser
    if (isBrowser) {
      const urlParams = new URLSearchParams(window.location.search)
      const debugParam = urlParams.get('debug')
      if (debugParam === '*' || debugParam?.includes(namespace)) {
        return true
      }
    }

    return false
  } catch (error) {
    // Silently fail for debug logging
    return false
  }
}

/**
 * Generate unique ARIA ID
 * @param prefix - Prefix for the ID
 * @returns Unique ID string
 */
export function ariaId(prefix = 'id'): string {
  return `${prefix}-${++idCounter}`
}

/**
 * Check if key event is Enter key
 * @param e - Keyboard event
 * @returns True if Enter key was pressed
 */
export function isEnterKey(e: KeyboardEvent | React.KeyboardEvent): boolean {
  return e.key === 'Enter'
}

/**
 * Check if key event is Escape key
 * @param e - Keyboard event
 * @returns True if Escape key was pressed
 */
export function isEscapeKey(e: KeyboardEvent | React.KeyboardEvent): boolean {
  return e.key === 'Escape'
}

/**
 * Check if key event is Space key
 * @param e - Keyboard event
 * @returns True if Space key was pressed
 */
export function isSpaceKey(e: KeyboardEvent | React.KeyboardEvent): boolean {
  return e.key === ' ' || e.key === 'Spacebar' // Legacy support
}

/**
 * Check if key event is Arrow key
 * @param e - Keyboard event
 * @param direction - Optional specific direction
 * @returns True if arrow key was pressed
 */
export function isArrowKey(
  e: KeyboardEvent | React.KeyboardEvent,
  direction?: 'up' | 'down' | 'left' | 'right'
): boolean {
  const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
  
  if (direction) {
    const directionMap = {
      up: 'ArrowUp',
      down: 'ArrowDown',
      left: 'ArrowLeft',
      right: 'ArrowRight'
    }
    return e.key === directionMap[direction]
  }
  
  return arrowKeys.includes(e.key)
}

/**
 * Check if key event is Tab key
 * @param e - Keyboard event
 * @returns True if Tab key was pressed
 */
export function isTabKey(e: KeyboardEvent | React.KeyboardEvent): boolean {
  return e.key === 'Tab'
}

/**
 * Handle keyboard navigation for accessibility
 * Prevents default and stops propagation for handled keys
 * @param e - Keyboard event
 * @param handlers - Map of key handlers
 */
export function handleKeyboardNavigation(
  e: KeyboardEvent | React.KeyboardEvent,
  handlers: Partial<Record<string, () => void>>
): void {
  const handler = handlers[e.key]
  
  if (handler) {
    e.preventDefault()
    e.stopPropagation()
    handler()
  }
}

/**
 * Create ARIA attributes for accessibility
 * @param options - ARIA attribute options
 * @returns Object with ARIA attributes
 */
export function createAriaAttributes(options: {
  label?: string
  describedBy?: string
  expanded?: boolean
  selected?: boolean
  checked?: boolean
  disabled?: boolean
  required?: boolean
  invalid?: boolean
  hidden?: boolean
  live?: 'polite' | 'assertive' | 'off'
  role?: string
}): Record<string, string | boolean | undefined> {
  const attrs: Record<string, string | boolean | undefined> = {}

  if (options.label !== undefined) attrs['aria-label'] = options.label
  if (options.describedBy !== undefined) attrs['aria-describedby'] = options.describedBy
  if (options.expanded !== undefined) attrs['aria-expanded'] = options.expanded
  if (options.selected !== undefined) attrs['aria-selected'] = options.selected
  if (options.checked !== undefined) attrs['aria-checked'] = options.checked
  if (options.disabled !== undefined) attrs['aria-disabled'] = options.disabled
  if (options.required !== undefined) attrs['aria-required'] = options.required
  if (options.invalid !== undefined) attrs['aria-invalid'] = options.invalid
  if (options.hidden !== undefined) attrs['aria-hidden'] = options.hidden
  if (options.live !== undefined) attrs['aria-live'] = options.live
  if (options.role !== undefined) attrs.role = options.role

  return attrs
}

/**
 * Clamp a number between min and max values
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Throttle function calls
 * @param fn - Function to throttle
 * @param delay - Delay in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  
  return (...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastCall >= delay) {
      lastCall = now
      fn(...args)
    }
  }
}

/**
 * Debounce function calls
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

/**
 * Simple deep clone using JSON (limited but safe for plain objects)
 * @param obj - Object to clone
 * @returns Cloned object
 */
export function simpleClone<T>(obj: T): T {
  try {
    return JSON.parse(JSON.stringify(obj))
  } catch (error) {
    console.warn('Clone failed, returning original object:', error)
    return obj
  }
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param value - Value to check
 * @returns True if empty
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Format file size in human readable format
 * @param bytes - Size in bytes
 * @param decimals - Number of decimal places
 * @returns Formatted size string
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * Generate a simple hash from a string (for non-cryptographic purposes)
 * @param str - String to hash
 * @returns Hash number
 */
export function simpleHash(str: string): number {
  let hash = 0
  
  if (str.length === 0) return hash
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return Math.abs(hash)
}