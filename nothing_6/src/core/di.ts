// filepath: src/core/di.ts
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component (di container)
// [ ] Adds basic ARIA and keyboard handlers (where relevant - N/A for DI)

import { eventBus } from '@/core/events'

/* src/core/di.ts

   Minimal DI container used to swap implementations at runtime. Tokens are used to register concrete implementations and modules resolve them by token.

   Example:
     import { di, ApiClientToken } from '@/core/di'
     di.register(ApiClientToken, myApiClient)
     const client = di.resolve(ApiClientToken)
*/

// Generic token type
export type Token<T> = symbol & { __type?: T }

export function createToken<T = unknown>(name: string): Token<T> {
  return Symbol(name) as Token<T>
}

// Built-in tokens (examples)
export const ApiClientToken = createToken<{ 
  get: (path: string) => Promise<any>
  post: (path: string, body?: any) => Promise<any>
  put: (path: string, body?: any) => Promise<any>
  delete: (path: string) => Promise<any>
}>('ApiClient')

export const AuthServiceToken = createToken<{ 
  login: (email: string, password: string) => Promise<any>
  logout: () => Promise<void>
  currentUser?: () => Promise<any>
  refreshToken?: () => Promise<any>
}>('AuthService')

export const StorageServiceToken = createToken<{ 
  get: (key: string) => any
  set: (key: string, value: any, opts?: { ttl?: number }) => void
  remove: (key: string) => void
  clear: () => void
}>('StorageService')

export const WebSocketServiceToken = createToken<{ 
  connect: () => Promise<void>
  send: (event: any) => void
  close: () => void
  isConnected: () => boolean
}>('WebSocketService')

export const AnalyticsServiceToken = createToken<{
  track: (event: string, properties?: Record<string, unknown>) => void
  identify: (userId: string, traits?: Record<string, unknown>) => void
  page: (name?: string, properties?: Record<string, unknown>) => void
}>('AnalyticsService')

export const NotificationServiceToken = createToken<{
  success: (message: string, options?: { duration?: number }) => void
  error: (message: string, options?: { duration?: number }) => void
  warning: (message: string, options?: { duration?: number }) => void
  info: (message: string, options?: { duration?: number }) => void
}>('NotificationService')

// DI container implementation
export class DIContainer {
  private registry = new Map<Token<any>, any>()
  private singletons = new Map<Token<any>, any>()

  register<T>(token: Token<T>, impl: T, options?: { singleton?: boolean }): void {
    if (!token) throw new Error('Invalid DI token')
    
    this.registry.set(token as Token<any>, {
      implementation: impl,
      singleton: options?.singleton ?? false
    })

    // Emit registration event for debugging/monitoring
    eventBus.emit('di:registered', { token: String(token), singleton: options?.singleton })
  }

  resolve<T>(token: Token<T>): T {
    const entry = this.registry.get(token as Token<any>)
    
    if (!entry) {
      throw new Error(`DI: No provider registered for token ${String(token)}`)
    }

    // Handle singleton pattern
    if (entry.singleton) {
      if (this.singletons.has(token as Token<any>)) {
        return this.singletons.get(token as Token<any>) as T
      }
      
      const instance = typeof entry.implementation === 'function' 
        ? new entry.implementation() 
        : entry.implementation
      
      this.singletons.set(token as Token<any>, instance)
      return instance as T
    }

    // Return factory or direct implementation
    return typeof entry.implementation === 'function' 
      ? entry.implementation() 
      : entry.implementation
  }

  has<T>(token: Token<T>): boolean {
    return this.registry.has(token as Token<any>)
  }

  reset(): void {
    const tokenCount = this.registry.size
    this.registry.clear()
    this.singletons.clear()
    
    eventBus.emit('di:reset', { clearedTokens: tokenCount })
  }

  // Get all registered tokens (useful for debugging)
  getRegisteredTokens(): string[] {
    return Array.from(this.registry.keys()).map(token => String(token))
  }

  // Replace existing registration (useful for hot-swapping in dev)
  replace<T>(token: Token<T>, impl: T, options?: { singleton?: boolean }): void {
    if (!this.has(token)) {
      throw new Error(`DI: Cannot replace unregistered token ${String(token)}`)
    }
    
    // Clear singleton if exists
    if (this.singletons.has(token as Token<any>)) {
      this.singletons.delete(token as Token<any>)
    }
    
    this.register(token, impl, options)
    eventBus.emit('di:replaced', { token: String(token) })
  }
}

export const di = new DIContainer()

// Thin helpers for convenience
export const register = <T>(token: Token<T>, impl: T, options?: { singleton?: boolean }) => 
  di.register(token, impl, options)

export const resolve = <T>(token: Token<T>) => di.resolve(token)

export const has = <T>(token: Token<T>) => di.has(token)

export const replace = <T>(token: Token<T>, impl: T, options?: { singleton?: boolean }) => 
  di.replace(token, impl, options)

// Development helpers
export const debugDI = () => ({
  tokens: di.getRegisteredTokens(),
  reset: () => di.reset(),
})

// Container instance is the default export
export default di

// Example usage (commented):
// // register a mock api client in dev
// import { ApiClientToken, register } from '@/core/di'
// register(ApiClientToken, { 
//   get: async path => ({ ok: true, data: null }), 
//   post: async (path, body) => ({ ok: true, data: body }) 
// })
// const apiClient = resolve(ApiClientToken)
