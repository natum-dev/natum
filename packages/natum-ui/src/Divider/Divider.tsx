import { forwardRef, type ComponentPropsWithoutRef } from "react";
import styles from "./Divider.module.scss";
import cx from "classnames";

export type DividerProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "color"
> & {
  orientation?: "horizontal" | "vertical";
  variant?: "solid" | "dashed" | "dotted";
  color?: "primary" | "secondary" | "neutral" | "light";
  thickness?: number;
  spacing?: "none" | "small" | "medium" | "large";
  label?: string;
  labelPosition?: "left" | "center" | "right";
};

const Divider = forwardRef<HTMLDivElement, DividerProps>(
  (
    {
      orientation = "horizontal",
      variant = "solid",
      color = "neutral",
      thickness = 1,
      spacing = "medium",
      label,
      labelPosition = "center",
      className,
      ...rest
    },
    ref
  ) => {
    const showLabel = !!label && orientation === "horizontal";

    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation={orientation === "vertical" ? "vertical" : undefined}
        {...(showLabel ? { "aria-label": label } : {})}
        className={cx(
          className,
          styles.divider,
          styles[orientation],
          styles[variant],
          styles[color],
          styles[`spacing_${spacing}`],
          {
            [styles.with_label]: showLabel,
            [styles.label_left]: showLabel && labelPosition === "left",
            [styles.label_right]: showLabel && labelPosition === "right",
          }
        )}
        style={
          { "--divider-thickness": `${thickness}px` } as React.CSSProperties
        }
        {...rest}
      >
        {showLabel && <span className={styles.label}>{label}</span>}
      </div>
    );
  }
);

Divider.displayName = "Divider";

export { Divider };
