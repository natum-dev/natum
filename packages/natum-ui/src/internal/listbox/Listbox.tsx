"use client";

import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { IconCheck } from "@natum/icons";
import { useAnchorPosition } from "../../hooks/use-anchor-position";
import { useAnimationState } from "../../hooks/use-animation-state";
import { useMergedRefs } from "../../hooks/use-merge-refs";
import type { FlatItem, TreeNode } from "./types";
import styles from "./Listbox.module.scss";
import cx from "classnames";

const EXIT_DURATION = 125;

export type ListboxProps = {
  isOpen: boolean;
  triggerRef: React.RefObject<HTMLElement | null>;
  tree: TreeNode[];
  items: FlatItem[];
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  isSelected: (v: string) => boolean;
  isMulti: boolean;
  onItemSelect: (value: string) => void;
  placement: "top" | "bottom";
  maxHeight: number;
  /** The id of the trigger (used as aria-labelledby for the listbox). */
  labelId: string;
  listboxId: string;
  itemId: (index: number) => string;
  className?: string;
};

export const Listbox = forwardRef<HTMLUListElement, ListboxProps>(
  (
    {
      isOpen,
      triggerRef,
      tree,
      items,
      activeIndex,
      setActiveIndex,
      isSelected,
      isMulti,
      onItemSelect,
      placement,
      maxHeight,
      labelId,
      listboxId,
      itemId,
      className,
    },
    ref
  ) => {
    const [mounted, setMounted] = useState(false);
    const listboxRef = useRef<HTMLUListElement>(null);
    const mergedRef = useMergedRefs(ref, listboxRef);
    const [triggerWidth, setTriggerWidth] = useState<number | null>(null);

    const { state, shouldRender } = useAnimationState({
      isOpen,
      enterDuration: 0,
      exitDuration: EXIT_DURATION,
    });

    const { styles: positionStyles, actualPlacement } = useAnchorPosition({
      anchorRef: triggerRef,
      floatingRef: listboxRef,
      placement,
      offset: 4,
      isOpen: shouldRender,
    });

    useEffect(() => {
      setMounted(true);
    }, []);

    // Measure trigger width on open and on resize.
    useLayoutEffect(() => {
      if (!shouldRender) return;
      const measure = () => {
        const w = triggerRef.current?.offsetWidth;
        if (typeof w === "number") setTriggerWidth(w);
      };
      measure();
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }, [shouldRender, triggerRef]);

    if (!mounted || !shouldRender) return null;

    const isExiting = state === "exiting";
    const isEmpty = items.length === 0;

    const renderItem = (item: FlatItem) => {
      const active = activeIndex === item.index;
      const selected = isSelected(item.value);
      return (
        <li
          key={item.index}
          id={itemId(item.index)}
          role="option"
          aria-selected={selected}
          aria-disabled={item.disabled || undefined}
          className={cx(
            styles.item,
            {
              [styles.item_active]: active,
              [styles.item_selected]: selected,
              [styles.item_disabled]: item.disabled,
            },
            item.className
          )}
          onMouseEnter={() => {
            if (!item.disabled) setActiveIndex(item.index);
          }}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (!item.disabled) onItemSelect(item.value);
          }}
        >
          {isMulti && (
            <span className={styles.item_checkbox} aria-hidden="true" />
          )}
          <span className={styles.item_label}>{item.children}</span>
          {!isMulti && selected && (
            <IconCheck
              size="sm"
              color="currentColor"
              className={styles.item_check}
            />
          )}
        </li>
      );
    };

    const renderGroup = (node: Extract<TreeNode, { kind: "group" }>, i: number) => {
      const headerId = `${listboxId}-group-${i}`;
      return (
        <li
          key={`group-${i}`}
          role="group"
          aria-labelledby={headerId}
          className={styles.group}
        >
          <div
            id={headerId}
            role="presentation"
            className={styles.group_label}
          >
            {node.label}
          </div>
          <ul role="presentation" className={styles.group_items}>
            {node.items.map(renderItem)}
          </ul>
        </li>
      );
    };

    return createPortal(
      <ul
        ref={mergedRef}
        id={listboxId}
        role="listbox"
        aria-multiselectable={isMulti || undefined}
        aria-labelledby={labelId}
        data-placement={actualPlacement}
        className={cx(
          styles.listbox,
          {
            [styles.listbox_entering]: isOpen && !isExiting,
            [styles.listbox_exiting]: isExiting,
          },
          className
        )}
        style={{
          ...positionStyles,
          width: triggerWidth ?? undefined,
          maxHeight,
        }}
        onMouseDown={(e) => e.preventDefault()}
      >
        {isEmpty ? (
          <li className={styles.empty}>No options</li>
        ) : (
          tree.map((node, i) =>
            node.kind === "item"
              ? renderItem(node.item)
              : renderGroup(node, i)
          )
        )}
      </ul>,
      document.body
    );
  }
);

Listbox.displayName = "Listbox";
