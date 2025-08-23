// Development configuration for the collaboration app
// Controls mock data, API behavior, and feature toggles

export interface DevConfig {
  enable_mock_data: boolean;
  mock_auth_users: boolean;
  mock_api_endpoints: boolean;
  disable_websocket_in_dev: boolean;
  use_localstorage_persistence: boolean;
}

export const devConfig: DevConfig = {
  enable_mock_data: true,
  mock_auth_users: true,
  mock_api_endpoints: true,
  disable_websocket_in_dev: false,
  use_localstorage_persistence: true,
};

export const isDev = process.env.NODE_ENV === 'development';

export type { DevConfig };
