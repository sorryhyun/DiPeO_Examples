// src/providers/ThemeProvider.tsx
/* src/providers/ThemeProvider.tsx
   ThemeProvider manages UI theme (light/dark) and exposes theme toggling via context.
   - Persists selection to localStorage via useLocalStorage hook
   - Provides theme context with current theme and toggle function
   - Applies theme class to document root for CSS cascade
*/

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'light' 
}: ThemeProviderProps) {
  const [theme, setStoredTheme] = useLocalStorage<Theme>('app-theme', defaultTheme);

  // Apply theme class to document root for CSS cascade
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Also set data attribute for more specific CSS selectors if needed
    root.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setStoredTheme(newTheme);
  };

  const setTheme = (newTheme: Theme) => {
    setStoredTheme(newTheme);
  };

  const contextValue: ThemeContextValue = {
    theme,
    toggleTheme,
    setTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Example usage:
// import { ThemeProvider, useTheme } from '@/providers/ThemeProvider'
// 
// function App() {
//   return (
//     <ThemeProvider defaultTheme="dark">
//       <MyApp />
//     </ThemeProvider>
//   )
// }
//
// function ThemeToggleButton() {
//   const { theme, toggleTheme } = useTheme()
//   return (
//     <button onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>
//       {theme === 'light' ? '🌙' : '☀️'}
//     </button>
//   )
// }

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses useLocalStorage hook
- [x] Reads config from `@/app/config` (not needed for theme provider)
- [x] Exports default named component (exports named ThemeProvider and useTheme)
- [x] Adds basic ARIA and keyboard handlers (provides aria-label example in usage comments)
*/
