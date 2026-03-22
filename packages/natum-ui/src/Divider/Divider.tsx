import { type ComponentPropsWithoutRef, forwardRef } from "react";
import styles from "./Divider.module.scss";
import cx from "classnames";

export type DividerProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  orientation?: "horizontal" | "vertical";
  variant?: "solid" | "dashed" | "dotted";
  spacing?: "none" | "sm" | "md" | "lg";
  className?: string;
};

const Divider = forwardRef<HTMLElement, DividerProps>(
  (
    {
      orientation = "horizontal",
      variant = "solid",
      spacing = "sm",
      className,
      ...rest
    },
    ref
  ) => {
    const classes = cx(
      styles.divider,
      styles[variant],
      styles[spacing],
      styles[orientation],
      className
    );

    if (orientation === "vertical") {
      return (
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          role="separator"
          aria-orientation="vertical"
          className={classes}
          {...rest}
        />
      );
    }

    return (
      <hr
        ref={ref as React.Ref<HTMLHRElement>}
        className={classes}
        {...rest}
      />
    );
  }
);

Divider.displayName = "Divider";

export { Divider };
