import type { Meta, StoryObj } from "@storybook/react";
import { ThemeProvider } from "./ThemeProvider";
import { ThemeScript } from "./ThemeScript";
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
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  const buttonStyle: React.CSSProperties = {
    padding: "6px 12px",
    borderRadius: 6,
    border: "1px solid var(--border-color)",
    background: "var(--neutral-bg-elevated)",
    color: "var(--neutral-text)",
    cursor: "pointer",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card variant="elevated">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
            gap: 12,
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--neutral-text)" }}>
            theme: {theme} / resolved: {resolvedTheme ?? "null"}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={buttonStyle} onClick={() => setTheme("light")}>
              Light
            </button>
            <button style={buttonStyle} onClick={() => setTheme("dark")}>
              Dark
            </button>
            <button style={buttonStyle} onClick={() => setTheme("system")}>
              System
            </button>
            <button style={buttonStyle} onClick={toggleTheme}>
              Toggle
            </button>
          </div>
        </div>
        <p style={{ margin: 0, color: "var(--neutral-text-secondary)" }}>
          This card uses theme tokens and adapts to the current resolved theme.
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

export const WithThemeScript: Story = {
  render: () => (
    <>
      <ThemeScript />
      <ThemeDemo />
    </>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "In a real app, `<ThemeScript />` renders inside `<head>` to prevent FOUC on first paint. Here it's rendered in the story body to demonstrate the component exists; visually it's inert.",
      },
    },
  },
};
