import type { Meta, StoryObj } from "@storybook/react";
import { Container } from "./Container";
import { Card } from "../Card";
import { Typography } from "../Typography";
import { Stack } from "../Stack";

const meta: Meta<typeof Container> = {
  title: "Layout/Container",
  component: Container,
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg", "xl", "fluid"] },
    as: {
      control: "select",
      options: ["div", "section", "article", "main", "aside"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Container>;

const demoStyle: React.CSSProperties = {
  outline: "1px dashed var(--primary-border)",
  padding: "16px",
};

export const Default: Story = {
  args: { size: "lg" },
  render: (args) => (
    <Container {...args} style={demoStyle}>
      <Typography variant="body2">size={args.size ?? "lg"}</Typography>
    </Container>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <Stack gap={4}>
      {(["sm", "md", "lg", "xl", "fluid"] as const).map((size) => (
        <Container key={size} size={size} style={demoStyle}>
          <Typography variant="caption">size={size}</Typography>
        </Container>
      ))}
    </Stack>
  ),
};

export const PageLayout: Story = {
  render: () => (
    <Container as="main" size="lg">
      <Stack gap={4}>
        <Typography variant="h3">Dashboard</Typography>
        <Card size="lg">
          <Typography variant="body1">
            Container wraps the page at lg width with built-in horizontal
            padding. Use Stack inside to compose sections.
          </Typography>
        </Card>
      </Stack>
    </Container>
  ),
};
