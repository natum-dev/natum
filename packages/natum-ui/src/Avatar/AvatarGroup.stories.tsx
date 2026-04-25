import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "./Avatar";
import { AvatarGroup } from "./AvatarGroup";

const meta: Meta<typeof AvatarGroup> = {
  title: "Data/AvatarGroup",
  component: AvatarGroup,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg", "xl"] },
    shape: { control: "radio", options: ["circle", "square"] },
    spacing: { control: "radio", options: ["tight", "normal"] },
  },
};

export default meta;
type Story = StoryObj<typeof AvatarGroup>;

const sampleNames = ["Alice", "Bob", "Charlie", "Dana", "Eve"];

export const Default: Story = {
  render: (args) => (
    <AvatarGroup max={3} {...args}>
      {sampleNames.map((n) => (
        <Avatar key={n} name={n} />
      ))}
    </AvatarGroup>
  ),
};

export const WithTotal: Story = {
  render: () => (
    <AvatarGroup max={3} total={12}>
      {sampleNames.slice(0, 3).map((n) => (
        <Avatar key={n} name={n} />
      ))}
    </AvatarGroup>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {(["sm", "md", "lg", "xl"] as const).map((s) => (
        <AvatarGroup key={s} size={s} max={3}>
          {sampleNames.map((n) => (
            <Avatar key={n} name={n} />
          ))}
        </AvatarGroup>
      ))}
    </div>
  ),
};

export const TightSpacing: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <AvatarGroup spacing="normal" max={3}>
        {sampleNames.map((n) => (
          <Avatar key={n} name={n} />
        ))}
      </AvatarGroup>
      <AvatarGroup spacing="tight" max={3}>
        {sampleNames.map((n) => (
          <Avatar key={n} name={n} />
        ))}
      </AvatarGroup>
    </div>
  ),
};
