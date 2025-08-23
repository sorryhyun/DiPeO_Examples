'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useMockAuth } from '../hooks/useMockAuth';
import { User, AuthContextType } from '../../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('auth_user', null);
  const mockAuth = useMockAuth();

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const result = await mockAuth.login(email, password);
      if (result && result.user) {
        setCurrentUser(result.user);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    mockAuth.logout();
  };

  const value: AuthContextType = {
    user: currentUser,
    currentUser,
    login,
    logout,
    isAuthenticated: !!currentUser,
    isLoading: false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
