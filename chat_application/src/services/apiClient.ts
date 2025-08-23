import { devConfig } from '../config/devConfig';
import { mockServer } from './mock/mockServer';

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError extends Error {
  status: number;
  message: string;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  getAuthToken?: () => string | null;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  onUploadProgress?: (progressEvent: any) => void;
}

class ApiClient {
  private getHeaders(getAuthToken?: () => string | null): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Try to get token from provided function, fallback to localStorage in dev
    let token: string | null = null;
    if (getAuthToken) {
      token = getAuthToken();
    } else if (devConfig.enable_mock_data) {
      token = localStorage.getItem('mock_token');
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleRequest<T>(
    path: string,
    method: HttpMethod,
    body?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    // In dev mode with mock data enabled, use mock server
    if (devConfig.enable_mock_data) {
      try {
        const response = await mockServer.handle(path, method, body);
        return response as ApiResponse<T>;
      } catch (error) {
        const apiError = new Error(error instanceof Error ? error.message : 'Mock server error') as ApiError;
        apiError.status = 500;
        throw apiError;
      }
    }

    // Production fetch implementation
    try {
      const headers = this.getHeaders(options?.getAuthToken);
      
      const fetchOptions: RequestInit = {
        method,
        headers,
      };

      if (body && (method === 'POST' || method === 'PUT')) {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(path, fetchOptions);

      if (!response.ok) {
        const errorText = await response.text();
        const apiError = new Error(errorText || `HTTP ${response.status}`) as ApiError;
        apiError.status = response.status;
        throw apiError;
      }

      const data = await response.json();
      return {
        data,
        success: true,
      };
    } catch (error) {
      if (error instanceof Error && 'status' in error) {
        throw error;
      }
      
      const apiError = new Error(error instanceof Error ? error.message : 'Network error') as ApiError;
      apiError.status = 0;
      throw apiError;
    }
  }

  async get<T = any>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.handleRequest<T>(path, 'GET', undefined, options);
  }

  async post<T = any>(path: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.handleRequest<T>(path, 'POST', body, options);
  }

  async put<T = any>(path: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.handleRequest<T>(path, 'PUT', body, options);
  }

  async delete<T = any>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.handleRequest<T>(path, 'DELETE', undefined, options);
  }
}

export const api = new ApiClient();
export const apiClient = api;
