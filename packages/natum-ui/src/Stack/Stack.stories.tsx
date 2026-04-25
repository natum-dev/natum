import type { Meta, StoryObj } from "@storybook/react";
import { Stack } from "./Stack";
import { Button } from "../Button";
import { Card } from "../Card";
import { Typography } from "../Typography";

const meta: Meta<typeof Stack> = {
  title: "Layout/Stack",
  component: Stack,
  argTypes: {
    direction: { control: "select", options: ["row", "column"] },
    gap: { control: "select", options: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
    align: {
      control: "select",
      options: [undefined, "start", "center", "end", "stretch", "baseline"],
    },
    justify: {
      control: "select",
      options: [
        undefined,
        "start",
        "center",
        "end",
        "between",
        "around",
        "evenly",
      ],
    },
    wrap: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Stack>;

const boxStyle: React.CSSProperties = {
  padding: 12,
  background: "var(--primary-surface)",
  borderRadius: 8,
  minWidth: 80,
  textAlign: "center",
};

export const Default: Story = {
  args: { gap: 4 },
  render: (args) => (
    <Stack {...args}>
      <div style={boxStyle}>One</div>
      <div style={boxStyle}>Two</div>
      <div style={boxStyle}>Three</div>
    </Stack>
  ),
};

export const FormFieldGroup: Story = {
  render: () => (
    <Card size="lg" style={{ maxWidth: 360 }}>
      <Stack gap={3}>
        <Typography variant="h5">Sign in</Typography>
        <Typography variant="body2">Placeholder label/field here</Typography>
        <Typography variant="body2">Placeholder label/field here</Typography>
        <Stack direction="row" gap={2} justify="end">
          <Button variant="text">Cancel</Button>
          <Button>Sign in</Button>
        </Stack>
      </Stack>
    </Card>
  ),
};

export const ButtonRow: Story = {
  render: () => (
    <Stack direction="row" gap={2}>
      <Button variant="text">Cancel</Button>
      <Button variant="soft">Save draft</Button>
      <Button>Publish</Button>
    </Stack>
  ),
};

export const Toolbar: Story = {
  render: () => (
    <Stack direction="row" gap={2} align="center" wrap>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={boxStyle}>
          Tool {i + 1}
        </div>
      ))}
    </Stack>
  ),
};

export const AllGaps: Story = {
  render: () => (
    <Stack gap={4}>
      {[0, 1, 2, 3, 4, 6, 8, 12, 16].map((g) => (
        <div key={g}>
          <Typography variant="caption">gap={g}</Typography>
          <Stack direction="row" gap={g as 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16}>
            <div style={boxStyle}>A</div>
            <div style={boxStyle}>B</div>
            <div style={boxStyle}>C</div>
          </Stack>
        </div>
      ))}
    </Stack>
  ),
};
