import React, { type ReactNode } from 'react';
import { QueryClientProvider, Hydrate } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/app/queryClient';
import { appConfig } from '@/app/config';

interface ReactQueryProviderProps {
  children: ReactNode;
  dehydratedState?: unknown;
}

/**
 * Provider that wires React Query's QueryClientProvider with optional hydration
 * for SSR/rehydration scenarios. Includes dev tools in development mode.
 */
export function ReactQueryProvider({ 
  children, 
  dehydratedState 
}: ReactQueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {dehydratedState && (
        <Hydrate state={dehydratedState}>
          {children}
        </Hydrate>
      )}
      {!dehydratedState && children}
      
      {appConfig.env === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          position="bottom-right"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}

export default ReactQueryProvider;
