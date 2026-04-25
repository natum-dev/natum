import type { Meta, StoryObj } from "@storybook/react";
import { StorageQuotaBar } from "./StorageQuotaBar";

const GB = 1_000_000_000;

const meta: Meta<typeof StorageQuotaBar> = {
  title: "Data/StorageQuotaBar",
  component: StorageQuotaBar,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
    used: { control: { type: "number" } },
    total: { control: { type: "number" } },
    warnAt: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
    errorAt: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
  },
  args: {
    used: 12.4 * GB,
    total: 15 * GB,
    size: "md",
    warnAt: 0.9,
    errorAt: 1,
  },
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof StorageQuotaBar>;

const wrapStyle: React.CSSProperties = { inlineSize: 320 };

export const Default: Story = {
  render: (args) => (
    <div style={wrapStyle}>
      <StorageQuotaBar {...args} />
    </div>
  ),
};

export const Warning: Story = {
  args: { used: 14 * GB },
  render: (args) => (
    <div style={wrapStyle}>
      <StorageQuotaBar {...args} />
    </div>
  ),
};

export const Error: Story = {
  args: { used: 16 * GB },
  render: (args) => (
    <div style={wrapStyle}>
      <StorageQuotaBar {...args} />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div
      style={{
        ...wrapStyle,
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <StorageQuotaBar {...args} size="sm" />
      <StorageQuotaBar {...args} size="md" />
      <StorageQuotaBar {...args} size="lg" />
    </div>
  ),
};

export const CustomLabels: Story = {
  args: {
    used: 12.4 * GB,
    label: "Media usage",
    valueLabel: "2.6 GB left",
  },
  render: (args) => (
    <div style={wrapStyle}>
      <StorageQuotaBar {...args} />
    </div>
  ),
};

export const InSidebar: Story = {
  render: (args) => (
    <div
      style={{
        inlineSize: 240,
        padding: 12,
        background: "var(--neutral-bg)",
        border: "1px solid var(--border-color)",
        borderRadius: 8,
      }}
    >
      <StorageQuotaBar {...args} size="sm" />
    </div>
  ),
};

export const CustomThresholds: Story = {
  args: {
    used: 12 * GB,
    warnAt: 0.75,
    errorAt: 0.95,
  },
  render: (args) => (
    <div style={wrapStyle}>
      <StorageQuotaBar {...args} />
    </div>
  ),
};
