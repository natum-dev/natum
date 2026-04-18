import type { Meta, StoryObj } from "@storybook/react";
import { IconBell } from "@natum/icons";
import { Alert } from "./Alert";
import { Stack } from "../Stack";
import { Button } from "../Button";
import { Typography } from "../Typography";

const meta: Meta<typeof Alert> = {
  title: "Feedback/Alert",
  component: Alert,
  argTypes: {
    type: {
      control: "select",
      options: ["success", "error", "warning", "info"],
    },
    dismissible: { control: "boolean" },
    title: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: { type: "info" },
  render: (args) => (
    <Alert {...args}>Your changes were auto-saved a moment ago.</Alert>
  ),
};

export const AllTypes: Story = {
  render: () => (
    <Stack gap={3} style={{ maxWidth: 560 }}>
      <Alert type="success" title="Saved">
        Your profile changes were saved successfully.
      </Alert>
      <Alert type="error" title="Save failed">
        We couldn&apos;t reach the server. Check your connection and retry.
      </Alert>
      <Alert type="warning" title="Heads up">
        Your free plan will expire in 3 days.
      </Alert>
      <Alert type="info" title="Did you know?">
        You can invite teammates from the settings page.
      </Alert>
    </Stack>
  ),
};

export const Dismissible: Story = {
  args: { type: "warning", dismissible: true, title: "Heads up" },
  render: (args) => (
    <Alert {...args}>Click the close button — the alert will disappear.</Alert>
  ),
};

export const CustomIcon: Story = {
  render: () => (
    <Alert type="info" icon={IconBell} title="Reminder">
      You have three unread notifications.
    </Alert>
  ),
};

export const WithoutIcon: Story = {
  render: () => (
    <Alert type="info" icon={false}>
      A minimal alert without a leading icon — useful for dense UIs.
    </Alert>
  ),
};

export const AboveForm: Story = {
  render: () => (
    <Stack gap={3} style={{ maxWidth: 480 }}>
      <Alert type="error" title="Please fix the errors below">
        The email address you entered is already in use.
      </Alert>
      <Stack gap={2}>
        <Typography variant="body2">Email</Typography>
        <input
          defaultValue="taken@example.com"
          style={{
            padding: "8px 12px",
            border: "1px solid var(--error-border)",
            borderRadius: 8,
          }}
        />
      </Stack>
      <Stack direction="row" gap={2} justify="end">
        <Button variant="text">Cancel</Button>
        <Button>Retry</Button>
      </Stack>
    </Stack>
  ),
};
