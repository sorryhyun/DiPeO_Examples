import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { startMockServer, stopMockServer } from '@/utils/mockServer';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';
import { DEFAULT_APP_CONFIG } from '@/constants/appConfig';
import type { User } from '@/types';

// Theme Context
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

// Auth Context
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// AppProvider Props
interface AppProviderProps {
  children: ReactNode;
}

// Create QueryClient with Suspense-ready defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      useErrorBoundary: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      useErrorBoundary: true,
    },
  },
});

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Theme state with localStorage persistence
  const [theme, setThemeState] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  
  // Auth state with localStorage persistence
  const [user, setUser] = useLocalStorage<User | null>('auth_user', null);

  // Initialize mock server on mount if enabled
  useEffect(() => {
    if (DEFAULT_APP_CONFIG.development_mode.enable_mock_data) {
      startMockServer();
    }

    // Cleanup on unmount
    return () => {
      if (DEFAULT_APP_CONFIG.development_mode.enable_mock_data) {
        stopMockServer();
      }
    };
  }, []);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Theme context value
  const themeValue: ThemeContextType = {
    theme,
    toggleTheme: () => setThemeState(theme === 'light' ? 'dark' : 'light'),
    setTheme: setThemeState,
  };

  // Auth context value
  const authValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login: async (credentials) => {
      // In dev mode with mock users, validate against config
      if (DEFAULT_APP_CONFIG.development_mode.enable_mock_data) {
        const mockUser = DEFAULT_APP_CONFIG.development_mode.mock_auth_users.find(
          u => u.email === credentials.email && u.password === credentials.password
        );
        
        if (mockUser) {
          const { password, ...userWithoutPassword } = mockUser;
          setUser(userWithoutPassword);
          return;
        } else {
          throw new Error('Invalid credentials');
        }
      }
      
      // In production, this would call a real auth service
      throw new Error('Authentication not implemented for production');
    },
    logout: () => {
      setUser(null);
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={themeValue}>
        <AuthContext.Provider value={authValue}>
          {children}
        </AuthContext.Provider>
      </ThemeContext.Provider>
    </QueryClientProvider>
  );
};

// Hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within an AppProvider');
  }
  return context;
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AppProvider');
  }
  return context;
};
