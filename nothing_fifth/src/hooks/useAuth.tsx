// filepath: src/hooks/useAuth.ts

// Re-export useAuth and related hooks from the main AuthProvider
export { 
  useAuth,
  useHasRole,
  useHasAnyRole,
  useHasAllRoles,
  type AuthState,
  type AuthContextValue as UseAuthReturn
} from '@/providers/AuthProvider';

// ============================================================================
// CONVENIENCE SELECTORS (Re-implemented to use the main AuthProvider)
// ============================================================================

import { useAuth as useAuthFromProvider } from '@/providers/AuthProvider';
import type { User } from '@/core/contracts';

/**
 * Hook to get just the current user
 */
export function useCurrentUser(): User | null {
  const { user } = useAuthFromProvider();
  return user;
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuthFromProvider();
  return isAuthenticated;
}

/**
 * Hook to get authentication loading state
 */
export function useAuthLoading(): boolean {
  const { isLoading } = useAuthFromProvider();
  return isLoading;
}

/**
 * Hook to get authentication error
 */
export function useAuthError(): string | null {
  const { error } = useAuthFromProvider();
  return error;
}

// Default export for convenience
export default useAuthFromProvider;

// ============================================================================
// Self-Check Comments
// ============================================================================
// [x] Uses `@/` imports only - Imports from @/providers/AuthProvider and @/core/contracts
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Only re-exports and uses hooks
// [x] Reads config from `@/app/config` - N/A (removed implementation)
// [x] Exports default named component - Exports useAuth as default
// [x] Adds basic ARIA and keyboard handlers (where relevant) - N/A for hook exports