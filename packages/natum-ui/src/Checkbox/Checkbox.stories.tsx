import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    color: {
      control: "select",
      options: ["primary", "secondary", "error", "success", "warning", "info", "neutral"],
    },
    disabled: { control: "boolean" },
    indeterminate: { control: "boolean" },
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: { label: "Accept terms and conditions" },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Checkbox size="sm" label="Small checkbox" />
      <Checkbox size="md" label="Medium checkbox (default)" />
      <Checkbox size="lg" label="Large checkbox" />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {(["primary", "secondary", "error", "success", "warning", "info", "neutral"] as const).map((color) => (
        <Checkbox key={color} color={color} defaultChecked label={`${color.charAt(0).toUpperCase() + color.slice(1)} color`} />
      ))}
    </div>
  ),
};

export const Indeterminate: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Checkbox indeterminate label="Select all files" />
      <Checkbox indeterminate size="sm" label="Small indeterminate" />
      <Checkbox indeterminate size="lg" label="Large indeterminate" />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Checkbox disabled label="Disabled unchecked" />
      <Checkbox disabled defaultChecked label="Disabled checked" />
      <Checkbox disabled indeterminate label="Disabled indeterminate" />
    </div>
  ),
};

export const WithoutLabel: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16 }}>
      <Checkbox aria-label="Select row 1" />
      <Checkbox aria-label="Select row 2" defaultChecked />
      <Checkbox aria-label="Select all" indeterminate />
    </div>
  ),
};

export const RichLabel: Story = {
  render: () => (
    <Checkbox
      label={
        <>
          I agree to the{" "}
          <a href="#" onClick={(e) => e.stopPropagation()} style={{ color: "var(--neutral-text-link)" }}>
            terms of service
          </a>
        </>
      }
    />
  ),
};

export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} label={`Checked: ${checked}`} />
        <button
          onClick={() => setChecked((v) => !v)}
          style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid var(--border-color-subtle)", background: "var(--neutral-bg-elevated)", cursor: "pointer", alignSelf: "flex-start" }}
        >
          Toggle externally
        </button>
      </div>
    );
  },
};

export const RealWorldFileList: Story = {
  name: "Real-World: File Selection",
  render: () => {
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const files = ["report.pdf", "photo.jpg", "notes.md", "data.csv"];
    const allSelected = selected.size === files.length;
    const someSelected = selected.size > 0 && !allSelected;

    const toggleAll = () => {
      setSelected(allSelected ? new Set() : new Set(files));
    };

    const toggleFile = (file: string) => {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(file)) next.delete(file);
        else next.add(file);
        return next;
      });
    };

    return (
      <div style={{ border: "1px solid var(--border-color-subtle)", borderRadius: 8, overflow: "hidden", maxWidth: 360 }}>
        <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border-color-subtle)", background: "var(--neutral-bg-inset)" }}>
          <Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} label={`${selected.size} of ${files.length} selected`} size="sm" />
        </div>
        {files.map((file) => (
          <div key={file} style={{ padding: "8px 12px", borderBottom: "1px solid var(--border-color-subtle)", display: "flex", alignItems: "center" }}>
            <Checkbox checked={selected.has(file)} onChange={() => toggleFile(file)} label={file} size="sm" />
          </div>
        ))}
      </div>
    );
  },
};

export const DarkMode: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Checkbox label="Unchecked in dark" />
      <Checkbox defaultChecked label="Checked in dark" />
      <Checkbox indeterminate label="Indeterminate in dark" />
      <Checkbox disabled label="Disabled in dark" />
      <Checkbox disabled defaultChecked label="Disabled checked in dark" />
    </div>
  ),
  globals: { theme: "dark" },
};

export const RTL: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Checkbox label="اختر الكل" defaultChecked />
      <Checkbox label="تذكرني" />
      <Checkbox label="أوافق على الشروط" disabled />
    </div>
  ),
  globals: { direction: "rtl" },
};
