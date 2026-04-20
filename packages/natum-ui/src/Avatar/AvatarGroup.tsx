import {
  Children,
  forwardRef,
  isValidElement,
  useMemo,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import cx from "classnames";
import { Avatar, type AvatarShape, type AvatarSize } from "./Avatar";
import { AvatarGroupContext, type AvatarGroupContextValue } from "./context";
import styles from "./Avatar.module.scss";

export type AvatarGroupProps = {
  max?: number;
  total?: number;
  size?: AvatarSize;
  shape?: AvatarShape;
  spacing?: "tight" | "normal";
  className?: string;
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLSpanElement>, "role" | "children" | "className">;

const AvatarGroup = forwardRef<HTMLSpanElement, AvatarGroupProps>(
  function AvatarGroup(
    {
      max = 3,
      total,
      size = "md",
      shape = "circle",
      spacing = "normal",
      className,
      children,
      "aria-label": ariaLabel,
      ...rest
    },
    ref
  ) {
    const childArray = useMemo(
      () => Children.toArray(children).filter(isValidElement),
      [children]
    );
    const safeMax = Math.max(0, Math.floor(max));
    const visibleCount = Math.min(childArray.length, safeMax);
    const effectiveTotal = total ?? childArray.length;
    const hiddenCount = Math.max(0, effectiveTotal - visibleCount);
    const visible = childArray.slice(0, visibleCount);
    const clampedChip = hiddenCount > 99 ? "+99" : `+${hiddenCount}`;

    const ctxValue = useMemo<AvatarGroupContextValue>(
      () => ({ size, shape }),
      [size, shape]
    );

    return (
      <span
        ref={ref}
        role="group"
        aria-label={ariaLabel ?? `Group of ${effectiveTotal} users`}
        {...rest}
        className={cx(styles.avatar_group, className)}
        data-size={size}
        data-shape={shape}
        data-spacing={spacing}
      >
        <AvatarGroupContext.Provider value={ctxValue}>
          {visible.map((child, i) => (
            <span
              key={(child.key as string | null) ?? i}
              className={styles.slot}
              style={{ zIndex: visibleCount - i + 1 }}
            >
              {child}
            </span>
          ))}
          {hiddenCount > 0 && (
            <span className={styles.slot} style={{ zIndex: 0 }}>
              <Avatar
                fallback={clampedChip}
                color="neutral"
                aria-label={`${hiddenCount} more`}
              />
            </span>
          )}
        </AvatarGroupContext.Provider>
      </span>
    );
  }
);

AvatarGroup.displayName = "AvatarGroup";

export { AvatarGroup };
