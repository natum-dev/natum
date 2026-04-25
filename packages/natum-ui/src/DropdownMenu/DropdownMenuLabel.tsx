import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import styles from "./DropdownMenu.module.scss";
import cx from "classnames";

export type DropdownMenuLabelProps = {
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, "role" | "children">;

export const DropdownMenuLabel = forwardRef<
  HTMLDivElement,
  DropdownMenuLabelProps
>(({ children, className, ...rest }, ref) => {
  return (
    <div
      ref={ref}
      {...rest}
      role="presentation"
      className={cx(styles.label, className)}
    >
      {children}
    </div>
  );
});

DropdownMenuLabel.displayName = "DropdownMenuLabel";
