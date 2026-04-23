import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  IconDownload,
  IconMoreVertical,
  IconStar,
  IconTrash,
} from "@natum/icons";
import { IconButton } from "../IconButton";
import { Button } from "../Button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./index";

const meta = {
  title: "Navigation/DropdownMenu",
  component: DropdownMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <IconButton icon={IconMoreVertical} aria-label="File actions" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => console.log("rename")}>
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => console.log("download")}>
          Download
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => console.log("share")}>
          Share
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithSeparatorAndLabel: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <IconButton icon={IconMoreVertical} aria-label="File actions" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => {}}>Rename</DropdownMenuItem>
        <DropdownMenuItem
          leftSection={<IconDownload />}
          onSelect={() => {}}
        >
          Download
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => {}}>Share</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Danger zone</DropdownMenuLabel>
        <DropdownMenuItem
          leftSection={<IconTrash />}
          destructive
          onSelect={() => {}}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const Destructive: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="soft">Danger actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          leftSection={<IconTrash />}
          destructive
          onSelect={() => {}}
        >
          Delete permanently
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const AlignEnd: Story = {
  render: () => (
    <div style={{ width: 400, display: "flex", justifyContent: "flex-end" }}>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <IconButton icon={IconMoreVertical} aria-label="File actions" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Rename</DropdownMenuItem>
          <DropdownMenuItem>Download</DropdownMenuItem>
          <DropdownMenuItem destructive>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};

const ControlledDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <p style={{ marginBlockEnd: 16 }}>External state — open: {String(open)}</p>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger>
          <Button>Controlled trigger</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => {}}>One</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => {}}>Two</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledDemo />,
};

export const DisabledItems: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button>Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Enabled A</DropdownMenuItem>
        <DropdownMenuItem disabled>Disabled B</DropdownMenuItem>
        <DropdownMenuItem>Enabled C</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const LongList: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button>Choose fruit</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {[
          "Apple", "Apricot", "Avocado", "Banana", "Blackberry", "Blueberry",
          "Cherry", "Coconut", "Date", "Dragonfruit", "Fig", "Grape",
          "Guava", "Kiwi", "Lemon", "Lime", "Mango", "Melon", "Peach",
          "Pear",
        ].map((fruit) => (
          <DropdownMenuItem key={fruit}>{fruit}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const OnFileRow: Story = {
  render: () => (
    <div
      style={{
        width: 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        border: "1px solid var(--border-color)",
        borderRadius: 8,
      }}
    >
      <div>
        <div style={{ fontWeight: 500 }}>Q4-report.pdf</div>
        <div style={{ fontSize: 12, color: "var(--neutral-text-secondary)" }}>
          2.4 MB · yesterday
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <IconButton icon={IconMoreVertical} aria-label="File actions" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem leftSection={<IconStar />}>
            Favorite
          </DropdownMenuItem>
          <DropdownMenuItem leftSection={<IconDownload />}>
            Download
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem leftSection={<IconTrash />} destructive>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};
