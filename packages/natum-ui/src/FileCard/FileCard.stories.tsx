import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { IconFile, IconMoreVertical } from "@natum/icons";
import { FileCard } from "./FileCard";
import { IconButton } from "../IconButton";
import { Grid } from "../Grid";
import { Skeleton } from "../Skeleton";
import { formatFileSize } from "../utils/format-size";

const meta: Meta<typeof FileCard> = {
  title: "Data/FileCard",
  component: FileCard,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
  },
  args: {
    icon: IconFile,
    name: "annual-report-2026.pdf",
    size: "md",
  },
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof FileCard>;

const cellStyle: React.CSSProperties = { inlineSize: 220 };

export const Default: Story = {
  render: (args) => (
    <div style={cellStyle}>
      <FileCard
        {...args}
        meta={`${formatFileSize(2_400_000)} · 2d ago`}
      />
    </div>
  ),
};

export const WithThumbnail: Story = {
  args: {
    name: "beach-sunset.jpg",
  },
  render: (args) => (
    <div style={cellStyle}>
      <FileCard
        {...args}
        thumbnail={
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400"
            alt=""
          />
        }
        meta={formatFileSize(8_100_000)}
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} style={{ inlineSize: 220 }}>
          <FileCard
            icon={IconFile}
            name={`${size}-example.pdf`}
            meta={formatFileSize(2_400_000)}
            size={size}
          />
        </div>
      ))}
    </div>
  ),
};

const SelectableDemo = () => {
  const [selected, setSelected] = useState(false);
  return (
    <div style={cellStyle}>
      <FileCard
        icon={IconFile}
        name="contract.pdf"
        meta={formatFileSize(1_200_000)}
        selected={selected}
        onSelectedChange={setSelected}
      />
    </div>
  );
};

export const Selectable: Story = {
  render: () => <SelectableDemo />,
};

export const WithAction: Story = {
  render: (args) => (
    <div style={cellStyle}>
      <FileCard
        {...args}
        meta={formatFileSize(2_400_000)}
        action={
          <IconButton
            icon={IconMoreVertical}
            aria-label="More actions"
            size="small"
            onClick={() => console.log("menu clicked")}
          />
        }
      />
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div style={cellStyle}>
      <FileCard
        icon={IconFile}
        name=" "
        thumbnail={<Skeleton variant="rectangular" width="100%" height="100%" />}
        meta={<Skeleton variant="text" width="60%" />}
      />
    </div>
  ),
};

const BrokenThumbnailDemo = () => {
  const [failed, setFailed] = useState(false);
  return (
    <div style={cellStyle}>
      <FileCard
        icon={IconFile}
        name="broken-image.jpg"
        meta={formatFileSize(2_400_000)}
        thumbnail={
          failed ? undefined : (
            <img
              src="https://this-url-does-not-exist.example.com/x.jpg"
              alt=""
              onError={() => setFailed(true)}
            />
          )
        }
      />
    </div>
  );
};

export const BrokenThumbnail: Story = {
  render: () => <BrokenThumbnailDemo />,
};

const GRID_FILES = Array.from({ length: 12 }, (_, i) => ({
  id: `f${i}`,
  name: `document-${i + 1}.pdf`,
  size: 500_000 * (i + 1),
}));

const GridDemo = () => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  return (
    <Grid minChildWidth="180px" gap={3}>
      {GRID_FILES.map((f) => (
        <FileCard
          key={f.id}
          icon={IconFile}
          name={f.name}
          meta={formatFileSize(f.size)}
          selected={selectedIds.has(f.id)}
          onSelectedChange={() => toggle(f.id)}
          action={
            <IconButton
              icon={IconMoreVertical}
              aria-label={`More actions for ${f.name}`}
              size="small"
            />
          }
        />
      ))}
    </Grid>
  );
};

export const GridLayout: Story = {
  parameters: { layout: "padded" },
  render: () => <GridDemo />,
};
