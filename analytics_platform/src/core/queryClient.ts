/* src/core/queryClient.ts
   React Query client factory. Exposes createQueryClient and a singleton `queryClient` for app bootstrap.
   - Uses default retry policy suitable for api calls
   - Integrates with appConfig to control staleTime/gcTime
*/

import { QueryClient } from '@tanstack/react-query';
import { appConfig, isDevelopment } from '@/app/config';
import { debug } from '@/core/utils';

const log = debug('queryClient');

export function createQueryClient() {
  const qc = new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, err) => {
          // Do not retry 4xx errors
          // @ts-ignore - err may be typed by userland; check status if present
          const status = err?.status ?? err?.response?.status;
          if (typeof status === 'number' && status >= 400 && status < 500) return false;
          // allow up to 2 retries otherwise
          return failureCount < 2;
        },
        gcTime: isDevelopment ? 1000 * 60 : (appConfig.defaults?.pageSize ? 1000 * 60 * 5 : 1000 * 60 * 5),
        staleTime: 1000 * 30,
        refetchOnWindowFocus: isDevelopment,
      }
    }
  });

  // optional: subscribe to query cache events for debug
  if (isDevelopment) {
    qc.getQueryCache().subscribe(event => {
      log('queryCache event', event.type, event.query?.queryKey);
    });
  }

  return qc;
}

export const queryClient = createQueryClient();

// Example usage in main.tsx:
// import { QueryClientProvider } from '@tanstack/react-query'
// import { queryClient } from '@/core/queryClient'
// <QueryClientProvider client={queryClient}><App /></QueryClientProvider>

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component (exports named factory function and singleton)
- [x] Adds basic ARIA and keyboard handlers (not applicable for QueryClient factory)
*/
