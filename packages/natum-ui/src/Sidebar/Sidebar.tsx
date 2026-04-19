"use client";

import {
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useMemo,
} from "react";
import cx from "classnames";
import { useControllable } from "../hooks/use-controllable";
import { SidebarContext, type SidebarContextValue } from "./context";
import styles from "./Sidebar.module.scss";

export type SidebarProps = {
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  children?: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, "onChange" | "children" | "className">;

const Sidebar = ({
  collapsed,
  defaultCollapsed = false,
  onCollapseChange,
  children,
  className,
  "aria-label": ariaLabel = "Sidebar navigation",
  ...rest
}: SidebarProps) => {
  const { value, setValue } = useControllable<boolean>({
    value: collapsed,
    defaultValue: defaultCollapsed,
    onChange: (next) => onCollapseChange?.(next ?? false),
  });
  const isCollapsed = value ?? false;

  const setCollapsed = useCallback(
    (next: boolean) => setValue(next),
    [setValue]
  );

  const ctxValue = useMemo<SidebarContextValue>(
    () => ({ collapsed: isCollapsed, setCollapsed }),
    [isCollapsed, setCollapsed]
  );

  return (
    <SidebarContext.Provider value={ctxValue}>
      <aside
        {...rest}
        role="navigation"
        aria-label={ariaLabel}
        data-collapsed={isCollapsed ? "true" : "false"}
        className={cx(styles.sidebar, className)}
      >
        {children}
      </aside>
    </SidebarContext.Provider>
  );
};

Sidebar.displayName = "Sidebar";

export { Sidebar };
