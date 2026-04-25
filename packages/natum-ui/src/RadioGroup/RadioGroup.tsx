"use client";

import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  forwardRef,
  useCallback,
  useId,
  useMemo,
} from "react";
import { useControllable } from "../hooks/use-controllable";
import {
  RadioGroupContext,
  type RadioGroupContextValue,
  type RadioGroupSemanticColor,
  type RadioGroupSize,
} from "./context";
import styles from "./RadioGroup.module.scss";
import cx from "classnames";

type Space = 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16;

type RadioGroupBaseProps = {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (
    value: string,
    event?: React.ChangeEvent<HTMLInputElement>
  ) => void;
  size?: RadioGroupSize;
  color?: RadioGroupSemanticColor;
  disabled?: boolean;
  label?: ReactNode;
  helperText?: ReactNode;
  errorMessage?: ReactNode;
  required?: boolean;
  orientation?: "vertical" | "horizontal";
  gap?: Space;
  children: ReactNode;
  className?: string;
};

export type RadioGroupProps = RadioGroupBaseProps &
  Omit<ComponentPropsWithoutRef<"fieldset">, keyof RadioGroupBaseProps>;

const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  (
    {
      name,
      value,
      defaultValue,
      onChange,
      size = "md",
      color = "primary",
      disabled = false,
      label,
      helperText,
      errorMessage,
      required,
      orientation = "vertical",
      gap = 2,
      children,
      className,
      ...rest
    },
    ref
  ) => {
    const autoName = useId();
    const messageId = useId();
    const resolvedName = name ?? autoName;

    // useControllable's input onChange signature is (value) => void; RadioGroup's
    // onChange is (value, event). We invoke the parent onChange manually in
    // handleGroupChange below, so we pass undefined here to avoid mismatch.
    const { value: currentValue, setValue } = useControllable<string>({
      value,
      defaultValue,
      onChange: undefined,
    });

    const hasError = errorMessage != null;
    const message = errorMessage ?? helperText;

    const handleGroupChange = useCallback(
      (next: string, event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(next);
        onChange?.(next, event);
      },
      [setValue, onChange]
    );

    const ctx = useMemo<RadioGroupContextValue>(
      () => ({
        name: resolvedName,
        value: currentValue ?? undefined,
        onChange: handleGroupChange,
        size,
        color,
        disabled,
      }),
      [resolvedName, currentValue, handleGroupChange, size, color, disabled]
    );

    return (
      <fieldset
        ref={ref}
        className={cx(
          styles.group,
          styles[orientation],
          styles[`gap_${gap}`],
          {
            [styles.error]: hasError,
          },
          className
        )}
        disabled={disabled}
        aria-invalid={hasError ? true : undefined}
        aria-required={required ? true : undefined}
        aria-describedby={message != null ? messageId : undefined}
        {...rest}
      >
        {label != null && (
          <legend className={styles.legend}>
            {label}
            {required && (
              <span aria-hidden="true" className={styles.required_asterisk}>
                *
              </span>
            )}
          </legend>
        )}

        <div className={styles.options}>
          <RadioGroupContext.Provider value={ctx}>
            {children}
          </RadioGroupContext.Provider>
        </div>

        {message != null && (
          <div
            id={messageId}
            className={cx(styles.message, {
              [styles.message_error]: hasError,
            })}
            role={hasError ? "alert" : undefined}
          >
            {message}
          </div>
        )}
      </fieldset>
    );
  }
);

RadioGroup.displayName = "RadioGroup";

export { RadioGroup };
