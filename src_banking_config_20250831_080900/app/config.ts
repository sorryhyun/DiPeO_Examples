import type { UserRole } from '@/core/contracts';

export interface AppConfig {
  appName: string;
  appType: string; // 'fintech'
  env: 'development' | 'production' | 'test';
  host?: string;
  apiBaseUrl: string;
  websocketUrl?: string;
  features: string[]; // feature slugs, e.g. 'account overview dashboard'
  featureToggles: Record<string, boolean>;
  developmentMode: {
    enableMockData: boolean;
    mockAuthUsers: Array<{ email: string; password: string; role: UserRole }>;
    mockApiEndpoints: string[];
    disableWebsocketInDev: boolean;
    useLocalstoragePersistence: boolean;
  };
  telemetry?: { enabled: boolean; dsn?: string };
}

// Derive environment from process.env
const env = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
const isDevelopment = env === 'development';
const isProduction = env === 'production';

// Core features available in the fintech app
const features = [
  'account overview dashboard',
  'transaction history',
  'fund transfer interface',
  'bill payment portal',
  'investment portfolio tracker',
  'budget planning tools',
  'secure messaging center',
  'card management panel'
];

// Convert features array to quick lookup object
const featureToggles = features.reduce((acc, feature) => {
  acc[feature] = true;
  return acc;
}, {} as Record<string, boolean>);

// Mock users for development mode
const mockAuthUsers = [
  { email: 'premium@bank.com', password: 'prem123', role: 'premium' as UserRole },
  { email: 'standard@bank.com', password: 'stand123', role: 'standard' as UserRole },
  { email: 'business@bank.com', password: 'biz123', role: 'business' as UserRole }
];

// Mock API endpoints available in development
const mockApiEndpoints = [
  '/api/accounts',
  '/api/transactions',
  '/api/transfers',
  '/api/payments',
  '/api/investments',
  '/api/budgets',
  '/api/cards',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/refresh',
  '/api/auth/me',
  '/api/messages'
];

// Helper function to get WebSocket URL at runtime (safe for SSR)
function getWebSocketUrl(): string {
  if (process.env.REACT_APP_WS_URL) {
    return process.env.REACT_APP_WS_URL;
  }
  
  // Only access window/location in browser environment
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws`;
  }
  
  // Fallback for SSR/test environments
  return 'ws://localhost:8000/ws';
}

// Main configuration object
export const appConfig: AppConfig = Object.freeze({
  appName: 'Digital Banking Platform',
  appType: 'fintech',
  env,
  host: process.env.REACT_APP_HOST,
  apiBaseUrl: process.env.REACT_APP_API_URL || '/api',
  websocketUrl: undefined, // Will be computed at runtime via getWebSocketUrl()
  features,
  featureToggles,
  developmentMode: {
    enableMockData: isDevelopment,
    mockAuthUsers: isDevelopment ? [...mockAuthUsers] : [],
    mockApiEndpoints: isDevelopment ? [...mockApiEndpoints] : [],
    disableWebsocketInDev: process.env.REACT_APP_DISABLE_WS === 'true',
    useLocalstoragePersistence: isDevelopment
  },
  telemetry: {
    enabled: isProduction && process.env.REACT_APP_TELEMETRY !== 'false',
    dsn: process.env.REACT_APP_SENTRY_DSN
  }
});

// Computed helper functions
export function isFeatureEnabled(key: string): boolean {
  return !!appConfig.featureToggles[key];
}

export function getApiBaseUrl(): string {
  return appConfig.apiBaseUrl;
}

export function getWebSocketUrlRuntime(): string {
  return getWebSocketUrl();
}

export function isDevelopmentMode(): boolean {
  return appConfig.env === 'development';
}

export function isProductionMode(): boolean {
  return appConfig.env === 'production';
}

export function shouldUseMockData(): boolean {
  return appConfig.developmentMode.enableMockData;
}

export const mockUsers = appConfig.developmentMode.mockAuthUsers;
