// filepath: src/providers/QueryProvider.tsx

import React, { ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { config, isDevelopment } from '@/app/config';
import { eventBus } from '@/core/events';
import { debugLog, debugError } from '@/core/utils';
import type { ApiError } from '@/core/contracts';

interface QueryProviderProps {
  children: ReactNode;
}

// Default stale time and cache time based on environment
const DEFAULT_STALE_TIME = isDevelopment ? 1000 * 60 * 2 : 1000 * 60 * 5; // 2min dev, 5min prod
const DEFAULT_CACHE_TIME = 1000 * 60 * 10; // 10 minutes

// Global error handler for queries
const handleQueryError = (error: unknown, query?: { queryKey: unknown[] }) => {
  const queryKey = query?.queryKey ? JSON.stringify(query.queryKey) : 'unknown';
  
  debugError('QueryProvider', `Query error for ${queryKey}:`, error);
  
  // Extract meaningful error info
  let apiError: ApiError | null = null;
  if (error && typeof error === 'object' && 'response' in error) {
    const responseError = error as any;
    if (responseError.response?.data) {
      apiError = {
        code: responseError.response.status?.toString() || 'UNKNOWN_ERROR',
        message: responseError.response.data.message || responseError.message || 'An error occurred',
        details: responseError.response.data
      };
    }
  }
  
  // Emit error event for global handling (toasts, logging, etc.)
  eventBus.emit('query:error', {
    queryKey,
    error: apiError || {
      code: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : 'Network request failed',
    },
    timestamp: new Date().toISOString(),
  });
};

// Global success handler for mutations
const handleMutationSuccess = (data: unknown, variables: unknown, context: unknown, mutation: any) => {
  const mutationKey = mutation.options.mutationKey;
  debugLog('QueryProvider', `Mutation success:`, { mutationKey, data });
  
  eventBus.emit('mutation:success', {
    mutationKey: mutationKey ? JSON.stringify(mutationKey) : 'unknown',
    data,
    timestamp: new Date().toISOString(),
  });
};

// Global error handler for mutations
const handleMutationError = (error: unknown, variables: unknown, context: unknown, mutation: any) => {
  const mutationKey = mutation.options.mutationKey;
  debugError('QueryProvider', `Mutation error:`, { mutationKey, error });
  
  // Extract API error similar to query error handling
  let apiError: ApiError | null = null;
  if (error && typeof error === 'object' && 'response' in error) {
    const responseError = error as any;
    if (responseError.response?.data) {
      apiError = {
        code: responseError.response.status?.toString() || 'UNKNOWN_ERROR',
        message: responseError.response.data.message || responseError.message || 'An error occurred',
        details: responseError.response.data
      };
    }
  }
  
  eventBus.emit('mutation:error', {
    mutationKey: mutationKey ? JSON.stringify(mutationKey) : 'unknown',
    error: apiError || {
      code: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : 'Request failed',
    },
    variables,
    timestamp: new Date().toISOString(),
  });
};

// Create query client with configuration
const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // How long data stays fresh before becoming stale
        staleTime: DEFAULT_STALE_TIME,
        // How long unused data stays in cache
        gcTime: DEFAULT_CACHE_TIME,
        // Retry configuration
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors (client errors)
          if (error?.response?.status >= 400 && error?.response?.status < 500) {
            return false;
          }
          // Retry up to 2 times for network errors and 5xx
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Background refetch settings
        refetchOnWindowFocus: !isDevelopment, // Only in production
        refetchOnReconnect: true,
        refetchOnMount: true,
      },
      mutations: {
        retry: false, // Don't retry mutations by default
        onError: handleMutationError,
        onSuccess: handleMutationSuccess,
      },
    },
    queryCache: new QueryCache({
      onError: handleQueryError,
    }),
    mutationCache: new MutationCache({
      onError: handleMutationError,
      onSuccess: handleMutationSuccess,
    }),
  });
};

// Singleton query client instance
let queryClient: QueryClient | null = null;

const getQueryClient = (): QueryClient => {
  if (!queryClient) {
    queryClient = createQueryClient();
    debugLog('QueryProvider', 'Created new QueryClient instance');
  }
  return queryClient;
};

export function QueryProvider({ children }: QueryProviderProps) {
  const client = getQueryClient();

  useEffect(() => {
    debugLog('QueryProvider', 'QueryProvider mounted', {
      isDevelopment,
      staleTime: DEFAULT_STALE_TIME,
      cacheTime: DEFAULT_CACHE_TIME,
    });

    // Emit provider ready event
    eventBus.emit('provider:query:ready', {
      timestamp: new Date().toISOString(),
      config: {
        staleTime: DEFAULT_STALE_TIME,
        gcTime: DEFAULT_CACHE_TIME,
        isDevelopment,
      },
    });

    return () => {
      debugLog('QueryProvider', 'QueryProvider unmounted');
    };
  }, [client]);

  // Handle configuration changes in development
  useEffect(() => {
    if (isDevelopment) {
      const unsubscribe = eventBus.on('config:updated', () => {
        debugLog('QueryProvider', 'Config updated, consider invalidating queries');
        // Could invalidate all queries here if needed
        // client.invalidateQueries();
      });

      return unsubscribe;
    }
  }, [client]);

  return (
    <QueryClientProvider client={client}>
      {children}
      {isDevelopment && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom-right"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}

// Export query client for use in services and components
export { getQueryClient };

// Utility for invalidating queries from outside components
export const invalidateQueries = (queryKey?: string[]) => {
  const client = getQueryClient();
  if (queryKey) {
    client.invalidateQueries({ queryKey });
  } else {
    client.invalidateQueries();
  }
  debugLog('QueryProvider', 'Invalidated queries', { queryKey });
};

// Utility for prefetching data
export const prefetchQuery = async <TData = unknown>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options?: { staleTime?: number }
) => {
  const client = getQueryClient();
  await client.prefetchQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime || DEFAULT_STALE_TIME,
  });
  debugLog('QueryProvider', 'Prefetched query', { queryKey });
};

export default QueryProvider;

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (N/A - this is a data provider)
*/
