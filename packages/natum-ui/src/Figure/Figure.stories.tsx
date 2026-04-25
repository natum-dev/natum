import type { Meta, StoryObj } from "@storybook/react";
import { Figure } from "./Figure";
import { Button } from "../Button";
import { EmptyState } from "../illustrations";

const meta: Meta<typeof Figure> = {
  title: "Components/Figure",
  component: Figure,
  argTypes: {
    layout: { control: "select", options: ["vertical", "horizontal"] },
  },
};

export default meta;
type Story = StoryObj<typeof Figure>;

export const Default: Story = {
  args: {
    illustration: <EmptyState />,
    title: "No files yet",
    description: "Upload your first file to get started with Vault.",
    action: <Button size="sm">Upload file</Button>,
  },
};

export const Horizontal: Story = {
  args: {
    layout: "horizontal",
    illustration: <EmptyState size={80} />,
    title: "No files yet",
    description: "Upload your first file to get started with Vault.",
    action: <Button size="sm">Upload file</Button>,
  },
};

export const WithoutIllustration: Story = {
  args: {
    title: "Search returned no results",
    description: "Try a different search term or check your spelling.",
  },
};

export const WithoutAction: Story = {
  args: {
    illustration: <EmptyState />,
    title: "Folder is empty",
    description: "Drag files here or use the upload button to add files.",
  },
};

export const MultipleActions: Story = {
  args: {
    illustration: <EmptyState />,
    title: "No files yet",
    description: "Upload your first file to get started.",
    action: (
      <>
        <Button size="sm">Upload</Button>
        <Button size="sm" variant="text">Learn more</Button>
      </>
    ),
  },
};

export const RichContent: Story = {
  args: {
    illustration: <EmptyState />,
    title: (<>Welcome to <strong>Vault</strong></>),
    description: (<>Your private, encrypted file storage. <a href="#" style={{ color: "var(--neutral-text-link)" }}>Learn about encryption</a></>),
    action: <Button size="sm">Get started</Button>,
  },
};

export const Minimal: Story = {
  args: { title: "Nothing here" },
};

export const RealWorldEmptyFolder: Story = {
  name: "Real-World: Empty Folder",
  render: () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, border: "1px solid var(--border-color-subtle)", borderRadius: 12 }}>
      <Figure illustration={<EmptyState />} title="This folder is empty" description="Drag and drop files here, or click upload to browse." action={<Button size="sm">Upload files</Button>} />
    </div>
  ),
};

export const RealWorldHorizontalNotification: Story = {
  name: "Real-World: Horizontal Banner",
  render: () => (
    <div style={{ padding: 16, border: "1px solid var(--border-color-subtle)", borderRadius: 12, maxWidth: 500 }}>
      <Figure layout="horizontal" illustration={<EmptyState size={64} />} title="Storage almost full" description="You've used 95% of your storage. Upgrade to get more space." action={<Button size="sm">Upgrade</Button>} />
    </div>
  ),
};

export const DarkMode: Story = {
  args: {
    illustration: <EmptyState />,
    title: "No files yet",
    description: "Upload your first file to get started.",
    action: <Button size="sm">Upload</Button>,
  },
  globals: { theme: "dark" },
};

export const RTL: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <Figure illustration={<EmptyState />} title="لا توجد ملفات بعد" description="ارفع ملفك الأول للبدء." action={<Button size="sm">رفع</Button>} />
      <Figure layout="horizontal" illustration={<EmptyState size={80} />} title="لا توجد ملفات بعد" description="ارفع ملفك الأول للبدء." action={<Button size="sm">رفع</Button>} />
    </div>
  ),
  globals: { direction: "rtl" },
};
