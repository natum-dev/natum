import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FilePreviewPanel } from "./FilePreviewPanel";
import { ImagePreview } from "../ImagePreview";
import { IconButton } from "../IconButton";
import { IconDownload, IconMoreHorizontal } from "@natum/icons";
import { Button } from "../Button";
import { Typography } from "../Typography";

const meta: Meta<typeof FilePreviewPanel> = {
  title: "Overlay/FilePreviewPanel",
  component: FilePreviewPanel,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FilePreviewPanel>;

function DefaultDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Preview</Button>
      <FilePreviewPanel
        open={open}
        onClose={() => setOpen(false)}
        fileName="vacation-photo.jpg"
        meta="2.4 MB · JPEG · 1920×1080"
      >
        <ImagePreview
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800"
          alt="Vacation photo"
        />
      </FilePreviewPanel>
    </>
  );
}

export const Default: Story = {
  render: () => <DefaultDemo />,
};

const FILES = [
  {
    name: "mountains.jpg",
    meta: "3.1 MB · JPEG",
    src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
  },
  {
    name: "forest.jpg",
    meta: "2.8 MB · JPEG",
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
  },
  {
    name: "ocean.jpg",
    meta: "4.2 MB · JPEG",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
  },
];

function NavigationDemo() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const file = FILES[index];

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Preview</Button>
      <FilePreviewPanel
        open={open}
        onClose={() => setOpen(false)}
        fileName={file.name}
        meta={file.meta}
        onPrevious={index > 0 ? () => setIndex((i) => i - 1) : undefined}
        onNext={
          index < FILES.length - 1 ? () => setIndex((i) => i + 1) : undefined
        }
      >
        <ImagePreview src={file.src} alt={file.name} />
      </FilePreviewPanel>
    </>
  );
}

export const WithNavigation: Story = {
  render: () => <NavigationDemo />,
};

function HeaderActionsDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Preview</Button>
      <FilePreviewPanel
        open={open}
        onClose={() => setOpen(false)}
        fileName="report-2026.pdf"
        meta="1.2 MB · PDF"
        headerActions={
          <>
            <IconButton
              icon={IconDownload}
              aria-label="Download"
              variant="text"
              color="secondary"
              size="small"
            />
            <IconButton
              icon={IconMoreHorizontal}
              aria-label="More actions"
              variant="text"
              color="secondary"
              size="small"
            />
          </>
        }
      >
        <Typography variant="body2" color="secondary">
          PDF preview would render here
        </Typography>
      </FilePreviewPanel>
    </>
  );
}

export const WithHeaderActions: Story = {
  render: () => <HeaderActionsDemo />,
};

function MobileDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Preview</Button>
      <FilePreviewPanel
        open={open}
        onClose={() => setOpen(false)}
        fileName="photo.jpg"
        meta="2.4 MB · JPEG"
      >
        <ImagePreview
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800"
          alt="Photo"
        />
      </FilePreviewPanel>
    </>
  );
}

export const Mobile: Story = {
  render: () => <MobileDemo />,
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
};

function NoScrimCloseDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Preview</Button>
      <FilePreviewPanel
        open={open}
        onClose={() => setOpen(false)}
        fileName="protected.jpg"
        meta="1.8 MB · JPEG"
        closeOnOverlayClick={false}
      >
        <ImagePreview
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800"
          alt="Protected photo"
        />
      </FilePreviewPanel>
    </>
  );
}

export const NoScrimClose: Story = {
  render: () => <NoScrimCloseDemo />,
};

function CustomContentDemo() {
  const [open, setOpen] = useState(false);
  const codeContent = `function greet(name: string) {\n  return \`Hello, \${name}!\`;\n}\n\nconsole.log(greet("World"));`;
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Preview</Button>
      <FilePreviewPanel
        open={open}
        onClose={() => setOpen(false)}
        fileName="greeting.ts"
        meta="128 B · TypeScript"
      >
        <pre
          style={{
            padding: 16,
            margin: 0,
            fontSize: 13,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            alignSelf: "flex-start",
            width: "100%",
          }}
        >
          {codeContent}
        </pre>
      </FilePreviewPanel>
    </>
  );
}

export const CustomContent: Story = {
  render: () => <CustomContentDemo />,
};
