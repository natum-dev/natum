"use client";

import {
  forwardRef,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useDropdownMenuContext } from "./context";
import { useAnchorPosition } from "../hooks/use-anchor-position";
import { useAnimationState } from "../hooks/use-animation-state";
import { useMergedRefs } from "../hooks/use-merge-refs";
import { useTypeahead } from "../hooks/use-typeahead";
import styles from "./DropdownMenu.module.scss";
import cx from "classnames";

export type DropdownMenuContentProps = {
  align?: "start" | "center" | "end";
  sideOffset?: number;
  loop?: boolean;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onInteractOutside?: (event: PointerEvent | FocusEvent) => void;
  className?: string;
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, "role" | "children">;

const ENTER_DURATION = 120;
const EXIT_DURATION = 80;

export const DropdownMenuContent = forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(
  (
    {
      align = "start",
      sideOffset = 4,
      loop = true,
      onEscapeKeyDown,
      onInteractOutside,
      className,
      children,
      ...rest
    },
    ref
  ) => {
    void onEscapeKeyDown;
    void onInteractOutside;

    const { open, contentRef, triggerRef, triggerId, contentId, focusTargetOnOpen, clearFocusTarget } =
      useDropdownMenuContext();

    const localRef = useRef<HTMLDivElement>(null);
    const mergedRef = useMergedRefs(ref, contentRef, localRef);

    const { state, shouldRender } = useAnimationState({
      isOpen: open,
      enterDuration: ENTER_DURATION,
      exitDuration: EXIT_DURATION,
    });

    const { styles: anchorStyles, actualPlacement } = useAnchorPosition({
      anchorRef: triggerRef,
      floatingRef: localRef,
      placement: "bottom",
      offset: sideOffset,
      isOpen: open,
    });

    // SSR-safety: only portal after mount.
    const [mounted, setMounted] = useState(false);
    useLayoutEffect(() => {
      setMounted(true);
    }, []);

    // Align override — useAnchorPosition centers horizontally; we re-align.
    // We also compute top here so that the value is available synchronously
    // in the same layout-effect pass (useAnchorPosition uses useEffect which
    // fires after paint and won't have run when localRef first becomes valid).
    const [alignedPos, setAlignedPos] = useState<{ left: number; top: number } | null>(null);

    useLayoutEffect(() => {
      if (!open) return;
      const trigger = triggerRef.current;
      const content = localRef.current;
      if (!trigger || !content) return;

      const updateAlign = () => {
        const t = trigger.getBoundingClientRect();
        const c = content.getBoundingClientRect();
        let left: number;
        if (align === "start") left = t.left;
        else if (align === "end") left = t.right - c.width;
        else left = t.left + (t.width - c.width) / 2;
        // Clamp to viewport with 8px padding.
        left = Math.max(8, Math.min(left, window.innerWidth - c.width - 8));
        const top = t.bottom + sideOffset;
        setAlignedPos({ left, top });
      };

      updateAlign();
      window.addEventListener("scroll", updateAlign, { passive: true });
      window.addEventListener("resize", updateAlign, { passive: true });
      return () => {
        window.removeEventListener("scroll", updateAlign);
        window.removeEventListener("resize", updateAlign);
      };
    }, [open, align, sideOffset, triggerRef, shouldRender, mounted]);

    const combinedStyles = useMemo(
      () => ({
        ...anchorStyles,
        ...(alignedPos !== null
          ? { left: alignedPos.left, top: alignedPos.top }
          : {}),
      }),
      [anchorStyles, alignedPos]
    );

    // --- Item discovery + navigation helpers ---
    const getItemElements = (): HTMLElement[] => {
      const content = localRef.current;
      if (!content) return [];
      return Array.from(
        content.querySelectorAll<HTMLElement>(
          '[data-dropdown-menu-item]:not([aria-disabled="true"])'
        )
      );
    };

    const focusItemAt = (index: number) => {
      const items = getItemElements();
      if (items.length === 0) return;
      let i = index;
      if (loop) {
        i = ((i % items.length) + items.length) % items.length;
      } else {
        i = Math.max(0, Math.min(i, items.length - 1));
      }
      items[i]?.focus();
    };

    const focusFirst = () => focusItemAt(0);
    const focusLast = () => focusItemAt(-1);

    // Typeahead — items list rebuilt via ref at each keystroke.
    const typeaheadItemsRef = useRef<HTMLElement[]>([]);
    typeaheadItemsRef.current = getItemElements();

    const { onKeyDown: typeaheadOnKeyDown } = useTypeahead<HTMLElement>({
      items: typeaheadItemsRef.current,
      getKey: (el) =>
        (el.dataset.textValue ?? el.textContent?.trim() ?? "").toLowerCase(),
      onMatch: (index) => typeaheadItemsRef.current[index]?.focus(),
    });

    // Consume focusTargetOnOpen after entering → entered transition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useLayoutEffect(() => {
      if (!open || state === "exited" || state === "exiting") return;
      if (focusTargetOnOpen === "first") {
        const id = requestAnimationFrame(() => {
          focusFirst();
          clearFocusTarget();
        });
        return () => cancelAnimationFrame(id);
      }
      if (focusTargetOnOpen === "last") {
        const id = requestAnimationFrame(() => {
          focusLast();
          clearFocusTarget();
        });
        return () => cancelAnimationFrame(id);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, state, focusTargetOnOpen]);

    // Focus menu root on open (unless Trigger requested a specific item).
    // Use a ref snapshot so clearFocusTarget() firing after item-focus does not
    // re-trigger this effect and steal focus back from the focused item.
    const focusTargetOnOpenRef = useRef<"first" | "last" | null>(null);
    focusTargetOnOpenRef.current = focusTargetOnOpen;
    useLayoutEffect(() => {
      if (!open) return;
      if (focusTargetOnOpenRef.current !== null) return;
      const node = contentRef.current;
      if (node) node.focus();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, shouldRender]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      const items = getItemElements();
      const active = document.activeElement as HTMLElement | null;
      const currentIndex = active ? items.indexOf(active) : -1;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        focusItemAt(currentIndex + 1);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (currentIndex === -1) focusLast();
        else focusItemAt(currentIndex - 1);
        return;
      }
      if (event.key === "Home") {
        event.preventDefault();
        focusFirst();
        return;
      }
      if (event.key === "End") {
        event.preventDefault();
        focusLast();
        return;
      }
      // Delegate printable chars to typeahead (Enter/Space/Arrows filtered by hook).
      typeaheadOnKeyDown(event);
    };

    if (!mounted) return null;
    if (!shouldRender) return null;

    const { style: consumerStyle, ...restWithoutStyle } = rest as HTMLAttributes<HTMLDivElement>;

    return createPortal(
      <div
        ref={mergedRef}
        {...restWithoutStyle}
        role="menu"
        tabIndex={-1}
        id={contentId}
        aria-labelledby={triggerId}
        data-state={state}
        data-placement={actualPlacement}
        style={{ ...combinedStyles, ...consumerStyle }}
        onKeyDown={handleKeyDown}
        className={cx(styles.dropdown_menu_content, className)}
      >
        {children}
      </div>,
      document.body
    );
  }
);

DropdownMenuContent.displayName = "DropdownMenuContent";
