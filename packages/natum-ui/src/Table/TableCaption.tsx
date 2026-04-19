import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { useTableContext } from "./context";

export type TableCaptionProps = {
  captionSide?: "top" | "bottom";
  className?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLTableCaptionElement>, "children" | "className">;

const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ captionSide = "top", className, children, style, ...rest }, ref) => {
    useTableContext();
    return (
      <caption
        ref={ref}
        {...rest}
        className={className}
        style={{ ...style, captionSide }}
      >
        {children}
      </caption>
    );
  }
);

TableCaption.displayName = "TableCaption";
export { TableCaption };
