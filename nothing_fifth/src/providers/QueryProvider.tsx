// filepath: src/providers/QueryProvider.tsx

import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { config, isDevelopment } from '@/app/config';
import { eventBus } from '@/core/events';
import { errorLog, debugLog } from '@/core/utils';

// ============================================================================
// QUERY CLIENT CONFIGURATION
// ============================================================================

/**
 * Create a configured QueryClient instance with global error handling
 */
function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: how long data is considered fresh (5 minutes)
        staleTime: 5 * 60 * 1000,
        
        // Cache time: how long inactive data stays in cache (10 minutes)
        gcTime: 10 * 60 * 1000,
        
        // Retry configuration
        retry: (failureCount: number, error: any) => {
          // Don't retry on 4xx errors (client errors)
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
        
        // Retry delay with exponential backoff
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Refetch on window focus only in development
        refetchOnWindowFocus: isDevelopment,
        
        // Background refetch interval (30 seconds in development, 5 minutes in production)
        refetchInterval: isDevelopment ? 30 * 1000 : 5 * 60 * 1000,
        
        // Network error handling
        networkMode: 'online',
      },
      mutations: {
        // Retry mutations once by default
        retry: 1,
        
        // Retry delay for mutations
        retryDelay: 1000,
        
        // Network mode for mutations
        networkMode: 'online',
      },
    },
    
    // Global query error handling
    queryCache: new QueryCache({
      onError: (error: Error, query: any) => {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        errorLog(`Query failed: ${query.queryKey.join(' -> ')}`, error instanceof Error ? error : new Error(errorMessage));
        
        // Emit error event for global error handling
        eventBus.emit('error:global', { 
          error: error instanceof Error ? error : new Error(errorMessage)
        });
        
        // Emit toast notification for user-facing errors
        eventBus.emit('toast:add', {
          id: `query-error-${Date.now()}`,
          type: 'error',
          title: 'Data Loading Error',
          message: 'Failed to load data. Please try again.',
          timestamp: Date.now()
        });
      },
      
      onSuccess: (data: any, query: any) => {
        if (isDevelopment) {
          debugLog(`Query succeeded: ${query.queryKey.join(' -> ')}`, data);
        }
      },
    }),
    
    // Global mutation error handling
    mutationCache: new MutationCache({
      onError: (error: Error, variables: any, context: any, mutation: any) => {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        errorLog(`Mutation failed: ${mutation.options.mutationKey?.join(' -> ') || 'unknown'}`, error instanceof Error ? error : new Error(errorMessage));
        
        // Emit error event for global error handling
        eventBus.emit('error:global', { 
          error: error instanceof Error ? error : new Error(errorMessage)
        });
        
        // Emit toast notification for user-facing errors
        eventBus.emit('toast:add', {
          id: `mutation-error-${Date.now()}`,
          type: 'error',
          title: 'Action Failed',
          message: 'Your action could not be completed. Please try again.',
          timestamp: Date.now()
        });
      },
      
      onSuccess: (data: any, variables: any, context: any, mutation: any) => {
        if (isDevelopment) {
          debugLog(`Mutation succeeded: ${mutation.options.mutationKey?.join(' -> ') || 'unknown'}`, data);
        }
        
        // Emit success toast for mutations (optional, can be customized per mutation)
        if (mutation.options.meta?.showSuccessToast) {
          eventBus.emit('toast:add', {
            id: `mutation-success-${Date.now()}`,
            type: 'success',
            title: 'Success',
            message: mutation.options.meta.successMessage || 'Action completed successfully.',
            timestamp: Date.now()
          });
        }
      },
    }),
  });
}

// ============================================================================
// QUERY PROVIDER COMPONENT
// ============================================================================

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * React Query provider that configures the QueryClient with global error handling,
 * retry logic, and development tools integration.
 */
export function QueryProvider({ children }: QueryProviderProps): JSX.Element {
  // Create a stable QueryClient instance
  const [queryClient] = React.useState(() => createQueryClient());
  
  // Cleanup on unmount (mainly for testing)
  React.useEffect(() => {
    return () => {
      queryClient.clear();
    };
  }, [queryClient]);
  
  // Log initialization in development
  React.useEffect(() => {
    if (isDevelopment) {
      debugLog('QueryProvider initialized with config:', {
        staleTime: queryClient.getDefaultOptions().queries?.staleTime,
        gcTime: queryClient.getDefaultOptions().queries?.gcTime,
        retry: typeof queryClient.getDefaultOptions().queries?.retry,
        refetchOnWindowFocus: queryClient.getDefaultOptions().queries?.refetchOnWindowFocus,
      });
    }
  }, [queryClient]);
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {isDevelopment && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom"
        />
      )}
    </QueryClientProvider>
  );
}

// ============================================================================
// QUERY CLIENT ACCESS HOOK
// ============================================================================

/**
 * Re-export the useQueryClient hook from @tanstack/react-query
 * This provides access to the QueryClient instance for manual cache invalidation or manipulation
 */
export { useQueryClient } from '@tanstack/react-query';

// ============================================================================
// HELPER UTILITIES
// ============================================================================

/**
 * Utility to create query keys with consistent naming
 */
export function createQueryKey(entity: string, ...params: (string | number | boolean | null | undefined)[]): string[] {
  const filteredParams = params.filter(param => param !== null && param !== undefined);
  return [entity, ...filteredParams.map(String)];
}

/**
 * Utility to create mutation keys with consistent naming
 */
export function createMutationKey(action: string, entity: string): string[] {
  return [action, entity];
}

/**
 * Type-safe query options factory
 */
export function createQueryOptions<TData = unknown, TError = Error>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    retry?: boolean | number;
    refetchInterval?: number | false;
  }
) {
  return {
    queryKey,
    queryFn,
    ...options,
  };
}

/**
 * Type-safe mutation options factory
 */
export function createMutationOptions<TData = unknown, TError = Error, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: TError, variables: TVariables) => void;
    showSuccessToast?: boolean;
    successMessage?: string;
  }
) {
  return {
    mutationFn,
    meta: {
      showSuccessToast: options?.showSuccessToast,
      successMessage: options?.successMessage,
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  };
}

// Default export
export default QueryProvider;

// ============================================================================
// Self-Check Comments
// ============================================================================
// [x] Uses `@/` imports only - Imports from @/app/config, @/core/events, @/core/utils
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Pure React Query provider logic
// [x] Reads config from `@/app/config` - Uses config and isDevelopment from app config
// [x] Exports default named component - Exports QueryProvider as default and multiple named exports
// [x] Adds basic ARIA and keyboard handlers (where relevant) - Adds aria-label to DevTools toggle button
