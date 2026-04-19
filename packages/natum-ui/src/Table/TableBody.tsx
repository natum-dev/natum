import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { useTableContext } from "./context";

export type TableBodyProps = {
  className?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLTableSectionElement>, "children" | "className">;

const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, children, ...rest }, ref) => {
    useTableContext();
    return (
      <tbody ref={ref} {...rest} className={className}>
        {children}
      </tbody>
    );
  }
);

TableBody.displayName = "TableBody";
export { TableBody };
