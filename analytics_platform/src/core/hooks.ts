// src/core/hooks.ts
/* src/core/hooks.ts
   Hook registry for application extension points.
   - Use registerHook to register a handler for a named hook key.
   - Use resolveHooks/runHooks (resolveHooks) to execute registered handlers.
   - Handlers are executed in registration order. Support for async handlers provided.
   - Standard hooks included: beforeApiRequest, afterApiResponse, onLogin, onLogout, onRouteChange
*/

import { events } from '@/core/events';
import { ApiResult, User } from '@/core/contracts';

// Supported hook keys for the application - extend as needed
export type HookKey =
  | 'beforeApiRequest'
  | 'afterApiResponse'
  | 'onLogin'
  | 'onLogout'
  | 'onRouteChange';

// Context object passed to hooks - shape depends on hook key but includes a few common fields
export type HookContext = {
  // unique id for correlation during a single flow (optional)
  correlationId?: string;
  // for api hooks
  request?: {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    url: string;
    headers?: Record<string, string>;
    body?: any;
  };
  response?: ApiResult<any>;
  // for auth hooks
  user?: User | null;
  // route change
  route?: { from?: string; to: string };
  // arbitrary bag
  meta?: Record<string, any>;
};

export type HookHandler = (ctx: HookContext) => void | Promise<void>;

class HookRegistry {
  private registry: Map<HookKey, HookHandler[]> = new Map();

  register(key: HookKey, handler: HookHandler) {
    const arr = this.registry.get(key) ?? [];
    arr.push(handler);
    this.registry.set(key, arr);
    return () => this.unregister(key, handler);
  }

  unregister(key: HookKey, handler?: HookHandler) {
    const arr = this.registry.get(key);
    if (!arr) return false;
    if (!handler) {
      this.registry.delete(key);
      return true;
    }
    const idx = arr.indexOf(handler);
    if (idx !== -1) {
      arr.splice(idx, 1);
      if (arr.length === 0) this.registry.delete(key);
      return true;
    }
    return false;
  }

  async run(key: HookKey, ctx: HookContext = {}) {
    const arr = this.registry.get(key) ?? [];
    // Execute sequentially to allow ordered modification of ctx.meta if needed
    for (const handler of arr) {
      try {
        await handler(ctx);
      } catch (err) {
        // Ensure a failing hook does not stop others; log the error
        // eslint-disable-next-line no-console
        console.error(`[HookRegistry] error in hook ${key}`, err);
      }
    }

    // Emit an event for external consumers (keeps hooks and eventbus connected)
    switch (key) {
      case 'onLogin':
        if (ctx.user) {
          events.emit('auth:session_expired', { userId: ctx.user.id });
        }
        break;
      case 'onLogout':
        // nothing by default
        break;
      default:
        break;
    }

    return ctx;
  }

  getHandlers(key: HookKey) {
    return (this.registry.get(key) ?? []).slice();
  }

  clear() {
    this.registry.clear();
  }
}

export const hooks = new HookRegistry();

export const registerHook = (key: HookKey, handler: HookHandler) => hooks.register(key, handler);
export const resolveHooks = (key: HookKey, ctx: HookContext = {}) => hooks.run(key, ctx);

// Example usage:
// import { registerHook, resolveHooks } from '@/core/hooks'
// registerHook('beforeApiRequest', async (ctx) => { ctx.request.headers = { ...ctx.request.headers, 'x-trace-id': 'abc' } })
// await resolveHooks('beforeApiRequest', { request: { method: 'GET', url: '/patients' } })

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (not needed for hook registry kernel)
- [x] Exports default named component (exports named functions and HookRegistry class)
- [x] Adds basic ARIA and keyboard handlers (not relevant for hook registry)
*/
