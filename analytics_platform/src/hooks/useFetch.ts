// src/hooks/useFetch.ts
/* src/hooks/useFetch.ts
   Light wrapper around React Query + services/api.ts to standardize fetching patterns.
   - Provides a consistent interface for GET requests with caching
   - Integrates with the application's error handling and loading states
   - Uses React Query under the hood for optimal caching and background updates
   - Supports query invalidation and refetching patterns
*/

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { ApiResult } from '@/core/contracts';
import { appConfig } from '@/app/config';

// Options for useFetch hook extending React Query options
export interface UseFetchOptions<TData = unknown> extends Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'> {
  // Additional parameters for the API request
  params?: Record<string, any>;
  // Custom headers for this request
  headers?: Record<string, string>;
  // Whether to use mock data (overrides global config)
  useMockData?: boolean;
}

// Enhanced query result that includes the raw API response
export interface UseFetchResult<TData = unknown> {
  data: TData | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  isIdle: boolean;
  refetch: () => void;
  // Direct access to the raw API response for error details
  rawResponse?: ApiResult<TData>;
}

/**
 * Standardized data fetching hook using React Query
 * Provides consistent error handling, loading states, and caching
 * 
 * @param url - API endpoint URL (relative to apiBaseUrl)
 * @param options - Query options and request parameters
 * @returns Enhanced UseQueryResult with additional API response data
 */
export function useFetch<TData = unknown>(
  url: string,
  options: UseFetchOptions<TData> = {}
): UseFetchResult<TData> {
  const {
    params,
    headers,
    useMockData,
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes default
    ...queryOptions
  } = options;

  // Build query key including URL and params for proper caching
  const queryKey = ['fetch', url, params];

  // Query function that calls our standardized API client
  const queryFn = async (): Promise<TData> => {
    // Build query parameters for URL
    let fullUrl = url;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        fullUrl += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    const result = await apiClient.get<TData>(fullUrl, {
      headers,
      // Note: useMockData would be handled by individual services if needed
    });

    // Store raw response for error handling
    (queryFn as any).rawResponse = result;

    // Throw error if API call failed (React Query will handle it)
    if (result.error) {
      const error = new Error(result.error.message || 'API request failed');
      // Attach additional error context
      (error as any).code = result.error.code;
      (error as any).details = result.error.details;
      throw error;
    }

    // Return the data portion for normal React Query usage
    return result.data as TData;
  };

  // Execute the query using React Query
  const queryResult = useQuery({
    queryKey,
    queryFn,
    enabled,
    staleTime,
    // Default retry logic - can be overridden
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if ((error as any)?.code >= 400 && (error as any)?.code < 500) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    ...queryOptions
  });

  // Return enhanced result with raw response access
  const result: UseFetchResult<TData> = {
    data: queryResult.data,
    error: queryResult.error,
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    isSuccess: queryResult.isSuccess,
    isError: queryResult.isError,
    isIdle: queryResult.isPending,
    refetch: queryResult.refetch,
    rawResponse: (queryFn as any).rawResponse
  };

  return result;
}

// Convenience hook for paginated data fetching
export function useFetchPaginated<TData = unknown>(
  url: string,
  page: number = 1,
  pageSize: number = appConfig.defaults.pageSize,
  options: Omit<UseFetchOptions<TData>, 'params'> & { params?: Record<string, any> } = {}
) {
  return useFetch<TData>(url, {
    ...options,
    params: {
      page,
      pageSize,
      ...options.params
    }
  });
}

// Convenience hook for fetching with search/filter parameters
export function useFetchWithSearch<TData = unknown>(
  url: string,
  searchParams: Record<string, any> = {},
  options: Omit<UseFetchOptions<TData>, 'params'> & { params?: Record<string, any> } = {}
) {
  return useFetch<TData>(url, {
    ...options,
    params: {
      ...searchParams,
      ...options.params
    },
    // Enable only if we have meaningful search parameters
    enabled: options.enabled !== false && Object.keys(searchParams).some(key => 
      searchParams[key] !== undefined && searchParams[key] !== '' && searchParams[key] !== null
    )
  });
}

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component (exports named functions)
- [x] Adds basic ARIA and keyboard handlers (not relevant for data fetching hook)
*/
