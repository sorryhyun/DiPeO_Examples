// filepath: src/hooks/useFetch.ts

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { resolve } from '@/core/di';
import { ApiClientToken } from '@/core/di';
import { eventBus } from '@/core/events';
import { debugLog, debugError } from '@/core/utils';
import { config, isDevelopment, shouldUseMockData } from '@/app/config';
import type { ApiResult, ApiError, LoadingState } from '@/core/contracts';

// ===============================================
// Types & Interfaces
// ===============================================

export interface UseFetchOptions<TData = unknown> extends Omit<UseQueryOptions<TData, ApiError>, 'queryKey' | 'queryFn'> {
  enabled?: boolean;
  mockData?: TData;
  onSuccess?: (data: TData) => void;
  onError?: (error: ApiError) => void;
}

export interface UseFetchResult<TData = unknown> {
  data: TData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  refetch: () => void;
  isFetching: boolean;
  isSuccess: boolean;
  status: LoadingState;
}

export interface UseMutationFetchOptions<TData = unknown, TVariables = unknown> 
  extends Omit<UseMutationOptions<TData, ApiError, TVariables>, 'mutationFn'> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: ApiError, variables: TVariables) => void;
  invalidateQueries?: string[][];
}

export interface UseMutationFetchResult<TData = unknown, TVariables = unknown> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  data: TData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  isSuccess: boolean;
  reset: () => void;
  status: LoadingState;
}

// ===============================================
// Mock Data Handling
// ===============================================

function getMockDataIfEnabled<TData>(mockData?: TData, queryKey?: string[]): TData | undefined {
  if (!shouldUseMockData || !mockData) return undefined;
  
  debugLog('useFetch', `Using mock data for query: ${queryKey?.join(',')}`, mockData);
  return mockData;
}

// ===============================================
// Error Mapping
// ===============================================

function mapQueryError(error: unknown): ApiError {
  if (!error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
    };
  }

  // If already an ApiError, return as-is
  if (typeof error === 'object' && 'code' in error && 'message' in error) {
    return error as ApiError;
  }

  // Handle network/HTTP errors
  if (error instanceof Error) {
    return {
      code: 'NETWORK_ERROR',
      message: error.message,
    };
  }

  // Handle fetch response errors
  if (typeof error === 'object' && 'response' in error) {
    const responseError = error as any;
    return {
      code: responseError.response?.status?.toString() || 'HTTP_ERROR',
      message: responseError.response?.data?.message || responseError.message || 'Request failed',
      details: responseError.response?.data,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: String(error),
  };
}

// ===============================================
// Query Status Mapping
// ===============================================

function mapLoadingState(isLoading: boolean, isError: boolean, isSuccess: boolean): LoadingState {
  if (isLoading) return 'loading';
  if (isError) return 'error';
  if (isSuccess) return 'success';
  return 'idle';
}

// ===============================================
// Main useFetch Hook
// ===============================================

export function useFetch<TData = unknown>(
  queryKey: string[],
  endpoint: string,
  options: UseFetchOptions<TData> = {}
): UseFetchResult<TData> {
  const {
    enabled = true,
    mockData,
    onSuccess,
    onError,
    ...queryOptions
  } = options;

  // Get API client from DI container
  const apiClient = resolve(ApiClientToken);

  const query = useQuery<TData, ApiError>({
    queryKey,
    queryFn: async (): Promise<TData> => {
      // Return mock data if enabled and available
      const mockResult = getMockDataIfEnabled<TData>(mockData, queryKey);
      if (mockResult) {
        return mockResult;
      }

      // Make actual API call
      try {
        debugLog('useFetch', `Fetching: ${endpoint}`, { queryKey });
        const response = await apiClient.get<ApiResult<TData>>(endpoint);
        
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.error?.message || 'API request failed');
        }
      } catch (error) {
        debugError('useFetch', `Fetch failed for ${endpoint}:`, error);
        throw mapQueryError(error);
      }
    },
    enabled,
    ...queryOptions,
  });

  // Handle success callback
  if (query.isSuccess && query.data && onSuccess) {
    onSuccess(query.data);
  }

  // Handle error callback
  if (query.isError && query.error && onError) {
    onError(query.error);
  }

  // Emit events for global handling
  if (query.isError && query.error) {
    eventBus.emit('data:error', {
      queryKey: queryKey.join(','),
      error: query.error,
      endpoint,
    });
  }

  if (query.isSuccess && query.data) {
    eventBus.emit('data:success', {
      queryKey: queryKey.join(','),
      endpoint,
    });
  }

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error || null,
    refetch: query.refetch,
    isFetching: query.isFetching,
    isSuccess: query.isSuccess,
    status: mapLoadingState(query.isLoading, query.isError, query.isSuccess),
  };
}

// ===============================================
// Mutation Hook
// ===============================================

export function useMutationFetch<TData = unknown, TVariables = unknown>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
  options: UseMutationFetchOptions<TData, TVariables> = {}
): UseMutationFetchResult<TData, TVariables> {
  const {
    onSuccess,
    onError,
    invalidateQueries = [],
    ...mutationOptions
  } = options;

  const queryClient = useQueryClient();
  const apiClient = resolve(ApiClientToken);

  const mutation = useMutation<TData, ApiError, TVariables>({
    mutationFn: async (variables: TVariables): Promise<TData> => {
      try {
        debugLog('useMutationFetch', `${method} ${endpoint}`, { variables });

        let response: ApiResult<TData>;
        
        switch (method) {
          case 'POST':
            response = await apiClient.post<ApiResult<TData>>(endpoint, variables);
            break;
          case 'PUT':
            response = await apiClient.put<ApiResult<TData>>(endpoint, variables);
            break;
          case 'PATCH':
            response = await apiClient.put<ApiResult<TData>>(endpoint, variables); // Using put for patch
            break;
          case 'DELETE':
            response = await apiClient.delete<ApiResult<TData>>(endpoint);
            break;
          default:
            throw new Error(`Unsupported HTTP method: ${method}`);
        }

        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.error?.message || 'Mutation request failed');
        }
      } catch (error) {
        debugError('useMutationFetch', `Mutation failed for ${method} ${endpoint}:`, error);
        throw mapQueryError(error);
      }
    },
    onSuccess: (data, variables, context) => {
      // Invalidate specified queries
      invalidateQueries.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });

      // Call user success handler
      if (onSuccess) {
        onSuccess(data, variables);
      }

      // Emit success event
      eventBus.emit('mutation:success', {
        endpoint,
        method,
        data,
        variables,
      });
    },
    onError: (error, variables, context) => {
      // Call user error handler
      if (onError) {
        onError(error, variables);
      }

      // Emit error event
      eventBus.emit('mutation:error', {
        endpoint,
        method,
        error,
        variables,
      });
    },
    ...mutationOptions,
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    data: mutation.data,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error || null,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
    status: mapLoadingState(mutation.isPending, mutation.isError, mutation.isSuccess),
  };
}

// ===============================================
// Convenience Hooks
// ===============================================

// GET request hook
export function useGet<TData = unknown>(
  queryKey: string[],
  endpoint: string,
  options?: UseFetchOptions<TData>
): UseFetchResult<TData> {
  return useFetch<TData>(queryKey, endpoint, options);
}

// POST mutation hook
export function usePost<TData = unknown, TVariables = unknown>(
  endpoint: string,
  options?: UseMutationFetchOptions<TData, TVariables>
): UseMutationFetchResult<TData, TVariables> {
  return useMutationFetch<TData, TVariables>(endpoint, 'POST', options);
}

// PUT mutation hook
export function usePut<TData = unknown, TVariables = unknown>(
  endpoint: string,
  options?: UseMutationFetchOptions<TData, TVariables>
): UseMutationFetchResult<TData, TVariables> {
  return useMutationFetch<TData, TVariables>(endpoint, 'PUT', options);
}

// DELETE mutation hook
export function useDelete<TData = unknown, TVariables = unknown>(
  endpoint: string,
  options?: UseMutationFetchOptions<TData, TVariables>
): UseMutationFetchResult<TData, TVariables> {
  return useMutationFetch<TData, TVariables>(endpoint, 'DELETE', options);
}

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component (exports multiple hook functions)
- [x] Adds basic ARIA and keyboard handlers (N/A - this is a data fetching hook)
*/
