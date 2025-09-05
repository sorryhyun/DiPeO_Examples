// filepath: src/providers/AuthProvider.tsx

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { User, LoginCredentials, LoginResponse, AuthTokens } from '@/core/contracts';
import { config, shouldUseMockData, MOCK_USER_ADMIN } from '@/app/config';
import { publishEvent } from '@/core/events';
import { runHook } from '@/core/hooks';
import { authService } from '@/services/auth';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// =============================
// TYPES & INTERFACES
// =============================

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateUser: (updates: Partial<User>) => void;
}

// =============================
// CONTEXT CREATION
// =============================

const AuthContext = createContext<AuthContextValue | null>(null);

// =============================
// PROVIDER COMPONENT
// =============================

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Local storage for token persistence
  const [storedTokens, setStoredTokens] = useLocalStorage<AuthTokens | null>('auth_tokens', null);
  const [storedUser, setStoredUser] = useLocalStorage<User | null>('auth_user', null);

  // Component state
  const [authState, setAuthState] = useState<AuthState>({
    user: shouldUseMockData ? MOCK_USER_ADMIN : storedUser,
    tokens: shouldUseMockData ? { access: 'mock-token' } : storedTokens,
    isLoading: false,
    isAuthenticated: shouldUseMockData ? true : !!(storedUser && storedTokens),
  });

  // Ref to track token refresh attempts to prevent infinite loops
  const refreshAttemptRef = useRef<Promise<boolean> | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // =============================
  // AUTH OPERATIONS
  // =============================

  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    if (shouldUseMockData) {
      // Mock login for development
      const mockResponse: LoginResponse = {
        user: MOCK_USER_ADMIN,
        tokens: { access: 'mock-token', refresh: 'mock-refresh-token' },
      };

      setAuthState({
        user: mockResponse.user,
        tokens: mockResponse.tokens,
        isLoading: false,
        isAuthenticated: true,
      });

      setStoredUser(mockResponse.user);
      setStoredTokens(mockResponse.tokens);

      // Publish login event
      await publishEvent('auth:login', {
        user: mockResponse.user,
        tokens: mockResponse.tokens,
      });

      // Run login hooks
      await runHook('onLogin', {
        user: mockResponse.user,
        tokens: mockResponse.tokens,
      });

      return { success: true };
    }

    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await authService.login(credentials);

      if (response.success && response.data) {
        const { user, tokens } = response.data;

        setAuthState({
          user,
          tokens,
          isLoading: false,
          isAuthenticated: true,
        });

        // Persist to localStorage
        setStoredUser(user);
        setStoredTokens(tokens);

        // Schedule token refresh if we have an expiry
        scheduleTokenRefresh(tokens);

        // Publish events and run hooks
        await publishEvent('auth:login', { user, tokens });
        await runHook('onLogin', { user, tokens });

        return { success: true };
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { 
          success: false, 
          error: response.error?.message || 'Login failed' 
        };
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      // Publish error event
      await publishEvent('toast:show', {
        type: 'error',
        message: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  }, [setStoredUser, setStoredTokens]);

  const logout = useCallback(async (): Promise<void> => {
    const currentUser = authState.user;

    // Clear refresh timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    // Clear state
    setAuthState({
      user: null,
      tokens: null,
      isLoading: false,
      isAuthenticated: false,
    });

    // Clear localStorage
    setStoredUser(null);
    setStoredTokens(null);

    // Call API logout if not in mock mode
    if (!shouldUseMockData && authState.tokens) {
      try {
        await authService.logout(authState.tokens.access);
      } catch (error) {
        // Ignore logout API errors - we're clearing local state anyway
        console.warn('Logout API call failed:', error);
      }
    }

    // Publish events and run hooks
    await publishEvent('auth:logout', { user: currentUser });
    await runHook('onLogout', { user: currentUser });
  }, [authState.user, authState.tokens, setStoredUser, setStoredTokens]);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (shouldUseMockData) {
      return true; // Mock tokens never expire
    }

    if (!authState.tokens?.refresh) {
      return false;
    }

    // Prevent concurrent refresh attempts
    if (refreshAttemptRef.current) {
      return refreshAttemptRef.current;
    }

    const refreshPromise = (async () => {
      try {
        const response = await authService.refreshToken(authState.tokens!.refresh!);

        if (response.success && response.data) {
          const newTokens = response.data;

          setAuthState(prev => ({
            ...prev,
            tokens: newTokens,
          }));

          setStoredTokens(newTokens);

          // Schedule next refresh
          scheduleTokenRefresh(newTokens);

          return true;
        } else {
          // Refresh failed - logout user
          await logout();
          return false;
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        await logout();
        return false;
      } finally {
        refreshAttemptRef.current = null;
      }
    })();

    refreshAttemptRef.current = refreshPromise;
    return refreshPromise;
  }, [authState.tokens, setStoredTokens, logout]);

  const updateUser = useCallback((updates: Partial<User>): void => {
    if (!authState.user) return;

    const updatedUser = { ...authState.user, ...updates };

    setAuthState(prev => ({
      ...prev,
      user: updatedUser,
    }));

    setStoredUser(updatedUser);
  }, [authState.user, setStoredUser]);

  // =============================
  // TOKEN REFRESH SCHEDULING
  // =============================

  const scheduleTokenRefresh = useCallback((tokens: AuthTokens): void => {
    if (!tokens.expiresAt || shouldUseMockData) return;

    // Clear existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    try {
      const expiryTime = new Date(tokens.expiresAt).getTime();
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;

      // Refresh 5 minutes before expiry, but not less than 30 seconds from now
      const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 30 * 1000);

      if (refreshTime > 0) {
        refreshTimeoutRef.current = setTimeout(() => {
          refreshToken().catch(error => {
            console.error('Scheduled token refresh failed:', error);
          });
        }, refreshTime);
      }
    } catch (error) {
      console.error('Failed to schedule token refresh:', error);
    }
  }, [refreshToken]);

  // =============================
  // INITIALIZATION EFFECT
  // =============================

  useEffect(() => {
    // Initialize token refresh scheduling on mount
    if (authState.tokens && authState.isAuthenticated) {
      scheduleTokenRefresh(authState.tokens);
    }

    // Cleanup on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [authState.tokens, authState.isAuthenticated, scheduleTokenRefresh]);

  // =============================
  // CONTEXT VALUE
  // =============================

  const contextValue: AuthContextValue = {
    ...authState,
    login,
    logout,
    refreshToken,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// =============================
// HOOK FOR CONSUMING CONTEXT
// =============================

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// =============================
// DEVELOPMENT HELPERS
// =============================

if (import.meta.env.DEV) {
  // Add display name for React DevTools
  AuthProvider.displayName = 'AuthProvider';
  AuthContext.displayName = 'AuthContext';
}

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (N/A for provider)
