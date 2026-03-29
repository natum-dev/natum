"use client";

import {
  type ReactElement,
  type ReactNode,
  cloneElement,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useAnchorPosition } from "../hooks/use-anchor-position";
import { useMergedRefs } from "../hooks/use-merge-refs";
import styles from "./Tooltip.module.scss";
import cx from "classnames";

type Placement = "top" | "bottom" | "left" | "right";

export type TooltipProps = {
  content: ReactNode;
  placement?: Placement;
  delay?: number;
  children: ReactElement;
  className?: string;
};

const EXIT_DURATION = 125;

const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ content, placement = "top", delay = 200, children, className }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [mounted, setMounted] = useState(false);

    const tooltipId = useId();
    const delayTimerRef = useRef<ReturnType<typeof setTimeout>>();
    const exitTimerRef = useRef<ReturnType<typeof setTimeout>>();

    const anchorRef = useRef<HTMLElement>(null);
    const floatingRef = useRef<HTMLDivElement>(null);
    const mergedFloatingRef = useMergedRefs(ref, floatingRef);

    const shouldRender = isOpen || isExiting;

    const { styles: positionStyles, actualPlacement } = useAnchorPosition({
      anchorRef,
      floatingRef,
      placement,
      offset: 8,
      isOpen: shouldRender,
    });

    useEffect(() => {
      setMounted(true);
    }, []);

    const show = useCallback(() => {
      clearTimeout(exitTimerRef.current);
      setIsExiting(false);
      delayTimerRef.current = setTimeout(() => {
        setIsOpen(true);
      }, delay);
    }, [delay]);

    const hide = useCallback(() => {
      clearTimeout(delayTimerRef.current);
      if (!isOpen) return;
      setIsExiting(true);
      exitTimerRef.current = setTimeout(() => {
        setIsOpen(false);
        setIsExiting(false);
      }, EXIT_DURATION);
    }, [isOpen]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Escape" && isOpen) {
          hide();
        }
      },
      [isOpen, hide]
    );

    useEffect(() => {
      if (!isOpen) return;
      const handleDocumentKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          hide();
        }
      };
      document.addEventListener("keydown", handleDocumentKeyDown);
      return () => {
        document.removeEventListener("keydown", handleDocumentKeyDown);
      };
    }, [isOpen, hide]);

    useEffect(() => {
      return () => {
        clearTimeout(delayTimerRef.current);
        clearTimeout(exitTimerRef.current);
      };
    }, []);

    const trigger = cloneElement(children, {
      ref: anchorRef,
      onMouseEnter: (e: React.MouseEvent) => {
        children.props.onMouseEnter?.(e);
        show();
      },
      onMouseLeave: (e: React.MouseEvent) => {
        children.props.onMouseLeave?.(e);
        hide();
      },
      onFocus: (e: React.FocusEvent) => {
        children.props.onFocus?.(e);
        show();
      },
      onBlur: (e: React.FocusEvent) => {
        children.props.onBlur?.(e);
        hide();
      },
      onKeyDown: (e: React.KeyboardEvent) => {
        children.props.onKeyDown?.(e);
        handleKeyDown(e);
      },
      "aria-describedby": shouldRender ? tooltipId : undefined,
    });

    const tooltip =
      mounted && shouldRender
        ? createPortal(
            <div
              ref={mergedFloatingRef}
              id={tooltipId}
              role="tooltip"
              data-placement={actualPlacement}
              className={cx(
                styles.tooltip,
                {
                  [styles.entering]: isOpen && !isExiting,
                  [styles.exiting]: isExiting,
                },
                className
              )}
              style={positionStyles}
            >
              {content}
            </div>,
            document.body
          )
        : null;

    return (
      <>
        {trigger}
        {tooltip}
      </>
    );
  }
);

Tooltip.displayName = "Tooltip";

export { Tooltip };
