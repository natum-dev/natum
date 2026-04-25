import {
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type ReactNode,
  forwardRef,
} from "react";
import { Spinner } from "../Spinner";
import styles from "./Button.module.scss";
import cx from "classnames";

export type ButtonSize = "sm" | "md" | "lg";

export type ButtonColor =
  | "primary"
  | "secondary"
  | "error"
  | "success"
  | "warning"
  | "info"
  | "neutral";

export type ButtonVariant = "filled" | "soft" | "text";

export type ButtonProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "children" | "color"
> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: ButtonColor;
  loading?: boolean;
  leftSection?: ReactNode;
  rightSection?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "filled",
      size = "md",
      color = "primary",
      loading = false,
      leftSection,
      rightSection,
      fullWidth,
      disabled,
      children,
      className,
      onClick,
      ...rest
    },
    ref
  ) => {
    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      // Suppress activations while busy. We deliberately do NOT set the
      // native `disabled` attribute when loading — the element stays
      // focusable and screen readers announce it as a busy interactive
      // element rather than a disabled one.
      if (loading) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    return (
      <button
        ref={ref}
        type="button"
        className={cx(
          styles.button,
          styles[variant],
          styles[size],
          !disabled && styles[color],
          {
            [styles.full_width]: fullWidth,
            [styles.disabled]: disabled,
            [styles.loading]: loading,
          },
          className
        )}
        data-variant={variant}
        data-size={size}
        data-color={color}
        data-loading={loading || undefined}
        disabled={disabled}
        aria-busy={loading || undefined}
        onClick={handleClick}
        {...rest}
      >
        {loading ? (
          <span className={styles.section} aria-hidden="true">
            <Spinner size={size} color="currentColor" className={styles.spinner} />
          </span>
        ) : leftSection ? (
          <span className={styles.section} aria-hidden="true">
            {leftSection}
          </span>
        ) : null}
        {children != null && <span className={styles.label}>{children}</span>}
        {rightSection ? (
          <span className={styles.section} aria-hidden="true">
            {rightSection}
          </span>
        ) : null}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
