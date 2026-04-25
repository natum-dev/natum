"use client";

import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { createPortal } from "react-dom";
import { IconCheck } from "@natum/icons";
import { Spinner } from "../../Spinner";
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
  onItemSelect: (value: string, event?: SyntheticEvent) => void;
  placement: "top" | "bottom";
  maxHeight: number;
  labelId: string;
  listboxId: string;
  itemId: (index: number) => string;
  className?: string;

  // --- New in Batch E. Optional; Select passes none. ---
  /** When true, listbox renders a spinner + "Loading…" row and hides items. */
  loading?: boolean;
  /** When non-nullish, listbox renders an error row with this content. */
  error?: ReactNode;
  /** Custom content when items.length === 0 AND no query. Defaults to "No options". */
  emptyContent?: ReactNode;
  /** Custom content when items.length === 0 AND query is set. Defaults to `No results for "${query}"`. */
  noMatchContent?: ReactNode;
  /** Used to pick between emptyContent and noMatchContent and to interpolate the default. */
  query?: string;
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
      loading,
      error,
      emptyContent,
      noMatchContent,
      query,
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
          onClick={(e) => {
            if (!item.disabled) onItemSelect(item.value, e);
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
          <div id={headerId} role="presentation" className={styles.group_label}>
            {node.label}
          </div>
          <ul role="presentation" className={styles.group_items}>
            {node.items.map(renderItem)}
          </ul>
        </li>
      );
    };

    // --- Decide what to render inside the <ul>. State precedence (highest wins):
    //   1. loading
    //   2. error
    //   3. items.length === 0 AND query → no-match
    //   4. items.length === 0 AND !query → empty
    //   5. default → tree
    let body: ReactNode;
    if (loading) {
      body = (
        <li className={styles.state_loading}>
          <Spinner size="sm" color="currentColor" />
          <span>Loading…</span>
        </li>
      );
    } else if (error != null) {
      body = (
        <li className={styles.state_error} role="alert">
          {error}
        </li>
      );
    } else if (items.length === 0 && query) {
      body = (
        <li className={styles.empty}>
          {noMatchContent ?? `No results for "${query}"`}
        </li>
      );
    } else if (items.length === 0) {
      body = <li className={styles.empty}>{emptyContent ?? "No options"}</li>;
    } else {
      body = tree.map((node, i) =>
        node.kind === "item" ? renderItem(node.item) : renderGroup(node, i)
      );
    }

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
        {body}
      </ul>,
      document.body
    );
  }
);

Listbox.displayName = "Listbox";
