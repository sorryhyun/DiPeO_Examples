import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseFetchOptions {
  pollInterval?: number;
  enabled?: boolean;
}

export interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useFetch<T>(
  fetchFn: () => Promise<T>,
  deps: React.DependencyList = [],
  options: UseFetchOptions = {}
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const { pollInterval, enabled = true } = options;

  const executeRequest = useCallback(async () => {
    if (!enabled) return;

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      
      if (isMountedRef.current) {
        setData(result);
        setLoading(false);
      }
    } catch (err) {
      if (isMountedRef.current && err instanceof Error && err.name !== 'AbortError') {
        setError(err);
        setLoading(false);
      }
    }
  }, [fetchFn, enabled]);

  const refetch = useCallback(async () => {
    await executeRequest();
  }, [executeRequest]);

  // Initial fetch and dependency-triggered refetch
  useEffect(() => {
    executeRequest();
  }, [...deps, executeRequest]);

  // Polling setup
  useEffect(() => {
    if (pollInterval && enabled) {
      pollIntervalRef.current = setInterval(() => {
        executeRequest();
      }, pollInterval);

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [pollInterval, enabled, executeRequest]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch
  };
}
