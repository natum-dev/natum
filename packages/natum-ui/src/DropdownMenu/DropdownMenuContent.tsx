"use client";

import {
  forwardRef,
  useLayoutEffect,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useDropdownMenuContext } from "./context";
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
      align: _align = "start",
      sideOffset: _sideOffset = 4,
      loop: _loop = true,
      onEscapeKeyDown: _onEscapeKeyDown,
      onInteractOutside: _onInteractOutside,
      className,
      children,
      ...rest
    },
    ref
  ) => {
    void _align;
    void _sideOffset;
    void _loop;
    void _onEscapeKeyDown;
    void _onInteractOutside;

    const { open, contentRef, triggerId, contentId, focusTargetOnOpen } =
      useDropdownMenuContext();
    const mergedRef = useMergedRefs(ref, contentRef);

    const { state, shouldRender } = useAnimationState({
      isOpen: open,
      enterDuration: ENTER_DURATION,
      exitDuration: EXIT_DURATION,
    });

    // SSR-safety: only portal after mount.
    const [mounted, setMounted] = useState(false);
    useLayoutEffect(() => {
      setMounted(true);
    }, []);

    // Focus menu root on open (unless Trigger requested a specific item).
    // shouldRender is included so this re-runs after the portal div mounts
    // (useAnimationState sets state synchronously in a layout effect, which
    // means contentRef.current is null on the first layout-effect pass with
    // open=true; it becomes valid only after shouldRender flips to true).
    useLayoutEffect(() => {
      if (!open) return;
      if (!shouldRender) return;
      if (focusTargetOnOpen !== null) return;
      const node = contentRef.current;
      if (node) node.focus();
    }, [open, shouldRender, focusTargetOnOpen, contentRef]);

    if (!mounted) return null;
    if (!shouldRender) return null;

    return createPortal(
      <div
        ref={mergedRef}
        {...rest}
        role="menu"
        tabIndex={-1}
        id={contentId}
        aria-labelledby={triggerId}
        data-state={state}
        className={cx(styles.dropdown_menu_content, className)}
      >
        {children}
      </div>,
      document.body
    );
  }
);

DropdownMenuContent.displayName = "DropdownMenuContent";
