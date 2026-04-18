/// <reference types="vite/client" />
import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { SelectItem } from "./SelectItem";
import { SelectGroup } from "./SelectGroup";
import type { FlatItem, TreeNode } from "./types";

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
  const props = child.props as import("./SelectItem").SelectItemProps;
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

function walkGroupChildren(
  groupChildren: ReactNode,
  state: WalkerState
): FlatItem[] {
  const groupItems: FlatItem[] = [];
  Children.forEach(groupChildren, (grand) => {
    if (grand == null || grand === false) return;
    if (isValidElement(grand) && grand.type === Fragment) {
      const inner = (grand.props as { children?: ReactNode }).children;
      const innerItems = walkGroupChildren(inner, state);
      groupItems.push(...innerItems);
      return;
    }
    if (isValidElement(grand) && grand.type === SelectItem) {
      const item = makeFlatItemFromNode(grand, state);
      groupItems.push(item);
      return;
    }
    if (isValidElement(grand) && grand.type === SelectGroup) {
      if (import.meta.env.DEV) {
        console.warn(
          "[Select] nested SelectGroup is not supported; flattening its items into the outer group."
        );
      }
      const innerChildren = (grand.props as { children?: ReactNode }).children;
      const innerItems = walkGroupChildren(innerChildren, state);
      groupItems.push(...innerItems);
      return;
    }
    if (import.meta.env.DEV) {
      console.warn(
        "[Select] SelectGroup only accepts SelectItem children; other children are ignored."
      );
    }
  });
  return groupItems;
}

export function flatten(children: ReactNode): {
  items: FlatItem[];
  tree: TreeNode[];
} {
  const state: WalkerState = { items: [], nextIndex: 0 };
  const tree: TreeNode[] = [];

  function walkTop(node: ReactNode) {
    Children.forEach(node, (child) => {
      if (child == null || child === false) return;
      if (isValidElement(child) && child.type === Fragment) {
        walkTop((child.props as { children?: ReactNode }).children);
        return;
      }
      if (isValidElement(child) && child.type === SelectItem) {
        const item = makeFlatItemFromNode(child, state);
        tree.push({ kind: "item", item });
        return;
      }
      if (isValidElement(child) && child.type === SelectGroup) {
        const label = (child.props as import("./SelectGroup").SelectGroupProps)
          .label;
        const groupChildren = (child.props as { children?: ReactNode }).children;
        const groupItems = walkGroupChildren(groupChildren, state);
        tree.push({ kind: "group", label, items: groupItems });
        return;
      }
      if (import.meta.env.DEV) {
        console.warn(
          "[Select] only SelectItem or SelectGroup are valid top-level children; other children are ignored."
        );
      }
    });
  }

  walkTop(children);

  return { items: state.items, tree };
}
