import type { Meta, StoryObj } from "@storybook/react";
import { Grid } from "./Grid";
import { Card } from "../Card";
import { Typography } from "../Typography";

const meta: Meta<typeof Grid> = {
  title: "Layout/Grid",
  component: Grid,
  argTypes: {
    columns: { control: "select", options: [1, 2, 3, 4, 6, 12] },
    gap: { control: "select", options: [0, 1, 2, 3, 4, 6, 8, 12, 16] },
    minChildWidth: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Grid>;

const Tile = ({ children }: { children: React.ReactNode }) => (
  <Card size="md">
    <Typography variant="body2">{children}</Typography>
  </Card>
);

export const FixedColumns: Story = {
  args: { columns: 3, gap: 4 },
  render: (args) => (
    <Grid {...args}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Tile key={i}>Card {i + 1}</Tile>
      ))}
    </Grid>
  ),
};

export const ResponsiveAutoFit: Story = {
  args: { minChildWidth: "240px", gap: 4 },
  render: (args) => (
    <Grid {...args}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Tile key={i}>Card {i + 1}</Tile>
      ))}
    </Grid>
  ),
};

export const TwoColumnForm: Story = {
  render: () => (
    <Grid columns={2} gap={3} style={{ maxWidth: 560 }}>
      <Tile>First name</Tile>
      <Tile>Last name</Tile>
      <Tile>Email</Tile>
      <Tile>Phone</Tile>
    </Grid>
  ),
};

export const AsymmetricGaps: Story = {
  render: () => (
    <Grid columns={3} rowGap={6} columnGap={2}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Tile key={i}>Card {i + 1}</Tile>
      ))}
    </Grid>
  ),
};
