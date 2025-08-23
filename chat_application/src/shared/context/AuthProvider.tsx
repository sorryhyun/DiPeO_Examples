import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn as apiSignIn, getCurrentUser, SignInResponse } from '../../services/endpoints/users';
import { devConfig } from '../../config/devConfig';
import { User } from '../../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  getToken: () => string | null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      if (devConfig.use_localstorage_persistence) {
        const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        const storedUser = localStorage.getItem(AUTH_USER_KEY);

        if (storedToken && storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setToken(storedToken);
            setUser(userData);
            
            // Verify token is still valid by fetching current user
            const currentUser = await getCurrentUser();
            if (currentUser) {
              setUser(currentUser);
              if (devConfig.use_localstorage_persistence) {
                localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));
              }
            }
          } catch (error) {
            // Invalid stored data, clear it
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(AUTH_USER_KEY);
          }
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      const response = await apiSignIn({ email, password });
      
      setToken(response.token);
      setUser(response.user);

      if (devConfig.use_localstorage_persistence) {
        localStorage.setItem(AUTH_TOKEN_KEY, response.token);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
      }
    } catch (error) {
      // Re-throw the error to let the calling component handle it
      throw error;
    }
  };

  const signOut = (): void => {
    setToken(null);
    setUser(null);

    if (devConfig.use_localstorage_persistence) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    }
  };

  const getToken = (): string | null => {
    return token || (devConfig.use_localstorage_persistence ? localStorage.getItem(AUTH_TOKEN_KEY) : null);
  };

  const isAuthenticated = Boolean(token && user);

  const value: AuthContextType = {
    user,
    token,
    signIn,
    signOut,
    getToken,
    isAuthenticated,
  };

  // Don't render children until auth state is initialized
  if (isLoading) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
