import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { LSKeys, getItem, setItem } from '@/utils/storage';

// Theme types
export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

// Theme context interface
interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  systemTheme: ResolvedTheme;
}

// Create theme context
const ThemeContext = createContext<ThemeContextValue | null>(null);

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

// Helper to get system preference
const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Helper to apply theme to document
const applyTheme = (resolvedTheme: ResolvedTheme): void => {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  const isDark = resolvedTheme === 'dark';
  
  // Toggle class for Tailwind's dark mode strategy
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  // Set data attribute for additional styling if needed
  root.setAttribute('data-theme', resolvedTheme);
  
  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', isDark ? '#1f2937' : '#ffffff');
  }
};

// Helper to resolve theme based on user preference and system
const resolveTheme = (theme: Theme, systemTheme: ResolvedTheme): ResolvedTheme => {
  return theme === 'system' ? systemTheme : theme;
};

// Theme provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
  storageKey = LSKeys.THEME
}) => {
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);
  const [theme, setThemeState] = useState<Theme>(() => {
    const storedTheme = getItem<Theme>(storageKey);
    return storedTheme && ['light', 'dark', 'system'].includes(storedTheme) 
      ? storedTheme 
      : defaultTheme;
  });

  const resolvedTheme = resolveTheme(theme, systemTheme);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      setSystemTheme(newSystemTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Apply theme changes to document
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  // Set theme function
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setItem(storageKey, newTheme);
  };

  // Toggle between light and dark (ignoring system)
  const toggleTheme = () => {
    if (theme === 'system') {
      // If currently system, switch to opposite of current resolved theme
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    } else {
      // Toggle between light and dark
      setTheme(theme === 'light' ? 'dark' : 'light');
    }
  };

  // Context value
  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    systemTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

// Helper hook for components that need to know if dark mode is active
export const useIsDark = (): boolean => {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === 'dark';
};

// Helper component for theme-aware styling
interface ThemedProps {
  children: (isDark: boolean, theme: ResolvedTheme) => ReactNode;
}

export const Themed: React.FC<ThemedProps> = ({ children }) => {
  const { resolvedTheme } = useTheme();
  return <>{children(resolvedTheme === 'dark', resolvedTheme)}</>;
};

// Export theme types for external use
export type { Theme, ResolvedTheme, ThemeContextValue };
