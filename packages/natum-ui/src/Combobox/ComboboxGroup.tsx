"use client";

import { useContext, type ReactNode } from "react";
import { ComboboxContext } from "./context";

type ComboboxGroupBaseProps = {
  label: ReactNode;
  children: ReactNode;
  className?: string;
};

export type ComboboxGroupProps = ComboboxGroupBaseProps;

/**
 * Marker component consumed by `Combobox`'s children walker. Renders nothing
 * on its own. When used outside a `Combobox`, emits a dev-only warning.
 */
export function ComboboxGroup(): null {
  const ctx = useContext(ComboboxContext);
  if (import.meta.env.DEV && ctx === null) {
    console.warn(
      "[Combobox] ComboboxGroup rendered outside a <Combobox>. It will not appear."
    );
  }
  return null;
}

ComboboxGroup.displayName = "ComboboxGroup";
