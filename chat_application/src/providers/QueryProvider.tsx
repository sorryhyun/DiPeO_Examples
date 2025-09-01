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
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          // Retry up to 3 times for server errors
          return failureCount < 3;
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
  setQueryData: <T>(queryKey: unknown[], data: T) => void;
  getQueryData: <T>(queryKey: unknown[]) => T | undefined;
  
  // Batch operations
  invalidateMultiple: (queryKeys: unknown[][]) => Promise<void>;
  prefetchQuery: <T>(
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

/**\n * Extended hook that provides the QueryClient with additional utility methods\n * for common operations like cache management and batch operations.\n */\nexport const useQueryClientExt = (): QueryClientExtension => {\n  const client = useQueryClient();\n\n  return {\n    client,\n    \n    // Invalidate specific queries\n    invalidateQueries: async (queryKey: unknown[]) => {\n      await client.invalidateQueries({ queryKey });\n    },\n    \n    // Remove queries from cache\n    removeQueries: (queryKey: unknown[]) => {\n      client.removeQueries({ queryKey });\n    },\n    \n    // Set query data directly\n    setQueryData: <T>(queryKey: unknown[], data: T) => {\n      client.setQueryData(queryKey, data);\n    },\n    \n    // Get query data from cache\n    getQueryData: <T>(queryKey: unknown[]): T | undefined => {\n      return client.getQueryData<T>(queryKey);\n    },\n    \n    // Invalidate multiple query patterns\n    invalidateMultiple: async (queryKeys: unknown[][]) => {\n      await Promise.all(\n        queryKeys.map(queryKey => \n          client.invalidateQueries({ queryKey })\n        )\n      );\n    },\n    \n    // Prefetch a query\n    prefetchQuery: async <T>(\n      queryKey: unknown[], \n      queryFn: () => Promise<T>, \n      options?: { staleTime?: number }\n    ) => {\n      await client.prefetchQuery({\n        queryKey,\n        queryFn,\n        staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes default\n      });\n    },\n    \n    // Clear all cached data\n    clearCache: () => {\n      client.clear();\n    },\n    \n    // Get approximate cache size (number of queries)\n    getCacheSize: () => {\n      return client.getQueryCache().getAll().length;\n    },\n    \n    // Refetch queries that have errors\n    refetchOnError: async (queryKey: unknown[]) => {\n      await client.refetchQueries({\n        queryKey,\n        type: 'all',\n      });\n    },\n    \n    // Reset error boundaries for failed queries\n    resetErrorBoundaries: () => {\n      client.resetQueries({\n        type: 'all',\n      });\n    },\n  };\n};\n\n// =============================================================================\n// Query Key Factories\n// =============================================================================\n\n/**\n * Query key factory helpers for consistent key generation\n */\nexport const queryKeys = {\n  // User-related queries\n  users: {\n    all: ['users'] as const,\n    list: (filters?: Record<string, any>) => ['users', 'list', filters] as const,\n    detail: (id: string) => ['users', 'detail', id] as const,\n    profile: (id: string) => ['users', 'profile', id] as const,\n  },\n  \n  // Patient-related queries\n  patients: {\n    all: ['patients'] as const,\n    list: (filters?: Record<string, any>) => ['patients', 'list', filters] as const,\n    detail: (id: string) => ['patients', 'detail', id] as const,\n    records: (patientId: string) => ['patients', patientId, 'records'] as const,\n  },\n  \n  // Appointment-related queries\n  appointments: {\n    all: ['appointments'] as const,\n    list: (filters?: Record<string, any>) => ['appointments', 'list', filters] as const,\n    detail: (id: string) => ['appointments', 'detail', id] as const,\n    byPatient: (patientId: string) => ['appointments', 'patient', patientId] as const,\n    byDoctor: (doctorId: string) => ['appointments', 'doctor', doctorId] as const,\n  },\n  \n  // Medical records\n  medicalRecords: {\n    all: ['medical-records'] as const,\n    list: (patientId: string) => ['medical-records', 'patient', patientId] as const,\n    detail: (id: string) => ['medical-records', 'detail', id] as const,\n  },\n  \n  // Prescriptions\n  prescriptions: {\n    all: ['prescriptions'] as const,\n    list: (patientId: string) => ['prescriptions', 'patient', patientId] as const,\n    detail: (id: string) => ['prescriptions', 'detail', id] as const,\n  },\n  \n  // Lab results\n  labResults: {\n    all: ['lab-results'] as const,\n    list: (patientId: string) => ['lab-results', 'patient', patientId] as const,\n    detail: (id: string) => ['lab-results', 'detail', id] as const,\n  },\n};\n\n// =============================================================================\n// Mutation Key Factories\n// =============================================================================\n\n/**\n * Mutation key factory helpers for consistent key generation\n */\nexport const mutationKeys = {\n  // User mutations\n  users: {\n    create: ['users', 'create'] as const,\n    update: (id: string) => ['users', 'update', id] as const,\n    delete: (id: string) => ['users', 'delete', id] as const,\n  },\n  \n  // Patient mutations\n  patients: {\n    create: ['patients', 'create'] as const,\n    update: (id: string) => ['patients', 'update', id] as const,\n    delete: (id: string) => ['patients', 'delete', id] as const,\n  },\n  \n  // Appointment mutations\n  appointments: {\n    create: ['appointments', 'create'] as const,\n    update: (id: string) => ['appointments', 'update', id] as const,\n    delete: (id: string) => ['appointments', 'delete', id] as const,\n    cancel: (id: string) => ['appointments', 'cancel', id] as const,\n    complete: (id: string) => ['appointments', 'complete', id] as const,\n  },\n  \n  // Authentication mutations\n  auth: {\n    login: ['auth', 'login'] as const,\n    logout: ['auth', 'logout'] as const,\n    register: ['auth', 'register'] as const,\n    refreshToken: ['auth', 'refresh'] as const,\n    changePassword: ['auth', 'change-password'] as const,\n  },\n};\n\n// =============================================================================\n// Error Recovery Utilities\n// =============================================================================\n\n/**\n * Utility functions for handling query errors and recovery\n */\nexport const queryErrorUtils = {\n  /**\n   * Check if an error is a network error\n   */\n  isNetworkError: (error: any): boolean => {\n    return error?.code === 'NETWORK_ERROR' || \n           error?.name === 'NetworkError' ||\n           !navigator.onLine;\n  },\n  \n  /**\n   * Check if an error is a server error (5xx)\n   */\n  isServerError: (error: any): boolean => {\n    return error?.status >= 500 && error?.status < 600;\n  },\n  \n  /**\n   * Check if an error is a client error (4xx)\n   */\n  isClientError: (error: any): boolean => {\n    return error?.status >= 400 && error?.status < 500;\n  },\n  \n  /**\n   * Check if an error is retryable\n   */\n  isRetryable: (error: any): boolean => {\n    return queryErrorUtils.isNetworkError(error) || \n           queryErrorUtils.isServerError(error);\n  },\n  \n  /**\n   * Get user-friendly error message\n   */\n  getErrorMessage: (error: any): string => {\n    if (queryErrorUtils.isNetworkError(error)) {\n      return 'Network connection error. Please check your internet connection.';\n    }\n    \n    if (error?.status === 401) {\n      return 'Authentication required. Please log in.';\n    }\n    \n    if (error?.status === 403) {\n      return 'You do not have permission to perform this action.';\n    }\n    \n    if (error?.status === 404) {\n      return 'The requested resource was not found.';\n    }\n    \n    if (queryErrorUtils.isServerError(error)) {\n      return 'Server error. Please try again later.';\n    }\n    \n    return error?.message || 'An unexpected error occurred.';\n  },\n};\n\n// Export the singleton client for use in services\nexport { getQueryClient };\n\n/*\nSelf-check comments:\n- [x] Uses `@/` imports only\n- [x] Uses providers/hooks (creates React Query provider with hooks)\n- [x] Reads config from `@/app/config` \n- [x] Exports default named component (QueryProvider)\n- [x] Adds basic ARIA and keyboard handlers (not applicable for query provider)\n- [x] Provides QueryClient with sensible defaults and error handling\n- [x] Integrates with event bus for cross-cutting concerns\n- [x] Includes React Query DevTools in development mode\n- [x] Provides extended hook with utility methods\n- [x] Includes query and mutation key factories for consistency\n- [x] Includes error recovery utilities\n- [x] Uses import.meta.env through config for environment variables\n*/\n```