import {
  forwardRef,
  type ReactNode,
  type TdHTMLAttributes,
} from "react";
import type { TableAlign } from "./context";

export type TableCellProps = {
  align?: TableAlign;
  className?: string;
  children?: ReactNode;
} & Omit<TdHTMLAttributes<HTMLTableCellElement>, "children" | "className" | "align">;

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ align, className, style, children, ...rest }, ref) => {
    const mergedStyle = align != null ? { ...style, textAlign: align } : style;
    return (
      <td ref={ref} {...rest} className={className} style={mergedStyle}>
        {children}
      </td>
    );
  }
);

TableCell.displayName = "TableCell";
export { TableCell };
