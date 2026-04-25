"use client";

import {
  forwardRef,
  useState,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { flushSync } from "react-dom";
import { useDropdownMenuContext } from "./context";
import styles from "./DropdownMenu.module.scss";
import cx from "classnames";

export type DropdownMenuItemProps = {
  onSelect?: (event: SyntheticEvent) => void;
  disabled?: boolean;
  destructive?: boolean;
  leftSection?: ReactNode;
  textValue?: string;
  className?: string;
  children?: ReactNode;
} & Omit<
  HTMLAttributes<HTMLDivElement>,
  "role" | "tabIndex" | "aria-disabled" | "onKeyDown" | "onClick" | "children"
>;

export const DropdownMenuItem = forwardRef<
  HTMLDivElement,
  DropdownMenuItemProps
>(
  (
    {
      onSelect,
      disabled = false,
      destructive = false,
      leftSection,
      textValue,
      className,
      children,
      onMouseEnter: consumerMouseEnter,
      onFocus: consumerFocus,
      onBlur: consumerBlur,
      ...rest
    },
    ref
  ) => {
    const { setOpen } = useDropdownMenuContext();
    const [highlighted, setHighlighted] = useState(false);

    const activate = (event: SyntheticEvent) => {
      if (disabled) return;
      onSelect?.(event);
      if (!event.defaultPrevented) {
        setOpen(false, { returnFocus: true });
      }
    };

    const handleClick = (event: MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      activate(event);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (event.key === "Enter") {
        activate(event);
      } else if (event.key === " " || event.key === "Space") {
        event.preventDefault();
        activate(event);
      }
    };

    const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
      consumerMouseEnter?.(event);
      if (!disabled) event.currentTarget.focus();
    };

    const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
      consumerFocus?.(event);
      if (!disabled) flushSync(() => setHighlighted(true));
    };

    const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
      consumerBlur?.(event);
      flushSync(() => setHighlighted(false));
    };

    return (
      <div
        ref={ref}
        {...rest}
        role="menuitem"
        tabIndex={-1}
        aria-disabled={disabled || undefined}
        data-dropdown-menu-item=""
        data-destructive={destructive ? "true" : undefined}
        data-highlighted={highlighted ? "true" : undefined}
        data-text-value={textValue}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cx(styles.item, className)}
      >
        {leftSection && (
          <span aria-hidden="true" className={styles.item_left_section}>
            {leftSection}
          </span>
        )}
        {children}
      </div>
    );
  }
);

DropdownMenuItem.displayName = "DropdownMenuItem";
