"use client";

import { useContext, type ReactNode } from "react";
import { SelectContext } from "./context";

type SelectGroupBaseProps = {
  label: ReactNode;
  children: ReactNode;
  className?: string;
};

export type SelectGroupProps = SelectGroupBaseProps;

/**
 * Marker component consumed by `Select`'s children walker. Renders nothing
 * on its own. When used outside a `Select`, emits a dev-only warning.
 */
export function SelectGroup(): null {
  const ctx = useContext(SelectContext);
  if (import.meta.env.DEV && ctx === null) {
    console.warn(
      "[Select] SelectGroup rendered outside a <Select>. It will not appear."
    );
  }
  return null;
}

SelectGroup.displayName = "SelectGroup";
