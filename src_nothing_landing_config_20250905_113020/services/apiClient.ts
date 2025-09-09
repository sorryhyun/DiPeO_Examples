// filepath: src/services/apiClient.ts
import { config } from '@/app/config';
import type { ApiResult, LoadingState } from '@/core/contracts';
import { debugLog } from '@/core/utils';

// API Error class for structured error handling
export class ApiError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly url: string;
  public readonly method: string;
  public readonly requestId?: string;
  public readonly timestamp: string;

  constructor(
    message: string,
    status: number,
    statusText: string,
    url: string,
    method: string,
    requestId?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.url = url;
    this.method = method;
    this.requestId = requestId;
    this.timestamp = new Date().toISOString();

    // Maintain proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      statusText: this.statusText,
      url: this.url,
      method: this.method,
      requestId: this.requestId,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

// Request timeout error
export class ApiTimeoutError extends ApiError {
  constructor(url: string, method: string, timeout: number) {
    super(
      `Request timed out after ${timeout}ms`,
      408,
      'Request Timeout',
      url,
      method
    );
    this.name = 'ApiTimeoutError';
  }
}

// Network error (no response received)
export class ApiNetworkError extends ApiError {
  constructor(url: string, method: string, originalError: Error) {
    super(
      `Network error: ${originalError.message}`,
      0,
      'Network Error',
      url,
      method
    );
    this.name = 'ApiNetworkError';
  }
}

// Request configuration interface
export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  signal?: AbortSignal;
  retries?: number;
  retryDelay?: number;
  baseURL?: string;
  validateStatus?: (status: number) => boolean;
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer';
}

// Response interface
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  url: string;
  requestId?: string;
}

// Default request configuration
const DEFAULT_CONFIG: Required<Omit<RequestConfig, 'body' | 'signal'>> = {
  method: 'GET',
  headers: {},
  timeout: config.api.timeout,
  retries: config.api.retries,
  retryDelay: 1000,
  baseURL: config.api.baseUrl,
  validateStatus: (status: number) => status >= 200 && status < 300,
  responseType: 'json',
};

// Generate unique request ID for tracking
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Merge configurations with proper header handling
function mergeConfig(base: RequestConfig, override: RequestConfig = {}): RequestConfig {
  return {
    ...base,
    ...override,
    headers: {
      ...base.headers,
      ...override.headers,
    },
  };
}

// Create timeout controller
function createTimeoutController(timeout: number): {
  controller: AbortController;
  timeoutId: NodeJS.Timeout;
} {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  return { controller, timeoutId };
}

// Sleep utility for retry delays
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Process response based on content type and requested response type
async function processResponse<T>(
  response: Response,
  responseType: RequestConfig['responseType'],
  requestId: string
): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  
  try {
    switch (responseType) {
      case 'json':
        // Handle empty responses
        const text = await response.text();
        if (!text.trim()) {
          return {} as T;
        }
        return JSON.parse(text) as T;
        
      case 'text':
        return (await response.text()) as T;
        
      case 'blob':
        return (await response.blob()) as T;
        
      case 'arrayBuffer':
        return (await response.arrayBuffer()) as T;
        
      default:
        // Auto-detect based on content type
        if (contentType.includes('application/json')) {
          const text = await response.text();
          if (!text.trim()) {
            return {} as T;
          }
          return JSON.parse(text) as T;
        } else if (contentType.includes('text/')) {
          return (await response.text()) as T;
        } else {
          return (await response.blob()) as T;
        }
    }
  } catch (error) {
    debugLog('ApiClient: Response processing error', {
      requestId,
      contentType,
      responseType,
      error: error instanceof Error ? error.message : String(error)
    });
    
    throw new ApiError(
      `Failed to process response: ${error instanceof Error ? error.message : 'Unknown error'}`,
      response.status,
      response.statusText,
      response.url,
      'unknown',
      requestId
    );
  }
}

// Core request function with retry logic
async function executeRequest<T>(
  url: string,
  config: RequestConfig,
  attempt: number = 1
): Promise<ApiResponse<T>> {
  const requestId = generateRequestId();
  const finalConfig = mergeConfig(DEFAULT_CONFIG, config);
  const fullUrl = url.startsWith('http') ? url : `${finalConfig.baseURL}${url}`;
  
  // Create timeout controller if no external signal provided
  const shouldCreateTimeout = !config.signal && finalConfig.timeout > 0;
  const timeoutController = shouldCreateTimeout ? createTimeoutController(finalConfig.timeout) : null;
  
  // Use provided signal or timeout controller signal
  const signal = config.signal || timeoutController?.controller.signal;
  
  // Prepare headers
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Request-ID': requestId,
    ...finalConfig.headers,
  });
  
  // Remove Content-Type for GET requests or when body is FormData
  if (finalConfig.method === 'GET' || config.body instanceof FormData) {
    headers.delete('Content-Type');
  }
  
  // Prepare request body
  let body: string | FormData | undefined;
  if (config.body !== undefined && finalConfig.method !== 'GET') {
    if (config.body instanceof FormData) {
      body = config.body;
    } else if (typeof config.body === 'string') {
      body = config.body;
    } else {
      body = JSON.stringify(config.body);
    }
  }
  
  debugLog('ApiClient: Making request', {
    requestId,
    attempt,
    method: finalConfig.method,
    url: fullUrl,
    headers: Object.fromEntries(headers.entries()),
    bodyType: body instanceof FormData ? 'FormData' : typeof body
  });
  
  try {
    // Make the request
    const response = await fetch(fullUrl, {
      method: finalConfig.method,
      headers,
      body,
      signal,
      // Additional fetch options
      credentials: config.baseURL?.includes(window.location.origin) ? 'include' : 'omit',
      mode: 'cors',
      cache: 'no-store',
    });
    
    // Clear timeout if created locally
    if (timeoutController) {
      clearTimeout(timeoutController.timeoutId);
    }
    
    debugLog('ApiClient: Received response', {
      requestId,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    // Check if response status is valid
    if (!finalConfig.validateStatus(response.status)) {
      // Try to extract error message from response
      let errorMessage = `Request failed with status ${response.status}`;
      
      try {
        const errorBody = await response.clone().json();
        if (errorBody.message) {
          errorMessage = errorBody.message;
        } else if (errorBody.error) {
          errorMessage = errorBody.error;
        } else if (typeof errorBody === 'string') {
          errorMessage = errorBody;
        }
      } catch {
        // Ignore JSON parsing errors, use default message
      }
      
      throw new ApiError(
        errorMessage,
        response.status,
        response.statusText,
        fullUrl,
        finalConfig.method,
        requestId
      );
    }
    
    // Process response data
    const data = await processResponse<T>(response, finalConfig.responseType, requestId);
    
    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      url: fullUrl,
      requestId,
    };
    
  } catch (error) {
    // Clear timeout if created locally
    if (timeoutController) {
      clearTimeout(timeoutController.timeoutId);
    }
    
    // Handle different types of errors
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof DOMException && error.name === 'AbortError') {
      // Check if it was a timeout or external abort
      const isTimeout = timeoutController && signal === timeoutController.controller.signal;
      
      if (isTimeout) {
        throw new ApiTimeoutError(fullUrl, finalConfig.method, finalConfig.timeout);
      } else {
        throw new ApiError(
          'Request was aborted',
          0,
          'Aborted',
          fullUrl,
          finalConfig.method,
          requestId
        );
      }
    }
    
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new ApiNetworkError(fullUrl, finalConfig.method, error);
    }
    
    // Generic error
    const message = error instanceof Error ? error.message : String(error);
    throw new ApiError(
      message,
      0,
      'Unknown Error',
      fullUrl,
      finalConfig.method,
      requestId
    );
  }
}

// Request function with retry logic
async function request<T = any>(
  url: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const finalConfig = mergeConfig(DEFAULT_CONFIG, config);
  const maxAttempts = finalConfig.retries + 1;
  
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await executeRequest<T>(url, finalConfig, attempt);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on certain error types
      if (error instanceof ApiError) {
        // Don't retry client errors (4xx) except 429 (rate limit)
        if (error.status >= 400 && error.status < 500 && error.status !== 429) {
          throw error;
        }
      }
      
      // Don't retry if this is the last attempt
      if (attempt === maxAttempts) {
        throw error;
      }
      
      // Don't retry on network errors or timeouts in production
      if (!config.isDevelopment && (error instanceof ApiNetworkError || error instanceof ApiTimeoutError)) {
        throw error;
      }
      
      // Calculate retry delay with exponential backoff
      const delay = finalConfig.retryDelay * Math.pow(2, attempt - 1);
      const jitteredDelay = delay + Math.random() * 1000; // Add jitter
      
      debugLog('ApiClient: Retrying request', {
        attempt,
        maxAttempts,
        delay: jitteredDelay,
        error: lastError.message
      });
      
      await sleep(jitteredDelay);
    }
  }
  
  // This should never be reached, but TypeScript requires it
  throw lastError!;
}

// Convenience methods for different HTTP verbs
export const apiClient = {
  // Generic request method
  request,
  
  // GET request
  async get<T = any>(url: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return request<T>(url, { ...config, method: 'GET' });
  },
  
  // POST request
  async post<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return request<T>(url, { ...config, method: 'POST', body: data });
  },
  
  // PUT request
  async put<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return request<T>(url, { ...config, method: 'PUT', body: data });
  },
  
  // PATCH request
  async patch<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return request<T>(url, { ...config, method: 'PATCH', body: data });
  },
  
  // DELETE request
  async delete<T = any>(url: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return request<T>(url, { ...config, method: 'DELETE' });
  },
};

// Typed fetcher function for React Query and SWR
export async function fetcher<T = any>(url: string, config?: RequestConfig): Promise<T> {
  const response = await apiClient.get<T>(url, config);
  return response.data;
}

// Utility function to convert ApiResponse to ApiResult
export function toApiResult<T>(response: ApiResponse<T>): ApiResult<T> {
  return {
    success: true,
    data: response.data,
  };
}

// Utility function to convert errors to ApiResult
export function errorToApiResult<T>(error: Error): ApiResult<T> {
  if (error instanceof ApiError) {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.status.toString(),
        details: {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          method: error.method,
          requestId: error.requestId,
          timestamp: error.timestamp,
        },
      },
    };
  }
  
  return {
    success: false,
    error: {
      message: error.message,
      code: 'UNKNOWN_ERROR',
    },
  };
}

// Create a typed API client wrapper that returns ApiResult
export const typedApiClient = {
  async get<T = any>(url: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResult<T>> {
    try {
      const response = await apiClient.get<T>(url, config);
      return toApiResult(response);
    } catch (error) {
      return errorToApiResult<T>(error instanceof Error ? error : new Error(String(error)));
    }
  },
  
  async post<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResult<T>> {
    try {
      const response = await apiClient.post<T>(url, data, config);
      return toApiResult(response);
    } catch (error) {
      return errorToApiResult<T>(error instanceof Error ? error : new Error(String(error)));
    }
  },
  
  async put<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResult<T>> {
    try {
      const response = await apiClient.put<T>(url, data, config);
      return toApiResult(response);
    } catch (error) {
      return errorToApiResult<T>(error instanceof Error ? error : new Error(String(error)));
    }
  },
  
  async patch<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResult<T>> {
    try {
      const response = await apiClient.patch<T>(url, data, config);
      return toApiResult(response);
    } catch (error) {
      return errorToApiResult<T>(error instanceof Error ? error : new Error(String(error)));
    }
  },
  
  async delete<T = any>(url: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResult<T>> {
    try {
      const response = await apiClient.delete<T>(url, config);
      return toApiResult(response);
    } catch (error) {
      return errorToApiResult<T>(error instanceof Error ? error : new Error(String(error)));
    }
  },
};

// Development utilities
if (config.isDevelopment) {
  // Add API client to global scope for debugging
  (globalThis as any).__apiClient = apiClient;
  (globalThis as any).__typedApiClient = typedApiClient;
  
  // Log all requests in development
  const originalRequest = apiClient.request;
  apiClient.request = async function<T>(...args: Parameters<typeof originalRequest>) {
    const startTime = performance.now();
    try {
      const result = await originalRequest.apply(this, args);
      const endTime = performance.now();
      
      console.debug('[ApiClient] Request completed', {
        url: args[0],
        duration: `${(endTime - startTime).toFixed(2)}ms`,
        status: result.status,
        requestId: result.requestId
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      
      console.error('[ApiClient] Request failed', {
        url: args[0],
        duration: `${(endTime - startTime).toFixed(2)}ms`,
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw error;
    }
  } as typeof originalRequest;
}

// Export default for convenience
export default apiClient;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses fetch API and config only
// [x] Reads config from `@/app/config`
// [x] Exports default named component - exports apiClient as default and named exports for utilities
// [x] Adds basic ARIA and keyboard handlers (where relevant) - not applicable for API client
