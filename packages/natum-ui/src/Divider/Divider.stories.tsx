import type { Meta, StoryObj } from "@storybook/react";
import { Divider } from "./Divider";

const meta: Meta<typeof Divider> = {
  title: "Components/Divider",
  component: Divider,
  argTypes: {
    orientation: { control: "select", options: ["horizontal", "vertical"] },
    variant: { control: "select", options: ["solid", "dashed", "dotted"] },
    color: {
      control: "select",
      options: ["primary", "secondary", "neutral", "light"],
    },
    thickness: { control: "number" },
    spacing: {
      control: "select",
      options: ["none", "small", "medium", "large"],
    },
    label: { control: "text" },
    labelPosition: {
      control: "select",
      options: ["left", "center", "right"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Default: Story = {};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  decorators: [
    (Story) => (
      <div
        style={{
          display: "flex",
          height: 100,
          alignItems: "stretch",
        }}
      >
        <span>Left</span>
        <Story />
        <span>Right</span>
      </div>
    ),
  ],
};

export const Dashed: Story = { args: { variant: "dashed" } };
export const Dotted: Story = { args: { variant: "dotted" } };

export const ColorPrimary: Story = { args: { color: "primary" } };
export const ColorSecondary: Story = { args: { color: "secondary" } };
export const ColorLight: Story = { args: { color: "light" } };

export const Thick: Story = { args: { thickness: 3 } };

export const SpacingNone: Story = {
  args: { spacing: "none" },
  decorators: [
    (Story) => (
      <div>
        <p>Above</p>
        <Story />
        <p>Below</p>
      </div>
    ),
  ],
};

export const SpacingLarge: Story = {
  args: { spacing: "large" },
  decorators: [
    (Story) => (
      <div>
        <p>Above</p>
        <Story />
        <p>Below</p>
      </div>
    ),
  ],
};

export const WithLabel: Story = { args: { label: "OR" } };

export const LabelLeft: Story = {
  args: { label: "Section", labelPosition: "left" },
};

export const LabelRight: Story = {
  args: { label: "End", labelPosition: "right" },
};
