import type { Meta, StoryObj } from "@storybook/react";
import { ThemeProvider } from "./ThemeProvider";
import { useTheme } from "./useTheme";
import { Card } from "../Card";
import { IconCheckCircle, IconInfo, IconStar } from "@natum/icons";

const meta: Meta<typeof ThemeProvider> = {
  title: "Components/ThemeProvider",
  component: ThemeProvider,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof ThemeProvider>;

const ThemeDemo = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card variant="elevated">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontWeight: 600, color: "var(--neutral-text)" }}>
            Current theme: {theme}
          </span>
          <button
            onClick={toggleTheme}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid var(--border-color)",
              background: "var(--neutral-bg-elevated)",
              color: "var(--neutral-text)",
              cursor: "pointer",
            }}
          >
            Toggle Theme
          </button>
        </div>
        <p style={{ margin: 0, color: "var(--neutral-text-secondary)" }}>
          This card uses theme tokens and automatically adapts to the current theme.
        </p>
      </Card>

      <div style={{ display: "flex", gap: 12 }}>
        <Card variant="elevated">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IconCheckCircle size="md" color="green" />
            <span style={{ color: "var(--neutral-text)" }}>Elevated</span>
          </div>
        </Card>
        <Card variant="outlined">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IconInfo size="md" color="blue" />
            <span style={{ color: "var(--neutral-text)" }}>Outlined</span>
          </div>
        </Card>
        <Card variant="filled">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IconStar size="md" color="gold" />
            <span style={{ color: "var(--neutral-text)" }}>Filled</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export const Default: Story = {
  render: () => <ThemeDemo />,
};
