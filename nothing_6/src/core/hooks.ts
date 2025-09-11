// filepath: src/core/hooks.ts

/* src/core/hooks.ts

   Small Hook registry used by providers and the mock server to extend behavior without tight coupling.

   Example:
     import { hooks } from '@/core/hooks'
     hooks.register('beforeApiRequest', ({ path, meta }) => { meta.start = Date.now() })
     await hooks.run('afterApiResponse', { path, response })
*/

import { ApiResult } from '@/core/contracts'
import { eventBus } from '@/core/events'

// Named hook points used across the app
export type HookPoint =
  | 'beforeApiRequest'
  | 'afterApiResponse'
  | 'onLogin'
  | 'onLogout'
  | 'onRouteChange'

// Contexts for hook points
export interface BaseHookContext {
  // arbitrary bag for cross-hook state
  meta?: Record<string, unknown>
}

export interface BeforeApiRequestContext extends BaseHookContext {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | string
  body?: unknown
  // handlers may add headers, cancel token, or mutate body
}

export interface AfterApiResponseContext<T = unknown> extends BaseHookContext {
  path: string
  method: string
  response: ApiResult<T>
}

export interface AuthHookContext extends BaseHookContext {
  userId?: string
  user?: unknown
}

export interface RouteChangeContext extends BaseHookContext {
  from?: string
  to: string
}

export type HookContext = BeforeApiRequestContext | AfterApiResponseContext | AuthHookContext | RouteChangeContext

export type HookHandler<C extends HookContext = HookContext> = (ctx: C) => void | Promise<void>

// Hook registry
export class HookRegistry {
  private map: Map<HookPoint, HookHandler<any>[]> = new Map()

  register<K extends HookPoint>(point: K, handler: HookHandler<any>): () => void {
    const list = this.map.get(point) ?? []
    list.push(handler)
    this.map.set(point, list)

    // return unregister fn
    return () => {
      const cur = this.map.get(point)
      if (!cur) return
      const idx = cur.indexOf(handler)
      if (idx >= 0) cur.splice(idx, 1)
      if (cur.length === 0) this.map.delete(point)
    }
  }

  async run<K extends HookPoint>(point: K, ctx: HookContext): Promise<void> {
    const list = this.map.get(point)
    if (!list || list.length === 0) return
    for (const handler of Array.from(list)) {
      try {
        await handler(ctx)
      } catch (err) {
        // Log via EventBus to centralize diagnostics
        eventBus.emit('analytics:event', { name: 'hook:error', properties: { point, error: String(err) } })
        // swallow errors to avoid breaking the caller
        // eslint-disable-next-line no-console
        console.error('[HookRegistry] handler error for', point, err)
      }
    }
  }

  // Get all registered hook points (useful for debugging)
  getRegisteredHooks(): string[] {
    return Array.from(this.map.keys())
  }

  // Get handler count for a hook point
  getHandlerCount(point: HookPoint): number {
    const list = this.map.get(point)
    return list ? list.length : 0
  }

  // Clear all handlers for a hook point
  clear(point: HookPoint): void {
    this.map.delete(point)
  }

  // Clear all handlers
  clearAll(): void {
    this.map.clear()
  }
}

export const hooks = new HookRegistry()

// Convenience typed registration helpers exported for ergonomics
export const registerHook = <K extends HookPoint>(point: K, handler: HookHandler<any>) => hooks.register(point, handler)
export const runHook = <K extends HookPoint>(point: K, ctx: HookContext) => hooks.run(point, ctx)

// Development helpers
export const debugHooks = () => ({
  registeredHooks: hooks.getRegisteredHooks(),
  getHandlerCount: (point: HookPoint) => hooks.getHandlerCount(point),
  clear: (point: HookPoint) => hooks.clear(point),
  clearAll: () => hooks.clearAll(),
})

// Default export is the hooks registry
export default hooks

// Example usage (commented):
// registerHook('beforeApiRequest', async (ctx: BeforeApiRequestContext) => {
//   if (!ctx.meta) ctx.meta = {}
//   ctx.meta['startTs'] = Date.now()
// })
