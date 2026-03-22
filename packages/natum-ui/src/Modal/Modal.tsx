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

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
    const previousActiveElement = useRef<Element | null>(null);

    const [mounted, setMounted] = useState(false);
    const [animationState, setAnimationState] = useState<AnimationState>("exited");

    // SSR safety
    useEffect(() => {
      setMounted(true);
    }, []);

    // Animation state machine
    useEffect(() => {
      if (isOpen) {
        previousActiveElement.current = document.activeElement;
        setAnimationState("entering");
        const timer = setTimeout(() => setAnimationState("entered"), ENTER_DURATION);
        return () => clearTimeout(timer);
      } else if (animationState !== "exited") {
        setAnimationState("exiting");
        const timer = setTimeout(() => setAnimationState("exited"), EXIT_DURATION);
        return () => clearTimeout(timer);
      }
    }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    // Focus management — move focus into panel on open
    useEffect(() => {
      if (animationState === "entering" && panelRef.current) {
        // Use microtask to ensure DOM is ready, then focus first focusable or panel
        Promise.resolve().then(() => {
          if (!panelRef.current) return;
          const firstFocusable = panelRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
          if (firstFocusable) {
            firstFocusable.focus();
          } else {
            panelRef.current.focus();
          }
        });
      }
    }, [animationState]);

    // Focus return on close
    useEffect(() => {
      if (animationState === "exited" && previousActiveElement.current) {
        const el = previousActiveElement.current as HTMLElement;
        previousActiveElement.current = null;
        // Remove inert before restoring focus to ensure element is focusable
        inertedElements.current.forEach((sibling) => sibling.removeAttribute("inert"));
        el?.focus?.();
      }
    }, [animationState]);

    // Scroll lock + inert
    const inertedElements = useRef<Element[]>([]);

    useEffect(() => {
      if (!isOpen) return;

      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;

      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      // Set inert on siblings
      const portalEl = panelRef.current?.closest("[data-modal-portal]");
      const siblings = Array.from(document.body.children).filter(
        (el) => el !== portalEl && !el.hasAttribute("data-modal-portal")
      );
      siblings.forEach((el) => el.setAttribute("inert", ""));
      inertedElements.current = siblings;

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
        inertedElements.current.forEach((el) => el.removeAttribute("inert"));
        inertedElements.current = [];
      };
    }, [isOpen]);

    // Focus trap
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          if (closeOnEsc) {
            onClose();
          }
          return;
        }

        if (e.key === "Tab" && panelRef.current) {
          const focusableEls = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
          if (focusableEls.length === 0) return;

          const first = focusableEls[0];
          const last = focusableEls[focusableEls.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first || document.activeElement === panelRef.current) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      },
      [closeOnEsc, onClose]
    );

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
          [styles.overlay_entering]: isEntering || animationState === "entered",
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
