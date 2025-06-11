import { storage } from './storage';

export const themeManager = {
  init: () => {
    const preferences = storage.getPreferences();
    themeManager.applyTheme(preferences.theme);
  },

  applyTheme: (theme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    
    if (theme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', systemPrefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  },

  toggle: () => {
    const preferences = storage.getPreferences();
    const currentTheme = preferences.theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    storage.setPreferences({ ...preferences, theme: newTheme });
    themeManager.applyTheme(newTheme);
    
    return newTheme;
  },

  getCurrentTheme: (): 'light' | 'dark' => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }
};

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  const preferences = storage.getPreferences();
  if (preferences.theme === 'system') {
    themeManager.applyTheme('system');
  }
});