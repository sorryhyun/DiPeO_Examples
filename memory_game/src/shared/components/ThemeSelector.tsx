import React, { useState, useEffect } from 'react';
import { themesService } from '../../services/themesService';
import { useTheme } from '../../providers/ThemeProvider';
import { Theme } from '../../types';

interface ThemeSelectorProps {
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ className = '' }) => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentTheme, setTheme } = useTheme();

  useEffect(() => {
    const loadThemes = async () => {
      try {
        setLoading(true);
        const availableThemes = await themesService.getThemes();
        setThemes(availableThemes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load themes');
      } finally {
        setLoading(false);
      }
    };

    loadThemes();
  }, []);

  const handleThemeSelect = async (theme: Theme) => {
    try {
      await setTheme(theme.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set theme');
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-500 text-sm p-4 ${className}`}>
        Error loading themes: {error}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        Choose Theme
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className={`
              relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105
              ${currentTheme?.id === theme.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
            onClick={() => handleThemeSelect(theme)}
          >
            <div className="text-center">
              {/* Theme preview icons */}
              <div className="flex justify-center space-x-1 mb-2">
                {theme.previewIcons?.slice(0, 4).map((icon, index) => (
                  <span key={index} className="text-lg" title={icon}>
                    {icon}
                  </span>
                )) || (
                  <div className={`w-8 h-8 rounded ${theme.primaryColor || 'bg-gray-400'}`} />
                )}
              </div>
              
              {/* Theme name */}
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                {theme.name}
              </div>
              
              {/* Theme description */}
              {theme.description && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {theme.description}
                </div>
              )}
            </div>
            
            {/* Selected indicator */}
            {currentTheme?.id === theme.id && (
              <div className="absolute top-1 right-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {themes.length === 0 && (
        <div className="text-gray-500 dark:text-gray-400 text-center py-8">
          No themes available
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
