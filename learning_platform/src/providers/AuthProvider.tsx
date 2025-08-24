import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { getItem, setItem, removeItem } from '../utils/storage';
import { apiClient } from '../services/apiClient';

interface AuthContextType {
  user?: User;
  token?: string;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  getToken: () => string | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | undefined>();
  const [token, setToken] = useState<string | undefined>();

  // Initialize state from localStorage on mount in dev mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const storedUser = getItem<User>('auth_user');
      const storedToken = getItem<string>('auth_token');
      
      if (storedUser && storedToken) {
        setUser(storedUser);
        setToken(storedToken);
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await apiClient.post<{ user: User; token: string }>('/api/auth', {
        email,
        password,
      });

      const { user: authenticatedUser, token: authToken } = response;

      setUser(authenticatedUser);
      setToken(authToken);

      // Persist to localStorage in dev mode
      if (process.env.NODE_ENV === 'development') {
        setItem('auth_user', authenticatedUser);
        setItem('auth_token', authToken);
      }

      return authenticatedUser;
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const logout = (): void => {
    setUser(undefined);
    setToken(undefined);

    // Clear persisted data
    if (process.env.NODE_ENV === 'development') {
      removeItem('auth_user');
      removeItem('auth_token');
    }
  };

  const getToken = (): string | undefined => {
    return token;
  };

  const contextValue: AuthContextType = {
    user,
    token,
    login,
    logout,
    getToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// Export getToken function for apiClient initialization
export const getAuthToken = (): string | undefined => {
  // This is a runtime getter that can be used by apiClient
  // It checks localStorage directly as a fallback
  if (process.env.NODE_ENV === 'development') {
    return getItem<string>('auth_token');
  }
  return undefined;
};
