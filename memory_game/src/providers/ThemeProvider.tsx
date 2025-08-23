import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '../shared/hooks/useLocalStorage';
import { Theme } from '../types';

type UIMode = 'light' | 'dark';

// Use the Theme type from the main types file
// Local alias for backward compatibility
type GameTheme = Theme;

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
    displayName: 'Animals',
    cards: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐧'],
    description: 'Cute animal faces',
    preview: '🐶',
    type: 'emoji'
  },
  {
    id: 'emojis',
    name: 'Emojis',
    displayName: 'Emojis',
    cards: ['😀', '😂', '😍', '🤔', '😎', '😴', '🤯', '🥳', '😇', '🤠', '🤖', '👻', '🎃', '🌟', '🔥', '💎'],
    description: 'Fun emoji expressions',
    preview: '😀',
    type: 'emoji'
  },
  {
    id: 'colors',
    name: 'Colors',
    displayName: 'Colors',
    cards: ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💫'],
    description: 'Colorful shapes and symbols',
    preview: '🔴',
    type: 'emoji'
  },
  {
    id: 'shapes',
    name: 'Shapes',
    displayName: 'Shapes',
    cards: ['⬜', '⬛', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '🟫', '⭐', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻'],
    description: 'Geometric shapes',
    preview: '⬜',
    type: 'emoji'
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
