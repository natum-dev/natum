import type { Meta, StoryObj } from "@storybook/react";
import { TextField } from "./TextField";

const meta: Meta<typeof TextField> = {
  title: "Components/TextField",
  component: TextField,
  argTypes: {
    size: {
      control: "select",
      options: ["small", "medium", "large"],
    },
    variant: {
      control: "select",
      options: ["outlined", "filled"],
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "error", "success", "warning"],
    },
    label: { control: "text" },
    errorMessage: { control: "text" },
    helperText: { control: "text" },
    clearable: { control: "boolean" },
    disabled: { control: "boolean" },
    fullWidth: { control: "boolean" },
    placeholder: { control: "text" },
  },
  args: {
    placeholder: "Type something...",
  },
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Default: Story = {};

export const Outlined: Story = {
  args: { variant: "outlined", placeholder: "Outlined" },
};

export const Filled: Story = {
  args: { variant: "filled", placeholder: "Filled" },
};

export const Small: Story = {
  args: { size: "small", placeholder: "Small" },
};

export const Medium: Story = {
  args: { size: "medium", placeholder: "Medium" },
};

export const Large: Story = {
  args: { size: "large", placeholder: "Large" },
};

export const ColorPrimary: Story = {
  args: { color: "primary", label: "Primary" },
};

export const ColorSecondary: Story = {
  args: { color: "secondary", label: "Secondary" },
};

export const ColorError: Story = {
  args: { color: "error", label: "Error" },
};

export const ColorSuccess: Story = {
  args: { color: "success", label: "Success" },
};

export const ColorWarning: Story = {
  args: { color: "warning", label: "Warning" },
};

export const WithLabel: Story = {
  args: { label: "Email address" },
};

export const WithError: Story = {
  args: {
    label: "Email",
    errorMessage: "Please enter a valid email address",
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Password",
    helperText: "Must be at least 8 characters",
  },
};

export const WithSections: Story = {
  args: {
    leftSection: <span>@</span>,
    rightSection: <span>.com</span>,
    placeholder: "username",
  },
};

export const Clearable: Story = {
  args: {
    clearable: true,
    defaultValue: "Clear me",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: "Disabled",
    placeholder: "Cannot type here",
  },
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    label: "Full width",
    placeholder: "Stretches to container",
  },
  parameters: {
    layout: "padded",
  },
};
