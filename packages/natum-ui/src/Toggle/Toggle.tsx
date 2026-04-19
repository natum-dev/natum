"use client";

import { forwardRef, useId } from "react";
import type { ChangeEventHandler, ComponentPropsWithoutRef, ReactNode } from "react";
import cx from "classnames";
import styles from "./Toggle.module.scss";

type ToggleOwnProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  label?: ReactNode;
  description?: ReactNode;
  labelPosition?: "start" | "end";
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
};

export type ToggleProps = ToggleOwnProps &
  Omit<ComponentPropsWithoutRef<"input">, keyof ToggleOwnProps | "type">;

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      checked,
      defaultChecked = false,
      onChange,
      label,
      description,
      labelPosition = "start",
      size = "md",
      disabled = false,
      id: idProp,
      className,
      "aria-describedby": ariaDescribedBy,
      ...rest
    },
    ref
  ) => {
    const autoId = useId();
    const inputId = idProp ?? autoId;
    const descriptionId = useId();

    const isControlled = checked !== undefined;
    const inputProps = isControlled
      ? { checked, onChange }
      : { defaultChecked, onChange };

    const describedBy =
      [ariaDescribedBy, description != null ? descriptionId : null]
        .filter(Boolean)
        .join(" ") || undefined;

    const hasContent = label != null || description != null;

    return (
      <label
        className={cx(styles.toggle, className)}
        data-size={size}
        data-label-position={labelPosition}
      >
        {hasContent && (
          <span className={styles.content}>
            {label != null && <span className={styles.label}>{label}</span>}
            {description != null && (
              <span id={descriptionId} className={styles.description}>
                {description}
              </span>
            )}
          </span>
        )}
        <span className={styles.rail}>
          <input
            ref={ref}
            type="checkbox"
            role="switch"
            id={inputId}
            disabled={disabled}
            className={styles.input}
            aria-describedby={describedBy}
            {...inputProps}
            {...rest}
          />
          <span className={styles.thumb} aria-hidden="true" />
        </span>
      </label>
    );
  }
);

Toggle.displayName = "Toggle";
export { Toggle };
