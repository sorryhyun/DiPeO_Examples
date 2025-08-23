/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_ENABLE_MOCK_DATA: string
  readonly VITE_USE_MOCK_WS: string
  readonly VITE_DISABLE_WEBSOCKET_IN_DEV: string
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}