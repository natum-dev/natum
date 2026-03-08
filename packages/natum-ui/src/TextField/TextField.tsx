"use client";

import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  forwardRef,
  useId,
  useState,
  useCallback,
} from "react";
import styles from "./TextField.module.scss";
import cx from "classnames";

export type TextFieldProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "size" | "color"
> & {
  size?: "small" | "medium" | "large";
  variant?: "outlined" | "filled";
  color?: "primary" | "secondary" | "error" | "success" | "warning";
  label?: string;
  errorMessage?: string;
  helperText?: string;
  leftSection?: ReactNode;
  rightSection?: ReactNode;
  clearable?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
};

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      size = "medium",
      variant = "outlined",
      color = "primary",
      label,
      errorMessage,
      helperText,
      leftSection,
      rightSection,
      clearable,
      disabled,
      fullWidth,
      className,
      id,
      value,
      defaultValue,
      onChange,
      ...rest
    },
    ref
  ) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const isControlled = value !== undefined;
    const [internalHasValue, setInternalHasValue] = useState(
      () => defaultValue !== undefined && defaultValue !== ""
    );
    const hasError = !!errorMessage;
    const showClear = clearable && (isControlled ? !!value : internalHasValue);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isControlled) {
          setInternalHasValue(e.target.value !== "");
        }
        onChange?.(e);
      },
      [isControlled, onChange]
    );

    const handleClear = useCallback(() => {
      if (isControlled) {
        const nativeEvent = new Event("input", { bubbles: true });
        const syntheticEvent = {
          target: { value: "" },
          currentTarget: { value: "" },
          nativeEvent,
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange?.(syntheticEvent);
      } else {
        const input = document.getElementById(inputId) as HTMLInputElement;
        if (input) {
          const nativeSetter = Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            "value"
          )?.set;
          nativeSetter?.call(input, "");
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }
        setInternalHasValue(false);
      }
    }, [isControlled, onChange, inputId]);

    return (
      <div
        className={cx(
          className,
          styles.textfield,
          styles[variant],
          styles[size],
          styles[color],
          {
            [styles.full_width]: fullWidth,
            [styles.has_error]: hasError,
            [styles.disabled]: disabled,
          }
        )}
      >
        {label && (
          <label className={styles.label} htmlFor={inputId}>
            {label}
          </label>
        )}
        <div className={styles.input_wrapper}>
          {leftSection && (
            <span className={styles.left_section}>{leftSection}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={styles.input}
            disabled={disabled}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            {...rest}
          />
          {showClear && (
            <button
              type="button"
              className={styles.clear_button}
              onClick={handleClear}
              tabIndex={-1}
              aria-label="Clear"
            >
              &times;
            </button>
          )}
          {rightSection && (
            <span className={styles.right_section}>{rightSection}</span>
          )}
        </div>
        {(errorMessage || helperText) && (
          <span
            className={cx(styles.message, { [styles.error_text]: hasError })}
          >
            {errorMessage ?? helperText}
          </span>
        )}
      </div>
    );
  }
);

TextField.displayName = "TextField";

export { TextField };
