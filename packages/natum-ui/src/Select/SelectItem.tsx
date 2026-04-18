import type { ReactNode } from "react";

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
 * on its own. Full interactive rendering lives in `Select` → `Listbox`.
 */
export function SelectItem(): null {
  return null;
}

SelectItem.displayName = "SelectItem";
