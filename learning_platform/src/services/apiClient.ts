import { ApiError } from '../types';

/**
 * Creates an API client with typed methods for HTTP operations
 */
function createApiClient(getToken?: () => string | undefined) {
  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  async function request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = getToken?.();
    const headers = {
      ...baseHeaders,
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      const response = await fetch(endpoint, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorData: any = null;

        try {
          errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Response doesn't contain JSON, use default message
        }

        const error: ApiError = {
          code: response.status.toString(),
          message: errorMessage,
          details: errorData,
          timestamp: new Date().toISOString(),
          status: response.status
        };
        throw error;
      }

      // Handle empty responses (204 No Content, etc.)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error) {
        // Re-throw ApiError as-is
        throw error;
      }

      // Network or other errors
      const apiError: ApiError = {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network error',
        details: undefined,
        timestamp: new Date().toISOString(),
        status: 0
      };
      throw apiError;
    }
  }

  return {
    async get<T>(endpoint: string): Promise<T> {
      return request<T>(endpoint, { method: 'GET' });
    },

    async post<T>(endpoint: string, data?: any): Promise<T> {
      return request<T>(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      });
    },

    async put<T>(endpoint: string, data?: any): Promise<T> {
      return request<T>(endpoint, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      });
    },

    async del<T>(endpoint: string): Promise<T> {
      return request<T>(endpoint, { method: 'DELETE' });
    },
  };
}

// Singleton API client with placeholder token getter
// AuthProvider will update this with actual token getter
export const apiClient = createApiClient();

// Export factory function for testing or custom instances
export { createApiClient };
