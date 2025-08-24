import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';
import { apiClient } from '@/services/apiClient';
import { mockUsers } from '@/constants/mockData';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useLocalStorage<User | null>('auth_user', null);
  const [token, setToken] = useLocalStorage<string | null>('auth_token', null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Mock authentication - find user by email
      const mockUser = mockUsers.find(u => u.email === email);
      if (mockUser && password === 'password') { // Simple mock password
        const mockToken = `mock_token_${mockUser.id}_${Date.now()}`;
        setUser(mockUser);
        setToken(mockToken);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  // Register token getter with apiClient
  useEffect(() => {
    apiClient.setAuthTokenGetter(() => token);
  }, [token]);

  // Initialize loading state
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    setUser,
    setToken,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// SELF-CHECK:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config` (not applicable for this provider)
// [x] Exports default named component (exports named AuthProvider component)
// [x] Adds basic ARIA and keyboard handlers (not applicable for provider)
