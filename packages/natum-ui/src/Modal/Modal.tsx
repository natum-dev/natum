"use client";

import {
  type ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { IconX } from "@natum/icons";
import { useMergedRefs } from "../hooks/use-merge-refs";
import { useFocusTrap } from "../hooks/use-focus-trap";
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

type AnimationState = "entering" | "entered" | "exiting" | "exited";

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

    const panelRef = useRef<HTMLDivElement>(null);
    const mergedRef = useMergedRefs(ref, panelRef);

    const [mounted, setMounted] = useState(false);
    const [animationState, setAnimationState] = useState<AnimationState>("exited");

    // SSR safety
    useEffect(() => {
      setMounted(true);
    }, []);

    // Animation state machine
    useEffect(() => {
      if (isOpen) {
        setAnimationState("entering");
        const timer = setTimeout(() => setAnimationState("entered"), ENTER_DURATION);
        return () => clearTimeout(timer);
      } else if (animationState !== "exited") {
        setAnimationState("exiting");
        const timer = setTimeout(() => setAnimationState("exited"), EXIT_DURATION);
        return () => clearTimeout(timer);
      }
    }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    const trapActive = isOpen && animationState !== "exited";

    // Focus trap + inert + ESC
    const { handleKeyDown } = useFocusTrap({
      isActive: trapActive,
      onEscape: closeOnEsc ? onClose : undefined,
      containerRef: panelRef,
    });

    // Scroll lock
    useEffect(() => {
      if (!isOpen) return;

      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;

      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }, [isOpen]);

    const handleOverlayClick = useCallback(
      (e: React.MouseEvent) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
          onClose();
        }
      },
      [closeOnOverlayClick, onClose]
    );

    const shouldRender = isOpen || animationState !== "exited";

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
          onKeyDown={handleKeyDown}
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
