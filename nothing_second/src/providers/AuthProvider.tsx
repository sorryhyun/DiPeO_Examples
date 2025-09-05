// filepath: src/providers/AuthProvider.tsx
import React, { 
  createContext, 
  useContext, 
  useEffect, 
  useReducer, 
  useCallback, 
  useRef,
  type ReactNode 
} from 'react';
import type { 
  User, 
  AuthTokens, 
  ApiResult, 
  LoadingState 
} from '@/core/contracts';
import { config } from '@/app/config';
import { eventBus } from '@/core/events';
import { debugLog } from '@/core/utils';
import { authService } from '@/services/authService';

// Auth context state interface
export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  loadingState: LoadingState;
  error: string | null;
  lastRefreshAt: string | null;
}

// Auth context actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: LoadingState }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'UPDATE_TOKENS'; payload: AuthTokens }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LAST_REFRESH'; payload: string };

// Auth context methods interface
export interface AuthContextMethods {
  login: (email: string, password: string) => Promise<ApiResult<{ user: User; tokens: AuthTokens }>>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

// Combined auth context interface
export interface AuthContextValue extends AuthState, AuthContextMethods {}

// Initial auth state
const initialAuthState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  loadingState: 'idle',
  error: null,
  lastRefreshAt: null,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loadingState: action.payload,
        error: action.payload === 'loading' ? null : state.error,
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        loadingState: 'success',
        error: null,
      };

    case 'LOGIN_ERROR':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        loadingState: 'error',
        error: action.payload,
      };

    case 'LOGOUT':
      return {
        ...initialAuthState,
        loadingState: 'idle',
      };

    case 'UPDATE_USER':
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
          updatedAt: new Date().toISOString(),
        },
      };

    case 'UPDATE_TOKENS':
      return {
        ...state,
        tokens: action.payload,
        lastRefreshAt: new Date().toISOString(),
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'SET_LAST_REFRESH':
      return {
        ...state,
        lastRefreshAt: action.payload,
      };

    default:
      return state;
  }
}

// Create auth context
const AuthContext = createContext<AuthContextValue | null>(null);

// Auth provider props
export interface AuthProviderProps {
  children: ReactNode;
}

// Auto-refresh configuration
const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes before expiry
const TOKEN_REFRESH_INTERVAL_MS = 60 * 1000; // Check every minute

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRefreshingRef = useRef(false);

  // Calculate if token needs refresh
  const shouldRefreshToken = useCallback((): boolean => {
    if (!state.tokens?.expiresAt) return false;
    
    const expiryTime = new Date(state.tokens.expiresAt).getTime();
    const now = Date.now();
    
    return (expiryTime - now) <= TOKEN_REFRESH_THRESHOLD_MS;
  }, [state.tokens?.expiresAt]);

  // Clear timers helper
  const clearTimers = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Login method
  const login = useCallback(async (
    email: string, 
    password: string
  ): Promise<ApiResult<{ user: User; tokens: AuthTokens }>> => {
    if (!email.trim() || !password.trim()) {
      const error = 'Email and password are required';
      dispatch({ type: 'LOGIN_ERROR', payload: error });
      return { success: false, error: { message: error } };
    }

    dispatch({ type: 'SET_LOADING', payload: 'loading' });

    try {
      const result = await authService.login(email, password);
      
      if (result.success && result.data) {
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: result.data 
        });
        
        // Emit login event
        eventBus.emit('auth:login', { userId: result.data.user.id });
        
        debugLog('AuthProvider: Login successful', result.data.user.email);
        
        return result;
      } else {
        const errorMessage = result.error?.message || 'Login failed';
        dispatch({ type: 'LOGIN_ERROR', payload: errorMessage });
        return result;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'LOGIN_ERROR', payload: errorMessage });
      
      debugLog('AuthProvider: Login error', error);
      
      return { 
        success: false, 
        error: { message: errorMessage } 
      };
    }
  }, []);

  // Logout method
  const logout = useCallback(async (): Promise<void> => {
    const currentUserId = state.user?.id;
    
    // Clear timers first
    clearTimers();
    isRefreshingRef.current = false;
    
    // Clear auth state
    dispatch({ type: 'LOGOUT' });
    
    try {
      // Call auth service logout (clears storage, revokes tokens)
      await authService.logout();
      
      // Emit logout event
      eventBus.emit('auth:logout', { userId: currentUserId });
      
      debugLog('AuthProvider: Logout successful');
    } catch (error) {
      // Log but don't throw - logout should always succeed locally
      debugLog('AuthProvider: Logout error (continuing anyway)', error);
      
      eventBus.emit('auth:logout', { userId: currentUserId });
    }
  }, [state.user?.id, clearTimers]);

  // Refresh token method
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (isRefreshingRef.current) {
      debugLog('AuthProvider: Token refresh already in progress');
      return false;
    }
    
    if (!state.tokens?.refreshToken) {
      debugLog('AuthProvider: No refresh token available');
      return false;
    }

    isRefreshingRef.current = true;

    try {
      const result = await authService.refreshToken(state.tokens.refreshToken);
      
      if (result.success && result.data) {
        dispatch({ type: 'UPDATE_TOKENS', payload: result.data });
        debugLog('AuthProvider: Token refresh successful');
        return true;
      } else {
        debugLog('AuthProvider: Token refresh failed', result.error);
        // If refresh fails, logout user
        await logout();
        return false;
      }
    } catch (error) {
      debugLog('AuthProvider: Token refresh error', error);
      // If refresh fails, logout user
      await logout();
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  }, [state.tokens?.refreshToken, logout]);

  // Update user method
  const updateUser = useCallback((updates: Partial<User>): void => {
    if (!state.user) {
      debugLog('AuthProvider: Cannot update user - not authenticated');
      return;
    }

    dispatch({ type: 'UPDATE_USER', payload: updates });
    
    // Emit user update event
    eventBus.emit('user:update', {
      userId: state.user.id,
      changes: updates,
    });
    
    debugLog('AuthProvider: User updated', updates);
  }, [state.user]);

  // Clear error method
  const clearError = useCallback((): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Check auth status method
  const checkAuthStatus = useCallback(async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: 'loading' });
    
    try {
      const result = await authService.getCurrentUser();
      
      if (result.success && result.data) {
        const { user, tokens } = result.data;
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { user, tokens } 
        });
        
        debugLog('AuthProvider: Auth status check successful', user.email);
      } else {
        // No valid session found
        dispatch({ type: 'LOGOUT' });
        debugLog('AuthProvider: No valid session found');
      }
    } catch (error) {
      debugLog('AuthProvider: Auth status check error', error);
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  // Setup auto-refresh logic
  useEffect(() => {
    if (!state.isAuthenticated || !state.tokens) {
      clearTimers();
      return;
    }

    // Set up periodic token refresh checking
    intervalRef.current = setInterval(() => {
      if (shouldRefreshToken()) {
        debugLog('AuthProvider: Auto-refreshing token');
        refreshToken();
      }
    }, TOKEN_REFRESH_INTERVAL_MS);

    return () => {
      clearTimers();
    };
  }, [state.isAuthenticated, state.tokens, shouldRefreshToken, refreshToken, clearTimers]);

  // Check auth status on mount
  useEffect(() => {
    if (config.shouldUseMockData) {
      debugLog('AuthProvider: Using mock data, skipping auth status check');
      dispatch({ type: 'SET_LOADING', payload: 'idle' });
      return;
    }
    
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
      isRefreshingRef.current = false;
    };
  }, [clearTimers]);

  // Context value
  const contextValue: AuthContextValue = {
    // State
    user: state.user,
    tokens: state.tokens,
    isAuthenticated: state.isAuthenticated,
    loadingState: state.loadingState,
    error: state.error,
    lastRefreshAt: state.lastRefreshAt,
    
    // Methods
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
}

// Custom hook to use auth context
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error(
      'useAuthContext must be used within an AuthProvider. ' +
      'Make sure your component is wrapped with <AuthProvider>'
    );
  }
  
  return context;
}

// Export default component
export default AuthProvider;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
