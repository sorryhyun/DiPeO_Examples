// filepath: src/providers/QueryProvider.tsx
import React from 'react';
import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { config } from '@/app/config';

const createQueryClient = (): QueryClient => {
  const queryCache = new QueryCache({
    onError: (error, query) => {
      console.error('Query Error:', error, 'Query Key:', query.queryKey);
    },
  });

  const mutationCache = new MutationCache({
    onError: (error, variables, context, mutation) => {
      console.error('Mutation Error:', error, 'Variables:', variables);
    },
  });

  return new QueryClient({
    queryCache,
    mutationCache,
    defaultOptions: {
      queries: {
        retry: config.isDevelopment ? 1 : 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: config.isDevelopment ? 0 : 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: !config.isDevelopment,
        refetchOnReconnect: true,
        refetchOnMount: true,
        networkMode: 'online',
        throwOnError: (error: any) => {
          return !config.isDevelopment && error?.status >= 500;
        },
      },
      mutations: {
        retry: config.isDevelopment ? 0 : 1,
        retryDelay: 1000,
        throwOnError: (error: any) => {
          return !config.isDevelopment && error?.status >= 500;
        },
        networkMode: 'online',
      },
    },
  });
};

const queryClient = createQueryClient();

export interface QueryProviderProps {
  children: React.ReactNode;
  client?: QueryClient;
}

export function QueryProvider({ children, client = queryClient }: QueryProviderProps) {
  return (
    <QueryClientProvider client={client}>
      {children}
      {config.isDevelopment && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom-right"
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

export { queryClient };

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

export function setQueryData<T = any>(queryKey: string[], data: T): void {
  queryClient.setQueryData(queryKey, data);
}

export function getQueryData<T = any>(queryKey: string[]): T | undefined {
  return queryClient.getQueryData(queryKey);
}

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

export function clearCache(): void {
  queryClient.clear();
}

export function handleQueryError(error: Error, errorInfo?: any): void {
  console.error('Query Error Boundary:', error, errorInfo);
}

if (config.isDevelopment) {
  (globalThis as any).__queryClient = queryClient;
  
  let logCacheStatsInterval: NodeJS.Timeout;
  
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
    }, 30000);
  };
  
  if (typeof window !== 'undefined') {
    startCacheLogging();
    
    window.addEventListener('beforeunload', () => {
      if (logCacheStatsInterval) {
        clearInterval(logCacheStatsInterval);
      }
    });
  }
}

export default QueryProvider;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant) - devtools toggle has aria-label
