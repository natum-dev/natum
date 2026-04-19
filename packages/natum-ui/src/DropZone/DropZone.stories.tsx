import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DropZone } from "./DropZone";

const meta: Meta<typeof DropZone> = {
  title: "Forms/DropZone",
  component: DropZone,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DropZone>;

export const Default: Story = {
  args: {
    onFilesSelected: (files) => {
      // eslint-disable-next-line no-console
      console.log("selected", files);
    },
  },
};

export const WithAccept: Story = {
  args: {
    accept: "image/*",
    onFilesSelected: () => {},
  },
};

export const SingleFile: Story = {
  args: {
    multiple: false,
    onFilesSelected: () => {},
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    onFilesSelected: () => {},
  },
};

const CustomContentDemo = () => {
  const [picked, setPicked] = useState<File[]>([]);
  return (
    <div>
      <DropZone onFilesSelected={setPicked}>
        <strong>Upload your resume</strong>
        <span>PDF or DOCX, max 2 MB</span>
      </DropZone>
      <p style={{ marginTop: 12 }}>
        Picked: {picked.map((f) => f.name).join(", ") || "none"}
      </p>
    </div>
  );
};

export const CustomContent: Story = {
  render: () => <CustomContentDemo />,
};
