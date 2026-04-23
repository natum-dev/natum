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
    void loop;
    void onEscapeKeyDown;
    void onInteractOutside;

    const { open, contentRef, triggerRef, triggerId, contentId, focusTargetOnOpen } =
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

    // Focus menu root on open (unless Trigger requested a specific item).
    useLayoutEffect(() => {
      if (!open) return;
      if (focusTargetOnOpen !== null) return;
      const node = contentRef.current;
      if (node) node.focus();
    }, [open, focusTargetOnOpen, contentRef, shouldRender]);

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
        className={cx(styles.dropdown_menu_content, className)}
      >
        {children}
      </div>,
      document.body
    );
  }
);

DropdownMenuContent.displayName = "DropdownMenuContent";
