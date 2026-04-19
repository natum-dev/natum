"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import cx from "classnames";
import { useControllable } from "../hooks/use-controllable";
import {
  TableContext,
  type SortSpec,
  type TableContextValue,
  type TableSize,
} from "./context";
import styles from "./Table.module.scss";

type TableBaseProps = {
  size?: TableSize;
  striped?: boolean;
  withRowBorders?: boolean;
  stickyHeader?: boolean;

  sort?: SortSpec | null;
  defaultSort?: SortSpec | null;
  onSortChange?: (sort: SortSpec | null) => void;

  rowIds?: string[];
  selectedRowIds?: string[];
  defaultSelectedRowIds?: string[];
  onSelectedRowIdsChange?: (ids: string[]) => void;

  wrapperClassName?: string;
  className?: string;
  children: ReactNode;
};

export type TableProps = TableBaseProps &
  Omit<HTMLAttributes<HTMLTableElement>, keyof TableBaseProps>;

const EMPTY_ROW_IDS: string[] = [];

const Table = forwardRef<HTMLTableElement, TableProps>(
  (
    {
      size = "md",
      striped = true,
      withRowBorders = false,
      stickyHeader = false,
      sort: sortProp,
      defaultSort,
      onSortChange,
      rowIds = EMPTY_ROW_IDS,
      selectedRowIds: selectedRowIdsProp,
      defaultSelectedRowIds,
      onSelectedRowIdsChange,
      wrapperClassName,
      className,
      children,
      ...rest
    },
    ref
  ) => {
    const { value: sort, setValue: setSort } = useControllable<SortSpec>({
      value: sortProp,
      defaultValue: defaultSort ?? undefined,
      onChange: onSortChange,
    });

    // Selection — useControllable expects (T | null) on onChange, so adapt to (string[]).
    const onSelectedChangeInternal = useMemo(
      () =>
        onSelectedRowIdsChange
          ? (v: string[] | null) => onSelectedRowIdsChange(v ?? [])
          : undefined,
      [onSelectedRowIdsChange]
    );
    const { value: selectedRaw, setValue: setSelectedRaw } = useControllable<string[]>({
      value: selectedRowIdsProp,
      defaultValue: defaultSelectedRowIds ?? [],
      onChange: onSelectedChangeInternal,
    });
    const selectedRowIds = selectedRaw ?? EMPTY_ROW_IDS;
    const selectedSet = new Set(selectedRowIds);

    const isAllSelected =
      rowIds.length > 0 && rowIds.every((id) => selectedSet.has(id));
    const isIndeterminate =
      !isAllSelected && rowIds.some((id) => selectedSet.has(id));

    const lastSelectedRef = useRef<string | null>(null);

    const toggleRow = useCallback(
      (id: string, extend: boolean) => {
        const anchor = lastSelectedRef.current;
        if (extend && anchor !== null) {
          const i = rowIds.indexOf(anchor);
          const j = rowIds.indexOf(id);
          if (i !== -1 && j !== -1) {
            const [lo, hi] = i < j ? [i, j] : [j, i];
            const rangeIds = rowIds.slice(lo, hi + 1);
            const targetState = !selectedSet.has(id); // target = new state for clicked id
            const next = new Set(selectedSet);
            for (const rid of rangeIds) {
              if (targetState) next.add(rid);
              else next.delete(rid);
            }
            setSelectedRaw(Array.from(next));
            // Anchor persists through range operations.
            return;
          }
        }
        // Simple toggle.
        const next = new Set(selectedSet);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedRaw(Array.from(next));
        lastSelectedRef.current = id;
      },
      [rowIds, selectedSet, setSelectedRaw]
    );

    const toggleAll = useCallback(() => {
      if (isAllSelected) {
        // Clear only ids present in rowIds; preserve others.
        const rowIdSet = new Set(rowIds);
        const next = selectedRowIds.filter((id) => !rowIdSet.has(id));
        setSelectedRaw(next);
      } else {
        const next = new Set(selectedRowIds);
        for (const id of rowIds) next.add(id);
        setSelectedRaw(Array.from(next));
      }
      lastSelectedRef.current = null;
    }, [isAllSelected, rowIds, selectedRowIds, setSelectedRaw]);

    const ctxValue = useMemo<TableContextValue>(
      () => ({
        size,
        sort: sort ?? null,
        setSort,
        rowIds,
        selectedSet,
        isAllSelected,
        isIndeterminate,
        toggleRow,
        toggleAll,
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [size, sort, setSort, rowIds, selectedSet, isAllSelected, isIndeterminate, toggleRow, toggleAll]
    );

    return (
      <div className={cx(styles.wrapper, wrapperClassName)}>
        <TableContext.Provider value={ctxValue}>
          <table
            ref={ref}
            data-size={size}
            data-striped={striped}
            data-row-borders={withRowBorders}
            data-sticky-header={stickyHeader}
            {...rest}
            className={cx(styles.table, className)}
          >
            {children}
          </table>
        </TableContext.Provider>
      </div>
    );
  }
);

Table.displayName = "Table";

export { Table };
