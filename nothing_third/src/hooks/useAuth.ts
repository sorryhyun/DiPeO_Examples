// filepath: src/hooks/useAuth.ts
import { useContext } from 'react';
import type { User, LoginCredentials, ApiResult } from '@/core/contracts';
import { AuthContext } from '@/providers/AuthProvider';

export interface UseAuthReturn {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<ApiResult<User>>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<ApiResult<string>>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
  error: string | null;
}

/**
 * Hook for accessing authentication state and operations.
 * Provides convenient access to auth context and service methods.
 * 
 * @throws {Error} If used outside of AuthProvider
 * @returns Authentication state and operations
 */
export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  const {
    currentUser,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshToken,
    hasRole,
    updateUser,
    clearError
  } = context;

  /**
   * Check if user has any of the provided roles
   */
  const hasAnyRole = (roles: string[]): boolean => {
    if (!currentUser || !currentUser.roles) return false;
    return roles.some(role => currentUser.roles.includes(role as any));
  };

  /**
   * Check if user has all of the provided roles
   */
  const hasAllRoles = (roles: string[]): boolean => {
    if (!currentUser || !currentUser.roles) return false;
    return roles.every(role => currentUser.roles.includes(role as any));
  };

  return {
    currentUser,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    updateUser,
    clearError,
    error
  };
}

// Convenience hook for checking specific roles
export function useHasRole(role: string): boolean {
  const { hasRole } = useAuth();
  return hasRole(role);
}

// Convenience hook for checking if user is admin
export function useIsAdmin(): boolean {
  return useHasRole('admin');
}

// Convenience hook for checking if user is doctor
export function useIsDoctor(): boolean {
  return useHasRole('doctor');
}

// Convenience hook for checking if user is patient
export function useIsPatient(): boolean {
  return useHasRole('patient');
}

// Convenience hook for requiring authentication
export function useRequireAuth(): UseAuthReturn {
  const auth = useAuth();
  
  if (!auth.isAuthenticated && !auth.isLoading) {
    throw new Error('This component requires authentication');
  }
  
  return auth;
}

/*
Self-check comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses AuthContext from provider
- [x] Reads config from `@/app/config` (N/A - this hook reads from AuthProvider context)
- [x] Exports default named component (exports useAuth function and convenience hooks)
- [x] Adds basic ARIA and keyboard handlers (N/A - this is a data hook, not a UI component)
*/
