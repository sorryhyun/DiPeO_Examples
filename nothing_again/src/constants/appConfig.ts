// App configuration constants for Absolutely Nothing™
export interface AppConfig {
  readonly development_mode: {
    readonly enable_mock_data: boolean;
    readonly mock_api_endpoints: readonly string[];
    readonly mock_auth_users: readonly {
      readonly id: string;
      readonly email: string;
      readonly name: string;
      readonly role: string;
      readonly password: string;
      readonly createdAt: string;
    }[];
    readonly disable_websocket_in_dev: boolean;
    readonly use_localstorage_persistence: boolean;
  };
  readonly app_name: string;
  readonly app_version: string;
  readonly api_base_url: string;
  readonly features: {
    readonly enable_analytics: boolean;
    readonly enable_3d_showcase: boolean;
    readonly enable_animations: boolean;
    readonly enable_sound_effects: boolean;
  };
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  development_mode: {
    enable_mock_data: true,
    mock_api_endpoints: [
      '/api/nothing',
      '/api/nothing/login',
      '/api/testimonials/nothing',
      '/api/pricing/nothing',
      '/api/support/nothing',
      '/api/newsletter/nothing',
      '/api/analytics/nothing',
      '/api/checkout/nothing'
    ],
    mock_auth_users: [
      {
        id: '1',
        email: 'user@nothing.com',
        name: 'Nothing User',
        role: 'customer',
        password: 'password123',
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        email: 'admin@nothing.com',
        name: 'Nothing Admin',
        role: 'admin',
        password: 'admin123',
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '3',
        email: 'test@nothing.com',
        name: 'Test Nothing',
        role: 'tester',
        password: 'test123',
        createdAt: '2024-01-01T00:00:00Z'
      }
    ],
    disable_websocket_in_dev: true,
    use_localstorage_persistence: true
  },
  app_name: 'Absolutely Nothing™',
  app_version: '1.0.0',
  api_base_url: process.env.NODE_ENV === 'production' ? 'https://api.nothing.com' : 'http://localhost:3001',
  features: {
    enable_analytics: true,
    enable_3d_showcase: true,
    enable_animations: true,
    enable_sound_effects: true
  }
} as const;

// Export individual config sections for convenience
export const { development_mode, app_name, app_version, api_base_url, features } = DEFAULT_APP_CONFIG;

// Type guards for runtime config validation
export const isDevMode = (): boolean => development_mode.enable_mock_data;
export const shouldUseMockData = (): boolean => development_mode.enable_mock_data;
export const shouldUseLocalStorage = (): boolean => development_mode.use_localstorage_persistence;
export const isWebSocketDisabled = (): boolean => development_mode.disable_websocket_in_dev;

// Mock endpoint checker
export const isMockEndpoint = (endpoint: string): boolean => {
  return development_mode.mock_api_endpoints.includes(endpoint);
};

// Mock user finder
export const getMockUser = (email: string) => {
  return development_mode.mock_auth_users.find(user => user.email === email);
};

// Feature flag helpers
export const isFeatureEnabled = (feature: keyof typeof features): boolean => {
  return features[feature];
};
