import { QueryClient } from '@tanstack/react-query';
import { appConfig, isDevelopmentMode } from '@/app/config';
import { defaultEventBus } from '@/core/events';
import type { ApiError } from '@/core/contracts';

// Default query options based on environment
export const defaultQueryOptions = {
  queries: {
    // Cache time: how long data stays in cache after components unmount
    gcTime: isDevelopmentMode() ? 5 * 60 * 1000 : 30 * 60 * 1000, // 5min dev, 30min prod
    
    // Stale time: how long data is considered fresh
    staleTime: isDevelopmentMode() ? 30 * 1000 : 5 * 60 * 1000, // 30sec dev, 5min prod
    
    // Retry configuration
    retry: (failureCount: number, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.status && error.status >= 400 && error.status < 500) {
        return false;
      }
      // Retry up to 3 times for network/server errors
      return failureCount < 3;
    },
    
    // Retry delay with exponential backoff
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Refetch on window focus (disabled in dev for better DX)
    refetchOnWindowFocus: !isDevelopmentMode(),
    
    // Refetch on reconnect
    refetchOnReconnect: true,
    
    // Background refetch interval (disabled by default)
    refetchInterval: false,
    
    // Network mode: how to handle offline scenarios
    networkMode: 'online',
    
    // Throw errors to components/error boundaries
    throwOnError: false,
    
    // Placeholder data while loading
    placeholderData: undefined,
  },
  
  mutations: {
    // Retry mutations once on network error
    retry: (failureCount: number, error: any) => {
      if (error?.status && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 1;
    },
    
    // Network mode for mutations
    networkMode: 'online',
    
    // Throw mutation errors to components
    throwOnError: false,
  },
};

// Global error handler for queries and mutations
function onError(error: any) {
  // Emit error event for centralized error handling
  defaultEventBus.emit('error.reported', {
    error,
    context: {
      source: 'react-query',
      timestamp: new Date().toISOString(),
    },
  });

  // Log errors in development
  if (isDevelopmentMode()) {
    console.error('React Query Error:', error);
  }

  // Handle specific error types
  if (error?.status === 401) {
    // Unauthorized - emit auth error
    defaultEventBus.emit('auth.error', {
      type: 'unauthorized',
      error,
    });
  } else if (error?.status === 403) {
    // Forbidden - emit auth error
    defaultEventBus.emit('auth.error', {
      type: 'forbidden',
      error,
    });
  } else if (error?.status >= 500) {
    // Server error - could trigger toast notification
    defaultEventBus.emit('api.server_error', {
      error,
      status: error.status,
    });
  }
}

// Global success handler for mutations
function onSuccess(data: any, variables: any, context: any) {
  // Emit success event for optimistic updates confirmation
  defaultEventBus.emit('api.mutation_success', {
    data,
    variables,
    context,
    timestamp: new Date().toISOString(),
  });
}

// Create the QueryClient instance
export const queryClient = new QueryClient({
  defaultOptions: {
    ...defaultQueryOptions,
    queries: {
      ...defaultQueryOptions.queries,
      onError,
    },
    mutations: {
      ...defaultQueryOptions.mutations,
      onError,
      onSuccess,
    },
  },
});

// Development-mode query devtools setup
if (isDevelopmentMode()) {
  // Enable detailed logging
  queryClient.setLogger({
    log: console.log,
    warn: console.warn,
    error: console.error,
  });
  
  // Log query cache changes
  queryClient.getQueryCache().subscribe((event) => {
    if (event?.type === 'added') {
      console.log(`[React Query] Query added: ${event.query.queryHash}`);
    } else if (event?.type === 'removed') {
      console.log(`[React Query] Query removed: ${event.query.queryHash}`);
    }
  });
  
  // Log mutation cache changes
  queryClient.getMutationCache().subscribe((event) => {
    if (event?.type === 'added') {
      console.log(`[React Query] Mutation added: ${event.mutation.mutationId}`);
    }
  });
}

// Helper function to invalidate queries with error handling
export async function invalidateQueries(
  queryKey: string | string[],
  options?: { exact?: boolean; refetchType?: 'active' | 'inactive' | 'all' }
) {
  try {
    await queryClient.invalidateQueries({
      queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
      exact: options?.exact,
      refetchType: options?.refetchType || 'active',
    });
  } catch (error) {
    console.error('Failed to invalidate queries:', error);
    onError(error);
  }
}

// Helper function to set query data with error handling
export function setQueryData<T>(queryKey: string | string[], data: T | ((old: T | undefined) => T)) {
  try {
    queryClient.setQueryData(Array.isArray(queryKey) ? queryKey : [queryKey], data);
  } catch (error) {
    console.error('Failed to set query data:', error);
    onError(error);
  }
}

// Helper function to get query data safely
export function getQueryData<T>(queryKey: string | string[]): T | undefined {
  try {
    return queryClient.getQueryData<T>(Array.isArray(queryKey) ? queryKey : [queryKey]);
  } catch (error) {
    console.error('Failed to get query data:', error);
    return undefined;
  }
}

// Helper to prefetch queries
export async function prefetchQuery<T>(
  queryKey: string | string[],
  queryFn: () => Promise<T>,
  options?: { staleTime?: number }
) {
  try {
    await queryClient.prefetchQuery({
      queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
      queryFn,
      staleTime: options?.staleTime || defaultQueryOptions.queries.staleTime,
    });
  } catch (error) {
    console.error('Failed to prefetch query:', error);
    onError(error);
  }
}

// Helper to remove queries from cache
export function removeQueries(queryKey: string | string[], options?: { exact?: boolean }) {
  try {
    queryClient.removeQueries({
      queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
      exact: options?.exact,
    });
  } catch (error) {
    console.error('Failed to remove queries:', error);
  }
}

// Helper to reset queries
export async function resetQueries(queryKey?: string | string[], options?: { exact?: boolean }) {
  try {
    await queryClient.resetQueries({
      queryKey: queryKey ? (Array.isArray(queryKey) ? queryKey : [queryKey]) : undefined,
      exact: options?.exact,
    });
  } catch (error) {
    console.error('Failed to reset queries:', error);
    onError(error);
  }
}

// Helper to get cache time in a readable format
export function getCacheStats() {
  const queries = queryClient.getQueryCache().getAll();
  const mutations = queryClient.getMutationCache().getAll();
  
  return {
    totalQueries: queries.length,
    totalMutations: mutations.length,
    activeQueries: queries.filter(q => q.getObserversCount() > 0).length,
    staleQueries: queries.filter(q => q.isStale()).length,
    errorQueries: queries.filter(q => q.state.status === 'error').length,
  };
}

// Register hook for cleanup on auth logout
defaultEventBus.on('auth.logout', () => {
  // Clear all queries when user logs out
  queryClient.clear();
});

// Register hook for selective invalidation on auth login
defaultEventBus.on('auth.login', () => {
  // Invalidate user-specific queries when user logs in
  invalidateQueries(['user', 'accounts', 'transactions', 'messages']);
});
