/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_WS_BASE_URL?: string
  readonly VITE_FEATURES?: string
  readonly VITE_ENABLE_MOCK_DATA?: string
  readonly VITE_PAGE_SIZE?: string
  readonly VITE_DATE_FORMAT?: string
  readonly VITE_API_URL?: string
  readonly VITE_WS_URL?: string
  readonly VITE_ENABLE_MOCKS?: string
  readonly VITE_ENV?: string
  readonly VITE_API_BASE?: string
  readonly VITE_TIMEOUT_MS?: string
  readonly VITE_ANALYTICS_PROVIDERS?: string
  readonly VITE_DISABLE_WEBSOCKETS?: string
  readonly VITE_BUILD_TIMESTAMP?: string
}