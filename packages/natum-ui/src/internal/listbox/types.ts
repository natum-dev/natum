import type { ReactNode } from "react";

export type FlatItem = {
  /** Global ordered index across all groups/items, assigned at flatten time. */
  index: number;
  value: string;
  disabled: boolean;
  /** Lowercased. Used by useTypeahead + Combobox filter. Empty string excludes from both. */
  textValue: string;
  /** What to render as the visible option label. */
  children: ReactNode;
  /** Extra className from the item marker, merged onto the <li>. */
  className?: string;
};

export type TreeNode =
  | { kind: "item"; item: FlatItem }
  | { kind: "group"; label: ReactNode; items: FlatItem[] };
