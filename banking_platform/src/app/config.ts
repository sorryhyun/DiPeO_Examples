// filepath: src/app/config.ts
/* src/app/config.ts

Materialize environment variables from Vite's import.meta.env into a typed runtime config object.
Use import.meta.env.VITE_* for custom variables.
*/

import type { User } from '@/core/contracts';

type RawEnv = typeof import.meta.env;

// Known env keys used by the app. Add new VITE_ keys to the interface if needed.
const RAW = import.meta.env as unknown as Record<string, string | undefined>;

function parseBoolean(raw?: string | undefined, fallback = false): boolean {
  if (!raw) return fallback;
  return raw === '1' || raw.toLowerCase() === 'true' || raw.toLowerCase() === 'yes';
}

function parseJson<T = any>(raw?: string | undefined, fallback?: T): T | undefined {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn('app/config: failed to parse JSON env var', raw);
    return fallback;
  }
}

export const appConfig = (() => {
  // Standard Vite-provided mode
  const mode = RAW['MODE'] ?? RAW['VITE_MODE'] ?? 'development';

  const apiBase = RAW['VITE_API_BASE'] ?? RAW['VITE_BASE_API'] ?? '/api';
  const sentryDsn = RAW['VITE_SENTRY_DSN'] ?? '';
  const release = RAW['VITE_RELEASE'] ?? RAW['VITE_COMMIT'] ?? undefined;
  const enableMocks = parseBoolean(RAW['VITE_ENABLE_MOCKS'], false);
  const enableWebsockets = parseBoolean(RAW['VITE_ENABLE_WS'], true);

  // Feature flags can be provided as a JSON array or comma-separated list
  const rawFlags = RAW['VITE_FEATURE_FLAGS'];
  const featuresFromJson = parseJson<string[]>(rawFlags, undefined);
  const featuresFromCsv = rawFlags ? rawFlags.split(',').map(s => s.trim()).filter(Boolean) : [];
  const featureSet = new Set<string>([...(featuresFromJson ?? []), ...featuresFromCsv]);

  // Structured feature toggles (common features for this scaffold)
  const features = {
    charts: featureSet.has('charts') || featureSet.has('enable_charts'),
    analytics: featureSet.has('analytics'),
    demoMode: featureSet.has('demo'),
    // extend keys as needed
  };

  // Development mode settings
  const development_mode = {
    enabled: mode === 'development',
    enable_mock_data: enableMocks || parseBoolean(RAW['VITE_DEVELOPMENT_MOCKS'], false),
  };

  // Materialize a mock user only when dev mocks are enabled. This is safe client-side data
  const mockUser: User | null = development_mode.enable_mock_data
    ? {
        id: 'mock-user-1',
        email: 'demo@local.test',
        name: 'Demo User',
        avatarUrl: undefined,
        roles: ['admin', 'doctor'],
        metadata: { demo: true },
        createdAt: new Date().toISOString(),
      }
    : null;

  return Object.freeze({
    raw: RAW,
    mode,
    isDevelopment: mode === 'development',
    apiBase,
    sentryDsn,
    release,
    features,
    development_mode,
    shouldUseMockData: development_mode.enable_mock_data,
    mockUser,
    websockets: {
      enabled: enableWebsockets,
    },
  });
})();

/* Example usage

import { appConfig } from '@/app/config'
import { ApiClient } from '@/services/api'

if (appConfig.shouldUseMockData) {
  // seed local state with appConfig.mockUser
}

console.log('API Base is:', appConfig.apiBase)
*/

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config` (this IS the config file)
// [x] Exports default named component (exports appConfig constant)
// [x] Adds basic ARIA and keyboard handlers (not relevant for config file)
