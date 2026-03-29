import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  type KeyboardEvent,
  forwardRef,
} from "react";
import styles from "./Card.module.scss";
import cx from "classnames";

type CardElementType = "div" | "article" | "section" | "a" | "button";

type CardBaseProps<T extends CardElementType = "div"> = {
  variant?: "elevated" | "outlined" | "filled";
  size?: "sm" | "md" | "lg";
  as?: T;
  isInteractive?: boolean;
  isSelected?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
};

export type CardProps<T extends CardElementType = "div"> = CardBaseProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof CardBaseProps<T>>;

const needsButtonRole = (tag: CardElementType): boolean =>
  tag !== "a" && tag !== "button";

const CardInner = <T extends CardElementType = "div">(
  {
    variant = "elevated",
    size = "md",
    as,
    isInteractive = false,
    isSelected = false,
    disabled = false,
    children,
    className,
    onClick,
    ...rest
  }: CardProps<T> & { onClick?: (e: unknown) => void },
  ref: React.ForwardedRef<Element>
) => {
  const Tag = (as ?? "div") as CardElementType;
  const isNonNative = needsButtonRole(Tag);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isInteractive || !isNonNative || disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.(e);
    }
  };

  const interactiveProps =
    isInteractive && isNonNative
      ? {
          role: "button" as const,
          tabIndex: disabled ? -1 : 0,
        }
      : {};

  // For anchor tags: remove href when disabled
  const spreadProps = { ...rest } as Record<string, unknown>;
  if (Tag === "a" && disabled) {
    delete spreadProps.href;
  }

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={cx(
        styles.card,
        styles[variant],
        styles[size],
        {
          [styles.interactive]: isInteractive,
          [styles.selected]: isSelected,
          [styles.disabled]: disabled,
        },
        className
      )}
      aria-disabled={disabled ? true : undefined}
      aria-selected={isSelected ? true : undefined}
      disabled={Tag === "button" && disabled ? true : undefined}
      onClick={disabled ? undefined : onClick}
      onKeyDown={isInteractive && isNonNative ? handleKeyDown : undefined}
      {...interactiveProps}
      {...spreadProps}
    >
      {children}
    </Tag>
  );
};

const Card = forwardRef(CardInner) as <T extends CardElementType = "div">(
  props: CardProps<T> & { ref?: React.Ref<Element> }
) => JSX.Element;

(Card as { displayName?: string }).displayName = "Card";

export { Card };
export type { CardElementType };
