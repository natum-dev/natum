/// <reference types="vite/client" />
import {
  Children,
  Fragment,
  isValidElement,
  type ComponentType,
  type ReactNode,
} from "react";
import type { FlatItem, TreeNode } from "./types";

export type FlattenOptions = {
  /** Marker component — e.g. SelectItem or ComboboxItem. */
  itemMarker: ComponentType<unknown>;
  /** Marker component — e.g. SelectGroup or ComboboxGroup. */
  groupMarker: ComponentType<unknown>;
  /** Used only to prefix dev warnings, e.g. "Select" or "Combobox". */
  debugName: string;
};

type ItemLikeProps = {
  value: string;
  disabled?: boolean;
  children?: ReactNode;
  textValue?: string;
  className?: string;
};

function deriveTextValue(
  children: ReactNode,
  textValueProp: string | undefined
): string {
  if (typeof children === "string") return children.toLowerCase();
  if (typeof textValueProp === "string" && textValueProp.length > 0) {
    return textValueProp.toLowerCase();
  }
  return "";
}

type WalkerState = {
  items: FlatItem[];
  nextIndex: number;
};

function makeFlatItemFromNode(
  child: React.ReactElement,
  state: WalkerState
): FlatItem {
  const props = child.props as ItemLikeProps;
  const item: FlatItem = {
    index: state.nextIndex,
    value: props.value,
    disabled: props.disabled ?? false,
    textValue: deriveTextValue(props.children, props.textValue),
    children: props.children,
    className: props.className,
  };
  state.nextIndex += 1;
  state.items.push(item);
  return item;
}

export function flattenListboxChildren(
  children: ReactNode,
  options: FlattenOptions
): { items: FlatItem[]; tree: TreeNode[] } {
  const { itemMarker, groupMarker, debugName } = options;
  const state: WalkerState = { items: [], nextIndex: 0 };
  const tree: TreeNode[] = [];

  function walkGroupChildren(groupChildren: ReactNode): FlatItem[] {
    const groupItems: FlatItem[] = [];
    Children.forEach(groupChildren, (grand) => {
      if (grand == null || grand === false) return;
      if (isValidElement(grand) && grand.type === Fragment) {
        const inner = (grand.props as { children?: ReactNode }).children;
        const innerItems = walkGroupChildren(inner);
        groupItems.push(...innerItems);
        return;
      }
      if (isValidElement(grand) && grand.type === itemMarker) {
        const item = makeFlatItemFromNode(grand, state);
        groupItems.push(item);
        return;
      }
      if (isValidElement(grand) && grand.type === groupMarker) {
        if (import.meta.env.DEV) {
          console.warn(
            `[${debugName}] nested ${groupMarker.displayName ?? "Group"} is not supported; flattening its items into the outer group.`
          );
        }
        const innerChildren = (grand.props as { children?: ReactNode }).children;
        const innerItems = walkGroupChildren(innerChildren);
        groupItems.push(...innerItems);
        return;
      }
      if (import.meta.env.DEV) {
        console.warn(
          `[${debugName}] ${groupMarker.displayName ?? "Group"} only accepts ${itemMarker.displayName ?? "Item"} children; other children are ignored.`
        );
      }
    });
    return groupItems;
  }

  function walkTop(node: ReactNode) {
    Children.forEach(node, (child) => {
      if (child == null || child === false) return;
      if (isValidElement(child) && child.type === Fragment) {
        walkTop((child.props as { children?: ReactNode }).children);
        return;
      }
      if (isValidElement(child) && child.type === itemMarker) {
        const item = makeFlatItemFromNode(child, state);
        tree.push({ kind: "item", item });
        return;
      }
      if (isValidElement(child) && child.type === groupMarker) {
        const label = (child.props as { label?: ReactNode }).label;
        const groupChildren = (child.props as { children?: ReactNode }).children;
        const groupItems = walkGroupChildren(groupChildren);
        tree.push({ kind: "group", label, items: groupItems });
        return;
      }
      if (import.meta.env.DEV) {
        console.warn(
          `[${debugName}] only ${itemMarker.displayName ?? "Item"} or ${groupMarker.displayName ?? "Group"} are valid top-level children; other children are ignored.`
        );
      }
    });
  }

  walkTop(children);

  return { items: state.items, tree };
}
