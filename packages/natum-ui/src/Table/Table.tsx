"use client";

import {
  forwardRef,
  useMemo,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import cx from "classnames";
import {
  TableContext,
  type TableContextValue,
  type TableSize,
} from "./context";
import styles from "./Table.module.scss";

type TableBaseProps = {
  size?: TableSize;
  striped?: boolean;
  withRowBorders?: boolean;
  stickyHeader?: boolean;

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
      wrapperClassName,
      className,
      children,
      ...rest
    },
    ref
  ) => {
    // Stub context — Task 6 wires sort, Task 7 wires selection.
    const ctxValue = useMemo<TableContextValue>(
      () => ({
        size,
        sort: null,
        setSort: () => {},
        rowIds: [],
        selectedSet: new Set(),
        isAllSelected: false,
        isIndeterminate: false,
        toggleRow: () => {},
        toggleAll: () => {},
      }),
      [size]
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
