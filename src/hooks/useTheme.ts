import { useState, useEffect } from 'react';
import { ThemeConfig } from '../types';
import { getSavedTheme, saveTheme, applyThemeToDom } from '../themes/themeManager';

export function useTheme() {
  const [theme, setTheme] = useState<ThemeConfig>(getSavedTheme);

  useEffect(() => {
    applyThemeToDom(theme);
  }, [theme]);

  const updateTheme = (newTheme: ThemeConfig) => {
    setTheme(newTheme);
    saveTheme(newTheme);
    applyThemeToDom(newTheme);
  };

  return {
    theme,
    setTheme: updateTheme,
    isDark: theme.isDark,
  };
}
