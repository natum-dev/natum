import {
  forwardRef,
  type ReactNode,
  type ThHTMLAttributes,
} from "react";
import type { TableAlign } from "./context";

export type TableHeaderCellProps = {
  sortKey?: string;
  align?: TableAlign;
  className?: string;
  children: ReactNode;
} & Omit<ThHTMLAttributes<HTMLTableCellElement>, "children" | "className" | "align" | "scope">;

const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  ({ sortKey: _sortKey, align, className, style, children, ...rest }, ref) => {
    // Sort wiring lands in Task 6. For now: plain <th scope="col">.
    void _sortKey;
    const mergedStyle = align != null ? { ...style, textAlign: align } : style;
    return (
      <th ref={ref} scope="col" {...rest} className={className} style={mergedStyle}>
        {children}
      </th>
    );
  }
);

TableHeaderCell.displayName = "TableHeaderCell";
export { TableHeaderCell };
