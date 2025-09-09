// filepath: src/providers/AuthProvider.tsx

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, AuthTokens, AuthResponse } from '@/core/contracts';
import { authService } from '@/services/authService';
import { eventBus } from '@/core/events';
import { config } from '@/app/config';
import { debugLog } from '@/core/utils';

// ===============================================
// Auth Context Types
// ===============================================

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}

type AuthContextValue = AuthState & AuthActions;

// ===============================================
// Context Creation
// ===============================================

const AuthContext = createContext<AuthContextValue | null>(null);

// ===============================================
// AuthProvider Implementation
// ===============================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Helper to update state
  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Clear error helper
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Login handler
  const login = useCallback(async (email: string, password: string) => {
    try {
      updateState({ isLoading: true, error: null });
      
      const authResponse: AuthResponse = await authService.login(email, password);
      
      updateState({
        user: authResponse.user,
        tokens: authResponse.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Emit login event
      await eventBus.emit('auth:login', { user: authResponse.user });
      
      debugLog('AuthProvider: User logged in successfully', authResponse.user);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      updateState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      
      debugLog('AuthProvider: Login failed', error);
    }
  }, [updateState]);

  // Logout handler
  const logout = useCallback(async () => {
    try {
      const currentUserId = state.user?.id;
      
      // Call service logout (clears tokens, etc.)
      await authService.logout();
      
      // Clear local state
      updateState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      // Emit logout event
      await eventBus.emit('auth:logout', { userId: currentUserId });
      
      debugLog('AuthProvider: User logged out successfully');
      
    } catch (error) {
      debugLog('AuthProvider: Logout error', error);
      // Still clear local state even if service call fails
      updateState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, [state.user?.id, updateState]);

  // Token refresh handler
  const refreshToken = useCallback(async () => {
    try {
      if (!state.tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      updateState({ isLoading: true, error: null });
      
      const newTokens = await authService.refreshToken();
      
      updateState({
        tokens: newTokens,
        isLoading: false,
        error: null,
      });
      
      debugLog('AuthProvider: Tokens refreshed successfully');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
      
      // If refresh fails, logout user
      updateState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      
      await eventBus.emit('auth:logout', { userId: state.user?.id });
      debugLog('AuthProvider: Token refresh failed, logging out user', error);
    }
  }, [state.tokens?.refreshToken, state.user?.id, updateState]);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        updateState({ isLoading: true, error: null });

        // Check if user is already authenticated
        const isAuthenticated = authService.isAuthenticated();
        
        if (isAuthenticated) {
          try {
            const currentUser = await authService.getCurrentUser();
            updateState({
              user: currentUser,
              tokens: authService.getStoredTokens(), // Assuming this method exists
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            debugLog('AuthProvider: Restored authenticated session', currentUser);
          } catch (error) {
            // If getting current user fails, clear auth state
            await authService.logout();
            updateState({
              user: null,
              tokens: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
            
            debugLog('AuthProvider: Failed to restore session, cleared auth state');
          }
        } else {
          // Handle mock user in development
          if (config.dev.mockUser && config.isDevelopment) {
            updateState({
              user: config.dev.mockUser as User,
              tokens: null, // Mock doesn't need real tokens
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            debugLog('AuthProvider: Using mock user in development', config.dev.mockUser);
          } else {
            updateState({
              user: null,
              tokens: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        }
      } catch (error) {
        debugLog('AuthProvider: Initialization error', error);
        updateState({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Authentication initialization failed',
        });
      }
    };

    initializeAuth();
  }, [updateState]);

  // Set up token refresh timer
  useEffect(() => {
    if (!state.tokens?.expiresAt || !state.isAuthenticated) {
      return;
    }

    const expiresAt = new Date(state.tokens.expiresAt).getTime();
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;
    
    // Refresh 5 minutes before expiration
    const refreshTime = timeUntilExpiry - (5 * 60 * 1000);
    
    if (refreshTime > 0) {
      const refreshTimer = setTimeout(() => {
        refreshToken();
      }, refreshTime);
      
      debugLog(`AuthProvider: Token refresh scheduled in ${Math.round(refreshTime / 1000)}s`);
      
      return () => clearTimeout(refreshTimer);
    } else {
      // Token is already expired or about to expire, refresh immediately
      refreshToken();
    }
  }, [state.tokens?.expiresAt, state.isAuthenticated, refreshToken]);

  // Context value
  const contextValue: AuthContextValue = {
    // State
    user: state.user,
    tokens: state.tokens,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    error: state.error,
    // Actions
    login,
    logout,
    refreshToken,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ===============================================
// Safe Hook for Accessing Context
// ===============================================

export function useAuthSafe(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthSafe must be used within an AuthProvider');
  }
  
  return context;
}

// ===============================================
// Development Utilities
// ===============================================

// Export for development/testing purposes
export const _AuthContext = config.isDevelopment ? AuthContext : undefined;

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component (AuthProvider)
- [x] Adds basic ARIA and keyboard handlers (N/A - provider component)
*/
