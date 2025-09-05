// filepath: src/providers/QueryProvider.tsx
import React, { ReactNode } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
  MutationCache,
  QueryCache,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { config } from '@/app/config';
import { eventBus } from '@/core/events';
import type { ApiError } from '@/core/contracts';

// =============================================================================
// Query Client Configuration
// =============================================================================

const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: how long data is considered fresh
        staleTime: 5 * 60 * 1000, // 5 minutes
        
        // Cache time: how long inactive data stays in memory
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        
        // Retry failed requests
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors (client errors)
          if (error?.status >= 400 && error?.status <= 499) {
            return false;
          }
          // Retry up to 3 times for server errors
          return failureCount <= 2;
        },
        
        // Retry delay with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Refetch on window focus in development only
        refetchOnWindowFocus: config.isDevelopment,
        
        // Refetch on reconnect
        refetchOnReconnect: true,
        
        // Background refetch interval (disabled by default)
        refetchInterval: false,
        
        // Network mode
        networkMode: 'online',
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
        
        // Network mode for mutations
        networkMode: 'online',
      },
    },
    
    // Global query cache for handling query events
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Emit query error events
        eventBus.emit('query:error', {
          error: error as ApiError,
          queryKey: query.queryKey,
          type: 'query',
        });
        
        // Log errors in development
        if (config.isDevelopment) {
          console.error('Query failed:', query.queryKey, error);
        }
      },
      
      onSuccess: (data, query) => {
        // Emit successful query events for analytics/logging
        eventBus.emit('query:success', {
          queryKey: query.queryKey,
          type: 'query',
          dataType: typeof data,
        });
      },
    }),
    
    // Global mutation cache for handling mutation events
    mutationCache: new MutationCache({
      onError: (error, variables, context, mutation) => {
        // Emit mutation error events
        eventBus.emit('query:error', {
          error: error as ApiError,
          mutationKey: mutation.options.mutationKey,
          variables,
          type: 'mutation',
        });
        
        // Log mutation errors in development
        if (config.isDevelopment) {
          console.error('Mutation failed:', mutation.options.mutationKey, error);
        }
      },
      
      onSuccess: (data, variables, context, mutation) => {
        // Emit successful mutation events
        eventBus.emit('query:success', {
          mutationKey: mutation.options.mutationKey,
          variables,
          type: 'mutation',
          dataType: typeof data,
        });
        
        // Emit specific events for common mutations
        if (mutation.options.mutationKey) {
          const key = Array.isArray(mutation.options.mutationKey) 
            ? mutation.options.mutationKey[0] 
            : mutation.options.mutationKey;
          
          if (typeof key === 'string') {
            // Emit domain-specific events
            if (key.includes('create') || key.includes('update') || key.includes('delete')) {
              eventBus.emit('data:mutated', {
                operation: key,
                data,
                variables,
              });
            }
          }
        }
      },
    }),
  });
};

// =============================================================================
// Query Client Instance
// =============================================================================

// Create a single instance to be used throughout the app
let queryClient: QueryClient | null = null;

const getQueryClient = (): QueryClient => {
  if (!queryClient) {
    queryClient = createQueryClient();
  }
  return queryClient;
};

// =============================================================================
// Provider Component
// =============================================================================

export interface QueryProviderProps {
  children: ReactNode;
  client?: QueryClient; // Allow injecting custom client for testing
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ 
  children, 
  client 
}) => {
  const clientInstance = client || getQueryClient();

  return (
    <QueryClientProvider client={clientInstance}>
      {children}
      {/* Show React Query DevTools in development */}
      {config.isDevelopment && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom-right"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
};

// =============================================================================
// Extended Query Client Hook
// =============================================================================

export interface QueryClientExtension {
  client: QueryClient;
  
  // Utility methods for common operations
  invalidateQueries: (queryKey: unknown[]) => Promise<void>;
  removeQueries: (queryKey: unknown[]) => void;
  setQueryData: <T,>(queryKey: unknown[], data: T) => void;
  getQueryData: <T,>(queryKey: unknown[]) => T | undefined;
  
  // Batch operations
  invalidateMultiple: (queryKeys: unknown[][]) => Promise<void>;
  prefetchQuery: <T,>(
    queryKey: unknown[], 
    queryFn: () => Promise<T>, 
    options?: { staleTime?: number }
  ) => Promise<void>;
  
  // Cache management
  clearCache: () => void;
  getCacheSize: () => number;
  
  // Error recovery
  refetchOnError: (queryKey: unknown[]) => Promise<void>;
  resetErrorBoundaries: () => void;
}

/**
 * Extended hook that provides the QueryClient with additional utility methods
 * for common operations like cache management and batch operations.
 */
export const useQueryClientExt = (): QueryClientExtension => {
  const client = useQueryClient();

  return {
    client,
    
    // Invalidate specific queries
    invalidateQueries: async (queryKey: unknown[]) => {
      await client.invalidateQueries({ queryKey });
    },
    
    // Remove queries from cache
    removeQueries: (queryKey: unknown[]) => {
      client.removeQueries({ queryKey });
    },
    
    // Set query data directly
    setQueryData: <T,>(queryKey: unknown[], data: T) => {
      client.setQueryData(queryKey, data);
    },
    
    // Get query data from cache
    getQueryData: <T,>(queryKey: unknown[]): T | undefined => {
      return client.getQueryData<T>(queryKey);
    },
    
    // Invalidate multiple query patterns
    invalidateMultiple: async (queryKeys: unknown[][]) => {
      await Promise.all(
        queryKeys.map(queryKey => 
          client.invalidateQueries({ queryKey })
        )
      );
    },
    
    // Prefetch a query
    prefetchQuery: async <T,>(
      queryKey: unknown[], 
      queryFn: () => Promise<T>, 
      options?: { staleTime?: number }
    ) => {
      await client.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes default
      });
    },
    
    // Clear all cached data
    clearCache: () => {
      client.clear();
    },
    
    // Get approximate cache size (number of queries)
    getCacheSize: () => {
      return client.getQueryCache().getAll().length;
    },
    
    // Refetch queries that have errors
    refetchOnError: async (queryKey: unknown[]) => {
      await client.refetchQueries({
        queryKey,
        type: 'all',
      });
    },
    
    // Reset error boundaries for failed queries
    resetErrorBoundaries: () => {
      client.resetQueries({
        type: 'all',
      });
    },
  };
};

// =============================================================================
// Query Key Factories
// =============================================================================

/**
 * Query key factory helpers for consistent key generation
 */
export const queryKeys = {
  // User-related queries
  users: {
    all: ['users'] as const,
    list: (filters?: Record<string, any>) => ['users', 'list', filters] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
    profile: (id: string) => ['users', 'profile', id] as const,
  },
  
  // Patient-related queries
  patients: {
    all: ['patients'] as const,
    list: (filters?: Record<string, any>) => ['patients', 'list', filters] as const,
    detail: (id: string) => ['patients', 'detail', id] as const,
    records: (patientId: string) => ['patients', patientId, 'records'] as const,
  },
  
  // Appointment-related queries
  appointments: {
    all: ['appointments'] as const,
    list: (filters?: Record<string, any>) => ['appointments', 'list', filters] as const,
    detail: (id: string) => ['appointments', 'detail', id] as const,
    byPatient: (patientId: string) => ['appointments', 'patient', patientId] as const,
    byDoctor: (doctorId: string) => ['appointments', 'doctor', doctorId] as const,
  },
  
  // Medical records
  medicalRecords: {
    all: ['medical-records'] as const,
    list: (patientId: string) => ['medical-records', 'patient', patientId] as const,
    detail: (id: string) => ['medical-records', 'detail', id] as const,
  },
  
  // Prescriptions
  prescriptions: {
    all: ['prescriptions'] as const,
    list: (patientId: string) => ['prescriptions', 'patient', patientId] as const,
    detail: (id: string) => ['prescriptions', 'detail', id] as const,
  },
  
  // Lab results
  labResults: {
    all: ['lab-results'] as const,
    list: (patientId: string) => ['lab-results', 'patient', patientId] as const,
    detail: (id: string) => ['lab-results', 'detail', id] as const,
  },
};

// =============================================================================
// Mutation Key Factories
// =============================================================================

/**
 * Mutation key factory helpers for consistent key generation
 */
export const mutationKeys = {
  // User mutations
  users: {
    create: ['users', 'create'] as const,
    update: (id: string) => ['users', 'update', id] as const,
    delete: (id: string) => ['users', 'delete', id] as const,
  },
  
  // Patient mutations
  patients: {
    create: ['patients', 'create'] as const,
    update: (id: string) => ['patients', 'update', id] as const,
    delete: (id: string) => ['patients', 'delete', id] as const,
  },
  
  // Appointment mutations
  appointments: {
    create: ['appointments', 'create'] as const,
    update: (id: string) => ['appointments', 'update', id] as const,
    delete: (id: string) => ['appointments', 'delete', id] as const,
    cancel: (id: string) => ['appointments', 'cancel', id] as const,
    complete: (id: string) => ['appointments', 'complete', id] as const,
  },
  
  // Authentication mutations
  auth: {
    login: ['auth', 'login'] as const,
    logout: ['auth', 'logout'] as const,
    register: ['auth', 'register'] as const,
    refreshToken: ['auth', 'refresh'] as const,
    changePassword: ['auth', 'change-password'] as const,
  },
};

// =============================================================================
// Error Recovery Utilities
// =============================================================================

/**
 * Utility functions for handling query errors and recovery
 */
export const queryErrorUtils = {
  /**
   * Check if an error is a network error
   */
  isNetworkError: (error: any): boolean => {
    return error?.code === 'NETWORK_ERROR' || 
           error?.name === 'NetworkError' ||
           !navigator.onLine;
  },
  
  /**
   * Check if an error is a server error (5xx)
   */
  isServerError: (error: any): boolean => {
    return error?.status >= 500 && error?.status <= 599;
  },
  
  /**
   * Check if an error is a client error (4xx)
   */
  isClientError: (error: any): boolean => {
    return error?.status >= 400 && error?.status <= 499;
  },
  
  /**
   * Check if an error is retryable
   */
  isRetryable: (error: any): boolean => {
    return queryErrorUtils.isNetworkError(error) || 
           queryErrorUtils.isServerError(error);
  },
  
  /**
   * Get user-friendly error message
   */
  getErrorMessage: (error: any): string => {
    if (queryErrorUtils.isNetworkError(error)) {
      return 'Network connection error. Please check your internet connection.';
    }
    
    if (error?.status === 401) {
      return 'Authentication required. Please log in.';
    }
    
    if (error?.status === 403) {
      return 'You do not have permission to perform this action.';
    }
    
    if (error?.status === 404) {
      return 'The requested resource was not found.';
    }
    
    if (queryErrorUtils.isServerError(error)) {
      return 'Server error. Please try again later.';
    }
    
    return error?.message || 'An unexpected error occurred.';
  },
};

// Export the singleton client for use in services
export { getQueryClient };

/*
Self-check comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (creates React Query provider with hooks)
- [x] Reads config from `@/app/config` 
- [x] Exports default named component (QueryProvider)
- [x] Adds basic ARIA and keyboard handlers (not applicable for query provider)
- [x] Provides QueryClient with sensible defaults and error handling
- [x] Integrates with event bus for cross-cutting concerns
- [x] Includes React Query DevTools in development mode
- [x] Provides extended hook with utility methods
- [x] Includes query and mutation key factories for consistency
- [x] Includes error recovery utilities
- [x] Uses import.meta.env through config for environment variables
*/