// filepath: src/core/di.ts

import { debugLog } from '@/core/utils';
import { config } from '@/app/config';

// ============================================================================
// DI TOKEN SYSTEM
// ============================================================================

export interface Token<T> {
  readonly key: symbol;
  readonly name?: string;
}

export function createToken<T>(name?: string): Token<T> {
  return {
    key: Symbol(name || 'unnamed-token'),
    name
  };
}

// ============================================================================
// PREDEFINED SERVICE TOKENS
// ============================================================================

export const ApiClientToken = createToken<{
  fetchJson: <T>(path: string, opts?: RequestInit) => Promise<T>;
  fetchBlob: (path: string, opts?: RequestInit) => Promise<Blob>;
  post: <T>(path: string, data?: unknown, opts?: RequestInit) => Promise<T>;
  put: <T>(path: string, data?: unknown, opts?: RequestInit) => Promise<T>;
  delete: <T>(path: string, opts?: RequestInit) => Promise<T>;
}>('ApiClient');

export const AuthServiceToken = createToken<{
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<any>;
  getCurrentUser: () => Promise<any>;
  isAuthenticated: () => boolean;
}>('AuthService');

export const StorageServiceToken = createToken<{
  getItem: (key: string) => any;
  setItem: (key: string, value: any) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}>('StorageService');

export const WebSocketServiceToken = createToken<{
  connect: (url?: string) => void;
  disconnect: () => void;
  subscribe: (eventType: string, handler: (data: any) => void) => () => void;
  send: (eventType: string, data: any) => void;
  isConnected: () => boolean;
}>('WebSocketService');

export const NotificationServiceToken = createToken<{
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  showNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  clearAll: () => void;
}>('NotificationService');

// ============================================================================
// CONTAINER IMPLEMENTATION
// ============================================================================

type Provider<T> = T | (() => T);

class Container {
  private readonly registry = new Map<symbol, { provider: Provider<any>; instance?: any; }>();

  register<T>(token: Token<T>, provider: Provider<T>): void {
    const tokenKey = token.key;
    
    if (this.registry.has(tokenKey) && config.isDevelopment) {
      debugLog(`DI: Overriding existing registration for token: ${token.name || tokenKey.toString()}`);
    }

    this.registry.set(tokenKey, { provider });
  }

  resolve<T>(token: Token<T>): T {
    const registration = this.registry.get(token.key);
    
    if (!registration) {
      throw new Error(
        `DI: Token not registered: ${token.name || token.key.toString()}. ` +
        `Make sure to register this token before resolving it.`
      );
    }

    // Return cached instance if it exists
    if (registration.instance !== undefined) {
      return registration.instance;
    }

    // Resolve the provider
    const { provider } = registration;
    const instance = typeof provider === 'function' ? (provider as () => T)() : provider;
    
    // Cache the instance for singleton behavior
    registration.instance = instance;
    
    return instance;
  }

  has<T>(token: Token<T>): boolean {
    return this.registry.has(token.key);
  }

  clear(): void {
    this.registry.clear();
  }

  // Get list of registered tokens (useful for debugging)
  getRegisteredTokens(): string[] {
    return Array.from(this.registry.keys()).map(key => {
      // Find the token name by looking through all known tokens
      const knownTokens = [
        ApiClientToken,
        AuthServiceToken,
        StorageServiceToken,
        WebSocketServiceToken,
        NotificationServiceToken
      ];
      
      const matchingToken = knownTokens.find(token => token.key === key);
      return matchingToken?.name || key.toString();
    });
  }
}

// ============================================================================
// SINGLETON CONTAINER & CONVENIENCE FUNCTIONS
// ============================================================================

export const container = new Container();

/**
 * Register a service implementation with the DI container
 */
export function register<T>(token: Token<T>, provider: Provider<T>): void {
  container.register(token, provider);
}

/**
 * Resolve a service from the DI container
 */
export function resolve<T>(token: Token<T>): T {
  return container.resolve(token);
}

/**
 * Check if a token is registered
 */
export function hasRegistration<T>(token: Token<T>): boolean {
  return container.has(token);
}

/**
 * Clear all registrations (useful for testing)
 */
export function clearContainer(): void {
  container.clear();
}

/**
 * Get debug info about registered services
 */
export function getContainerDebugInfo(): {
  registeredTokens: string[];
  totalRegistrations: number;
} {
  const registeredTokens = container.getRegisteredTokens();
  return {
    registeredTokens,
    totalRegistrations: registeredTokens.length
  };
}

// ============================================================================
// DEVELOPMENT HELPERS
// ============================================================================

if (config.isDevelopment) {
  // Expose container debugging on window object in development
  (globalThis as any).__di_container_debug = {
    container,
    getRegisteredTokens: () => container.getRegisteredTokens(),
    getDebugInfo: getContainerDebugInfo
  };
}

// Default export for convenience
export default container;

// ============================================================================
// Self-Check Comments
// ============================================================================
// [x] Uses `@/` imports only - Imports from @/core/utils and @/app/config
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Pure DI container logic
// [x] Reads config from `@/app/config` - Uses config.isDevelopment for dev features
// [x] Exports default named component - Exports container as default and named exports
// [x] Adds basic ARIA and keyboard handlers (where relevant) - N/A for DI container


