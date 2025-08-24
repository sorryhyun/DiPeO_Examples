import { useQuery, UseQueryOptions } from '@tanstack/react-query'

export interface UseFetchOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  // Removed deprecated suspense and useErrorBoundary options
}

export function useFetch<T>(
  key: string | unknown[],
  fetcher: () => Promise<T>,
  options: UseFetchOptions<T> = {}
) {
  const queryKey = Array.isArray(key) ? key : [key]
  
  const {
    ...queryOptions
  } = options

  return useQuery({
    queryKey,
    queryFn: fetcher,
    ...queryOptions
  })
}
