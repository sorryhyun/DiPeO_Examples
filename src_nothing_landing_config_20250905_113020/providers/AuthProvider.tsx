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
    } finally {\n      isRefreshingRef.current = false;\n    }\n  }, [state.tokens?.refreshToken, logout]);\n\n  // Update user method\n  const updateUser = useCallback((updates: Partial<User>): void => {\n    if (!state.user) {\n      debugLog('AuthProvider: Cannot update user - not authenticated');\n      return;\n    }\n\n    dispatch({ type: 'UPDATE_USER', payload: updates });\n    \n    // Emit user update event\n    eventBus.emit('user:update', {\n      userId: state.user.id,\n      changes: updates,\n    });\n    \n    debugLog('AuthProvider: User updated', updates);\n  }, [state.user]);\n\n  // Clear error method\n  const clearError = useCallback((): void => {\n    dispatch({ type: 'CLEAR_ERROR' });\n  }, []);\n\n  // Check auth status method\n  const checkAuthStatus = useCallback(async (): Promise<void> => {\n    dispatch({ type: 'SET_LOADING', payload: 'loading' });\n    \n    try {\n      const result = await authService.getCurrentUser();\n      \n      if (result.success && result.data) {\n        const { user, tokens } = result.data;\n        dispatch({ \n          type: 'LOGIN_SUCCESS', \n          payload: { user, tokens } \n        });\n        \n        debugLog('AuthProvider: Auth status check successful', user.email);\n      } else {\n        // No valid session found\n        dispatch({ type: 'LOGOUT' });\n        debugLog('AuthProvider: No valid session found');\n      }\n    } catch (error) {\n      debugLog('AuthProvider: Auth status check error', error);\n      dispatch({ type: 'LOGOUT' });\n    }\n  }, []);\n\n  // Setup auto-refresh logic\n  useEffect(() => {\n    if (!state.isAuthenticated || !state.tokens) {\n      clearTimers();\n      return;\n    }\n\n    // Set up periodic token refresh checking\n    intervalRef.current = setInterval(() => {\n      if (shouldRefreshToken()) {\n        debugLog('AuthProvider: Auto-refreshing token');\n        refreshToken();\n      }\n    }, TOKEN_REFRESH_INTERVAL_MS);\n\n    return () => {\n      clearTimers();\n    };\n  }, [state.isAuthenticated, state.tokens, shouldRefreshToken, refreshToken, clearTimers]);\n\n  // Check auth status on mount\n  useEffect(() => {\n    if (config.shouldUseMockData) {\n      debugLog('AuthProvider: Using mock data, skipping auth status check');\n      dispatch({ type: 'SET_LOADING', payload: 'idle' });\n      return;\n    }\n    \n    checkAuthStatus();\n  }, [checkAuthStatus]);\n\n  // Cleanup on unmount\n  useEffect(() => {\n    return () => {\n      clearTimers();\n      isRefreshingRef.current = false;\n    };\n  }, [clearTimers]);\n\n  // Context value\n  const contextValue: AuthContextValue = {\n    // State\n    user: state.user,\n    tokens: state.tokens,\n    isAuthenticated: state.isAuthenticated,\n    loadingState: state.loadingState,\n    error: state.error,\n    lastRefreshAt: state.lastRefreshAt,\n    \n    // Methods\n    login,\n    logout,\n    refreshToken,\n    updateUser,\n    clearError,\n    checkAuthStatus,\n  };\n\n  return (\n    <AuthContext.Provider value={contextValue}>\n      {children}\n    </AuthContext.Provider>\n  );\n}\n\n// Custom hook to use auth context\nexport function useAuthContext(): AuthContextValue {\n  const context = useContext(AuthContext);\n  \n  if (!context) {\n    throw new Error(\n      'useAuthContext must be used within an AuthProvider. ' +\n      'Make sure your component is wrapped with <AuthProvider>'\n    );\n  }\n  \n  return context;\n}\n\n// Export default component\nexport default AuthProvider;\n\n// Self-check comments:\n// [x] Uses `@/` imports only\n// [x] Uses providers/hooks (no direct DOM/localStorage side effects)\n// [x] Reads config from `@/app/config`\n// [x] Exports default named component\n// [x] Adds basic ARIA and keyboard handlers (where relevant)
