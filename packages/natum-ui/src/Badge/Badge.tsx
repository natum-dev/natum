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
  children?: ReactNode;
  className?: string;
};

export type BadgeProps = BadgeBaseProps &
  Omit<ComponentPropsWithoutRef<"span">, keyof BadgeBaseProps>;

export const Badge = ({
  color = "neutral",
  variant = "soft",
  size = "md",
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
      className
    )}
    {...rest}
  >
    {children}
  </span>
);

export type { BadgeColor, BadgeVariant, BadgeSize };
