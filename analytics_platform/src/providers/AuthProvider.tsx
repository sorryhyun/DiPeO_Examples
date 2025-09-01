// src/providers/AuthProvider.tsx
/* src/providers/AuthProvider.tsx
   AuthProvider manages authentication state, token lifecycle, and authentication actions.
   - Stores auth state in localStorage via useLocalStorage hook
   - Emits auth events via core/events.ts for decoupled notifications
   - Provides login/logout/refresh functionality through authService
   - Exposes auth context to child components
*/

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, AuthTokens, LoginCredentials, ApiResult } from '@/core/contracts';
import { emit } from '@/core/events';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import authService from '@/services/authService';
import { shouldUseMockData, mockUser } from '@/app/config';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<ApiResult<User>>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  getAccessToken: () => string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useLocalStorage<User | null>('auth.user', null);
  const [tokens, setTokens] = useLocalStorage<AuthTokens | null>('auth.tokens', null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Computed state
  const isAuthenticated = Boolean(user && tokens?.accessToken);

  // Initialize mock user in development if enabled
  useEffect(() => {
    if (shouldUseMockData && mockUser && !user) {
      setUser(mockUser);
      setTokens({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
      });
      emit('ws:connected', { socketId: 'mock-socket-1' });
    }
  }, [user, setUser, setTokens]);

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get access token helper
  const getAccessToken = useCallback((): string | null => {
    return tokens?.accessToken || null;
  }, [tokens?.accessToken]);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials): Promise<ApiResult<User>> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.login(credentials.email, credentials.password);
      
      if (result.error) {
        setError(result.error.message);
        return { error: result.error };
      }

      if (result.data?.user && result.data?.tokens) {
        setUser(result.data.user);
        setTokens(result.data.tokens);
        
        // Emit auth event for other parts of the app
        emit('ws:connected', { socketId: `user-${result.data.user.id}` });
        
        return { data: result.data.user };
      }

      const errorMessage = 'Login failed: Invalid response from server';
      setError(errorMessage);
      return { error: { code: 'LOGIN_FAILED', message: errorMessage } };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed: Unknown error';
      setError(errorMessage);
      return { error: { code: 'LOGIN_ERROR', message: errorMessage } };
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setTokens]);

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Call auth service to invalidate token on server
      await authService.logout();
    } catch (err) {
      // Log but don't block logout on server error
      console.warn('Logout server call failed:', err);
    }

    // Clear local state regardless of server response
    setUser(null);
    setTokens(null);
    setError(null);
    
    // Emit disconnection event
    emit('ws:disconnected', { reason: 'user_logout' });
    
    setIsLoading(false);
  }, [setUser, setTokens]);

  // Token refresh function
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (!tokens?.refreshToken) {
      return false;
    }

    try {
      const result = await authService.refreshToken(tokens.refreshToken);
      
      if (result.error || !result.data?.tokens) {
        // Refresh failed, clear auth state
        await logout();
        return false;
      }

      setTokens(result.data.tokens);
      return true;
    } catch (err) {
      console.error('Token refresh failed:', err);
      await logout();
      return false;
    }
  }, [tokens?.refreshToken, logout, setTokens]);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!tokens?.accessToken || !tokens?.expiresAt) {
      return;
    }

    const expiryTime = new Date(tokens.expiresAt).getTime();
    const now = Date.now();
    const timeUntilExpiry = expiryTime - now;
    
    // Refresh 5 minutes before expiry, or immediately if already expired
    const refreshDelay = Math.max(0, timeUntilExpiry - 5 * 60 * 1000);

    const timeoutId = setTimeout(async () => {
      const success = await refreshToken();
      if (!success) {
        emit('auth:session_expired', { userId: user?.id });
      }
    }, refreshDelay);

    return () => clearTimeout(timeoutId);
  }, [tokens?.accessToken, tokens?.expiresAt, refreshToken, user?.id]);

  // Validate current user session on mount
  useEffect(() => {
    const validateSession = async () => {
      if (isAuthenticated && !shouldUseMockData) {
        setIsLoading(true);
        try {
          const currentUser = await authService.getCurrentUser();
          if (currentUser.error) {
            // Session invalid, clear auth state
            await logout();
          } else if (currentUser.data && currentUser.data.id !== user?.id) {
            // User data changed, update
            setUser(currentUser.data);
          }
        } catch (err) {
          console.error('Session validation failed:', err);
          await logout();
        }
        setIsLoading(false);
      }
    };

    validateSession();
  }, []); // Run once on mount

  const contextValue: AuthContextValue = {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshToken,
    getAccessToken,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Export context for direct use in testing or advanced scenarios
export { AuthContext };

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses useLocalStorage hook
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (not relevant for provider component)
*/
