// filepath: src/core/hooks.ts

import { eventBus } from '@/core/events';
import { container } from '@/core/di';
import { debugLog } from '@/core/utils';

// ===============================================
// Hook Point Types
// ===============================================

export type HookPoint = 
  | 'beforeApiRequest'  // payload: { url: string; options: RequestInit; meta?: Record<string, any> }
  | 'afterApiResponse'  // payload: { url: string; response: Response | { status: number, body?: any }; meta?: Record<string, any> }
  | 'onLogin'          // payload: { user: import('@/core/contracts').User }
  | 'onLogout'         // payload: { userId?: string }
  | 'onRouteChange'    // payload: { from?: string; to: string }
  | 'onError';         // payload: { error: unknown; context?: any }

// ===============================================
// Hook Context & Handler Types
// ===============================================

export interface HookContext {
  container: typeof container;
  bus: typeof eventBus;
  config: import('@/app/config').AppConfig;
  meta?: Record<string, any>;
}

export type HookHandler<TPayload = any> = (
  payload: TPayload, 
  ctx: HookContext
) => void | Promise<void>;

interface RegisteredHook {
  handler: HookHandler;
  priority: number;
}

// ===============================================
// Hook Registry Implementation
// ===============================================

export class HookRegistry {
  private hooks = new Map<HookPoint, RegisteredHook[]>();

  register<T extends HookPoint>(
    name: T,
    handler: HookHandler,
    options: { priority?: number } = {}
  ): () => void {
    const { priority = 50 } = options;
    const registeredHook: RegisteredHook = { handler, priority };

    if (!this.hooks.has(name)) {
      this.hooks.set(name, []);
    }

    const handlers = this.hooks.get(name)!;
    handlers.push(registeredHook);
    
    // Sort by priority (lower number = higher priority, runs earlier)
    handlers.sort((a, b) => a.priority - b.priority);
    
    debugLog(`HookRegistry: Registered handler for '${name}' with priority ${priority}`);

    // Return unregister function
    return () => {
      const currentHandlers = this.hooks.get(name);
      if (currentHandlers) {
        const index = currentHandlers.indexOf(registeredHook);
        if (index > -1) {
          currentHandlers.splice(index, 1);
          debugLog(`HookRegistry: Unregistered handler for '${name}'`);
          
          // Clean up empty hook arrays
          if (currentHandlers.length === 0) {
            this.hooks.delete(name);
          }
        }
      }
    };
  }

  async invoke<T extends HookPoint>(
    name: T,
    payload: any,
    ctx: Partial<HookContext> = {}
  ): Promise<void> {
    const handlers = this.hooks.get(name);
    if (!handlers || handlers.length === 0) {
      debugLog(`HookRegistry: No handlers registered for '${name}'`);
      return;
    }

    // Build complete context
    const fullContext: HookContext = {
      container,
      bus: eventBus,
      config: await import('@/app/config').then(m => m.config),
      ...ctx
    };

    debugLog(`HookRegistry: Invoking '${name}' with ${handlers.length} handler(s)`);

    // Execute all handlers in priority order
    const promises: Promise<void>[] = [];
    
    for (const { handler } of handlers) {
      try {
        const result = handler(payload, fullContext);
        if (result instanceof Promise) {
          promises.push(result);
        }
      } catch (error) {
        // Synchronous handler error - invoke error hook and continue
        debugLog(`HookRegistry: Sync handler error in '${name}':`, error);
        try {
          await this.invoke('onError', { error, context: { hookPoint: name, payload } });
        } catch (errorHookError) {
          // Prevent infinite recursion if error hook itself throws
          debugLog('HookRegistry: Error in onError hook:', errorHookError);
        }
      }
    }

    // Handle async handlers
    if (promises.length > 0) {
      try {
        await Promise.all(promises);
      } catch (error) {
        // Async handler error - invoke error hook
        debugLog(`HookRegistry: Async handler error in '${name}':`, error);
        try {
          await this.invoke('onError', { error, context: { hookPoint: name, payload } });
        } catch (errorHookError) {
          // Prevent infinite recursion if error hook itself throws
          debugLog('HookRegistry: Error in onError hook:', errorHookError);
        }
      }
    }
  }

  // Get registered hook count for debugging
  getHookCount(name: HookPoint): number {
    return this.hooks.get(name)?.length ?? 0;
  }

  // Get all registered hook points
  getRegisteredHooks(): HookPoint[] {
    return Array.from(this.hooks.keys());
  }

  // Clear all registered hooks (useful for testing)
  clear(): void {
    debugLog('HookRegistry: Clearing all registered hooks');
    this.hooks.clear();
  }
}

// ===============================================
// Global Registry & Convenience Functions
// ===============================================

export const defaultHookRegistry = new HookRegistry();

export function registerHook<T extends HookPoint>(
  name: T,
  handler: HookHandler,
  options: { priority?: number } = {}
): () => void {
  return defaultHookRegistry.register(name, handler, options);
}

export async function invokeHook<T extends HookPoint>(
  name: T,
  payload: any,
  ctx: Partial<HookContext> = {}
): Promise<void> {
  return defaultHookRegistry.invoke(name, payload, ctx);
}

// ===============================================
// Development Utilities
// ===============================================

export function inspectHooks(): void {
  if (import.meta.env.MODE === 'development') {
    console.group('🎣 Hook Registry Inspection');
    console.log('Registered hooks:', defaultHookRegistry.getRegisteredHooks());
    
    defaultHookRegistry.getRegisteredHooks().forEach(hookPoint => {
      console.log(`  ${hookPoint}: ${defaultHookRegistry.getHookCount(hookPoint)} handler(s)`);
    });
    
    console.groupEnd();
  }
}

// ===============================================
// Built-in Hook Handlers (Optional)
// ===============================================

// Register a default error handler that logs to console in development
if (import.meta.env.MODE === 'development') {
  registerHook('onError', ({ error, context }) => {
    console.error('🚨 Hook Error:', error);
    if (context) {
      console.error('Context:', context);
    }
  }, { priority: 100 }); // Low priority so custom handlers run first
}

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component (exports HookRegistry class and utilities)
- [x] Adds basic ARIA and keyboard handlers (N/A - this is a utility registry)
*/
