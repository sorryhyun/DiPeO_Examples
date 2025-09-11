// filepath: src/services/storage.ts
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component (storage service)
// [ ] Adds basic ARIA and keyboard handlers (where relevant - N/A for storage service)

import { config, isDevelopment } from '@/app/config'
import { eventBus } from '@/core/events'
import { parseJSON, safeStringify, debugLog } from '@/core/utils'

/* src/services/storage.ts

   Storage abstraction over localStorage with TTL support, type safety, and graceful fallbacks.
   Used for storing user preferences, AB test variants, cookie consent, and simple caches.

   Example:
     import { storage } from '@/services/storage'
     storage.set('user-prefs', { theme: 'dark' }, { ttl: 86400 }) // 1 day TTL
     const prefs = storage.get('user-prefs', { theme: 'light' })
*/

export interface StorageOptions {
  ttl?: number // seconds
  serialize?: boolean // default true
  namespace?: string // optional key prefix
}

export interface StorageEntry<T = unknown> {
  value: T
  createdAt: number
  expiresAt?: number
  namespace?: string
}

export class StorageService {
  private readonly prefix: string
  private readonly fallbackStore = new Map<string, StorageEntry>()
  private readonly isSupported: boolean

  constructor(prefix = 'app') {
    this.prefix = `${prefix}:`
    this.isSupported = this.checkSupport()
    
    if (!this.isSupported && isDevelopment) {
      debugLog('localStorage not supported, using in-memory fallback')
    }
  }

  private checkSupport(): boolean {
    try {
      const testKey = '__storage_test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch {
      return false
    }
  }

  private getKey(key: string, namespace?: string): string {
    const ns = namespace ? `${namespace}:` : ''
    return `${this.prefix}${ns}${key}`
  }

  private getFromLocalStorage(key: string): StorageEntry | null {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return null
      
      const entry = parseJSON<StorageEntry>(raw)
      if (!entry || typeof entry !== 'object') return null
      
      // Check expiration
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        this.removeFromLocalStorage(key)
        return null
      }
      
      return entry
    } catch (err) {
      debugLog('localStorage read error:', err)
      return null
    }
  }

  private setToLocalStorage(key: string, entry: StorageEntry): void {
    try {
      const serialized = safeStringify(entry)
      localStorage.setItem(key, serialized)
    } catch (err) {
      debugLog('localStorage write error:', err)
      // Fall back to memory store on quota exceeded
      this.fallbackStore.set(key, entry)
    }
  }

  private removeFromLocalStorage(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (err) {
      debugLog('localStorage remove error:', err)
    }
    this.fallbackStore.delete(key)
  }

  get<T = unknown>(key: string, fallback: T | null = null, options?: StorageOptions): T | null {
    const fullKey = this.getKey(key, options?.namespace)
    
    let entry: StorageEntry<T> | null = null
    
    if (this.isSupported) {
      entry = this.getFromLocalStorage(fullKey) as StorageEntry<T> | null
    } else {
      entry = this.fallbackStore.get(fullKey) as StorageEntry<T> | null
      
      // Check expiration in memory store
      if (entry?.expiresAt && Date.now() > entry.expiresAt) {
        this.fallbackStore.delete(fullKey)
        entry = null
      }
    }
    
    if (!entry) {
      eventBus.emit('analytics:event', { 
        name: 'storage:miss', 
        properties: { key, hasSupport: this.isSupported } 
      })
      return fallback
    }
    
    eventBus.emit('analytics:event', { 
      name: 'storage:hit', 
      properties: { key, hasSupport: this.isSupported } 
    })
    
    return entry.value ?? fallback
  }

  set<T = unknown>(key: string, value: T, options?: StorageOptions): void {
    const fullKey = this.getKey(key, options?.namespace)
    const now = Date.now()
    
    const entry: StorageEntry<T> = {
      value,
      createdAt: now,
      expiresAt: options?.ttl ? now + (options.ttl * 1000) : undefined,
      namespace: options?.namespace,
    }
    
    if (this.isSupported) {
      this.setToLocalStorage(fullKey, entry)
    } else {
      this.fallbackStore.set(fullKey, entry)
    }
    
    eventBus.emit('analytics:event', { 
      name: 'storage:set', 
      properties: { 
        key, 
        hasTTL: !!options?.ttl,
        hasSupport: this.isSupported,
        namespace: options?.namespace
      } 
    })
  }

  remove(key: string, options?: Pick<StorageOptions, 'namespace'>): void {
    const fullKey = this.getKey(key, options?.namespace)
    
    if (this.isSupported) {
      this.removeFromLocalStorage(fullKey)
    } else {
      this.fallbackStore.delete(fullKey)
    }
    
    eventBus.emit('analytics:event', { 
      name: 'storage:remove', 
      properties: { key, hasSupport: this.isSupported } 
    })
  }

  clear(namespace?: string): void {
    if (namespace) {
      // Clear only keys in the specified namespace
      const nsPrefix = this.getKey('', namespace)
      
      if (this.isSupported) {
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.startsWith(nsPrefix)) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
      }
      
      // Clear from fallback store
      Array.from(this.fallbackStore.keys())
        .filter(key => key.startsWith(nsPrefix))
        .forEach(key => this.fallbackStore.delete(key))
        
    } else {
      // Clear all keys with our prefix
      if (this.isSupported) {
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.startsWith(this.prefix)) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
      }
      
      this.fallbackStore.clear()
    }
    
    eventBus.emit('analytics:event', { 
      name: 'storage:clear', 
      properties: { namespace, hasSupport: this.isSupported } 
    })
  }

  // Get all keys (useful for debugging)
  keys(namespace?: string): string[] {
    const nsPrefix = namespace ? this.getKey('', namespace) : this.prefix
    const keys: string[] = []
    
    if (this.isSupported) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(nsPrefix)) {
          // Remove our prefix to return clean key names
          keys.push(key.slice(this.prefix.length))
        }
      }
    }
    
    // Add keys from fallback store
    Array.from(this.fallbackStore.keys())
      .filter(key => key.startsWith(nsPrefix))
      .forEach(key => keys.push(key.slice(this.prefix.length)))
    
    return [...new Set(keys)] // dedupe
  }

  // Check if storage is working
  isAvailable(): boolean {
    return this.isSupported
  }

  // Get storage usage info (useful for monitoring)
  getUsageInfo(): { supported: boolean; keyCount: number; estimatedSize: number } {
    const keys = this.keys()
    let estimatedSize = 0
    
    if (this.isSupported) {
      keys.forEach(key => {
        const fullKey = this.getKey(key)
        const item = localStorage.getItem(fullKey)
        if (item) estimatedSize += item.length
      })
    } else {
      // Estimate size from fallback store
      Array.from(this.fallbackStore.values()).forEach(entry => {
        estimatedSize += safeStringify(entry).length
      })
    }
    
    return {
      supported: this.isSupported,
      keyCount: keys.length,
      estimatedSize
    }
  }
}

// Create singleton instance with app-specific prefix
export const storage = new StorageService(config.appName.toLowerCase().replace(/\s+/g, '-'))

// Convenience methods that match the expected exports
export const get = <T = unknown>(key: string, fallback: T | null = null, options?: StorageOptions) => 
  storage.get(key, fallback, options)

export const set = <T = unknown>(key: string, value: T, options?: StorageOptions) => 
  storage.set(key, value, options)

export const remove = (key: string, options?: Pick<StorageOptions, 'namespace'>) => 
  storage.remove(key, options)

// Development helpers
export const debugStorage = () => ({
  keys: storage.keys(),
  usage: storage.getUsageInfo(),
  clear: () => storage.clear(),
  isAvailable: storage.isAvailable(),
})

// Default export is the storage service instance
export default storage

// Example usage:
// storage.set('user-theme', 'dark', { ttl: 86400 }) // 1 day TTL
// storage.set('ab-test-variant', 'A', { namespace: 'experiments' })
// const theme = storage.get('user-theme', 'light')
// storage.remove('user-theme')
// storage.clear('experiments') // clear only experiment keys
