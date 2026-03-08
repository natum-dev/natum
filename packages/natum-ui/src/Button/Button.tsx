import { PropsWithChildren } from "react";
import styles from "./Button.module.scss";
import cx from "classnames";

export type ButtonProps = {
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  fullWidth?: boolean;
  variant?: "filled" | "light" | "outlined" | "text";
  color?: "primary" | "secondary" | "error" | "success" | "warning";
  className?: string;
  onClick?: VoidFunction;
};

const Button = ({
  color = "primary",
  size = "medium",
  variant = "filled",
  disabled,
  fullWidth,
  children,
  className,
  onClick,
}: PropsWithChildren<ButtonProps>): JSX.Element => {
  return (
    <button
      className={cx(
        className,
        styles.button,
        styles[variant],
        styles[size],
        styles[color],
        {
          [styles.full_width]: fullWidth,
          [styles.disabled]: disabled,
        }
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export { Button };
