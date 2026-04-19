import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { useTableContext } from "./context";

export type TableHeadProps = {
  className?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLTableSectionElement>, "children" | "className">;

const TableHead = forwardRef<HTMLTableSectionElement, TableHeadProps>(
  ({ className, children, ...rest }, ref) => {
    useTableContext();
    return (
      <thead ref={ref} {...rest} className={className}>
        {children}
      </thead>
    );
  }
);

TableHead.displayName = "TableHead";
export { TableHead };
