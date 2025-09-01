// HookPoint names
export type HookPoint = 
  | 'beforeApiRequest' 
  | 'afterApiResponse' 
  | 'onLogin' 
  | 'onLogout' 
  | 'onRouteChange' 
  | 'onErrorReported';

// HookContext shapes (generic)
export interface HookContext<T = any> {
  name: HookPoint;
  payload?: T;
  meta?: Record<string, any>;
  stopPropagation?: boolean;
}

// HookFunction types
export type HookFunction<T = any> = (ctx: HookContext<T>) => void | Promise<void>;

// HookRegistry class API
class HookRegistry {
  private hooks = new Map<HookPoint, Map<string, HookFunction>>();

  register<T = any>(point: HookPoint, id: string, fn: HookFunction<T>): void {
    if (!this.hooks.has(point)) {
      this.hooks.set(point, new Map());
    }
    
    const pointHooks = this.hooks.get(point)!;
    pointHooks.set(id, fn);
  }

  unregister(point: HookPoint, id: string): boolean {
    const pointHooks = this.hooks.get(point);
    if (!pointHooks) {
      return false;
    }
    
    return pointHooks.delete(id);
  }

  async run<T = any>(point: HookPoint, payload?: T, meta?: Record<string, any>): Promise<void> {
    const pointHooks = this.hooks.get(point);
    if (!pointHooks || pointHooks.size === 0) {
      return;
    }

    const context: HookContext<T> = {
      name: point,
      payload,
      meta,
      stopPropagation: false,
    };

    // Run hooks in registration order
    for (const [id, fn] of pointHooks) {
      if (context.stopPropagation) {
        break;
      }

      try {
        await fn(context);
      } catch (error) {
        // Swallow individual hook errors and continue
        console.warn(`Hook error in ${point}:${id}:`, error);
      }
    }
  }

  list(point?: HookPoint): ReadonlyArray<{ id: string; fn: HookFunction }> {
    if (point) {
      const pointHooks = this.hooks.get(point);
      if (!pointHooks) {
        return [];
      }
      
      return Array.from(pointHooks.entries()).map(([id, fn]) => ({ id, fn }));
    }

    // Return all hooks from all points
    const allHooks: { id: string; fn: HookFunction }[] = [];
    for (const [hookPoint, pointHooks] of this.hooks) {
      for (const [id, fn] of pointHooks) {
        allHooks.push({ id: `${hookPoint}:${id}`, fn });
      }
    }
    
    return allHooks;
  }
}

// Default instance and convenience helpers
export const hooksRegistry = new HookRegistry();

export const registerHook = hooksRegistry.register.bind(hooksRegistry);
export const unregisterHook = hooksRegistry.unregister.bind(hooksRegistry);
export const runHook = hooksRegistry.run.bind(hooksRegistry);

// Export registry for advanced use cases
export { HookRegistry };
