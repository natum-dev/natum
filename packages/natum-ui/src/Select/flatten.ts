import type { ReactNode } from "react";
import { flattenListboxChildren } from "../internal/listbox/flatten";
import { SelectItem } from "./SelectItem";
import { SelectGroup } from "./SelectGroup";

export function flatten(children: ReactNode) {
  return flattenListboxChildren(children, {
    itemMarker: SelectItem as React.ComponentType<unknown>,
    groupMarker: SelectGroup as React.ComponentType<unknown>,
    debugName: "Select",
  });
}
