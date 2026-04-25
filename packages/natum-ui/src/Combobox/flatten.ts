import type { ReactNode } from "react";
import { flattenListboxChildren } from "../internal/listbox/flatten";
import { ComboboxItem } from "./ComboboxItem";
import { ComboboxGroup } from "./ComboboxGroup";

export function flatten(children: ReactNode) {
  return flattenListboxChildren(children, {
    itemMarker: ComboboxItem as React.ComponentType<unknown>,
    groupMarker: ComboboxGroup as React.ComponentType<unknown>,
    debugName: "Combobox",
  });
}
