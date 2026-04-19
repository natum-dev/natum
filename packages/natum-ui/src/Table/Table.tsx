"use client";

import {
  forwardRef,
  useMemo,
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

  wrapperClassName?: string;
  className?: string;
  children: ReactNode;
};

export type TableProps = TableBaseProps &
  Omit<HTMLAttributes<HTMLTableElement>, keyof TableBaseProps>;

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

    // Selection is stubbed until Task 7.
    const ctxValue = useMemo<TableContextValue>(
      () => ({
        size,
        sort: sort ?? null,
        setSort,
        rowIds: [],
        selectedSet: new Set(),
        isAllSelected: false,
        isIndeterminate: false,
        toggleRow: () => {},
        toggleAll: () => {},
      }),
      [size, sort, setSort]
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
