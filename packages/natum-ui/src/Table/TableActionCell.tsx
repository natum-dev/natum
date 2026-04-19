import {
  forwardRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type TdHTMLAttributes,
} from "react";
import cx from "classnames";
import type { TableAlign } from "./context";
import styles from "./Table.module.scss";

export type TableActionCellProps = {
  align?: TableAlign;
  className?: string;
  children?: ReactNode;
  onClick?: (e: MouseEvent<HTMLTableCellElement>) => void;
  onMouseDown?: (e: MouseEvent<HTMLTableCellElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLTableCellElement>) => void;
} & Omit<TdHTMLAttributes<HTMLTableCellElement>, "children" | "className" | "align" | "onClick" | "onMouseDown" | "onKeyDown">;

const TableActionCell = forwardRef<HTMLTableCellElement, TableActionCellProps>(
  (
    {
      align = "end",
      className,
      style,
      children,
      onClick,
      onMouseDown,
      onKeyDown,
      ...rest
    },
    ref
  ) => {
    const mergedStyle = { ...style, textAlign: align };

    const stoppingOnClick = (e: MouseEvent<HTMLTableCellElement>) => {
      e.stopPropagation();
      onClick?.(e);
    };
    const stoppingOnMouseDown = (e: MouseEvent<HTMLTableCellElement>) => {
      e.stopPropagation();
      onMouseDown?.(e);
    };
    const stoppingOnKeyDown = (e: KeyboardEvent<HTMLTableCellElement>) => {
      e.stopPropagation();
      onKeyDown?.(e);
    };

    return (
      <td
        ref={ref}
        {...rest}
        className={cx(styles.action_cell, className)}
        style={mergedStyle}
        onClick={stoppingOnClick}
        onMouseDown={stoppingOnMouseDown}
        onKeyDown={stoppingOnKeyDown}
      >
        {children}
      </td>
    );
  }
);

TableActionCell.displayName = "TableActionCell";
export { TableActionCell };
