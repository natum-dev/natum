import { type ComponentPropsWithoutRef, forwardRef } from "react";
import styles from "./Skeleton.module.scss";
import cx from "classnames";

type SkeletonBaseProps = {
  variant?: "text" | "rectangular" | "circular";
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
};

export type SkeletonProps = SkeletonBaseProps &
  Omit<ComponentPropsWithoutRef<"div">, keyof SkeletonBaseProps>;

const toCss = (value: string | number | undefined): string | undefined => {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
};

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = "text",
      width = "100%",
      height,
      borderRadius,
      className,
      style,
      ...rest
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cx(styles.skeleton, styles[variant], className)}
        aria-hidden="true"
        style={{
          width: toCss(width),
          height: toCss(height),
          borderRadius: toCss(borderRadius),
          ...style,
        }}
        {...rest}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

export { Skeleton };
