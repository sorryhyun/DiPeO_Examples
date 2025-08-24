import type { ApiResponse } from '@/types';

// Base error type for API errors
export class BaseError extends Error {
  public readonly status: number;
  public readonly response?: Response;

  constructor(message: string, status: number, response?: Response) {
    super(message);
    this.name = 'BaseError';
    this.status = status;
    this.response = response;
  }
}

// In-memory auth token storage
let authToken: string | null = null;

// Base API URL - can be overridden via environment variable
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Sets the auth token to be included in subsequent API requests
 */
export const setAuthToken = (token: string | null): void => {
  authToken = token;
};

/**
 * Generic API request helper that wraps fetch with typed responses
 */
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${BASE_URL}${endpoint}`;
  
  // Prepare headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle non-2xx responses
    if (!response.ok) {
      const errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      throw new BaseError(errorMessage, response.status, response);
    }

    // Parse JSON response
    const data = await response.json();

    return {
      data,
      status: response.status,
    };
  } catch (error) {
    // Re-throw BaseError as-is
    if (error instanceof BaseError) {
      throw error;
    }

    // Wrap other errors in BaseError
    throw new BaseError(
      error instanceof Error ? error.message : 'Unknown API error',
      0
    );
  }
};

/**
 * Typed GET request helper
 */
export const apiGet = async <T>(endpoint: string): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, {
    method: 'GET',
  });
};

/**
 * Typed POST request helper
 */
export const apiPost = async <T, B = unknown>(
  endpoint: string,
  body?: B
): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
};

/**
 * Typed PUT request helper
 */
export const apiPut = async <T, B = unknown>(
  endpoint: string,
  body?: B
): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
};

/**
 * Typed DELETE request helper
 */
export const apiDelete = async <T>(endpoint: string): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, {
    method: 'DELETE',
  });
};
