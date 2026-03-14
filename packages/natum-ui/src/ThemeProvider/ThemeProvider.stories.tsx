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
      <Card variant="elevated" elevation="medium">
        <Card.Header>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 600, color: "var(--typography-primary)" }}>
              Current theme: {theme}
            </span>
            <button
              onClick={toggleTheme}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid var(--border-color)",
                background: "var(--bg-elevated)",
                color: "var(--typography-primary)",
                cursor: "pointer",
              }}
            >
              Toggle Theme
            </button>
          </div>
        </Card.Header>
        <Card.Body>
          <p style={{ margin: 0, color: "var(--typography-secondary)" }}>
            This card uses theme tokens and automatically adapts to the current theme.
          </p>
        </Card.Body>
      </Card>

      <div style={{ display: "flex", gap: 12 }}>
        <Card variant="elevated">
          <Card.Body>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <IconCheckCircle size="md" color="green" />
              <span style={{ color: "var(--typography-primary)" }}>Elevated</span>
            </div>
          </Card.Body>
        </Card>
        <Card variant="outlined">
          <Card.Body>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <IconInfo size="md" color="blue" />
              <span style={{ color: "var(--typography-primary)" }}>Outlined</span>
            </div>
          </Card.Body>
        </Card>
        <Card variant="filled">
          <Card.Body>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <IconStar size="md" color="orange" />
              <span style={{ color: "var(--typography-primary)" }}>Filled</span>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export const Default: Story = {
  render: () => <ThemeDemo />,
};
