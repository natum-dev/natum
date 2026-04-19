import { type HTMLAttributes, forwardRef } from "react";
import cx from "classnames";
import styles from "./ProgressBar.module.scss";

export type ProgressBarColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info";
export type ProgressBarSize = "sm" | "md" | "lg";

type ProgressBarBaseProps = {
  value?: number;
  size?: ProgressBarSize;
  color?: ProgressBarColor;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
};

export type ProgressBarProps = ProgressBarBaseProps &
  Omit<
    HTMLAttributes<HTMLDivElement>,
    | "role"
    | "aria-valuemin"
    | "aria-valuemax"
    | "aria-valuenow"
    | keyof ProgressBarBaseProps
  >;

const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      size = "md",
      color = "primary",
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      className,
      ...rest
    },
    ref,
  ) => {
    const isDeterminate = typeof value === "number" && Number.isFinite(value);
    const clamped = isDeterminate ? Math.min(Math.max(value, 0), 1) : 0;
    const percent = Math.round(clamped * 100);

    return (
      <div
        {...rest}
        ref={ref}
        role="progressbar"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={isDeterminate ? percent : undefined}
        data-indeterminate={isDeterminate ? "false" : "true"}
        data-size={size}
        data-color={color}
        className={cx(styles.progress_bar, className)}
      >
        <span
          className={styles.progress_fill}
          style={isDeterminate ? { inlineSize: `${percent}%` } : undefined}
        />
      </div>
    );
  },
);

ProgressBar.displayName = "ProgressBar";

export { ProgressBar };
