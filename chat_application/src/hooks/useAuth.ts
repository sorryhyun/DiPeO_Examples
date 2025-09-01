// filepath: src/hooks/useAuth.ts
import { useState, useEffect, useCallback, useContext, createContext, useRef } from 'react';
import type { User, AuthTokens, ApiResult } from '@/core/contracts';
import { globalEventBus } from '@/core/events';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { authService } from '@/services/authService';

// =============================================================================
// Types and Interfaces
// =============================================================================

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<ApiResult<{ user: User; tokens: AuthTokens }>>;
  signOut: () => Promise<void>;
  register: (email: string, password: string, fullName: string, role?: string) => Promise<ApiResult<{ user: User; tokens: AuthTokens }>>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export type UseAuthReturn = AuthState & AuthActions;

// =============================================================================
// Auth Context (used internally by the hook)
// =============================================================================

const AuthContext = createContext<UseAuthReturn | null>(null);

// =============================================================================
// Main useAuth Hook
// =============================================================================

export function useAuth(): UseAuthReturn {
  // Local state management
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Persistent token storage
  const [storedTokens, setStoredTokens] = useLocalStorage<AuthTokens | null>('auth_tokens', null);
  const [storedUser, setStoredUser] = useLocalStorage<User | null>('auth_user', null);

  // Track if we've attempted initial auth restoration
  const hasAttemptedRestore = useRef(false);
  const refreshTimeoutRef = useRef<number>();

  // =============================================================================
  // Helper Functions
  // =============================================================================

  const updateAuthState = useCallback((updates: Partial<AuthState>) => {
    setAuthState(prev => ({ ...prev, ...updates }));
  }, []);

  const clearAuthState = useCallback(() => {
    setStoredTokens(null);
    setStoredUser(null);
    updateAuthState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      error: null,
    });
  }, [setStoredTokens, setStoredUser, updateAuthState]);

  const setAuthSuccess = useCallback((user: User, tokens: AuthTokens) => {
    setStoredUser(user);
    setStoredTokens(tokens);
    updateAuthState({
      user,
      tokens,
      isAuthenticated: true,
      error: null,
      isLoading: false,
    });

    // Emit auth success event
    globalEventBus.emit('auth.login', { userId: user.id, user });

    // Schedule token refresh if we have expiration info
    if (tokens.expiresAt) {
      const expiresAt = new Date(tokens.expiresAt).getTime();
      const now = Date.now();
      const refreshIn = Math.max(0, expiresAt - now - 60000); // Refresh 1 minute before expiry
      
      if (refreshIn > 0) {
        refreshTimeoutRef.current = window.setTimeout(() => {
          refreshAuth();
        }, refreshIn);
      }
    }
  }, [setStoredUser, setStoredTokens, updateAuthState]);

  const setAuthError = useCallback((error: string) => {
    updateAuthState({
      error,
      isLoading: false,
    });
  }, [updateAuthState]);

  // =============================================================================
  // Auth Actions
  // =============================================================================

  const signIn = useCallback(async (email: string, password: string): Promise<ApiResult<{ user: User; tokens: AuthTokens }>> => {
    updateAuthState({ isLoading: true, error: null });

    try {
      const result = await authService.signIn(email, password);
      
      if (result.success) {
        setAuthSuccess(result.data.user, result.data.tokens);
        return result;
      } else {
        setAuthError(result.error.message);
        return result;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setAuthError(errorMessage);
      return {
        success: false,
        error: {
          code: 'SIGNIN_ERROR',
          message: errorMessage,
        },
      };
    }
  }, [updateAuthState, setAuthSuccess, setAuthError]);

  const signOut = useCallback(async (): Promise<void> => {
    updateAuthState({ isLoading: true });

    try {
      // Clear refresh timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = undefined;
      }

      // Call service logout (may hit API to invalidate tokens)
      if (authState.tokens) {
        await authService.signOut();
      }

      // Emit logout event before clearing state
      if (authState.user) {
        globalEventBus.emit('auth.logout', { userId: authState.user.id });
      }

      // Clear local state
      clearAuthState();
    } catch (error) {
      // Even if API call fails, clear local state
      console.warn('Logout API call failed, but clearing local state:', error);
      clearAuthState();
    } finally {
      updateAuthState({ isLoading: false });
    }
  }, [authState.tokens, authState.user, updateAuthState, clearAuthState]);

  const register = useCallback(async (
    email: string, 
    password: string, 
    fullName: string, 
    role = 'patient'
  ): Promise<ApiResult<{ user: User; tokens: AuthTokens }>> => {
    updateAuthState({ isLoading: true, error: null });

    try {
      const result = await authService.register(email, password, fullName, role);
      
      if (result.success) {
        setAuthSuccess(result.data.user, result.data.tokens);
        return result;
      } else {
        setAuthError(result.error.message);
        return result;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setAuthError(errorMessage);
      return {
        success: false,
        error: {
          code: 'REGISTER_ERROR',
          message: errorMessage,
        },
      };
    }
  }, [updateAuthState, setAuthSuccess, setAuthError]);

  const refreshAuth = useCallback(async (): Promise<void> => {
    if (!storedTokens?.refreshToken) {
      return;
    }

    try {
      const result = await authService.refreshTokens(storedTokens.refreshToken);
      
      if (result.success && authState.user) {
        setAuthSuccess(authState.user, result.data);
      } else {
        // Refresh failed, sign out user
        await signOut();
      }
    } catch (error) {
      console.warn('Token refresh failed:', error);
      await signOut();
    }
  }, [storedTokens?.refreshToken, authState.user, setAuthSuccess, signOut]);

  const clearError = useCallback(() => {
    updateAuthState({ error: null });
  }, [updateAuthState]);

  const updateUser = useCallback((userData: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...userData };
      setStoredUser(updatedUser);
      updateAuthState({ user: updatedUser });
    }
  }, [authState.user, setStoredUser, updateAuthState]);

  // =============================================================================
  // Initialization and Token Restoration
  // =============================================================================

  useEffect(() => {
    const restoreAuthState = async () => {
      if (hasAttemptedRestore.current) return;
      hasAttemptedRestore.current = true;

      // Check if we have stored tokens and user
      if (storedTokens && storedUser) {
        // Check if tokens are still valid
        if (storedTokens.expiresAt) {
          const expiresAt = new Date(storedTokens.expiresAt).getTime();
          const now = Date.now();
          
          if (now >= expiresAt) {
            // Token expired, try to refresh
            if (storedTokens.refreshToken) {
              await refreshAuth();
            } else {
              clearAuthState();
            }
            return;
          }
        }

        // Tokens are valid, restore auth state
        setAuthSuccess(storedUser, storedTokens);
      } else {
        // No stored auth, set loading to false
        updateAuthState({ isLoading: false });
      }
    };

    restoreAuthState();
  }, [storedTokens, storedUser, refreshAuth, clearAuthState, setAuthSuccess, updateAuthState]);

  // =============================================================================
  // Event Bus Integration
  // =============================================================================

  useEffect(() => {
    const handleTokenExpiration = () => {
      refreshAuth();
    };

    const handleForceSignOut = () => {
      signOut();
    };

    // Listen for token expiration events (could come from API interceptors)
    const unsubscribeTokenExpired = globalEventBus.on('auth.token.expired', handleTokenExpiration);
    const unsubscribeForceSignOut = globalEventBus.on('auth.force.signout', handleForceSignOut);

    return () => {
      unsubscribeTokenExpired();
      unsubscribeForceSignOut();
      
      // Clear refresh timeout on cleanup
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [refreshAuth, signOut]);

  // =============================================================================
  // Return Hook Interface
  // =============================================================================

  return {
    // State
    user: authState.user,
    tokens: authState.tokens,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    
    // Actions
    signIn,
    signOut,
    register,
    refreshAuth,
    clearError,
    updateUser,
  };
}

// =============================================================================
// Convenience Hook for Context Usage (if needed by AuthProvider)
// =============================================================================

export function useAuthContext(): UseAuthReturn {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };

/*
Self-check comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses useLocalStorage hook
- [x] Reads config from `@/app/config` (not needed in this auth hook)
- [x] Exports default named component (exports useAuth hook as main export)
- [x] Adds basic ARIA and keyboard handlers (not applicable for auth hook)
- [x] Provides comprehensive auth state management with loading/error states
- [x] Integrates with authService for API calls
- [x] Uses globalEventBus for cross-cutting auth events
- [x] Handles token refresh and expiration logic
- [x] Provides type-safe API with clear return types
- [x] Includes error handling and edge cases
- [x] Uses useLocalStorage for persistent token storage
- [x] Implements automatic token refresh with timeout scheduling
*/
