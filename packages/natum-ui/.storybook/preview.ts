import type { Preview } from "@storybook/react";
import "../src/design-tokens/base.scss";

const preview: Preview = {
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#fafafa" },
        { name: "dark", value: "#212121" },
      ],
    },
  },
};

export default preview;
