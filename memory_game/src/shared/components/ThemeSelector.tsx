import React from 'react';
import { useTheme } from '../../providers/ThemeProvider';

interface ThemeSelectorProps {
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ className = '' }) => {
  const { currentTheme, setTheme, availableThemes } = useTheme();

  const handleThemeSelect = (themeId: string) => {
    const theme = availableThemes.find(t => t.id === themeId);
    if (theme) {
      setTheme(theme);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        Choose Theme
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {availableThemes.map((theme) => (
          <div
            key={theme.id}
            className={`
              relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105
              ${currentTheme?.id === theme.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
            onClick={() => handleThemeSelect(theme.id)}
          >
            <div className="text-center">
              {/* Theme preview icons */}
              <div className="flex justify-center space-x-1 mb-2">
                {theme.cards?.slice(0, 4).map((icon: string, index: number) => (
                  <span key={index} className="text-lg" title={icon}>
                    {icon}
                  </span>
                ))}
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
      
      {availableThemes.length === 0 && (
        <div className="text-gray-500 dark:text-gray-400 text-center py-8">
          No themes available
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
