// filepath: src/hooks/useFetch.ts
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import { apiClient, typedApiClient } from '@/services/apiClient'
import { ApiResult } from '@/core/contracts'

// Generic hook for GET requests using React Query
export function useQueryFetch<T>(
  key: string | string[],
  url: string,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  const queryKey = Array.isArray(key) ? key : [key]
  
  return useQuery<T>({
    queryKey,
    queryFn: () => apiClient.fetcher<T>(url),
    ...options
  })
}

// Generic hook for POST/PUT/DELETE mutations
export function useMutationFetch<TData, TVariables = void>(
  url: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST',
  options?: UseMutationOptions<ApiResult<TData>, Error, TVariables>
) {
  return useMutation<ApiResult<TData>, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      switch (method) {
        case 'POST':
          return typedApiClient.post<TData>(url, variables);
        case 'PUT':
          return typedApiClient.put<TData>(url, variables);
        case 'DELETE':
          return typedApiClient.delete<TData>(url);
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    },
    ...options
  })
}

// Convenience hooks for common operations
export function useGet<T>(
  key: string | string[],
  url: string,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  return useQueryFetch<T>(key, url, options)
}

export function usePost<TData, TVariables = void>(
  url: string,
  options?: UseMutationOptions<ApiResult<TData>, Error, TVariables>
) {
  return useMutationFetch<TData, TVariables>(url, 'POST', options)
}

export function usePut<TData, TVariables = void>(
  url: string,
  options?: UseMutationOptions<ApiResult<TData>, Error, TVariables>
) {
  return useMutationFetch<TData, TVariables>(url, 'PUT', options)
}

export function useDelete<TData, TVariables = void>(
  url: string,
  options?: UseMutationOptions<ApiResult<TData>, Error, TVariables>
) {
  return useMutationFetch<TData, TVariables>(url, 'DELETE', options)
}

// Legacy useFetch hook for backward compatibility
export function useFetch<T>(url: string, options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>) {
  const query = useQueryFetch<T>([url], url, options);
  
  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (via apiClient)
- [x] Exports default named component (exports named hooks)
- [x] Adds basic ARIA and keyboard handlers (not applicable for data hooks)
*/
