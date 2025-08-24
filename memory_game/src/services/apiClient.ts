import { ApiResponse, ApiError } from '../types/index';
import mockServer from './mockServer';

// Configuration for enabling mock mode
// Always use mock data since there's no backend server
const ENABLE_MOCK = true;

// Default timeout for requests
const DEFAULT_TIMEOUT = 10000;

// Base URL for API requests
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Handle fetch response and convert to ApiResponse format
 */
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      );
    }

    const data = await response.json();
    return {
      success: true,
      data,
      status: response.status
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(
      error instanceof Error ? error.message : 'Failed to parse response',
      response.status || 500
    );
  }
}

/**
 * Create fetch request with timeout and default headers
 */
async function createRequest(
  url: string,
  options: RequestInit = {},
  timeout: number = DEFAULT_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: controller.signal,
    });

    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Build URL with query parameters
 */
function buildUrl(path: string, params?: Record<string, any>): string {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  
  if (!params || Object.keys(params).length === 0) {
    return url;
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value));
    }
  });

  return `${url}?${searchParams.toString()}`;
}

/**
 * GET request
 */
export async function get<T>(
  path: string,
  params?: Record<string, any>,
  timeout?: number
): Promise<ApiResponse<T>> {
  try {
    // Use mock server in development mode
    if (ENABLE_MOCK) {
      return await mockServer.request<T>(path, 'GET', params);
    }

    const url = buildUrl(path, params);
    const response = await createRequest(url, { method: 'GET' }, timeout);
    return await handleResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'GET request failed',
      500
    );
  }
}

/**
 * POST request
 */
export async function post<T>(
  path: string,
  body?: any,
  timeout?: number
): Promise<ApiResponse<T>> {
  try {
    // Use mock server in development mode
    if (ENABLE_MOCK) {
      return await mockServer.request<T>(path, 'POST', body);
    }

    const url = buildUrl(path);
    const response = await createRequest(
      url,
      {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      },
      timeout
    );
    return await handleResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'POST request failed',
      500
    );
  }
}

/**
 * PUT request
 */
export async function put<T>(
  path: string,
  body?: any,
  timeout?: number
): Promise<ApiResponse<T>> {
  try {
    // Use mock server in development mode
    if (ENABLE_MOCK) {
      return await mockServer.request<T>(path, 'PUT', body);
    }

    const url = buildUrl(path);
    const response = await createRequest(
      url,
      {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      },
      timeout
    );
    return await handleResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'PUT request failed',
      500
    );
  }
}

/**
 * DELETE request
 */
export async function del<T>(
  path: string,
  timeout?: number
): Promise<ApiResponse<T>> {
  try {
    // Use mock server in development mode
    if (ENABLE_MOCK) {
      return await mockServer.request<T>(path, 'DELETE');
    }

    const url = buildUrl(path);
    const response = await createRequest(url, { method: 'DELETE' }, timeout);
    return await handleResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'DELETE request failed',
      500
    );
  }
}

/**
 * Export all HTTP methods as default object
 */
export const apiClient = {
  get,
  post,
  put,
  delete: del,
};
