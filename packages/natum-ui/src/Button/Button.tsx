import { type ComponentPropsWithoutRef, forwardRef } from "react";
import styles from "./Button.module.scss";
import cx from "classnames";

export type ButtonProps = Omit<ComponentPropsWithoutRef<"button">, "children"> & {
  variant?: "filled" | "outlined" | "text";
  fullWidth?: boolean;
  children?: React.ReactNode;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "filled", fullWidth, disabled, children, className, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        className={cx(
          styles.button,
          styles[variant],
          {
            [styles.full_width]: fullWidth,
            [styles.disabled]: disabled,
          },
          className
        )}
        disabled={disabled}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
