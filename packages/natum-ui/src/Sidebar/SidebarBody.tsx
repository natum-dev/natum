import { type HTMLAttributes, type ReactNode } from "react";
import cx from "classnames";
import { useSidebarCollapsed } from "./context";
import styles from "./Sidebar.module.scss";

export type SidebarBodyProps = {
  children?: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "children" | "className">;

const SidebarBody = ({ children, className, ...rest }: SidebarBodyProps) => {
  useSidebarCollapsed();
  return (
    <div {...rest} className={cx(styles.body, className)}>
      {children}
    </div>
  );
};

export { SidebarBody };
