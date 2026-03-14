import type { Meta, StoryObj } from "@storybook/react";
import { IconButton } from "./IconButton";
import { IconHeart, IconStar, IconTrash, IconCheck, IconAlertTriangle, IconSettings, IconDownload } from "@natum/icons";

const meta: Meta<typeof IconButton> = {
  title: "Components/IconButton",
  component: IconButton,
  argTypes: {
    size: {
      control: "select",
      options: ["small", "medium", "large"],
    },
    variant: {
      control: "select",
      options: ["filled", "light", "outlined", "text"],
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "error", "success", "warning"],
    },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
  },
  args: {
    icon: IconHeart,
    "aria-label": "Favorite",
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {};

export const Small: Story = {
  args: { size: "small", icon: IconStar, "aria-label": "Star" },
};

export const Medium: Story = {
  args: { size: "medium", icon: IconStar, "aria-label": "Star" },
};

export const Large: Story = {
  args: { size: "large", icon: IconStar, "aria-label": "Star" },
};

export const Filled: Story = {
  args: { variant: "filled", icon: IconHeart, "aria-label": "Favorite" },
};

export const Light: Story = {
  args: { variant: "light", icon: IconHeart, "aria-label": "Favorite" },
};

export const Outlined: Story = {
  args: { variant: "outlined", icon: IconHeart, "aria-label": "Favorite" },
};

export const Text: Story = {
  args: { variant: "text", icon: IconHeart, "aria-label": "Favorite" },
};

export const ColorPrimary: Story = {
  args: { color: "primary", icon: IconHeart, "aria-label": "Primary" },
};

export const ColorSecondary: Story = {
  args: { color: "secondary", icon: IconStar, "aria-label": "Secondary" },
};

export const ColorError: Story = {
  args: { color: "error", icon: IconTrash, "aria-label": "Delete" },
};

export const ColorSuccess: Story = {
  args: { color: "success", icon: IconCheck, "aria-label": "Confirm" },
};

export const ColorWarning: Story = {
  args: { color: "warning", icon: IconAlertTriangle, "aria-label": "Warning" },
};

export const Disabled: Story = {
  args: { disabled: true, icon: IconSettings, "aria-label": "Settings" },
};

export const Loading: Story = {
  args: { loading: true, icon: IconDownload, "aria-label": "Downloading" },
};
