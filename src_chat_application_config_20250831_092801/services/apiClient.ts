import { ApiResult, ApiError } from '@/core/contracts';
import { appConfig, shouldUseMockData, isDevelopment } from '@/app/config';
import { runHook } from '@/core/hooks';
import { debugLog } from '@/core/utils';

// Request configuration interface
export interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  timeout?: number;
}

// Response wrapper
interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

// Auth token provider interface (to avoid circular dependency)
interface AuthTokenProvider {
  getToken(): string | null;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private authTokenProvider: AuthTokenProvider | null = null;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Set auth token provider to avoid circular dependency with AuthProvider
  setAuthTokenProvider(provider: AuthTokenProvider): void {
    this.authTokenProvider = provider;
  }

  // Build full URL with query parameters
  private buildUrl(url: string, params?: Record<string, string>): string {
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    
    if (!params) return fullUrl;
    
    const searchParams = new URLSearchParams(params);
    const separator = fullUrl.includes('?') ? '&' : '?';
    return `${fullUrl}${separator}${searchParams.toString()}`;
  }

  // Build headers with auth token
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    // Add auth token if available
    const token = this.authTokenProvider?.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  // Convert fetch Response to ApiResponse
  private async parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
    let data: T;
    
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else if (contentType.includes('text/')) {
      data = (await response.text()) as T;
    } else {
      data = (await response.blob()) as T;
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  // Main request method
  async request<T = any>(config: RequestConfig): Promise<ApiResult<T>> {
    const {
      url,
      method = 'GET',
      data,
      headers: customHeaders,
      params,
      timeout = 10000,
    } = config;

    const fullUrl = this.buildUrl(url, params);
    const headers = this.buildHeaders(customHeaders);

    // Run before request hooks
    await runHook('beforeApiRequest', {
      url: fullUrl,
      method,
      headers,
      body: data,
    });

    debugLog('debug', `API Request: ${method} ${fullUrl}`, { data, headers });

    try {
      // Set up AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const fetchOptions: RequestInit = {
        method,
        headers,
        signal: controller.signal,
      };

      // Add body for methods that support it
      if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
        fetchOptions.body = typeof data === 'string' ? data : JSON.stringify(data);
      }

      const response = await fetch(fullUrl, fetchOptions);
      clearTimeout(timeoutId);

      const apiResponse = await this.parseResponse<T>(response);

      // Run after response hooks
      await runHook('afterApiResponse', {
        url: fullUrl,
        method,
        status: response.status,
        body: apiResponse.data,
      });

      debugLog('debug', `API Response: ${method} ${fullUrl}`, {
        status: response.status,
        data: apiResponse.data,
      });

      if (!response.ok) {
        const error: ApiError = {
          code: response.status.toString(),
          message: response.statusText || 'Request failed',
          details: apiResponse.data,
        };

        return { ok: false, error };
      }

      return { ok: true, data: apiResponse.data };
    } catch (err) {
      debugLog('error', `API Error: ${method} ${fullUrl}`, err);

      // Handle different error types
      let error: ApiError;
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          error = {
            code: 'TIMEOUT',
            message: 'Request timeout',
            details: { timeout },
          };
        } else if (err.message.includes('Failed to fetch')) {
          error = {
            code: 'NETWORK_ERROR',
            message: 'Network error or server unavailable',
            details: { originalError: err.message },
          };
        } else {
          error = {
            code: 'REQUEST_ERROR',
            message: err.message,
            details: { originalError: err },
          };
        }
      } else {
        error = {
          code: 'UNKNOWN_ERROR',
          message: 'An unknown error occurred',
          details: { originalError: err },
        };
      }

      // In development with mock data, suggest checking mock server
      if (isDevelopment && shouldUseMockData && error.code === 'NETWORK_ERROR') {
        error.message += ' (Check if mock server is running)';
      }

      return { ok: false, error };
    }
  }

  // Convenience methods
  async get<T = any>(url: string, params?: Record<string, string>): Promise<ApiResult<T>> {
    return this.request<T>({ url, method: 'GET', params });
  }

  async post<T = any>(url: string, data?: any): Promise<ApiResult<T>> {
    return this.request<T>({ url, method: 'POST', data });
  }

  async put<T = any>(url: string, data?: any): Promise<ApiResult<T>> {
    return this.request<T>({ url, method: 'PUT', data });
  }

  async patch<T = any>(url: string, data?: any): Promise<ApiResult<T>> {
    return this.request<T>({ url, method: 'PATCH', data });
  }

  async delete<T = any>(url: string): Promise<ApiResult<T>> {
    return this.request<T>({ url, method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export convenience functions that use the singleton
export const get = apiClient.get.bind(apiClient);
export const post = apiClient.post.bind(apiClient);
export const put = apiClient.put.bind(apiClient);
export const patch = apiClient.patch.bind(apiClient);
export const del = apiClient.delete.bind(apiClient);

// Export the class for testing or custom instances
export { ApiClient };

// Export types
export type { RequestConfig, AuthTokenProvider };

// [ ] Uses `@/` imports only - Yes, all imports use the @/ alias
// [ ] Uses providers/hooks (no direct DOM/localStorage side effects) - Yes, uses hook registry and avoids direct side effects
// [ ] Reads config from `@/app/config` - Yes, imports and uses appConfig flags
// [ ] Exports default named component - Yes, exports apiClient singleton and helper functions
// [ ] Adds basic ARIA and keyboard handlers (where relevant) - N/A for service layer
