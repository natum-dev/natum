import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  IconCheck,
  IconChevronRight,
  IconDownload,
  IconPlus,
  IconTrash,
} from "@natum/icons";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: ["filled", "soft", "text"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    color: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "error",
        "success",
        "warning",
        "info",
        "neutral",
      ],
    },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    fullWidth: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

const variants = ["filled", "soft", "text"] as const;
const sizes = ["sm", "md", "lg"] as const;
const colors = [
  "primary",
  "secondary",
  "error",
  "success",
  "warning",
  "info",
  "neutral",
] as const;

const rowStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  flexWrap: "wrap",
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

export const Variants: Story = {
  render: () => (
    <div style={rowStyle}>
      {variants.map((variant) => (
        <Button key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {variants.map((variant) => (
        <div key={variant}>
          <h3 style={headingStyle}>{variant}</h3>
          <div style={rowStyle}>
            {sizes.map((size) => (
              <Button key={size} variant={variant} size={size}>
                Size {size}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {variants.map((variant) => (
        <div key={variant}>
          <h3 style={headingStyle}>{variant}</h3>
          <div style={rowStyle}>
            {colors.map((color) => (
              <Button key={color} variant={variant} color={color}>
                {color}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h3 style={headingStyle}>Loading state per variant</h3>
        <div style={rowStyle}>
          {variants.map((variant) => (
            <Button key={variant} variant={variant} loading>
              Saving…
            </Button>
          ))}
        </div>
      </div>
      <div>
        <h3 style={headingStyle}>Toggle loading on click</h3>
        <LoadingDemo />
      </div>
    </div>
  ),
};

const LoadingDemo = () => {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      loading={busy}
      onClick={() => {
        setBusy(true);
        window.setTimeout(() => setBusy(false), 1500);
      }}
    >
      Save changes
    </Button>
  );
};

export const Slots: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h3 style={headingStyle}>leftSection</h3>
        <div style={rowStyle}>
          <Button leftSection={<IconPlus size="sm" color="currentColor" />}>
            New file
          </Button>
          <Button
            variant="soft"
            leftSection={<IconDownload size="sm" color="currentColor" />}
          >
            Download
          </Button>
        </div>
      </div>
      <div>
        <h3 style={headingStyle}>rightSection</h3>
        <div style={rowStyle}>
          <Button
            variant="text"
            rightSection={<IconChevronRight size="sm" color="currentColor" />}
          >
            Continue
          </Button>
          <Button
            variant="filled"
            color="success"
            rightSection={<IconCheck size="sm" color="currentColor" />}
          >
            Done
          </Button>
        </div>
      </div>
      <div>
        <h3 style={headingStyle}>Both slots</h3>
        <div style={rowStyle}>
          <Button
            leftSection={<IconDownload size="sm" color="currentColor" />}
            rightSection={<IconChevronRight size="sm" color="currentColor" />}
          >
            Download and continue
          </Button>
        </div>
      </div>
    </div>
  ),
};

/**
 * The Two-Signals rule (DESIGN_PHILOSOPHY.md → State Communication) requires
 * destructive states to communicate through Color + Icon + Text. The canonical
 * Delete confirmation: red filled button + trash icon + explicit verb.
 */
export const DestructiveConfirm: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h3 style={headingStyle}>Two-Signals destructive (filled)</h3>
        <div style={rowStyle}>
          <Button variant="text">Cancel</Button>
          <Button
            variant="filled"
            color="error"
            leftSection={<IconTrash size="sm" color="currentColor" />}
          >
            Delete file
          </Button>
        </div>
      </div>
      <div>
        <h3 style={headingStyle}>Soft and text destructive</h3>
        <div style={rowStyle}>
          <Button
            variant="soft"
            color="error"
            leftSection={<IconTrash size="sm" color="currentColor" />}
          >
            Delete file
          </Button>
          <Button
            variant="text"
            color="error"
            leftSection={<IconTrash size="sm" color="currentColor" />}
          >
            Delete file
          </Button>
        </div>
      </div>
    </div>
  ),
};

export const Showcase: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
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
