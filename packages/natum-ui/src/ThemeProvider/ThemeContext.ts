import { createContext } from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export type ThemeContextValue = {
  /** User's current choice. Persisted via cookie when set explicitly. */
  theme: Theme;
  /**
   * The concrete mode applied to `<html data-theme>`. Null on the server and
   * during the first client render — consumers that render differently per
   * theme must gate on `resolvedTheme != null` to avoid hydration mismatches.
   */
  resolvedTheme: ResolvedTheme | null;
  setTheme: (theme: Theme) => void;
  /**
   * Flips `resolvedTheme` to its opposite and writes an explicit cookie.
   * A user in `"system"` mode who toggles escapes system mode; re-entering
   * requires an explicit `setTheme("system")`.
   */
  toggleTheme: () => void;
};

// Default is `null` to force explicit <ThemeProvider> usage; `useTheme` throws
// a helpful error when the context is unset rather than silently falling back.
export const ThemeContext = createContext<ThemeContextValue | null>(null);
