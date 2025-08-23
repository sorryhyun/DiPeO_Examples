import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '../shared/hooks/useLocalStorage';

type UIMode = 'light' | 'dark';

type GameTheme = {
  id: string;
  name: string;
  icons: string[];
  description: string;
};

interface ThemeContextType {
  mode: UIMode;
  setMode: (mode: UIMode) => void;
  currentTheme: GameTheme;
  setTheme: (theme: GameTheme) => void;
  availableThemes: GameTheme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_THEMES: GameTheme[] = [
  {
    id: 'animals',
    name: 'Animals',
    icons: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐧'],
    description: 'Cute animal faces'
  },
  {
    id: 'emojis',
    name: 'Emojis',
    icons: ['😀', '😂', '😍', '🤔', '😎', '😴', '🤯', '🥳', '😇', '🤠', '🤖', '👻', '🎃', '🌟', '🔥', '💎'],
    description: 'Fun emoji expressions'
  },
  {
    id: 'colors',
    name: 'Colors',
    icons: ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💫'],
    description: 'Colorful shapes and symbols'
  },
  {
    id: 'shapes',
    name: 'Shapes',
    icons: ['⬜', '⬛', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '🟫', '⭐', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻'],
    description: 'Geometric shapes'
  }
];

const DEFAULT_THEME = DEFAULT_THEMES[0];

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useLocalStorage<UIMode>('memorygame:v1:theme:mode', 'light');
  const [currentTheme, setTheme] = useLocalStorage<GameTheme>('memorygame:v1:theme:current', DEFAULT_THEME);

  const contextValue: ThemeContextType = {
    mode,
    setMode,
    currentTheme,
    setTheme,
    availableThemes: DEFAULT_THEMES
  };

  // Apply dark mode class to document
  React.useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
