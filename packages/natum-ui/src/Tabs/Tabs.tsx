"use client";

import {
  forwardRef,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import cx from "classnames";
import { useControllable } from "../hooks/use-controllable";
import {
  TabsContext,
  type TabsActivationMode,
  type TabsContextValue,
  type TabsSize,
  type TabsVariant,
} from "./context";
import styles from "./Tabs.module.scss";

export type TabsProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: TabsVariant;
  size?: TabsSize;
  activationMode?: TabsActivationMode;
  className?: string;
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "children" | "className">;

const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    value,
    defaultValue,
    onValueChange,
    variant = "underline",
    size = "md",
    activationMode = "automatic",
    className,
    children,
    ...rest
  },
  ref
) {
  const baseId = useId();

  const { value: current, setValue: setControllable } = useControllable<string>({
    value,
    defaultValue,
    onChange: (next) => {
      if (typeof next === "string") onValueChange?.(next);
    },
  });

  const setValue = useCallback(
    (next: string) => setControllable(next),
    [setControllable]
  );

  const triggerRefs = useRef<Map<string, HTMLElement>>(new Map());
  const registerTrigger = useCallback(
    (val: string, el: HTMLElement | null) => {
      if (el) triggerRefs.current.set(val, el);
      else triggerRefs.current.delete(val);
    },
    []
  );

  const [mountedPanels, setMountedPanels] = useState<Set<string>>(() => new Set());
  const markPanelMounted = useCallback((val: string) => {
    setMountedPanels((prev) => {
      if (prev.has(val)) return prev;
      const next = new Set(prev);
      next.add(val);
      return next;
    });
  }, []);

  const [measureTick, setMeasureTick] = useState(0);
  const bumpMeasureTick = useCallback(() => {
    setMeasureTick((t) => t + 1);
  }, []);

  const ctx = useMemo<TabsContextValue>(
    () => ({
      value: current,
      setValue,
      variant,
      size,
      activationMode,
      baseId,
      triggerRefs,
      registerTrigger,
      mountedPanels,
      markPanelMounted,
      bumpMeasureTick,
      measureTick,
    }),
    [
      current,
      setValue,
      variant,
      size,
      activationMode,
      baseId,
      registerTrigger,
      mountedPanels,
      markPanelMounted,
      bumpMeasureTick,
      measureTick,
    ]
  );

  return (
    <TabsContext.Provider value={ctx}>
      <div
        ref={ref}
        {...rest}
        className={cx(styles.tabs, className)}
        data-variant={variant}
        data-size={size}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
});

Tabs.displayName = "Tabs";

export { Tabs };
