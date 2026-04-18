import type { Meta, StoryObj } from "@storybook/react";
import { Spinner } from "./Spinner";
import { Stack } from "../Stack";
import { Typography } from "../Typography";

const meta: Meta<typeof Spinner> = {
  title: "Feedback/Spinner",
  component: Spinner,
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    color: {
      control: "select",
      options: [
        "currentColor",
        "primary",
        "secondary",
        "error",
        "success",
        "warning",
        "info",
      ],
    },
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  args: { size: "md", color: "currentColor" },
};

export const WithLabel: Story = {
  args: { size: "md", label: "Loading dashboard" },
  render: (args) => (
    <Stack direction="row" align="center" gap={2}>
      <Spinner {...args} />
      <Typography variant="body2">Loading dashboard…</Typography>
    </Stack>
  ),
};

export const SizeColorMatrix: Story = {
  render: () => (
    <Stack gap={4}>
      {(
        ["primary", "secondary", "error", "success", "warning", "info", "currentColor"] as const
      ).map((c) => (
        <Stack key={c} direction="row" align="center" gap={4}>
          <Typography variant="caption" style={{ inlineSize: 100 }}>
            {c}
          </Typography>
          <Stack direction="row" align="center" gap={3}>
            <Spinner size="sm" color={c} />
            <Spinner size="md" color={c} />
            <Spinner size="lg" color={c} />
          </Stack>
        </Stack>
      ))}
    </Stack>
  ),
};

export const InlineLoading: Story = {
  render: () => (
    <Stack direction="row" align="center" gap={2}>
      <Spinner size="sm" />
      <Typography variant="body2">Saving changes…</Typography>
    </Stack>
  ),
};
