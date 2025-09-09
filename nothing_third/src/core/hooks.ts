// filepath: src/core/hooks.ts
import { eventBus } from '@/core/events';

export type HookPoint = 'beforeApiRequest' | 'afterApiResponse' | 'onLogin' | 'onLogout' | 'onRouteChange';

export interface HookContext {
  // Common fields that different hook points may use. Not all fields are required by all hooks but this shape keeps hooks adaptable.
  request?: { url: string; method: string; headers?: Record<string, string>; body?: any };
  response?: { status: number; body?: any };
  user?: { id: string };
  route?: { from?: string; to?: string };
  extra?: Record<string, any>;
}

export type HookHandler<T extends HookContext = HookContext> = (ctx: T) => void | Promise<void> | Partial<T>;

export interface HookRegistration {
  id: string; // stable id for unregistering
  point: HookPoint;
  handler: HookHandler;
  priority?: number; // higher executes earlier
  once?: boolean;
}

interface RegisteredHook {
  id: string;
  handler: HookHandler;
  priority: number;
  once: boolean;
}

export class HookRegistry {
  private hooks = new Map<HookPoint, RegisteredHook[]>();
  private counter = 0;

  register(point: HookPoint, handler: HookHandler, opts?: {
    priority?: number;
    once?: boolean;
    id?: string;
  }): HookRegistration {
    const priority = opts?.priority ?? 0;
    const once = opts?.once ?? false;
    const id = opts?.id ?? this.generateId();

    const registeredHook: RegisteredHook = {
      id,
      handler,
      priority,
      once
    };

    const pointHooks = this.hooks.get(point) || [];
    pointHooks.push(registeredHook);
    
    // Sort by priority (higher first)
    pointHooks.sort((a, b) => b.priority - a.priority);
    
    this.hooks.set(point, pointHooks);

    const registration: HookRegistration = {
      id,
      point,
      handler,
      priority,
      once
    };

    return registration;
  }

  unregister(id: string): boolean {
    for (const [point, hooks] of this.hooks.entries()) {
      const index = hooks.findIndex(hook => hook.id === id);
      if (index >= 0) {
        hooks.splice(index, 1);
        
        if (hooks.length === 0) {
          this.hooks.delete(point);
        }
        
        return true;
      }
    }
    return false;
  }

  async run<T extends HookContext>(point: HookPoint, ctx: T): Promise<T> {
    const pointHooks = this.hooks.get(point);
    
    if (!pointHooks || pointHooks.length === 0) {
      return ctx;
    }

    let finalContext = { ...ctx };
    const hooksToRemove: string[] = [];

    try {
      for (const hook of pointHooks) {
        try {
          const result = hook.handler(finalContext);
          
          let handlerResult: void | Partial<T>;
          if (result instanceof Promise) {
            handlerResult = await result;
          } else {
            handlerResult = result;
          }

          // Merge partial context updates
          if (handlerResult && typeof handlerResult === 'object') {
            finalContext = { ...finalContext, ...handlerResult };
          }

          // Mark for removal if it's a once-only hook
          if (hook.once) {
            hooksToRemove.push(hook.id);
          }
        } catch (error) {
          // Emit error to global event bus for logging
          eventBus.emit('error:global', {
            error: error instanceof Error ? error : new Error(String(error)),
            context: `Hook handler for point: ${point} (id: ${hook.id})`
          });
        }
      }

      // Remove once-only hooks
      hooksToRemove.forEach(id => this.unregister(id));

      return finalContext;
    } catch (error) {
      // This should not happen since we catch individual handler errors above
      eventBus.emit('error:global', {
        error: error instanceof Error ? error : new Error(String(error)),
        context: `HookRegistry.run for point: ${point}`
      });
      
      return finalContext;
    }
  }

  clear(point?: HookPoint): void {
    if (point) {
      this.hooks.delete(point);
    } else {
      this.hooks.clear();
    }
  }

  getHooks(point: HookPoint): ReadonlyArray<Omit<RegisteredHook, 'handler'>> {
    const pointHooks = this.hooks.get(point) || [];
    return pointHooks.map(({ handler, ...rest }) => rest);
  }

  hasHooks(point: HookPoint): boolean {
    const pointHooks = this.hooks.get(point);
    return Boolean(pointHooks && pointHooks.length > 0);
  }

  getHookCount(point: HookPoint): number {
    const pointHooks = this.hooks.get(point);
    return pointHooks ? pointHooks.length : 0;
  }

  getAllPoints(): HookPoint[] {
    return Array.from(this.hooks.keys());
  }

  private generateId(): string {
    const timestamp = Date.now();
    const count = ++this.counter;
    return `hook_${timestamp}_${count}`;
  }
}

// Global singleton instance
export const hookRegistry = new HookRegistry();

// Convenience function for registering hooks
export function registerHook(
  point: HookPoint, 
  handler: HookHandler, 
  opts?: { priority?: number; once?: boolean; id?: string }
): () => void {
  const registration = hookRegistry.register(point, handler, opts);
  
  // Return unregister function
  return () => hookRegistry.unregister(registration.id);
}

// React hook helper for component lifecycle hook registration
export function useHook(
  point: HookPoint,
  handler: HookHandler,
  deps?: React.DependencyList
): void {
  // This is a placeholder signature for the React hook
  // The actual implementation would be in a separate React-specific hook file
  // that imports this core implementation and wraps it with useEffect
  throw new Error('useHook must be implemented in a React-specific hook module');
}

// Type exports for convenience
export type { HookPoint, HookContext, HookHandler, HookRegistration };

// Alias for backwards compatibility
export const hooks = hookRegistry;

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/core/events)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - pure hook registry system
- [x] Reads config from `@/app/config` (N/A for hook registry)
- [x] Exports default named component (exports HookRegistry class and hookRegistry singleton)
- [x] Adds basic ARIA and keyboard handlers (N/A for hook registry utility)
*/
