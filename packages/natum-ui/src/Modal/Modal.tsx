"use client";

import {
  type ReactNode,
  forwardRef,
  useCallback,
  useId,
  useLayoutEffect,
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
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg";
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  hideCloseButton?: boolean;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  id?: string;
};

const ENTER_DURATION = 200;
const EXIT_DURATION = 150;

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      size = "md",
      closeOnOverlayClick = true,
      closeOnEsc = true,
      hideCloseButton = false,
      children,
      footer,
      className,
      id: idProp,
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

    const { state: animationState, shouldRender } = useAnimationState({
      isOpen,
      enterDuration: ENTER_DURATION,
      exitDuration: EXIT_DURATION,
    });

    const trapActive = isOpen && animationState !== "exited";

    const { ref: trapRef } = useFocusTrap({
      isActive: trapActive,
      onEscape: closeOnEsc ? onClose : undefined,
    });

    const mergedRef = useMergedRefs(ref, trapRef);

    useScrollLock({ enabled: isOpen });

    const handleOverlayClick = useCallback(
      (e: React.MouseEvent) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
          onClose();
        }
      },
      [closeOnOverlayClick, onClose]
    );

    if (!mounted || !shouldRender) return null;

    const isEntering = animationState === "entering";
    const isExiting = animationState === "exiting";

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
          aria-labelledby={title ? titleId : undefined}
          aria-label={title ? undefined : "Dialog"}
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
