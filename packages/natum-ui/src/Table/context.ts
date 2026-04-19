import { createContext, useContext } from "react";

export type SortDirection = "asc" | "desc";
export type SortSpec = { key: string; direction: SortDirection };
export type TableSize = "sm" | "md" | "lg";
export type TableAlign = "start" | "center" | "end";

export type TableContextValue = {
  size: TableSize;
  sort: SortSpec | null;
  setSort: (next: SortSpec | null) => void;
  rowIds: string[];
  selectedSet: Set<string>;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  toggleRow: (id: string, extend: boolean) => void;
  toggleAll: () => void;
};

export const TableContext = createContext<TableContextValue | null>(null);

export const useTableContext = (): TableContextValue => {
  const ctx = useContext(TableContext);
  if (ctx === null) {
    throw new Error("useTableContext must be used within <Table>.");
  }
  return ctx;
};

export type TableRowContextValue = {
  rowId: string | null;
  isSelected: boolean;
};

export const TableRowContext = createContext<TableRowContextValue | null>(null);

export const useTableRowContext = (): TableRowContextValue => {
  const ctx = useContext(TableRowContext);
  if (ctx === null) {
    throw new Error("useTableRowContext must be used within <TableRow>.");
  }
  return ctx;
};
