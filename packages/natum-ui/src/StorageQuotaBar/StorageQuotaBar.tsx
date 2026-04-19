/// <reference types="vite/client" />
import {
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
  useId,
} from "react";
import cx from "classnames";
import { ProgressBar, type ProgressBarColor } from "../ProgressBar";
import { formatFileSize } from "../utils/format-size";
import styles from "./StorageQuotaBar.module.scss";

export type StorageQuotaBarSize = "sm" | "md" | "lg";

type StorageQuotaBarBaseProps = {
  used: number;
  total: number;
  size?: StorageQuotaBarSize;
  warnAt?: number;
  errorAt?: number;
  label?: ReactNode;
  valueLabel?: ReactNode;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
};

export type StorageQuotaBarProps = StorageQuotaBarBaseProps &
  Omit<
    HTMLAttributes<HTMLDivElement>,
    "role" | keyof StorageQuotaBarBaseProps
  >;

const StorageQuotaBar = forwardRef<HTMLDivElement, StorageQuotaBarProps>(
  (
    {
      used,
      total,
      size = "md",
      warnAt = 0.9,
      errorAt = 1.0,
      label,
      valueLabel,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      className,
      ...rest
    },
    ref,
  ) => {
    const safeUsed =
      Number.isFinite(used) ? Math.max(used, 0) : 0;
    const safeTotal =
      Number.isFinite(total) && total > 0 ? total : 0;
    const ratio = safeTotal > 0 ? safeUsed / safeTotal : 0;
    const barValue = Math.min(Math.max(ratio, 0), 1);
    const percent = Math.round(ratio * 100);

    if (import.meta.env.DEV) {
      if (!Number.isFinite(total) || total <= 0) {
        console.warn(
          `StorageQuotaBar: total must be > 0, got ${String(total)}`,
        );
      }
      if (!Number.isFinite(used)) {
        console.warn(
          `StorageQuotaBar: used must be finite, got ${String(used)}`,
        );
      }
    }

    const state: "ok" | "warn" | "error" =
      ratio >= errorAt ? "error" : ratio >= warnAt ? "warn" : "ok";
    const color: ProgressBarColor =
      state === "error" ? "error" : state === "warn" ? "warning" : "primary";

    const defaultPrimary = `${formatFileSize(safeUsed)} of ${formatFileSize(
      safeTotal,
    )}`;
    const defaultSecondary = `${percent}%`;

    const labelId = useId();

    return (
      <div
        ref={ref}
        {...rest}
        role="group"
        aria-label={
          ariaLabelledBy ? ariaLabel : (ariaLabel ?? "Storage quota")
        }
        aria-labelledby={ariaLabelledBy}
        data-state={state}
        className={cx(styles.storage_quota_bar, className)}
      >
        <div className={styles.label_row}>
          <span id={labelId} className={styles.primary_label}>
            {label ?? defaultPrimary}
          </span>
          <span className={styles.value_label}>
            {valueLabel ?? defaultSecondary}
          </span>
        </div>
        <ProgressBar
          value={barValue}
          size={size}
          color={color}
          aria-labelledby={labelId}
        />
      </div>
    );
  },
);

StorageQuotaBar.displayName = "StorageQuotaBar";

export { StorageQuotaBar };
