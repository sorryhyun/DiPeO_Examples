import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

/**
 * Wrapper around React Query's useQuery with sensible defaults for the LMS app.
 * 
 * @example
 * const { data: courses } = useQueryApi<Course[]>(['courses'], () => apiClient.get('/courses'));
 * const { data: course } = useQueryApi<Course>(['courses', courseId], () => apiClient.get(`/courses/${courseId}`));
 */
export function useQueryApi<T>(
  queryKey: string | readonly unknown[],
  queryFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T>({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn,
    staleTime: 5 * 60 * 1000, // 5 minutes - consistent with QueryProvider
    ...options,
  });
}

/**
 * Wrapper around React Query's useMutation with typed variables and response.
 * 
 * @example
 * const loginMutation = useMutationApi<LoginResponse, LoginRequest>(
 *   (credentials) => apiClient.post('/auth/login', credentials)
 * );
 * 
 * const createCourseMutation = useMutationApi<Course, CreateCourseRequest>(
 *   (courseData) => apiClient.post('/courses', courseData),
 *   {
 *     onSuccess: () => {
 *       queryClient.invalidateQueries(['courses']);
 *     }
 *   }
 * );
 */
export function useMutationApi<TData = unknown, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn,
    ...options,
  });
}

// Export useApi as alias to useQueryApi for compatibility
export const useApi = useQueryApi;
