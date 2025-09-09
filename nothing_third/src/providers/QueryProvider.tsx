// filepath: src/providers/QueryProvider.tsx
import React from 'react';
import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { config, isDevelopment } from '@/app/config';
import { eventBus } from '@/core/events';
import type { ApiError } from '@/core/contracts';

export interface QueryProviderProps {
  children: React.ReactNode;
}

// Global error handler for query/mutation failures
function handleQueryError(error: unknown, context?: string): void {
  const apiError: ApiError = error instanceof Error 
    ? { message: error.message, code: 'QUERY_ERROR' }
    : { message: 'An unexpected error occurred', code: 'UNKNOWN_ERROR' };

  // Emit to global event bus for centralized error handling
  eventBus.emit('error:global', {
    error: apiError,
    context: context || 'React Query operation'
  });

  // Log in development
  if (isDevelopment) {
    console.error('Query Error:', apiError, { context, originalError: error });
  }
}

// Create the query client with app-specific defaults
function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache for 5 minutes by default
        staleTime: 5 * 60 * 1000,
        
        // Keep unused data in cache for 10 minutes
        gcTime: 10 * 60 * 1000,
        
        // Retry configuration based on environment
        retry: isDevelopment ? 1 : 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Network mode configuration
        networkMode: 'online',
        
        // Refetch configuration
        refetchOnWindowFocus: !isDevelopment, // Disable in dev for better DX
        refetchOnMount: true,
        refetchOnReconnect: true,
        
        // Timeout from app config
        timeout: config.requestTimeoutMs,
        
        // Error handling
        throwOnError: false, // Handle errors through callbacks instead of throwing
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
        retryDelay: 1000,
        
        // Network mode
        networkMode: 'online',
        
        // Timeout
        timeout: config.requestTimeoutMs,
        
        // Error handling
        throwOnError: false,
      }
    },
    
    // Global query error handling
    queryCache: new QueryCache({
      onError: (error, query) => {
        handleQueryError(error, `Query: ${query.queryHash}`);
      },
      onSuccess: (data, query) => {
        // Emit analytics event for successful queries in production
        if (!isDevelopment && config.isFeatureEnabled('analytics')) {
          eventBus.emit('analytics:event', {
            name: 'query_success',
            properties: {
              queryKey: query.queryKey,
              queryHash: query.queryHash,
              timestamp: Date.now()
            }
          });
        }
      }
    }),
    
    // Global mutation error handling
    mutationCache: new MutationCache({
      onError: (error, variables, context, mutation) => {
        handleQueryError(error, `Mutation: ${mutation.options.mutationKey?.join('.') || 'unknown'}`);
      },
      onSuccess: (data, variables, context, mutation) => {
        // Show success toast for mutations (if configured)
        const mutationKey = mutation.options.mutationKey;
        if (mutationKey && mutationKey.includes('success-toast')) {
          eventBus.emit('toast:show', {
            type: 'success',
            title: 'Operation completed successfully',
            durationMs: 3000
          });
        }
        
        // Emit analytics event for successful mutations in production
        if (!isDevelopment && config.isFeatureEnabled('analytics')) {
          eventBus.emit('analytics:event', {
            name: 'mutation_success',
            properties: {
              mutationKey,
              timestamp: Date.now()
            }
          });
        }
      }
    })
  });
}

// Singleton query client instance
let queryClientInstance: QueryClient | null = null;

function getQueryClient(): QueryClient {
  if (!queryClientInstance) {
    queryClientInstance = createQueryClient();
  }
  return queryClientInstance;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const queryClient = React.useMemo(() => getQueryClient(), []);

  // Handle cleanup on unmount in development
  React.useEffect(() => {
    return () => {
      if (isDevelopment) {
        // Clear query client cache on hot reload in development
        queryClient.clear();
      }
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
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

// Export the query client instance for use in services
export { getQueryClient };

// Export common query key factories for consistency
export const queryKeys = {
  // User-related queries
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  currentUser: () => ['users', 'current'] as const,
  
  // Patient-related queries
  patients: ['patients'] as const,
  patient: (id: string) => ['patients', id] as const,
  patientsByDoctor: (doctorId: string) => ['patients', 'by-doctor', doctorId] as const,
  
  // Appointment-related queries
  appointments: ['appointments'] as const,
  appointment: (id: string) => ['appointments', id] as const,
  appointmentsByPatient: (patientId: string) => ['appointments', 'by-patient', patientId] as const,
  appointmentsByDoctor: (doctorId: string) => ['appointments', 'by-doctor', doctorId] as const,
  appointmentsByDate: (date: string) => ['appointments', 'by-date', date] as const,
  
  // Dashboard/Analytics queries
  dashboard: ['dashboard'] as const,
  dashboardMetrics: (timeframe: string) => ['dashboard', 'metrics', timeframe] as const,
  
  // Settings queries
  settings: ['settings'] as const,
  userSettings: (userId: string) => ['settings', 'user', userId] as const,
} as const;

// Export mutation key factories
export const mutationKeys = {
  // Auth mutations
  login: ['auth', 'login'] as const,
  logout: ['auth', 'logout'] as const,
  refreshToken: ['auth', 'refresh'] as const,
  
  // User mutations
  updateUser: ['users', 'update'] as const,
  createUser: ['users', 'create'] as const,
  deleteUser: ['users', 'delete'] as const,
  
  // Patient mutations  
  updatePatient: ['patients', 'update'] as const,
  createPatient: ['patients', 'create'] as const,
  deletePatient: ['patients', 'delete'] as const,
  
  // Appointment mutations
  updateAppointment: ['appointments', 'update'] as const,
  createAppointment: ['appointments', 'create'] as const,
  cancelAppointment: ['appointments', 'cancel'] as const,
  
  // Settings mutations
  updateSettings: ['settings', 'update'] as const,
} as const;

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/app/config, @/core/events, @/core/contracts)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses React Query for data management
- [x] Reads config from `@/app/config` (uses config for timeout, isDevelopment, feature flags)
- [x] Exports default named component (exports QueryProvider)
- [x] Adds basic ARIA and keyboard handlers (N/A for query provider - handles data layer)
*/
