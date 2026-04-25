import type { Meta, StoryObj } from "@storybook/react";
import { PermissionBadge } from "./PermissionBadge";
import type { PermissionLevel } from "./PermissionBadge";

const ALL_LEVELS: PermissionLevel[] = ["owner", "editor", "viewer"];

const meta: Meta<typeof PermissionBadge> = {
  title: "Display/PermissionBadge",
  component: PermissionBadge,
  tags: ["autodocs"],
  argTypes: {
    level: { control: "inline-radio", options: ALL_LEVELS },
    size: { control: "inline-radio", options: ["sm", "md"] },
  },
};

export default meta;
type Story = StoryObj<typeof PermissionBadge>;

export const Default: Story = {
  args: {
    level: "owner",
  },
};

export const AllLevels: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {ALL_LEVELS.map((level) => (
        <PermissionBadge key={level} level={level} />
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 11, opacity: 0.6 }}>sm:</span>
        {ALL_LEVELS.map((level) => (
          <PermissionBadge key={level} level={level} size="sm" />
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 11, opacity: 0.6 }}>md:</span>
        {ALL_LEVELS.map((level) => (
          <PermissionBadge key={level} level={level} size="md" />
        ))}
      </div>
    </div>
  ),
};
