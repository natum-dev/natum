import {
  forwardRef,
  useMemo,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import cx from "classnames";
import { TableRowContext, useTableContext, type TableRowContextValue } from "./context";
import styles from "./Table.module.scss";

export type TableRowProps = {
  rowId?: string;
  onClick?: MouseEventHandler<HTMLTableRowElement>;
  className?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLTableRowElement>, "children" | "className" | "onClick">;

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ rowId, onClick, className, children, ...rest }, ref) => {
    const { selectedSet } = useTableContext();
    const isSelected = rowId != null && selectedSet.has(rowId);
    const rowCtx = useMemo<TableRowContextValue>(
      () => ({ rowId: rowId ?? null, isSelected }),
      [rowId, isSelected]
    );
    const interactive = onClick != null;
    const ariaSelected = rowId != null ? (isSelected ? "true" : "false") : undefined;

    return (
      <TableRowContext.Provider value={rowCtx}>
        <tr
          ref={ref}
          aria-selected={ariaSelected}
          {...rest}
          className={cx(styles.row, { [styles.interactive]: interactive }, className)}
          onClick={onClick}
        >
          {children}
        </tr>
      </TableRowContext.Provider>
    );
  }
);

TableRow.displayName = "TableRow";
export { TableRow };
