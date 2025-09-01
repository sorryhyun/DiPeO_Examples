import { isDevelopment } from '@/app/config';

// Predefined storage keys used throughout the app
export const LSKeys = {
  // Authentication
  AUTH_TOKEN: 'auth_token',
  AUTH_USER: 'auth_user',
  AUTH_REFRESH_TOKEN: 'auth_refresh_token',
  
  // User preferences
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  NOTIFICATION_SETTINGS: 'notification_settings',
  
  // Chat state
  ACTIVE_CHANNEL: 'active_channel',
  DRAFT_MESSAGES: 'draft_messages',
  MUTED_CHANNELS: 'muted_channels',
  PINNED_CHANNELS: 'pinned_channels',
  
  // Development/Mock data
  MOCK_USER_ID: 'mock_user_id',
  MOCK_CHANNELS: 'mock_channels',
  MOCK_MESSAGES: 'mock_messages',
  MOCK_PRESENCE: 'mock_presence',
  
  // App state
  LAST_SEEN: 'last_seen',
  WINDOW_STATE: 'window_state',
  TOUR_COMPLETED: 'tour_completed',
  
  // Cache keys
  CACHE_VERSION: 'cache_version',
  CACHE_TIMESTAMP: 'cache_timestamp'
} as const;

export type StorageKey = typeof LSKeys[keyof typeof LSKeys];

// Storage operation result type
interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Check if localStorage is available
function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

// Get item from localStorage with JSON parsing
export function getItem<T = any>(key: string, defaultValue?: T): T | null {
  if (!isLocalStorageAvailable()) {
    if (isDevelopment) {
      console.warn(`localStorage not available, returning default value for key: ${key}`);
    }
    return defaultValue ?? null;
  }

  try {
    const item = window.localStorage.getItem(key);
    
    if (item === null) {
      return defaultValue ?? null;
    }

    // Try to parse as JSON, fallback to string if parsing fails
    try {
      return JSON.parse(item);
    } catch {
      // If JSON parsing fails, return as string (for backward compatibility)
      return item as unknown as T;
    }
  } catch (error) {
    if (isDevelopment) {
      console.error(`Error getting item from localStorage:`, { key, error });
    }
    return defaultValue ?? null;
  }
}

// Set item in localStorage with JSON serialization
export function setItem<T = any>(key: string, value: T): StorageResult<T> {
  if (!isLocalStorageAvailable()) {
    const error = 'localStorage not available';
    if (isDevelopment) {
      console.warn(`${error}, cannot set key: ${key}`);
    }
    return { success: false, error };
  }

  try {
    let serializedValue: string;
    
    if (typeof value === 'string') {
      serializedValue = value;
    } else if (value === null || value === undefined) {
      serializedValue = JSON.stringify(value);
    } else {
      serializedValue = JSON.stringify(value);
    }

    window.localStorage.setItem(key, serializedValue);
    
    if (isDevelopment) {
      console.debug(`Storage set:`, { key, value });
    }
    
    return { success: true, data: value };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown storage error';
    
    if (isDevelopment) {
      console.error(`Error setting item in localStorage:`, { key, value, error });
    }
    
    return { success: false, error: errorMessage };
  }
}

// Remove item from localStorage
export function removeItem(key: string): StorageResult<null> {
  if (!isLocalStorageAvailable()) {
    const error = 'localStorage not available';
    if (isDevelopment) {
      console.warn(`${error}, cannot remove key: ${key}`);
    }
    return { success: false, error };
  }

  try {
    window.localStorage.removeItem(key);
    
    if (isDevelopment) {
      console.debug(`Storage removed:`, { key });
    }
    
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown storage error';
    
    if (isDevelopment) {
      console.error(`Error removing item from localStorage:`, { key, error });
    }
    
    return { success: false, error: errorMessage };
  }
}

// Clear all localStorage data
export function clearAll(): StorageResult<null> {
  if (!isLocalStorageAvailable()) {
    const error = 'localStorage not available';
    if (isDevelopment) {
      console.warn(error);
    }
    return { success: false, error };
  }

  try {
    window.localStorage.clear();
    
    if (isDevelopment) {
      console.debug('All localStorage data cleared');
    }
    
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown storage error';
    
    if (isDevelopment) {
      console.error(`Error clearing localStorage:`, error);
    }
    
    return { success: false, error: errorMessage };
  }
}

// Get multiple items at once
export function getItems<T extends Record<string, any>>(keys: string[]): Partial<T> {
  const result: Partial<T> = {};
  
  keys.forEach(key => {
    const value = getItem(key);
    if (value !== null) {
      result[key as keyof T] = value;
    }
  });
  
  return result;
}

// Set multiple items at once
export function setItems<T extends Record<string, any>>(items: T): StorageResult<T> {
  const results: Array<StorageResult<any>> = [];
  
  Object.entries(items).forEach(([key, value]) => {
    const result = setItem(key, value);
    results.push(result);
  });
  
  const failed = results.filter(r => !r.success);
  
  if (failed.length > 0) {
    return {
      success: false,
      error: `Failed to set ${failed.length} items`
    };
  }
  
  return { success: true, data: items };
}

// Check if a key exists in localStorage
export function hasItem(key: string): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }
  
  try {
    return window.localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

// Get storage size information
export function getStorageInfo(): {
  used: number;
  available: boolean;
  keyCount: number;
} {
  if (!isLocalStorageAvailable()) {
    return { used: 0, available: false, keyCount: 0 };
  }
  
  try {
    let used = 0;
    const keyCount = window.localStorage.length;
    
    for (let i = 0; i < keyCount; i++) {
      const key = window.localStorage.key(i);
      if (key) {
        const value = window.localStorage.getItem(key);
        if (value) {
          used += key.length + value.length;
        }
      }
    }
    
    return {
      used,
      available: true,
      keyCount
    };
  } catch {
    return { used: 0, available: false, keyCount: 0 };
  }
}

// Utility to migrate old storage keys to new ones
export function migrateStorageKey(oldKey: string, newKey: string): boolean {
  const value = getItem(oldKey);
  if (value !== null) {
    const setResult = setItem(newKey, value);
    if (setResult.success) {
      removeItem(oldKey);
      
      if (isDevelopment) {
        console.info(`Migrated storage key: ${oldKey} -> ${newKey}`);
      }
      
      return true;
    }
  }
  return false;
}

// Type-safe helpers for common storage patterns
export const storage = {
  // Auth helpers
  getAuthToken: (): string | null => getItem(LSKeys.AUTH_TOKEN),
  setAuthToken: (token: string) => setItem(LSKeys.AUTH_TOKEN, token),
  clearAuthToken: () => removeItem(LSKeys.AUTH_TOKEN),
  
  getAuthUser: (): any | null => getItem(LSKeys.AUTH_USER),
  setAuthUser: (user: any) => setItem(LSKeys.AUTH_USER, user),
  clearAuthUser: () => removeItem(LSKeys.AUTH_USER),
  
  // Theme helpers  
  getTheme: (): string | null => getItem(LSKeys.THEME, 'light'),
  setTheme: (theme: string) => setItem(LSKeys.THEME, theme),
  
  // Language helpers
  getLanguage: (): string | null => getItem(LSKeys.LANGUAGE, 'en'),
  setLanguage: (language: string) => setItem(LSKeys.LANGUAGE, language),
  
  // UI state helpers
  getSidebarCollapsed: (): boolean => getItem(LSKeys.SIDEBAR_COLLAPSED, false),
  setSidebarCollapsed: (collapsed: boolean) => setItem(LSKeys.SIDEBAR_COLLAPSED, collapsed),
  
  // Draft messages
  getDraftMessage: (channelId: string): string | null => {
    const drafts = getItem(LSKeys.DRAFT_MESSAGES, {});
    return drafts?.[channelId] || null;
  },
  setDraftMessage: (channelId: string, text: string) => {
    const drafts = getItem(LSKeys.DRAFT_MESSAGES, {});
    drafts[channelId] = text;
    return setItem(LSKeys.DRAFT_MESSAGES, drafts);
  },
  clearDraftMessage: (channelId: string) => {
    const drafts = getItem(LSKeys.DRAFT_MESSAGES, {});
    delete drafts[channelId];
    return setItem(LSKeys.DRAFT_MESSAGES, drafts);
  }
};

// Export types
export type { StorageResult };
