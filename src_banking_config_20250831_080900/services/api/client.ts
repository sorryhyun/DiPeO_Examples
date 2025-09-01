import { appConfig } from '@/app/config';
import { defaultEventBus } from '@/core/events';
import type { ApiResponse, ApiError } from '@/core/contracts';

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  defaultHeaders: Record<string, string>;
}

class ApiClient {
  private config: ApiClientConfig;
  private authToken: string | null = null;

  constructor(config: ApiClientConfig) {
    this.config = config;
  }

  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  private async executeRequest<T>(
    url: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const fullUrl = url.startsWith('http') ? url : `${this.config.baseUrl}${url}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config.defaultHeaders,
      ...config.headers,
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    const requestConfig: RequestInit = {
      method: config.method || 'GET',
      headers,
      signal: AbortSignal.timeout(config.timeout || this.config.timeout),
    };

    if (config.body && config.method !== 'GET') {
      requestConfig.body = typeof config.body === 'string' 
        ? config.body 
        : JSON.stringify(config.body);
    }

    // Emit beforeApiRequest hook
    await defaultEventBus.emit('api.beforeRequest', {
      url: fullUrl,
      method: config.method || 'GET',
      headers,
      body: config.body,
    });

    const startTime = Date.now();

    try {
      const response = await fetch(fullUrl, requestConfig);
      const elapsedMs = Date.now() - startTime;

      let data: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Emit afterApiResponse hook
      await defaultEventBus.emit('api.afterResponse', {
        url: fullUrl,
        status: response.status,
        response: data,
        elapsedMs,
      });

      if (!response.ok) {
        const error: ApiError = {
          message: data?.message || response.statusText || 'Request failed',
          status: response.status,
          code: data?.code,
          details: data?.details,
        };

        return { data: undefined, error };
      }

      return { data, error: null };
    } catch (err) {
      const elapsedMs = Date.now() - startTime;
      
      let error: ApiError;
      if (err instanceof Error) {
        if (err.name === 'TimeoutError' || err.name === 'AbortError') {
          error = {
            message: 'Request timeout',
            status: 408,
            code: 'TIMEOUT',
          };
        } else if (err.message.includes('fetch')) {
          error = {
            message: 'Network error',
            status: 0,
            code: 'NETWORK_ERROR',
          };
        } else {
          error = {
            message: err.message,
            status: 0,
            code: 'UNKNOWN_ERROR',
          };
        }
      } else {
        error = {
          message: 'Unknown error occurred',
          status: 0,
          code: 'UNKNOWN_ERROR',
        };
      }

      // Emit afterApiResponse hook for errors
      await defaultEventBus.emit('api.afterResponse', {
        url: fullUrl,
        status: error.status || 0,
        response: null,
        elapsedMs,
        error,
      });

      // Emit error event
      defaultEventBus.emit('error.reported', { error: err, context: { url: fullUrl } });

      return { data: undefined, error };
    }
  }

  async get<T>(url: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(url, { ...config, method: 'GET' });
  }

  async post<T>(url: string, body?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(url, { ...config, method: 'POST', body });
  }

  async put<T>(url: string, body?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(url, { ...config, method: 'PUT', body });
  }

  async patch<T>(url: string, body?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(url, { ...config, method: 'PATCH', body });
  }

  async delete<T>(url: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(url, { ...config, method: 'DELETE' });
  }
}

// Create singleton instance
export const apiClient = new ApiClient({
  baseUrl: appConfig.apiBaseUrl,
  timeout: 30000, // 30 seconds
  defaultHeaders: {
    'Accept': 'application/json',
  },
});

// Convenience function for direct requests
export async function request<T>(
  url: string,
  config?: RequestConfig
): Promise<ApiResponse<T>> {
  return apiClient.get<T>(url, config);
}

// Export auth token setter
export function setAuthToken(token: string | null): void {
  apiClient.setAuthToken(token);
}

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component - N/A (service module)
// [x] Adds basic ARIA and keyboard handlers (where relevant) - N/A (service module)
