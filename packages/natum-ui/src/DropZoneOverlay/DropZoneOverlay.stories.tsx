import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DropZoneOverlay } from "./DropZoneOverlay";

const meta: Meta<typeof DropZoneOverlay> = {
  title: "Forms/DropZoneOverlay",
  component: DropZoneOverlay,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof DropZoneOverlay>;

const OverlayDemo = ({
  accept,
  label,
}: {
  accept?: string;
  label?: string;
}) => {
  const [lastDrop, setLastDrop] = useState<File[]>([]);
  return (
    <div style={{ minHeight: "100vh", padding: 32 }}>
      <p>Drag files from the desktop anywhere on this page.</p>
      <p>
        Last drop:{" "}
        {lastDrop.length > 0 ? lastDrop.map((f) => f.name).join(", ") : "none"}
      </p>
      <DropZoneOverlay
        onFilesDropped={setLastDrop}
        accept={accept}
        label={label}
      />
    </div>
  );
};

export const Default: Story = {
  render: () => <OverlayDemo />,
};

export const WithCustomLabel: Story = {
  render: () => <OverlayDemo label="Drop CSVs to import" />,
};

export const ImageOnly: Story = {
  render: () => <OverlayDemo accept="image/*" />,
};
