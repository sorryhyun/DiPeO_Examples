export type DevelopmentModeConfig = {
  enable_mock_data?: boolean;
  disable_websocket_in_dev?: boolean;
  use_localstorage_persistence?: boolean;
};

export type AppConfigType = {
  apiBaseUrl: string;
  development_mode: DevelopmentModeConfig;
  localStorageKeys: {
    AUTH_TOKEN?: string;
    USER_PROFILE?: string;
    THEME?: string;
    LAST_ACTIVE_CHANNEL?: string;
  };
};

export const config: AppConfigType = {
  apiBaseUrl: '/api',
  development_mode: {
    // Enables mock data endpoints in development
    enable_mock_data: true,
    // If true, WebSocket connections are disabled in development (fallback to mock WS)
    disable_websocket_in_dev: false,
    // Persist certain keys in localStorage during development
    use_localstorage_persistence: true,
  },
  localStorageKeys: {
    AUTH_TOKEN: 'app_auth_token',
    USER_PROFILE: 'app_user_profile',
    THEME: 'app_theme',
    LAST_ACTIVE_CHANNEL: 'app_last_active_channel',
  },
};

// Convenience exported constants for quick access in other modules
export const API_BASE_URL: string = config.apiBaseUrl;
export const ENABLE_MOCKS: boolean =
  !!config.development_mode?.enable_mock_data;
export const LOCALSTORAGE_KEYS = config.localStorageKeys;