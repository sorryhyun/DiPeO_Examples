// src/app/App.tsx
/* src/app/App.tsx
   Root App component that wires together all top-level providers and the router.
   - Wraps the entire app with QueryClientProvider for React Query
   - Provides authentication context via AuthProvider
   - Provides theme context via ThemeProvider
   - Renders the main Router component
*/

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/core/queryClient';
import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Router } from '@/app/router';
import { isDevelopment } from '@/app/config';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router />
          {isDevelopment && <ReactQueryDevtools initialIsOpen={false} />}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (not applicable for root App component)
*/
