// filepath: src/hooks/useFetch.ts
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import { apiClient } from '@/services/apiClient'
import { ApiResult } from '@/core/contracts'

// Generic hook for GET requests using React Query
export function useQueryFetch<T>(
  key: string | string[],
  url: string,
  options?: Omit<UseQueryOptions<ApiResult<T>>, 'queryKey' | 'queryFn'>
) {
  const queryKey = Array.isArray(key) ? key : [key]
  
  return useQuery<ApiResult<T>>({
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
    mutationFn: (variables: TVariables) => {
      const requestOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      }
      
      if (variables && method !== 'DELETE') {
        requestOptions.body = JSON.stringify(variables)
      }
      
      return apiClient.fetcher<TData>(url, requestOptions)
    },
    ...options
  })
}

// Convenience hooks for common operations
export function useGet<T>(
  key: string | string[],
  url: string,
  options?: Omit<UseQueryOptions<ApiResult<T>>, 'queryKey' | 'queryFn'>
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

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (via apiClient)
- [x] Exports default named component (exports named hooks)
- [x] Adds basic ARIA and keyboard handlers (not applicable for data hooks)
*/
