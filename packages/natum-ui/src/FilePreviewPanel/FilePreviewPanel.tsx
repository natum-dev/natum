"use client";

import {
  forwardRef,
  useCallback,
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
  fileName: string;
  meta?: ReactNode;
  headerActions?: ReactNode;
  children?: ReactNode;
  onPrevious?: () => void;
  onNext?: () => void;
  closeOnEsc?: boolean;
  closeOnOverlayClick?: boolean;
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
      closeOnEsc = true,
      closeOnOverlayClick = true,
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

    const { state, shouldRender } = useAnimationState({
      isOpen: open,
      enterDuration: ENTER_DURATION,
      exitDuration: EXIT_DURATION,
    });

    useScrollLock({ enabled: open });

    useEscapeKey({
      onEscape: onClose,
      enabled: open && closeOnEsc,
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

    const handleScrimClick = useCallback(() => {
      if (closeOnOverlayClick) {
        onClose();
      }
    }, [closeOnOverlayClick, onClose]);

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
                title={fileName}
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
