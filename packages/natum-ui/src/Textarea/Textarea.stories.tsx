import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Textarea } from "./Textarea";
import { Stack } from "../Stack";
import { Button } from "../Button";
import { Typography } from "../Typography";

const meta: Meta<typeof Textarea> = {
  title: "Forms/Textarea",
  component: Textarea,
  argTypes: {
    variant: { control: "select", options: ["outlined", "filled"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    resize: { control: "select", options: ["none", "vertical", "both"] },
    rows: { control: "number" },
    autoResize: { control: "boolean" },
    maxRows: { control: "number" },
    required: { control: "boolean" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: { label: "Notes", helperText: "Keep it brief.", rows: 3 },
  render: (args) => <Textarea {...args} style={{ maxWidth: 480 }} />,
};

export const VariantSizeMatrix: Story = {
  render: () => (
    <Stack gap={4} style={{ maxWidth: 480 }}>
      {(["outlined", "filled"] as const).map((variant) => (
        <Stack key={variant} gap={3}>
          <Typography variant="caption">variant={variant}</Typography>
          {(["sm", "md", "lg"] as const).map((size) => (
            <Textarea
              key={size}
              variant={variant}
              size={size}
              placeholder={`size=${size}`}
            />
          ))}
        </Stack>
      ))}
    </Stack>
  ),
};

export const WithLabelAndHelper: Story = {
  args: {
    label: "Bio",
    helperText: "A short description shown on your profile.",
    rows: 4,
  },
  render: (args) => <Textarea {...args} style={{ maxWidth: 480 }} />,
};

export const ErrorState: Story = {
  args: {
    label: "Feedback",
    errorMessage: "Please provide at least 20 characters.",
    rows: 4,
    defaultValue: "too short",
  },
  render: (args) => <Textarea {...args} style={{ maxWidth: 480 }} />,
};

export const Required: Story = {
  args: { label: "Reason", required: true, rows: 3 },
  render: (args) => <Textarea {...args} style={{ maxWidth: 480 }} />,
};

export const Disabled: Story = {
  args: { label: "Disabled", disabled: true, defaultValue: "can't edit" },
  render: (args) => <Textarea {...args} style={{ maxWidth: 480 }} />,
};

export const ReadOnly: Story = {
  args: {
    label: "Read-only",
    readOnly: true,
    defaultValue: "The quick brown fox jumps over the lazy dog.",
  },
  render: (args) => <Textarea {...args} style={{ maxWidth: 480 }} />,
};

const AutoResizeDemo = () => {
  const [value, setValue] = useState("Type here — the box grows.\n");
  return (
    <Textarea
      label="AutoResize (maxRows=6)"
      autoResize
      maxRows={6}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      style={{ maxWidth: 480 }}
    />
  );
};

export const AutoResize: Story = {
  render: () => <AutoResizeDemo />,
};

export const CommentForm: Story = {
  render: () => (
    <Stack gap={3} style={{ maxWidth: 480 }}>
      <Textarea label="Your comment" placeholder="Share your thoughts…" rows={4} />
      <Stack direction="row" gap={2} justify="end">
        <Button variant="text">Cancel</Button>
        <Button>Post</Button>
      </Stack>
    </Stack>
  ),
};
