"use client";

import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import cx from "classnames";
import { useTabsContext } from "./context";
import styles from "./Tabs.module.scss";

export type TabsListProps = {
  className?: string;
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, "role" | "aria-orientation" | "children" | "className">;

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { className, children, ...rest },
  forwardedRef
) {
  const ctx = useTabsContext();
  const internalRef = useRef<HTMLDivElement | null>(null);

  const setRef = (el: HTMLDivElement | null) => {
    internalRef.current = el;
    if (typeof forwardedRef === "function") forwardedRef(el);
    else if (forwardedRef) forwardedRef.current = el;
  };

  if (import.meta.env.DEV) {
    const hasLabel =
      typeof rest["aria-label"] === "string" ||
      typeof rest["aria-labelledby"] === "string";
    if (!hasLabel) {
      // eslint-disable-next-line no-console
      console.warn(
        "TabsList should have an aria-label or aria-labelledby to describe the tab list."
      );
    }
  }

  // Indicator measurement lands in Task 10.
  useLayoutEffect(() => {
    // Placeholder — Task 10 fills this in.
  }, [ctx.value, ctx.measureTick, ctx.variant]);

  useEffect(() => {
    const list = internalRef.current;
    if (!list) return;
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => ctx.bumpMeasureTick());
    ro.observe(list);
    ctx.triggerRefs.current.forEach((el) => ro.observe(el));
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={setRef}
      role="tablist"
      aria-orientation="horizontal"
      {...rest}
      className={cx(styles.tabs_list, className)}
    >
      {children}
    </div>
  );
});

TabsList.displayName = "TabsList";

export { TabsList };
