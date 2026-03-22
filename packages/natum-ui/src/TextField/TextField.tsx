"use client";

import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  forwardRef,
  useId,
  useRef,
  useState,
  useCallback,
} from "react";
import { IconAlertTriangle, IconX } from "@natum/icons";
import { useMergedRef } from "../hooks/useMergedRef";
import { useUncontrolledValue } from "../hooks/useUncontrolledValue";
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
      onKeyDown,
      ...rest
    },
    ref
  ) => {
    const autoId = useId();
    const inputId = idProp ?? autoId;
    const messageId = `${inputId}-message`;

    const innerRef = useRef<HTMLInputElement>(null);
    const mergedRef = useMergedRef(ref, innerRef);

    const [isFocused, setIsFocused] = useState(false);

    const { showClear: showClearBase, handleChange, handleClear } =
      useUncontrolledValue({
        value: value as string | undefined,
        defaultValue: defaultValue as string | undefined,
        onChange,
        onClear,
        clearable,
      });

    const showClear = showClearBase && !disabled && !readOnly;
    const hasError = !!errorMessage;

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

    const doClear = useCallback(() => {
      handleClear(innerRef);
    }, [handleClear]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape" && clearable && showClear) {
          e.preventDefault();
          doClear();
        }
        onKeyDown?.(e);
      },
      [clearable, showClear, doClear, onKeyDown]
    );

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
            ref={mergedRef}
            id={inputId}
            className={cx(styles.input, inputClassName)}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
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
              onClick={doClear}
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
