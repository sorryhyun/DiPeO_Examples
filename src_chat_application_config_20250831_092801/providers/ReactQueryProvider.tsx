import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { appConfig, isDevelopment, shouldUseMockData } from '@/app/config';
import { debugLog } from '@/core/utils';

// Configure QueryClient with sensible defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache configuration
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Background refetching
      refetchOnWindowFocus: !isDevelopment,
      refetchOnReconnect: true,
      refetchOnMount: true,
      
      // Mock data support in development
      enabled: true,
      placeholderData: shouldUseMockData ? undefined : undefined,
      
      // Network mode configuration
      networkMode: shouldUseMockData ? 'offlineFirst' : 'online',
    },
    
    mutations: {
      // Retry configuration for mutations
      retry: (failureCount, error: any) => {
        // Don't retry client errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry once for network errors
        return failureCount < 1;
      },
      retryDelay: 1000,
      
      // Network mode for mutations
      networkMode: shouldUseMockData ? 'offlineFirst' : 'online',
    }
  }
});

// Global error handler for queries
queryClient.setMutationDefaults(['default'], {
  onError: (error: any) => {
    debugLog('error', 'Query mutation failed', { error });
  }
});

// Global query defaults
queryClient.setQueryDefaults(['default'], {
  onError: (error: any) => {
    debugLog('error', 'Query failed', { error });
  }
});

// Development logging
if (isDevelopment) {
  queryClient.setDefaultOptions({
    queries: {
      ...queryClient.getDefaultOptions().queries,
      onSuccess: (data: any) => {
        debugLog('debug', 'Query succeeded', { data });
      },
      onError: (error: any) => {
        debugLog('warn', 'Query error', { error });
      }
    },
    mutations: {
      ...queryClient.getDefaultOptions().mutations,
      onSuccess: (data: any) => {
        debugLog('debug', 'Mutation succeeded', { data });
      },
      onError: (error: any) => {
        debugLog('warn', 'Mutation error', { error });
      }
    }
  });
}

interface ReactQueryProviderProps {
  children: ReactNode;
}

export default function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {isDevelopment && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
          position="bottom-right"
          toggleButtonProps={{
            style: {
              marginLeft: '5px',
              transform: 'scale(0.8)',
              transformOrigin: 'bottom right',
            }
          }}
        />
      )}
    </QueryClientProvider>
  );
}

// Export queryClient for direct access if needed
export { queryClient };

// Utility functions for common query patterns
export function invalidateQueries(queryKey: string[]) {
  return queryClient.invalidateQueries({ queryKey });
}

export function prefetchQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: { staleTime?: number }
) {
  return queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime || 5 * 60 * 1000
  });
}

export function setQueryData<T>(queryKey: string[], data: T) {
  return queryClient.setQueryData(queryKey, data);
}

export function getQueryData<T>(queryKey: string[]): T | undefined {
  return queryClient.getQueryData(queryKey);
}

// Mock data utilities for development
export function enableMockQueries() {
  queryClient.setDefaultOptions({
    queries: {
      ...queryClient.getDefaultOptions().queries,
      networkMode: 'offlineFirst',
      retry: false,
      staleTime: Infinity, // Mock data never becomes stale
    }
  });
}

export function enableRealQueries() {
  queryClient.setDefaultOptions({
    queries: {
      ...queryClient.getDefaultOptions().queries,
      networkMode: 'online',
      retry: 3,
      staleTime: 5 * 60 * 1000,
    }
  });
}
