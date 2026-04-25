"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type ElementType,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import cx from "classnames";
import { useTabsContext } from "./context";
import styles from "./Tabs.module.scss";

export type TabsTriggerProps = {
  value: string;
  disabled?: boolean;
  as?: ElementType;
  className?: string;
  children?: ReactNode;
} & Omit<
  HTMLAttributes<HTMLElement>,
  "role" | "aria-selected" | "aria-controls" | "id" | "tabIndex" | "children" | "className"
>;

const TabsTrigger = forwardRef<HTMLElement, TabsTriggerProps>(function TabsTrigger(
  { value, disabled = false, as, className, children, onClick, onKeyDown, ...rest },
  forwardedRef
) {
  const ctx = useTabsContext();
  const localRef = useRef<HTMLElement | null>(null);

  const setRef = (el: HTMLElement | null) => {
    localRef.current = el;
    ctx.registerTrigger(value, el);
    if (typeof forwardedRef === "function") forwardedRef(el);
    else if (forwardedRef)
      (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = el;
  };

  useEffect(() => {
    return () => ctx.registerTrigger(value, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const isActive = ctx.value === value;
  const triggerId = `${ctx.baseId}-trigger-${value}`;
  const panelId = `${ctx.baseId}-panel-${value}`;

  const handleClick = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      if (disabled) return;
      ctx.setValue(value);
      onClick?.(e as unknown as MouseEvent<HTMLElement>);
    },
    [disabled, ctx, value, onClick]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (ctx.value !== value) ctx.setValue(value);
      }
      onKeyDown?.(e);
    },
    [disabled, ctx, value, onKeyDown]
  );

  const Component = (as ?? "button") as ElementType;
  const isNativeButton = Component === "button";

  return (
    <Component
      ref={setRef}
      role="tab"
      id={triggerId}
      aria-selected={isActive}
      aria-controls={panelId}
      aria-disabled={disabled || undefined}
      tabIndex={isActive ? 0 : -1}
      {...(isNativeButton ? { type: "button" } : null)}
      {...rest}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-value={value}
      className={cx(styles.tabs_trigger, className)}
    >
      {children}
    </Component>
  );
});

TabsTrigger.displayName = "TabsTrigger";

export { TabsTrigger };
