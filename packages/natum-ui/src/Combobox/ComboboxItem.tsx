"use client";

import { useContext, type ReactNode } from "react";
import { ComboboxContext } from "./context";

type ComboboxItemBaseProps = {
  value: string;
  disabled?: boolean;
  children: ReactNode;
  /** Used for filter/display when children is not a plain string. */
  textValue?: string;
  className?: string;
};

export type ComboboxItemProps = ComboboxItemBaseProps;

/**
 * Marker component consumed by `Combobox`'s children walker. Renders nothing
 * on its own. When used outside a `Combobox`, emits a dev-only warning.
 */
export function ComboboxItem(): null {
  const ctx = useContext(ComboboxContext);
  if (import.meta.env.DEV && ctx === null) {
    console.warn(
      "[Combobox] ComboboxItem rendered outside a <Combobox>. It will not appear."
    );
  }
  return null;
}

ComboboxItem.displayName = "ComboboxItem";
