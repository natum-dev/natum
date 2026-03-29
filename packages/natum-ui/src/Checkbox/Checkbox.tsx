"use client";

import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  forwardRef,
  useEffect,
  useId,
  useRef,
} from "react";
import { useMergedRefs } from "../hooks/use-merge-refs";
import styles from "./Checkbox.module.scss";
import cx from "classnames";

type SemanticColor =
  | "primary"
  | "secondary"
  | "error"
  | "success"
  | "warning"
  | "info"
  | "neutral";

type CheckboxBaseProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  label?: ReactNode;
  size?: "sm" | "md" | "lg";
  color?: SemanticColor;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

export type CheckboxProps = CheckboxBaseProps &
  Omit<ComponentPropsWithoutRef<"input">, keyof CheckboxBaseProps | "type">;

const CheckIcon = () => (
  <svg
    data-icon="check"
    className={styles.icon}
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M3 7l3 3 5-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IndeterminateIcon = () => (
  <svg
    data-icon="indeterminate"
    className={styles.icon}
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M3 7h8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked,
      defaultChecked = false,
      indeterminate = false,
      label,
      size = "md",
      color = "primary",
      disabled = false,
      onChange,
      className,
      id: idProp,
      ...rest
    },
    ref
  ) => {
    const autoId = useId();
    const inputId = idProp ?? autoId;

    const inputRef = useRef<HTMLInputElement>(null);
    const mergedRef = useMergedRefs(ref, inputRef);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const isControlled = checked !== undefined;
    const inputProps = isControlled
      ? { checked, onChange }
      : { defaultChecked, onChange };

    return (
      <div
        className={cx(
          styles.container,
          styles[size],
          styles[color],
          {
            [styles.disabled]: disabled,
            [styles.checked]: isControlled ? checked : undefined,
            [styles.indeterminate]: indeterminate,
          },
          className
        )}
      >
        <span className={styles.box}>
          <input
            ref={mergedRef}
            type="checkbox"
            id={inputId}
            disabled={disabled}
            className={styles.input}
            {...inputProps}
            {...rest}
          />
          <span className={styles.control} aria-hidden="true">
            {indeterminate ? <IndeterminateIcon /> : <CheckIcon />}
          </span>
        </span>
        {label != null && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
