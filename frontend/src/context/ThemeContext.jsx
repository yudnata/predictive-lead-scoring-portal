/* eslint-disable react-refresh/only-export-components */
// /* eslint-disable no-irregular-whitespace */
import React, { createContext, useState, useEffect } from 'react';

const getInitialTheme = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedPref = window.localStorage.getItem('theme');

    if (typeof storedPref === 'string') {
      return storedPref;
    }

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }
  return 'dark';
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    root.classList.add(theme);

    localStorage.setItem('theme', theme);
  }, [theme]);

  const setThemeMode = (mode) => {
    setTheme(mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
