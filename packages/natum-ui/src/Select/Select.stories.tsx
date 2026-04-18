"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { IconSearch } from "@natum/icons";
import { Select } from "./Select";
import { SelectItem } from "./SelectItem";
import { SelectGroup } from "./SelectGroup";
import { Button } from "../Button";
import { Stack } from "../Stack";
import { TextField } from "../TextField";
import { Typography } from "../Typography";

const meta: Meta<typeof Select> = {
  title: "Forms/Select",
  component: Select,
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
type Story = StoryObj<typeof Select>;

const Fruits = () => (
  <>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
    <SelectItem value="cherry">Cherry</SelectItem>
    <SelectItem value="date">Date</SelectItem>
  </>
);

export const Default: Story = {
  args: { label: "Fruit", placeholder: "Pick one" },
  render: (args) => <Select {...args}><Fruits /></Select>,
};

export const Sizes: Story = {
  render: () => (
    <Stack gap={3} style={{ maxWidth: 360 }}>
      <Select label="Small" size="sm" placeholder="Pick one"><Fruits /></Select>
      <Select label="Medium" size="md" placeholder="Pick one"><Fruits /></Select>
      <Select label="Large" size="lg" placeholder="Pick one"><Fruits /></Select>
    </Stack>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack direction="row" gap={3} style={{ maxWidth: 720 }}>
      <Select label="Outlined" variant="outlined" placeholder="Pick one"><Fruits /></Select>
      <Select label="Filled" variant="filled" placeholder="Pick one"><Fruits /></Select>
    </Stack>
  ),
};

export const WithHelperText: Story = {
  args: {
    label: "Fruit",
    placeholder: "Pick one",
    helperText: "Used for your weekly basket.",
  },
  render: (args) => <Select {...args}><Fruits /></Select>,
};

export const ErrorState: Story = {
  args: {
    label: "Fruit",
    placeholder: "Pick one",
    errorMessage: "Please select a fruit.",
  },
  render: (args) => <Select {...args}><Fruits /></Select>,
};

export const Required: Story = {
  args: { label: "Fruit", placeholder: "Pick one", required: true },
  render: (args) => <Select {...args}><Fruits /></Select>,
};

export const Disabled: Story = {
  args: { label: "Fruit", placeholder: "Pick one", disabled: true, defaultValue: "banana" },
  render: (args) => <Select {...args}><Fruits /></Select>,
};

export const ReadOnly: Story = {
  args: { label: "Fruit", placeholder: "Pick one", readOnly: true, defaultValue: "banana" },
  render: (args) => <Select {...args}><Fruits /></Select>,
};

export const Clearable: Story = {
  args: {
    label: "Fruit",
    placeholder: "Pick one",
    clearable: true,
    defaultValue: "banana",
  },
  render: (args) => <Select {...args}><Fruits /></Select>,
};

export const WithLeftSection: Story = {
  args: {
    label: "Search fruit",
    placeholder: "Type to search",
    leftSection: <IconSearch size="sm" color="currentColor" />,
  },
  render: (args) => <Select {...args}><Fruits /></Select>,
};

export const PlacementTop: Story = {
  args: { label: "Fruit", placeholder: "Pick one", placement: "top" },
  render: (args) => (
    <div style={{ paddingTop: 240 }}>
      <Select {...args}><Fruits /></Select>
    </div>
  ),
};

export const MaxListboxHeightScroll: Story = {
  args: { label: "Fruit", placeholder: "Pick one", maxListboxHeight: 120 },
  render: (args) => (
    <Select {...args}>
      {Array.from({ length: 20 }, (_, i) => (
        <SelectItem key={i} value={`v${i}`}>Option {i + 1}</SelectItem>
      ))}
    </Select>
  ),
};

export const Multi: Story = {
  args: {
    label: "Tags",
    placeholder: "Pick a few",
    multiple: true,
    clearable: true,
  },
  render: (args) => <Select {...args}><Fruits /></Select>,
};

const MultiRenderValueDemo = () => {
  const [values, setValues] = useState<string[]>(["apple", "banana"]);
  return (
    <Select
      label="Tags"
      placeholder="Pick a few"
      multiple
      value={values}
      onChange={setValues}
      renderValue={(v) =>
        v.length === 0
          ? ""
          : v.length === 1
            ? v[0]
            : `${v[0]} + ${v.length - 1} more`
      }
    >
      <Fruits />
    </Select>
  );
};
export const MultiRenderValue: Story = { render: () => <MultiRenderValueDemo /> };

export const Grouped: Story = {
  render: () => (
    <Select label="Pick" placeholder="…">
      <SelectGroup label="Fruit">
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="cherry">Cherry</SelectItem>
      </SelectGroup>
      <SelectGroup label="Vegetable">
        <SelectItem value="carrot">Carrot</SelectItem>
        <SelectItem value="potato">Potato</SelectItem>
        <SelectItem value="spinach">Spinach</SelectItem>
      </SelectGroup>
    </Select>
  ),
};

export const RichContent: Story = {
  render: () => (
    <Select label="Plan" placeholder="Pick a plan" defaultValue="pro">
      <SelectItem
        value="free"
        textValue="Free $0/mo"
      >
        <Stack gap={1}>
          <Typography variant="body2" style={{ fontWeight: 600 }}>
            Free — $0/mo
          </Typography>
          <Typography variant="caption" color="secondary">
            Up to 3 projects.
          </Typography>
        </Stack>
      </SelectItem>
      <SelectItem
        value="pro"
        textValue="Pro $10/mo"
      >
        <Stack gap={1}>
          <Typography variant="body2" style={{ fontWeight: 600 }}>
            Pro — $10/mo
          </Typography>
          <Typography variant="caption" color="secondary">
            Unlimited projects.
          </Typography>
        </Stack>
      </SelectItem>
      <SelectItem
        value="team"
        textValue="Team $30/mo"
      >
        <Stack gap={1}>
          <Typography variant="body2" style={{ fontWeight: 600 }}>
            Team — $30/mo
          </Typography>
          <Typography variant="caption" color="secondary">
            Everything in Pro + admin tools.
          </Typography>
        </Stack>
      </SelectItem>
    </Select>
  ),
};

const ControlledDemo = () => {
  const [value, setValue] = useState<string | undefined>("apple");
  return (
    <Stack gap={3} style={{ maxWidth: 360 }}>
      <Typography variant="body2">Current: {value ?? "(none)"}</Typography>
      <Select
        label="Fruit"
        placeholder="Pick one"
        value={value}
        onChange={setValue}
      >
        <Fruits />
      </Select>
    </Stack>
  );
};
export const Controlled: Story = { render: () => <ControlledDemo /> };

export const Uncontrolled: Story = {
  args: {
    label: "Fruit",
    placeholder: "Pick one",
    defaultValue: "banana",
  },
  render: (args) => <Select {...args}><Fruits /></Select>,
};

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
          <Select label="Fruit" name="fruit" placeholder="Pick one">
            <Fruits />
          </Select>
          <Button type="submit">Submit</Button>
        </Stack>
      </form>
    );
  },
};
