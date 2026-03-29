import type { Preview, Decorator } from "@storybook/react";
import { ThemeProvider } from "../src/ThemeProvider";
import type { Theme } from "../src/ThemeProvider";
import "../src/design-tokens/base.scss";
import "./storybook.scss";

const withTheme: Decorator = (Story, context) => {
  const theme = (context.globals.theme || "light") as Theme;
  const direction = (context.globals.direction || "ltr") as "ltr" | "rtl";
  return (
    <ThemeProvider defaultTheme={theme} key={theme}>
      <div style={{ padding: 24 }} dir={direction}>
        <Story />
      </div>
    </ThemeProvider>
  );
};

const preview: Preview = {
  parameters: {
    layout: "padded",
    backgrounds: { disable: true },
  },
  globalTypes: {
    theme: {
      description: "Theme",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
    direction: {
      description: "Direction",
      toolbar: {
        title: "Direction",
        icon: "transfer",
        items: [
          { value: "ltr", title: "LTR" },
          { value: "rtl", title: "RTL" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
    direction: "ltr",
  },
  decorators: [withTheme],
};

export default preview;
