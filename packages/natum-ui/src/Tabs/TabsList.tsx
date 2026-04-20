"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import cx from "classnames";
import { useTabsContext } from "./context";
import styles from "./Tabs.module.scss";

export type TabsListProps = {
  className?: string;
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, "role" | "aria-orientation" | "children" | "className">;

function collectOrderedValues(listEl: HTMLElement): string[] {
  const triggers = Array.from(
    listEl.querySelectorAll<HTMLElement>("[role='tab']")
  );
  return triggers.map((t) => t.getAttribute("data-value") ?? "");
}

function isTriggerEnabled(listEl: HTMLElement, value: string): boolean {
  const el = listEl.querySelector<HTMLElement>(
    `[role='tab'][data-value="${CSS.escape(value)}"]`
  );
  return !!el && el.getAttribute("aria-disabled") !== "true";
}

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { className, children, onKeyDown, ...rest },
  forwardedRef
) {
  const ctx = useTabsContext();
  const internalRef = useRef<HTMLDivElement | null>(null);

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      internalRef.current = el;
      if (typeof forwardedRef === "function") forwardedRef(el);
      else if (forwardedRef) forwardedRef.current = el;
    },
    [forwardedRef]
  );

  if (import.meta.env.DEV) {
    const hasLabel =
      typeof rest["aria-label"] === "string" ||
      typeof rest["aria-labelledby"] === "string";
    if (!hasLabel) {
      console.warn(
        "TabsList should have an aria-label or aria-labelledby to describe the tab list."
      );
    }
  }

  useLayoutEffect(() => {
    const list = internalRef.current;
    if (!list) return;
    const hide = () => list.style.setProperty("--tabs-indicator-opacity", "0");
    if (!ctx.value) return hide();
    const active = ctx.triggerRefs.current.get(ctx.value);
    if (!active) return hide();
    list.style.setProperty("--tabs-indicator-x", `${active.offsetLeft}px`);
    list.style.setProperty("--tabs-indicator-width", `${active.offsetWidth}px`);
    list.style.setProperty("--tabs-indicator-opacity", "1");

    const reducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    try {
      active.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "nearest",
        inline: "nearest",
      });
    } catch {
      // ignore — JSDOM doesn't implement scrollIntoView.
    }
    // ctx.triggerRefs is a stable ref object — intentionally omitted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const list = internalRef.current;
      if (!list) return;
      const values = collectOrderedValues(list);
      if (values.length === 0) return;

      const enabledValues = values.filter((v) => isTriggerEnabled(list, v));
      if (enabledValues.length === 0) return;

      const active = document.activeElement as HTMLElement | null;
      const focused = active?.getAttribute("data-value") ?? ctx.value ?? enabledValues[0];
      const focusedIdx = enabledValues.indexOf(focused);
      const cur = focusedIdx === -1 ? 0 : focusedIdx;

      let nextIdx: number | null = null;
      if (e.key === "ArrowRight") nextIdx = (cur + 1) % enabledValues.length;
      else if (e.key === "ArrowLeft")
        nextIdx = (cur - 1 + enabledValues.length) % enabledValues.length;
      else if (e.key === "Home") nextIdx = 0;
      else if (e.key === "End") nextIdx = enabledValues.length - 1;

      if (nextIdx === null) {
        onKeyDown?.(e);
        return;
      }

      e.preventDefault();
      const nextValue = enabledValues[nextIdx];
      const nextEl = ctx.triggerRefs.current.get(nextValue);
      if (nextEl) nextEl.focus();
      if (ctx.activationMode === "automatic") ctx.setValue(nextValue);
      onKeyDown?.(e);
    },
    [ctx, onKeyDown]
  );

  return (
    <div
      ref={setRef}
      role="tablist"
      aria-orientation="horizontal"
      onKeyDown={handleKeyDown}
      {...rest}
      className={cx(styles.tabs_list, className)}
    >
      {children}
    </div>
  );
});

TabsList.displayName = "TabsList";

export { TabsList };
