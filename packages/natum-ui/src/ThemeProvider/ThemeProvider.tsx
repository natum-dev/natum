"use client";

import { useState, useCallback, useMemo, useEffect, type ReactNode } from "react";
import { ThemeContext, type Theme } from "./ThemeContext";

export type ThemeProviderProps = {
  defaultTheme?: Theme;
  children: ReactNode;
};

const ThemeProvider = ({
  defaultTheme = "light",
  children,
}: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeProvider };
