import {
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import styles from "./Badge.module.scss";
import cx from "classnames";

type BadgeElementType = "span" | "a" | "button";

type BadgeColor =
  | "neutral"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info";
type BadgeVariant = "filled" | "outlined" | "soft";
type BadgeSize = "sm" | "md";

type BadgeBaseProps<T extends BadgeElementType = "span"> = {
  as?: T;
  color?: BadgeColor;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  leftSection?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export type BadgeProps<T extends BadgeElementType = "span"> =
  BadgeBaseProps<T> &
    Omit<ComponentPropsWithoutRef<T>, keyof BadgeBaseProps<T>>;

export const Badge = <T extends BadgeElementType = "span">({
  as,
  color = "neutral",
  variant = "soft",
  size = "md",
  dot = false,
  leftSection,
  children,
  className,
  ...rest
}: BadgeProps<T>) => {
  const Tag = (as ?? "span") as BadgeElementType;
  const isInteractive = Tag === "a" || Tag === "button";

  return (
    <Tag
      className={cx(
        styles.badge,
        styles[variant],
        styles[color],
        styles[size],
        {
          [styles.dot]: dot,
          [styles.interactive]: isInteractive,
        },
        className
      )}
      {...(rest as ComponentPropsWithoutRef<"span">)}
    >
      {!dot && leftSection && (
        <span className={styles.left_section} aria-hidden="true">
          {leftSection}
        </span>
      )}
      {!dot && children}
    </Tag>
  );
};

export type {
  BadgeElementType,
  BadgeColor,
  BadgeVariant,
  BadgeSize,
};
