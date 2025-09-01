// filepath: src/providers/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useReducer, useCallback, ReactNode } from 'react';
import { User, AuthTokens, ApiResult, isApiSuccess } from '@/core/contracts';
import { config, shouldUseMockData, mockData } from '@/app/config';
import { eventBus } from '@/core/events';
import { container } from '@/core/di';

// =============================================================================
// Types & Interfaces
// =============================================================================

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<ApiResult<{ user: User; tokens: AuthTokens }>>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<ApiResult<AuthTokens>>;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_INITIALIZE' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'UPDATE_TOKENS'; payload: AuthTokens }
  | { type: 'CLEAR_ERROR' };

interface AuthProviderProps {
  children: ReactNode;
}

// =============================================================================
// Auth Reducer
// =============================================================================

const initialState: AuthState = {
  user: null,
  tokens: null,
  isLoading: false,
  isInitialized: false,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        tokens: action.payload.tokens,
        error: null,
      };

    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        tokens: null,
        isLoading: false,
        error: null,
      };

    case 'AUTH_INITIALIZE':
      return {
        ...state,
        isInitialized: true,
        isLoading: false,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };

    case 'UPDATE_TOKENS':
      return {
        ...state,
        tokens: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// =============================================================================
// Auth Context
// =============================================================================

const AuthContext = createContext<AuthContextValue | null>(null);

// =============================================================================
// Auth Provider Component
// =============================================================================

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Get auth service from DI container
  const authService = container.resolve('authService');

  // =============================================================================
  // Storage Helpers
  // =============================================================================

  const getStoredTokens = useCallback((): AuthTokens | null => {
    try {
      const stored = localStorage.getItem('auth_tokens');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const setStoredTokens = useCallback((tokens: AuthTokens | null) => {
    try {
      if (tokens) {
        localStorage.setItem('auth_tokens', JSON.stringify(tokens));
      } else {
        localStorage.removeItem('auth_tokens');
      }
    } catch (error) {
      console.warn('Failed to store auth tokens:', error);
    }
  }, []);

  const getStoredUser = useCallback((): User | null => {
    try {
      const stored = localStorage.getItem('auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const setStoredUser = useCallback((user: User | null) => {
    try {
      if (user) {
        localStorage.setItem('auth_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('auth_user');
      }
    } catch (error) {
      console.warn('Failed to store user data:', error);
    }
  }, []);

  // =============================================================================
  // Auth Methods
  // =============================================================================

  const login = useCallback(async (email: string, password: string): Promise<ApiResult<{ user: User; tokens: AuthTokens }>> => {
    dispatch({ type: 'AUTH_START' });

    try {
      // Use mock data in development if enabled
      if (shouldUseMockData) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        
        const mockTokens: AuthTokens = {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          tokenType: 'Bearer',
        };

        const result = {
          success: true as const,
          data: {
            user: mockData.user,
            tokens: mockTokens,
          },
        };

        dispatch({ type: 'AUTH_SUCCESS', payload: result.data });
        setStoredUser(result.data.user);
        setStoredTokens(result.data.tokens);
        
        // Emit auth success event
        eventBus.emit('auth:login-success', result.data.user);
        
        return result;
      }

      // Real authentication
      const result = await authService.login(email, password);

      if (isApiSuccess(result)) {
        dispatch({ type: 'AUTH_SUCCESS', payload: result.data });
        setStoredUser(result.data.user);
        setStoredTokens(result.data.tokens);
        
        // Emit auth success event
        eventBus.emit('auth:login-success', result.data.user);
        
        return result;
      } else {
        dispatch({ type: 'AUTH_ERROR', payload: result.error.message });
        return result;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      
      return {
        success: false,
        error: {
          code: 'AUTH_FAILED',
          message: errorMessage,
        },
      };
    }
  }, [authService, setStoredTokens, setStoredUser]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      // Emit logout event before clearing state
      if (state.user) {
        eventBus.emit('auth:logout', state.user);
      }

      // Clear server-side session if not using mock data
      if (!shouldUseMockData && state.tokens?.refreshToken) {
        await authService.logout(state.tokens.refreshToken);
      }
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      // Always clear local state and storage
      dispatch({ type: 'AUTH_LOGOUT' });
      setStoredUser(null);
      setStoredTokens(null);
      
      // Clear any cached data that might contain sensitive info
      eventBus.emit('auth:cleanup');
    }
  }, [authService, state.user, state.tokens, setStoredTokens, setStoredUser]);

  const refreshToken = useCallback(async (): Promise<ApiResult<AuthTokens>> => {
    const currentTokens = state.tokens || getStoredTokens();
    
    if (!currentTokens?.refreshToken) {
      return {
        success: false,
        error: {
          code: 'NO_REFRESH_TOKEN',
          message: 'No refresh token available',
        },
      };
    }

    try {
      // Mock refresh in development
      if (shouldUseMockData) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const newTokens: AuthTokens = {
          accessToken: 'mock-refreshed-access-token',
          refreshToken: currentTokens.refreshToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          tokenType: 'Bearer',
        };

        dispatch({ type: 'UPDATE_TOKENS', payload: newTokens });
        setStoredTokens(newTokens);
        
        return {
          success: true,
          data: newTokens,
        };
      }

      // Real token refresh
      const result = await authService.refreshToken(currentTokens.refreshToken);

      if (isApiSuccess(result)) {
        dispatch({ type: 'UPDATE_TOKENS', payload: result.data });
        setStoredTokens(result.data);
        
        // Emit token refresh event
        eventBus.emit('auth:token-refreshed', result.data);
        
        return result;
      } else {
        // If refresh fails, logout user
        await logout();
        return result;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
      
      // On refresh failure, logout user
      await logout();
      
      return {
        success: false,
        error: {
          code: 'REFRESH_FAILED',
          message: errorMessage,
        },
      };
    }
  }, [authService, state.tokens, getStoredTokens, setStoredTokens, logout]);

  const updateUser = useCallback((updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
    
    // Update stored user data
    const updatedUser = state.user ? { ...state.user, ...updates } : null;
    if (updatedUser) {
      setStoredUser(updatedUser);
      eventBus.emit('auth:user-updated', updatedUser);
    }
  }, [state.user, setStoredUser]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const checkAuthStatus = useCallback(async (): Promise<void> => {
    const storedTokens = getStoredTokens();
    const storedUser = getStoredUser();

    if (!storedTokens || !storedUser) {
      dispatch({ type: 'AUTH_INITIALIZE' });
      return;
    }

    // Check if token is expired
    if (storedTokens.expiresAt) {
      const expiryTime = new Date(storedTokens.expiresAt).getTime();
      const now = Date.now();
      const bufferTime = 5 * 60 * 1000; // 5 minutes buffer

      if (expiryTime - now < bufferTime) {
        // Token is expired or about to expire, try to refresh
        const refreshResult = await refreshToken();
        
        if (!isApiSuccess(refreshResult)) {
          // Refresh failed, clear auth state
          dispatch({ type: 'AUTH_INITIALIZE' });
          return;
        }
      }
    }

    // Restore auth state from storage
    dispatch({
      type: 'AUTH_SUCCESS',
      payload: {
        user: storedUser,
        tokens: storedTokens,
      },
    });
    
    dispatch({ type: 'AUTH_INITIALIZE' });
    
    // Emit restore event
    eventBus.emit('auth:session-restored', storedUser);
  }, [getStoredTokens, getStoredUser, refreshToken]);

  // =============================================================================
  // Effects
  // =============================================================================

  // Initialize auth state on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Set up automatic token refresh
  useEffect(() => {
    if (!state.tokens?.expiresAt || shouldUseMockData) return;

    const expiryTime = new Date(state.tokens.expiresAt).getTime();
    const now = Date.now();
    const refreshTime = expiryTime - now - 10 * 60 * 1000; // Refresh 10 minutes before expiry

    if (refreshTime > 0) {
      const timer = setTimeout(() => {
        refreshToken();
      }, refreshTime);

      return () => clearTimeout(timer);
    }
  }, [state.tokens, refreshToken]);

  // Listen for storage changes (for multi-tab sync)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'auth_tokens' || event.key === 'auth_user') {
        // Re-check auth status when storage changes
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuthStatus]);

  // =============================================================================
  // Context Value
  // =============================================================================

  const contextValue: AuthContextValue = {
    ...state,
    login,
    logout,
    refreshToken,
    updateUser,
    clearError,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// =============================================================================
// Custom Hook
// =============================================================================

export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
};

// =============================================================================
// Route Protection Hook
// =============================================================================

export const useAuthGuard = (requireAuth: boolean = true, allowedRoles?: string[]) => {
  const { user, isLoading, isInitialized } = useAuthContext();

  const isAuthenticated = !!user;
  const hasRequiredRole = !allowedRoles || (user && allowedRoles.some(role => user.roles.includes(role as any)));
  
  const canAccess = requireAuth ? (isAuthenticated && hasRequiredRole) : true;
  const shouldRedirect = isInitialized && !isLoading && requireAuth && !isAuthenticated;
  
  return {
    isLoading: !isInitialized || isLoading,
    canAccess,
    shouldRedirect,
    user,
    isAuthenticated,
  };
};

// Default export for convenience
export default AuthProvider;

/*
Self-check comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects in components)
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (not applicable for provider)
- [x] Integrates with authService from DI container
- [x] Manages currentUser and tokens with refresh flow
- [x] Provides route protection with useAuthGuard hook
- [x] Handles mock data for development
- [x] Emits auth events for cross-cutting concerns
- [x] Implements automatic token refresh with expiry checking
- [x] Supports multi-tab auth state synchronization
- [x] Provides comprehensive error handling and loading states
*/