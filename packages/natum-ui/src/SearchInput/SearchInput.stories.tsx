import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useRef, useState } from "react";
import { SearchInput } from "./SearchInput";
import { Spinner } from "../Spinner";
import { Stack } from "../Stack";
import { Typography } from "../Typography";

const meta: Meta<typeof SearchInput> = {
  title: "Forms/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    variant: { control: "inline-radio", options: ["outlined", "filled"] },
    disabled: { control: "boolean" },
    clearable: { control: "boolean" },
    debounceMs: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  args: {
    placeholder: "Search…",
    "aria-label": "Search files",
  },
};

const DebouncedDemo = () => {
  const [committed, setCommitted] = useState("");
  return (
    <Stack gap={2}>
      <SearchInput
        placeholder="Type to see debounce in action"
        onChange={setCommitted}
        aria-label="Search files"
      />
      <Typography variant="body2" color="secondary">
        Last committed: {committed || "—"}
      </Typography>
    </Stack>
  );
};

export const Debounced: Story = {
  render: () => <DebouncedDemo />,
};

export const Sizes: Story = {
  render: () => (
    <Stack gap={2}>
      <SearchInput size="sm" placeholder="Small" aria-label="Small" />
      <SearchInput size="md" placeholder="Medium" aria-label="Medium" />
      <SearchInput size="lg" placeholder="Large" aria-label="Large" />
    </Stack>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack gap={2}>
      <SearchInput variant="outlined" placeholder="Outlined" aria-label="Outlined" />
      <SearchInput variant="filled" placeholder="Filled" aria-label="Filled" />
    </Stack>
  ),
};

const WithSubmitDemo = () => {
  const [entries, setEntries] = useState<string[]>([]);
  const [value, setValue] = useState("");
  return (
    <Stack gap={2}>
      <SearchInput
        value={value}
        onChange={setValue}
        onSubmit={(v) => {
          if (!v.trim()) return;
          setEntries((prev) => [v, ...prev].slice(0, 5));
          setValue("");
        }}
        placeholder="Type + press Enter"
        aria-label="Add search entry"
      />
      <Typography variant="body2" color="secondary">
        Recent: {entries.length === 0 ? "—" : entries.join(", ")}
      </Typography>
    </Stack>
  );
};

export const WithSubmit: Story = {
  render: () => <WithSubmitDemo />,
};

const AsyncDemo = () => {
  const [committed, setCommitted] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const lastId = useRef(0);

  useEffect(() => {
    if (!committed) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const id = ++lastId.current;
    const timer = window.setTimeout(() => {
      if (id !== lastId.current) return;
      setResults([`${committed} — result 1`, `${committed} — result 2`]);
      setLoading(false);
    }, 600);
    return () => window.clearTimeout(timer);
  }, [committed]);

  return (
    <Stack gap={2}>
      <SearchInput
        placeholder="Async fetch demo"
        onChange={setCommitted}
        rightSection={loading ? <Spinner size="sm" /> : undefined}
        aria-label="Async search"
      />
      <Stack gap={1}>
        {results.length === 0 ? (
          <Typography variant="body2" color="secondary">
            {loading ? "Searching…" : "No query"}
          </Typography>
        ) : (
          results.map((r) => (
            <Typography key={r} variant="body2">
              {r}
            </Typography>
          ))
        )}
      </Stack>
    </Stack>
  );
};

export const AsyncDemoStory: Story = {
  name: "AsyncDemo",
  render: () => <AsyncDemo />,
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "cannot edit",
    "aria-label": "Search",
  },
};

export const NotClearable: Story = {
  args: {
    defaultValue: "typed query",
    clearable: false,
    "aria-label": "Search",
  },
};
