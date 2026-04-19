import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Toggle } from "./Toggle";
import { Stack } from "../Stack";
import { Typography } from "../Typography";

const meta: Meta<typeof Toggle> = {
  title: "Forms/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    labelPosition: { control: "inline-radio", options: ["start", "end"] },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  args: { "aria-label": "Toggle" },
};

const ControlledDemo = () => {
  const [on, setOn] = useState(false);
  return (
    <Stack gap={2}>
      <Toggle
        checked={on}
        onChange={(e) => setOn(e.target.checked)}
        label="Controlled toggle"
      />
      <Typography variant="body2" color="secondary">
        State: {on ? "on" : "off"}
      </Typography>
    </Stack>
  );
};

export const Controlled: Story = {
  render: () => <ControlledDemo />,
};

export const WithLabel: Story = {
  args: { label: "Enable notifications" },
};

export const WithDescription: Story = {
  args: {
    label: "Email alerts",
    description: "Receive an email when someone shares a file with you.",
  },
};

export const Sizes: Story = {
  render: () => (
    <Stack gap={2}>
      <Toggle size="sm" label="Small" />
      <Toggle size="md" label="Medium" />
    </Stack>
  ),
};

export const LabelPositions: Story = {
  render: () => (
    <Stack gap={2}>
      <Toggle
        labelPosition="start"
        label="Label start (default)"
        description="Settings UI convention."
      />
      <Toggle
        labelPosition="end"
        label="Label end"
        description="Form input convention."
      />
    </Stack>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Stack gap={2}>
      <Toggle disabled label="Disabled off" />
      <Toggle disabled defaultChecked label="Disabled on" />
    </Stack>
  ),
};

const SettingsRow = () => {
  const [settings, setSettings] = useState({
    darkMode: false,
    emailAlerts: true,
    pushAlerts: false,
    weekly: true,
  });
  const update = (key: keyof typeof settings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setSettings((prev) => ({ ...prev, [key]: e.target.checked }));
  return (
    <Stack gap={3} style={{ inlineSize: 360 }}>
      <Toggle
        checked={settings.darkMode}
        onChange={update("darkMode")}
        label="Dark mode"
        description="Use the dark color palette."
      />
      <Toggle
        checked={settings.emailAlerts}
        onChange={update("emailAlerts")}
        label="Email alerts"
        description="Notify me by email when files are shared."
      />
      <Toggle
        checked={settings.pushAlerts}
        onChange={update("pushAlerts")}
        label="Push notifications"
        description="Send browser push notifications."
      />
      <Toggle
        checked={settings.weekly}
        onChange={update("weekly")}
        label="Weekly summary"
        description="Every Monday at 8am."
      />
    </Stack>
  );
};

export const SettingsRowStory: Story = {
  name: "SettingsRow",
  render: () => <SettingsRow />,
};
