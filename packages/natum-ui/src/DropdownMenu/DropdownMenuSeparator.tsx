import { forwardRef, type HTMLAttributes } from "react";
import styles from "./DropdownMenu.module.scss";
import cx from "classnames";

export type DropdownMenuSeparatorProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "role"
>;

export const DropdownMenuSeparator = forwardRef<
  HTMLDivElement,
  DropdownMenuSeparatorProps
>(({ className, ...rest }, ref) => {
  return (
    <div
      ref={ref}
      {...rest}
      role="separator"
      className={cx(styles.separator, className)}
    />
  );
});

DropdownMenuSeparator.displayName = "DropdownMenuSeparator";
