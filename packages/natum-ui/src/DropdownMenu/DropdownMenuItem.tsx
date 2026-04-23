"use client";

import {
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from "react";
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
      ...rest
    },
    ref
  ) => {
    const { setOpen } = useDropdownMenuContext();

    const activate = (event: SyntheticEvent) => {
      if (disabled) return;
      onSelect?.(event);
      if (!event.defaultPrevented) {
        setOpen(false, { returnFocus: true });
      }
    };

    const handleClick = (event: MouseEvent<HTMLDivElement>) => {
      activate(event);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter") {
        activate(event);
      } else if (event.key === " " || event.key === "Space") {
        event.preventDefault();
        activate(event);
      }
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
        data-text-value={textValue}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
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
