/// <reference types="vite/client" />
"use client";

import {
  type ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { IconX } from "@natum/icons";
import { useMergedRefs } from "../hooks/use-merge-refs";
import { useFocusTrap } from "../hooks/use-focus-trap";
import { useScrollLock } from "../hooks/use-scroll-lock";
import { useAnimationState } from "../hooks/use-animation-state";
import styles from "./Modal.module.scss";
import cx from "classnames";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  size?: "sm" | "md" | "lg";
  /**
   * Fires when the user presses Escape while the overlay is open.
   * Call `event.preventDefault()` to keep the overlay open.
   * If not handled (or not prevented), the overlay closes itself.
   */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /**
   * Fires when the user clicks/taps outside the overlay.
   * Call `event.preventDefault()` to keep the overlay open.
   * If not handled (or not prevented), the overlay closes itself.
   */
  onInteractOutside?: (event: PointerEvent | FocusEvent) => void;
  hideCloseButton?: boolean;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

const ENTER_DURATION = 200;
const EXIT_DURATION = 150;

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      onClose,
      title,
      size = "md",
      onEscapeKeyDown,
      onInteractOutside,
      hideCloseButton = false,
      children,
      footer,
      className,
      id: idProp,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
    },
    ref
  ) => {
    const autoId = useId();
    const titleId = idProp ?? `${autoId}-title`;

    const [mounted, setMounted] = useState(false);

    // SSR safety
    useLayoutEffect(() => {
      setMounted(true);
    }, []);

    // Dev-warn when title is a non-string ReactNode without an explicit
    // accessible name. The aria-labelledby fallback still works (the title
    // node renders into a labelled element), but consumers should be intentional.
    // One-shot guard so the warn doesn't fire on every parent re-render.
    const warnedNonStringTitleRef = useRef(false);
    useEffect(() => {
      if (!import.meta.env.DEV) return;
      if (warnedNonStringTitleRef.current) return;
      if (
        title !== undefined &&
        typeof title !== "string" &&
        typeof title !== "number" &&
        !ariaLabel &&
        !ariaLabelledBy
      ) {
        console.warn(
          "Modal: `title` is a non-string ReactNode. Provide `aria-label` or `aria-labelledby` to ensure a stable screen-reader name."
        );
        warnedNonStringTitleRef.current = true;
      }
    }, [title, ariaLabel, ariaLabelledBy]);

    const { state: animationState, shouldRender } = useAnimationState({
      isOpen: open,
      enterDuration: ENTER_DURATION,
      exitDuration: EXIT_DURATION,
    });

    const trapActive = open && animationState !== "exited";

    const handleEscape = useCallback(
      (event: KeyboardEvent) => {
        onEscapeKeyDown?.(event);
        if (!event.defaultPrevented) {
          onClose();
        }
      },
      [onEscapeKeyDown, onClose]
    );

    const { ref: trapRef } = useFocusTrap({
      isActive: trapActive,
      onEscape: handleEscape,
    });

    const mergedRef = useMergedRefs(ref, trapRef);

    useScrollLock({ enabled: open });

    const handleOverlayClick = useCallback(
      (e: React.MouseEvent) => {
        if (e.target !== e.currentTarget) return;
        // Synthesize a cancellable PointerEvent-like object backed by the
        // underlying nativeEvent so consumers see the real DOM event.
        const native = e.nativeEvent as unknown as PointerEvent;
        onInteractOutside?.(native);
        if (!native.defaultPrevented) {
          onClose();
        }
      },
      [onInteractOutside, onClose]
    );

    if (!mounted || !shouldRender) return null;

    const isEntering = animationState === "entering";
    const isExiting = animationState === "exiting";

    const labelledBy = ariaLabelledBy ?? (title ? titleId : undefined);
    const ariaLabelToUse =
      ariaLabel ?? (!labelledBy ? "Dialog" : undefined);

    return createPortal(
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div
        className={cx(styles.overlay, {
          [styles.overlay_entering]: isEntering,
          [styles.overlay_exiting]: isExiting,
        })}
        onClick={handleOverlayClick}
        data-modal-portal=""
      >
        <div
          ref={mergedRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          aria-label={ariaLabelToUse}
          tabIndex={-1}
          className={cx(
            styles.panel,
            styles[size],
            {
              [styles.entering]: isEntering,
              [styles.exiting]: isExiting,
            },
            className
          )}
        >
          {(title || !hideCloseButton) && (
            <div className={styles.header}>
              {title && (
                <h2 id={titleId} className={styles.title}>
                  {title}
                </h2>
              )}
              {!hideCloseButton && (
                <button
                  type="button"
                  className={styles.close_button}
                  onClick={onClose}
                  aria-label="Close dialog"
                >
                  <IconX size="sm" color="currentColor" />
                </button>
              )}
            </div>
          )}

          <div className={styles.body}>{children}</div>

          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      </div>,
      document.body
    );
  }
);

Modal.displayName = "Modal";

export { Modal };
