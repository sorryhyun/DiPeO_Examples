/**
 * Persistence utilities for localStorage key management and data migration
 */

// Version constant for key generation
const STORAGE_VERSION = 'v1';
const APP_PREFIX = 'memorygame';

/**
 * Creates a consistent localStorage key with proper namespacing
 * @param scope - The functional scope (e.g., 'game', 'settings', 'stats')
 * @param name - The specific item name (e.g., 'highScore', 'theme', 'volume')
 * @returns Formatted localStorage key
 */
export function makeKey(scope: string, name: string): string {
  return `${APP_PREFIX}:${STORAGE_VERSION}:${scope}:${name}`;
}

/**
 * Migration function type for transforming stored data
 */
export type MigrationTransform<T = any> = (oldData: any) => T;

/**
 * Migration helper to handle data schema changes
 * @param key - The localStorage key to check
 * @param currentVersion - Current expected version
 * @param transformFn - Function to transform old data to new format
 * @returns The migrated data or null if no data exists
 */
export function migrateIfNeeded<T>(
  key: string,
  currentVersion: string,
  transformFn?: MigrationTransform<T>
): T | null {
  try {
    const storedValue = localStorage.getItem(key);
    if (!storedValue) return null;

    let parsedData: any;
    try {
      parsedData = JSON.parse(storedValue);
    } catch {
      // Invalid JSON, remove corrupted data
      localStorage.removeItem(key);
      return null;
    }

    // If data doesn't have version info, it's from an older version
    if (!parsedData.__version) {
      if (transformFn) {
        const migratedData = {
          ...transformFn(parsedData),
          __version: currentVersion,
        };
        localStorage.setItem(key, JSON.stringify(migratedData));
        return migratedData;
      } else {
        // No transform function provided, remove old data
        localStorage.removeItem(key);
        return null;
      }
    }

    // Check if version matches
    if (parsedData.__version !== currentVersion) {
      if (transformFn) {
        const migratedData = {
          ...transformFn(parsedData),
          __version: currentVersion,
        };
        localStorage.setItem(key, JSON.stringify(migratedData));
        return migratedData;
      } else {
        // No transform function, remove incompatible data
        localStorage.removeItem(key);
        return null;
      }
    }

    return parsedData;
  } catch (error) {
    console.warn(`Migration failed for key ${key}:`, error);
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * Stores data with version information
 * @param key - The localStorage key
 * @param data - The data to store
 * @param version - The version to tag the data with
 */
export function storeWithVersion<T>(
  key: string,
  data: T,
  version: string = STORAGE_VERSION
): void {
  try {
    const versionedData = {
      ...data,
      __version: version,
    };
    localStorage.setItem(key, JSON.stringify(versionedData));
  } catch (error) {
    console.warn(`Failed to store data for key ${key}:`, error);
  }
}

/**
 * Removes data from localStorage safely
 * @param key - The localStorage key to remove
 */
export function removeStoredData(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to remove data for key ${key}:`, error);
  }
}

/**
 * Clears all app-related data from localStorage
 * Useful for development or user-requested data reset
 */
export function clearAllAppData(): void {
  try {
    const keysToRemove: string[] = [];
    
    // Find all keys that match our app prefix
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(APP_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all found keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log(`Cleared ${keysToRemove.length} app data entries`);
  } catch (error) {
    console.warn('Failed to clear app data:', error);
  }
}

/**
 * Gets the current storage version
 */
export function getCurrentVersion(): string {
  return STORAGE_VERSION;
}
