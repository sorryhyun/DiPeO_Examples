export type EndpointMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type MockEndpoint = {
  name: string;
  path: string;
  method: EndpointMethod;
  responseDelayMs?: number;
  status?: number;
};

export type MockUser = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  token?: string;
};

export type DevelopmentModeConfig = {
  enable_mock_data: boolean;
  mock_api_endpoints: MockEndpoint[];
  disable_websocket_in_dev?: boolean;
  use_localstorage_persistence?: boolean;
};

export type AppConfigType = {
  app_type: string;
  framework: string;
  styling_approach: string;
  objective: string;
  development_mode: DevelopmentModeConfig;
  mock_auth_users?: MockUser[];
};

const MOCK_ENDPOINTS: MockEndpoint[] = [
  { name: 'getChannels', path: '/api/channels', method: 'GET', responseDelayMs: 100, status: 200 },
  { name: 'getMessages', path: '/api/messages', method: 'GET', responseDelayMs: 120, status: 200 },
  { name: 'sendMessage', path: '/api/messages', method: 'POST', responseDelayMs: 140, status: 201 },
  { name: 'getThread', path: '/api/threads/:id', method: 'GET', responseDelayMs: 150, status: 200 },
  { name: 'authenticate', path: '/api/auth/login', method: 'POST', responseDelayMs: 110, status: 200 },
  { name: 'presence', path: '/api/presence', method: 'GET', responseDelayMs: 90, status: 200 }
];

const MOCK_USERS: MockUser[] = [
  { id: 'u1', username: 'alice', displayName: 'Alice Carter', avatarUrl: '/avatars/alice.png', token: 'token-alice' },
  { id: 'u2', username: 'bob', displayName: 'Bob Chen', avatarUrl: '/avatars/bob.png', token: 'token-bob' },
  { id: 'u3', username: 'carol', displayName: 'Carol Diaz', avatarUrl: '/avatars/carol.png', token: 'token-carol' }
];

export const AppConfig: AppConfigType = {
  app_type: 'web',
  framework: 'react',
  styling_approach: 'tailwind',
  objective: 'Provide a modular, production-ready real-time messaging application with channels, threads, and presence.',
  development_mode: {
    enable_mock_data: true,
    mock_api_endpoints: MOCK_ENDPOINTS,
    disable_websocket_in_dev: false,
    use_localstorage_persistence: true
  },
  mock_auth_users: MOCK_USERS
};