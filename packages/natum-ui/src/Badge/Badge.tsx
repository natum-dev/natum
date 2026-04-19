import type { ComponentPropsWithoutRef, ReactNode } from "react";
import styles from "./Badge.module.scss";
import cx from "classnames";

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

type BadgeBaseProps = {
  color?: BadgeColor;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children?: ReactNode;
  className?: string;
};

export type BadgeProps = BadgeBaseProps &
  Omit<ComponentPropsWithoutRef<"span">, keyof BadgeBaseProps>;

export const Badge = ({
  color = "neutral",
  variant = "soft",
  size = "md",
  dot = false,
  children,
  className,
  ...rest
}: BadgeProps) => (
  <span
    className={cx(
      styles.badge,
      styles[variant],
      styles[color],
      styles[size],
      { [styles.dot]: dot },
      className
    )}
    {...rest}
  >
    {!dot && children}
  </span>
);

export type { BadgeColor, BadgeVariant, BadgeSize };
