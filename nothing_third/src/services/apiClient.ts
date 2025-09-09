// filepath: src/services/apiClient.ts
import type { ApiResult } from '@/core/contracts';
import { config } from '@/app/config';
import { generateId } from '@/core/utils';

export class ApiError extends Error {
  public readonly code: string;
  public readonly status?: number;
  public readonly response?: Response;

  constructor(message: string, code: string, status?: number, response?: Response) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.response = response;
    
    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  public static fromResponse(response: Response, message?: string): ApiError {
    const errorMessage = message || `HTTP ${response.status}: ${response.statusText}`;
    const errorCode = `HTTP_${response.status}`;
    
    return new ApiError(errorMessage, errorCode, response.status, response);
  }

  public static fromNetworkError(error: Error): ApiError {
    return new ApiError(
      `Network error: ${error.message}`,
      'NETWORK_ERROR',
      undefined,
      undefined
    );
  }

  public static fromTimeout(): ApiError {
    return new ApiError(
      'Request timeout',
      'TIMEOUT',
      408
    );
  }

  public static fromAbort(): ApiError {
    return new ApiError(
      'Request aborted',
      'ABORTED',
      0
    );
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  signal?: AbortSignal;
  baseURL?: string;
}

export interface ApiClientConfig {
  baseURL: string;
  defaultHeaders: Record<string, string>;
  timeout: number;
  retries: number;
  retryDelay: number;
}

class ApiClientCore {
  private readonly config: ApiClientConfig;

  constructor(clientConfig?: Partial<ApiClientConfig>) {
    this.config = {
      baseURL: config.apiBaseUrl,
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: config.requestTimeoutMs,
      retries: 3,
      retryDelay: 1000,
      ...clientConfig
    };
  }

  /**
   * Make a typed HTTP request
   */
  public async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResult<T>> {
    const requestId = generateId('req');
    const startTime = performance.now();

    try {
      // Construct full URL
      const baseURL = options.baseURL ?? this.config.baseURL;
      const url = new URL(endpoint, baseURL).toString();

      // Prepare headers
      const headers = new Headers({
        ...this.config.defaultHeaders,
        ...options.headers
      });

      // Add request ID for tracing
      headers.set('X-Request-ID', requestId);

      // Prepare request body
      let body: string | FormData | undefined;
      if (options.body !== undefined) {
        if (options.body instanceof FormData) {
          body = options.body;
          // Remove content-type to let browser set boundary for FormData
          headers.delete('Content-Type');
        } else {
          body = JSON.stringify(options.body);
        }
      }

      // Setup timeout and abort signal
      const timeout = options.timeout ?? this.config.timeout;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Combine signals if external signal provided
      let signal = controller.signal;
      if (options.signal) {
        // Create a combined signal that aborts when either signal aborts
        const combinedController = new AbortController();
        
        const abortHandler = () => combinedController.abort();
        controller.signal.addEventListener('abort', abortHandler);
        options.signal.addEventListener('abort', abortHandler);
        
        signal = combinedController.signal;
      }

      // Make the request
      const response = await fetch(url, {
        method: options.method ?? 'GET',
        headers,
        body,
        signal
      });

      clearTimeout(timeoutId);

      // Handle response
      if (!response.ok) {
        const errorResult = await this.handleErrorResponse<T>(response);
        return errorResult;
      }

      // Parse successful response
      const data = await this.parseResponse<T>(response);
      const duration = performance.now() - startTime;

      // Log success in development
      if (config.isDevelopment) {
        console.debug(`API Request [${requestId}]:`, {
          method: options.method ?? 'GET',
          url,
          status: response.status,
          duration: `${duration.toFixed(2)}ms`
        });
      }

      return {
        success: true,
        data,
        meta: {
          requestId,
          status: response.status,
          duration
        }
      };

    } catch (error) {
      const duration = performance.now() - startTime;

      // Handle different types of errors
      let apiError: ApiError;
      
      if (error instanceof ApiError) {
        apiError = error;
      } else if (error instanceof Error) {
        if (error.name === 'AbortError') {
          apiError = options.signal?.aborted 
            ? ApiError.fromAbort()
            : ApiError.fromTimeout();
        } else {
          apiError = ApiError.fromNetworkError(error);
        }
      } else {
        apiError = new ApiError('Unknown error occurred', 'UNKNOWN_ERROR');
      }

      // Log error in development
      if (config.isDevelopment) {
        console.error(`API Request Failed [${requestId}]:`, {
          method: options.method ?? 'GET',
          endpoint,
          error: apiError.message,
          code: apiError.code,
          duration: `${duration.toFixed(2)}ms`
        });
      }

      return {
        success: false,
        error: {
          message: apiError.message,
          code: apiError.code,
          details: apiError.status ? { status: apiError.status } : undefined
        },
        meta: {
          requestId,
          duration
        }
      };
    }
  }

  /**
   * Handle error responses
   */
  private async handleErrorResponse<T>(response: Response): Promise<ApiResult<T>> {
    try {
      // Try to parse error response body
      const contentType = response.headers.get('content-type');
      let errorData: any = null;

      if (contentType?.includes('application/json')) {
        try {
          errorData = await response.json();
        } catch {
          // Ignore JSON parse errors
        }
      } else {
        try {
          errorData = { message: await response.text() };
        } catch {
          // Ignore text parse errors
        }
      }

      // Extract error information
      const message = errorData?.message || 
                    errorData?.error || 
                    response.statusText || 
                    `HTTP ${response.status}`;
      
      const code = errorData?.code || 
                  errorData?.error_code ||
                  `HTTP_${response.status}`;

      return {
        success: false,
        error: {
          message,
          code,
          details: {
            status: response.status,
            statusText: response.statusText,
            ...errorData
          }
        }
      };

    } catch {
      // Fallback if we can't parse the error response
      return {
        success: false,
        error: {
          message: `HTTP ${response.status}: ${response.statusText}`,
          code: `HTTP_${response.status}`,
          details: { status: response.status }
        }
      };
    }
  }

  /**
   * Parse successful response
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    // Handle empty responses
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null as T;
    }

    // Parse JSON responses
    if (contentType?.includes('application/json')) {
      return await response.json();
    }

    // Parse text responses
    if (contentType?.includes('text/')) {
      return await response.text() as T;
    }

    // Parse blob for other content types
    return await response.blob() as T;
  }

  /**
   * Convenience methods for common HTTP verbs
   */
  public async get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public async post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  public async put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  public async patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  public async delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Set authentication token
   */
  public setAuthToken(token: string | null): void {
    if (token) {
      this.config.defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.config.defaultHeaders['Authorization'];
    }
  }

  /**
   * Set default header
   */
  public setHeader(key: string, value: string | null): void {
    if (value) {
      this.config.defaultHeaders[key] = value;
    } else {
      delete this.config.defaultHeaders[key];
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): ApiClientConfig {
    return { ...this.config };
  }
}

// Create default instance
export const apiClient = new ApiClientCore();

/**
 * Simple fetcher function for use with React Query or SWR
 * @param endpoint - API endpoint
 * @param options - Request options
 * @returns Promise that resolves to the response data or throws ApiError
 */
export async function fetcher<T = unknown>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  const result = await apiClient.request<T>(endpoint, options);
  
  if (!result.success) {
    throw new ApiError(
      result.error.message,
      result.error.code,
      result.error.details?.status
    );
  }
  
  return result.data;
}

// Export types for external use
export type { RequestOptions, ApiClientConfig };

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/core/contracts, @/app/config, @/core/utils)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - pure HTTP client
- [x] Reads config from `@/app/config` (uses config.apiBaseUrl and config.requestTimeoutMs)
- [x] Exports default named component (exports apiClient, fetcher, ApiError)
- [x] Adds basic ARIA and keyboard handlers (N/A for API client service)
*/
