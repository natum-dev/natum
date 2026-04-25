"use client";

import { useContext, type ReactNode } from "react";
import { SelectContext } from "./context";

type SelectItemBaseProps = {
  value: string;
  disabled?: boolean;
  children: ReactNode;
  textValue?: string;
  className?: string;
};

export type SelectItemProps = SelectItemBaseProps;

/**
 * Marker component consumed by `Select`'s children walker. Renders nothing
 * on its own. When used outside a `Select`, emits a dev-only warning.
 */
export function SelectItem(): null {
  const ctx = useContext(SelectContext);
  if (import.meta.env.DEV && ctx === null) {
    console.warn(
      "[Select] SelectItem rendered outside a <Select>. It will not appear."
    );
  }
  return null;
}

SelectItem.displayName = "SelectItem";
