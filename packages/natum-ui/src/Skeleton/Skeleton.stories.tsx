import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./Skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
  argTypes: {
    variant: { control: "select", options: ["text", "rectangular", "circular"] },
    width: { control: "text" },
    height: { control: "text" },
    borderRadius: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {},
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 400 }}>
      <div>
        <p style={{ marginBottom: 8, color: "var(--neutral-text-secondary)", fontSize: 14 }}>Text</p>
        <Skeleton variant="text" />
        <div style={{ height: 4 }} />
        <Skeleton variant="text" width="75%" />
        <div style={{ height: 4 }} />
        <Skeleton variant="text" width="50%" />
      </div>
      <div>
        <p style={{ marginBottom: 8, color: "var(--neutral-text-secondary)", fontSize: 14 }}>Rectangular</p>
        <Skeleton variant="rectangular" width={200} height={120} />
      </div>
      <div>
        <p style={{ marginBottom: 8, color: "var(--neutral-text-secondary)", fontSize: 14 }}>Circular</p>
        <Skeleton variant="circular" width={48} height={48} />
      </div>
    </div>
  ),
};

export const CustomDimensions: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <Skeleton width={100} height={100} variant="rectangular" />
      <Skeleton width="200px" height="50px" variant="rectangular" borderRadius={12} />
      <Skeleton width={64} height={64} variant="circular" />
    </div>
  ),
};

export const RealWorldCardLoading: Story = {
  name: "Real-World: Card Loading",
  render: () => (
    <div style={{ padding: 16, border: "1px solid var(--border-color-subtle)", borderRadius: 12, maxWidth: 320 }}>
      <Skeleton variant="rectangular" height={180} />
      <div style={{ marginTop: 12 }}>
        <Skeleton variant="text" width="80%" />
        <div style={{ height: 6 }} />
        <Skeleton variant="text" width="60%" />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <Skeleton variant="circular" width={32} height={32} />
        <div style={{ flex: 1 }}>
          <Skeleton variant="text" width="50%" />
          <div style={{ height: 4 }} />
          <Skeleton variant="text" width="30%" />
        </div>
      </div>
    </div>
  ),
};

export const RealWorldFileList: Story = {
  name: "Real-World: File List Loading",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400 }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Skeleton variant="rectangular" width={40} height={40} borderRadius={8} />
          <div style={{ flex: 1 }}>
            <Skeleton variant="text" width={`${60 + i * 5}%`} />
            <div style={{ height: 4 }} />
            <Skeleton variant="text" width="40%" />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 300 }}>
      <Skeleton variant="text" />
      <Skeleton variant="text" width="70%" />
      <Skeleton variant="rectangular" height={100} />
      <Skeleton variant="circular" width={48} height={48} />
    </div>
  ),
  globals: { theme: "dark" },
};
