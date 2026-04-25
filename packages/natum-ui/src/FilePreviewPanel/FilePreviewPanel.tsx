/// <reference types="vite/client" />
"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { IconX, IconChevronLeft, IconChevronRight } from "@natum/icons";
import { IconButton } from "../IconButton";
import { useMergedRefs } from "../hooks/use-merge-refs";
import { useAnimationState } from "../hooks/use-animation-state";
import { useScrollLock } from "../hooks/use-scroll-lock";
import { useEscapeKey } from "../hooks/use-escape-key";
import styles from "./FilePreviewPanel.module.scss";
import cx from "classnames";

const ENTER_DURATION = 200;
const EXIT_DURATION = 150;

type FilePreviewPanelBaseProps = {
  open: boolean;
  onClose: () => void;
  fileName: ReactNode;
  meta?: ReactNode;
  headerActions?: ReactNode;
  children?: ReactNode;
  onPrevious?: () => void;
  onNext?: () => void;
  /**
   * Fires when the user presses Escape while the overlay is open.
   * Call `event.preventDefault()` to keep the overlay open.
   * If not handled (or not prevented), the overlay closes itself.
   */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /**
   * Fires when the user clicks/taps outside the overlay (the scrim).
   * Call `event.preventDefault()` to keep the overlay open.
   * If not handled (or not prevented), the overlay closes itself.
   */
  onInteractOutside?: (event: PointerEvent | FocusEvent) => void;
  "aria-label"?: string;
  className?: string;
};

export type FilePreviewPanelProps = FilePreviewPanelBaseProps &
  Omit<
    HTMLAttributes<HTMLDivElement>,
    "children" | "className" | keyof FilePreviewPanelBaseProps
  >;

const FilePreviewPanel = forwardRef<HTMLDivElement, FilePreviewPanelProps>(
  (
    {
      open,
      onClose,
      fileName,
      meta,
      headerActions,
      children,
      onPrevious,
      onNext,
      onEscapeKeyDown,
      onInteractOutside,
      "aria-label": ariaLabel,
      className,
      ...rest
    },
    ref
  ) => {
    const autoId = useId();
    const fileNameId = `${autoId}-filename`;

    const [mounted, setMounted] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<Element | null>(null);

    useLayoutEffect(() => {
      setMounted(true);
    }, []);

    // Dev-warn when fileName is a non-string ReactNode without an explicit
    // accessible name. The aria-labelledby fallback still works.
    // One-shot guard so the warn doesn't fire on every parent re-render.
    const warnedNonStringNameRef = useRef(false);
    useEffect(() => {
      if (!import.meta.env.DEV) return;
      if (warnedNonStringNameRef.current) return;
      if (
        fileName !== undefined &&
        typeof fileName !== "string" &&
        typeof fileName !== "number" &&
        !ariaLabel
      ) {
        console.warn(
          "FilePreviewPanel: `fileName` is a non-string ReactNode. Provide `aria-label` to ensure a stable screen-reader name."
        );
        warnedNonStringNameRef.current = true;
      }
    }, [fileName, ariaLabel]);

    const { state, shouldRender } = useAnimationState({
      isOpen: open,
      enterDuration: ENTER_DURATION,
      exitDuration: EXIT_DURATION,
    });

    useScrollLock({ enabled: open });

    useEscapeKey({
      onEscape: (event) => {
        onEscapeKeyDown?.(event);
        if (!event.defaultPrevented) {
          onClose();
        }
      },
      enabled: open,
    });

    // Capture focus on open, restore on close
    useLayoutEffect(() => {
      if (open) {
        previousFocusRef.current = document.activeElement;
      } else if (previousFocusRef.current) {
        const el = previousFocusRef.current as HTMLElement;
        if (typeof el.focus === "function") {
          el.focus();
        }
        previousFocusRef.current = null;
      }
    }, [open]);

    // Focus panel on open
    useLayoutEffect(() => {
      if (open && (state === "entering" || state === "entered")) {
        requestAnimationFrame(() => {
          panelRef.current?.focus();
        });
      }
    }, [open, state]);

    const handleScrimClick = useCallback(
      (e: React.MouseEvent) => {
        const native = e.nativeEvent as unknown as PointerEvent;
        onInteractOutside?.(native);
        if (!native.defaultPrevented) {
          onClose();
        }
      },
      [onInteractOutside, onClose]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "ArrowLeft" && onPrevious) {
          e.preventDefault();
          onPrevious();
        } else if (e.key === "ArrowRight" && onNext) {
          e.preventDefault();
          onNext();
        }
      },
      [onPrevious, onNext]
    );

    const mergedRef = useMergedRefs(ref, panelRef);

    const labelProps = ariaLabel
      ? { "aria-label": ariaLabel }
      : { "aria-labelledby": fileNameId };

    if (!mounted || !shouldRender) return null;

    const fileNameTitle =
      typeof fileName === "string" || typeof fileName === "number"
        ? String(fileName)
        : undefined;

    return createPortal(
      <>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          className={styles.scrim}
          aria-hidden="true"
          data-state={state}
          onClick={handleScrimClick}
        />
        <div
          ref={mergedRef}
          role="dialog"
          {...labelProps}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          {...rest}
          className={cx(styles.file_preview_panel, className)}
          data-state={state}
        >
          <div className={styles.header}>
            <div className={styles.header_info}>
              <div
                className={styles.file_name}
                id={fileNameId}
                title={fileNameTitle}
              >
                {fileName}
              </div>
              {meta && <div className={styles.meta}>{meta}</div>}
            </div>
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div
              className={styles.header_actions}
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
            >
              {headerActions}
              <IconButton
                icon={IconX}
                aria-label="Close preview"
                variant="text"
                color="secondary"
                size="small"
                onClick={onClose}
              />
            </div>
          </div>

          <div className={styles.body}>
            {onPrevious && (
              <button
                type="button"
                className={cx(styles.nav_button, styles.nav_previous)}
                aria-label="Previous file"
                onClick={onPrevious}
              >
                <IconChevronLeft size="md" color="currentColor" />
              </button>
            )}

            <div className={styles.content}>{children}</div>

            {onNext && (
              <button
                type="button"
                className={cx(styles.nav_button, styles.nav_next)}
                aria-label="Next file"
                onClick={onNext}
              >
                <IconChevronRight size="md" color="currentColor" />
              </button>
            )}
          </div>
        </div>
      </>,
      document.body
    );
  }
);

FilePreviewPanel.displayName = "FilePreviewPanel";

export { FilePreviewPanel };
