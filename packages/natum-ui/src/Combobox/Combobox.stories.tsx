"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { IconSearch } from "@natum/icons";
import { Combobox } from "./Combobox";
import { ComboboxItem } from "./ComboboxItem";
import { ComboboxGroup } from "./ComboboxGroup";
import { Button } from "../Button";
import { Stack } from "../Stack";
import { TextField } from "../TextField";
import { Typography } from "../Typography";

const meta: Meta<typeof Combobox> = {
  title: "Forms/Combobox",
  component: Combobox,
  argTypes: {
    variant: { control: "select", options: ["outlined", "filled"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    placement: { control: "select", options: ["bottom", "top"] },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    required: { control: "boolean" },
    clearable: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Combobox>;

const Countries = () => (
  <>
    <ComboboxItem value="au">Australia</ComboboxItem>
    <ComboboxItem value="br">Brazil</ComboboxItem>
    <ComboboxItem value="ca">Canada</ComboboxItem>
    <ComboboxItem value="de">Germany</ComboboxItem>
    <ComboboxItem value="in">India</ComboboxItem>
    <ComboboxItem value="jp">Japan</ComboboxItem>
    <ComboboxItem value="mx">Mexico</ComboboxItem>
    <ComboboxItem value="us">United States</ComboboxItem>
  </>
);

export const Default: Story = {
  args: { label: "Country", placeholder: "Pick one" },
  render: (args) => <Combobox {...args}><Countries /></Combobox>,
};

export const Sizes: Story = {
  render: () => (
    <Stack gap={3} style={{ maxWidth: 360 }}>
      <Combobox label="Small" size="sm" placeholder="Pick one"><Countries /></Combobox>
      <Combobox label="Medium" size="md" placeholder="Pick one"><Countries /></Combobox>
      <Combobox label="Large" size="lg" placeholder="Pick one"><Countries /></Combobox>
    </Stack>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack direction="row" gap={3} style={{ maxWidth: 720 }}>
      <Combobox label="Outlined" variant="outlined" placeholder="Pick one"><Countries /></Combobox>
      <Combobox label="Filled" variant="filled" placeholder="Pick one"><Countries /></Combobox>
    </Stack>
  ),
};

export const WithHelperText: Story = {
  args: {
    label: "Country",
    placeholder: "Pick one",
    helperText: "Type to filter.",
  },
  render: (args) => <Combobox {...args}><Countries /></Combobox>,
};

export const ErrorState: Story = {
  args: {
    label: "Country",
    placeholder: "Pick one",
    errorMessage: "Please select a country.",
  },
  render: (args) => <Combobox {...args}><Countries /></Combobox>,
};

export const Required: Story = {
  args: { label: "Country", placeholder: "Pick one", required: true },
  render: (args) => <Combobox {...args}><Countries /></Combobox>,
};

export const DisabledAndReadOnly: Story = {
  render: () => (
    <Stack direction="row" gap={3} style={{ maxWidth: 720 }}>
      <Combobox label="Disabled" disabled defaultValue="us"><Countries /></Combobox>
      <Combobox label="Read-only" readOnly defaultValue="us"><Countries /></Combobox>
    </Stack>
  ),
};

export const Clearable: Story = {
  args: {
    label: "Country",
    placeholder: "Pick one",
    clearable: true,
    defaultValue: "us",
  },
  render: (args) => <Combobox {...args}><Countries /></Combobox>,
};

export const WithLeftSection: Story = {
  args: {
    label: "Search country",
    placeholder: "Type to filter",
    leftSection: <IconSearch size="sm" color="currentColor" />,
  },
  render: (args) => <Combobox {...args}><Countries /></Combobox>,
};

export const PlacementTop: Story = {
  args: { label: "Country", placeholder: "Pick one", placement: "top" },
  render: (args) => (
    <div style={{ paddingTop: 240 }}>
      <Combobox {...args}><Countries /></Combobox>
    </div>
  ),
};

export const MaxListboxHeightScroll: Story = {
  args: { label: "Country", placeholder: "Pick one", maxListboxHeight: 120 },
  render: (args) => (
    <Combobox {...args}>
      {Array.from({ length: 20 }, (_, i) => (
        <ComboboxItem key={i} value={`v${i}`}>Option {i + 1}</ComboboxItem>
      ))}
    </Combobox>
  ),
};

export const Multi: Story = {
  args: {
    label: "Tags",
    placeholder: "Pick a few",
    multiple: true,
    clearable: true,
  },
  render: (args) => <Combobox {...args}><Countries /></Combobox>,
};

export const MultiPreSeeded: Story = {
  args: {
    label: "Tags",
    placeholder: "Pick a few",
    multiple: true,
    clearable: true,
    defaultValue: ["us", "ca"],
  },
  render: (args) => <Combobox {...args}><Countries /></Combobox>,
};

export const Grouped: Story = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <Combobox label="Food" placeholder="Type to filter">
        <ComboboxGroup label="Fruits">
          <ComboboxItem value="apple">Apple</ComboboxItem>
          <ComboboxItem value="banana">Banana</ComboboxItem>
          <ComboboxItem value="cherry">Cherry</ComboboxItem>
        </ComboboxGroup>
        <ComboboxGroup label="Vegetables">
          <ComboboxItem value="carrot">Carrot</ComboboxItem>
          <ComboboxItem value="potato">Potato</ComboboxItem>
          <ComboboxItem value="spinach">Spinach</ComboboxItem>
        </ComboboxGroup>
      </Combobox>
    </div>
  ),
};

export const RichContent: Story = {
  render: () => (
    <Combobox label="Plan" placeholder="Pick a plan" multiple clearable>
      <ComboboxItem value="free" textValue="Free 0">
        <Stack gap={1}>
          <Typography variant="body2" style={{ fontWeight: 600 }}>Free — $0/mo</Typography>
          <Typography variant="caption" color="secondary">Up to 3 projects.</Typography>
        </Stack>
      </ComboboxItem>
      <ComboboxItem value="pro" textValue="Pro 10">
        <Stack gap={1}>
          <Typography variant="body2" style={{ fontWeight: 600 }}>Pro — $10/mo</Typography>
          <Typography variant="caption" color="secondary">Unlimited projects.</Typography>
        </Stack>
      </ComboboxItem>
    </Combobox>
  ),
};

const ControlledDemo = () => {
  const [value, setValue] = useState<string | undefined>("us");
  const [q, setQ] = useState("");
  return (
    <Stack gap={3} style={{ maxWidth: 360 }}>
      <Typography variant="body2">Current: {value ?? "(none)"}</Typography>
      <Combobox
        label="Country"
        placeholder="Pick one"
        value={value}
        onChange={setValue}
        searchValue={q}
        onSearchChange={setQ}
      >
        <Countries />
      </Combobox>
    </Stack>
  );
};
export const Controlled: Story = { render: () => <ControlledDemo /> };

type AsyncItem = { value: string; label: string };
const FAKE_DATA: AsyncItem[] = [
  { value: "a", label: "Anna" },
  { value: "b", label: "Ben" },
  { value: "c", label: "Carlos" },
  { value: "d", label: "Diana" },
  { value: "e", label: "Elena" },
];

const AsyncDemo = () => {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<AsyncItem[]>(FAKE_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (q: string) => {
    setQuery(q);
    setError(null);
    if (q.length === 0) {
      setItems(FAKE_DATA);
      setLoading(false);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (q.toLowerCase().includes("fail")) {
        setError("Couldn't load results.");
        setItems([]);
      } else {
        const filtered = FAKE_DATA.filter((x) =>
          x.label.toLowerCase().includes(q.toLowerCase())
        );
        setItems(filtered);
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div style={{ maxWidth: 360 }}>
      <Combobox
        label="Async search"
        placeholder="Type 'e' or 'fail'"
        searchValue={query}
        onSearchChange={handleSearch}
        loading={loading}
        error={error ?? undefined}
        filter={() => true}
      >
        {items.map((it) => (
          <ComboboxItem key={it.value} value={it.value}>
            {it.label}
          </ComboboxItem>
        ))}
      </Combobox>
    </div>
  );
};
export const AsyncLoading: Story = { render: () => <AsyncDemo /> };

export const FormIntegration: Story = {
  render: () => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      alert(JSON.stringify(Object.fromEntries(fd.entries()), null, 2));
    };
    return (
      <form onSubmit={handleSubmit} style={{ maxWidth: 360 }}>
        <Stack gap={3}>
          <TextField label="Name" name="name" />
          <Combobox label="Country" name="country" placeholder="Pick one">
            <Countries />
          </Combobox>
          <Button type="submit">Submit</Button>
        </Stack>
      </form>
    );
  },
};
