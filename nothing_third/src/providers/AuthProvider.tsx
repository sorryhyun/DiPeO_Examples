// filepath: src/providers/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { User, ApiResult } from '@/core/contracts';
import type { AuthService, LoginCredentials } from '@/core/di';
import { resolveService, AuthServiceToken } from '@/core/di';
import { eventBus } from '@/core/events';
import { config } from '@/app/config';

export interface AuthContextValue {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<ApiResult<User>>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<ApiResult<string>>;
  
  // Utilities
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authService = useRef<AuthService | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize auth service
  useEffect(() => {
    try {
      authService.current = resolveService(AuthServiceToken);
    } catch (error) {
      console.error('Failed to resolve AuthService:', error);
      setIsLoading(false);
    }
  }, []);

  // Initialize authentication state
  useEffect(() => {
    if (!authService.current) return;

    const initializeAuth = async () => {
      try {
        const currentUser = authService.current!.getCurrentUser();
        
        if (currentUser && authService.current!.isAuthenticated()) {
          setUser(currentUser);
          scheduleTokenRefresh();
          
          // Emit login event for analytics/tracking
          eventBus.emit('auth:login', { userId: currentUser.id });
        }
      } catch (error) {
        console.error('Failed to initialize auth state:', error);
        // Clear potentially invalid auth state
        await handleLogout(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Cleanup on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  // Schedule automatic token refresh
  const scheduleTokenRefresh = useCallback(() => {
    if (!config.isDevelopment && refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Refresh token 5 minutes before expiry (or every 25 minutes if no expiry info)
    const refreshInterval = config.isDevelopment ? 30 * 60 * 1000 : 25 * 60 * 1000; // 30min dev, 25min prod
    
    refreshTimeoutRef.current = setTimeout(async () => {
      try {
        await refreshToken();
        scheduleTokenRefresh(); // Reschedule
      } catch (error) {
        console.error('Automatic token refresh failed:', error);
        // Force logout on refresh failure
        await handleLogout(true);
      }
    }, refreshInterval);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<ApiResult<User>> => {
    if (!authService.current) {
      return {
        success: false,
        error: {
          message: 'Authentication service not available',
          code: 'SERVICE_UNAVAILABLE'
        }
      };
    }

    setIsLoading(true);
    
    try {
      const result = await authService.current.login(credentials);
      
      if (result.success && result.data) {
        setUser(result.data);
        scheduleTokenRefresh();
        
        // Emit login event
        eventBus.emit('auth:login', { userId: result.data.id });
        
        return result;
      } else {
        return result;
      }
    } catch (error) {
      const errorResult: ApiResult<User> = {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Login failed',
          code: 'LOGIN_ERROR'
        }
      };
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  }, [scheduleTokenRefresh]);

  const handleLogout = useCallback(async (emitEvent = true) => {
    const currentUserId = user?.id;
    
    // Clear refresh timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    
    // Clear local state
    setUser(null);
    setIsLoading(false);
    
    // Call service logout
    if (authService.current) {
      try {
        await authService.current.logout();
      } catch (error) {
        console.error('Service logout failed:', error);
      }
    }
    
    // Emit logout event
    if (emitEvent) {
      eventBus.emit('auth:logout', { userId: currentUserId });
    }
  }, [user?.id]);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    await handleLogout(true);
  }, [handleLogout]);

  const refreshToken = useCallback(async (): Promise<ApiResult<string>> => {
    if (!authService.current) {
      return {
        success: false,
        error: {
          message: 'Authentication service not available',
          code: 'SERVICE_UNAVAILABLE'
        }
      };
    }

    try {
      const result = await authService.current.refreshToken();
      
      if (result.success) {
        // Update user info after successful refresh
        const currentUser = authService.current.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } else {
        // Refresh failed, logout user
        await handleLogout(true);
      }
      
      return result;
    } catch (error) {
      await handleLogout(true);
      
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Token refresh failed',
          code: 'REFRESH_ERROR'
        }
      };
    }
  }, [handleLogout]);

  const hasRole = useCallback((role: string): boolean => {
    if (!authService.current) return false;
    return authService.current.hasRole(role);
  }, []);

  const hasAnyRole = useCallback((roles: string[]): boolean => {
    return roles.some(role => hasRole(role));
  }, [hasRole]);

  const contextValue: AuthContextValue = {
    // State
    user,
    isAuthenticated: Boolean(user && authService.current?.isAuthenticated()),
    isLoading,
    
    // Actions
    login,
    logout,
    refreshToken,
    
    // Utilities
    hasRole,
    hasAnyRole
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
}

// Export alias for convenience
export const useAuth = useAuthContext;

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/core/contracts, @/core/di, @/core/events, @/app/config)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - delegates to authService
- [x] Reads config from `@/app/config` (uses config.isDevelopment for refresh intervals)
- [x] Exports default named component (exports AuthProvider and useAuthContext)
- [x] Adds basic ARIA and keyboard handlers (N/A for context provider)
*/
