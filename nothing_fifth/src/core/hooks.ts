// filepath: src/core/hooks.ts

import { eventBus } from '@/core/events';
import { container } from '@/core/di';
import { config } from '@/app/config';
import { debugLog, errorLog } from '@/core/utils';

// ============================================================================
// HOOK POINT DEFINITIONS
// ============================================================================

export type HookPoint =
  | 'beforeApiRequest' // payload: { url: string; options: RequestInit; meta?: Record<string, any> }
  | 'afterApiResponse'  // payload: { url: string; response: Response | { status: number, body?: any }; meta?: Record<string, any> }
  | 'onLogin'           // payload: { user: import('@/core/contracts').User }
  | 'onLogout'          // payload: { userId?: string }
  | 'onRouteChange'     // payload: { from?: string; to: string }
  | 'onError'           // payload: { error: unknown; context?: any }
  | 'app:init'          // payload: { config: any }
  | 'app:cleanup';      // payload: { config: any }

// ============================================================================
// HOOK CONTEXT & HANDLER TYPES
// ============================================================================

export interface HookContext {
  container: typeof container;
  bus: typeof eventBus;
  config: typeof config;
  meta?: Record<string, any>;
}

export type HookHandler<TPayload = any> = (
  payload: TPayload,
  ctx: HookContext
) => void | Promise<void>;

interface RegisteredHook<TPayload = any> {
  handler: HookHandler<TPayload>;
  priority: number;
}

// ============================================================================
// HOOK REGISTRY IMPLEMENTATION
// ============================================================================

export class HookRegistry {
  private readonly hooks = new Map<HookPoint, RegisteredHook[]>();

  /**
   * Register a hook handler for a specific hook point
   * @param name - Hook point name
   * @param handler - Handler function
   * @param options - Registration options
   * @returns Unregister function
   */
  register<T extends HookPoint>(
    name: T,
    handler: HookHandler,
    options: { priority?: number } = {}
  ): () => void {
    const { priority = 50 } = options;
    
    if (!this.hooks.has(name)) {
      this.hooks.set(name, []);
    }

    const registeredHook: RegisteredHook = { handler, priority };
    const hookList = this.hooks.get(name)!;
    
    hookList.push(registeredHook);
    
    // Sort by priority (lower number = earlier execution)
    hookList.sort((a, b) => a.priority - b.priority);

    debugLog(`HookRegistry: Registered handler for '${name}' with priority ${priority}`);

    // Return unregister function
    return () => {
      this.unregister(name, handler);
    };
  }

  /**
   * Unregister a specific handler from a hook point
   * @param name - Hook point name
   * @param handler - Handler function to remove
   */
  private unregister<T extends HookPoint>(name: T, handler: HookHandler): void {
    const hookList = this.hooks.get(name);
    if (!hookList) return;

    const index = hookList.findIndex(h => h.handler === handler);
    if (index !== -1) {
      hookList.splice(index, 1);
      debugLog(`HookRegistry: Unregistered handler for '${name}'`);
      
      // Clean up empty arrays
      if (hookList.length === 0) {
        this.hooks.delete(name);
      }
    }
  }

  /**
   * Invoke all handlers for a specific hook point
   * @param name - Hook point name
   * @param payload - Data to pass to handlers
   * @param ctx - Partial hook context (will be merged with defaults)
   * @returns Promise if any handler is async, void otherwise
   */
  invoke<T extends HookPoint>(
    name: T,
    payload: any,
    ctx: Partial<HookContext> = {}
  ): Promise<void> | void {
    const hookList = this.hooks.get(name);
    
    if (!hookList || hookList.length === 0) {
      debugLog(`HookRegistry: No handlers for '${name}'`);
      return;
    }

    // Create full context by merging provided context with defaults
    const fullContext: HookContext = {
      container,
      bus: eventBus,
      config,
      meta: {},
      ...ctx
    };

    debugLog(`HookRegistry: Invoking '${name}' with ${hookList.length} handlers`);

    const results: (void | Promise<void>)[] = [];
    let hasAsyncHandlers = false;

    // Execute all handlers in priority order
    for (const { handler } of hookList) {
      try {
        const result = handler(payload, fullContext);
        
        if (result && typeof result.then === 'function') {
          hasAsyncHandlers = true;
          // Wrap async handler to catch errors and forward to onError hook
          results.push(
            result.catch((error) => {
              this.handleHookError(error, name, payload, fullContext);
            })
          );
        } else {
          results.push(result);
        }
      } catch (error) {
        // Handle sync errors
        this.handleHookError(error, name, payload, fullContext);
      }
    }

    // If any handler is async, return a Promise that resolves when all complete
    if (hasAsyncHandlers) {
      return Promise.all(results.filter(r => r && typeof r.then === 'function') as Promise<void>[])
        .then(() => void 0)
        .catch((error) => {
          errorLog(`HookRegistry: Error in Promise.all for '${name}'`, error);
        });
    }

    return void 0;
  }

  /**
   * Handle errors that occur during hook execution
   * @param error - The error that occurred
   * @param hookName - Name of the hook that failed
   * @param payload - Original payload
   * @param context - Hook context
   */
  private handleHookError(
    error: unknown,
    hookName: HookPoint,
    payload: any,
    context: HookContext
  ): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    errorLog(`HookRegistry: Error in '${hookName}' handler`, errorObj);

    // Don't invoke onError hook if we're already handling an onError to prevent infinite loops
    if (hookName !== 'onError') {
      try {
        // Invoke onError hook for this error
        this.invoke('onError', {
          error: errorObj,
          context: {
            hookName,
            originalPayload: payload,
            hookContext: context
          }
        });
      } catch (onErrorHookError) {
        // If onError hook itself fails, just log it
        errorLog('HookRegistry: onError hook failed', onErrorHookError instanceof Error ? onErrorHookError : new Error(String(onErrorHookError)));
      }
    }
  }

  /**
   * Get the number of handlers for a hook point
   */
  getHandlerCount(name: HookPoint): number {
    const hookList = this.hooks.get(name);
    return hookList ? hookList.length : 0;
  }

  /**
   * Get all registered hook points
   */
  getRegisteredHooks(): HookPoint[] {
    return Array.from(this.hooks.keys());
  }

  /**
   * Clear all handlers for a hook point, or all handlers if no hook specified
   */
  clear(name?: HookPoint): void {
    if (name) {
      this.hooks.delete(name);
      debugLog(`HookRegistry: Cleared all handlers for '${name}'`);
    } else {
      this.hooks.clear();
      debugLog('HookRegistry: Cleared all handlers');
    }
  }

  /**
   * Get debug information about the hook registry
   */
  getDebugInfo(): {
    totalHooks: number;
    totalHandlers: number;
    hooks: Record<string, number>;
  } {
    const hooks: Record<string, number> = {};
    let totalHandlers = 0;

    for (const [hookName, handlers] of this.hooks.entries()) {
      hooks[hookName] = handlers.length;
      totalHandlers += handlers.length;
    }

    return {
      totalHooks: this.hooks.size,
      totalHandlers,
      hooks
    };
  }
}

// ============================================================================
// SINGLETON REGISTRY & CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Default global hook registry instance
 */
export const hooks = new HookRegistry();

/**
 * Register a hook handler (convenience function using default registry)
 * @param name - Hook point name
 * @param handler - Handler function
 * @param options - Registration options
 * @returns Unregister function
 */
export function registerHook<T extends HookPoint>(
  name: T,
  handler: HookHandler,
  options?: { priority?: number }
): () => void {
  return hooks.register(name, handler, options);
}

/**
 * Invoke all handlers for a hook point (convenience function using default registry)
 * @param name - Hook point name
 * @param payload - Data to pass to handlers
 * @param ctx - Partial hook context
 * @returns Promise if any handler is async, void otherwise
 */
export function invokeHook<T extends HookPoint>(
  name: T,
  payload: any,
  ctx?: Partial<HookContext>
): Promise<void> | void {
  return hooks.invoke(name, payload, ctx);
}

/**
 * Get the number of handlers for a hook point
 */
export function getHookHandlerCount(name: HookPoint): number {
  return hooks.getHandlerCount(name);
}

/**
 * Clear all handlers for a hook point, or all handlers if no hook specified
 */
export function clearHooks(name?: HookPoint): void {
  hooks.clear(name);
}

/**
 * Get debug information about hooks
 */
export function getHookDebugInfo() {
  return hooks.getDebugInfo();
}

// ============================================================================
// DEVELOPMENT HELPERS
// ============================================================================

if (import.meta.env.MODE === 'development') {
  // Expose hook registry debugging on window object in development
  (globalThis as any).__hook_registry_debug = {
    registry: hooks,
    getDebugInfo: getHookDebugInfo,
    getRegisteredHooks: () => hooks.getRegisteredHooks(),
    getHandlerCount: getHookHandlerCount,
    clear: clearHooks,
    registerHook,
    invokeHook
  };

  // Log hook registry initialization
  debugLog('Hook registry initialized with debug helpers');
}

// Default export for convenience
export default hooks;

// ============================================================================
// Self-Check Comments
// ============================================================================
// [x] Uses `@/` imports only - Imports from @/core/events, @/core/di, @/app/config, @/core/utils
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Pure hook registry logic
// [x] Reads config from `@/app/config` - Uses config in HookContext
// [x] Exports default named component - Exports hooks as default and multiple named exports
// [x] Adds basic ARIA and keyboard handlers (where relevant) - N/A for hook registry
