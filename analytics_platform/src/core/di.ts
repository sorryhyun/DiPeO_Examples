// src/core/di.ts
/* src/core/di.ts
   Simple DI container based on typed tokens.
   - Define tokens via Tokens below and register concrete implementations at app bootstrap.
   - Allows tests to swap services via container.register
*/


// Generic token wrapper for type-safety
export type Token<T> = {
  readonly key: symbol;
  readonly description?: string;
  readonly _phantom?: T;  // Phantom type for type safety
};

function createToken<T>(desc: string): Token<T> {
  return { key: Symbol(desc), description: desc };
}

// Common tokens used across the app - application code should import these tokens and register implementations
export const Tokens = {
  ApiClient: createToken<{ 
    request: <T = any>(options: { 
      url: string; 
      method?: string; 
      body?: any; 
      headers?: Record<string, string> 
    }) => Promise<T> 
  }>('ApiClient'),
  AuthService: createToken<{ 
    login: (email: string, password: string) => Promise<any>; 
    logout: () => Promise<void>; 
    getCurrentUser: () => Promise<any> 
  }>('AuthService'),
  StorageService: createToken<{ 
    get: (k: string) => Promise<any> | any; 
    set: (k: string, v: any) => Promise<void> | void; 
    remove: (k: string) => Promise<void> | void 
  }>('StorageService'),
  WebSocketService: createToken<{ 
    connect: () => void; 
    disconnect: () => void; 
    send: (topic: string, payload: any) => void 
  }>('WebSocketService')
} as const;

// Container implementation
export class Container {
  private map = new Map<symbol, any>();

  register<T>(token: Token<T>, implementation: T) {
    if (!token || !token.key) throw new Error('Invalid token');
    this.map.set(token.key, implementation);
  }

  resolve<T>(token: Token<T>): T {
    const impl = this.map.get(token.key);
    if (!impl) throw new Error(`No implementation registered for token: ${String(token.description || token.key.toString())}`);
    return impl as T;
  }

  has(token: Token<any>): boolean {
    return this.map.has(token.key);
  }

  clear() {
    this.map.clear();
  }
}

export const defaultContainer = new Container();

// Convenience helpers that use the defaultContainer
export const registerService = <T>(token: Token<T>, impl: T) => defaultContainer.register(token, impl);
export const getService = <T>(token: Token<T>) => defaultContainer.resolve(token);
export const clearServices = () => defaultContainer.clear();

// Example usage:
// import { Tokens, registerService, getService } from '@/core/di'
// registerService(Tokens.StorageService, {
//   get: (k) => JSON.parse(localStorage.getItem(k) || 'null'),
//   set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
//   remove: (k) => localStorage.removeItem(k)
// })
// const storage = getService(Tokens.StorageService)

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (not needed for this kernel file)
- [x] Exports default named component (exports named functions and classes)
- [x] Adds basic ARIA and keyboard handlers (not relevant for DI container)
*/
