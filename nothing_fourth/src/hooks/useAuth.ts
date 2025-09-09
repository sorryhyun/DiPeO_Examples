// filepath: src/hooks/useAuth.ts

import { useCallback } from 'react';
import { useAuthSafe } from '@/providers/AuthProvider';
import { User, AuthTokens } from '@/core/contracts';
import { eventBus } from '@/core/events';
import { config } from '@/app/config';
import { debugLog } from '@/core/utils';

// ===============================================
// useAuth Hook Types
// ===============================================

interface UseAuthReturn {
  // State
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  
  // Computed helpers
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  isRole: (role: string) => boolean;
  
  // Development utilities
  isMockUser: boolean;
}

// ===============================================
// Main useAuth Hook
// ===============================================

export function useAuth(): UseAuthReturn {
  const authContext = useAuthSafe();
  
  // Enhanced login with event emission and error handling
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      debugLog('useAuth', 'Login attempt for email:', email);
      
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      // Delegate to AuthProvider
      await authContext.login(email, password);
      
      debugLog('useAuth', 'Login successful via AuthProvider');
      
    } catch (error) {
      debugLog('useAuth', 'Login failed:', error);
      throw error; // Re-throw to let AuthProvider handle state updates
    }
  }, [authContext]);
  
  // Enhanced logout with cleanup
  const logout = useCallback(async (): Promise<void> => {
    try {
      debugLog('useAuth', 'Logout initiated');
      
      // Emit pre-logout event for cleanup
      await eventBus.emit('auth:pre-logout', { 
        userId: authContext.user?.id,
        timestamp: new Date().toISOString()
      });
      
      // Delegate to AuthProvider
      await authContext.logout();
      
      debugLog('useAuth', 'Logout completed');
      
    } catch (error) {
      debugLog('useAuth', 'Logout error:', error);
      // Don't throw - logout should always succeed from UI perspective
    }
  }, [authContext]);
  
  // Enhanced token refresh with retry logic
  const refreshToken = useCallback(async (): Promise<void> => {
    try {
      debugLog('useAuth', 'Token refresh requested');
      
      if (!authContext.tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }
      
      await authContext.refreshToken();
      
      debugLog('useAuth', 'Token refresh successful');
      
    } catch (error) {
      debugLog('useAuth', 'Token refresh failed:', error);
      throw error;
    }
  }, [authContext]);
  
  // Role checking utilities
  const hasRole = useCallback((role: string): boolean => {
    if (!authContext.user?.roles || !Array.isArray(authContext.user.roles)) {
      return false;
    }
    return authContext.user.roles.includes(role as any);
  }, [authContext.user?.roles]);
  
  const hasAnyRole = useCallback((roles: string[]): boolean => {
    if (!roles.length) return true;
    return roles.some(role => hasRole(role));
  }, [hasRole]);
  
  const hasAllRoles = useCallback((roles: string[]): boolean => {
    if (!roles.length) return true;
    return roles.every(role => hasRole(role));
  }, [hasRole]);
  
  const isRole = useCallback((role: string): boolean => {
    return hasRole(role) && (authContext.user?.roles?.length === 1);
  }, [hasRole, authContext.user?.roles]);
  
  // Check if current user is the mock development user
  const isMockUser = authContext.user?.id === config.dev.mockUser?.id && config.isDevelopment;
  
  // Clear error handler
  const clearError = useCallback(() => {
    authContext.clearError();
  }, [authContext]);
  
  return {
    // State from AuthProvider
    user: authContext.user,
    tokens: authContext.tokens,
    isLoading: authContext.isLoading,
    isAuthenticated: authContext.isAuthenticated,
    error: authContext.error,
    
    // Enhanced actions
    login,
    logout,
    refreshToken,
    clearError,
    
    // Role utilities
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isRole,
    
    // Development utilities
    isMockUser,
  };
}

// ===============================================
// Additional Auth Utilities
// ===============================================

// Hook for components that only need to check authentication status
export function useAuthStatus(): {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
} {
  const { isAuthenticated, isLoading, user } = useAuth();
  return { isAuthenticated, isLoading, user };
}

// Hook for components that need role checking without full auth context
export function useAuthRoles(): {
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  isRole: (role: string) => boolean;
  user: User | null;
} {
  const { hasRole, hasAnyRole, hasAllRoles, isRole, user } = useAuth();
  return { hasRole, hasAnyRole, hasAllRoles, isRole, user };
}

// Hook for getting current user with type safety
export function useCurrentUser(): User | null {
  const { user } = useAuth();
  return user;
}

// Hook that throws if user is not authenticated (useful for protected components)
export function useRequireAuth(): User {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    throw new Promise(() => {}); // Suspense boundary will catch this
  }
  
  if (!isAuthenticated || !user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

// Default export for convenience
export default useAuth;
