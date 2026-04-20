import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Avatar } from "./Avatar";
import { IconSettings } from "@natum/icons";

const meta: Meta<typeof Avatar> = {
  title: "Data/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg", "xl"] },
    shape: { control: "radio", options: ["circle", "square"] },
    color: {
      control: "radio",
      options: ["auto", "neutral", "primary", "success", "warning", "error", "info"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: { name: "Alice Zhang", size: "md" },
};

export const Fallbacks: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Avatar
        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop"
        name="Real image"
      />
      <Avatar name="Broken Src" src="/definitely-missing.png" />
      <Avatar name="Initials Only" />
      <Avatar fallback={<IconSettings size={20} />} />
      <Avatar />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Avatar name="Alice Zhang" size="sm" />
      <Avatar name="Alice Zhang" size="md" />
      <Avatar name="Alice Zhang" size="lg" />
      <Avatar name="Alice Zhang" size="xl" />
    </div>
  ),
};

export const Shapes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Avatar name="Alice" shape="circle" />
      <Avatar name="Acme Corp" shape="square" />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {["Alice", "Bob", "Charlie", "Dana", "Eve", "Fay", "Gil", "Hal"].map(
          (n) => (
            <Avatar key={n} name={n} />
          )
        )}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {(
          ["neutral", "primary", "success", "warning", "error", "info"] as const
        ).map((c) => (
          <Avatar key={c} name="X" color={c} />
        ))}
      </div>
    </div>
  ),
};

const BrokenImageDemo = () => {
  const [src, setSrc] = useState("/definitely-missing.png");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Avatar src={src} name="Alice Zhang" size="lg" />
      <button type="button" onClick={() => setSrc(`/also-missing-${Date.now()}.png`)}>
        Retry with new URL
      </button>
    </div>
  );
};

export const BrokenImage: Story = {
  render: () => <BrokenImageDemo />,
};
