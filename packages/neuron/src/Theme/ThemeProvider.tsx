import { createContext, ReactNode, useContext, useMemo } from "react";
import { Theme } from "./types";
import { blue, green, grey, orange, red, yellow } from "../colors";
import _merge from "lodash/merge";

const DEFAULT_THEME = {
  palette: {
    primary: {
      primary: blue[500],
      dark: blue[700],
      light: blue[300],
    },
    secondary: {
      primary: orange[400],
      dark: orange[700],
      light: orange[300],
    },
    error: {
      primary: red[500],
      dark: red[700],
      light: red[300],
    },
    info: {
      primary: blue[400],
      dark: blue[700],
      light: blue[300],
    },
    success: {
      primary: green[500],
      dark: green[700],
      light: green[300],
    },
    warning: {
      primary: yellow[500],
      dark: yellow[700],
      light: yellow[300],
    },
  },
  typography: {
    direction: "auto",
    sizes: {
      h1: "36px",
      h2: "32px",
      h3: "28px",
      h4: "24px",
      h5: "20px",
      h6: "16px",
      default: "12px",
    },
    color: {
      primary: grey[50],
      secondary: grey[200],
      disabled: grey[400],
    },
  },
} satisfies Theme;

const ThemeContext = createContext<Theme>(DEFAULT_THEME);

type ThemeOptions = {
  value?: Partial<Theme>;
  children?: ReactNode;
};

export const ThemeProvider = ({ value, children }: ThemeOptions) => {
  const contextValue = useMemo(() => {
    if (!value) return DEFAULT_THEME;
    return _merge({}, DEFAULT_THEME, value);
  }, [value]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
