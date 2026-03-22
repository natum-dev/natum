import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";
import { Typography } from "../Typography";
import { Button } from "../Button";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  argTypes: {
    variant: {
      control: "select",
      options: ["elevated", "outlined", "filled"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    as: {
      control: "select",
      options: ["div", "article", "section", "a", "button"],
    },
    isInteractive: { control: "boolean" },
    isSelected: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

const variants = ["elevated", "outlined", "filled"] as const;
const sizes = ["sm", "md", "lg"] as const;

const headingStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "var(--typography-primary)",
  margin: "16px 0 8px",
  textTransform: "uppercase",
  letterSpacing: 1,
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  gap: 16,
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--typography-secondary)",
  fontFamily: "monospace",
  marginBlockEnd: 4,
};

// --- 1. Default ---
export const Default: Story = {
  args: {
    children: "A simple elevated card with default settings.",
  },
};

// --- 2. Variants ---
export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>Variants</h3>
      <div style={rowStyle}>
        {variants.map((variant) => (
          <div key={variant} style={{ width: 240 }}>
            <p style={labelStyle}>{variant}</p>
            <Card variant={variant}>
              <Typography variant="h6" tag="p">
                {variant.charAt(0).toUpperCase() + variant.slice(1)}
              </Typography>
              <Typography variant="body2" color="secondary">
                This card uses the {variant} variant.
              </Typography>
            </Card>
          </div>
        ))}
      </div>
    </div>
  ),
};

// --- 3. Sizes ---
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>Sizes</h3>
      <div style={rowStyle}>
        {sizes.map((size) => (
          <div key={size} style={{ width: 200 }}>
            <p style={labelStyle}>{size}</p>
            <Card size={size}>
              <Typography variant="h6" tag="p">
                Size: {size}
              </Typography>
              <Typography variant="body2" color="secondary">
                Card content with {size} padding.
              </Typography>
            </Card>
          </div>
        ))}
      </div>
    </div>
  ),
};

// --- 4. Interactive Card ---
export const InteractiveCard: Story = {
  render: function InteractiveCardStory() {
    const [clicks, setClicks] = useState(0);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 320 }}>
        <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>Interactive</h3>
        <Card isInteractive onClick={() => setClicks((c) => c + 1)}>
          <Typography variant="h6" tag="p">
            Click me
          </Typography>
          <Typography variant="body2" color="secondary">
            Clicked {clicks} time{clicks !== 1 ? "s" : ""}. Try hovering, focusing with Tab, and pressing Enter/Space.
          </Typography>
        </Card>
      </div>
    );
  },
};

// --- 5. Selectable Cards ---
export const SelectableCards: Story = {
  render: function SelectableCardsStory() {
    const files = ["report.pdf", "photo.jpg", "notes.md", "data.csv"];
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const toggle = (name: string) => {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(name)) next.delete(name);
        else next.add(name);
        return next;
      });
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>
          File Selection ({selected.size} selected)
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          {files.map((file) => (
            <Card
              key={file}
              isInteractive
              isSelected={selected.has(file)}
              onClick={() => toggle(file)}
              size="sm"
            >
              <Typography variant="body1">{file}</Typography>
              <Typography variant="caption" color="secondary">
                {selected.has(file) ? "Selected" : "Click to select"}
              </Typography>
            </Card>
          ))}
        </div>
      </div>
    );
  },
};

// --- 6. As Link ---
export const AsLink: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>Card as Link</h3>
      <Card as="a" href="https://example.com" isInteractive style={{ textDecoration: "none", display: "block" }}>
        <Typography variant="h6" tag="p">
          External Link
        </Typography>
        <Typography variant="body2" color="secondary">
          This entire card is an anchor element. Click to navigate.
        </Typography>
      </Card>
    </div>
  ),
};

// --- 7. As Button ---
export const AsButton: Story = {
  render: function AsButtonStory() {
    const [count, setCount] = useState(0);
    return (
      <div style={{ maxWidth: 320 }}>
        <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>Card as Button</h3>
        <Card
          as="button"
          isInteractive
          onClick={() => setCount((c) => c + 1)}
          style={{ textAlign: "start", width: "100%", font: "inherit" }}
        >
          <Typography variant="h6" tag="p">
            Button Card
          </Typography>
          <Typography variant="body2" color="secondary">
            Native button semantics. Pressed {count} time{count !== 1 ? "s" : ""}.
          </Typography>
        </Card>
      </div>
    );
  },
};

// --- 8. Disabled States ---
export const DisabledStates: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>Disabled</h3>
      <div style={rowStyle}>
        {variants.map((variant) => (
          <div key={variant} style={{ width: 220 }}>
            <p style={labelStyle}>{variant} (disabled)</p>
            <Card variant={variant} disabled>
              <Typography variant="h6" tag="p">
                Disabled
              </Typography>
              <Typography variant="body2">
                This card cannot be interacted with.
              </Typography>
            </Card>
          </div>
        ))}
      </div>
    </div>
  ),
};

// --- 9. Dark Mode ---
export const DarkMode: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Card>
        <Typography variant="h6" tag="p">
          Dark Mode
        </Typography>
        <Typography variant="body2" color="secondary">
          Toggle the theme in the Storybook toolbar to see dark mode styles. All Card variants
          adapt automatically via CSS custom properties.
        </Typography>
      </Card>
    </div>
  ),
};

// --- 10. Real-World: File Card ---
export const FileCard: Story = {
  name: "Real-World: File Card",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>Vault File Cards</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
        {[
          { name: "Q4 Report.pdf", size: "2.4 MB", date: "Mar 15, 2026" },
          { name: "Team Photo.jpg", size: "5.1 MB", date: "Mar 12, 2026" },
          { name: "Meeting Notes.md", size: "12 KB", date: "Mar 20, 2026" },
        ].map((file) => (
          <Card key={file.name} isInteractive variant="outlined" size="sm">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  backgroundColor: "var(--bg-inset)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: 18,
                }}
              >
                {file.name.endsWith(".pdf") ? "P" : file.name.endsWith(".jpg") ? "I" : "T"}
              </div>
              <div style={{ minWidth: 0 }}>
                <Typography variant="body1" tag="p" style={{ margin: 0 }}>
                  {file.name}
                </Typography>
                <Typography variant="caption" color="secondary" tag="p" style={{ margin: 0 }}>
                  {file.size} &middot; {file.date}
                </Typography>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  ),
};

// --- 11. Real-World: Stat Card ---
export const StatCard: Story = {
  name: "Real-World: Stat Card",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>Dashboard Stats</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
        {[
          { label: "Total Users", value: "12,847", trend: "+4.2%", up: true },
          { label: "Revenue", value: "$84.3K", trend: "+12.1%", up: true },
          { label: "Bounce Rate", value: "32.1%", trend: "-2.4%", up: false },
        ].map((stat) => (
          <Card key={stat.label} variant="elevated">
            <Typography variant="caption" color="secondary" tag="p" style={{ margin: 0 }}>
              {stat.label}
            </Typography>
            <Typography variant="h4" tag="p" style={{ margin: "8px 0 4px" }}>
              {stat.value}
            </Typography>
            <Typography
              variant="body2"
              color={stat.up ? "success" : "error"}
              tag="span"
            >
              {stat.trend}
            </Typography>
          </Card>
        ))}
      </div>
    </div>
  ),
};

// --- 12. Real-World: Auth Form Card ---
export const AuthFormCard: Story = {
  name: "Real-World: Auth Form Card",
  render: () => (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <Card size="lg" variant="elevated">
        <Typography variant="h4" tag="h2" style={{ marginBlockStart: 0 }}>
          Sign In
        </Typography>
        <Typography variant="body2" color="secondary" tag="p">
          Welcome back. Enter your credentials to continue.
        </Typography>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBlockStart: 24 }}>
          <div>
            <label
              htmlFor="email-input"
              style={{ display: "block", marginBlockEnd: 4, fontSize: 14, color: "var(--typography-primary)" }}
            >
              Email
            </label>
            <input
              id="email-input"
              type="email"
              placeholder="you@example.com"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid var(--border-color-subtle)",
                background: "var(--bg-elevated)",
                color: "var(--typography-primary)",
                fontSize: 14,
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label
              htmlFor="password-input"
              style={{ display: "block", marginBlockEnd: 4, fontSize: 14, color: "var(--typography-primary)" }}
            >
              Password
            </label>
            <input
              id="password-input"
              type="password"
              placeholder="Enter password"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid var(--border-color-subtle)",
                background: "var(--bg-elevated)",
                color: "var(--typography-primary)",
                fontSize: 14,
                boxSizing: "border-box",
              }}
            />
          </div>
          <Button fullWidth>Sign In</Button>
          <Button variant="text" fullWidth>
            Forgot password?
          </Button>
        </div>
      </Card>
    </div>
  ),
};

// --- 13. Real-World: Empty State ---
export const EmptyState: Story = {
  name: "Real-World: Empty State",
  render: () => (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <Card variant="outlined" size="lg">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 16,
            paddingBlock: 24,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: "var(--bg-inset)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              color: "var(--typography-secondary)",
            }}
          >
            ?
          </div>
          <div>
            <Typography variant="h5" tag="p" style={{ margin: "0 0 4px" }}>
              No files yet
            </Typography>
            <Typography variant="body2" color="secondary" tag="p" style={{ margin: 0 }}>
              Upload your first file to get started with Vault.
            </Typography>
          </div>
          <Button>Upload File</Button>
        </div>
      </Card>
    </div>
  ),
};
