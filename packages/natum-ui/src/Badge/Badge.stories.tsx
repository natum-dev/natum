import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { IconCheck, IconFolder, IconEyeOff } from "@natum/icons";
import { Badge } from "./Badge";
import type {
  BadgeColor,
  BadgeVariant,
  BadgeSize,
} from "./Badge";

const ALL_COLORS: BadgeColor[] = [
  "neutral",
  "primary",
  "secondary",
  "success",
  "warning",
  "error",
  "info",
];
const ALL_VARIANTS: BadgeVariant[] = ["filled", "outlined", "soft"];

const meta: Meta<typeof Badge> = {
  title: "Display/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    color: { control: "inline-radio", options: ALL_COLORS },
    variant: { control: "inline-radio", options: ALL_VARIANTS },
    size: {
      control: "inline-radio",
      options: ["sm", "md"] satisfies BadgeSize[],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: "Badge",
    color: "primary",
    variant: "soft",
    size: "md",
  },
};

export const ColorMatrix: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      {ALL_VARIANTS.map((variant) => (
        <div key={variant}>
          <div
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              opacity: 0.6,
              marginBottom: 6,
            }}
          >
            {variant}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {ALL_COLORS.map((color) => (
              <Badge key={color} color={color} variant={variant}>
                {color}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Badge size="sm" color="primary">sm</Badge>
      <Badge size="md" color="primary">md</Badge>
    </div>
  ),
};

export const Dot: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      {ALL_COLORS.map((color) => (
        <Badge key={color} dot color={color} aria-label={`${color} indicator`} />
      ))}
    </div>
  ),
};

export const WithLeftSection: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Badge color="success" leftSection={<IconCheck />}>Verified</Badge>
      <Badge color="primary" leftSection={<IconFolder />}>3 shared</Badge>
      <Badge color="warning" leftSection={<IconEyeOff />} variant="outlined">
        Read-only
      </Badge>
    </div>
  ),
};

export const AsLink: Story = {
  render: () => (
    <Badge as="a" href="#" color="primary">
      View all
    </Badge>
  ),
};

export const AsButton: Story = {
  render: () => {
    const [active, setActive] = useState(false);
    return (
      <Badge
        as="button"
        color={active ? "primary" : "neutral"}
        variant={active ? "filled" : "soft"}
        onClick={() => setActive((a) => !a)}
      >
        {active ? "Filter: ON" : "Filter: OFF"}
      </Badge>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <Badge as="button" disabled color="primary">
        Disabled button
      </Badge>
      <Badge as="a" href="#" disabled color="primary">
        Disabled link
      </Badge>
    </div>
  ),
};
