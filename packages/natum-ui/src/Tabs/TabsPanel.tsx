"use client";

import {
  forwardRef,
  useEffect,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import cx from "classnames";
import { useTabsContext } from "./context";
import styles from "./Tabs.module.scss";

export type TabsPanelProps = {
  value: string;
  className?: string;
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, "role" | "children" | "className">;

const TabsPanel = forwardRef<HTMLDivElement, TabsPanelProps>(function TabsPanel(
  { value, className, children, ...rest },
  ref
) {
  const ctx = useTabsContext();
  const isActive = ctx.value === value;
  const shouldMount = isActive || ctx.mountedPanels.has(value);

  useEffect(() => {
    if (isActive) ctx.markPanelMounted(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, value]);

  if (!shouldMount) return null;

  const panelId = `${ctx.baseId}-panel-${value}`;
  const triggerId = `${ctx.baseId}-trigger-${value}`;

  return (
    <div
      ref={ref}
      role="tabpanel"
      id={panelId}
      aria-labelledby={triggerId}
      tabIndex={0}
      hidden={!isActive}
      {...rest}
      className={cx(styles.tabs_panel, className)}
    >
      {children}
    </div>
  );
});

TabsPanel.displayName = "TabsPanel";

export { TabsPanel };
