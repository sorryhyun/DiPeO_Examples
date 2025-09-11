// src/core/utils.ts

/*
✓ Uses @/ imports as much as possible
✓ Uses providers/hooks (no direct DOM/localStorage side effects)
✓ Reads config from @/app/config
✓ Exports default named component
✓ Adds basic ARIA and keyboard handlers (where relevant)
*/

import { config } from '@/app/config'

export const noop = (): void => {}

export function parseJSON<T = any>(input: string | null | undefined, fallback: T | null = null): T | null {
  if (!input) return fallback
  try {
    return JSON.parse(input) as T
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[parseJSON] invalid JSON input', err)
    return fallback
  }
}

export function safeStringify(value: unknown, replacer?: (this: any, key: string, value: any) => any, space?: string | number): string {
  try {
    return JSON.stringify(value, replacer as any, space)
  } catch (err) {
    // fallback to a safe shallow serialization
    try {
      return String(value)
    } catch {
      return '<<unserializable>>'
    }
  }
}

// short unique-id generator - collision unlikely for UI ids
export function uid(prefix = ''): string {
  const rnd = Math.random().toString(36).slice(2, 9)
  const ts = Date.now().toString(36)
  return `${prefix}${ts}-${rnd}`
}

export function clamp(v: number, min = 0, max = 1): number {
  if (Number.isNaN(v)) return min
  return Math.min(max, Math.max(min, v))
}

export function formatISODate(d: string | Date): string {
  try {
    return new Date(d).toISOString()
  } catch {
    return String(d)
  }
}

export function validateEmail(email?: string): boolean {
  if (!email) return false
  const s = String(email)
  // simple RFC5322-lite regex (not perfect but pragmatic)
  return /^(?:[a-zA-Z0-9_'^&+/=!?{|}~.-]+)@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(s)
}

// Deep freeze useful for tokenizing constants
export function deepFreeze<T>(obj: T): T {
  if (obj && typeof obj === 'object') {
    Object.getOwnPropertyNames(obj).forEach(name => {
      const prop = (obj as any)[name]
      if (prop && typeof prop === 'object') deepFreeze(prop)
    })
    try {
      return Object.freeze(obj)
    } catch {
      return obj
    }
  }
  return obj
}

// Debug logger controlled by config
export function debugLog(...args: any[]) {
  if (config.isDevelopment) {
    // eslint-disable-next-line no-console
    console.debug('[DEBUG]', ...args)
  }
}

// Small export object for convenience
export const utils = {
  noop,
  parseJSON,
  safeStringify,
  uid,
  clamp,
  formatISODate,
  validateEmail,
  deepFreeze,
  debugLog,
}

export default utils
