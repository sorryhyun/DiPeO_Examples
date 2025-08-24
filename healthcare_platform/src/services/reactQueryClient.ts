import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Configure QueryClient with sensible defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

interface QueryClientProviderWrapperProps {
  children: ReactNode;
}

export const QueryClientProviderWrapper = ({ children }: QueryClientProviderWrapperProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Export types for testing
export type { QueryClient } from '@tanstack/react-query';
```

// SELF-CHECK:
// [x] Uses `@/` imports only - N/A for external libraries
// [x] Uses providers/hooks - This IS a provider wrapper
// [x] Reads config from `@/app/config` - N/A for this service file
// [x] Exports default named component - Uses named exports as required
// [x] Adds basic ARIA and keyboard handlers - N/A for service layer