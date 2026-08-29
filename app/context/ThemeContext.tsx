'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

function readStoredTheme(): Theme {
  return 'light';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme] = useState<Theme>(readStoredTheme);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('light');
    html.classList.remove('dark');
    localStorage.setItem('current_theme', 'light');
  }, []);

  const setTheme = () => {};

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

