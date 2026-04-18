import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { RadioGroup } from "./RadioGroup";
import { Radio } from "../Radio";
import { Card } from "../Card";
import { Stack } from "../Stack";
import { Typography } from "../Typography";

const meta: Meta<typeof RadioGroup> = {
  title: "Forms/RadioGroup",
  component: RadioGroup,
  argTypes: {
    orientation: { control: "select", options: ["vertical", "horizontal"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    color: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "error",
        "success",
        "warning",
        "info",
        "neutral",
      ],
    },
    gap: { control: "number" },
    required: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  args: { label: "Pick a plan", defaultValue: "free" },
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="free" label="Free" />
      <Radio value="pro" label="Pro" />
      <Radio value="team" label="Team" />
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  args: {
    label: "Size",
    defaultValue: "md",
    orientation: "horizontal",
    gap: 4,
  },
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="sm" label="Small" />
      <Radio value="md" label="Medium" />
      <Radio value="lg" label="Large" />
    </RadioGroup>
  ),
};

export const WithHelperText: Story = {
  args: {
    label: "Notification frequency",
    helperText: "You can change this later in settings.",
    defaultValue: "daily",
  },
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="realtime" label="Realtime" />
      <Radio value="daily" label="Daily digest" />
      <Radio value="weekly" label="Weekly digest" />
    </RadioGroup>
  ),
};

export const ErrorState: Story = {
  args: {
    label: "Delivery method",
    errorMessage: "Please select a delivery method.",
  },
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="pickup" label="Pickup" />
      <Radio value="shipping" label="Shipping" />
    </RadioGroup>
  ),
};

export const Required: Story = {
  args: {
    label: "Preferred contact",
    required: true,
    defaultValue: "email",
  },
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="email" label="Email" />
      <Radio value="phone" label="Phone" />
    </RadioGroup>
  ),
};

export const DisabledGroup: Story = {
  args: {
    label: "Locked selection",
    disabled: true,
    defaultValue: "b",
  },
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="a" label="Alpha" />
      <Radio value="b" label="Beta" />
      <Radio value="c" label="Gamma" />
    </RadioGroup>
  ),
};

export const SizeColorOverride: Story = {
  args: {
    label: "Mostly sm/error — one override",
    size: "sm",
    color: "error",
    defaultValue: "a",
  },
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="a" label="Inherits sm + error" />
      <Radio value="b" label="Overrides to lg + success" size="lg" color="success" />
    </RadioGroup>
  ),
};

const ControlledDemo = () => {
  const [value, setValue] = useState("pro");
  return (
    <Stack gap={3} style={{ maxWidth: 360 }}>
      <Typography variant="body2">Current: {value}</Typography>
      <RadioGroup
        label="Plan"
        value={value}
        onChange={(next) => setValue(next)}
      >
        <Radio value="free" label="Free" />
        <Radio value="pro" label="Pro" />
        <Radio value="team" label="Team" />
      </RadioGroup>
    </Stack>
  );
};

export const Controlled: Story = {
  render: () => <ControlledDemo />,
};

export const Uncontrolled: Story = {
  args: { label: "Uncontrolled (defaultValue=pro)", defaultValue: "pro" },
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="free" label="Free" />
      <Radio value="pro" label="Pro" />
      <Radio value="team" label="Team" />
    </RadioGroup>
  ),
};

export const PlanPickerComposition: Story = {
  render: () => (
    <Card style={{ maxWidth: 480, padding: 24 }}>
      <RadioGroup
        label="Choose your plan"
        helperText="You can switch plans at any time."
        defaultValue="pro"
        gap={3}
      >
        <Radio
          value="free"
          label={
            <Stack gap={1}>
              <Typography variant="body2" style={{ fontWeight: 600 }}>
                Free — $0/mo
              </Typography>
              <Typography variant="caption" color="secondary">
                Up to 3 projects. Community support.
              </Typography>
            </Stack>
          }
        />
        <Radio
          value="pro"
          label={
            <Stack gap={1}>
              <Typography variant="body2" style={{ fontWeight: 600 }}>
                Pro — $10/mo
              </Typography>
              <Typography variant="caption" color="secondary">
                Unlimited projects. Priority support.
              </Typography>
            </Stack>
          }
        />
        <Radio
          value="team"
          label={
            <Stack gap={1}>
              <Typography variant="body2" style={{ fontWeight: 600 }}>
                Team — $30/mo
              </Typography>
              <Typography variant="caption" color="secondary">
                Everything in Pro + SSO, audit log, and admin tools.
              </Typography>
            </Stack>
          }
        />
      </RadioGroup>
    </Card>
  ),
};
