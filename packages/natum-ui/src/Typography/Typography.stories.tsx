import type { Meta, StoryObj } from "@storybook/react";
import { Typography } from "./Typography";

const variants = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "body1", "body2", "body3", "caption", "code",
] as const;

const colors = [
  "primary", "secondary", "disabled", "link",
  "error", "info", "success", "warning",
] as const;

const headingStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "var(--neutral-text)",
  margin: "16px 0 8px",
  textTransform: "uppercase",
  letterSpacing: 1,
};

const labelStyle: React.CSSProperties = {
  width: 80,
  fontSize: 12,
  fontWeight: 600,
  color: "var(--neutral-text-secondary)",
  flexShrink: 0,
  fontFamily: "monospace",
};

const meta: Meta<typeof Typography> = {
  title: "Components/Typography",
  component: Typography,
  argTypes: {
    variant: {
      control: "select",
      options: [...variants],
    },
    color: {
      control: "select",
      options: [...colors],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const Default: Story = {
  args: {
    children: "The quick brown fox jumps over the lazy dog",
    variant: "body1",
  },
};

export const Showcase: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Variants */}
      <div>
        <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>Variants</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {variants.map((variant) => (
            <div key={variant} style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
              <span style={labelStyle}>{variant}</span>
              <Typography variant={variant}>
                The quick brown fox jumps over the lazy dog
              </Typography>
            </div>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h3 style={headingStyle}>Colors</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {colors.map((color) => (
            <div key={color} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={labelStyle}>{color}</span>
              <Typography variant="body1" color={color}>
                The quick brown fox jumps over the lazy dog
              </Typography>
            </div>
          ))}
        </div>
      </div>

      {/* Inverse (needs dark background) */}
      <div>
        <h3 style={headingStyle}>Inverse</h3>
        <div
          style={{
            backgroundColor: "var(--neutral-text)",
            padding: 16,
            borderRadius: 8,
          }}
        >
          <Typography variant="body1" color="inverse">
            Inverse text on dark background
          </Typography>
        </div>
      </div>
    </div>
  ),
};
