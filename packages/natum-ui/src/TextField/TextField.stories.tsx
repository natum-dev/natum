"use client";

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TextField } from "./TextField";
import { Typography } from "../Typography";
import { Card } from "../Card";
import { Button } from "../Button";
import { Divider } from "../Divider";
import { IconSearch, IconEye, IconEyeOff } from "@natum/icons";

const meta: Meta<typeof TextField> = {
  title: "Components/TextField",
  component: TextField,
  argTypes: {
    variant: {
      control: "select",
      options: ["outlined", "filled"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    required: { control: "boolean" },
    clearable: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof TextField>;

const variants = ["outlined", "filled"] as const;
const sizes = ["sm", "md", "lg"] as const;

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

const rowStyle: React.CSSProperties = {
  display: "flex",
  gap: 16,
  alignItems: "flex-start",
  flexWrap: "wrap",
};

// --- 1. Default ---
export const Default: Story = {
  args: {
    label: "Email",
    placeholder: "you@example.com",
  },
};

// --- 2. Variants ---
export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 480 }}>
      <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>Variants</h3>
      <div style={rowStyle}>
        {variants.map((variant) => (
          <div key={variant} style={{ flex: 1, minWidth: 200 }}>
            <p style={labelStyle}>{variant}</p>
            <TextField variant={variant} label="Label" placeholder="Placeholder" />
          </div>
        ))}
      </div>
    </div>
  ),
};

// --- 3. Sizes ---
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 320 }}>
      <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>Sizes</h3>
      {sizes.map((size) => (
        <div key={size}>
          <p style={labelStyle}>{size}</p>
          <TextField size={size} label={`Size ${size}`} placeholder="Placeholder" />
        </div>
      ))}
    </div>
  ),
};

// --- 4. With Sections ---
export const WithSections: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 320 }}>
      <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>Sections</h3>
      <TextField
        label="Search"
        placeholder="Search..."
        leftSection={<IconSearch size="sm" color="currentColor" />}
      />
      <TextField
        label="Website"
        placeholder="example.com"
        leftSection={
          <span style={{ fontSize: 14, color: "var(--typography-secondary)" }}>https://</span>
        }
      />
      <TextField
        label="Price"
        placeholder="0.00"
        leftSection={
          <span style={{ fontSize: 14, color: "var(--typography-secondary)" }}>$</span>
        }
        rightSection={
          <span style={{ fontSize: 13, color: "var(--typography-secondary)" }}>USD</span>
        }
      />
    </div>
  ),
};

// --- 5. Clearable ---
export const Clearable: Story = {
  render: function ClearableStory() {
    const [value, setValue] = useState("Hello world");
    return (
      <div style={{ maxWidth: 320 }}>
        <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>Clearable</h3>
        <TextField
          label="Clearable Input"
          clearable
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onClear={() => setValue("")}
          helperText="Click the X to clear the value"
        />
      </div>
    );
  },
};

// --- 6. Error State ---
export const ErrorState: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 320 }}>
      <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>Error State</h3>
      <TextField
        label="Email"
        variant="outlined"
        value="notanemail"
        onChange={() => {}}
        errorMessage="Please enter a valid email address"
      />
      <TextField
        label="Password"
        variant="filled"
        type="password"
        errorMessage="Password must be at least 8 characters"
      />
    </div>
  ),
};

// --- 7. Helper Text ---
export const HelperText: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 320 }}>
      <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>Helper Text</h3>
      <TextField
        label="Username"
        placeholder="Enter username"
        helperText="Must be 3-20 characters, letters and numbers only"
      />
      <TextField
        label="Bio"
        placeholder="Tell us about yourself"
        helperText="Optional. Max 280 characters."
      />
    </div>
  ),
};

// --- 8. Required ---
export const Required: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>Required</h3>
      <TextField label="Full Name" required placeholder="Jane Doe" />
    </div>
  ),
};

// --- 9. Disabled ---
export const DisabledStates: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 480 }}>
      <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>Disabled</h3>
      <div style={rowStyle}>
        {variants.map((variant) => (
          <div key={variant} style={{ flex: 1, minWidth: 200 }}>
            <p style={labelStyle}>{variant}</p>
            <TextField variant={variant} label="Disabled" value="Cannot edit" disabled onChange={() => {}} />
          </div>
        ))}
      </div>
    </div>
  ),
};

// --- 10. ReadOnly ---
export const ReadOnly: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>Read Only</h3>
      <TextField
        label="API Key"
        value="sk-natum-abc123def456"
        readOnly
        onChange={() => {}}
        helperText="This value cannot be modified"
      />
    </div>
  ),
};

// --- 11. Dark Mode ---
export const DarkMode: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <TextField
        label="Dark Mode"
        placeholder="Toggle theme in toolbar"
        helperText="All TextField states adapt automatically via CSS custom properties."
      />
    </div>
  ),
};

// --- 12. RTL ---
export const RTL: Story = {
  render: () => (
    <div dir="rtl" style={{ maxWidth: 400 }}>
      <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>RTL Layout</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TextField
          label="البريد الإلكتروني"
          placeholder="أدخل بريدك الإلكتروني"
          leftSection={<span style={{ fontSize: 14 }}>@</span>}
          required
        />
        <TextField
          label="البحث"
          placeholder="ابحث هنا..."
          leftSection={<IconSearch size="sm" color="currentColor" />}
          clearable
          defaultValue="نتائج البحث"
        />
        <TextField
          label="كلمة المرور"
          type="password"
          errorMessage="كلمة المرور قصيرة جدا"
        />
      </div>
    </div>
  ),
};

// --- 13. Real-World: Login Form ---
export const LoginForm: Story = {
  name: "Real-World: Login Form",
  render: function LoginFormStory() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newErrors: typeof errors = {};
      if (!email.includes("@")) newErrors.email = "Please enter a valid email";
      if (password.length < 8) newErrors.password = "Must be at least 8 characters";
      setErrors(newErrors);
    };

    return (
      <div style={{ maxWidth: 400, margin: "0 auto" }}>
        <Card size="lg">
          <Typography variant="h4" tag="h2" style={{ marginBlockStart: 0 }}>
            Sign In
          </Typography>
          <Typography variant="body2" color="secondary" tag="p">
            Welcome back. Enter your credentials.
          </Typography>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 16, marginBlockStart: 24 }}
          >
            <TextField
              label="Email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              errorMessage={errors.email}
              clearable
              onClear={() => setEmail("")}
            />
            <TextField
              label="Password"
              type={showPw ? "text" : "password"}
              required
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              errorMessage={errors.password}
              rightSection={
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                    display: "flex",
                    color: "inherit",
                  }}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? (
                    <IconEyeOff size="sm" color="currentColor" />
                  ) : (
                    <IconEye size="sm" color="currentColor" />
                  )}
                </button>
              }
            />
            <Button fullWidth>Sign In</Button>
          </form>
        </Card>
      </div>
    );
  },
};

// --- 14. Real-World: Search Input ---
export const SearchInput: Story = {
  name: "Real-World: Search Input",
  render: function SearchInputStory() {
    const [query, setQuery] = useState("");
    return (
      <div style={{ maxWidth: 400 }}>
        <h3 style={{ ...headingStyle, margin: "0 0 8px" }}>Search</h3>
        <TextField
          placeholder="Search files, folders..."
          leftSection={<IconSearch size="sm" color="currentColor" />}
          clearable
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery("")}
          size="md"
          aria-label="Search"
        />
      </div>
    );
  },
};

// --- 15. Real-World: Payment Form ---
export const PaymentForm: Story = {
  name: "Real-World: Payment Form",
  render: () => (
    <div style={{ maxWidth: 400 }}>
      <h3 style={{ ...headingStyle, margin: "0 0 16px" }}>Payment Details</h3>
      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <TextField
            label="Amount"
            placeholder="0.00"
            type="number"
            leftSection={
              <span style={{ fontSize: 16, fontWeight: 500, color: "var(--typography-secondary)" }}>$</span>
            }
            rightSection={
              <span style={{ fontSize: 13, color: "var(--typography-secondary)" }}>USD</span>
            }
          />
          <TextField
            label="Card Number"
            placeholder="4242 4242 4242 4242"
            helperText="Visa, Mastercard, or Amex"
          />
          <div style={{ display: "flex", gap: 12 }}>
            <TextField label="Expiry" placeholder="MM/YY" />
            <TextField label="CVC" placeholder="123" />
          </div>
        </div>
      </Card>
    </div>
  ),
};

// --- 16. Real-World: Profile Form ---
export const ProfileForm: Story = {
  name: "Real-World: Profile Form",
  render: function ProfileFormStory() {
    const [displayName, setDisplayName] = useState("Jonathan");
    const [bio, setBio] = useState("");

    return (
      <div style={{ maxWidth: 480 }}>
        <h3 style={{ ...headingStyle, margin: "0 0 16px" }}>Edit Profile</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <TextField
            label="Display Name"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            clearable
            onClear={() => setDisplayName("")}
            helperText="This is how others see you"
            errorMessage={displayName.length === 0 ? "Display name is required" : undefined}
          />
          <TextField
            label="Email"
            type="email"
            value="jonathan@example.com"
            readOnly
            onChange={() => {}}
            helperText="Contact support to change your email"
          />
          <Divider spacing="md" />
          <TextField
            label="Bio"
            placeholder="Tell us about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            helperText={`${bio.length}/280 characters`}
            clearable
            onClear={() => setBio("")}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button variant="text">Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </div>
      </div>
    );
  },
};
