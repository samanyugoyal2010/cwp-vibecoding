import React from 'react';
import { Moon, Sun, Settings, Home } from 'lucide-react';
import { themeManager } from '../utils/theme';

interface HeaderProps {
  currentGame?: string;
  onHomeClick?: () => void;
  onSettingsClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentGame, onHomeClick, onSettingsClick }) => {
  const [isDark, setIsDark] = React.useState(themeManager.getCurrentTheme() === 'dark');

  const handleThemeToggle = () => {
    const newTheme = themeManager.toggle();
    setIsDark(newTheme === 'dark');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={onHomeClick}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity focus-ring rounded-lg"
              aria-label="Home"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gradient">GameHub</h1>
            </button>
            {currentGame && (
              <span className="text-gray-500 dark:text-gray-400">
                / {currentGame}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus-ring"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            
            <button
              onClick={onSettingsClick}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus-ring"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};