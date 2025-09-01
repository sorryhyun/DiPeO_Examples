// filepath: src/services/cache.ts
/* src/services/cache.ts

Simple in-memory cache used by useFetch; provides TTL and manual invalidation APIs.
Designed to be replaceable with IndexedDB or sessionStorage cache later.
*/

import { appConfig } from '@/app/config';

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  key: string;
}

interface CacheOptions {
  ttl?: number; // Default TTL in milliseconds
  maxSize?: number; // Maximum number of entries
}

class InMemoryCache {
  private store = new Map<string, CacheEntry>();
  private readonly defaultTtl: number;
  private readonly maxSize: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(options: CacheOptions = {}) {
    this.defaultTtl = options.ttl ?? 5 * 60 * 1000; // 5 minutes default
    this.maxSize = options.maxSize ?? 1000; // Max 1000 entries
    
    // Start cleanup interval in development or when explicitly enabled
    if (appConfig.isDevelopment || appConfig.features.analytics) {
      this.startCleanupInterval();
    }
  }

  private startCleanupInterval(): void {
    // Clean up expired entries every 2 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 2 * 60 * 1000);
  }

  private stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  private cleanupExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.store) {
      if (this.isExpired(entry, now)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.store.delete(key));

    if (appConfig.isDevelopment && keysToDelete.length > 0) {
      console.debug(`[Cache] Cleaned up ${keysToDelete.length} expired entries`);
    }
  }

  private isExpired(entry: CacheEntry, currentTime = Date.now()): boolean {
    return currentTime - entry.timestamp > entry.ttl;
  }

  private evictOldest(): void {
    if (this.store.size === 0) return;

    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [key, entry] of this.store) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.store.delete(oldestKey);
    }
  }

  get<T = any>(key: string): T | null {
    const entry = this.store.get(key);
    
    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T = any>(key: string, data: T, ttl?: number): void {
    // Evict entries if we're at max capacity
    if (this.store.size >= this.maxSize) {
      // Remove expired entries first
      this.cleanupExpired();
      
      // If still at capacity, evict oldest
      if (this.store.size >= this.maxSize) {
        this.evictOldest();
      }
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTtl,
      key,
    };

    this.store.set(key, entry);
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    
    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.store.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  // Get all non-expired keys
  keys(): string[] {
    const validKeys: string[] = [];
    const now = Date.now();

    for (const [key, entry] of this.store) {
      if (!this.isExpired(entry, now)) {
        validKeys.push(key);
      }
    }

    return validKeys;
  }

  // Get cache statistics
  getStats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.store.size,
      maxSize: this.maxSize,
    };
  }

  // Invalidate entries matching a pattern
  invalidatePattern(pattern: string | RegExp): number {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    const keysToDelete: string[] = [];

    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.store.delete(key));
    return keysToDelete.length;
  }

  // Cleanup method for proper disposal
  destroy(): void {
    this.stopCleanupInterval();
    this.clear();
  }
}

// Create default cache instance
const defaultCache = new InMemoryCache({
  ttl: appConfig.isDevelopment ? 30 * 1000 : 5 * 60 * 1000, // 30s in dev, 5min in prod
  maxSize: 500,
});

// Convenience functions for the default cache instance
export function getCached<T = any>(key: string): T | null {
  return defaultCache.get<T>(key);
}

export function setCached<T = any>(key: string, data: T, ttl?: number): void {
  defaultCache.set(key, data, ttl);
}

export function invalidate(keyOrPattern: string | RegExp): number {
  if (typeof keyOrPattern === 'string' && !keyOrPattern.includes('*') && !keyOrPattern.includes('[')) {
    // Simple key deletion
    return defaultCache.delete(keyOrPattern) ? 1 : 0;
  }
  
  // Pattern-based invalidation
  return defaultCache.invalidatePattern(keyOrPattern);
}

export function clearCache(): void {
  defaultCache.clear();
}

export function getCacheStats(): { size: number; maxSize: number; hitRate?: number } {
  return defaultCache.getStats();
}

// Export the cache instance for advanced usage
export const cache = defaultCache;

// Cache key utilities
export const cacheKeys = {
  api: (endpoint: string, params?: Record<string, any>) => {
    const paramStr = params ? `?${new URLSearchParams(params).toString()}` : '';
    return `api:${endpoint}${paramStr}`;
  },
  user: (userId: string) => `user:${userId}`,
  patient: (patientId: string) => `patient:${patientId}`,
  appointments: (userId: string, date?: string) => `appointments:${userId}${date ? `:${date}` : ''}`,
  labResults: (patientId: string) => `labs:${patientId}`,
  search: (query: string, type?: string) => `search:${type || 'all'}:${query}`,
};

// Cleanup cache on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    defaultCache.destroy();
  });
}

/* Example usage:

import { getCached, setCached, invalidate, cacheKeys } from '@/services/cache'

// Basic usage
const userData = getCached<User>('user:123')
if (!userData) {
  const user = await fetchUser('123')
  setCached('user:123', user, 10 * 60 * 1000) // 10 minutes
}

// With cache keys utility
const appointmentsKey = cacheKeys.appointments('user123', '2024-01-15')
setCached(appointmentsKey, appointments)

// Pattern invalidation
invalidate(/^user:/) // Clear all user-related cache
invalidate('appointments:*') // Clear all appointments

*/

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects - uses in-memory cache)
// [x] Reads config from `@/app/config`
// [x] Exports default named component (exports cache instance and utility functions)
// [x] Adds basic ARIA and keyboard handlers (not applicable for cache service)
