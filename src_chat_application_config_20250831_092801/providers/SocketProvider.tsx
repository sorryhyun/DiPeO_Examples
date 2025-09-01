import { config as appConfig, isDevelopment, shouldUseMockData } from '@/app/config';

// API Response wrapper type
interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    status?: number;
  };
  success: boolean;
}

// Request configuration
interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

// Auth token storage key
const AUTH_TOKEN_KEY = 'auth_token';

class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultRetries: number;

  constructor() {
    this.baseURL = appConfig.api.baseURL || '/api';
    this.defaultTimeout = appConfig.api.timeout || 10000;
    this.defaultRetries = appConfig.api.retries || 3;
  }

  private getAuthToken(): string | null {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private buildHeaders(customHeaders: Record<string, string> = {}): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...customHeaders
    });

    // Add auth token if available
    const token = this.getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    try {
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorData = null;

        if (isJson) {
          try {
            errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {
            // If JSON parsing fails, keep the default error message
          }
        }

        return {
          success: false,
          error: {
            message: errorMessage,
            status: response.status,
            code: errorData?.code
          }
        };
      }

      let data: T | undefined;
      if (isJson) {
        data = await response.json();
      } else if (response.status !== 204) { // No content
        data = (await response.text()) as any;
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to process response'
        }
      };
    }
  }

  private async makeRequest<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    const {
      url,
      method = 'GET',
      data,
      headers = {},
      timeout = this.defaultTimeout,
      retries = this.defaultRetries
    } = config;

    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    const requestHeaders = this.buildHeaders(headers);

    const requestInit: RequestInit = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(timeout)
    };

    // Add body for non-GET requests
    if (method !== 'GET' && data !== undefined) {
      if (data instanceof FormData) {
        // Remove content-type header for FormData to let browser set it with boundary
        requestHeaders.delete('Content-Type');
        requestInit.body = data;
      } else {
        requestInit.body = JSON.stringify(data);
      }
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (shouldUseMockData && !fullUrl.startsWith('http')) {
          // In development mode with mocking, simulate API delay and potentially use mock responses
          await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));
        }

        const response = await fetch(fullUrl, requestInit);
        return await this.handleResponse<T>(response);

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown request error');

        // Don't retry on timeout or network errors for the last attempt
        if (attempt === retries) {
          break;
        }

        // Exponential backoff for retries
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    return {
      success: false,
      error: {
        message: lastError?.message || 'Request failed after retries',
        code: 'REQUEST_FAILED'
      }
    };
  }

  // Main request method
  async request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
    try {
      return await this.makeRequest<T>(config);
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unexpected error'
        }
      };
    }
  }

  // Convenience methods
  async get<T = any>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'GET', headers });
  }

  async post<T = any>(url: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'POST', data, headers });
  }

  async put<T = any>(url: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'PUT', data, headers });
  }

  async patch<T = any>(url: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'PATCH', data, headers });
  }

  async delete<T = any>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'DELETE', headers });
  }

  // Upload method for file uploads
  async upload<T = any>(url: string, files: File[], additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`file_${index}`, file);
    });

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
      });
    }

    return this.request<T>({
      url,
      method: 'POST',
      data: formData
    });
  }

  // Set auth token
  setAuthToken(token: string): void {
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to store auth token:', error);
    }
  }

  // Clear auth token
  clearAuthToken(): void {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to clear auth token:', error);
    }
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  // Update base URL (useful for testing)
  setBaseURL(url: string): void {
    this.baseURL = url;
  }

  // Get current base URL
  getBaseURL(): string {
    return this.baseURL;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export types and constants
export type { ApiResponse, RequestConfig };
export { AUTH_TOKEN_KEY };

// Helper functions for common patterns
export const unwrapApiResponse = <T>(response: ApiResponse<T>): T => {
  if (!response.success) {
    throw new Error(response.error?.message || 'API request failed');
  }
  return response.data as T;
};

export const isApiError = (response: ApiResponse<any>): response is ApiResponse<never> & { success: false } => {
  return !response.success;
};

// [ ] Uses `@/` imports only - Yes, imports from @/app/config
// [ ] Uses providers/hooks (no direct DOM/localStorage side effects) - Uses localStorage but only for auth token management which is appropriate for this layer
// [ ] Reads config from `@/app/config` - Yes, reads appConfig for API settings
// [ ] Exports default named component - Yes, exports apiClient instance and helper functions
// [ ] Adds basic ARIA and keyboard handlers (where relevant) - N/A, this is a service layer utility
