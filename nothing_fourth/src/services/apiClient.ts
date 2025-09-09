// filepath: src/services/apiClient.ts

import { config } from '@/app/config';
import { ApiResult, ApiError } from '@/core/contracts';
import { debugLog, debugWarn, debugError } from '@/core/utils';

// ===============================================
// HTTP Client Configuration
// ===============================================

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  skipAuth?: boolean;
}

export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  defaultHeaders: Record<string, string>;
}

// ===============================================
// Error Handling
// ===============================================

export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

function createApiError(
  code: string,
  message: string,
  status?: number,
  details?: Record<string, unknown>
): ApiError {
  return { code, message, details };
}

// ===============================================
// HTTP Client Implementation
// ===============================================

class HttpClient {
  private config: ApiClientConfig;
  private authToken: string | null = null;

  constructor() {
    this.config = {
      baseUrl: config.apiBaseUrl,
      timeout: 30000, // 30 seconds
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    debugLog('ApiClient', `Initialized with baseUrl: ${this.config.baseUrl}`);
  }

  // Set authentication token
  setAuthToken(token: string | null): void {
    this.authToken = token;
    debugLog('ApiClient', token ? 'Auth token set' : 'Auth token cleared');
  }

  // Get current auth token
  getAuthToken(): string | null {
    return this.authToken;
  }

  // Build URL with query parameters
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(endpoint, this.config.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    
    return url.toString();
  }

  // Build request headers
  private buildHeaders(options: RequestOptions = {}): Record<string, string> {
    const headers: Record<string, string> = {
      ...this.config.defaultHeaders,
    };

    // Add auth header if token exists and not explicitly skipped
    if (this.authToken && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    // Merge custom headers
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    return headers;
  }

  // Create fetch request with timeout
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Core request method
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
    const {
      params,
      timeout = this.config.timeout,
      ...fetchOptions
    } = options;

    const url = this.buildUrl(endpoint, params);
    const headers = this.buildHeaders(options);

    debugLog('ApiClient', `${fetchOptions.method || 'GET'} ${url}`);

    try {
      const response = await this.fetchWithTimeout(
        url,
        {
          ...fetchOptions,
          headers,
        },
        timeout
      );

      // Handle different response types
      let data: T;
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const jsonData = await response.json();
        data = jsonData as T;
      } else {
        // For non-JSON responses, return the text as data
        const textData = await response.text();
        data = textData as unknown as T;
      }

      // Handle HTTP error status codes
      if (!response.ok) {
        const error = createApiError(
          `HTTP_${response.status}`,
          `Request failed: ${response.statusText}`,
          response.status,
          { url, method: fetchOptions.method || 'GET', responseData: data }
        );

        debugError('ApiClient', `HTTP ${response.status} error:`, error);
        
        return {
          success: false,
          error,
        };
      }

      debugLog('ApiClient', `✓ ${fetchOptions.method || 'GET'} ${url} - Success`);

      return {
        success: true,
        data,
      };

    } catch (error: unknown) {
      // Handle network errors, timeouts, and other fetch failures
      let apiError: ApiError;

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          apiError = createApiError(
            'TIMEOUT',
            `Request timeout after ${timeout}ms`,
            408,
            { url, timeout }
          );
        } else if (error.message.includes('fetch')) {
          apiError = createApiError(
            'NETWORK_ERROR',
            'Network request failed',
            0,
            { url, originalError: error.message }
          );
        } else {
          apiError = createApiError(
            'REQUEST_ERROR',
            error.message,
            0,
            { url, originalError: error.message }
          );
        }
      } else {
        apiError = createApiError(
          'UNKNOWN_ERROR',
          'An unknown error occurred',
          0,
          { url, error }
        );
      }

      debugError('ApiClient', 'Request failed:', apiError);

      return {
        success: false,
        error: apiError,
      };
    }
  }

  // Convenience methods
  async get<T>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// ===============================================
// Singleton Instance & Exports
// ===============================================

export const apiClient = new HttpClient();

// Convenience function for direct JSON fetching (legacy compatibility)
export async function fetchJson<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const result = await apiClient.request<T>(endpoint, options);
  
  if (!result.success) {
    throw new ApiClientError(
      result.error!.code,
      result.error!.message,
      (result.error!.details as any)?.status,
      result.error!.details
    );
  }
  
  return result.data!;
}

// Export default for convenience
export default apiClient;

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (N/A - this is a service layer)
*/
