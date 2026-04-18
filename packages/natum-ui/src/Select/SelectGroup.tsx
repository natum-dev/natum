import type { ReactNode } from "react";

type SelectGroupBaseProps = {
  label: ReactNode;
  children: ReactNode;
  className?: string;
};

export type SelectGroupProps = SelectGroupBaseProps;

/**
 * Marker component consumed by `Select`'s children walker. Renders nothing
 * on its own. Full grouped rendering lives in `Select` → `Listbox`.
 */
export function SelectGroup(): null {
  return null;
}

SelectGroup.displayName = "SelectGroup";
