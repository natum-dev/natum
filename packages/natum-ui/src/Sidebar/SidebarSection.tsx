import { type HTMLAttributes, type ReactNode } from "react";
import cx from "classnames";
import { useSidebarCollapsed } from "./context";
import styles from "./Sidebar.module.scss";

export type SidebarSectionProps = {
  label?: ReactNode;
  children?: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "children" | "className">;

const SidebarSection = ({
  label,
  children,
  className,
  ...rest
}: SidebarSectionProps) => {
  useSidebarCollapsed();
  return (
    <div {...rest} className={cx(styles.section, className)}>
      {label !== undefined && (
        <div className={styles.section_label} aria-hidden="true">
          {label}
        </div>
      )}
      {/* role="list" preserves list semantics in Safari/VoiceOver when list-style: none is applied */}
      <ul role="list">{children}</ul>
    </div>
  );
};

SidebarSection.displayName = "SidebarSection";

export { SidebarSection };
