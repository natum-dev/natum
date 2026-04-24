import { useState, useCallback } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ShareDialog } from "./ShareDialog";
import type { ShareEntry, ShareUser } from "./ShareDialog";
import type { PermissionLevel } from "../PermissionBadge";
import { Button } from "../Button";

const MOCK_USERS: ShareUser[] = [
  { id: "u1", name: "Carol Davis", email: "carol@example.com" },
  { id: "u2", name: "Dave Wilson", email: "dave@example.com" },
  { id: "u3", name: "Eve Martinez", email: "eve@example.com" },
  { id: "u4", name: "Frank Chen", email: "frank@example.com" },
  { id: "u5", name: "Grace Lee", email: "grace@example.com" },
];

const INITIAL_SHARES: ShareEntry[] = [
  {
    id: "owner-1",
    name: "Jonathan Ramlie",
    email: "jon@example.com",
    level: "owner",
  },
  {
    id: "u1",
    name: "Carol Davis",
    email: "carol@example.com",
    level: "editor",
  },
  {
    id: "u2",
    name: "Dave Wilson",
    email: "dave@example.com",
    level: "viewer",
  },
];

function mockSearch(query: string): Promise<ShareUser[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const results = MOCK_USERS.filter(
        (u) =>
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.email.toLowerCase().includes(query.toLowerCase())
      );
      resolve(results);
    }, 400);
  });
}

const meta: Meta<typeof ShareDialog> = {
  title: "Overlay/ShareDialog",
  component: ShareDialog,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ShareDialog>;

function DefaultDemo() {
  const [open, setOpen] = useState(false);
  const [shares, setShares] = useState<ShareEntry[]>(INITIAL_SHARES);

  const handleAdd = useCallback((user: ShareUser, level: PermissionLevel) => {
    setShares((prev) => [...prev, { ...user, level }]);
  }, []);

  const handlePermissionChange = useCallback(
    (userId: string, level: PermissionLevel) => {
      setShares((prev) =>
        prev.map((s) => (s.id === userId ? { ...s, level } : s))
      );
    },
    []
  );

  const handleRemove = useCallback((userId: string) => {
    setShares((prev) => prev.filter((s) => s.id !== userId));
  }, []);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Share File</Button>
      <ShareDialog
        open={open}
        onClose={() => setOpen(false)}
        title="vacation-photo.jpg"
        shares={shares}
        onSearch={mockSearch}
        onAdd={handleAdd}
        onPermissionChange={handlePermissionChange}
        onRemove={handleRemove}
      />
    </>
  );
}

export const Default: Story = {
  render: () => <DefaultDemo />,
};

function EmptyDemo() {
  const [open, setOpen] = useState(false);
  const ownerOnly: ShareEntry[] = [
    {
      id: "owner-1",
      name: "Jonathan Ramlie",
      email: "jon@example.com",
      level: "owner",
    },
  ];

  return (
    <>
      <Button onClick={() => setOpen(true)}>Share File</Button>
      <ShareDialog
        open={open}
        onClose={() => setOpen(false)}
        title="new-document.pdf"
        shares={ownerOnly}
        onSearch={mockSearch}
        onAdd={() => {}}
        onPermissionChange={() => {}}
        onRemove={() => {}}
      />
    </>
  );
}

export const OwnerOnly: Story = {
  render: () => <EmptyDemo />,
};

function NoResultsDemo() {
  const [open, setOpen] = useState(false);
  const ownerOnly: ShareEntry[] = [
    {
      id: "owner-1",
      name: "Jonathan Ramlie",
      email: "jon@example.com",
      level: "owner",
    },
  ];

  return (
    <>
      <Button onClick={() => setOpen(true)}>Share File</Button>
      <ShareDialog
        open={open}
        onClose={() => setOpen(false)}
        title="report.xlsx"
        shares={ownerOnly}
        onSearch={() =>
          new Promise((resolve) => setTimeout(() => resolve([]), 400))
        }
        onAdd={() => {}}
        onPermissionChange={() => {}}
        onRemove={() => {}}
      />
    </>
  );
}

export const SearchNoResults: Story = {
  render: () => <NoResultsDemo />,
};

function ManySharesDemo() {
  const [open, setOpen] = useState(false);
  const shares: ShareEntry[] = [
    {
      id: "owner-1",
      name: "Jonathan Ramlie",
      email: "jon@example.com",
      level: "owner",
    },
    ...MOCK_USERS.map((u, i) => ({
      ...u,
      level: (i % 2 === 0 ? "editor" : "viewer") as PermissionLevel,
    })),
  ];

  return (
    <>
      <Button onClick={() => setOpen(true)}>Share File</Button>
      <ShareDialog
        open={open}
        onClose={() => setOpen(false)}
        title="project-assets.zip"
        shares={shares}
        onSearch={() =>
          new Promise((resolve) => setTimeout(() => resolve([]), 200))
        }
        onAdd={() => {}}
        onPermissionChange={() => {}}
        onRemove={() => {}}
      />
    </>
  );
}

export const ManyShares: Story = {
  render: () => <ManySharesDemo />,
};

function DefaultEditorDemo() {
  const [open, setOpen] = useState(false);
  const ownerOnly: ShareEntry[] = [
    {
      id: "owner-1",
      name: "Jonathan Ramlie",
      email: "jon@example.com",
      level: "owner",
    },
  ];

  return (
    <>
      <Button onClick={() => setOpen(true)}>Share File</Button>
      <ShareDialog
        open={open}
        onClose={() => setOpen(false)}
        title="shared-doc.md"
        shares={ownerOnly}
        onSearch={mockSearch}
        onAdd={() => {}}
        onPermissionChange={() => {}}
        onRemove={() => {}}
        defaultLevel="editor"
      />
    </>
  );
}

export const DefaultEditor: Story = {
  render: () => <DefaultEditorDemo />,
};
