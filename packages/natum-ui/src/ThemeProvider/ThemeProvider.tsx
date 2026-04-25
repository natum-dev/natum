"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ThemeContext, type ResolvedTheme, type Theme } from "./ThemeContext";
import { parseThemeCookie, serializeThemeCookie } from "./cookie";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

export type ThemeProviderProps = {
  children: ReactNode;
};

const resolveSystemTheme = (): ResolvedTheme => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const resolveTheme = (theme: Theme): ResolvedTheme =>
  theme === "system" ? resolveSystemTheme() : theme;

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // SSR-stable initial state. The blocking <ThemeScript /> handles the visual
  // side; React state catches up in the layout effect below, same tick as
  // hydration, before the browser paints.
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme | null>(
    null
  );

  useIsomorphicLayoutEffect(() => {
    const stored = parseThemeCookie(document.cookie);
    const initial: Theme = stored ?? "system";
    const resolved = resolveTheme(initial);
    setThemeState(initial);
    setResolvedTheme(resolved);
    document.documentElement.dataset.theme = resolved;
  }, []);

  // Track OS preference changes while in system mode.
  useEffect(() => {
    if (theme !== "system" || typeof window === "undefined") return;
    if (typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (event: MediaQueryListEvent) => {
      const next: ResolvedTheme = event.matches ? "dark" : "light";
      setResolvedTheme(next);
      document.documentElement.dataset.theme = next;
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    const resolved = resolveTheme(next);
    setThemeState(next);
    setResolvedTheme(resolved);
    if (typeof document !== "undefined") {
      document.cookie = serializeThemeCookie(next);
      document.documentElement.dataset.theme = resolved;
    }
  }, []);

  const toggleTheme = useCallback(() => {
    if (resolvedTheme === null) return; // pre-hydration no-op
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export { ThemeProvider };
