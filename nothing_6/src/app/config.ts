// filepath: src/app/config.ts
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `import.meta.env` (Vite-based)
// [x] Exports default named component (appConfig)
// [x] Handles edge cases within file scope

import { DEV_MOCK_USERS, User } from '@/core/contracts'

// Vite provides import.meta.env. Keep safe reads and typed names (VITE_ prefix used for user-defined vars).
const env = (import.meta as any).env ?? {}

export interface DevelopmentModeConfig {
  enable_mock_data: boolean
  mock_auth_users: User[]
  mock_api_endpoints: string[]
  disable_websocket_in_dev: boolean
  use_localstorage_persistence: boolean
}

export interface AppConfig {
  appName: string
  version: string
  apiBase: string
  mode: string
  isDevelopment: boolean
  isProduction: boolean
  featureList: string[]
  featureToggles: Record<string, boolean>
  dev: DevelopmentModeConfig
  // convenience helpers
  shouldUseMockData: boolean
}

// Read feature list from env or fallback to the app manifest used in build-time prompt.
const DEFAULT_FEATURES = [
  'epic hero section with parallax void animation',
  'testimonials from satisfied users of nothing',
  'pricing tiers for different levels of nothing',
  "animated counter showing '0 features delivered'",
  'FAQ section answering questions about nothing',
  'team section showcasing experts in nothing',
  'interactive void simulator',
  'newsletter signup for updates about nothing',
  'live chat support that provides no help',
  'product comparison chart (Nothing vs Something vs Everything)',
  'case studies of successful nothing implementations',
  'roadmap timeline showing future nothing releases',
  '3D rotating nothing showcase',
  'customer reviews rating nothing 5 stars',
  'money-back guarantee for unsatisfied nothing users',
  'affiliate program for sharing nothing',
  'press kit with nothing logos and assets',
  'API documentation for integrating nothing',
  'status page showing 100% nothing uptime',
  'cookie banner warning about nothing cookies',
]

function parseFeatureList(raw?: string | string[]): string[] {
  if (!raw) return DEFAULT_FEATURES
  if (Array.isArray(raw)) return raw
  try {
    return raw.split(',').map(s => s.trim()).filter(Boolean)
  } catch {
    return DEFAULT_FEATURES
  }
}

const appName = (env.VITE_APP_NAME as string) ?? 'Absolutely Nothing ™'
const version = (env.VITE_APP_VERSION as string) ?? '0.1.0'
const apiBase = (env.VITE_API_BASE as string) ?? '/api'
const mode = (env.MODE as string) ?? (env.VITE_NODE_ENV as string) ?? 'development'

const isDevelopmentMode = mode !== 'production'
const isProductionMode = mode === 'production'

// Development-mode configuration (fallbacks provided for local dev)
const devConfig: DevelopmentModeConfig = {
  enable_mock_data: (env.VITE_ENABLE_MOCK_DATA === 'true') || isDevelopmentMode,
  mock_auth_users: (env.VITE_USE_DEV_MOCK_USERS === 'true' ? DEV_MOCK_USERS : DEV_MOCK_USERS),
  mock_api_endpoints: (env.VITE_MOCK_API_ENDPOINTS ? parseFeatureList(env.VITE_MOCK_API_ENDPOINTS) : [
    '/api/nothing',
    '/api/testimonials/nothing',
    '/api/pricing/nothing',
    '/api/support/nothing',
    '/api/newsletter/nothing',
    '/api/analytics/nothing',
    '/api/checkout/nothing',
  ]),
  disable_websocket_in_dev: (env.VITE_DISABLE_WS_IN_DEV === 'true') || false,
  use_localstorage_persistence: (env.VITE_USE_LOCALSTORAGE_PERSISTENCE === 'true') || true,
}

// Feature toggles derived from env or feature list; toggle names are kebab-case derived from feature text
function computeFeatureToggles(features: string[], raw?: string): Record<string, boolean> {
  const toggles: Record<string, boolean> = {}
  features.forEach(f => {
    const key = f.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    toggles[key] = true
  })
  // override toggles via VITE_FEATURE_TOGGLES env var as comma separated key=true pairs
  if (raw) {
    raw.split(',').forEach(pair => {
      const [k, v] = pair.split('=').map(s => s.trim())
      if (!k) return
      toggles[k] = v !== 'false'
    })
  }
  return toggles
}

const featureList = parseFeatureList(env.VITE_FEATURE_LIST ?? undefined)
const featureToggles = computeFeatureToggles(featureList, env.VITE_FEATURE_TOGGLES)

export const appConfig: AppConfig = {
  appName,
  version,
  apiBase,
  mode,
  isDevelopment: isDevelopmentMode,
  isProduction: isProductionMode,
  featureList,
  featureToggles,
  dev: devConfig,
  shouldUseMockData: isDevelopmentMode && devConfig.enable_mock_data,
}

// Convenience exports for common usage
export const { isDevelopment: configIsDevelopment, isProduction: configIsProduction, shouldUseMockData } = appConfig
export const config = appConfig

// Backward compatibility exports
export const isDevelopment = appConfig.isDevelopment
export const isProduction = appConfig.isProduction

export default appConfig
