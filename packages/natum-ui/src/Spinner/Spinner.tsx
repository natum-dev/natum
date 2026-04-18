import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { IconLoader } from "@natum/icons";
import styles from "./Spinner.module.scss";
import cx from "classnames";

type SpinnerSize = "sm" | "md" | "lg";

type SpinnerColor =
  | "primary"
  | "secondary"
  | "error"
  | "success"
  | "warning"
  | "info"
  | "currentColor";

type SpinnerBaseProps = {
  size?: SpinnerSize;
  color?: SpinnerColor;
  label?: string;
  className?: string;
};

export type SpinnerProps = SpinnerBaseProps &
  Omit<ComponentPropsWithoutRef<"span">, "color" | "children" | keyof SpinnerBaseProps>;

const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  (
    { size = "md", color = "currentColor", label, className, ...rest },
    ref
  ) => {
    const hasLabel = typeof label === "string" && label.length > 0;

    return (
      <span
        ref={ref}
        role={hasLabel ? "status" : undefined}
        aria-live={hasLabel ? "polite" : undefined}
        className={cx(styles.spinner, styles[size], styles[color], className)}
        {...rest}
      >
        <IconLoader size={size} color="currentColor" className={styles.icon} />
        {hasLabel && <span className={styles.sr_only}>{label}</span>}
      </span>
    );
  }
);

Spinner.displayName = "Spinner";

export { Spinner };
export type { SpinnerSize, SpinnerColor };
