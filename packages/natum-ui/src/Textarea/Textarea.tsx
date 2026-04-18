"use client";

import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  forwardRef,
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useMergedRefs } from "../hooks/use-merge-refs";
import { useControllable } from "../hooks/use-controllable";
import styles from "./Textarea.module.scss";
import cx from "classnames";

type TextareaResize = "none" | "vertical" | "both";

type TextareaBaseProps = {
  variant?: "outlined" | "filled";
  size?: "sm" | "md" | "lg";
  label?: string;
  helperText?: ReactNode;
  errorMessage?: ReactNode;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  rows?: number;
  autoResize?: boolean;
  maxRows?: number;
  resize?: TextareaResize;
  className?: string;
  textareaClassName?: string;
};

export type TextareaProps = TextareaBaseProps &
  Omit<ComponentPropsWithoutRef<"textarea">, keyof TextareaBaseProps>;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      variant = "outlined",
      size = "md",
      label,
      helperText,
      errorMessage,
      required,
      readOnly,
      disabled,
      rows = 3,
      autoResize = false,
      maxRows,
      resize = "vertical",
      className,
      textareaClassName,
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
    const textareaId = idProp ?? autoId;
    const messageId = `${textareaId}-message`;

    const innerRef = useRef<HTMLTextAreaElement>(null);
    const mergedRef = useMergedRefs(ref, innerRef);

    const [isFocused, setIsFocused] = useState(false);

    const { value: currentValue, setValue, isControlled } =
      useControllable<string>({
        value: value as string | undefined,
        defaultValue: (defaultValue as string) ?? "",
        onChange: undefined,
      });

    const hasError = !!errorMessage;
    const effectiveResize: TextareaResize = autoResize ? "none" : resize;

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!isControlled) {
          setValue(e.target.value);
        }
        onChange?.(e);
      },
      [isControlled, setValue, onChange]
    );

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLTextAreaElement>) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLTextAreaElement>) => {
        setIsFocused(false);
        onBlur?.(e);
      },
      [onBlur]
    );

    // --- AutoResize ---
    useLayoutEffect(() => {
      if (!autoResize) return;
      const el = innerRef.current;
      if (!el) return;

      el.style.height = "auto";
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 0;
      const maxHeight =
        maxRows && lineHeight > 0 ? maxRows * lineHeight : Infinity;
      const next = Math.min(el.scrollHeight, maxHeight);
      el.style.height = `${next}px`;
      el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
    }, [currentValue, autoResize, maxRows]);

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
          <label htmlFor={textareaId} className={styles.label}>
            {label}
            {required && (
              <span aria-hidden="true" className={styles.required_asterisk}>
                *
              </span>
            )}
          </label>
        )}

        <div
          className={cx(
            styles.input_container,
            styles[variant],
            styles[size],
            {
              [styles.focused]: isFocused,
            }
          )}
        >
          <textarea
            ref={mergedRef}
            id={textareaId}
            rows={rows}
            className={cx(
              styles.textarea,
              styles[`resize_${effectiveResize}`],
              textareaClassName
            )}
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
            {messageContent}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
export type { TextareaResize };
