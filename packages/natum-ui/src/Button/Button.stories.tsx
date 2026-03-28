import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: ["filled", "soft", "text"],
    },
    disabled: { control: "boolean" },
    fullWidth: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

const variants = ["filled", "soft", "text"] as const;

const rowStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "center",
};

const headingStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "var(--neutral-text)",
  margin: "16px 0 8px",
  textTransform: "uppercase",
  letterSpacing: 1,
};

export const Default: Story = {
  args: {
    children: "Button",
  },
};

export const Showcase: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Variants */}
      <div>
        <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>Variants</h3>
        <div style={rowStyle}>
          {variants.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </div>
      </div>

      {/* Disabled */}
      <div>
        <h3 style={headingStyle}>Disabled</h3>
        <div style={rowStyle}>
          {variants.map((variant) => (
            <Button key={variant} variant={variant} disabled>
              {variant}
            </Button>
          ))}
        </div>
      </div>

      {/* Full Width */}
      <div>
        <h3 style={headingStyle}>Full Width</h3>
        <Button fullWidth>Full Width Filled</Button>
        <div style={{ marginTop: 8 }}>
          <Button fullWidth variant="soft">
            Full Width Soft
          </Button>
        </div>
      </div>
    </div>
  ),
};
