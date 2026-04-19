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
      label: _label,
      description: _description,
      labelPosition = "start",
      size = "md",
      disabled = false,
      id: idProp,
      className,
      ...rest
    },
    ref
  ) => {
    void _label;
    void _description;

    const autoId = useId();
    const inputId = idProp ?? autoId;

    const isControlled = checked !== undefined;
    const inputProps = isControlled
      ? { checked, onChange }
      : { defaultChecked, onChange };

    return (
      <label
        className={cx(styles.toggle, className)}
        data-size={size}
        data-label-position={labelPosition}
      >
        <span className={styles.rail}>
          <input
            ref={ref}
            type="checkbox"
            role="switch"
            id={inputId}
            disabled={disabled}
            className={styles.input}
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
