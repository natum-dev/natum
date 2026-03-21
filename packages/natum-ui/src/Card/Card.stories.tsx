import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  argTypes: {
    variant: {
      control: "select",
      options: ["elevated", "outlined", "filled"],
    },
    elevation: {
      control: "select",
      options: ["none", "low", "medium", "high"],
    },
    padding: {
      control: "select",
      options: ["none", "small", "medium", "large"],
    },
    radius: {
      control: "select",
      options: ["small", "medium", "large"],
    },
    interactive: { control: "boolean" },
    fullWidth: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: "This is a card with some content inside it.",
  },
};

export const Elevated: Story = {
  args: {
    variant: "elevated",
    children: "Elevated card with shadow",
  },
};

export const Outlined: Story = {
  args: {
    variant: "outlined",
    children: "Outlined card with border",
  },
};

export const Filled: Story = {
  args: {
    variant: "filled",
    children: "Filled card with grey background",
  },
};

export const ElevationNone: Story = {
  args: { elevation: "none", children: "No elevation" },
};

export const ElevationMedium: Story = {
  args: { elevation: "medium", children: "Medium elevation" },
};

export const ElevationHigh: Story = {
  args: { elevation: "high", children: "High elevation" },
};

export const PaddingSmall: Story = {
  args: { padding: "small", children: "Small padding" },
};

export const PaddingLarge: Story = {
  args: { padding: "large", children: "Large padding" },
};

export const Interactive: Story = {
  args: {
    interactive: true,
    children: "Hover over me!",
  },
};

export const WithHeaderAndFooter: Story = {
  render: (args) => (
    <Card {...args}>
      <Card.Header>
        <h3 style={{ margin: 0 }}>Card Title</h3>
      </Card.Header>
      <Card.Body>
        <p style={{ margin: 0 }}>This is the main content area of the card. It can contain any content.</p>
      </Card.Body>
      <Card.Footer>
        <button>Action</button>
      </Card.Footer>
    </Card>
  ),
  args: {
    padding: "medium",
  },
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: "Full width card",
  },
  parameters: {
    layout: "padded",
  },
};
