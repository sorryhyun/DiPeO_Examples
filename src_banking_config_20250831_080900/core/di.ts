// Type-safe token system
export type Token<T> = symbol & { __type?: T }

// Storage abstraction interface
export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

// Predefined tokens for common services
export const DI_TOKEN_API_CLIENT: Token<{ request: Function }> = Symbol('API_CLIENT') as any
export const DI_TOKEN_AUTH_SERVICE: Token<any> = Symbol('AUTH_SERVICE') as any
export const DI_TOKEN_STORAGE: Token<StorageLike> = Symbol('STORAGE') as any
export const DI_TOKEN_WEBSOCKET: Token<any> = Symbol('WEBSOCKET') as any

// Registration options
interface RegistrationOptions {
  singleton?: boolean
}

// Internal registry entry
interface RegistryEntry<T> {
  singleton: boolean
  factory: (container: Container) => T
  instance?: T
}

// Circular dependency detection
class CircularDependencyError extends Error {
  constructor(token: Token<any>) {
    super(`Circular dependency detected for token: ${token.toString()}`)
    this.name = 'CircularDependencyError'
  }
}

// Main container class
export class Container {
  private map = new Map<Token<any>, RegistryEntry<any>>()
  private resolving = new Set<Token<any>>()

  /**
   * Register a service or factory function
   */
  register<T>(
    token: Token<T>, 
    factoryOrValue: ((container: Container) => T) | T, 
    options: RegistrationOptions = {}
  ): void {
    const { singleton = false } = options

    // Normalize value to factory function
    const factory = typeof factoryOrValue === 'function'
      ? factoryOrValue as (container: Container) => T
      : () => factoryOrValue

    const entry: RegistryEntry<T> = {
      singleton,
      factory,
      instance: undefined
    }

    this.map.set(token, entry)
  }

  /**
   * Resolve a service by token
   */
  resolve<T>(token: Token<T>): T {
    const entry = this.map.get(token)
    
    if (!entry) {
      throw new Error(`No registration found for token: ${token.toString()}`)
    }

    // Check for circular dependencies
    if (this.resolving.has(token)) {
      throw new CircularDependencyError(token)
    }

    // Return cached singleton instance
    if (entry.singleton && entry.instance !== undefined) {
      return entry.instance
    }

    // Track resolution to detect circular dependencies
    this.resolving.add(token)

    try {
      // Create new instance
      const instance = entry.factory(this)

      // Cache singleton instances
      if (entry.singleton) {
        entry.instance = instance
      }

      return instance
    } finally {
      // Always clean up resolution tracking
      this.resolving.delete(token)
    }
  }

  /**
   * Check if a token is registered
   */
  has(token: Token<any>): boolean {
    return this.map.has(token)
  }

  /**
   * Clear all registrations (useful for tests)
   */
  clear(): void {
    this.map.clear()
    this.resolving.clear()
  }
}

// Default container instance
const defaultContainer = new Container()

/**
 * Register a service or factory function with the default container
 */
export function register<T>(
  token: Token<T>, 
  factoryOrValue: ((container: Container) => T) | T, 
  options?: RegistrationOptions
): void {
  return defaultContainer.register(token, factoryOrValue, options)
}

/**
 * Resolve a service by token from the default container
 */
export function resolve<T>(token: Token<T>): T {
  return defaultContainer.resolve(token)
}

/**
 * Check if a token is registered in the default container
 */
export function has(token: Token<any>): boolean {
  return defaultContainer.has(token)
}

/**
 * Clear all registrations from the default container
 */
export function clear(): void {
  return defaultContainer.clear()
}

/**
 * Get the default container instance
 */
export function getDefaultContainer(): Container {
  return defaultContainer
}

/**
 * Create a type-safe token
 */
export function createToken<T>(description: string): Token<T> {
  return Symbol(description) as Token<T>
}
