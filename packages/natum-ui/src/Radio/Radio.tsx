"use client";

import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useRef,
} from "react";
import { useMergedRefs } from "../hooks/use-merge-refs";
import {
  RadioGroupContext,
  type RadioGroupSemanticColor,
  type RadioGroupSize,
} from "../RadioGroup/context";
import styles from "./Radio.module.scss";
import cx from "classnames";

type RadioBaseProps = {
  value: string;
  label?: ReactNode;
  size?: RadioGroupSize;
  color?: RadioGroupSemanticColor;
  disabled?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  name?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

export type RadioProps = RadioBaseProps &
  Omit<ComponentPropsWithoutRef<"input">, keyof RadioBaseProps | "type">;

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      value,
      label,
      size,
      color,
      disabled,
      checked,
      defaultChecked,
      name,
      onChange,
      className,
      id: idProp,
      ...rest
    },
    ref
  ) => {
    const ctx = useContext(RadioGroupContext);

    const isGroupMode =
      ctx != null &&
      checked === undefined &&
      onChange === undefined &&
      name === undefined;

    const resolvedName = name ?? ctx?.name;
    const resolvedSize: RadioGroupSize = size ?? ctx?.size ?? "md";
    const resolvedColor: RadioGroupSemanticColor =
      color ?? ctx?.color ?? "primary";
    const isDisabled = (ctx?.disabled ?? false) || (disabled ?? false);

    const resolvedChecked = isGroupMode ? ctx!.value === value : checked;
    const resolvedDefaultChecked =
      !isGroupMode && checked === undefined ? defaultChecked : undefined;

    const autoId = useId();
    const inputId = idProp ?? autoId;

    const innerRef = useRef<HTMLInputElement>(null);
    const mergedRef = useMergedRefs(ref, innerRef);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e);
        if (isGroupMode && ctx?.onChange) {
          ctx.onChange(value, e);
        }
      },
      [onChange, isGroupMode, ctx, value]
    );

    return (
      <div
        className={cx(
          styles.container,
          styles[resolvedSize],
          styles[resolvedColor],
          { [styles.disabled]: isDisabled },
          className
        )}
      >
        <span className={styles.box}>
          <input
            ref={mergedRef}
            type="radio"
            id={inputId}
            name={resolvedName}
            value={value}
            checked={resolvedChecked}
            defaultChecked={resolvedDefaultChecked}
            disabled={isDisabled}
            onChange={handleChange}
            className={styles.input}
            {...rest}
          />
          <span className={styles.control} aria-hidden="true">
            <span className={styles.dot} />
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

Radio.displayName = "Radio";

export { Radio };
