import type { Theme } from "./ThemeContext";

export const THEME_COOKIE_NAME = "natum-theme";

const VALID_THEMES: readonly Theme[] = ["light", "dark", "system"];

const isValidTheme = (value: string): value is Theme =>
  (VALID_THEMES as readonly string[]).includes(value);

export const parseThemeCookie = (cookieHeader: string): Theme | null => {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(
    /(?:^|;\s*)natum-theme=(light|dark|system)(?:;|$)/
  );
  if (!match) return null;
  const value = match[1];
  return isValidTheme(value) ? value : null;
};

export const serializeThemeCookie = (theme: Theme): string =>
  `${THEME_COOKIE_NAME}=${theme}; path=/; max-age=31536000; samesite=lax`;
