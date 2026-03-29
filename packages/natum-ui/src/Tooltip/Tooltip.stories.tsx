import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip } from "./Tooltip";
import { Button } from "../Button";
import { IconButton } from "../IconButton";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  argTypes: {
    placement: { control: "select", options: ["top", "bottom", "left", "right"] },
    delay: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    content: "This is a tooltip",
    children: <Button>Hover me</Button>,
  },
};

export const Placements: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, justifyContent: "center", padding: "80px 0" }}>
      <Tooltip content="Top tooltip" placement="top">
        <Button variant="outlined" size="sm">Top</Button>
      </Tooltip>
      <Tooltip content="Bottom tooltip" placement="bottom">
        <Button variant="outlined" size="sm">Bottom</Button>
      </Tooltip>
      <Tooltip content="Left tooltip" placement="left">
        <Button variant="outlined" size="sm">Left</Button>
      </Tooltip>
      <Tooltip content="Right tooltip" placement="right">
        <Button variant="outlined" size="sm">Right</Button>
      </Tooltip>
    </div>
  ),
};

export const RichContent: Story = {
  render: () => (
    <div style={{ padding: "60px 0", display: "flex", justifyContent: "center" }}>
      <Tooltip content={<span><strong>Pro tip:</strong> You can also press <kbd style={{ padding: "1px 4px", borderRadius: 3, background: "rgba(255,255,255,0.15)" }}>Ctrl+U</kbd> to upload files.</span>}>
        <Button>Upload</Button>
      </Tooltip>
    </div>
  ),
};

export const WithLink: Story = {
  render: () => (
    <div style={{ padding: "60px 0", display: "flex", justifyContent: "center" }}>
      <Tooltip content={<span>File too large. <a href="#" onClick={(e) => e.preventDefault()}>Upgrade plan</a></span>}>
        <Button>Upload</Button>
      </Tooltip>
    </div>
  ),
};

export const ZeroDelay: Story = {
  args: {
    content: "Instant tooltip",
    delay: 0,
    children: <Button variant="outlined">No delay</Button>,
  },
};

export const RealWorldIconButtons: Story = {
  name: "Real-World: Icon Button Labels",
  render: () => (
    <div style={{ display: "flex", gap: 8, padding: "40px 0" }}>
      <Tooltip content="Download file">
        <IconButton aria-label="Download file" size="sm">↓</IconButton>
      </Tooltip>
      <Tooltip content="Delete file">
        <IconButton aria-label="Delete file" size="sm" color="error">✕</IconButton>
      </Tooltip>
      <Tooltip content="Share file">
        <IconButton aria-label="Share file" size="sm">⤴</IconButton>
      </Tooltip>
    </div>
  ),
};

export const DarkMode: Story = {
  args: {
    content: "Dark mode tooltip",
    children: <Button>Hover me</Button>,
  },
  globals: { theme: "dark" },
};

export const RTL: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, justifyContent: "center", padding: "80px 0" }}>
      <Tooltip content="تلميح أعلى" placement="top">
        <Button size="sm">أعلى</Button>
      </Tooltip>
      <Tooltip content="تلميح يسار" placement="left">
        <Button size="sm">يسار</Button>
      </Tooltip>
      <Tooltip content="تلميح يمين" placement="right">
        <Button size="sm">يمين</Button>
      </Tooltip>
    </div>
  ),
  globals: { direction: "rtl" },
};
