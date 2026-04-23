"use client";

import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  DropdownMenuContext,
  type DropdownMenuContextValue,
  type DropdownMenuSetOpenOptions,
} from "./context";
import { useControllable } from "../hooks/use-controllable";

export type DropdownMenuProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  children?: ReactNode;
};

export const DropdownMenu = ({
  open: openProp,
  defaultOpen,
  onOpenChange,
  modal = true,
  children,
}: DropdownMenuProps) => {
  const { value: openValue, setValue } = useControllable<boolean>({
    value: openProp,
    defaultValue: defaultOpen ?? false,
    onChange: (next) => onOpenChange?.(next ?? false),
  });
  const open = openValue ?? false;

  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const autoId = useId();
  const triggerId = `${autoId}-trigger`;
  const contentId = `${autoId}-content`;

  const [focusTargetOnOpen, setFocusTargetOnOpen] =
    useState<"first" | "last" | null>(null);
  const pendingReturnFocusRef = useRef<boolean>(false);

  const setOpen = useCallback(
    (next: boolean, opts?: DropdownMenuSetOpenOptions) => {
      if (next) {
        setFocusTargetOnOpen(opts?.focusTarget ?? null);
      } else {
        pendingReturnFocusRef.current = opts?.returnFocus ?? false;
      }
      setValue(next);
    },
    [setValue]
  );

  const clearFocusTarget = useCallback(() => setFocusTargetOnOpen(null), []);

  const ctxValue = useMemo<DropdownMenuContextValue>(
    () => ({
      open,
      setOpen,
      triggerRef,
      contentRef,
      triggerId,
      contentId,
      modal,
      focusTargetOnOpen,
      clearFocusTarget,
      pendingReturnFocusRef,
    }),
    [
      open,
      setOpen,
      triggerId,
      contentId,
      modal,
      focusTargetOnOpen,
      clearFocusTarget,
    ]
  );

  return (
    <DropdownMenuContext.Provider value={ctxValue}>
      {children}
    </DropdownMenuContext.Provider>
  );
};

DropdownMenu.displayName = "DropdownMenu";
