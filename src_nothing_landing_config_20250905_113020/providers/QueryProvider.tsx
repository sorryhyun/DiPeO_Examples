// filepath: src/providers/QueryProvider.tsx
import React from 'react';
import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { config } from '@/app/config';
import { eventBus } from '@/core/events';
import type { ApiError } from '@/core/contracts';

// Query client configuration based on app config
const createQueryClient = (): QueryClient => {
  const queryCache = new QueryCache({
    onError: (error, query) => {
      // Emit global error event for centralized error handling
      eventBus.emit('error:global', {
        error: error instanceof Error ? error : new Error(String(error)),
        context: `Query: ${query.queryKey.join(' > ')}`
      });
    },
  });

  const mutationCache = new MutationCache({
    onError: (error, variables, context, mutation) => {
      // Emit global error event for mutation failures
      eventBus.emit('error:global', {
        error: error instanceof Error ? error : new Error(String(error)),
        context: `Mutation: ${mutation.options.mutationKey?.join(' > ') || 'unknown'}`
      });
    },
  });

  return new QueryClient({
    queryCache,
    mutationCache,
    defaultOptions: {
      queries: {
        // Retry configuration based on environment
        retry: config.isDevelopment ? 1 : 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Stale time - how long data stays fresh
        staleTime: config.isDevelopment ? 0 : 5 * 60 * 1000, // 5 minutes in prod, 0 in dev
        
        // Cache time - how long inactive data stays in cache
        gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
        
        // Refetch configuration
        refetchOnWindowFocus: !config.isDevelopment,
        refetchOnReconnect: true,
        refetchOnMount: true,
        
        // Network mode configuration
        networkMode: 'online',
        
        // Error retry logic
        retryOnMount: true,
        
        // Use error boundary for unhandled errors in production
        throwOnError: (error: any) => {
          // Use error boundary for 500+ errors in production
          if (!config.isDevelopment && error?.status >= 500) {
            return true;
          }
          return false;
        },
      },
      mutations: {
        // Retry failed mutations less aggressively
        retry: config.isDevelopment ? 0 : 1,
        retryDelay: 1000,
        
        // Use error boundary for critical mutations in production
        throwOnError: (error: any) => {
          // Use error boundary for 500+ errors in production
          if (!config.isDevelopment && error?.status >= 500) {
            return true;
          }
          return false;
        },
        
        // Network mode for mutations
        networkMode: 'online',
      },
    },
  });
};

// Create singleton query client instance
const queryClient = createQueryClient();

// Provider component props
export interface QueryProviderProps {
  children: React.ReactNode;
  client?: QueryClient; // Allow custom client for testing
}

/**
 * React Query provider that configures caching, error handling, and retry policies
 * based on application configuration. Integrates with the global event bus for
 * centralized error reporting.
 */
export function QueryProvider({ children, client = queryClient }: QueryProviderProps) {
  return (
    <QueryClientProvider client={client}>
      {children}
      {config.isDevelopment && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom-right"
          buttonPosition="bottom-right"
          toggleButtonProps={{
            'aria-label': 'Toggle React Query Devtools',
            style: {
              fontSize: '12px',
              padding: '4px 8px',
            }
          }}
        />
      )}
    </QueryClientProvider>
  );
}

// Export the query client instance for direct access when needed
export { queryClient };

// Utility function to invalidate queries by pattern
export function invalidateQueries(pattern: string | string[]): Promise<void> {
  const keys = Array.isArray(pattern) ? pattern : [pattern];
  return queryClient.invalidateQueries({
    predicate: (query) => {
      const queryKey = query.queryKey;
      return keys.some(key => 
        queryKey.some(keyPart => 
          typeof keyPart === 'string' && keyPart.includes(key)
        )
      );
    }
  });
}

// Utility function to prefetch data
export function prefetchQuery<T = any>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  staleTime?: number
): Promise<void> {
  return queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime: staleTime ?? (config.isDevelopment ? 0 : 5 * 60 * 1000),
  });
}

// Utility function to set query data manually
export function setQueryData<T = any>(queryKey: string[], data: T): void {
  queryClient.setQueryData(queryKey, data);
}

// Utility function to get query data
export function getQueryData<T = any>(queryKey: string[]): T | undefined {
  return queryClient.getQueryData(queryKey);
}

// Utility function to remove queries
export function removeQueries(pattern: string | string[]): void {
  const keys = Array.isArray(pattern) ? pattern : [pattern];
  queryClient.removeQueries({
    predicate: (query) => {
      const queryKey = query.queryKey;
      return keys.some(key => 
        queryKey.some(keyPart => 
          typeof keyPart === 'string' && keyPart.includes(key)
        )
      );
    }
  });
}

// Clear all cached data (useful for logout)
export function clearCache(): void {
  queryClient.clear();
}

// Error boundary integration - export error handler for use with React Error Boundary
export function handleQueryError(error: Error, errorInfo?: any): void {
  eventBus.emit('error:global', {
    error,
    context: 'React Query Error Boundary'
  });
}

// Development utilities
if (config.isDevelopment) {
  // Add query client to global scope for debugging
  (globalThis as any).__queryClient = queryClient;
  
  // Log cache statistics periodically in development
  let logCacheStatsInterval: number;
  
  const startCacheLogging = () => {
    if (logCacheStatsInterval) {
      clearInterval(logCacheStatsInterval);
    }
    
    logCacheStatsInterval = setInterval(() => {
      const cache = queryClient.getQueryCache();
      const mutations = queryClient.getMutationCache();
      
      console.debug('[QueryProvider] Cache Stats:', {
        queries: cache.getAll().length,
        mutations: mutations.getAll().length,
        memoryUsage: (performance as any).memory ? {
          used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024),
        } : 'unavailable',
      });
    }, 30000); // Log every 30 seconds
  };
  
  // Auto-start cache logging
  if (typeof window !== 'undefined') {
    startCacheLogging();
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      if (logCacheStatsInterval) {
        clearInterval(logCacheStatsInterval);
      }
    });
  }
}

export default QueryProvider;
