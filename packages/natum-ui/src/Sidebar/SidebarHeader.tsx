import { type HTMLAttributes, type ReactNode } from "react";
import cx from "classnames";
import { useSidebarCollapsed } from "./context";
import styles from "./Sidebar.module.scss";

export type SidebarHeaderProps = {
  children?: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "children" | "className">;

const SidebarHeader = ({ children, className, ...rest }: SidebarHeaderProps) => {
  useSidebarCollapsed();
  return (
    <div {...rest} className={cx(styles.header, className)}>
      {children}
    </div>
  );
};

SidebarHeader.displayName = "SidebarHeader";

export { SidebarHeader };
