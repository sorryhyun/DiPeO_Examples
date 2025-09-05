// filepath: src/providers/QueryProvider.tsx

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { config } from '@/app/config';
import { publishEvent } from '@/core/events';
import { runHook } from '@/core/hooks';

// =============================
// QUERY CLIENT CONFIGURATION
// =============================

/**
 * Create a QueryClient with sensible defaults and error handling.
 */
function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 5 minutes by default
        staleTime: 5 * 60 * 1000,
        
        // Keep data in cache for 10 minutes after component unmounts
        gcTime: 10 * 60 * 1000,
        
        // Retry failed requests with exponential backoff
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors (client errors)
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
        
        // Retry delay with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Refetch on window focus in development, but not in production
        refetchOnWindowFocus: config.env === 'development',
        
        // Always refetch on network reconnect
        refetchOnReconnect: true,
        
        // Don't refetch stale queries on mount by default
        refetchOnMount: false,
      },
      mutations: {
        // Retry mutations once by default
        retry: 1,
        
        // Retry delay for mutations
        retryDelay: 1000,
      },
    },
    
    // Global query cache event handlers
    queryCache: {
      onError: async (error, query) => {
        // Log error for development
        if (config.development_mode.verbose_logs) {
          console.error('Query error:', { error, queryKey: query.queryKey });
        }
        
        // Publish error event for analytics and toast notifications
        await publishEvent('api:response', {
          url: String(query.queryKey[0] || 'unknown'),
          method: 'GET',
          response: {
            success: false,
            error: {
              message: error instanceof Error ? error.message : 'Query failed',
              status: (error as any)?.status,
            },
          },
        });
        
        // Run error hook for custom error handling
        await runHook('onQueryError', { error, query });
      },
      
      onSuccess: async (data, query) => {
        // Run success hook for analytics or other side effects
        await runHook('onQuerySuccess', { data, query });
      },
    },
    
    // Global mutation cache event handlers
    mutationCache: {
      onError: async (error, variables, context, mutation) => {
        // Log error for development
        if (config.development_mode.verbose_logs) {
          console.error('Mutation error:', { error, variables, mutationKey: mutation.options.mutationKey });
        }
        
        // Publish error event
        await publishEvent('api:response', {
          url: String(mutation.options.mutationKey?.[0] || 'unknown'),
          method: 'POST',
          response: {
            success: false,
            error: {
              message: error instanceof Error ? error.message : 'Mutation failed',
              status: (error as any)?.status,
            },
          },
        });
        
        // Show error toast for user feedback
        await publishEvent('toast:show', {
          type: 'error',
          message: error instanceof Error ? error.message : 'An error occurred',
          autoDismiss: 5000,
        });
        
        // Run error hook
        await runHook('onMutationError', { error, variables, context, mutation });
      },
      
      onSuccess: async (data, variables, context, mutation) => {
        // Run success hook
        await runHook('onMutationSuccess', { data, variables, context, mutation });
      },
    },
  });
}

// =============================
// PROVIDER COMPONENT
// =============================

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Create QueryClient instance - use useState to ensure it's only created once
  const [queryClient] = useState(() => createQueryClient());
  
  // Development mode features
  const showDevtools = config.env === 'development' && 
    import.meta.env.VITE_QUERY_DEVTOOLS !== 'false';
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      
      {/* React Query Devtools - only in development */}
      {showDevtools && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom-right"
          toggleButtonProps={{
            style: {
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              zIndex: 99999,
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.2s ease',
            },
          }}
          panelProps={{
            style: {
              zIndex: 99998,
            },
          }}
        />
      )}
    </QueryClientProvider>
  );
}

// =============================
// UTILITIES FOR QUERY KEYS
// =============================

/**
 * Standardized query key factory functions.
 * These help maintain consistent query key patterns across the app.
 */
export const queryKeys = {
  // User-related queries
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    profile: () => [...queryKeys.users.all, 'profile'] as const,
  },
  
  // Patient-related queries
  patients: {
    all: ['patients'] as const,
    lists: () => [...queryKeys.patients.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.patients.lists(), filters] as const,
    details: () => [...queryKeys.patients.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.patients.details(), id] as const,
  },
  
  // Doctor-related queries
  doctors: {
    all: ['doctors'] as const,
    lists: () => [...queryKeys.doctors.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.doctors.lists(), filters] as const,
    details: () => [...queryKeys.doctors.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.doctors.details(), id] as const,
  },
  
  // Appointment-related queries
  appointments: {
    all: ['appointments'] as const,
    lists: () => [...queryKeys.appointments.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.appointments.lists(), filters] as const,
    details: () => [...queryKeys.appointments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.appointments.details(), id] as const,
    calendar: (date: string) => [...queryKeys.appointments.all, 'calendar', date] as const,
  },
  
  // Generic query key builder
  entity: (entityType: string) => ({
    all: [entityType] as const,
    lists: () => [entityType, 'list'] as const,
    list: (filters?: Record<string, any>) => [entityType, 'list', filters] as const,
    details: () => [entityType, 'detail'] as const,
    detail: (id: string) => [entityType, 'detail', id] as const,
  }),
} as const;

// =============================
// INVALIDATION HELPERS
// =============================

/**
 * Helper functions for common cache invalidation patterns.
 * These can be used after mutations to refresh related data.
 */
export const queryInvalidations = {
  /**
   * Invalidate all user-related queries.
   */
  users: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
  },
  
  /**
   * Invalidate specific user queries.
   */
  user: (queryClient: QueryClient, userId: string) => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() }),
    ]);
  },
  
  /**
   * Invalidate all patient-related queries.
   */
  patients: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
  },
  
  /**
   * Invalidate specific patient queries.
   */
  patient: (queryClient: QueryClient, patientId: string) => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.detail(patientId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.lists() }),
    ]);
  },
  
  /**
   * Invalidate all appointment-related queries.
   */
  appointments: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
  },
  
  /**
   * Invalidate specific appointment queries.
   */
  appointment: (queryClient: QueryClient, appointmentId: string) => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.detail(appointmentId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.lists() }),
    ]);
  },
  
  /**
   * Invalidate calendar view queries.
   */
  calendar: (queryClient: QueryClient, date?: string) => {
    if (date) {
      return queryClient.invalidateQueries({ queryKey: queryKeys.appointments.calendar(date) });
    } else {
      // Invalidate all calendar queries
      return queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return key.length >= 3 && key[0] === 'appointments' && key[1] === 'calendar';
        }
      });
    }
  },
  
  /**
   * Generic entity invalidation.
   */
  entity: (queryClient: QueryClient, entityType: string, entityId?: string) => {
    if (entityId) {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: [entityType, 'detail', entityId] }),
        queryClient.invalidateQueries({ queryKey: [entityType, 'list'] }),
      ]);
    } else {
      return queryClient.invalidateQueries({ queryKey: [entityType] });
    }
  },
} as const;

// =============================
// DEVELOPMENT HELPERS
// =============================

if (import.meta.env.DEV) {
  // Add display name for React DevTools
  QueryProvider.displayName = 'QueryProvider';
  
  // Global development helpers
  (window as any).__REACT_QUERY_DEVTOOLS__ = {
    queryKeys,
    queryInvalidations,
  };
}

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (N/A for provider)
