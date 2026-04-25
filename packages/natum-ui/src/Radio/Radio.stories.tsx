import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Radio } from "./Radio";
import { Stack } from "../Stack";
import { Typography } from "../Typography";

const meta: Meta<typeof Radio> = {
  title: "Forms/Radio",
  component: Radio,
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
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
    disabled: { control: "boolean" },
    defaultChecked: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Radio>;

export const Default: Story = {
  args: { name: "demo", value: "a", label: "Option A" },
};

export const SizeColorMatrix: Story = {
  render: () => (
    <Stack gap={4}>
      {(
        ["primary", "secondary", "error", "success", "warning", "info", "neutral"] as const
      ).map((c) => (
        <Stack key={c} direction="row" align="center" gap={4}>
          <Typography variant="caption" style={{ inlineSize: 100 }}>
            {c}
          </Typography>
          <Stack direction="row" align="center" gap={3}>
            <Radio name={`size-${c}-sm`} value="a" size="sm" color={c} defaultChecked label="sm" />
            <Radio name={`size-${c}-md`} value="a" size="md" color={c} defaultChecked label="md" />
            <Radio name={`size-${c}-lg`} value="a" size="lg" color={c} defaultChecked label="lg" />
          </Stack>
        </Stack>
      ))}
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Stack gap={3}>
      <Radio name="states-a" value="a" label="Unchecked" />
      <Radio name="states-b" value="a" label="Checked" defaultChecked />
      <Radio name="states-c" value="a" label="Disabled" disabled />
      <Radio name="states-d" value="a" label="Checked + Disabled" defaultChecked disabled />
    </Stack>
  ),
};

export const ReactNodeLabel: Story = {
  render: () => (
    <Radio
      name="rich"
      value="pro"
      label={
        <Stack gap={1}>
          <Typography variant="body2" style={{ fontWeight: 600 }}>
            Pro — $10/mo
          </Typography>
          <Typography variant="caption" color="secondary">
            Unlimited uploads, priority support.
          </Typography>
        </Stack>
      }
    />
  ),
};

const StandaloneControlledDemo = () => {
  const [value, setValue] = useState<string | null>("a");
  return (
    <Stack gap={3}>
      <Typography variant="body2">Current: {value ?? "(none)"}</Typography>
      <Stack gap={2}>
        <Radio
          name="standalone"
          value="a"
          label="Alpha"
          checked={value === "a"}
          onChange={(e) => setValue(e.target.value)}
        />
        <Radio
          name="standalone"
          value="b"
          label="Beta"
          checked={value === "b"}
          onChange={(e) => setValue(e.target.value)}
        />
      </Stack>
    </Stack>
  );
};

export const StandaloneControlled: Story = {
  render: () => <StandaloneControlledDemo />,
};
