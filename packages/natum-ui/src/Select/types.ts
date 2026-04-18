import type { ReactNode } from "react";

export type FlatItem = {
  /** Global ordered index across all groups/items. */
  index: number;
  value: string;
  disabled: boolean;
  /** Lowercased; used by useTypeahead. Empty string excludes from typeahead. */
  textValue: string;
  /** What to render as the visible option label. */
  children: ReactNode;
  /** Extra className from the SelectItem, merged on the <li>. */
  className?: string;
};

export type TreeNode =
  | { kind: "item"; item: FlatItem }
  | { kind: "group"; label: ReactNode; items: FlatItem[] };

export type SelectContextValue = {
  selectId: string;
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  isSelected: (v: string) => boolean;
  isMulti: boolean;
  onItemSelect: (value: string) => void;
  itemId: (index: number) => string;
};
