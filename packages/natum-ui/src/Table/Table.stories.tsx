import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  IconFile,
  IconMoreVertical,
} from "@natum/icons";
import { Table } from "./Table";
import { TableHead } from "./TableHead";
import { TableBody } from "./TableBody";
import { TableFoot } from "./TableFoot";
import { TableCaption } from "./TableCaption";
import { TableRow } from "./TableRow";
import { TableHeaderCell } from "./TableHeaderCell";
import { TableCell } from "./TableCell";
import { TableSelectAllCell } from "./TableSelectAllCell";
import { TableSelectionCell } from "./TableSelectionCell";
import { TableActionCell } from "./TableActionCell";
import { IconButton } from "../IconButton";
import { Figure } from "../Figure";
import { Skeleton } from "../Skeleton";
import type { SortSpec } from "./context";

const meta = {
  title: "Data/Table",
  component: Table,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    striped: { control: "boolean" },
    withRowBorders: { control: "boolean" },
    stickyHeader: { control: "boolean" },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

type FileRow = { id: string; name: string; size: number; modified: string };

const FILES: FileRow[] = [
  { id: "a", name: "report-2026.pdf", size: 2_400_000, modified: "2 hours ago" },
  { id: "b", name: "invoice-april.xlsx", size: 148_000, modified: "yesterday" },
  { id: "c", name: "team-photo.jpg", size: 3_100_000, modified: "3 days ago" },
  { id: "d", name: "notes.md", size: 12_000, modified: "1 week ago" },
  { id: "e", name: "draft.docx", size: 82_000, modified: "2 weeks ago" },
];

const formatSize = (bytes: number) =>
  bytes > 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.round(bytes / 1000)} KB`;

export const Default: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell align="end">Size</TableHeaderCell>
          <TableHeaderCell>Modified</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {FILES.map((f) => (
          <TableRow key={f.id}>
            <TableCell>{f.name}</TableCell>
            <TableCell align="end">{formatSize(f.size)}</TableCell>
            <TableCell>{f.modified}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const AllDensities: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24 }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <Table key={size} size={size}>
          <TableCaption>size = &quot;{size}&quot;</TableCaption>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell align="end">Size</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {FILES.slice(0, 3).map((f) => (
              <TableRow key={f.id}>
                <TableCell>{f.name}</TableCell>
                <TableCell align="end">{formatSize(f.size)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ))}
    </div>
  ),
};

export const WithRowBorders: Story = {
  args: { withRowBorders: true, striped: false },
  render: (args) => (
    <Table {...args}>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell align="end">Size</TableHeaderCell>
          <TableHeaderCell>Modified</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {FILES.map((f) => (
          <TableRow key={f.id}>
            <TableCell>{f.name}</TableCell>
            <TableCell align="end">{formatSize(f.size)}</TableCell>
            <TableCell>{f.modified}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const StickyHeader: Story = {
  args: { stickyHeader: true },
  render: (args) => (
    <div style={{ maxHeight: 240, overflowY: "auto" }}>
      <Table {...args}>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell align="end">Size</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[...FILES, ...FILES, ...FILES].map((f, i) => (
            <TableRow key={`${f.id}-${i}`}>
              <TableCell>{f.name}</TableCell>
              <TableCell align="end">{formatSize(f.size)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
};

const SortableDemo = () => {
  const [sort, setSort] = useState<SortSpec | null>({ key: "name", direction: "asc" });
  const sorted = [...FILES].sort((a, b) => {
    if (!sort) return 0;
    const dir = sort.direction === "asc" ? 1 : -1;
    const av = (a as unknown as Record<string, string | number>)[sort.key];
    const bv = (b as unknown as Record<string, string | number>)[sort.key];
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
  return (
    <Table sort={sort} onSortChange={setSort}>
      <TableHead>
        <TableRow>
          <TableHeaderCell sortKey="name">Name</TableHeaderCell>
          <TableHeaderCell sortKey="size" align="end">Size</TableHeaderCell>
          <TableHeaderCell>Modified</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sorted.map((f) => (
          <TableRow key={f.id}>
            <TableCell>{f.name}</TableCell>
            <TableCell align="end">{formatSize(f.size)}</TableCell>
            <TableCell>{f.modified}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export const Sortable: Story = {
  render: () => <SortableDemo />,
};

const SelectionDemo = () => {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <div>
      <div style={{ padding: "8px 0" }}>Selected: {selected.length}</div>
      <Table
        rowIds={FILES.map((f) => f.id)}
        selectedRowIds={selected}
        onSelectedRowIdsChange={setSelected}
      >
        <TableHead>
          <TableRow>
            <TableSelectAllCell />
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell align="end">Size</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {FILES.map((f) => (
            <TableRow key={f.id} rowId={f.id}>
              <TableSelectionCell aria-label={`Select ${f.name}`} />
              <TableCell>{f.name}</TableCell>
              <TableCell align="end">{formatSize(f.size)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export const Selection: Story = {
  render: () => <SelectionDemo />,
};

const ClickableDemo = () => {
  const [lastClicked, setLastClicked] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);
  return (
    <div>
      <div style={{ padding: "8px 0" }}>
        Last row click: {lastClicked ?? "—"} · Last action: {lastAction ?? "—"}
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell align="end">Size</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {FILES.map((f) => (
            <TableRow
              key={f.id}
              rowId={f.id}
              onClick={() => setLastClicked(f.name)}
            >
              <TableCell>{f.name}</TableCell>
              <TableCell align="end">{formatSize(f.size)}</TableCell>
              <TableActionCell>
                <IconButton
                  aria-label={`Open ${f.name}`}
                  onClick={() => setLastAction(`open ${f.name}`)}
                >
                  <IconFile />
                </IconButton>
                <IconButton
                  aria-label={`More ${f.name}`}
                  onClick={() => setLastAction(`more ${f.name}`)}
                >
                  <IconMoreVertical />
                </IconButton>
              </TableActionCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export const ClickableRows: Story = {
  render: () => <ClickableDemo />,
};

export const WithCaption: Story = {
  render: () => (
    <Table>
      <TableCaption>April 2026 invoices — 5 files</TableCaption>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell align="end">Size</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {FILES.map((f) => (
          <TableRow key={f.id}>
            <TableCell>{f.name}</TableCell>
            <TableCell align="end">{formatSize(f.size)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const EmptyState: Story = {
  render: () => (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell align="end">Size</TableHeaderCell>
          <TableHeaderCell>Modified</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell colSpan={3}>
            <Figure title="No files yet" description="Upload a file to get started." />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const Loading: Story = {
  render: () => (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell align="end">Size</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton variant="text" /></TableCell>
            <TableCell align="end"><Skeleton variant="text" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithFooter: Story = {
  render: () => {
    const total = FILES.reduce((n, f) => n + f.size, 0);
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell align="end">Size</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {FILES.map((f) => (
            <TableRow key={f.id}>
              <TableCell>{f.name}</TableCell>
              <TableCell align="end">{formatSize(f.size)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFoot>
          <TableRow>
            <TableCell><strong>Total</strong></TableCell>
            <TableCell align="end"><strong>{formatSize(total)}</strong></TableCell>
          </TableRow>
        </TableFoot>
      </Table>
    );
  },
};
