import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { useTableContext } from "./context";

export type TableFootProps = {
  className?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLTableSectionElement>, "children" | "className">;

const TableFoot = forwardRef<HTMLTableSectionElement, TableFootProps>(
  ({ className, children, ...rest }, ref) => {
    useTableContext();
    return (
      <tfoot ref={ref} {...rest} className={className}>
        {children}
      </tfoot>
    );
  }
);

TableFoot.displayName = "TableFoot";
export { TableFoot };
