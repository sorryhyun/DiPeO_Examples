import axios, { AxiosInstance, AxiosError } from 'axios';
import type { ApiResponse } from '@/types';

// Create axios instance with base configuration
export const apiClient: AxiosInstance = axios.create({
  baseURL: '/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token getter function that will be set by AuthProvider
let authTokenGetter: (() => string | null) | null = null;

/**
 * Set the auth token getter function
 * This should be called by AuthProvider during initialization
 */
export const setAuthTokenGetter = (getter: () => string | null): void => {
  authTokenGetter = getter;
};

// Request interceptor to inject auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from the registered getter
    const token = authTokenGetter?.();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to normalize errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Normalize error response to ApiResponse shape
    const normalizedError: ApiResponse<never> = {
      success: false,
      data: null as never,
      error: {
        message: error.message || 'An unexpected error occurred',
        code: error.response?.status || 500,
        details: error.response?.data || null,
      },
    };

    // Create a new error with normalized response
    const apiError = new Error(normalizedError.error.message);
    (apiError as any).response = normalizedError;
    (apiError as any).status = normalizedError.error.code;
    
    return Promise.reject(apiError);
  }
);

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - provides getter pattern for AuthProvider
// [x] Reads config from `@/app/config` - N/A for this service layer
// [x] Exports default named component - N/A, this is a service not a component
// [x] Adds basic ARIA and keyboard handlers (where relevant) - N/A for API client
