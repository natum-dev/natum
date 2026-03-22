import type { Meta, StoryObj } from "@storybook/react";
import { Divider } from "./Divider";
import { Typography } from "../Typography";
import { Card } from "../Card";
import { Button } from "../Button";

const meta: Meta<typeof Divider> = {
  title: "Components/Divider",
  component: Divider,
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    variant: {
      control: "select",
      options: ["solid", "dashed", "dotted"],
    },
    spacing: {
      control: "select",
      options: ["none", "sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Divider>;

const variants = ["solid", "dashed", "dotted"] as const;
const spacings = ["none", "sm", "md", "lg"] as const;

const headingStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "var(--typography-primary)",
  margin: "16px 0 8px",
  textTransform: "uppercase",
  letterSpacing: 1,
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--typography-secondary)",
  fontFamily: "monospace",
  marginBlockEnd: 4,
};

// --- 1. Default ---
export const Default: Story = {};

// --- 2. Variants ---
export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 480 }}>
      <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>Variants</h3>
      {variants.map((variant) => (
        <div key={variant}>
          <p style={labelStyle}>{variant}</p>
          <Divider variant={variant} spacing="none" />
        </div>
      ))}
    </div>
  ),
};

// --- 3. Spacing ---
export const Spacing: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>Spacing</h3>
      {spacings.map((spacing) => (
        <div key={spacing}>
          <Typography variant="body2" color="secondary">
            Content above — spacing: {spacing}
          </Typography>
          <Divider spacing={spacing} />
          <Typography variant="body2" color="secondary">
            Content below
          </Typography>
          {spacing !== "lg" && <div style={{ marginBlockEnd: 24 }} />}
        </div>
      ))}
    </div>
  ),
};

// --- 4. Vertical ---
export const Vertical: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>Vertical</h3>
      <div style={{ display: "flex", alignItems: "center", height: 48 }}>
        <Typography variant="body1">Section A</Typography>
        <Divider orientation="vertical" />
        <Typography variant="body1">Section B</Typography>
        <Divider orientation="vertical" />
        <Typography variant="body1">Section C</Typography>
      </div>
    </div>
  ),
};

// --- 5. Vertical Variants ---
export const VerticalVariants: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>Vertical Variants</h3>
      <div style={{ display: "flex", alignItems: "center", height: 48 }}>
        {variants.map((variant, i) => (
          <div key={variant} style={{ display: "contents" }}>
            {i > 0 && <Divider orientation="vertical" variant={variant} spacing="md" />}
            <Typography variant="body2" color="secondary">
              {variant}
            </Typography>
          </div>
        ))}
      </div>
    </div>
  ),
};

// --- 6. Dark Mode ---
export const DarkMode: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <Typography variant="body1">Content above</Typography>
      <Divider />
      <Typography variant="body2" color="secondary">
        Toggle the theme in the Storybook toolbar. The divider color adapts automatically
        via the --border-color-subtle token — no dark mode overrides needed.
      </Typography>
    </div>
  ),
};

// --- 7. RTL ---
export const RTL: Story = {
  render: () => (
    <div dir="rtl" style={{ maxWidth: 480 }}>
      <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>RTL Layout</h3>
      <Typography variant="body1">محتوى فوق الفاصل</Typography>
      <Divider />
      <Typography variant="body1">محتوى تحت الفاصل</Typography>
      <div style={{ marginBlockStart: 24 }}>
        <Typography variant="body2" color="secondary" tag="p" style={{ margin: "0 0 8px" }}>
          فاصل عمودي:
        </Typography>
        <div style={{ display: "flex", alignItems: "center", height: 40 }}>
          <Typography variant="body1">القسم أ</Typography>
          <Divider orientation="vertical" />
          <Typography variant="body1">القسم ب</Typography>
        </div>
      </div>
    </div>
  ),
};

// --- 8. Real-World: Card Sections ---
export const CardSections: Story = {
  name: "Real-World: Card Sections",
  render: () => (
    <div style={{ maxWidth: 400 }}>
      <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>Card Sections</h3>
      <Card>
        <Typography variant="h5" tag="p" style={{ margin: 0 }}>
          Order Summary
        </Typography>
        <Typography variant="body2" color="secondary" tag="p" style={{ margin: "4px 0 0" }}>
          3 items in your cart
        </Typography>
        <Divider spacing="md" />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body1">Subtotal</Typography>
          <Typography variant="body1">$42.00</Typography>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBlockStart: 4 }}>
          <Typography variant="body2" color="secondary">Shipping</Typography>
          <Typography variant="body2" color="secondary">$5.99</Typography>
        </div>
        <Divider spacing="md" variant="dashed" />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" tag="p" style={{ margin: 0 }}>Total</Typography>
          <Typography variant="h6" tag="p" style={{ margin: 0 }}>$47.99</Typography>
        </div>
      </Card>
    </div>
  ),
};

// --- 9. Real-World: Sidebar Navigation ---
export const SidebarNavigation: Story = {
  name: "Real-World: Sidebar Navigation",
  render: () => {
    const linkStyle: React.CSSProperties = {
      display: "block",
      padding: "8px 12px",
      borderRadius: 6,
      color: "var(--typography-primary)",
      textDecoration: "none",
      fontSize: 14,
    };

    return (
      <div style={{ width: 220, padding: 12, backgroundColor: "var(--bg-elevated)", borderRadius: 12 }}>
        <h3 style={{ ...headingStyle, margin: "0 0 8px", paddingInlineStart: 12 }}>Navigation</h3>
        <nav>
          <a href="#" style={linkStyle}>Dashboard</a>
          <a href="#" style={linkStyle}>Analytics</a>
          <a href="#" style={linkStyle}>Reports</a>
          <Divider spacing="sm" />
          <a href="#" style={linkStyle}>Settings</a>
          <a href="#" style={linkStyle}>Integrations</a>
          <Divider spacing="sm" />
          <a href="#" style={linkStyle}>Help & Support</a>
          <a href="#" style={linkStyle}>Sign Out</a>
        </nav>
      </div>
    );
  },
};

// --- 10. Real-World: Form Sections ---
export const FormSections: Story = {
  name: "Real-World: Form Sections",
  render: () => {
    const fieldStyle: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      gap: 4,
    };
    const inputStyle: React.CSSProperties = {
      padding: "8px 12px",
      borderRadius: 8,
      border: "1px solid var(--border-color-subtle)",
      background: "var(--bg-elevated)",
      color: "var(--typography-primary)",
      fontSize: 14,
    };

    return (
      <div style={{ maxWidth: 400 }}>
        <h3 style={{ ...headingStyle, margin: "0 0 16px" }}>Account Settings</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Typography variant="h6" tag="p" style={{ margin: 0 }}>Profile</Typography>
          <div style={fieldStyle}>
            <label style={{ fontSize: 13, color: "var(--typography-secondary)" }}>Display Name</label>
            <input style={inputStyle} defaultValue="Jonathan" />
          </div>
          <div style={fieldStyle}>
            <label style={{ fontSize: 13, color: "var(--typography-secondary)" }}>Email</label>
            <input style={inputStyle} defaultValue="jon@example.com" />
          </div>

          <Divider spacing="md" />

          <Typography variant="h6" tag="p" style={{ margin: 0 }}>Security</Typography>
          <div style={fieldStyle}>
            <label style={{ fontSize: 13, color: "var(--typography-secondary)" }}>Current Password</label>
            <input type="password" style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={{ fontSize: 13, color: "var(--typography-secondary)" }}>New Password</label>
            <input type="password" style={inputStyle} />
          </div>

          <Divider spacing="md" />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button variant="text">Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </div>
      </div>
    );
  },
};

// --- 11. Real-World: Inline Actions ---
export const InlineActions: Story = {
  name: "Real-World: Inline Actions",
  render: () => (
    <div>
      <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>Inline Actions</h3>
      <div style={{ display: "flex", alignItems: "center", height: 36 }}>
        <Button variant="text">Edit</Button>
        <Divider orientation="vertical" spacing="sm" />
        <Button variant="text">Duplicate</Button>
        <Divider orientation="vertical" spacing="sm" />
        <Button variant="text">Delete</Button>
      </div>
    </div>
  ),
};
