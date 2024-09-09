export interface PaletteItem {
  primary: string;
  light: string;
  dark: string;
}

export interface Palette {
  primary: PaletteItem;
  secondary: PaletteItem;
  error: PaletteItem;
  warning: PaletteItem;
  info: PaletteItem;
  success: PaletteItem;
}

export interface TypographyColor {
  primary: string;
  secondary: string;
  disabled: string;
}

export interface TypographySize {
  h1: string;
  h2: string;
  h3: string;
  h4: string;
  h5: string;
  h6: string;
  default: string;
}

export interface Typography {
  direction: "rtl" | "ltr" | "auto";
  sizes: TypographySize;
  color: TypographyColor;
}

export interface Theme {
  palette: Palette;
  typography: Typography;
}
