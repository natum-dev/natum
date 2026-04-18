export type { FlatItem, TreeNode } from "../internal/listbox/types";

export type SelectContextValue = {
  selectId: string;
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  isSelected: (v: string) => boolean;
  isMulti: boolean;
  onItemSelect: (value: string) => void;
  itemId: (index: number) => string;
};
