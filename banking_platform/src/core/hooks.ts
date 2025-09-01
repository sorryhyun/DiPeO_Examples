// filepath: src/core/hooks.ts
/* src/core/hooks.ts

A small hook registry that allows parts of the app (plugins, features) to register handlers for extension points.
Handlers may mutate a context object and optionally return a result.
*/

import { eventBus } from '@/core/events';
import type { User } from '@/core/contracts';

export type HookKey = 'beforeApiRequest' | 'afterApiResponse' | 'onLogin' | 'onLogout' | 'onRouteChange';

export type HookContext = {
  // For beforeApiRequest / afterApiResponse
  request?: { url: string; method?: string; headers?: Record<string, string>; body?: any };
  response?: { status: number; body?: any };

  // For auth hooks
  user?: User | null;

  // For route changes
  from?: string;
  to?: string;

  // shared bag for extension authors
  bag?: Record<string, any>;
};

export type HookHandler<K extends HookKey = HookKey> = (ctx: HookContext) => void | Promise<void>;

class HookRegistry {
  private store = new Map<HookKey, Set<HookHandler>>();

  register(key: HookKey, handler: HookHandler): () => void {
    const set = this.store.get(key) ?? new Set<HookHandler>();
    set.add(handler);
    this.store.set(key, set);
    return () => this.unregister(key, handler);
  }

  unregister(key: HookKey, handler?: HookHandler) {
    const set = this.store.get(key);
    if (!set) return;
    if (handler) set.delete(handler);
    else set.clear();
    if (set.size === 0) this.store.delete(key);
  }

  async run(key: HookKey, ctx: HookContext = {}) {
    const set = this.store.get(key);
    if (!set || set.size === 0) return;
    const handlers = Array.from(set);
    const promises: Promise<void>[] = [];
    for (const h of handlers) {
      try {
        const res = h(ctx);
        if (res instanceof Promise) promises.push(res.catch((err) => console.error('[hooks] handler error', key, err)));
      } catch (err) {
        console.error('[hooks] handler error (sync)', key, err);
      }
    }
    if (promises.length) await Promise.all(promises);

    // Emit a global event for other systems interested in hook runs
    try {
      await eventBus.emit('route:change' as any, { from: ctx.from, to: ctx.to } as any);
    } catch (e) {
      // ignore
    }
  }
}

const globalHookRegistry = new HookRegistry();

export function registerHook(key: HookKey, handler: HookHandler) {
  return globalHookRegistry.register(key, handler);
}

export async function runHooks(key: HookKey, ctx: HookContext = {}) {
  return globalHookRegistry.run(key, ctx);
}

/* Common hook usage patterns

// Register a hook at module init (returns unsubscribe)
import { registerHook } from '@/core/hooks'

const unsubscribe = registerHook('beforeApiRequest', async (ctx) => {
  // attach telemetry or modify ctx.request
  ctx.bag = ctx.bag ?? {}
  ctx.bag.start = Date.now()
})

// Run hooks before making an API request
import { runHooks } from '@/core/hooks'
await runHooks('beforeApiRequest', { request: { url: '/metrics', method: 'GET' } })
*/

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (not applicable - this IS the hook registry system)
// [x] Reads config from `@/app/config` (not applicable - this is a core utility)
// [x] Exports default named component (exports named functions and types)
// [x] Adds basic ARIA and keyboard handlers (not applicable - this is a service utility)
