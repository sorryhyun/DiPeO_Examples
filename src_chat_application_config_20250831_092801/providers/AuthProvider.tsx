import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, AuthToken, ApiResult } from '@/core/contracts';
import { appConfig, shouldUseMockData, LSKeys, mockUsers } from '@/app/config';
import { runHook } from '@/core/hooks';
import { debugLog } from '@/core/utils';
import { getStorage, setStorage, removeStorage } from '@/utils/storage';
import { mockUsers as mockUserData, findMockUserByCredentials } from '@/mock/mockData';
import { usersService } from '@/services/users.service';

// Auth context shape
interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<ApiResult<{ user: User; token: AuthToken }>>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create context with undefined default (will throw if used outside provider)
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = Boolean(user && token);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = getStorage<string>(LSKeys.AUTH_TOKEN);
        const storedUser = getStorage<User>(LSKeys.AUTH_USER);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          
          // In production, validate token with server
          if (!shouldUseMockData) {
            try {
              await refreshUser();
            } catch (error) {
              debugLog('warn', 'Token validation failed, clearing auth', error);
              await logout();
            }
          }
        }
      } catch (error) {
        debugLog('error', 'Failed to initialize auth from storage', error);
        await logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Mock authentication for development
  const mockLogin = useCallback(async (email: string, password: string): Promise<ApiResult<{ user: User; token: AuthToken }>> => {
    debugLog('debug', 'Attempting mock login', { email });

    // Find user in mock data
    const mockUser = findMockUserByCredentials(email, password);
    
    if (!mockUser) {
      return {
        ok: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      };
    }

    // Create mock token
    const mockToken: AuthToken = {
      token: `mock-token-${Date.now()}-${mockUser.id}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };

    return {
      ok: true,
      data: {
        user: mockUser,
        token: mockToken,
      },
    };
  }, []);

  // Production authentication
  const productionLogin = useCallback(async (email: string, password: string): Promise<ApiResult<{ user: User; token: AuthToken }>> => {
    debugLog('debug', 'Attempting production login', { email });

    const result = await usersService.login(email, password);
    
    if (!result.ok) {
      debugLog('warn', 'Login failed', result.error);
    }

    return result;
  }, []);

  // Main login function
  const login = useCallback(async (email: string, password: string): Promise<ApiResult<{ user: User; token: AuthToken }>> => {
    setIsLoading(true);

    try {
      // Run before login hook
      await runHook('beforeLogin', { email });

      const result = shouldUseMockData 
        ? await mockLogin(email, password)
        : await productionLogin(email, password);

      if (result.ok && result.data) {
        const { user: authUser, token: authToken } = result.data;
        
        // Update state
        setUser(authUser);
        setToken(authToken.token);
        
        // Persist to storage
        setStorage(LSKeys.AUTH_USER, authUser);
        setStorage(LSKeys.AUTH_TOKEN, authToken.token);

        debugLog('info', 'Login successful', { userId: authUser.id, role: authUser.role });

        // Run after login hook
        await runHook('onLogin', { user: authUser, token: authToken });

        return result;
      } else {
        debugLog('warn', 'Login failed', result.error);
        return result;
      }
    } catch (error) {
      debugLog('error', 'Login error', error);
      return {
        ok: false,
        error: {
          code: 'LOGIN_ERROR',
          message: error instanceof Error ? error.message : 'Login failed',
          details: error,
        },
      };
    } finally {
      setIsLoading(false);
    }
  }, [mockLogin, productionLogin]);

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      const currentUserId = user?.id;

      // Run before logout hook
      await runHook('beforeLogout', { userId: currentUserId });

      // Clear state
      setUser(null);
      setToken(null);

      // Clear storage
      removeStorage(LSKeys.AUTH_USER);
      removeStorage(LSKeys.AUTH_TOKEN);

      debugLog('info', 'Logout successful', { userId: currentUserId });

      // Run after logout hook
      await runHook('onLogout', { userId: currentUserId });

      // In production, notify server
      if (!shouldUseMockData && currentUserId) {
        try {
          await usersService.logout();
        } catch (error) {
          debugLog('warn', 'Server logout failed', error);
          // Continue with local logout even if server call fails
        }
      }
    } catch (error) {
      debugLog('error', 'Logout error', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Refresh user data
  const refreshUser = useCallback(async (): Promise<void> => {
    if (!token) return;

    try {
      if (shouldUseMockData) {
        // In mock mode, user data doesn't change
        return;
      }

      const result = await usersService.getCurrentUser();
      
      if (result.ok && result.data) {
        setUser(result.data);
        setStorage(LSKeys.AUTH_USER, result.data);
      } else {
        debugLog('warn', 'Failed to refresh user', result.error);
        // Don't logout automatically - token might still be valid
      }
    } catch (error) {
      debugLog('error', 'Refresh user error', error);
    }
  }, [token]);

  // Context value
  const contextValue: AuthContextValue = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Protected route HOC
interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireRoles?: User['role'][];
}

export function ProtectedRoute({ 
  children, 
  fallback = <div>Access denied</div>,
  requireRoles = []
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  // Check role requirements
  if (requireRoles.length > 0 && !requireRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">Access Restricted</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: { requireRoles?: User['role'][] } = {}
) {
  const WrappedComponent = (props: P) => (
    <ProtectedRoute requireRoles={options.requireRoles}>
      <Component {...props} />
    </ProtectedRoute>
  );

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Export the provider as default
export default AuthProvider;
