// src/services/api.ts
/* src/services/api.ts
   Central API client wrapper with built-in error handling, auth token injection, and typed requests.
   - Uses fetch API with JSON handling and base URL from config
   - Automatically injects auth tokens when available
   - Wraps responses in ApiResult<T> format from contracts
   - Provides both low-level request() and high-level apiClient object
*/

import { appConfig } from '@/app/config';
import { ApiResult, ApiError } from '@/core/contracts';
import { safeJsonParse, isObject } from '@/core/utils';

// Request options interface extending fetch RequestInit
export interface RequestOptions extends Omit<RequestInit, 'body'> {
  url: string;
  body?: any;
  timeout?: number;
  skipAuth?: boolean;
}

// Auth token provider function type - can be injected by AuthProvider
type TokenProvider = () => string | null | Promise<string | null>;

// Global auth token provider - set by AuthProvider during bootstrap
let authTokenProvider: TokenProvider | null = null;

export function setAuthTokenProvider(provider: TokenProvider) {
  authTokenProvider = provider;
}

// Helper to create API errors from various sources
function createApiError(message: string, code: string | number = 'UNKNOWN', details?: any): ApiError {
  return { code, message, details };
}

// Helper to determine if response is JSON
function isJsonResponse(response: Response): boolean {
  const contentType = response.headers.get('content-type');
  return Boolean(contentType && contentType.includes('application/json'));
}

// Core request function with full error handling and auth injection
export async function request<T = any>(options: RequestOptions): Promise<ApiResult<T>> {
  const {
    url,
    method = 'GET',
    body,
    headers = {},
    timeout = 10000,
    skipAuth = false,
    ...fetchOptions
  } = options;

  try {
    // Build full URL
    const fullUrl = url.startsWith('http') ? url : `${appConfig.apiBaseUrl}${url}`;

    // Prepare headers
    const requestHeaders: Record<string, string> = {};
    
    // Handle different header types
    if (headers) {
      if (headers instanceof Headers) {
        headers.forEach((value, key) => {
          requestHeaders[key] = value;
        });
      } else if (isObject(headers)) {
        Object.assign(requestHeaders, headers);
      }
    }

    // Add Content-Type for JSON payloads
    if (body && isObject(body)) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    // Inject auth token if available and not skipped
    if (!skipAuth && authTokenProvider) {
      try {
        const token = await authTokenProvider();
        if (token) {
          requestHeaders['Authorization'] = `Bearer ${token}`;
        }
      } catch (err) {
        // Continue request without auth if token provider fails
        console.warn('[API] Failed to get auth token:', err);
      }
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Prepare request body
    const requestBody = body && isObject(body) ? JSON.stringify(body) : body;

    // Execute fetch request
    const response = await fetch(fullUrl, {
      method,
      headers: requestHeaders,
      body: requestBody,
      signal: controller.signal,
      ...fetchOptions,
    });

    clearTimeout(timeoutId);

    // Parse response body
    let responseData: any = null;
    if (isJsonResponse(response)) {
      const text = await response.text();
      responseData = safeJsonParse(text);
    } else {
      responseData = await response.text();
    }

    // Handle HTTP errors
    if (!response.ok) {
      const error = createApiError(
        responseData?.message || `HTTP ${response.status}: ${response.statusText}`,
        responseData?.code || response.status,
        responseData?.details || { status: response.status, statusText: response.statusText }
      );
      return { error };
    }

    // Return successful result
    return { data: responseData as T };

  } catch (err: any) {
    // Handle network errors, timeouts, etc.
    let error: ApiError;

    if (err.name === 'AbortError') {
      error = createApiError('Request timeout', 'TIMEOUT');
    } else if (err instanceof TypeError && err.message.includes('fetch')) {
      error = createApiError('Network error', 'NETWORK_ERROR', err.message);
    } else {
      error = createApiError(err.message || 'Unknown request error', 'REQUEST_ERROR', err);
    }

    return { error };
  }
}

// High-level API client object with common HTTP methods
export const apiClient = {
  // GET request
  get: <T = any>(url: string, options: Omit<RequestOptions, 'url' | 'method'> = {}) =>
    request<T>({ url, method: 'GET', ...options }),

  // POST request
  post: <T = any>(url: string, body?: any, options: Omit<RequestOptions, 'url' | 'method' | 'body'> = {}) =>
    request<T>({ url, method: 'POST', body, ...options }),

  // PUT request
  put: <T = any>(url: string, body?: any, options: Omit<RequestOptions, 'url' | 'method' | 'body'> = {}) =>
    request<T>({ url, method: 'PUT', body, ...options }),

  // PATCH request
  patch: <T = any>(url: string, body?: any, options: Omit<RequestOptions, 'url' | 'method' | 'body'> = {}) =>
    request<T>({ url, method: 'PATCH', body, ...options }),

  // DELETE request
  delete: <T = any>(url: string, options: Omit<RequestOptions, 'url' | 'method'> = {}) =>
    request<T>({ url, method: 'DELETE', ...options }),

  // HEAD request
  head: (url: string, options: Omit<RequestOptions, 'url' | 'method'> = {}) =>
    request({ url, method: 'HEAD', ...options }),

  // Upload helper for multipart/form-data
  upload: <T = any>(url: string, formData: FormData, options: Omit<RequestOptions, 'url' | 'method' | 'body'> = {}) =>
    request<T>({ 
      url, 
      method: 'POST', 
      body: formData,
      // Don't set Content-Type for FormData - browser sets it with boundary
      headers: { ...options.headers },
      ...options 
    }),

  // Error handler helper for consistent error processing
  handleError: <T = any>(error: any, fallbackMessage: string = 'Request failed'): ApiResult<T> => {
    // If it's already an ApiResult with error, return it
    if (error && typeof error === 'object' && 'error' in error) {
      return error as ApiResult<T>;
    }

    // Create ApiError from various error types
    let apiError: ApiError;
    
    if (error instanceof Error) {
      apiError = createApiError(error.message, 'ERROR', error);
    } else if (typeof error === 'string') {
      apiError = createApiError(error, 'ERROR');
    } else if (error && typeof error === 'object') {
      apiError = createApiError(
        error.message || fallbackMessage,
        error.code || 'ERROR',
        error
      );
    } else {
      apiError = createApiError(fallbackMessage, 'UNKNOWN_ERROR', error);
    }

    return { error: apiError };
  }
};

// Example usage:
// import { apiClient, request } from '@/services/api'
// const result = await apiClient.get<User[]>('/users')
// if (result.error) { ... } else { console.log(result.data) }

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component (exports named functions and objects)
- [x] Adds basic ARIA and keyboard handlers (not relevant for API client)
*/
