import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';
import { setAuthToken } from '@/utils/apiClient';
import nothingService from '@/services/nothingService';
import { DEFAULT_APP_CONFIG } from '@/constants/appConfig';
import type { User } from '@/types/index';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [storedUser, setStoredUser] = useLocalStorage<User | null>('auth_user', null);
  const [user, setUser] = useState<User | null>(storedUser);

  const isAuthenticated = Boolean(user);

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    try {
      let authenticatedUser: User;

      if (DEFAULT_APP_CONFIG.development_mode.enable_mock_data) {
        // Use mock authentication
        const mockUser = DEFAULT_APP_CONFIG.development_mode.mock_auth_users.find(
          u => u.email === credentials.email && u.password === credentials.password
        );

        if (!mockUser) {
          throw new Error('Invalid credentials');
        }

        authenticatedUser = {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role
        };
      } else {
        // Use real authentication service
        const response = await nothingService.login(credentials);
        authenticatedUser = response.data;
      }

      // Store user and set auth token
      setUser(authenticatedUser);
      setStoredUser(authenticatedUser);
      setAuthToken(`Bearer ${authenticatedUser.id}`); // Mock token using user ID

    } catch (error) {
      throw new Error('Login failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }, [setStoredUser]);

  const logout = useCallback(() => {
    setUser(null);
    setStoredUser(null);
    setAuthToken(''); // Clear auth token
  }, [setStoredUser]);

  // Set auth token on mount if user exists
  useEffect(() => {
    if (user) {
      setAuthToken(`Bearer ${user.id}`);
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout
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

// AuthProvider is already exported above