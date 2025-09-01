import React from 'react'
import { defaultEventBus } from '@/core/events'

// Hook point types - lifecycle events where extensions can be plugged in
export type HookPoint = 
  | 'beforeApiRequest' 
  | 'afterApiResponse' 
  | 'onLogin' 
  | 'onLogout' 
  | 'onRouteChange' 
  | 'onError'
  | 'onMount'
  | 'onUnmount'

// Base context for all hooks
export interface HookContext {
  timestamp: string
  source?: string
  meta?: Record<string, any>
}

// Specialized context types for specific hook points
export interface BeforeRequestContext {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers: Record<string, string>
  body?: any
}

export interface AfterResponseContext {
  url: string
  status: number
  response?: any
  elapsedMs?: number
  error?: any
}

// Hook function signatures
export type BeforeRequestHook = (ctx: HookContext & { req: BeforeRequestContext }) => void | Promise<void>
export type AfterResponseHook = (ctx: HookContext & { res: AfterResponseContext }) => void | Promise<void>
export type AuthHook = (ctx: HookContext & { user: import('@/core/contracts').User }) => void | Promise<void>
export type RouteChangeHook = (ctx: HookContext & { from?: string; to: string }) => void | Promise<void>
export type ErrorHook = (ctx: HookContext & { error: Error | string; context?: any }) => void | Promise<void>

// Generic hook function type
export type HookFn = (ctx: HookContext & { [key: string]: any }) => any

// Registry options
export interface HookRegistryOptions {
  parallel?: boolean // Run hooks in parallel vs series (default: false)
  continueOnError?: boolean // Continue running hooks if one fails (default: true)
}

/**
 * Type-safe registry for pluggable hooks/extensions
 */
export class HookRegistry {
  private registry = new Map<HookPoint, Set<HookFn>>()
  private options: HookRegistryOptions

  constructor(options: HookRegistryOptions = {}) {
    this.options = {
      parallel: false,
      continueOnError: true,
      ...options
    }
  }

  /**
   * Register a hook function for a specific point
   * @param point - The hook point to register for
   * @param fn - The hook function to register
   * @returns Unregister function
   */
  register(point: HookPoint, fn: HookFn): () => void {
    if (!this.registry.has(point)) {
      this.registry.set(point, new Set())
    }

    const hookSet = this.registry.get(point)!
    hookSet.add(fn)

    // Return unregister function
    return () => {
      hookSet.delete(fn)
      
      // Clean up empty sets
      if (hookSet.size === 0) {
        this.registry.delete(point)
      }
    }
  }

  /**
   * Run all registered hooks for a point
   * @param point - The hook point to run
   * @param payload - The payload to pass to hooks
   * @param baseContext - Base context to merge with payload
   * @param options - Override registry options for this run
   */
  async run(
    point: HookPoint, 
    payload: any = {}, 
    baseContext?: Partial<HookContext>,
    options?: Partial<HookRegistryOptions>
  ): Promise<void> {
    const hookSet = this.registry.get(point)
    
    if (!hookSet || hookSet.size === 0) {
      return
    }

    const runOptions = { ...this.options, ...options }

    // Build context
    const context: HookContext = {
      timestamp: new Date().toISOString(),
      source: 'hook-registry',
      ...baseContext
    }

    const fullPayload = { ...context, ...payload }
    const hooks = Array.from(hookSet)

    if (runOptions.parallel) {
      // Run hooks in parallel
      const results = await Promise.allSettled(
        hooks.map(hook => this.runSingleHook(hook, fullPayload, point))
      )

      // Handle failures if needed
      if (!runOptions.continueOnError) {
        const failures = results.filter(r => r.status === 'rejected') as PromiseRejectedResult[]
        if (failures.length > 0) {
          throw new Error(`Hook execution failed: ${failures[0].reason}`)
        }
      }
    } else {
      // Run hooks in series
      for (const hook of hooks) {
        try {
          await this.runSingleHook(hook, fullPayload, point)
        } catch (error) {
          if (!runOptions.continueOnError) {
            throw error
          }
          
          // Log error but continue
          console.warn(`Hook failed at point '${point}':`, error)
          
          // Emit error event if not already handling an error
          if (point !== 'onError') {
            defaultEventBus.emit('error.reported', { 
              error: error as Error, 
              context: { hookPoint: point, payload: fullPayload }
            }).catch(() => {
              // Silently ignore error reporting failures
            })
          }
        }
      }
    }
  }

  /**
   * Run a single hook with error handling
   */
  private async runSingleHook(hook: HookFn, payload: any, point: HookPoint): Promise<void> {
    try {
      const result = hook(payload)
      
      // If hook returns a promise, await it
      if (result && typeof result.then === 'function') {
        await result
      }
    } catch (error) {
      // Re-throw to be handled by caller
      throw error
    }
  }

  /**
   * List all hooks for a point (or all hooks if no point specified)
   * @param point - Optional hook point to filter by
   * @returns Array of hook functions
   */
  list(point?: HookPoint): HookFn[] {
    if (point) {
      const hookSet = this.registry.get(point)
      return hookSet ? Array.from(hookSet) : []
    }

    // Return all hooks
    const allHooks: HookFn[] = []
    for (const hookSet of this.registry.values()) {
      allHooks.push(...Array.from(hookSet))
    }
    return allHooks
  }

  /**
   * Get all registered hook points
   */
  getPoints(): HookPoint[] {
    return Array.from(this.registry.keys())
  }

  /**
   * Get the count of hooks for a point
   */
  getCount(point: HookPoint): number {
    return this.registry.get(point)?.size || 0
  }

  /**
   * Clear all hooks (useful for testing)
   */
  clear(): void {
    this.registry.clear()
  }

  /**
   * Clear hooks for a specific point
   */
  clearPoint(point: HookPoint): void {
    this.registry.delete(point)
  }
}

// Default hook registry instance
export const hooks = new HookRegistry({
  parallel: false,
  continueOnError: true
})

/**
 * Register a hook function for a specific point
 * @param point - The hook point to register for
 * @param fn - The hook function to register
 * @returns Unregister function
 */
export function registerHook(point: HookPoint, fn: HookFn): () => void {
  return hooks.register(point, fn)
}

/**
 * Get all hooks for a specific point
 * @param point - The hook point to get hooks for
 * @returns Array of hook functions
 */
export function getHook(point: HookPoint): HookFn[] {
  return hooks.list(point)
}

/**
 * React hook for registering kernel hooks with automatic cleanup
 * @param point - The hook point to register for
 * @param fn - The hook function to register
 * @param deps - Optional dependency array for re-registration
 */
export function useKernelHook(
  point: HookPoint, 
  fn: HookFn, 
  deps: React.DependencyList = []
): void {
  React.useEffect(() => {
    const unregister = hooks.register(point, fn)
    return unregister
  }, [point, ...deps])
}

// Helper functions for common hook patterns

/**
 * Register a before API request hook
 */
export function registerBeforeRequest(hook: BeforeRequestHook): () => void {
  return registerHook('beforeApiRequest', hook as HookFn)
}

/**
 * Register an after API response hook
 */
export function registerAfterResponse(hook: AfterResponseHook): () => void {
  return registerHook('afterApiResponse', hook as HookFn)
}

/**
 * Register an auth lifecycle hook
 */
export function registerAuthHook(point: 'onLogin' | 'onLogout', hook: AuthHook): () => void {
  return registerHook(point, hook as HookFn)
}

/**
 * Register a route change hook
 */
export function registerRouteChange(hook: RouteChangeHook): () => void {
  return registerHook('onRouteChange', hook as HookFn)
}

/**
 * Register an error handling hook
 */
export function registerErrorHandler(hook: ErrorHook): () => void {
  return registerHook('onError', hook as HookFn)
}

// Utility hooks for common patterns

/**
 * Hook that automatically registers/unregisters on component mount/unmount
 */
export function useAutoRegisterHooks(
  registrations: Array<{ point: HookPoint; hook: HookFn }>
): void {
  React.useEffect(() => {
    const unregisterFns = registrations.map(({ point, hook }) => 
      hooks.register(point, hook)
    )

    return () => {
      unregisterFns.forEach(fn => fn())
    }
  }, [registrations])
}

/**
 * Hook for running hooks imperatively from components
 */
export function useHookRunner() {
  return {
    run: (point: HookPoint, payload?: any, context?: Partial<HookContext>) => 
      hooks.run(point, payload, context),
    
    runSync: (point: HookPoint, payload?: any, context?: Partial<HookContext>) => {
      // Fire and forget - don't await
      hooks.run(point, payload, context).catch(error => {
        console.warn(`Hook execution failed for '${point}':`, error)
      })
    }
  }
}

// Development helpers (only available in dev builds)
if (process.env.NODE_ENV === 'development') {
  // Expose hooks registry on window for debugging
  if (typeof window !== 'undefined') {
    ;(window as any).__DIPEO_HOOKS__ = {
      registry: hooks,
      registerHook,
      getHook,
      HookRegistry
    }
  }
}
