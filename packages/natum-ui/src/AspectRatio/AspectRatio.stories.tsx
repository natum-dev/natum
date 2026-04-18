import type { Meta, StoryObj } from "@storybook/react";
import { AspectRatio } from "./AspectRatio";
import { Stack } from "../Stack";
import { Typography } from "../Typography";

const meta: Meta<typeof AspectRatio> = {
  title: "Layout/AspectRatio",
  component: AspectRatio,
  argTypes: {
    ratio: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof AspectRatio>;

const demoFill: React.CSSProperties = {
  background:
    "linear-gradient(135deg, var(--primary-surface), var(--secondary-surface))",
  display: "grid",
  placeItems: "center",
  color: "var(--neutral-text)",
};

export const VideoEmbed: Story = {
  args: { ratio: 16 / 9 },
  render: (args) => (
    <div style={{ maxWidth: 640 }}>
      <AspectRatio {...args}>
        <div style={demoFill}>16 / 9</div>
      </AspectRatio>
    </div>
  ),
};

export const Square: Story = {
  args: { ratio: 1 },
  render: (args) => (
    <div style={{ maxWidth: 240 }}>
      <AspectRatio {...args}>
        <div style={demoFill}>1 / 1</div>
      </AspectRatio>
    </div>
  ),
};

export const Ultrawide: Story = {
  args: { ratio: 21 / 9 },
  render: (args) => (
    <div style={{ maxWidth: 720 }}>
      <AspectRatio {...args}>
        <div style={demoFill}>21 / 9</div>
      </AspectRatio>
    </div>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Stack direction="row" gap={3} wrap>
      {[16 / 9, 4 / 3, 1, 3 / 4, 21 / 9].map((r, i) => (
        <div key={i} style={{ width: 200 }}>
          <AspectRatio ratio={r}>
            <div style={demoFill}>
              <Typography variant="caption">ratio={r.toFixed(2)}</Typography>
            </div>
          </AspectRatio>
        </div>
      ))}
    </Stack>
  ),
};
