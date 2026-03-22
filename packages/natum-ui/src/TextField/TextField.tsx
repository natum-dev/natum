"use client";

import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  forwardRef,
  useId,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
} from "react";
import { IconAlertTriangle, IconX } from "@natum/icons";
import styles from "./TextField.module.scss";
import cx from "classnames";

type TextFieldBaseProps = {
  variant?: "outlined" | "filled";
  size?: "sm" | "md" | "lg";
  label?: string;
  helperText?: ReactNode;
  errorMessage?: ReactNode;
  leftSection?: ReactNode;
  rightSection?: ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
};

export type TextFieldProps = TextFieldBaseProps &
  Omit<ComponentPropsWithoutRef<"input">, keyof TextFieldBaseProps>;

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      variant = "outlined",
      size = "md",
      label,
      helperText,
      errorMessage,
      leftSection,
      rightSection,
      clearable = false,
      onClear,
      required,
      readOnly,
      disabled,
      className,
      inputClassName,
      id: idProp,
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      ...rest
    },
    ref
  ) => {
    const autoId = useId();
    const inputId = idProp ?? autoId;
    const messageId = `${inputId}-message`;

    const innerRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => innerRef.current!);

    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(
      () => (defaultValue as string)?.length > 0
    );

    const isControlled = value !== undefined;
    const hasError = !!errorMessage;

    const showClear =
      clearable &&
      (isControlled ? (value as string)?.length > 0 : hasValue) &&
      !disabled &&
      !readOnly;

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        onBlur?.(e);
      },
      [onBlur]
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isControlled) {
          setHasValue(e.target.value.length > 0);
        }
        onChange?.(e);
      },
      [isControlled, onChange]
    );

    const handleClear = useCallback(() => {
      const input = innerRef.current;
      if (!input) return;

      // Set native value to empty
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value"
      )?.set;
      nativeInputValueSetter?.call(input, "");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));

      if (!isControlled) {
        setHasValue(false);
      }

      onClear?.();
      input.focus();
    }, [isControlled, onClear]);

    const handleContainerClick = useCallback(() => {
      innerRef.current?.focus();
    }, []);

    const messageContent = hasError ? errorMessage : helperText;
    const showMessage = !!messageContent;

    return (
      <div
        className={cx(
          styles.wrapper,
          {
            [styles.error]: hasError,
            [styles.disabled_state]: disabled,
            [styles.readonly_state]: readOnly,
          },
          className
        )}
      >
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {required && (
              <span aria-hidden="true" className={styles.required_asterisk}>
                *
              </span>
            )}
          </label>
        )}

        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          className={cx(
            styles.input_container,
            styles[variant],
            styles[size],
            {
              [styles.focused]: isFocused,
              [styles.has_left]: !!leftSection,
              [styles.has_right]: !!rightSection || clearable,
            }
          )}
          onClick={handleContainerClick}
        >
          {leftSection && (
            <span className={styles.left_section}>{leftSection}</span>
          )}

          <input
            ref={innerRef}
            id={inputId}
            className={cx(styles.input, inputClassName)}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            aria-required={required ? true : undefined}
            aria-invalid={hasError ? true : undefined}
            aria-describedby={showMessage ? messageId : undefined}
            {...rest}
          />

          {showClear && (
            <button
              type="button"
              className={styles.clear_button}
              onClick={handleClear}
              tabIndex={-1}
              aria-label="Clear input"
            >
              <IconX size="sm" color="currentColor" />
            </button>
          )}

          {rightSection && (
            <span className={styles.right_section}>{rightSection}</span>
          )}
        </div>

        {showMessage && (
          <div
            id={messageId}
            className={cx(
              styles.message,
              hasError ? styles.message_error : styles.message_helper
            )}
            role={hasError ? "alert" : undefined}
          >
            {hasError && (
              <IconAlertTriangle
                size="xs"
                color="currentColor"
                className={styles.error_icon}
              />
            )}
            {messageContent}
          </div>
        )}
      </div>
    );
  }
);

TextField.displayName = "TextField";

export { TextField };
