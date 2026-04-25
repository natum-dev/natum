import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { ProgressBar } from "./ProgressBar";

const meta: Meta<typeof ProgressBar> = {
  title: "Feedback/ProgressBar",
  component: ProgressBar,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
    color: {
      control: "radio",
      options: ["primary", "success", "error", "warning", "info"],
    },
    value: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
    },
  },
  args: {
    value: 0.5,
    size: "md",
    color: "primary",
    "aria-label": "Loading",
  },
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

const wrapStyle: React.CSSProperties = { inlineSize: 320 };

export const Default: Story = {
  render: (args) => (
    <div style={wrapStyle}>
      <ProgressBar {...args} />
    </div>
  ),
};

export const AllValues: Story = {
  render: (args) => (
    <div
      style={{
        ...wrapStyle,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {[0, 0.25, 0.5, 0.75, 1].map((v) => (
        <ProgressBar
          key={v}
          {...args}
          value={v}
          aria-label={`${Math.round(v * 100)}%`}
        />
      ))}
    </div>
  ),
};

export const Indeterminate: Story = {
  args: { value: undefined },
  render: (args) => (
    <div style={wrapStyle}>
      <ProgressBar {...args} />
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
        gap: 16,
      }}
    >
      <ProgressBar {...args} size="sm" aria-label="Small" />
      <ProgressBar {...args} size="md" aria-label="Medium" />
      <ProgressBar {...args} size="lg" aria-label="Large" />
    </div>
  ),
};

export const Colors: Story = {
  args: { value: 0.6 },
  render: (args) => (
    <div
      style={{
        ...wrapStyle,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {(["primary", "success", "error", "warning", "info"] as const).map(
        (c) => (
          <ProgressBar
            key={c}
            {...args}
            color={c}
            aria-label={c}
          />
        ),
      )}
    </div>
  ),
};

const LiveProgressDemo = () => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setValue((v) => (v >= 1 ? 0 : Math.min(1, v + 0.05)));
    }, 200);
    return () => {
      clearInterval(id);
    };
  }, []);
  return (
    <div style={wrapStyle}>
      <ProgressBar value={value} aria-label="Live progress" />
    </div>
  );
};

export const LiveProgress: Story = {
  render: () => <LiveProgressDemo />,
};
