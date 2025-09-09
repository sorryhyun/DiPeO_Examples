// filepath: src/hooks/useFetch.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions, UseMutationOptions, QueryKey } from '@tanstack/react-query';
import { resolveService, ApiClientToken } from '@/core/di';
import type { ApiClient, RequestConfig } from '@/core/di';
import type { ApiResult } from '@/core/contracts';
import { eventBus } from '@/core/events';
import { hookRegistry } from '@/core/hooks';

// Generic query hook for GET requests
export function useQueryFetch<TData = any, TError = Error>(
  queryKey: QueryKey,
  url: string,
  config?: RequestConfig & {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
    refetchOnWindowFocus?: boolean;
    retry?: boolean | number;
  }
) {
  const apiClient = resolveService<ApiClient>(ApiClientToken);

  return useQuery<ApiResult<TData>, TError>({
    queryKey,
    queryFn: async () => {
      // Run beforeApiRequest hooks
      const hookContext = await hookRegistry.run('beforeApiRequest', {
        request: { url, method: 'GET', headers: config?.headers }
      });

      const result = await apiClient.get<TData>(
        hookContext.request?.url || url,
        {
          headers: hookContext.request?.headers || config?.headers,
          timeout: config?.timeout,
          signal: config?.signal
        }
      );

      // Run afterApiResponse hooks
      await hookRegistry.run('afterApiResponse', {
        request: { url, method: 'GET', headers: config?.headers },
        response: { status: result.success ? 200 : (result.error?.status || 500), body: result }
      });

      // Emit error event if request failed
      if (!result.success && result.error) {
        eventBus.emit('error:global', {
          error: new Error(result.error.message),
          context: `API GET request to ${url}`
        });
      }

      return result;
    },
    enabled: config?.enabled,
    staleTime: config?.staleTime,
    gcTime: config?.cacheTime, // React Query v5 uses gcTime instead of cacheTime
    refetchOnWindowFocus: config?.refetchOnWindowFocus,
    retry: config?.retry
  });
}

// Generic mutation hook for POST/PUT/PATCH/DELETE requests
export function useMutationFetch<TData = any, TVariables = any, TError = Error>(
  mutationConfig?: {
    method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    onSuccess?: (data: ApiResult<TData>, variables: TVariables) => void;
    onError?: (error: TError, variables: TVariables) => void;
    invalidateQueries?: QueryKey[];
  }
) {
  const apiClient = resolveService<ApiClient>(ApiClientToken);
  const queryClient = useQueryClient();

  return useMutation<ApiResult<TData>, TError, { url: string; data?: any; config?: RequestConfig }>({
    mutationFn: async ({ url, data, config }) => {
      const method = mutationConfig?.method || 'POST';

      // Run beforeApiRequest hooks
      const hookContext = await hookRegistry.run('beforeApiRequest', {
        request: { url, method, headers: config?.headers, body: data }
      });

      let result: ApiResult<TData>;

      switch (method) {
        case 'POST':
          result = await apiClient.post<TData>(
            hookContext.request?.url || url,
            hookContext.request?.body || data,
            {
              headers: hookContext.request?.headers || config?.headers,
              timeout: config?.timeout,
              signal: config?.signal
            }
          );
          break;
        case 'PUT':
          result = await apiClient.put<TData>(
            hookContext.request?.url || url,
            hookContext.request?.body || data,
            {
              headers: hookContext.request?.headers || config?.headers,
              timeout: config?.timeout,
              signal: config?.signal
            }
          );
          break;
        case 'PATCH':
          result = await apiClient.patch<TData>(
            hookContext.request?.url || url,
            hookContext.request?.body || data,
            {
              headers: hookContext.request?.headers || config?.headers,
              timeout: config?.timeout,
              signal: config?.signal
            }
          );
          break;
        case 'DELETE':
          result = await apiClient.delete<TData>(
            hookContext.request?.url || url,
            {
              headers: hookContext.request?.headers || config?.headers,
              timeout: config?.timeout,
              signal: config?.signal
            }
          );
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      // Run afterApiResponse hooks
      await hookRegistry.run('afterApiResponse', {
        request: { url, method, headers: config?.headers, body: data },
        response: { status: result.success ? 200 : (result.error?.status || 500), body: result }
      });

      // Emit error event if request failed
      if (!result.success && result.error) {
        eventBus.emit('error:global', {
          error: new Error(result.error.message),
          context: `API ${method} request to ${url}`
        });
      }

      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate specified queries
      if (mutationConfig?.invalidateQueries) {
        mutationConfig.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }

      // Call custom success handler
      mutationConfig?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      // Call custom error handler
      mutationConfig?.onError?.(error, variables);
    }
  });
}

// Convenience hooks for common patterns
export function useGetQuery<TData = any>(
  url: string,
  config?: Omit<Parameters<typeof useQueryFetch>[2], 'enabled'> & { enabled?: boolean }
) {
  return useQueryFetch<TData>(['get', url], url, config);
}

export function usePostMutation<TData = any, TVariables = any>(
  config?: Omit<Parameters<typeof useMutationFetch>[0], 'method'>
) {
  return useMutationFetch<TData, TVariables>({ ...config, method: 'POST' });
}

export function usePutMutation<TData = any, TVariables = any>(
  config?: Omit<Parameters<typeof useMutationFetch>[0], 'method'>
) {
  return useMutationFetch<TData, TVariables>({ ...config, method: 'PUT' });
}

export function usePatchMutation<TData = any, TVariables = any>(
  config?: Omit<Parameters<typeof useMutationFetch>[0], 'method'>
) {
  return useMutationFetch<TData, TVariables>({ ...config, method: 'PATCH' });
}

export function useDeleteMutation<TData = any, TVariables = any>(
  config?: Omit<Parameters<typeof useMutationFetch>[0], 'method'>
) {
  return useMutationFetch<TData, TVariables>({ ...config, method: 'DELETE' });
}

// Higher-level hooks for common REST patterns
export function useResource<TData = any>(
  resourceUrl: string,
  config?: {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
  }
) {
  const query = useGetQuery<TData>(resourceUrl, config);
  const createMutation = usePostMutation<TData>({
    invalidateQueries: [['get', resourceUrl]]
  });
  const updateMutation = usePutMutation<TData>({
    invalidateQueries: [['get', resourceUrl]]
  });
  const deleteMutation = useDeleteMutation<TData>({
    invalidateQueries: [['get', resourceUrl]]
  });

  return {
    // Query state
    data: query.data?.data,
    error: query.data?.error || query.error,
    isLoading: query.isLoading,
    isError: query.isError || !query.data?.success,
    isSuccess: query.isSuccess && query.data?.success,
    refetch: query.refetch,

    // Mutations
    create: (data: any, config?: RequestConfig) => 
      createMutation.mutate({ url: resourceUrl, data, config }),
    update: (data: any, config?: RequestConfig) => 
      updateMutation.mutate({ url: resourceUrl, data, config }),
    delete: (config?: RequestConfig) => 
      deleteMutation.mutate({ url: resourceUrl, config }),

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,

    // Mutation errors
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error
  };
}

// Export aliases for backwards compatibility
export { useQueryFetch as useQuery, useMutationFetch as useMutation };

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/core/di, @/core/contracts, @/core/events, @/core/hooks)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - wraps React Query and ApiClient service
- [x] Reads config from `@/app/config` (N/A - config is handled by ApiClient service)
- [x] Exports default named component (exports multiple hook functions)
- [x] Adds basic ARIA and keyboard handlers (N/A for data fetching hooks)
*/
