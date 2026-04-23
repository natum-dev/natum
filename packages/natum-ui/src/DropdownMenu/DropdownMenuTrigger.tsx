"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  type MouseEvent,
  type ReactElement,
} from "react";
import { useDropdownMenuContext } from "./context";
import { mergeRefs } from "../hooks/use-merge-refs";

export type DropdownMenuTriggerProps = {
  children: ReactElement;
  disabled?: boolean;
};

export const DropdownMenuTrigger = ({
  children,
  disabled = false,
}: DropdownMenuTriggerProps) => {
  const { open, setOpen, triggerRef, triggerId, contentId } =
    useDropdownMenuContext();

  const toggle = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  if (!isValidElement(children)) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error(
        "<DropdownMenuTrigger> expects exactly one React element as children."
      );
    }
    return null;
  }

  try {
    Children.only(children);
  } catch {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error(
        "<DropdownMenuTrigger> expects exactly one React element as children."
      );
    }
    return null;
  }

  const childProps = children.props as Record<string, unknown>;
  const childRef = (children as unknown as { ref?: React.Ref<HTMLElement> }).ref;

  const consumerOnClick = childProps.onClick as
    | ((e: MouseEvent<HTMLElement>) => void)
    | undefined;

  const composedOnClick = disabled
    ? undefined
    : (e: MouseEvent<HTMLElement>) => {
        consumerOnClick?.(e);
        if (!e.defaultPrevented) toggle();
      };

  const isButton =
    (children.type as unknown as string) === "button" ||
    (typeof children.type !== "string" &&
      (children.type as { displayName?: string }).displayName === "IconButton");

  const cloned = cloneElement(children, {
    ...childProps,
    ref: mergeRefs(childRef, (node: HTMLElement | null) => {
      triggerRef.current = node;
    }),
    onClick: composedOnClick,
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": contentId,
    id: triggerId,
    ...(disabled
      ? isButton
        ? { disabled: true }
        : { "aria-disabled": true }
      : {}),
  } as Record<string, unknown>);

  return cloned;
};

DropdownMenuTrigger.displayName = "DropdownMenuTrigger";
