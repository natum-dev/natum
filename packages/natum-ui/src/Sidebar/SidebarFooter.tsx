import { type HTMLAttributes, type ReactNode } from "react";
import cx from "classnames";
import { useSidebarCollapsed } from "./context";
import styles from "./Sidebar.module.scss";

export type SidebarFooterProps = {
  children?: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "children" | "className">;

const SidebarFooter = ({ children, className, ...rest }: SidebarFooterProps) => {
  useSidebarCollapsed();
  return (
    <div {...rest} className={cx(styles.footer, className)}>
      {children}
    </div>
  );
};

export { SidebarFooter };
