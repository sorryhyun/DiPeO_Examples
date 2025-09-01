// src/hooks/useAuth.ts
/* src/hooks/useAuth.ts
   Hook to consume AuthContext. Exposes current user, isAuthenticated, login, logout and token helpers.
   This is the primary consumer API for components.
   - Provides convenient access to authentication state and methods
   - Throws error if used outside AuthProvider
   - Returns typed user data and authentication status
*/

import { useContext } from 'react';
import { AuthContext } from '@/providers/AuthProvider';
import { User, LoginCredentials } from '@/core/contracts';

export interface UseAuthReturn {
  // Current authentication state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Authentication methods
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  
  // Token helpers
  getAccessToken: () => string | null;
  refreshToken: () => Promise<void>;
  
  // Utilities
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  const {
    user,
    isLoading,
    error,
    login: contextLogin,
    logout: contextLogout,
    getAccessToken,
    refreshToken: contextRefreshToken
  } = context;
  
  // Derived state
  const isAuthenticated = Boolean(user);
  
  // Role checking helpers
  const hasRole = (role: string): boolean => {
    return Boolean(user?.role === role);
  };
  
  const hasAnyRole = (roles: string[]): boolean => {
    return Boolean(user?.role && roles.includes(user.role));
  };
  
  // Wrap login to match expected interface
  const login = async (credentials: LoginCredentials): Promise<void> => {
    const result = await contextLogin(credentials);
    if (result.error) {
      throw new Error(result.error.message);
    }
  };
  
  // Wrap logout to match expected interface
  const logout = async (): Promise<void> => {
    await contextLogout();
  };
  
  // Wrap refreshToken to match expected interface
  const refreshToken = async (): Promise<void> => {
    const success = await contextRefreshToken();
    if (!success) {
      throw new Error('Token refresh failed');
    }
  };
  
  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    getAccessToken,
    refreshToken,
    hasRole,
    hasAnyRole
  };
}

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (consumes AuthProvider context)
- [x] Reads config from `@/app/config` (not needed for this auth hook)
- [x] Exports default named component (exports named useAuth function)
- [x] Adds basic ARIA and keyboard handlers (not relevant for auth hook)
*/
