import {
  type ComponentPropsWithoutRef,
  type ForwardedRef,
  type MouseEventHandler,
  type Ref,
  type ReactNode,
  forwardRef,
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
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
};

export type BadgeProps<T extends BadgeElementType = "span"> =
  BadgeBaseProps<T> &
    Omit<ComponentPropsWithoutRef<T>, keyof BadgeBaseProps<T>>;

const BadgeInner = <T extends BadgeElementType = "span">(
  {
    as,
    color = "neutral",
    variant = "soft",
    size = "md",
    dot = false,
    leftSection,
    disabled = false,
    children,
    className,
    onClick,
    ...rest
  }: BadgeProps<T> & { onClick?: MouseEventHandler<HTMLElement> },
  ref: ForwardedRef<Element>
) => {
  const Tag = (as ?? "span") as BadgeElementType;
  const isInteractive = Tag === "a" || Tag === "button";

  const spreadProps = { ...rest } as Record<string, unknown>;
  if (Tag === "a" && disabled) {
    delete spreadProps.href;
  }

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={cx(
        styles.badge,
        styles[variant],
        styles[color],
        styles[size],
        {
          [styles.dot]: dot,
          [styles.interactive]: isInteractive,
          [styles.disabled]: disabled && isInteractive,
        },
        className
      )}
      aria-disabled={disabled && isInteractive ? true : undefined}
      disabled={Tag === "button" && disabled ? true : undefined}
      onClick={disabled ? undefined : (onClick as MouseEventHandler<HTMLElement> | undefined)}
      {...spreadProps}
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

const Badge = forwardRef(BadgeInner) as <T extends BadgeElementType = "span">(
  props: BadgeProps<T> & { ref?: Ref<Element> }
) => JSX.Element;

(Badge as { displayName?: string }).displayName = "Badge";

export { Badge };
export type {
  BadgeElementType,
  BadgeColor,
  BadgeVariant,
  BadgeSize,
};
