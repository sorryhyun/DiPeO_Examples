import { useQuery, UseQueryOptions } from '@tanstack/react-query'

export interface UseFetchOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  suspense?: boolean
  useErrorBoundary?: boolean
}

export function useFetch<T>(
  key: string | unknown[],
  fetcher: () => Promise<T>,
  options: UseFetchOptions<T> = {}
) {
  const queryKey = Array.isArray(key) ? key : [key]
  
  const {
    suspense = true,
    useErrorBoundary = true,
    ...queryOptions
  } = options

  return useQuery({
    queryKey,
    queryFn: fetcher,
    suspense,
    useErrorBoundary,
    ...queryOptions
  })
}
